import { quizQuestions } from '../data/questions.js'
import type { Dosha, DoshaScores, QuizAnswers, QuizResult } from '../types.js'

const doshaOrder: Dosha[] = ['vata', 'pitta', 'kapha']

export function scoreQuiz(answers: QuizAnswers): QuizResult {
  const scores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 }

  quizQuestions.forEach((question) => {
    const answerId = answers[question.id]
    const selected = question.options.find((option) => option.id === answerId)
    if (selected) scores[selected.dosha] += 1
  })

  const total = Object.values(scores).reduce((sum, value) => sum + value, 0)
  const ranked = doshaOrder
    .map((dosha) => ({ dosha, score: scores[dosha] }))
    .sort((a, b) => b.score - a.score || doshaOrder.indexOf(a.dosha) - doshaOrder.indexOf(b.dosha))

  const isBalanced = ranked[0].score === ranked[2].score && total > 0
  const secondary = !isBalanced && ranked[0].score - ranked[1].score <= 1 ? ranked[1].dosha : null
  const percentages = doshaOrder.reduce<DoshaScores>((result, dosha) => {
    result[dosha] = total === 0 ? 0 : Math.round((scores[dosha] / total) * 100)
    return result
  }, { vata: 0, pitta: 0, kapha: 0 })

  return {
    primary: ranked[0].dosha,
    secondary,
    isBalanced,
    scores,
    percentages,
  }
}

export function hasCompleteAnswers(answers: QuizAnswers) {
  return quizQuestions.every((question) =>
    question.options.some((option) => option.id === answers[question.id]),
  )
}
