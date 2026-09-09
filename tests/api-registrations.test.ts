import { describe, expect, it } from 'vitest'
import { registrationResponse } from '../api/registrations'

describe('GET /api/registrations', () => {
  it('retorna os dados de contato apenas para a rota já autenticada', () => {
    const result = registrationResponse([
      { id: '5e9a0c32-8c26-48e9-9da2-4f1c8e064cf3', first_name: 'Ana Maria', email: 'ana@example.com', whatsapp: '5511999999999', dominant_dosha: 'pitta', secondary_dosha: 'vata', is_balanced: false, marketing_consent: true, created_at: '2026-09-06T14:30:00.000Z' },
    ], 1, 1, 20)

    expect(result).toMatchObject({ total: 1, page: 1, pageSize: 20 })
    expect(result.records[0]).toEqual({ id: '5e9a0c32-8c26-48e9-9da2-4f1c8e064cf3', firstName: 'Ana Maria', email: 'ana@example.com', whatsapp: '5511999999999', initials: 'AM', date: '06/09/2026', time: '11:30', dosha: 'pitta', secondaryDosha: 'vata', isBalanced: false, marketingConsent: true })
  })
})
