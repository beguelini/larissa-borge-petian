import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireDashboardSession } from './_lib/dashboard-auth.js'

type Commission = { source?: string; value?: number; currency?: string | null }
type Event = { event_type: string; transaction_code: string; product_id: string | null; product_name: string | null; product_sku: string | null; product_ucode: string | null; buyer_name: string | null; buyer_email: string | null; gross_amount: number | null; full_amount: number | null; producer_commission: number | null; commissions: Commission[] | null; currency: string | null; payment_type: string | null; payment_installments: number | null; purchase_status: string | null; checkout_country: string | null; offer_code: string | null; coupon_code: string | null; event_created_at: string | null }
type Transaction = Event & { status: string; gross: number; estimatedFee: number; commissionsDeducted: number; liquid: number; isEstimated: boolean; d2Available: number; d2Reserve: number }
const send = (res: ServerResponse, status: number, body: Record<string, unknown>) => { res.statusCode = status; res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)) }
const money = (event: Event) => Number(event.gross_amount ?? 0)
const isReversal = (event: Event) => event.event_type === 'PURCHASE_REFUNDED' || event.event_type === 'PURCHASE_CHARGEBACK'
const isCard = (payment: string | null) => payment === 'CREDIT_CARD' || payment === 'CREDIT_CARD_RECURRING'
const displayProduct = (event: Event) => event.product_name?.trim() || `Produto ${event.product_id?.trim() || 'não identificado'}`
const dateOf = (event: Event) => event.event_created_at ? new Date(event.event_created_at) : new Date()
const cutoff = new Date('2026-09-21T00:00:00-03:00')
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export function estimateHotmartFee(gross: number, eventDate: Date) {
  if (gross <= 0) return 0
  if (gross <= 10) return roundMoney(gross * .2)
  return roundMoney(gross * .099 + (eventDate >= cutoff ? 2.49 : 1))
}

function asTransaction(events: Event[]): Transaction | null {
  const approved = events.find((event) => event.event_type === 'PURCHASE_APPROVED')
  if (!approved) return null
  const lastEvent = events.reduce((latest, event) => !latest.event_created_at || (event.event_created_at && event.event_created_at > latest.event_created_at) ? event : latest, events[0])
  const gross = money(approved); const estimatedFee = estimateHotmartFee(gross, dateOf(approved)); const reversed = events.some(isReversal)
  const producerCommission = Number(approved.producer_commission); const hasReportedLiquid = Number.isFinite(producerCommission) && producerCommission > 0
  const liquid = reversed ? 0 : hasReportedLiquid ? roundMoney(producerCommission) : Math.max(0, roundMoney(gross - estimatedFee)); const d2Eligible = !reversed && isCard(approved.payment_type)
  const commissionsDeducted = hasReportedLiquid ? Math.max(0, roundMoney(gross - estimatedFee - liquid)) : 0
  return { ...approved, status: reversed ? lastEvent.event_type : 'PURCHASE_APPROVED', gross, estimatedFee, commissionsDeducted, liquid, isEstimated: !hasReportedLiquid, d2Available: d2Eligible ? roundMoney(liquid * .9) : 0, d2Reserve: d2Eligible ? roundMoney(liquid * .1) : 0 }
}

