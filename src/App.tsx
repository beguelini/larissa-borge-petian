import { useEffect, useMemo, useState } from 'react'
import { CaptureScreen } from './components/CaptureScreen'
import { LandingScreen } from './components/LandingScreen'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { QuizScreen } from './components/QuizScreen'
import { ResultScreen } from './components/ResultScreen'
import { quizQuestions } from './data/questions'
import { scoreQuiz } from './lib/results'
import type { LeadFormData, QuizAnswers } from './types'

type Screen = 'landing' | 'quiz' | 'capture' | 'result'

const progressKey = 'larissa-dosha-progress-v1'

function readProgress(): { answers: QuizAnswers; currentQuestion: number } {
  try {
    const saved = window.localStorage.getItem(progressKey)
    if (!saved) return { answers: {}, currentQuestion: 0 }
    const parsed = JSON.parse(saved) as { answers?: QuizAnswers; currentQuestion?: number }
    return {
      answers: parsed.answers ?? {},
      currentQuestion: Math.min(parsed.currentQuestion ?? 0, quizQuestions.length - 1),
    }
  } catch {
    return { answers: {}, currentQuestion: 0 }
  }
}

export default function App() {
  const savedProgress = useMemo(() => readProgress(), [])
  const [screen, setScreen] = useState<Screen>('landing')
  const [answers, setAnswers] = useState<QuizAnswers>(savedProgress.answers)
  const [currentQuestion, setCurrentQuestion] = useState(savedProgress.currentQuestion)
  const [firstName, setFirstName] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [saveWarning, setSaveWarning] = useState(false)

  const result = useMemo(() => scoreQuiz(answers), [answers])

  useEffect(() => {
    window.localStorage.setItem(progressKey, JSON.stringify({ answers, currentQuestion }))
  }, [answers, currentQuestion])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [screen])

  function startQuiz() {
    setScreen('quiz')
  }

  function answerQuestion(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }))
  }

  function advanceQuestion() {
    if (currentQuestion === quizQuestions.length - 1) {
      setScreen('capture')
      return
    }
    setCurrentQuestion((index) => index + 1)
  }

  function goBack() {
    if (currentQuestion === 0) {
      setScreen('landing')
      return
    }
    setCurrentQuestion((index) => index - 1)
  }

  async function submitLead(form: LeadFormData) {
    const params = new URLSearchParams(window.location.search)
    const payload = {
      ...form,
      answers,
      source: {
        path: window.location.pathname,
        referrer: document.referrer || null,
        utmSource: params.get('utm_source'),
        utmMedium: params.get('utm_medium'),
        utmCampaign: params.get('utm_campaign'),
      },
    }

    setFirstName(form.firstName)
    setSaveWarning(false)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Falha ao salvar o resultado')
    } catch {
      setSaveWarning(true)
    }

    window.localStorage.removeItem(progressKey)
    setScreen('result')
  }

  function restart() {
    setAnswers({})
    setCurrentQuestion(0)
    setFirstName('')
    setSaveWarning(false)
    setScreen('landing')
  }

  return (
    <main>
      {screen === 'landing' && <LandingScreen onStart={startQuiz} />}
      {screen === 'quiz' && (
        <QuizScreen
          key={quizQuestions[currentQuestion].id}
          question={quizQuestions[currentQuestion]}
          questionIndex={currentQuestion}
          totalQuestions={quizQuestions.length}
          selectedOptionId={answers[quizQuestions[currentQuestion].id]}
          onAnswer={answerQuestion}
          onAdvance={advanceQuestion}
          onBack={goBack}
          onExit={() => setScreen('landing')}
        />
      )}
      {screen === 'capture' && (
        <CaptureScreen
          onSubmit={submitLead}
          onBack={() => setScreen('quiz')}
          onOpenPrivacy={() => setShowPrivacy(true)}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          firstName={firstName}
          result={result}
          saveWarning={saveWarning}
          onRestart={restart}
        />
      )}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </main>
  )
}
