import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleLeadPayload } from '../api/leads'
import { createDoshaResultEmail } from '../api/lib/dosha-result-email'
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
  delete process.env.RESEND_API_KEY
  delete process.env.RESEND_FROM_EMAIL
})

describe('POST /api/leads', () => {
  it('rejeita questionário adulterado antes de acessar o banco', async () => {
    const databaseFetch = vi.spyOn(globalThis, 'fetch')
    const response = await handleLeadPayload({
      firstName: 'Teste',
      email: 'qa@example.com',
      whatsapp: '11999999999',
      privacyConsent: true,
      marketingConsent: true,
      answers: { 'body-frame': 'opcao-inexistente' },
    })

    expect(response.status).toBe(422)
    expect(databaseFetch).not.toHaveBeenCalled()
  })

  it('rejeita o cadastro sem autorização para e-mails antes de acessar o banco', async () => {
    const databaseFetch = vi.spyOn(globalThis, 'fetch')
    const response = await handleLeadPayload({
      firstName: 'Teste',
      email: 'qa@example.com',
      whatsapp: '11999999999',
      privacyConsent: true,
      marketingConsent: false,
      answers: completeAnswers(),
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
      whatsapp: '(11) 99999-9999',
      privacyConsent: true,
      marketingConsent: true,
      answers: completeAnswers(),
      source: { path: '/', utmCampaign: 'teste' },
    })

    expect(response.status).toBe(201)
    expect(databaseFetch).toHaveBeenCalledOnce()
    const [, init] = databaseFetch.mock.calls[0]
    const inserted = JSON.parse(String(init?.body)) as Record<string, unknown>
    expect(inserted.email).toBe('qa@example.com')
    expect(inserted.whatsapp).toBe('5511999999999')
    expect(inserted.privacy_consent).toBe(true)
    expect(inserted.scores).toEqual({ vata: 5, pitta: 5, kapha: 5 })
  })

  it('envia a confirmação do resultado pelo Resend depois de salvar o lead', async () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-test-key'
    process.env.RESEND_API_KEY = 'resend-test-key'
    process.env.RESEND_FROM_EMAIL = 'Larissa Petian <ola@larissaborgepetian.com.br>'
    const request = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'email_123' }), { status: 200 }))

    const response = await handleLeadPayload({
      firstName: 'Ana',
      email: 'ana@example.com',
      whatsapp: '11999999999',
      privacyConsent: true,
      marketingConsent: true,
      answers: completeAnswers(),
    })

    expect(response.status).toBe(201)
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[1][0]).toBe('https://api.resend.com/emails')
    const message = JSON.parse(String(request.mock.calls[1][1]?.body)) as Record<string, unknown>
    expect(message.to).toEqual(['ana@example.com'])
    expect(message.subject).toBe('Seu resultado dosha está pronto, Ana')
    expect(String(message.html)).toContain('O que isso pode revelar')
    expect(String(message.html)).toContain('Quero transformar meu ritmo com a Larissa')
    expect(String(message.html)).toContain('https://chat.whatsapp.com/HvofSYG7Ysg5w3uvLuup7W?mode=gi_t')
  })

  it('mantém o cadastro mesmo se o envio de e-mail falhar', async () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-test-key'
    process.env.RESEND_API_KEY = 'resend-test-key'
    process.env.RESEND_FROM_EMAIL = 'Larissa Petian <ola@larissaborgepetian.com.br>'
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 422 }))

    const response = await handleLeadPayload({
      firstName: 'Ana',
      email: 'ana@example.com',
      whatsapp: '11999999999',
      privacyConsent: true,
      marketingConsent: true,
      answers: completeAnswers(),
    })

    expect(response.status).toBe(201)
  })

  it('monta o conteúdo do resultado sem injetar o nome informado', () => {
    const email = createDoshaResultEmail({
      firstName: '<Ana>',
      email: 'ana@example.com',
      primary: 'vata',
      secondary: 'pitta',
      isBalanced: false,
      percentages: { vata: 60, pitta: 33, kapha: 7 },
    })

    expect(email.subject).toBe('Seu resultado dosha está pronto, <Ana>')
    expect(email.html).toContain('&lt;Ana&gt;')
    expect(email.html).toContain('Vata com traços de Pitta')
    expect(email.html).toContain('Criatividade, movimento e sensibilidade aparecem com força no seu jeito de viver.')
    expect(email.html).toContain('Antes de começar o dia, aqueça as mãos')
    expect(email.html).toContain('role="presentation"')
    expect(email.html).toContain('width="600"')
    expect(email.html).toContain('mso-table-lspace:0pt')
    expect(email.text).toContain('Kapha: 7%')
  })

  it('rejeita o cadastro sem WhatsApp antes de acessar o banco', async () => {
    const databaseFetch = vi.spyOn(globalThis, 'fetch')
    const response = await handleLeadPayload({
      firstName: 'Teste',
      email: 'qa@example.com',
      privacyConsent: true,
      marketingConsent: true,
      answers: completeAnswers(),
    })

    expect(response.status).toBe(422)
    expect(databaseFetch).not.toHaveBeenCalled()
  })
})
