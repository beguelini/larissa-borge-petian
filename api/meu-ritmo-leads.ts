import type { IncomingMessage, ServerResponse } from 'node:http'

type ApiRequest = IncomingMessage & { body?: unknown }

const headers = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

function send(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value))
  response.end(JSON.stringify(body))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 80 && /^[\p{L}\s'-]+$/u.test(value.trim())
}

function validEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeWhatsApp(value: unknown) {
  if (typeof value !== 'string') return null
  const local = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  return /^[1-9]\d(?:9?\d{8})$/.test(local) ? `55${local}` : null
}

function source(value: unknown) {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, item]) => ['path', 'referrer', 'utmSource', 'utmMedium', 'utmCampaign'].includes(key) && (typeof item === 'string' || item === null))
      .map(([key, item]) => [key, typeof item === 'string' ? item.slice(0, 500) : null]),
  )
}

async function readBody(request: ApiRequest) {
  if (request.body !== undefined) return request.body
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 8192) throw new Error('Payload too large')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

export async function handleMeuRitmoLead(body: unknown) {
  if (!isRecord(body)) return { status: 400, body: { error: 'Dados inválidos.' } }
  if (typeof body.website === 'string' && body.website.trim()) return { status: 201, body: { ok: true } }
  const whatsapp = normalizeWhatsApp(body.whatsapp)
  if (!validName(body.fullName) || !validEmail(body.email) || !whatsapp) {
    return { status: 422, body: { error: 'Informe nome, e-mail e WhatsApp válidos.' } }
  }
  if (body.privacyConsent !== true || body.communicationsConsent !== true) {
    return { status: 422, body: { error: 'O consentimento é obrigatório para continuar.' } }
  }

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { status: 503, body: { error: 'Serviço temporariamente indisponível.' } }

  let inserted: Response
  try {
    inserted = await fetch(`${url}/rest/v1/meu_ritmo_launch_leads`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        full_name: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        whatsapp,
        privacy_consent: true,
        communications_consent: true,
        source: source(body.source),
      }),
    })
  } catch {
    return { status: 502, body: { error: 'Não foi possível registrar sua inscrição.' } }
  }

  if (!inserted.ok) {
    console.error('Meu Ritmo lead insert failed', inserted.status)
    return { status: 502, body: { error: 'Não foi possível registrar sua inscrição.' } }
  }
  return { status: 201, body: { ok: true } }
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    send(response, 405, { error: 'Método não permitido.' })
    return
  }
  try {
    const result = await handleMeuRitmoLead(await readBody(request))
    send(response, result.status, result.body)
  } catch {
    send(response, 400, { error: 'Dados inválidos.' })
  }
}
