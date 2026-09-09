import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createActivationToken } from './_lib/member-activation.js'
import { email, hashMemberPassword } from './_lib/member-auth.js'
import { sendMemberWelcomeEmail } from './lib/member-welcome-email.js'

type PurchaseWebhook = { id?: unknown; event?: unknown; version?: unknown; data?: { buyer?: { name?: unknown; email?: unknown }; product?: { id?: unknown }; purchase?: { transaction?: unknown; status?: unknown } } }
const send = (res: ServerResponse, status: number, body: Record<string, unknown>) => { res.statusCode = status; res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)) }
const db = () => { const url = process.env.SUPABASE_URL?.replace(/\/$/, ''); const key = process.env.SUPABASE_SERVICE_ROLE_KEY; return url && key ? { url, key } : null }
const matches = (received: string, expected: string) => { const a = Buffer.from(received); const b = Buffer.from(expected); return a.length === b.length && timingSafeEqual(a, b) }
const asText = (value: unknown, max = 254) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null
async function readBody(req: IncomingMessage) { let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 50_000) throw new Error('large') }; return JSON.parse(body) as PurchaseWebhook }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Método não permitido.' }) }
  const hottok = process.env.HOTMART_HOTTOK
  const productId = process.env.HOTMART_PRODUCT_ID
  const receivedHottok = req.headers['x-hotmart-hottok']
  if (!hottok || !productId) return send(res, 503, { error: 'Integração temporariamente indisponível.' })
  if (typeof receivedHottok !== 'string' || !matches(receivedHottok, hottok)) return send(res, 401, { error: 'Webhook não autorizado.' })
  const connection = db()
  if (!connection) return send(res, 503, { error: 'Serviço temporariamente indisponível.' })
  const headers = { apikey: connection.key, Authorization: `Bearer ${connection.key}`, 'Content-Type': 'application/json' }

  let processedEventId: string | null = null
  try {
    const payload = await readBody(req)
    if (payload.event !== 'PURCHASE_APPROVED' || payload.version !== '2.0.0' || payload.data?.purchase?.status !== 'APPROVED') return send(res, 200, { ok: true, ignored: true })
    const eventId = asText(payload.id)
    const transaction = asText(payload.data.purchase.transaction)
    const buyerEmail = email(asText(payload.data.buyer?.email) ?? '')
    const buyerName = asText(payload.data.buyer?.name, 100)
    const receivedProductId = payload.data.product?.id
    if (!eventId || !transaction || !buyerEmail || !buyerName || String(receivedProductId) !== productId) return send(res, 422, { error: 'Dados da compra inválidos.' })

    const eventResponse = await fetch(`${connection.url}/rest/v1/hotmart_webhook_events`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ hotmart_event_id: eventId, transaction_code: transaction, event_type: payload.event, buyer_email: buyerEmail, product_id: productId }) })
    if (eventResponse.status === 409) return send(res, 200, { ok: true, duplicate: true })
    if (!eventResponse.ok) throw new Error('event')
    processedEventId = eventId

    const activation = createActivationToken()
    const now = new Date()
    const accountResponse = await fetch(`${connection.url}/rest/v1/member_accounts?email=eq.${encodeURIComponent(buyerEmail)}&select=id&limit=1`, { headers })
    if (!accountResponse.ok) throw new Error('account-read')
    const existing = (await accountResponse.json() as { id: string }[])[0]
    const account = { full_name: buyerName, email: buyerEmail, status: 'approved', activation_token_hash: activation.hash, activation_expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), reviewed_at: now.toISOString(), updated_at: now.toISOString() }
    const saveResponse = existing
      ? await fetch(`${connection.url}/rest/v1/member_accounts?id=eq.${encodeURIComponent(existing.id)}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(account) })
      : await fetch(`${connection.url}/rest/v1/member_accounts`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ ...account, password_hash: hashMemberPassword(randomBytes(32).toString('base64url')) }) })
    if (!saveResponse.ok) throw new Error('account-save')

    const welcome = await sendMemberWelcomeEmail({ firstName: buyerName.split(/\s+/)[0], email: buyerEmail, activationToken: activation.token })
    if (!welcome.sent) throw new Error('welcome-email')
    return send(res, 200, { ok: true })
  } catch (error) {
    if (processedEventId) await fetch(`${connection.url}/rest/v1/hotmart_webhook_events?hotmart_event_id=eq.${encodeURIComponent(processedEventId)}`, { method: 'DELETE', headers }).catch(() => undefined)
    console.error('Hotmart webhook processing failed', error instanceof Error ? error.message : 'unknown')
    return send(res, 502, { error: 'Não foi possível processar a compra.' })
  }
}
