import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { QuizQuestion } from '../types'
import { Brand } from './Brand'

type QuizScreenProps = {
  question: QuizQuestion
  questionIndex: number
  totalQuestions: number
  selectedOptionId?: string
  onAnswer: (questionId: string, optionId: string) => void
  onAdvance: () => void
  onBack: () => void
  onExit: () => void
}

export function QuizScreen({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onAnswer,
  onAdvance,
  onBack,
  onExit,
}: QuizScreenProps) {
  const [pendingSelection, setPendingSelection] = useState<string | undefined>()
  const advanceTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
    }
  }, [])

  function choose(optionId: string) {
    if (pendingSelection) return
    setPendingSelection(optionId)
    onAnswer(question.id, optionId)
    advanceTimer.current = window.setTimeout(onAdvance, 260)
  }

  const visibleSelection = pendingSelection ?? selectedOptionId
  const progress = ((questionIndex + 1) / totalQuestions) * 100

  return (
    <div className="app-screen quiz-screen">
      <header className="app-header shell">
        <Brand />
        <button className="text-button" type="button" onClick={onExit}>Sair</button>
      </header>

      <div className="quiz-progress shell">
        <span>{questionIndex + 1} de {totalQuestions}</span>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="question-shell shell" key={question.id}>
        <p className="question-category">{question.category}</p>
        <h1>{question.prompt}</h1>
        <p className="question-helper">Escolha a opção que mais se parece com o seu jeito habitual.</p>

        <div className="answer-list" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option) => {
            const selected = option.id === visibleSelection
            return (
              <button
                className={`answer-option${selected ? ' is-selected' : ''}`}
                type="button"
                role="radio"
                aria-checked={selected}
                key={option.id}
                onClick={() => choose(option.id)}
              >
                <span>{option.label}</span>
                <ChevronRight aria-hidden="true" size={22} strokeWidth={1.8} />
              </button>
            )
          })}
        </div>

        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={22} strokeWidth={1.7} />
          Voltar
        </button>
      </section>
    </div>
  )
}
