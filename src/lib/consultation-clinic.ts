export type PlanType = 'single' | 'combo' | 'quarterly' | 'semiannual'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'waived' | 'refunded'
export type PaymentMethod = 'pix' | 'credit_card' | 'cash' | 'other'

export const planLabels: Record<PlanType, string> = { single: 'Consulta avulsa', combo: 'Combo personalizado', quarterly: 'Acompanhamento trimestral', semiannual: 'Acompanhamento semestral' }
export const paymentStatusLabels: Record<PaymentStatus, string> = { pending: 'Em aberto', partial: 'Parcial', paid: 'Pago', waived: 'Cortesia', refunded: 'Reembolsado' }
export const paymentMethodLabels: Record<PaymentMethod, string> = { pix: 'PIX', credit_card: 'Cartão de crédito', cash: 'Dinheiro', other: 'Outro' }

export function totalPlanCents(unitPriceCents: number, sessions: number, discountPercent: number) {
  return Math.round(Math.max(0, unitPriceCents) * Math.max(1, sessions) * (1 - Math.min(100, Math.max(0, discountPercent)) / 100))
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}
