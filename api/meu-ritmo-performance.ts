import type { IncomingMessage, ServerResponse } from 'node:http'
import { requestedDateRange } from './analytics.js'
import { requireDashboardSession } from './_lib/dashboard-auth.js'

type Lead = { email: string; created_at: string; source: Record<string, unknown> | null }
type HotmartEvent = {
  event_type: string
  transaction_code: string
  product_id: string | null
  product_name: string | null
  buyer_email: string | null
  gross_amount: number | string | null
  producer_commission: number | string | null
  event_created_at: string | null
}
type DateRange = { from: string; to: string }

function localDay(value: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}

const headers = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

function send(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value))
  response.end(JSON.stringify(body))
}

function textValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback
}

function productKey(event: HotmartEvent) {
  return event.product_id?.trim() || `name:${textValue(event.product_name, 'Produto não identificado').toLocaleLowerCase('pt-BR')}`
}

function isReversal(event: HotmartEvent) {
  return event.event_type === 'PURCHASE_REFUNDED' || event.event_type === 'PURCHASE_CHARGEBACK'
}

export function summarizeMeuRitmoPerformance(leads: Lead[], events: HotmartEvent[], selectedProductId: string, range: DateRange) {
  const products = new Map<string, { id: string; name: string }>()
  const transactions = new Map<string, HotmartEvent[]>()

  events.forEach((event) => {
    if (event.event_type === 'PURCHASE_APPROVED') {
      const id = productKey(event)
      products.set(id, { id, name: textValue(event.product_name, `Produto ${event.product_id ?? 'não identificado'}`) })
    }
    const key = event.transaction_code?.trim()
    if (key) transactions.set(key, [...(transactions.get(key) ?? []), event])
  })

  const leadsByEmail = new Map<string, Lead[]>()
  const registrationsByDay = new Map<string, number>()
  const attribution = new Map<string, { source: string; medium: string; campaign: string; leads: number }>()
  leads.forEach((lead) => {
    const email = lead.email.trim().toLocaleLowerCase('pt-BR')
    if (!email) return
    leadsByEmail.set(email, [...(leadsByEmail.get(email) ?? []), lead])
    const day = localDay(lead.created_at)
    registrationsByDay.set(day, (registrationsByDay.get(day) ?? 0) + 1)
    const source = textValue(lead.source?.utmSource, 'Direto ou não informado')
    const medium = textValue(lead.source?.utmMedium, 'Sem mídia')
    const campaign = textValue(lead.source?.utmCampaign, 'Sem campanha')
    const key = `${source}\u0000${medium}\u0000${campaign}`
    const row = attribution.get(key) ?? { source, medium, campaign, leads: 0 }
    row.leads += 1
    attribution.set(key, row)
  })

  const cohortEmails = new Set(leadsByEmail.keys())
  const convertedEmails = new Set<string>()
  let orders = 0
  let grossRevenue = 0
  let netRevenue = 0
  let missingNetValue = false
  let refunds = 0
  let chargebacks = 0
  let daysToSaleTotal = 0
  let salesWithLeadDate = 0

  if (selectedProductId && products.has(selectedProductId)) {
    transactions.forEach((group) => {
      const approved = group.find((event) => event.event_type === 'PURCHASE_APPROVED')
      if (!approved || productKey(approved) !== selectedProductId || !approved.buyer_email || !approved.event_created_at) return
      const email = approved.buyer_email.trim().toLocaleLowerCase('pt-BR')
      if (!cohortEmails.has(email)) return
      const matchedLeads = leadsByEmail.get(email) ?? []
      const acquisition = matchedLeads
        .filter((lead) => new Date(lead.created_at).getTime() <= new Date(approved.event_created_at as string).getTime())
        .sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
      if (!acquisition) return

      const reversed = group.some(isReversal)
      const amount = Number(approved.gross_amount) || 0
      const refundEvents = group.filter((event) => event.event_type === 'PURCHASE_REFUNDED')
      const chargebackEvents = group.filter((event) => event.event_type === 'PURCHASE_CHARGEBACK')
      if (refundEvents.length) refunds += amount
      if (chargebackEvents.length) chargebacks += amount
      if (reversed) return

      orders += 1
      grossRevenue += amount
      const reportedNet = Number(approved.producer_commission)
      if (reportedNet > 0) netRevenue += reportedNet
      else missingNetValue = true
      convertedEmails.add(email)
      daysToSaleTotal += Math.max(0, new Date(approved.event_created_at).getTime() - new Date(acquisition.created_at).getTime()) / 86_400_000
      salesWithLeadDate += 1
    })
  }

  const uniqueLeads = cohortEmails.size
  return {
    range,
    leads: leads.length,
    uniqueLeads,
    convertedLeads: convertedEmails.size,
    conversionRate: uniqueLeads ? Math.round((convertedEmails.size / uniqueLeads) * 1000) / 10 : 0,
    orders,
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    netRevenue: orders && !missingNetValue ? Math.round(netRevenue * 100) / 100 : null,
    refunds: Math.round(refunds * 100) / 100,
    chargebacks: Math.round(chargebacks * 100) / 100,
    averageDaysToSale: salesWithLeadDate ? Math.round((daysToSaleTotal / salesWithLeadDate) * 10) / 10 : null,
    registrationsByDay: Array.from({ length: Math.round((new Date(`${range.to}T12:00:00Z`).getTime() - new Date(`${range.from}T12:00:00Z`).getTime()) / 86_400_000) + 1 }, (_, index) => {
      const date = new Date(`${range.from}T12:00:00Z`)
      date.setUTCDate(date.getUTCDate() + index)
      const day = date.toISOString().slice(0, 10)
      return { date: day, count: registrationsByDay.get(day) ?? 0 }
    }),
    attribution: [...attribution.values()].sort((a, b) => b.leads - a.leads).slice(0, 20),
    products: [...products.entries()].map(([id, product]) => ({ id, name: product.name })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    productSelected: Boolean(selectedProductId && products.has(selectedProductId)),
  }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    send(response, 405, { error: 'Método não permitido.' })
    return
  }
  if (!requireDashboardSession(request, response)) return

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return send(response, 503, { error: 'Serviço temporariamente indisponível.' })

  const requestUrl = new URL(request.url ?? '/', 'http://localhost')
  const range = requestedDateRange(requestUrl.searchParams.get('from'), requestUrl.searchParams.get('to'))
  if (!range) return send(response, 422, { error: 'Informe um intervalo de datas válido.' })
  const selectedProductId = requestUrl.searchParams.get('productId') ?? ''
  const nextDate = new Date(`${range.to}T12:00:00Z`)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  const leadParams = new URLSearchParams({
    select: 'email,created_at,source',
    order: 'created_at.asc',
    limit: '10000',
    and: `(created_at.gte.${range.from}T00:00:00-03:00,created_at.lt.${nextDate.toISOString().slice(0, 10)}T00:00:00-03:00)`,
  })
  const eventParams = new URLSearchParams({
    select: 'event_type,transaction_code,product_id,product_name,buyer_email,gross_amount,producer_commission,event_created_at',
    order: 'event_created_at.desc',
    limit: '10000',
  })

  try {
    const [leadResponse, eventResponse] = await Promise.all([
      fetch(`${url}/rest/v1/meu_ritmo_launch_leads?${leadParams}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }),
      fetch(`${url}/rest/v1/hotmart_webhook_events?${eventParams}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }),
    ])
    if (!leadResponse.ok || !eventResponse.ok) {
      console.error('Meu Ritmo performance query failed', leadResponse.status, eventResponse.status)
      return send(response, 502, { error: 'Não foi possível carregar os indicadores.' })
    }
    const [leads, events] = await Promise.all([leadResponse.json(), eventResponse.json()]) as [Lead[], HotmartEvent[]]
    send(response, 200, summarizeMeuRitmoPerformance(leads, events, selectedProductId, range))
  } catch {
    send(response, 502, { error: 'Não foi possível carregar os indicadores.' })
  }
}
