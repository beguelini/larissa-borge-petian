import { describe, expect, it } from 'vitest'
import { quizQuestions } from '../data/questions'
import { hasCompleteAnswers, scoreQuiz } from './results'

function answersFor(dosha: 'vata' | 'pitta' | 'kapha') {
  return Object.fromEntries(
    quizQuestions.map((question) => [
      question.id,
      question.options.find((option) => option.dosha === dosha)?.id ?? '',
    ]),
  )
}

describe('scoreQuiz', () => {
  it.each(['vata', 'pitta', 'kapha'] as const)('identifica %s como predominante', (dosha) => {
    const answers = answersFor(dosha)
    const result = scoreQuiz(answers)

    expect(result.primary).toBe(dosha)
    expect(result.percentages[dosha]).toBe(100)
    expect(result.secondary).toBeNull()
    expect(hasCompleteAnswers(answers)).toBe(true)
  })

  it('ignora respostas adulteradas e detecta questionário incompleto', () => {
    const answers = { [quizQuestions[0].id]: 'opcao-inexistente' }

    expect(scoreQuiz(answers).scores).toEqual({ vata: 0, pitta: 0, kapha: 0 })
    expect(hasCompleteAnswers(answers)).toBe(false)
  })
})
