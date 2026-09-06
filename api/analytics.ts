import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireDashboardSession } from './_lib/dashboard-auth'

type ApiRequest = IncomingMessage

type Dosha = 'vata' | 'pitta' | 'kapha'

type LeadSummary = {
  first_name: string
  dominant_dosha: Dosha
  is_balanced: boolean
  marketing_consent: boolean
  created_at: string
}

const headers = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

function localDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function localTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function send(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value))
  response.end(JSON.stringify(body))
}

export function summarizeLeads(leads: LeadSummary[], now = new Date()) {
  const doshas: Record<Dosha, number> = { vata: 0, pitta: 0, kapha: 0 }
  const registrations = new Map<string, number>()
  const today = localDate(now.toISOString())
  let todayCount = 0
  let marketingConsentCount = 0
  let balancedCount = 0

  leads.forEach((lead) => {
    doshas[lead.dominant_dosha] += 1
    marketingConsentCount += Number(lead.marketing_consent)
    balancedCount += Number(lead.is_balanced)
    const day = localDate(lead.created_at)
    registrations.set(day, (registrations.get(day) ?? 0) + 1)
    if (day === today) todayCount += 1
  })

  const total = leads.length
  const dominantDosha = total
    ? (['vata', 'pitta', 'kapha'] as Dosha[])
      .sort((firstDosha, secondDosha) => doshas[secondDosha] - doshas[firstDosha])[0]
    : null

  const recentLeads = leads.slice(0, 5).map((lead) => {
    const day = localDate(lead.created_at)
    return {
      initials: initials(lead.first_name),
      timeLabel: day === today
        ? `Hoje, ${localTime(lead.created_at)}`
        : `${day.split('-').reverse().slice(0, 2).join('/')}, ${localTime(lead.created_at)}`,
      dosha: lead.dominant_dosha,
    }
  })

  const registrationsByDay = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(`${today}T12:00:00Z`)
    date.setUTCDate(date.getUTCDate() - (29 - index))
    const key = date.toISOString().slice(0, 10)
    return { date: key, count: registrations.get(key) ?? 0 }
  })

  return {
    total,
    today: todayCount,
    marketingConsentRate: total ? Math.round((marketingConsentCount / total) * 100) : 0,
    balancedCount,
    dominantDosha,
    doshas,
    registrationsByDay,
    recentLeads,
  }
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    send(response, 405, { error: 'Método não permitido.' })
    return
  }
  if (!requireDashboardSession(request, response)) return

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase server environment is not configured')
    send(response, 503, { error: 'Serviço temporariamente indisponível.' })
    return
  }

  try {
    const databaseResponse = await fetch(
      `${supabaseUrl}/rest/v1/dosha_quiz_leads?select=first_name,dominant_dosha,is_balanced,marketing_consent,created_at&order=created_at.desc&limit=10000`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    )

    if (!databaseResponse.ok) {
      console.error('Supabase analytics query failed', databaseResponse.status)
      send(response, 502, { error: 'Não foi possível carregar os indicadores.' })
      return
    }

    const leads = await databaseResponse.json() as LeadSummary[]
    send(response, 200, summarizeLeads(leads))
  } catch {
    send(response, 502, { error: 'Não foi possível carregar os indicadores.' })
  }
}
