import { PassThrough } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from '../api/hotmart-webhook'

function request(payload: unknown, hottok = 'hotmart-test-token') {
  const stream = new PassThrough() as PassThrough & { method: string; headers: Record<string, string> }
  stream.method = 'POST'
  stream.headers = { 'x-hotmart-hottok': hottok }
  queueMicrotask(() => stream.end(JSON.stringify(payload)))
  return stream
}

function response() {
  const result = { statusCode: 0, body: '', setHeader: vi.fn(), end: vi.fn((body: string) => { result.body = body }) }
  return result
}

const approvedPurchase = {
  id: 'event-123',
  event: 'PURCHASE_APPROVED',
  version: '2.0.0',
  data: { product: { id: 12345 }, buyer: { name: 'Ana Silva', email: 'ana@example.com' }, purchase: { transaction: 'HP123', status: 'APPROVED' } },
}

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.RESEND_API_KEY
  delete process.env.RESEND_FROM_EMAIL
  delete process.env.HOTMART_HOTTOK
  delete process.env.HOTMART_PRODUCT_ID
})

describe('POST /api/hotmart-webhook', () => {
  it('recusa chamadas sem o segredo da Hotmart', async () => {
    process.env.HOTMART_HOTTOK = 'hotmart-test-token'
    process.env.HOTMART_PRODUCT_ID = '12345'
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const res = response()

    await handler(request(approvedPurchase, 'invalid-token'), res as never)

    expect(res.statusCode).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('libera o acesso e envia o e-mail somente para uma compra aprovada', async () => {
    process.env.HOTMART_HOTTOK = 'hotmart-test-token'
    process.env.HOTMART_PRODUCT_ID = '12345'
    process.env.SUPABASE_URL = 'https://project.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-test-key'
    process.env.RESEND_API_KEY = 'resend-test-key'
    process.env.RESEND_FROM_EMAIL = 'Larissa Petian <ola@larissaborgepetian.com.br>'
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'email_123' }), { status: 200 }))
    const res = response()

    await handler(request(approvedPurchase), res as never)

    expect(res.statusCode).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(fetchMock.mock.calls[3][0]).toBe('https://api.resend.com/emails')
    const message = JSON.parse(String(fetchMock.mock.calls[3][1]?.body)) as Record<string, unknown>
    expect(message.subject).toBe('Seja bem-vinda ao Meu Ritmo, Ana')
    expect(String(message.html)).toContain('Criar minha senha e acessar')
    expect(String(message.html)).toContain('activation=')
  })

  it('reconhece o teste sandbox da Hotmart sem criar uma aluna fictícia', async () => {
    process.env.HOTMART_HOTTOK = 'hotmart-test-token'
    process.env.HOTMART_PRODUCT_ID = '12345'
    process.env.SUPABASE_URL = 'https://project.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-test-key'
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const res = response()
    const sandbox = { ...approvedPurchase, data: { ...approvedPurchase.data, product: { id: 0, sku: 'HTM_SANDBOX' } } }

    await handler(request(sandbox), res as never)

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ ok: true, test: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
