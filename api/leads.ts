import { hasCompleteAnswers, scoreQuiz } from '../src/lib/results'
import type { QuizAnswers } from '../src/types'

type LeadPayload = {
  firstName?: unknown
  email?: unknown
  privacyConsent?: unknown
  marketingConsent?: unknown
  website?: unknown
  answers?: unknown
  source?: unknown
}

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders })
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

async function handlePost(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 50_000) return json({ error: 'Payload muito grande.' }, 413)

  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ error: 'Origem não autorizada.' }, 403)
  }

  let body: LeadPayload
  try {
    body = await request.json() as LeadPayload
  } catch {
    return json({ error: 'Dados inválidos.' }, 400)
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return json({ ok: true }, 201)
  }
  if (!validName(body.firstName) || !validEmail(body.email)) {
    return json({ error: 'Nome ou e-mail inválido.' }, 422)
  }
  if (body.privacyConsent !== true || typeof body.marketingConsent !== 'boolean') {
    return json({ error: 'Consentimentos inválidos.' }, 422)
  }
  if (!isRecord(body.answers) || !hasCompleteAnswers(body.answers as QuizAnswers)) {
    return json({ error: 'Questionário incompleto ou adulterado.' }, 422)
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase server environment is not configured')
    return json({ error: 'Serviço temporariamente indisponível.' }, 503)
  }

  const answers = body.answers as QuizAnswers
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
      first_name: body.firstName.trim(),
      email: body.email.trim().toLowerCase(),
      privacy_consent: true,
      marketing_consent: body.marketingConsent,
      dominant_dosha: result.primary,
      secondary_dosha: result.secondary,
      is_balanced: result.isBalanced,
      scores: result.scores,
      answers,
      source: cleanSource(body.source),
    }),
  })

  if (!insertResponse.ok) {
    console.error('Supabase lead insert failed', insertResponse.status)
    return json({ error: 'Não foi possível registrar o resultado.' }, 502)
  }

  return json({ ok: true }, 201)
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido.' }), {
        status: 405,
        headers: { ...responseHeaders, Allow: 'POST' },
      })
    }

    return handlePost(request)
  },
}
