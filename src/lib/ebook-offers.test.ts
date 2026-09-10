import { describe, expect, it } from 'vitest'
import type { QuizResult } from '../types'
import { ebookOffers, formatEbookPrice, getEbookOfferSelection } from './ebook-offers'

function result(primary: QuizResult['primary'], scores: QuizResult['scores']): Pick<QuizResult, 'primary' | 'scores'> {
  return { primary, scores }
}

describe('e-book offers', () => {
  it('mantém cada edição, capa, preço e checkout no mesmo objeto de configuração', () => {
    expect(ebookOffers.vata).toMatchObject({
      editionName: 'Edição Vata',
      imageSrc: '/sabores-meu-ritmo-vata.png',
      amountInCents: 4700,
      currency: 'BRL',
      checkoutUrl: 'https://pay.hotmart.com/C107554497T',
    })
    expect(ebookOffers.pitta).toMatchObject({
      editionName: 'Edição Pitta',
      imageSrc: '/sabores-meu-ritmo-pitta.png',
      amountInCents: 4700,
      currency: 'BRL',
      checkoutUrl: 'https://pay.hotmart.com/J107554459R',
    })
    expect(ebookOffers.kapha).toMatchObject({
      editionName: 'Edição Kapha',
      imageSrc: '/sabores-meu-ritmo-kapha.png',
      amountInCents: 4700,
      currency: 'BRL',
      checkoutUrl: 'https://pay.hotmart.com/A107554541M',
    })
  })

  it.each([
    ['vata', { vata: 15, pitta: 0, kapha: 0 }],
    ['pitta', { vata: 0, pitta: 15, kapha: 0 }],
    ['kapha', { vata: 0, pitta: 0, kapha: 15 }],
  ] as const)('seleciona apenas %s quando existe uma predominância definida', (dosha, scores) => {
    expect(getEbookOfferSelection(result(dosha, scores), true)).toEqual({
      availableDoshas: [dosha],
      defaultDosha: dosha,
      requiresChoice: false,
    })
  })

  it('mantém a oferta da predominância real quando há um perfil secundário próximo', () => {
    expect(getEbookOfferSelection(result('vata', { vata: 6, pitta: 5, kapha: 4 }), true)).toMatchObject({
      availableDoshas: ['vata'],
      defaultDosha: 'vata',
      requiresChoice: false,
    })
  })

  it('não pré-seleciona uma edição em empate de dois doshas', () => {
    expect(getEbookOfferSelection(result('vata', { vata: 6, pitta: 6, kapha: 3 }), true)).toEqual({
      availableDoshas: ['vata', 'pitta'],
      defaultDosha: null,
      requiresChoice: true,
    })
  })

  it('não pré-seleciona uma edição em resultado equilibrado', () => {
    expect(getEbookOfferSelection(result('vata', { vata: 5, pitta: 5, kapha: 5 }), true)).toEqual({
      availableDoshas: ['vata', 'pitta', 'kapha'],
      defaultDosha: null,
      requiresChoice: true,
    })
  })

  it('não cria recomendação personalizada para um resultado inválido', () => {
    expect(getEbookOfferSelection(result('vata', { vata: 0, pitta: 0, kapha: 0 }), true)).toEqual({
      availableDoshas: [],
      defaultDosha: null,
      requiresChoice: false,
    })
    expect(getEbookOfferSelection(result('vata', { vata: 15, pitta: 0, kapha: 0 }), false)).toEqual({
      availableDoshas: [],
      defaultDosha: null,
      requiresChoice: false,
    })
    expect(getEbookOfferSelection(result('pitta', { vata: 15, pitta: 0, kapha: 0 }), true)).toEqual({
      availableDoshas: [],
      defaultDosha: null,
      requiresChoice: false,
    })
  })

  it('formata o valor configurado das três edições como R$47,00', () => {
    for (const offer of Object.values(ebookOffers)) {
      expect(formatEbookPrice(offer.amountInCents, offer.currency)).toBe('R$47,00')
    }
  })
})
