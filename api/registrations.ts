import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireDashboardSession } from './_lib/dashboard-auth.js'

type Dosha = 'vata' | 'pitta' | 'kapha'
type LeadRecord = { first_name: string; email: string; dominant_dosha: Dosha; secondary_dosha: Dosha | null; is_balanced: boolean; marketing_consent: boolean; created_at: string }

const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }

function send(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value))
  response.end(JSON.stringify(body))
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function pageNumber(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 10_000) : 1
}

export function registrationResponse(leads: LeadRecord[], total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    records: leads.map((lead) => ({
      firstName: lead.first_name,
      email: lead.email,
      initials: initials(lead.first_name),
      date: formatDate(lead.created_at),
      time: formatTime(lead.created_at),
      dosha: lead.dominant_dosha,
      secondaryDosha: lead.secondary_dosha,
      isBalanced: lead.is_balanced,
      marketingConsent: lead.marketing_consent,
    })),
  }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    send(response, 405, { error: 'Método não permitido.' })
    return
  }
  if (!requireDashboardSession(request, response)) return

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    send(response, 503, { error: 'Serviço temporariamente indisponível.' })
    return
  }

  const requestUrl = new URL(request.url ?? '/', 'http://localhost')
  const page = pageNumber(requestUrl.searchParams.get('page'))
  const requestedDosha = requestUrl.searchParams.get('dosha')
  const dosha = requestedDosha === 'vata' || requestedDosha === 'pitta' || requestedDosha === 'kapha' ? requestedDosha : null
  const requestedConsent = requestUrl.searchParams.get('marketing')
  const marketing = requestedConsent === 'true' || requestedConsent === 'false' ? requestedConsent : null
  const pageSize = 20
  const params = new URLSearchParams({ select: 'first_name,email,dominant_dosha,secondary_dosha,is_balanced,marketing_consent,created_at', order: 'created_at.desc', limit: String(pageSize), offset: String((page - 1) * pageSize) })
  if (dosha) params.set('dominant_dosha', `eq.${dosha}`)
  if (marketing) params.set('marketing_consent', `eq.${marketing}`)

  try {
    const databaseResponse = await fetch(`${supabaseUrl}/rest/v1/dosha_quiz_leads?${params}`, {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, Prefer: 'count=exact' },
    })
    if (!databaseResponse.ok) {
      console.error('Supabase registrations query failed', databaseResponse.status)
      send(response, 502, { error: 'Não foi possível carregar os cadastros.' })
      return
    }
    const contentRange = databaseResponse.headers.get('content-range')
    const total = Number(contentRange?.split('/')[1] ?? 0) || 0
    const leads = await databaseResponse.json() as LeadRecord[]
    send(response, 200, registrationResponse(leads, total, page, pageSize))
  } catch {
    send(response, 502, { error: 'Não foi possível carregar os cadastros.' })
  }
}
