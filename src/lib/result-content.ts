import type { Dosha, QuizResult } from '../types'

export const doshaName: Record<Dosha, string> = {
  vata: 'Vata',
  pitta: 'Pitta',
  kapha: 'Kapha',
}

const doshaEssence: Record<Dosha, string> = {
  vata: 'leveza',
  pitta: 'força',
  kapha: 'estabilidade',
}

export const prelaunchWhatsAppUrl = 'https://chat.whatsapp.com/HvofSYG7Ysg5w3uvLuup7W?mode=gi_t'

export const resultContent: Record<Dosha, { support: string; insights: string[]; ritual: string }> = {
  vata: {
    support: 'Criatividade, movimento e sensibilidade aparecem com força no seu jeito de viver.',
    insights: [
      'Você tende a perceber possibilidades e responder com rapidez.',
      'O excesso de estímulos pode espalhar sua energia ao longo do dia.',
      'Regularidade e acolhimento ajudam a devolver presença ao seu ritmo.',
    ],
    ritual: 'Antes de começar o dia, aqueça as mãos, apoie-as sobre o peito e faça 6 respirações longas. Depois, escolha apenas uma prioridade.',
  },
  pitta: {
    support: 'Clareza, intensidade e direção aparecem com força no seu jeito de viver.',
    insights: [
      'Você tende a agir com foco e rapidez.',
      'A exigência pode crescer quando algo foge do plano.',
      'Pausas simples ajudam a devolver espaço ao seu dia.',
    ],
    ritual: 'Antes da próxima tarefa, pare por 3 minutos. Solte os ombros, respire devagar e escolha uma única prioridade.',
  },
  kapha: {
    support: 'Constância, acolhimento e resistência aparecem com força no seu jeito de viver.',
    insights: [
      'Você tende a construir vínculos e sustentar o que começa.',
      'Mudanças bruscas podem despertar resistência ou sensação de peso.',
      'Movimento gentil ajuda a renovar sua energia sem romper seu ritmo.',
    ],
    ritual: 'Abra a janela, coloque uma música leve e mova o corpo por 3 minutos. Depois, comece pela menor ação que tira seu dia da inércia.',
  },
}

export function getDoshaResultReading(result: Pick<QuizResult, 'primary' | 'secondary' | 'isBalanced'>) {
  const content = resultContent[result.primary]
  const secondaryText = result.secondary ? ` com traços de ${doshaName[result.secondary]}` : ''
  const headline = result.isBalanced
    ? 'Seu ritmo reúne as três forças'
    : `Seu ritmo tem a ${doshaEssence[result.primary]} de ${doshaName[result.primary]}`
  const summary = result.isBalanced
    ? 'Movimento, intensidade e estabilidade aparecem de forma próxima no seu jeito de viver.'
    : content.support

  return { content, headline, secondaryText, summary }
}