export function summarizeHotmart(events: Event[]) {
  const grouped = new Map<string, Event[]>(); for (const event of events) grouped.set(event.transaction_code, [...(grouped.get(event.transaction_code) ?? []), event])
  const transactions = [...grouped.values()].map(asTransaction).filter((value): value is Transaction => Boolean(value)).sort((a, b) => (b.event_created_at ?? '').localeCompare(a.event_created_at ?? ''))
  const approvedTransactions = transactions.filter((transaction) => transaction.status === 'PURCHASE_APPROVED')
  const grossRevenue = approvedTransactions.reduce((sum, transaction) => sum + transaction.gross, 0)
  const refunded = transactions.filter((transaction) => transaction.status === 'PURCHASE_REFUNDED').reduce((sum, transaction) => sum + transaction.gross, 0)
  const chargebacks = transactions.filter((transaction) => transaction.status === 'PURCHASE_CHARGEBACK').reduce((sum, transaction) => sum + transaction.gross, 0)
  const platformFees = approvedTransactions.reduce((sum, transaction) => sum + transaction.estimatedFee, 0)
  const partnerCommissions = approvedTransactions.reduce((sum, transaction) => sum + transaction.commissionsDeducted, 0)
  const netRevenue = approvedTransactions.reduce((sum, transaction) => sum + transaction.liquid, 0)
  const d2Available = approvedTransactions.reduce((sum, transaction) => sum + transaction.d2Available, 0); const d2Reserve = approvedTransactions.reduce((sum, transaction) => sum + transaction.d2Reserve, 0)
  const products = new Map<string, { product: string; productId: string | null; orders: number; grossRevenue: number; reversals: number; fees: number; netRevenue: number }>(); const payments = new Map<string, number>(); const revenueByDay = new Map<string, { gross: number; net: number }>()
  transactions.forEach((transaction) => { const product = displayProduct(transaction); const key = transaction.product_id || product; const item = products.get(key) ?? { product, productId: transaction.product_id, orders: 0, grossRevenue: 0, reversals: 0, fees: 0, netRevenue: 0 }; item.orders += 1; item.grossRevenue += transaction.gross; item.reversals += transaction.status === 'PURCHASE_APPROVED' ? 0 : transaction.gross; item.fees += transaction.status === 'PURCHASE_APPROVED' ? transaction.estimatedFee : 0; item.netRevenue += transaction.liquid; products.set(key, item); if (transaction.status !== 'PURCHASE_APPROVED') return; const payment = transaction.payment_type ?? 'Não informado'; payments.set(payment, (payments.get(payment) ?? 0) + transaction.gross); const day = transaction.event_created_at?.slice(0, 10); if (day) { const daily = revenueByDay.get(day) ?? { gross: 0, net: 0 }; daily.gross += transaction.gross; daily.net += transaction.liquid; revenueByDay.set(day, daily) } })
  return { source: 'Webhook', updatedAt: new Date().toISOString(), currency: events.find((event) => event.currency)?.currency ?? 'BRL', grossRevenue, refunded, chargebacks, netRevenue, platformFees, partnerCommissions, d2Available, d2Reserve, approvedOrders: approvedTransactions.length, ticket: approvedTransactions.length ? grossRevenue / approvedTransactions.length : 0, refundRate: grossRevenue + refunded + chargebacks ? Math.round(((refunded + chargebacks) / (grossRevenue + refunded + chargebacks)) * 1000) / 10 : 0, feeCoverage: approvedTransactions.length ? Math.round((approvedTransactions.filter((transaction) => !transaction.isEstimated).length / approvedTransactions.length) * 100) : 0, policy: { payout: 'D+2 com repasse', upfrontRate: 0, buyerInstallmentRate: 4.49, availablePercent: 90, reservePercent: 10, reserveDays: 30 }, products: [...products.values()].map((product) => ({ ...product, ticket: product.orders ? product.grossRevenue / product.orders : 0 })).sort((a, b) => b.netRevenue - a.netRevenue), payments: [...payments.entries()].map(([type, value]) => ({ type, value })).sort((a, b) => b.value - a.value), revenueByDay: [...revenueByDay.entries()].map(([date, value]) => ({ date, ...value })).sort((a, b) => a.date.localeCompare(b.date)), transactions: transactions.slice(0, 100).map((transaction) => ({ transaction: transaction.transaction_code, buyerName: transaction.buyer_name, buyerEmail: transaction.buyer_email, product: displayProduct(transaction), productId: transaction.product_id, productSku: transaction.product_sku, productUcode: transaction.product_ucode, type: transaction.status, purchaseStatus: transaction.purchase_status, gross: transaction.gross, fullAmount: Number(transaction.full_amount) || null, fees: transaction.estimatedFee, commissionsDeducted: transaction.commissionsDeducted, liquid: transaction.liquid, isEstimated: transaction.isEstimated, paymentType: transaction.payment_type, installments: transaction.payment_installments, country: transaction.checkout_country, offerCode: transaction.offer_code, couponCode: transaction.coupon_code, producerCommission: Number(transaction.producer_commission) || null, commissions: transaction.commissions ?? [], d2Available: transaction.d2Available, d2Reserve: transaction.d2Reserve, date: transaction.event_created_at })) }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); return send(response, 405, { error: 'Método não permitido.' }) }
  if (!requireDashboardSession(request, response)) return
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ''); const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return send(response, 503, { error: 'Serviço temporariamente indisponível.' })
  try { const select = 'event_type,transaction_code,product_id,product_name,product_sku,product_ucode,buyer_name,buyer_email,gross_amount,full_amount,producer_commission,commissions,currency,payment_type,payment_installments,purchase_status,checkout_country,offer_code,coupon_code,event_created_at'; const result = await fetch(`${url}/rest/v1/hotmart_webhook_events?select=${select}&order=event_created_at.desc&limit=10000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }); if (!result.ok) throw new Error('query'); send(response, 200, summarizeHotmart(await result.json() as Event[])) } catch { send(response, 502, { error: 'Não foi possível carregar o faturamento.' }) }
}
