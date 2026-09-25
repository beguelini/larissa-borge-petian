import { timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createDailyReportEmail, sendLarissaNotificationEmail } from './lib/larissa-notification-email.js'

const tables = { dosha: 'dosha_quiz_leads', community: 'meu_ritmo_launch_leads' } as const
const timezone = 'America/Sao_Paulo'

function send(response: ServerResponse, status: number, body: Record<string, unknown>) {
  response.statusCode = status
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.end(JSON.stringify(body))
}

function equalSecret(first: string, second: string) {
  const firstBuffer = Buffer.from(first)
  const secondBuffer = Buffer.from(second)
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer)
}

function localDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function shiftDate(date: string, amount: number) {
  const shifted = new Date(`${date}T12:00:00Z`)
  shifted.setUTCDate(shifted.getUTCDate() + amount)
  return shifted.toISOString().slice(0, 10)
}

export function dailyReportDates(now = new Date()) {
  const today = localDate(now)
  return Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6))
}

async function countRows(url: string, key: string, table: string, date?: string) {
  const params = new URLSearchParams({ select: 'id' })
  if (date) {
    const nextDate = shiftDate(date, 1)
    params.set('and', `(created_at.gte.${date}T00:00:00-03:00,created_at.lt.${nextDate}T00:00:00-03:00)`)
  }
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, {
    method: 'HEAD',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact',
      'Range-Unit': 'items',
      Range: '0-0',
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`count_${table}_${response.status}`)
  const total = response.headers.get('content-range')?.match(/\/(\d+)$/)?.[1]
  if (total === undefined) throw new Error(`count_${table}_missing_total`)
  return Number(total)
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return send(response, 405, { error: 'Método não permitido.' })
  }

  if (process.env.LARISSA_DAILY_REPORT_ENABLED !== 'true') return send(response, 200, { ok: true, skipped: true })

  const secret = process.env.CRON_SECRET
  if (!secret) return send(response, 503, { error: 'Agendamento temporariamente indisponível.' })
  const authorization = request.headers.authorization ?? ''
  if (!equalSecret(authorization, `Bearer ${secret}`)) return send(response, 401, { error: 'Não autorizado.' })

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return send(response, 503, { error: 'Serviço temporariamente indisponível.' })
  }

  const reportDate = localDate(new Date())
  const days = dailyReportDates(new Date())
  try {
    const [doshaTotal, communityTotal, daily] = await Promise.all([
      countRows(url, key, tables.dosha),
      countRows(url, key, tables.community),
      Promise.all(days.map(async (date) => {
        const [dosha, community] = await Promise.all([
          countRows(url, key, tables.dosha, date),
          countRows(url, key, tables.community, date),
        ])
        return { date, dosha, community }
      })),
    ])
    const message = createDailyReportEmail({ reportDate, doshaTotal, communityTotal, daily })
    const delivery = await sendLarissaNotificationEmail(message, `daily-project-report/${reportDate}`)
    if (!delivery.sent) {
      console.error('Daily Larissa report email failed', delivery.reason)
      return send(response, 502, { error: 'Não foi possível enviar o relatório diário.' })
    }
    return send(response, 200, { ok: true, reportDate, doshaTotal, communityTotal })
  } catch (error) {
    console.error('Daily Larissa report failed', error instanceof Error ? error.message : 'unknown')
    return send(response, 502, { error: 'Não foi possível gerar o relatório diário.' })
  }
}
