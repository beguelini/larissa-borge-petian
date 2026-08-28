import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleLeadPayload } from '../api/leads'
import { quizQuestions } from '../src/data/questions'

function completeAnswers() {
  return Object.fromEntries(
    quizQuestions.map((question) => [question.id, question.options[0].id]),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
})

describe('POST /api/leads', () => {
  it('rejeita questionário adulterado antes de acessar o banco', async () => {
    const databaseFetch = vi.spyOn(globalThis, 'fetch')
    const response = await handleLeadPayload({
      firstName: 'Teste',
      email: 'qa@example.com',
      privacyConsent: true,
      marketingConsent: false,
      answers: { 'body-frame': 'opcao-inexistente' },
    })

    expect(response.status).toBe(422)
    expect(databaseFetch).not.toHaveBeenCalled()
  })

  it('recalcula e envia um lead válido usando somente o backend', async () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-test-key'
    const databaseFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 201 }))

    const response = await handleLeadPayload({
      firstName: 'Teste',
      email: 'QA@Example.com',
      privacyConsent: true,
      marketingConsent: false,
      answers: completeAnswers(),
      source: { path: '/', utmCampaign: 'teste' },
    })

    expect(response.status).toBe(201)
    expect(databaseFetch).toHaveBeenCalledOnce()
    const [, init] = databaseFetch.mock.calls[0]
    const inserted = JSON.parse(String(init?.body)) as Record<string, unknown>
    expect(inserted.email).toBe('qa@example.com')
    expect(inserted.privacy_consent).toBe(true)
    expect(inserted.scores).toEqual({ vata: 5, pitta: 5, kapha: 5 })
  })
})
