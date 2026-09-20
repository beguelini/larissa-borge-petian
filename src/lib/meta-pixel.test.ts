import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackMetaEbookCheckout, trackMetaEbookSalesView, trackMetaLead } from './meta-pixel'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('trackMetaLead', () => {
  it('envia Lead sem dados pessoais quando o Pixel está disponível', () => {
    const fbq = vi.fn()
    vi.stubGlobal('window', { fbq })

    trackMetaLead({ content_name: 'Teste gratuito de Dosha', content_category: 'dosha_quiz' })

    expect(fbq).toHaveBeenCalledWith('track', 'Lead', {
      content_name: 'Teste gratuito de Dosha',
      content_category: 'dosha_quiz',
    })
  })

  it('não falha quando o Pixel está bloqueado ou indisponível', () => {
    vi.stubGlobal('window', {})

    expect(() => trackMetaLead({ content_name: 'Consulta ayurvédica online', content_category: 'consulta_ayurvedica' })).not.toThrow()
  })
})

describe('e-book sales tracking', () => {
  it('registra a visualização do conjunto de e-books sem dados pessoais', () => {
    const fbq = vi.fn()
    vi.stubGlobal('window', { fbq })

    trackMetaEbookSalesView()

    expect(fbq).toHaveBeenCalledWith('track', 'ViewContent', expect.objectContaining({
      content_name: 'Sabores do Meu Ritmo',
      content_type: 'product_group',
      currency: 'BRL',
      value: 17.9,
    }))
  })

  it('registra o início do checkout para a edição escolhida', () => {
    const fbq = vi.fn()
    vi.stubGlobal('window', { fbq })

    trackMetaEbookCheckout('vata')

    expect(fbq).toHaveBeenCalledWith('track', 'InitiateCheckout', expect.objectContaining({
      content_ids: ['sabores-meu-ritmo-vata'],
      currency: 'BRL',
      value: 17.9,
    }))
  })
})
