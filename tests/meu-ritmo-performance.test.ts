import { describe, expect, it } from 'vitest'
import { summarizeMeuRitmoPerformance } from '../api/meu-ritmo-performance'

const range = { from: '2026-09-01', to: '2026-09-30' }

describe('summarizeMeuRitmoPerformance', () => {
  it('counts only sales of the selected product made after matching launch leads', () => {
    const result = summarizeMeuRitmoPerformance([
      { full_name: 'Ana', email: 'ana@example.com', whatsapp: '5511999999999', privacy_consent: true, communications_consent: true, created_at: '2026-09-10T15:00:00.000Z', source: { utmSource: 'instagram', utmMedium: 'social', utmCampaign: 'meu-ritmo' } },
      { full_name: 'Bia', email: 'BIA@example.com', whatsapp: '5511888888888', privacy_consent: true, communications_consent: false, created_at: '2026-09-11T15:00:00.000Z', source: {} },
    ], [
      { event_type: 'PURCHASE_APPROVED', transaction_code: 'MR-1', product_id: 'community-1', product_name: 'Comunidade Meu Ritmo', buyer_email: 'ANA@example.com', gross_amount: 297, producer_commission: 270, event_created_at: '2026-09-12T15:00:00.000Z' },
      { event_type: 'PURCHASE_APPROVED', transaction_code: 'EBOOK-1', product_id: 'ebook-1', product_name: 'Sabores do Meu Ritmo: Edição Vata', buyer_email: 'bia@example.com', gross_amount: 47, producer_commission: 41, event_created_at: '2026-09-12T15:00:00.000Z' },
      { event_type: 'PURCHASE_APPROVED', transaction_code: 'OLD-1', product_id: 'community-1', product_name: 'Comunidade Meu Ritmo', buyer_email: 'bia@example.com', gross_amount: 297, producer_commission: 270, event_created_at: '2026-09-10T10:00:00.000Z' },
      { event_type: 'PURCHASE_APPROVED', transaction_code: 'OTHER-1', product_id: 'community-1', product_name: 'Comunidade Meu Ritmo', buyer_email: 'someone@example.com', gross_amount: 297, producer_commission: 270, event_created_at: '2026-09-12T15:00:00.000Z' },
    ], 'community-1', range)

    expect(result.leads).toBe(2)
    expect(result.convertedLeads).toBe(1)
    expect(result.orders).toBe(1)
    expect(result.conversionRate).toBe(50)
    expect(result.grossRevenue).toBe(297)
    expect(result.netRevenue).toBe(270)
    expect(result.attribution[0]).toEqual({ source: 'instagram', medium: 'social', campaign: 'meu-ritmo', leads: 1 })
    expect(result.leadList).toHaveLength(2)
    expect(result.leadList[0]).toMatchObject({ name: 'Ana', email: 'ana@example.com', whatsapp: '5511999999999', privacyConsent: true, communicationsConsent: true, campaign: 'meu-ritmo' })
  })

  it('removes refunded sales from active conversion and never guesses the Hotmart payout', () => {
    const result = summarizeMeuRitmoPerformance(
      [{ full_name: 'Ana', email: 'ana@example.com', whatsapp: '5511999999999', privacy_consent: true, communications_consent: false, created_at: '2026-09-10T15:00:00.000Z', source: {} }],
      [
        { event_type: 'PURCHASE_APPROVED', transaction_code: 'MR-1', product_id: 'community-1', product_name: 'Comunidade Meu Ritmo', buyer_email: 'ana@example.com', gross_amount: 297, producer_commission: null, event_created_at: '2026-09-12T15:00:00.000Z' },
        { event_type: 'PURCHASE_REFUNDED', transaction_code: 'MR-1', product_id: 'community-1', product_name: 'Comunidade Meu Ritmo', buyer_email: 'ana@example.com', gross_amount: 297, producer_commission: null, event_created_at: '2026-09-13T15:00:00.000Z' },
      ],
      'community-1',
      range,
    )

    expect(result.convertedLeads).toBe(0)
    expect(result.orders).toBe(0)
    expect(result.refunds).toBe(297)
    expect(result.netRevenue).toBeNull()
  })

  it('only attributes the configured community product and ignores e-book purchases', () => {
    const result = summarizeMeuRitmoPerformance(
      [{ full_name: 'Ana', email: 'ana@example.com', whatsapp: '5511999999999', privacy_consent: true, communications_consent: false, created_at: '2026-09-10T15:00:00.000Z', source: {} }],
      [
        { event_type: 'PURCHASE_APPROVED', transaction_code: 'MR-1', product_id: 'community-1', product_name: 'Comunidade Meu Ritmo', buyer_email: 'ana@example.com', gross_amount: 297, producer_commission: 270, event_created_at: '2026-09-12T15:00:00.000Z' },
        { event_type: 'PURCHASE_APPROVED', transaction_code: 'EBOOK-1', product_id: 'ebook-1', product_name: 'Sabores do Meu Ritmo: Edição Vata', buyer_email: 'ana@example.com', gross_amount: 47, producer_commission: 41, event_created_at: '2026-09-12T15:00:00.000Z' },
      ],
      'community-1',
      range,
    )

    expect(result.orders).toBe(1)
    expect(result.grossRevenue).toBe(297)
    expect(result.leadList).toHaveLength(1)
  })
})
