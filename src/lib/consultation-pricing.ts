export const consultationPriceCents = 22000
export const ebookConsultationDiscountPercent = 20
export const ebookConsultationDiscountedPriceCents = Math.round(
  consultationPriceCents * (1 - ebookConsultationDiscountPercent / 100),
)

export function formatConsultationPrice(valueInCents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueInCents / 100)
}
