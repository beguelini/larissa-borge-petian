import { describe, expect, it } from 'vitest'
import { summarizeDoshaLeads } from '../api/doshas'

describe('GET /api/doshas', () => {
  it('consolida distribuição, combinações e consentimento sem expor dados pessoais', () => {
    const result = summarizeDoshaLeads([
      { dominant_dosha: 'pitta', secondary_dosha: 'vata', is_balanced: false, marketing_consent: true, scores: { pitta: 8, vata: 5, kapha: 2 }, created_at: '2026-09-06T12:00:00.000Z' },
      { dominant_dosha: 'pitta', secondary_dosha: 'vata', is_balanced: false, marketing_consent: false, scores: { pitta: 7, vata: 6, kapha: 2 }, created_at: '2026-09-06T15:00:00.000Z' },
      { dominant_dosha: 'kapha', secondary_dosha: null, is_balanced: true, marketing_consent: true, scores: { pitta: 5, vata: 5, kapha: 5 }, created_at: '2026-09-05T15:00:00.000Z' },
    ], new Date('2026-09-06T16:00:00.000Z'))
    expect(result).toMatchObject({ total: 3, dominantDosha: 'pitta', balancedRate: 33, marketingConsent: { count: 2, rate: 67 } })
    expect(result.primary.find((item) => item.dosha === 'pitta')).toMatchObject({ count: 2, percentage: 67, consentRate: 50, averageScore: 6.7 })
    expect(result.combinations[0]).toEqual({ primary: 'pitta', secondary: 'vata', count: 2 })
    expect(result.registrationsByDay.at(-1)).toMatchObject({ date: '2026-09-06', total: 2, doshas: { pitta: 2, vata: 0, kapha: 0 } })
  })
})
