import type { Dosha, QuizResult } from '../types'

export const consultationWhatsAppNumber = '5517991303920'

export const consultationConcernLabels: Record<string, string> = {
  ansiedade: 'ansiedade e mente acelerada',
  alimentacao: 'alimentação e compulsão',
  corpo: 'relação com o corpo',
  rotina: 'rotina, energia e constância',
  outro: 'outro ponto importante',
}

const doshaLabels: Record<Dosha, string> = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }

export function consultationWhatsAppUrl(firstName: string, concern: string, result: QuizResult) {
  const message = [
    `Olá, Larissa. Eu sou ${firstName} e gostaria de agendar minha consulta online.`,
    `Preenchi a avaliação prévia e quero cuidar principalmente de ${consultationConcernLabels[concern] ?? 'minha rotina'}.`,
    `Meu perfil predominante foi ${doshaLabels[result.primary]}.`,
    'Gostaria de saber os próximos horários disponíveis.',
  ].join('\n')
  return `https://wa.me/${consultationWhatsAppNumber}?text=${encodeURIComponent(message)}`
}
