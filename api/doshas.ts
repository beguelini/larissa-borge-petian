import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireDashboardSession } from './_lib/dashboard-auth.js'

type Dosha = 'vata' | 'pitta' | 'kapha'
type Scores = Record<Dosha, number>
type LeadAnalysis = { dominant_dosha: Dosha; secondary_dosha: Dosha | null; is_balanced: boolean; marketing_consent: boolean; scores: Partial<Scores>; created_at: string }

const doshas: Dosha[] = ['vata', 'pitta', 'kapha']
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }

function send(response: ServerResponse, status: number, body: Record<string, unknown>) { response.statusCode = status; Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value)); response.end(JSON.stringify(body)) }
function localDate(value: string) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)) }
function emptyScores(): Scores { return { vata: 0, pitta: 0, kapha: 0 } }
function dayRange(today: string, length: number, offset = 0) { return Array.from({ length }, (_, index) => { const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - (length - 1 - index + offset)); return date.toISOString().slice(0, 10) }) }

export function summarizeDoshaLeads(leads: LeadAnalysis[], now = new Date()) {
  const today = localDate(now.toISOString())
  const primary = Object.fromEntries(doshas.map((dosha) => [dosha, { count: 0, consented: 0 }])) as Record<Dosha, { count: number; consented: number }>
  const scoreTotals = emptyScores(); const scoreCounts = emptyScores(); const combinations = new Map<string, { primary: Dosha; secondary: Dosha; count: number }>(); const daily = new Map<string, { total: number; doshas: Scores }>(); let consented = 0; let balanced = 0
  leads.forEach((lead) => {
    primary[lead.dominant_dosha].count += 1; primary[lead.dominant_dosha].consented += Number(lead.marketing_consent); consented += Number(lead.marketing_consent); balanced += Number(lead.is_balanced)
    doshas.forEach((dosha) => { const score = lead.scores[dosha]; if (typeof score === 'number' && Number.isFinite(score)) { scoreTotals[dosha] += score; scoreCounts[dosha] += 1 } })
    if (lead.secondary_dosha) { const key = `${lead.dominant_dosha}-${lead.secondary_dosha}`; const current = combinations.get(key) ?? { primary: lead.dominant_dosha, secondary: lead.secondary_dosha, count: 0 }; current.count += 1; combinations.set(key, current) }
    const day = localDate(lead.created_at); const currentDay = daily.get(day) ?? { total: 0, doshas: emptyScores() }; currentDay.total += 1; currentDay.doshas[lead.dominant_dosha] += 1; daily.set(day, currentDay)
  })
  const total = leads.length; const dates = dayRange(today, 30); const registrationsByDay = dates.map((date) => ({ date, ...(daily.get(date) ?? { total: 0, doshas: emptyScores() }) })); const recentSeven = registrationsByDay.slice(-7).reduce((sum, day) => sum + day.total, 0); const priorSeven = registrationsByDay.slice(-14, -7).reduce((sum, day) => sum + day.total, 0); const dominantDosha = total ? doshas.slice().sort((first, second) => primary[second].count - primary[first].count)[0] : null
  return { total, dominantDosha, balancedCount: balanced, balancedRate: total ? Math.round((balanced / total) * 100) : 0, marketingConsent: { count: consented, rate: total ? Math.round((consented / total) * 100) : 0 }, lastSeven: recentSeven, growthRate: priorSeven ? Math.round(((recentSeven - priorSeven) / priorSeven) * 100) : null,
    primary: doshas.map((dosha) => ({ dosha, count: primary[dosha].count, percentage: total ? Math.round((primary[dosha].count / total) * 100) : 0, consentRate: primary[dosha].count ? Math.round((primary[dosha].consented / primary[dosha].count) * 100) : 0, averageScore: scoreCounts[dosha] ? Math.round((scoreTotals[dosha] / scoreCounts[dosha]) * 10) / 10 : 0 })),
    scoreAverages: Object.fromEntries(doshas.map((dosha) => [dosha, scoreCounts[dosha] ? Math.round((scoreTotals[dosha] / scoreCounts[dosha]) * 10) / 10 : 0])) as Scores,
    combinations: Array.from(combinations.values()).sort((first, second) => second.count - first.count).slice(0, 5), registrationsByDay }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); send(response, 405, { error: 'Método não permitido.' }); return }
  if (!requireDashboardSession(request, response)) return
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, ''); const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) { send(response, 503, { error: 'Serviço temporariamente indisponível.' }); return }
  try {
    const databaseResponse = await fetch(`${supabaseUrl}/rest/v1/dosha_quiz_leads?select=dominant_dosha,secondary_dosha,is_balanced,marketing_consent,scores,created_at&order=created_at.desc&limit=10000`, { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } })
    if (!databaseResponse.ok) { console.error('Supabase dosha analysis query failed', databaseResponse.status); send(response, 502, { error: 'Não foi possível carregar a análise de doshas.' }); return }
    send(response, 200, summarizeDoshaLeads(await databaseResponse.json() as LeadAnalysis[]))
  } catch { send(response, 502, { error: 'Não foi possível carregar a análise de doshas.' }) }
}
