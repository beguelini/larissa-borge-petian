import type { IncomingMessage, ServerResponse } from 'node:http'
import { hasCompleteAnswers, scoreQuiz } from '../src/lib/results.js'
import type { QuizAnswers } from '../src/types.js'

type ApiRequest = IncomingMessage & { body?: unknown }

type LeadPayload = {
  firstName?: unknown
  email?: unknown
  privacyConsent?: unknown
  marketingConsent?: unknown
  website?: unknown
  answers?: unknown
  source?: unknown
}

type LeadResponse = {
  status: number
  body: Record<string, unknown>
}

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validName(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length >= 2
    && value.trim().length <= 80
    && /^[\p{L}\s'-]+$/u.test(value.trim())
}

function validEmail(value: unknown): value is string {
  return typeof value === 'string'
    && value.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function cleanSource(value: unknown) {
  if (!isRecord(value)) return {}
  const allowedKeys = ['path', 'referrer', 'utmSource', 'utmMedium', 'utmCampaign']
  return allowedKeys.reduce<Record<string, string | null>>((result, key) => {
    const item = value[key]
    if (item === null) result[key] = null
    if (typeof item === 'string') result[key] = item.slice(0, 500)
    return result
  }, {})
}

async function readBody(request: ApiRequest) {
  if (request.body !== undefined) return request.body

  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

function send(response: ServerResponse, result: LeadResponse, extraHeaders: Record<string, string> = {}) {
  response.statusCode = result.status
  Object.entries({ ...responseHeaders, ...extraHeaders }).forEach(([name, value]) => {
    response.setHeader(name, value)
  })
  response.end(JSON.stringify(result.body))
}

export async function handleLeadPayload(body: unknown): Promise<LeadResponse> {
  if (!isRecord(body)) return { status: 400, body: { error: 'Dados inválidos.' } }
  const payload = body as LeadPayload

  if (typeof payload.website === 'string' && payload.website.trim()) {
    return { status: 201, body: { ok: true } }
  }
  if (!validName(payload.firstName) || !validEmail(payload.email)) {
    return { status: 422, body: { error: 'Nome ou e-mail inválido.' } }
  }
  if (payload.privacyConsent !== true || typeof payload.marketingConsent !== 'boolean') {
    return { status: 422, body: { error: 'Consentimentos inválidos.' } }
  }
  if (!isRecord(payload.answers) || !hasCompleteAnswers(payload.answers as QuizAnswers)) {
    return { status: 422, body: { error: 'Questionário incompleto ou adulterado.' } }
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase server environment is not configured')
    return { status: 503, body: { error: 'Serviço temporariamente indisponível.' } }
  }

  const answers = payload.answers as QuizAnswers
  const result = scoreQuiz(answers)
  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/dosha_quiz_leads`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      first_name: payload.firstName.trim(),
      email: payload.email.trim().toLowerCase(),
      privacy_consent: true,
      marketing_consent: payload.marketingConsent,
      dominant_dosha: result.primary,
      secondary_dosha: result.secondary,
      is_balanced: result.isBalanced,
      scores: result.scores,
      answers,
      source: cleanSource(payload.source),
    }),
  })

  if (!insertResponse.ok) {
    console.error('Supabase lead insert failed', insertResponse.status)
    return { status: 502, body: { error: 'Não foi possível registrar o resultado.' } }
  }

  return { status: 201, body: { ok: true } }
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== 'POST') {
    send(response, { status: 405, body: { error: 'Método não permitido.' } }, { Allow: 'POST' })
    return
  }

  const contentLength = Number(request.headers['content-length'] ?? 0)
  if (contentLength > 50_000) {
    send(response, { status: 413, body: { error: 'Payload muito grande.' } })
    return
  }

  const origin = request.headers.origin
  const host = request.headers.host
  if (typeof origin === 'string' && host && new URL(origin).host !== host) {
    send(response, { status: 403, body: { error: 'Origem não autorizada.' } })
    return
  }

  try {
    send(response, await handleLeadPayload(await readBody(request)))
  } catch {
    send(response, { status: 400, body: { error: 'Dados inválidos.' } })
  }
}
