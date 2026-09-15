import type { IncomingMessage, ServerResponse } from 'node:http'
import { hasCompleteAnswers, scoreQuiz } from '../src/lib/results.js'
import type { QuizAnswers } from '../src/types.js'
import { requireDashboardSession } from './_lib/dashboard-auth.js'

type ApiRequest = IncomingMessage & { body?: unknown }
type PatientStatus = 'new' | 'contacted' | 'scheduled' | 'in_follow_up' | 'completed' | 'archived'
const statuses: PatientStatus[] = ['new', 'contacted', 'scheduled', 'in_follow_up', 'completed', 'archived']
const concerns = ['ansiedade', 'alimentacao', 'corpo', 'rotina', 'outro']
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }

function send(response: ServerResponse, status: number, body: Record<string, unknown>) { response.statusCode = status; Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value)); response.end(JSON.stringify(body)) }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value) }
function validName(value: unknown): value is string { return typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 80 && /^[\p{L}\s'-]+$/u.test(value.trim()) }
function validEmail(value: unknown): value is string { return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) }
function normalizeWhatsApp(value: unknown) { if (typeof value !== 'string') return null; const local = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, ''); return /^[1-9]\d(?:9?\d{8})$/.test(local) ? `55${local}` : null }
function validId(value: string | null) { return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) }
async function readBody(request: ApiRequest) { if (request.body !== undefined) return request.body; const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown }
function source(value: unknown) { if (!isRecord(value)) return {}; return Object.fromEntries(Object.entries(value).filter(([key, item]) => ['path', 'referrer', 'utmSource', 'utmMedium', 'utmCampaign'].includes(key) && (typeof item === 'string' || item === null)).map(([key, item]) => [key, typeof item === 'string' ? item.slice(0, 500) : null])) }
function config() { const url = process.env.SUPABASE_URL?.replace(/\/$/, ''); const key = process.env.SUPABASE_SERVICE_ROLE_KEY; return url && key ? { url, key } : null }
function supabaseHeaders(key: string, extra: Record<string, string> = {}) { return { apikey: key, Authorization: `Bearer ${key}`, ...extra } }

export async function handleConsultationPayload(body: unknown) {
  if (!isRecord(body)) return { status: 400, body: { error: 'Dados inválidos.' } }
  const whatsapp = normalizeWhatsApp(body.whatsapp)
  if (typeof body.website === 'string' && body.website.trim()) return { status: 201, body: { ok: true } }
  if (!validName(body.firstName) || !validEmail(body.email) || !whatsapp || !concerns.includes(String(body.mainConcern))) return { status: 422, body: { error: 'Preencha nome, e-mail, WhatsApp e o tema principal.' } }
  if (body.privacyConsent !== true || !isRecord(body.answers) || !hasCompleteAnswers(body.answers as QuizAnswers)) return { status: 422, body: { error: 'A avaliação e o consentimento são obrigatórios.' } }
  const db = config(); if (!db) return { status: 503, body: { error: 'Serviço temporariamente indisponível.' } }
  const result = scoreQuiz(body.answers as QuizAnswers)
  const saved = await fetch(`${db.url}/rest/v1/consultation_patients`, { method: 'POST', headers: supabaseHeaders(db.key, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }), body: JSON.stringify({ first_name: body.firstName.trim(), email: body.email.trim().toLowerCase(), whatsapp, main_concern: body.mainConcern, privacy_consent: true, marketing_consent: body.marketingConsent === true, dominant_dosha: result.primary, secondary_dosha: result.secondary, is_balanced: result.isBalanced, scores: result.scores, answers: body.answers, source: source(body.source) }) })
  if (!saved.ok) { console.error('Consultation patient insert failed', saved.status); return { status: 502, body: { error: 'Não foi possível registrar sua avaliação.' } } }
  return { status: 201, body: { ok: true } }
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method === 'POST') { try { const result = await handleConsultationPayload(await readBody(request)); send(response, result.status, result.body); } catch { send(response, 400, { error: 'Dados inválidos.' }) }; return }
  if (!['GET', 'PATCH'].includes(request.method ?? '')) { response.setHeader('Allow', 'GET, PATCH, POST'); send(response, 405, { error: 'Método não permitido.' }); return }
  if (!requireDashboardSession(request, response)) return
  const db = config(); if (!db) { send(response, 503, { error: 'Serviço temporariamente indisponível.' }); return }
  const url = new URL(request.url ?? '/', 'http://localhost')
  if (request.method === 'GET') {
    const status = url.searchParams.get('status'); const params = new URLSearchParams({ select: 'id,first_name,email,whatsapp,main_concern,dominant_dosha,secondary_dosha,is_balanced,scores,answers,status,admin_notes,created_at,updated_at', order: 'created_at.desc', limit: '100' }); if (statuses.includes(status as PatientStatus)) params.set('status', `eq.${status}`)
    try { const result = await fetch(`${db.url}/rest/v1/consultation_patients?${params}`, { headers: supabaseHeaders(db.key) }); if (!result.ok) throw new Error('query'); send(response, 200, { records: await result.json() }); } catch { send(response, 502, { error: 'Não foi possível carregar as pacientes.' }) }; return
  }
  try {
    const id = url.searchParams.get('id'); const body = await readBody(request); if (!validId(id) || !isRecord(body)) { send(response, 422, { error: 'Atualização inválida.' }); return }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }; if (statuses.includes(body.status as PatientStatus)) patch.status = body.status; if (typeof body.adminNotes === 'string' && body.adminNotes.length <= 4000) patch.admin_notes = body.adminNotes; if (Object.keys(patch).length === 1) { send(response, 422, { error: 'Nenhuma alteração válida.' }); return }
    const result = await fetch(`${db.url}/rest/v1/consultation_patients?id=eq.${encodeURIComponent(id!)}`, { method: 'PATCH', headers: supabaseHeaders(db.key, { 'Content-Type': 'application/json', Prefer: 'return=representation' }), body: JSON.stringify(patch) }); if (!result.ok) throw new Error('update'); if (!(await result.json() as unknown[]).length) { send(response, 404, { error: 'Paciente não encontrada.' }); return }; send(response, 200, { ok: true })
  } catch { send(response, 502, { error: 'Não foi possível atualizar a paciente.' }) }
}
