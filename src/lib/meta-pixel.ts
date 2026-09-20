type LeadParameters = {
  content_name: string
  content_category: 'dosha_quiz' | 'consulta_ayurvedica'
}

export function trackMetaLead(parameters: LeadParameters) {
  if (typeof window === 'undefined') return
  window.fbq?.('track', 'Lead', parameters)
}

export function trackMetaEbookSalesView() {
  if (typeof window === 'undefined') return
  window.fbq?.('track', 'ViewContent', {
    content_ids: ['sabores-meu-ritmo-vata', 'sabores-meu-ritmo-pitta', 'sabores-meu-ritmo-kapha'],
    content_name: 'Sabores do Meu Ritmo',
    content_type: 'product_group',
    currency: 'BRL',
    value: 17.9,
  })
}

export function trackMetaEbookCheckout(edition: string) {
  if (typeof window === 'undefined') return
  window.fbq?.('track', 'InitiateCheckout', {
    content_ids: [`sabores-meu-ritmo-${edition}`],
    content_name: `Sabores do Meu Ritmo — Edição ${edition.charAt(0).toUpperCase()}${edition.slice(1)}`,
    content_type: 'product',
    currency: 'BRL',
    value: 17.9,
  })
}
