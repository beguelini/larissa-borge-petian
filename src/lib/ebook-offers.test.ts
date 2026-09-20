import { describe, expect, it } from 'vitest'
import { ebookOffers, formatEbookPrice, getEbookOfferSelection } from './ebook-offers'

describe('e-book offers', () => {
  it('mantém cada edição, capa, preço e checkout no mesmo objeto de configuração', () => {
    expect(ebookOffers.vata).toMatchObject({
      editionName: 'Edição Vata',
      imageSrc: '/sabores-meu-ritmo-vata.png',
      amountInCents: 1790,
      currency: 'BRL',
      checkoutUrl: 'https://pay.hotmart.com/C107554497T',
    })
    expect(ebookOffers.pitta).toMatchObject({
      editionName: 'Edição Pitta',
      imageSrc: '/sabores-meu-ritmo-pitta.png',
      amountInCents: 1790,
      currency: 'BRL',
      checkoutUrl: 'https://pay.hotmart.com/J107554459R',
    })
    expect(ebookOffers.kapha).toMatchObject({
      editionName: 'Edição Kapha',
      imageSrc: '/sabores-meu-ritmo-kapha.png',
      amountInCents: 1790,
      currency: 'BRL',
      checkoutUrl: 'https://pay.hotmart.com/A107554541M',
    })
  })

  it('oferece as três edições independentemente do resultado do dosha', () => {
    expect(getEbookOfferSelection()).toEqual({
      availableDoshas: ['vata', 'pitta', 'kapha'],
      defaultDosha: 'vata',
      requiresChoice: true,
    })
  })

  it('posiciona cada edição para mente acelerada, sem prometer tratar ansiedade', () => {
    for (const offer of Object.values(ebookOffers)) {
      expect(offer.title).toContain('ansiedade')
      expect(offer.presentation.join(' ')).toContain('Não é mais uma dieta')
      expect(offer.buttonLabel).toBe('Quero uma rotina alimentar mais calma')
    }
  })

  it('formata o valor promocional das três edições como R$17,90', () => {
    for (const offer of Object.values(ebookOffers)) {
      expect(formatEbookPrice(offer.amountInCents, offer.currency)).toBe('R$17,90')
    }
  })
})
