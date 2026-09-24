import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleMeuRitmoLead } from '../api/meu-ritmo-leads'

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
})

describe('POST /api/meu-ritmo-leads', () => {
  it('requires valid contact details and consent before saving', async () => {
    const request = vi.spyOn(globalThis, 'fetch')
    const result = await handleMeuRitmoLead({ fullName: 'Ana', email: 'ana@example.com', whatsapp: '(17) 99130-3920', privacyConsent: true })
    expect(result.status).toBe(422)
    expect(request).not.toHaveBeenCalled()
  })

  it('stores normalized contact details and allowed attribution fields', async () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    const request = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 201 }))
    const result = await handleMeuRitmoLead({
      fullName: 'Ana Maria',
      email: 'ANA@example.com',
      whatsapp: '(17) 99130-3920',
      privacyConsent: true,
      communicationsConsent: true,
      source: { path: '/meu-ritmo', utmSource: 'instagram', unexpected: 'discard' },
    })

    expect(result.status).toBe(201)
    expect(request).toHaveBeenCalledWith('https://project.supabase.co/rest/v1/meu_ritmo_launch_leads', expect.objectContaining({ method: 'POST' }))
    const [, init] = request.mock.calls[0]
    expect(JSON.parse(String(init?.body))).toMatchObject({
      full_name: 'Ana Maria',
      email: 'ana@example.com',
      whatsapp: '5517991303920',
      privacy_consent: true,
      communications_consent: true,
      source: { path: '/meu-ritmo', utmSource: 'instagram' },
    })
    expect(JSON.parse(String(init?.body)).source).not.toHaveProperty('unexpected')
  })

  it('does not save a submission that fills the honeypot', async () => {
    const request = vi.spyOn(globalThis, 'fetch')
    const result = await handleMeuRitmoLead({ website: 'bot' })
    expect(result.status).toBe(201)
    expect(request).not.toHaveBeenCalled()
  })
})
