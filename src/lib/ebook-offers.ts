import type { Dosha, DoshaScores, QuizResult } from '../types'

export type EbookOffer = {
  id: Dosha
  productName: string
  editionName: string
  identification: string
  title: string
  presentation: readonly string[]
  highlights: readonly string[]
  imageSrc: string
  imageAlt: string
  amountInCents: number
  currency: 'BRL'
  buttonLabel: string
  checkoutUrl: string
}

const ebookDoshaOrder: readonly Dosha[] = ['vata', 'pitta', 'kapha']

export const ebookIncludedContent = [
  'Introdução ao dosha na tradição ayurvédica.',
  '10 receitas com ingredientes, modo de preparo e substituições.',
  'Sugestões de refeições para sete dias.',
  'Orientações para organizar o preparo semanal.',
  'Lista de compras.',
  'Diário de observação.',
  'Cuidados e orientações de segurança.',
] as const

export const ebookEducationNote = 'Eu preparei este conteúdo como um guia educativo inspirado no Ayurveda. O questionário não é um diagnóstico, e o e-book não substitui acompanhamento médico ou nutricional.'

export const ebookOffers: Record<Dosha, EbookOffer> = {
  vata: {
    id: 'vata',
    productName: 'Sabores do Meu Ritmo',
    editionName: 'Edição Vata',
    identification: 'Seu próximo passo com Vata',
    title: 'Leve esse conhecimento para uma cozinha mais acolhedora.',
    presentation: [
      'Eu reuni 10 receitas e sugestões de refeições para sete dias para ajudar você a experimentar uma alimentação inspirada nas qualidades tradicionalmente associadas ao cuidado de Vata.',
      'Você vai encontrar preparos mornos, texturas macias e combinações simples, com orientações para organizar a cozinha e observar o que funciona na sua rotina.',
    ],
    highlights: [
      'Receitas acolhedoras com ingredientes acessíveis.',
      'Sugestões para organizar suas refeições ao longo da semana.',
      'Trocas para adaptar os preparos às suas preferências.',
      'Um diário para observar fome, conforto e rotina.',
    ],
    imageSrc: '/sabores-meu-ritmo-vata.png',
    imageAlt: 'Capa do e-book Sabores do Meu Ritmo, Edição Vata',
    amountInCents: 4700,
    currency: 'BRL',
    buttonLabel: 'Quero meu e-book Vata',
    checkoutUrl: 'https://pay.hotmart.com/C107554497T',
  },
  pitta: {
    id: 'pitta',
    productName: 'Sabores do Meu Ritmo',
    editionName: 'Edição Pitta',
    identification: 'Seu próximo passo com Pitta',
    title: 'Experimente uma cozinha mais suave, saborosa e possível.',
    presentation: [
      'Eu reuni 10 receitas e sugestões de refeições para sete dias para você explorar sabores suaves e preparações inspiradas nas qualidades tradicionalmente associadas ao cuidado de Pitta.',
      'Minha proposta é ajudar você a variar os temperos, organizar as refeições e observar sua experiência com a comida, sem transformar o autocuidado em mais uma cobrança.',
    ],
    highlights: [
      'Receitas aromáticas com temperos suaves.',
      'Sugestões para variar sabores e combinações.',
      'Organização do preparo e alternativas de ingredientes.',
      'Um diário para observar sua experiência ao longo da semana.',
    ],
    imageSrc: '/sabores-meu-ritmo-pitta.png',
    imageAlt: 'Capa do e-book Sabores do Meu Ritmo, Edição Pitta',
    amountInCents: 4700,
    currency: 'BRL',
    buttonLabel: 'Quero meu e-book Pitta',
    checkoutUrl: 'https://pay.hotmart.com/J107554459R',
  },
  kapha: {
    id: 'kapha',
    productName: 'Sabores do Meu Ritmo',
    editionName: 'Edição Kapha',
    identification: 'Seu próximo passo com Kapha',
    title: 'Traga mais variedade e sabor para a sua rotina.',
    presentation: [
      'Eu selecionei 10 receitas e sugestões de refeições para sete dias para você conhecer preparações quentes, aromáticas e variadas, inspiradas nas qualidades tradicionalmente associadas ao cuidado de Kapha.',
      'Você vai encontrar ideias para experimentar novos preparos e organizar a semana, respeitando sua fome e suas preferências.',
    ],
    highlights: [
      'Receitas com legumes, folhas e especiarias.',
      'Diferentes preparos para sair da repetição.',
      'Trocas de ingredientes e organização da cozinha.',
      'Um diário para observar satisfação, conforto e disposição.',
    ],
    imageSrc: '/sabores-meu-ritmo-kapha.png',
    imageAlt: 'Capa do e-book Sabores do Meu Ritmo, Edição Kapha',
    amountInCents: 4700,
    currency: 'BRL',
    buttonLabel: 'Quero meu e-book Kapha',
    checkoutUrl: 'https://pay.hotmart.com/A107554541M',
  },
}

export type EbookOfferSelection = {
  availableDoshas: Dosha[]
  defaultDosha: Dosha | null
  requiresChoice: boolean
}

function highestScoringDoshas(scores: DoshaScores): Dosha[] {
  const highestScore = Math.max(...ebookDoshaOrder.map((dosha) => scores[dosha]))
  if (highestScore <= 0) return []

  return ebookDoshaOrder.filter((dosha) => scores[dosha] === highestScore)
}

export function getEbookOfferSelection(
  result: Pick<QuizResult, 'primary' | 'scores'>,
  hasValidResult: boolean,
): EbookOfferSelection {
  if (!hasValidResult) {
    return { availableDoshas: [], defaultDosha: null, requiresChoice: false }
  }

  const availableDoshas = highestScoringDoshas(result.scores)
  if (!availableDoshas.includes(result.primary)) {
    return { availableDoshas: [], defaultDosha: null, requiresChoice: false }
  }

  const requiresChoice = availableDoshas.length > 1

  return {
    availableDoshas,
    defaultDosha: requiresChoice ? null : availableDoshas[0] ?? null,
    requiresChoice,
  }
}

export function formatEbookPrice(amountInCents: number, currency: EbookOffer['currency']) {
  const amount = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100)

  return currency === 'BRL' ? `R$${amount}` : amount
}
