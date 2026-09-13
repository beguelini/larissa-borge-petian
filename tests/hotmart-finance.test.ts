import { describe, expect, it } from 'vitest'
import { summarizeHotmart } from '../api/hotmart-finance'

describe('summarizeHotmart', () => {
  it('agrupa vendas e reversões por cada produto recebido no webhook', () => {
    const summary = summarizeHotmart([
      { event_type: 'PURCHASE_APPROVED', product_id: 'vata-1', product_name: 'Sabores do Meu Ritmo: Edição Vata', gross_amount: 47, currency: 'BRL', payment_type: 'CREDIT_CARD', event_created_at: '2026-09-10T12:00:00Z', transaction_code: 'VATA-1' },
      { event_type: 'PURCHASE_APPROVED', product_id: 'kapha-1', product_name: 'Sabores do Meu Ritmo: Edição Kapha', gross_amount: 47, currency: 'BRL', payment_type: 'PIX', event_created_at: '2026-09-10T13:00:00Z', transaction_code: 'KAPHA-1' },
      { event_type: 'PURCHASE_REFUNDED', product_id: 'vata-1', product_name: 'Sabores do Meu Ritmo: Edição Vata', gross_amount: 47, currency: 'BRL', payment_type: 'CREDIT_CARD', event_created_at: '2026-09-10T14:00:00Z', transaction_code: 'VATA-1' },
    ])

    expect(summary.products).toEqual([
      { product: 'Sabores do Meu Ritmo: Edição Kapha', productId: 'kapha-1', orders: 1, grossRevenue: 47, reversals: 0, netRevenue: 47, ticket: 47 },
      { product: 'Sabores do Meu Ritmo: Edição Vata', productId: 'vata-1', orders: 1, grossRevenue: 47, reversals: 47, netRevenue: 0, ticket: 47 },
    ])
  })
})
