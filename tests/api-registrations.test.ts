import { describe, expect, it } from 'vitest'
import { registrationResponse } from '../api/registrations'

describe('GET /api/registrations', () => {
  it('retorna uma lista paginada sem nomes completos ou e-mails', () => {
    const result = registrationResponse([
      { first_name: 'Ana Maria', dominant_dosha: 'pitta', marketing_consent: true, created_at: '2026-09-06T14:30:00.000Z' },
    ], 1, 1, 20)

    expect(result).toMatchObject({ total: 1, page: 1, pageSize: 20 })
    expect(result.records[0]).toEqual({ initials: 'AM', date: '06/09/2026', time: '11:30', dosha: 'pitta', marketingConsent: true })
    expect(JSON.stringify(result)).not.toContain('Ana Maria')
  })
})
