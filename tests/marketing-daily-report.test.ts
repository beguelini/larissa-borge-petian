import { PassThrough } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { dailyReportDates } from '../api/marketing-daily-report'

function request(method = 'GET', authorization = 'Bearer cron-test-secret') {
  const stream = new PassThrough() as PassThrough & { method: string; headers: Record<string, string> }
  stream.method = method
  stream.headers = { authorization }
  queueMicrotask(() => stream.end())
  return stream
}

function apiResponse() {
  const result = { statusCode: 0, body: '', setHeader: vi.fn(), end(body: string) { this.body = body } }
  return result
}

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.CRON_SECRET
  delete process.env.LARISSA_DAILY_REPORT_ENABLED
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.RESEND_API_KEY
  delete process.env.RESEND_FROM_EMAIL
})

describe('GET /api/marketing-daily-report', () => {
  it('calcula os últimos sete dias pelo calendário de São Paulo', () => {
    expect(dailyReportDates(new Date('2026-09-25T15:00:00.000Z'))).toEqual([
      '2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25',
    ])
  })

  it('exige o segredo do cron antes de consultar os dados', async () => {
    process.env.LARISSA_DAILY_REPORT_ENABLED = 'true'
    process.env.CRON_SECRET = 'cron-test-secret'
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const res = apiResponse()

    await handler(request('GET', 'Bearer errado'), res as never)

    expect(res.statusCode).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia o relatório agregado com contagem total e resumo diário sem dados pessoais', async () => {
    process.env.LARISSA_DAILY_REPORT_ENABLED = 'true'
    process.env.CRON_SECRET = 'cron-test-secret'
    process.env.SUPABASE_URL = 'https://project.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-test-key'
    process.env.RESEND_API_KEY = 'resend-test-key'
    process.env.RESEND_FROM_EMAIL = 'Larissa Petian <ola@larissaborgepetian.com.br>'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      if (init?.method === 'HEAD') return new Response(null, { status: 200, headers: { 'content-range': '0-0/12' } })
      return new Response(JSON.stringify({ id: 'daily_123' }), { status: 200 })
    })
    const res = apiResponse()

    await handler(request(), res as never)

    expect(res.statusCode).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(17)
    const queries = fetchMock.mock.calls.slice(0, 16)
    expect(queries.every(([url]) => String(url).includes('/rest/v1/'))).toBe(true)
    expect(queries.every(([, init]) => init?.method === 'HEAD')).toBe(true)
    const mailCall = fetchMock.mock.calls[16]
    expect(mailCall[0]).toBe('https://api.resend.com/emails')
    expect(mailCall[1]?.headers).toMatchObject({ 'Idempotency-Key': expect.stringMatching(/^daily-project-report\/\d{4}-\d{2}-\d{2}$/) })
    const message = JSON.parse(String(mailCall[1]?.body)) as { to: string[]; subject: string; html: string; text: string }
    expect(message.to).toEqual(['lariiptn@gmail.com'])
    expect(message.subject).toContain('Seu panorama diário')
    expect(message.html).toContain('Teste dos doshas')
    expect(message.html).toContain('Comunidade Meu Ritmo')
    expect(message.html).toContain('Novos cadastros por dia')
    expect(message.text).not.toContain('@')
    expect(JSON.parse(res.body)).toMatchObject({ ok: true, doshaTotal: 12, communityTotal: 12 })
  })

  it('não considera atualização de método diferente de GET como um disparo', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const res = apiResponse()

    await handler(request('POST'), res as never)

    expect(res.statusCode).toBe(405)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('não envia relatórios a partir de outro projeto Vercel sem o recurso habilitado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const res = apiResponse()

    await handler(request(), res as never)

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ ok: true, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
