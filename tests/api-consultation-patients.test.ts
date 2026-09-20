import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleConsultationPayload } from '../api/consultation-patients'
import { quizQuestions } from '../src/data/questions'

const answers = () => Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[0].id]))

afterEach(() => { vi.restoreAllMocks(); delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY })

describe('POST /api/consultation-patients', () => {
  it('requires the intake, consent and complete assessment before saving', async () => {
    const request = vi.spyOn(globalThis, 'fetch')
    const result = await handleConsultationPayload({ firstName: 'Ana', email: 'ana@example.com', whatsapp: '17991303920', mainConcern: 'ansiedade', privacyConsent: true, answers: { 'body-frame': 'invalid' } })
    expect(result.status).toBe(422)
    expect(request).not.toHaveBeenCalled()
  })

  it('stores a normalized consultation patient at the full consultation price when no e-book purchase exists', async () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    const request = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('[]', { status: 200 })).mockResolvedValueOnce(new Response(null, { status: 201 }))
    const result = await handleConsultationPayload({ firstName: 'Ana', email: 'ANA@example.com', whatsapp: '(17) 99130-3920', mainConcern: 'ansiedade', privacyConsent: true, marketingConsent: false, answers: answers() })
    expect(result.status).toBe(201)
    const [, init] = request.mock.calls[1]
    expect(JSON.parse(String(init?.body))).toMatchObject({ first_name: 'Ana', email: 'ana@example.com', whatsapp: '5517991303920', main_concern: 'ansiedade', privacy_consent: true, dominant_dosha: 'vata', unit_price_cents: 22000, discount_percent: 0 })
    expect(result.body).toMatchObject({ ebookConsultationBenefit: false, consultationPriceCents: 22000 })
  })

  it('automatically applies the e-book benefit to an approved buyer with the same email', async () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    const request = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('[{"id":"purchase"}]', { status: 200 })).mockResolvedValueOnce(new Response(null, { status: 201 }))
    const result = await handleConsultationPayload({ firstName: 'Ana', email: 'ana@example.com', whatsapp: '(17) 99130-3920', mainConcern: 'ansiedade', privacyConsent: true, answers: answers() })
    const [, init] = request.mock.calls[1]
    expect(JSON.parse(String(init?.body))).toMatchObject({ unit_price_cents: 22000, discount_percent: 20 })
    expect(result.body).toMatchObject({ ebookConsultationBenefit: true, consultationPriceCents: 22000 })
  })
})
