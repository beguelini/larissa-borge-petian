import { describe, expect, it } from 'vitest'
import { requestedDateRange, summarizeLeads } from '../api/analytics'

describe('GET /api/analytics', () => {
  it('não infere um dosha predominante sem cadastros', () => {
    expect(summarizeLeads([], new Date('2026-09-06T16:00:00.000Z')).dominantDosha).toBeNull()
  })

  it('consolida somente dados agregados dos leads', () => {
    const result = summarizeLeads([
      { first_name: 'Ana Maria', dominant_dosha: 'pitta', is_balanced: false, marketing_consent: true, created_at: '2026-09-06T12:00:00.000Z' },
      { first_name: 'Vera', dominant_dosha: 'vata', is_balanced: true, marketing_consent: false, created_at: '2026-09-06T15:00:00.000Z' },
      { first_name: 'Paula', dominant_dosha: 'pitta', is_balanced: false, marketing_consent: true, created_at: '2026-09-05T15:00:00.000Z' },
    ], new Date('2026-09-06T16:00:00.000Z'))

    expect(result).toMatchObject({
      total: 3,
      today: 2,
      marketingConsentRate: 67,
      balancedCount: 1,
      dominantDosha: 'pitta',
      doshas: { vata: 1, pitta: 2, kapha: 0 },
    })
    expect(result.registrationsByDay.at(-2)).toEqual({ date: '2026-09-05', count: 1 })
    expect(result.registrationsByDay.at(-1)).toEqual({ date: '2026-09-06', count: 2 })
    expect(result.recentLeads[0]).toMatchObject({ initials: 'AM', dosha: 'pitta' })
  })

  it('apura os cadastros em uma janela de datas inclusiva', () => {
    const range = requestedDateRange('2026-09-02', '2026-09-03')
    expect(range).toEqual({ from: '2026-09-02', to: '2026-09-03' })
    const result = summarizeLeads([
      { first_name: 'Ana', dominant_dosha: 'pitta', is_balanced: false, marketing_consent: true, created_at: '2026-09-02T12:00:00.000Z' },
      { first_name: 'Vera', dominant_dosha: 'vata', is_balanced: true, marketing_consent: false, created_at: '2026-09-03T15:00:00.000Z' },
    ], new Date('2026-09-04T16:00:00.000Z'), range!)

    expect(result.total).toBe(2)
    expect(result.registrationsByDay).toEqual([{ date: '2026-09-02', count: 1 }, { date: '2026-09-03', count: 1 }])
  })

  it('rejeita períodos incompletos, impossíveis ou invertidos', () => {
    expect(requestedDateRange('2026-09-03', null)).toBeNull()
    expect(requestedDateRange('2026-02-30', '2026-03-01')).toBeNull()
    expect(requestedDateRange('2026-09-04', '2026-09-03')).toBeNull()
  })
})
