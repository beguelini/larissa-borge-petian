import { describe, expect, it } from 'vitest'
import { summarizeLeads } from '../api/analytics'

describe('GET /api/analytics', () => {
  it('consolida somente dados agregados dos leads', () => {
    const result = summarizeLeads([
      { dominant_dosha: 'pitta', is_balanced: false, marketing_consent: true, created_at: '2026-09-06T12:00:00.000Z' },
      { dominant_dosha: 'vata', is_balanced: true, marketing_consent: false, created_at: '2026-09-06T15:00:00.000Z' },
      { dominant_dosha: 'pitta', is_balanced: false, marketing_consent: true, created_at: '2026-09-05T15:00:00.000Z' },
    ], new Date('2026-09-06T16:00:00.000Z'))

    expect(result).toMatchObject({
      total: 3,
      today: 2,
      marketingConsentRate: 67,
      balancedCount: 1,
      dominantDosha: 'pitta',
      doshas: { vata: 1, pitta: 2, kapha: 0 },
    })
    expect(result.registrationsByDay).toEqual([
      { date: '2026-09-05', count: 1 },
      { date: '2026-09-06', count: 2 },
    ])
  })
})
