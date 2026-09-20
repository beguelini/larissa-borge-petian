import { describe, expect, it } from 'vitest'
import { consultationPriceCents, ebookConsultationDiscountedPriceCents, ebookConsultationDiscountPercent } from './consultation-pricing'

describe('consulta com benefício do e-book', () => {
  it('aplica 20% sobre a primeira consulta de R$ 220', () => {
    expect(consultationPriceCents).toBe(22000)
    expect(ebookConsultationDiscountPercent).toBe(20)
    expect(ebookConsultationDiscountedPriceCents).toBe(17600)
  })
})
