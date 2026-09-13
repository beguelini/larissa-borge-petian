import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireDashboardSession } from './_lib/dashboard-auth.js'

type Event = { event_type: string; product_id: string | null; product_name: string | null; gross_amount: number | null; currency: string | null; payment_type: string | null; event_created_at: string | null; transaction_code: string }
const send = (res: ServerResponse, status: number, body: Record<string, unknown>) => { res.statusCode = status; res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)) }
const money = (event: Event) => Number(event.gross_amount ?? 0)
const debit = (event: Event) => event.event_type === 'PURCHASE_REFUNDED' || event.event_type === 'PURCHASE_CHARGEBACK'
const product = (event: Event) => event.product_name?.trim() || `Produto ${event.product_id?.trim() || 'não identificado'}`
const productId = (event: Event) => event.product_id?.trim() || null

function summarizeProduct(productEvents: Event[], productName: string, id: string | null) {
  const sales = productEvents.filter(event => event.event_type === 'PURCHASE_APPROVED')
  const reversals = productEvents.filter(debit)
  const grossRevenue = sales.reduce((sum, event) => sum + money(event), 0)
  const reversalValue = reversals.reduce((sum, event) => sum + money(event), 0)

  return {
    product: productName,
    productId: id,
    orders: sales.length,
    grossRevenue,
    reversals: reversalValue,
    netRevenue: grossRevenue - reversalValue,
    ticket: sales.length ? grossRevenue / sales.length : 0,
  }
}

export function summarizeHotmart(events: Event[]) {
  const approved = events.filter(event => event.event_type === 'PURCHASE_APPROVED')
  const reversals = events.filter(debit)
  const grossRevenue = approved.reduce((sum, event) => sum + money(event), 0)
  const refunded = reversals.filter(event => event.event_type === 'PURCHASE_REFUNDED').reduce((sum, event) => sum + money(event), 0)
  const chargebacks = reversals.filter(event => event.event_type === 'PURCHASE_CHARGEBACK').reduce((sum, event) => sum + money(event), 0)
  const eventsByProduct = new Map<string, { id: string | null; name: string; events: Event[] }>()
  events.forEach(event => {
    const id = productId(event)
    const name = product(event)
    const key = id ? `id:${id}` : `name:${name}`
    const grouped = eventsByProduct.get(key)
    if (grouped) grouped.events.push(event)
    else eventsByProduct.set(key, { id, name, events: [event] })
  })
  const byProduct = [...eventsByProduct.values()]
    .map(({ events: productEvents, name, id }) => summarizeProduct(productEvents, name, id))
    .sort((a, b) => b.netRevenue - a.netRevenue || b.orders - a.orders || a.product.localeCompare(b.product, 'pt-BR'))
  const payments = Object.entries(approved.reduce<Record<string, number>>((result, event) => { const key = event.payment_type ?? 'Não informado'; result[key] = (result[key] ?? 0) + money(event); return result }, {})).map(([type, value]) => ({ type, value }))
  const days = new Map<string, number>()
  events.forEach(event => { if (!event.event_created_at) return; const day = event.event_created_at.slice(0, 10); days.set(day, (days.get(day) ?? 0) + (debit(event) ? -money(event) : event.event_type === 'PURCHASE_APPROVED' ? money(event) : 0)) })
  return { source: 'Hotmart Webhook', updatedAt: new Date().toISOString(), currency: events.find(event => event.currency)?.currency ?? 'BRL', grossRevenue, refunded, chargebacks, netRevenue: grossRevenue - refunded - chargebacks, approvedOrders: approved.length, ticket: approved.length ? grossRevenue / approved.length : 0, refundRate: approved.length ? Math.round((reversals.length / approved.length) * 100) : 0, products: byProduct, payments, revenueByDay: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value })), recent: events.slice(0, 8).map(event => ({ product: product(event), type: event.event_type, value: money(event), date: event.event_created_at })) }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); return send(response, 405, { error: 'Método não permitido.' }) }
  if (!requireDashboardSession(request, response)) return
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ''); const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return send(response, 503, { error: 'Serviço temporariamente indisponível.' })
  try { const result = await fetch(`${url}/rest/v1/hotmart_webhook_events?select=event_type,product_id,product_name,gross_amount,currency,payment_type,event_created_at,transaction_code&order=event_created_at.desc&limit=10000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }); if (!result.ok) throw new Error('query'); send(response, 200, summarizeHotmart(await result.json() as Event[])) } catch { send(response, 502, { error: 'Não foi possível carregar o faturamento.' }) }
}
