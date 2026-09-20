import type { Dosha } from '../types'

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
  'Como criar uma rotina alimentar mais estável nos dias de mente acelerada.',
  '10 receitas com ingredientes, modo de preparo e substituições.',
  'Sugestões de refeições para sete dias.',
  'Orientações para organizar o preparo semanal.',
  'Lista de compras.',
  'Diário de observação.',
  'Cuidados e orientações de segurança.',
] as const

export const ebookEducationNote = 'Eu preparei este conteúdo como um guia educativo inspirado no Ayurveda. Ele não trata ansiedade nem substitui acompanhamento psicológico, médico ou nutricional.'

export const ebookOffers: Record<Dosha, EbookOffer> = {
  vata: {
    id: 'vata',
    productName: 'Sabores do Meu Ritmo',
    editionName: 'Edição Vata',
    identification: 'Para os dias em que sua mente não desliga',
    title: 'Quando a ansiedade acelera tudo, sua alimentação pode virar um ponto de apoio.',
    presentation: [
      'Você acorda já pensando em mil coisas, passa horas sem comer ou termina o dia procurando na comida o alívio que não encontrou? Eu reuni 10 receitas e sugestões de refeições para sete dias para ajudar você a criar mais regularidade justamente nos dias em que a ansiedade ganha espaço.',
      'Não é mais uma dieta que cobra perfeição. São preparos simples para transformar suas refeições em pausas de cuidado, com menos culpa, mais previsibilidade e uma rotina que realmente cabe na sua vida.',
    ],
    highlights: [
      'Receitas acolhedoras com ingredientes acessíveis.',
      'Sugestões para não passar o dia no improviso alimentar.',
      'Trocas para adaptar os preparos à sua vida real.',
      'Um diário para observar fome, conforto e rotina.',
    ],
    imageSrc: '/sabores-meu-ritmo-vata.png',
    imageAlt: 'Capa do e-book Sabores do Meu Ritmo, Edição Vata',
    amountInCents: 1790,
    currency: 'BRL',
    buttonLabel: 'Quero uma rotina alimentar mais calma',
    checkoutUrl: 'https://pay.hotmart.com/C107554497T',
  },
  pitta: {
    id: 'pitta',
    productName: 'Sabores do Meu Ritmo',
    editionName: 'Edição Pitta',
    identification: 'Para os dias em que sua mente não desliga',
    title: 'Quando a ansiedade acelera tudo, sua alimentação pode virar um ponto de apoio.',
    presentation: [
      'Você acorda já pensando em mil coisas, passa horas sem comer ou termina o dia procurando na comida o alívio que não encontrou? Eu reuni 10 receitas e sugestões de refeições para sete dias para ajudar você a criar mais regularidade justamente nos dias em que a ansiedade ganha espaço.',
      'Não é mais uma dieta que cobra perfeição. São preparos simples para transformar suas refeições em pausas de cuidado, com menos culpa, mais previsibilidade e uma rotina que realmente cabe na sua vida.',
    ],
    highlights: [
      'Receitas aromáticas com ingredientes acessíveis.',
      'Sugestões para não passar o dia no improviso alimentar.',
      'Organização do preparo e alternativas de ingredientes.',
      'Um diário para observar sua experiência ao longo da semana.',
    ],
    imageSrc: '/sabores-meu-ritmo-pitta.png',
    imageAlt: 'Capa do e-book Sabores do Meu Ritmo, Edição Pitta',
    amountInCents: 1790,
    currency: 'BRL',
    buttonLabel: 'Quero uma rotina alimentar mais calma',
    checkoutUrl: 'https://pay.hotmart.com/J107554459R',
  },
  kapha: {
    id: 'kapha',
    productName: 'Sabores do Meu Ritmo',
    editionName: 'Edição Kapha',
    identification: 'Para os dias em que sua mente não desliga',
    title: 'Quando a ansiedade acelera tudo, sua alimentação pode virar um ponto de apoio.',
    presentation: [
      'Você acorda já pensando em mil coisas, passa horas sem comer ou termina o dia procurando na comida o alívio que não encontrou? Eu reuni 10 receitas e sugestões de refeições para sete dias para ajudar você a criar mais regularidade justamente nos dias em que a ansiedade ganha espaço.',
      'Não é mais uma dieta que cobra perfeição. São preparos simples para transformar suas refeições em pausas de cuidado, com menos culpa, mais previsibilidade e uma rotina que realmente cabe na sua vida.',
    ],
    highlights: [
      'Receitas com ingredientes acessíveis.',
      'Sugestões para não passar o dia no improviso alimentar.',
      'Trocas de ingredientes e organização da cozinha.',
      'Um diário para observar satisfação, conforto e disposição.',
    ],
    imageSrc: '/sabores-meu-ritmo-kapha.png',
    imageAlt: 'Capa do e-book Sabores do Meu Ritmo, Edição Kapha',
    amountInCents: 1790,
    currency: 'BRL',
    buttonLabel: 'Quero uma rotina alimentar mais calma',
    checkoutUrl: 'https://pay.hotmart.com/A107554541M',
  },
}

export type EbookOfferSelection = {
  availableDoshas: Dosha[]
  defaultDosha: Dosha | null
  requiresChoice: boolean
}

export function getEbookOfferSelection(): EbookOfferSelection {
  return {
    availableDoshas: [...ebookDoshaOrder],
    defaultDosha: 'vata',
    requiresChoice: true,
  }
}

export function formatEbookPrice(amountInCents: number, currency: EbookOffer['currency']) {
  const amount = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100)

  return currency === 'BRL' ? `R$${amount}` : amount
}
