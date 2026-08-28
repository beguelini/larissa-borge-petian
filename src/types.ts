export type Dosha = 'vata' | 'pitta' | 'kapha'

export type QuizOption = {
  id: string
  label: string
  dosha: Dosha
}

export type QuizQuestion = {
  id: string
  category: string
  prompt: string
  options: [QuizOption, QuizOption, QuizOption]
}

export type QuizAnswers = Record<string, string>

export type DoshaScores = Record<Dosha, number>

export type QuizResult = {
  primary: Dosha
  secondary: Dosha | null
  isBalanced: boolean
  scores: DoshaScores
  percentages: DoshaScores
}

export type LeadFormData = {
  firstName: string
  email: string
  privacyConsent: boolean
  marketingConsent: boolean
  website: string
}
