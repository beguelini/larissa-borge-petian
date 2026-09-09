import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireDashboardSession } from './_lib/dashboard-auth.js'

type Event = { event_type: string; product_name: string | null; gross_amount: number | null; currency: string | null; payment_type: string | null; event_created_at: string | null; transaction_code: string }
const products = ['Sabores do Meu Ritmo', 'Meu Ritmo', 'Acompanhamento VIP']
const send = (res: ServerResponse, status: number, body: Record<string, unknown>) => { res.statusCode = status; res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)) }
const name = (value: string | null) => products.find(product => product.toLocaleLowerCase('pt-BR') === value?.toLocaleLowerCase('pt-BR')) ?? value ?? 'Produto não identificado'
const money = (event: Event) => Number(event.gross_amount ?? 0)
const debit = (event: Event) => event.event_type === 'PURCHASE_REFUNDED' || event.event_type === 'PURCHASE_CHARGEBACK'

export function summarizeHotmart(events: Event[]) {
  const approved = events.filter(event => event.event_type === 'PURCHASE_APPROVED')
  const reversals = events.filter(debit)
  const grossRevenue = approved.reduce((sum, event) => sum + money(event), 0)
  const refunded = reversals.filter(event => event.event_type === 'PURCHASE_REFUNDED').reduce((sum, event) => sum + money(event), 0)
  const chargebacks = reversals.filter(event => event.event_type === 'PURCHASE_CHARGEBACK').reduce((sum, event) => sum + money(event), 0)
  const byProduct = products.map(product => {
    const related = events.filter(event => name(event.product_name) === product)
    const sales = related.filter(event => event.event_type === 'PURCHASE_APPROVED')
    const reversalsForProduct = related.filter(debit)
    const revenue = sales.reduce((sum, event) => sum + money(event), 0)
    return { product, orders: sales.length, grossRevenue: revenue, reversals: reversalsForProduct.reduce((sum, event) => sum + money(event), 0), netRevenue: revenue - reversalsForProduct.reduce((sum, event) => sum + money(event), 0), ticket: sales.length ? revenue / sales.length : 0 }
  })
  const payments = Object.entries(approved.reduce<Record<string, number>>((result, event) => { const key = event.payment_type ?? 'Não informado'; result[key] = (result[key] ?? 0) + money(event); return result }, {})).map(([type, value]) => ({ type, value }))
  const days = new Map<string, number>()
  events.forEach(event => { if (!event.event_created_at) return; const day = event.event_created_at.slice(0, 10); days.set(day, (days.get(day) ?? 0) + (debit(event) ? -money(event) : event.event_type === 'PURCHASE_APPROVED' ? money(event) : 0)) })
  return { source: 'Hotmart Webhook', updatedAt: new Date().toISOString(), currency: events.find(event => event.currency)?.currency ?? 'BRL', grossRevenue, refunded, chargebacks, netRevenue: grossRevenue - refunded - chargebacks, approvedOrders: approved.length, ticket: approved.length ? grossRevenue / approved.length : 0, refundRate: approved.length ? Math.round((reversals.length / approved.length) * 100) : 0, products: byProduct, payments, revenueByDay: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value })), recent: events.slice(0, 8).map(event => ({ product: name(event.product_name), type: event.event_type, value: money(event), date: event.event_created_at })) }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); return send(response, 405, { error: 'Método não permitido.' }) }
  if (!requireDashboardSession(request, response)) return
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ''); const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return send(response, 503, { error: 'Serviço temporariamente indisponível.' })
  try { const result = await fetch(`${url}/rest/v1/hotmart_webhook_events?select=event_type,product_name,gross_amount,currency,payment_type,event_created_at,transaction_code&order=event_created_at.desc&limit=10000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }); if (!result.ok) throw new Error('query'); send(response, 200, summarizeHotmart(await result.json() as Event[])) } catch { send(response, 502, { error: 'Não foi possível carregar o faturamento.' }) }
}
