import { ArrowUpRight, Camera, Clock3, Info, RotateCcw } from 'lucide-react'
import type { Dosha, QuizResult } from '../types'
import { doshaName, getDoshaResultReading } from '../lib/result-content'
import { EbookOfferSection } from './EbookOfferSection'
import { FooterLogo } from './FooterLogo'

type ResultScreenProps = {
  firstName: string
  result: QuizResult
  hasValidResult: boolean
  saveWarning: boolean
  onRestart: () => void
}

function ScoreRings({ result }: { result: QuizResult }) {
  const rings: { dosha: Dosha; radius: number; color: string }[] = [
    { dosha: 'pitta', radius: 52, color: '#bf5932' },
    { dosha: 'vata', radius: 39, color: '#cf9c59' },
    { dosha: 'kapha', radius: 26, color: '#889784' },
  ]

  return (
    <div className="score-visual" aria-label="Distribuição do resultado">
      <svg viewBox="0 0 130 130" role="img" aria-hidden="true">
        {rings.map(({ dosha, radius, color }) => {
          const circumference = 2 * Math.PI * radius
          const value = result.percentages[dosha]
          return (
            <g key={dosha} transform="rotate(-90 65 65)">
              <circle cx="65" cy="65" r={radius} className="ring-track" />
              <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(value / 100) * circumference} ${circumference}`} />
            </g>
          )
        })}
      </svg>
      <div className="score-legend">
        {(['pitta', 'vata', 'kapha'] as Dosha[]).map((dosha) => (
          <div key={dosha}>
            <span className={`legend-dot ${dosha}`} aria-hidden="true" />
            <span>{doshaName[dosha]}</span>
            <strong>{result.percentages[dosha]}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResultScreen({ firstName, result, hasValidResult, saveWarning, onRestart }: ResultScreenProps) {
  const reading = getDoshaResultReading(result)

  return (
    <div className="result-screen">
      <header className="app-header app-header-actions shell result-header">
        <button className="text-button restart-button" type="button" onClick={onRestart}>
          <RotateCcw aria-hidden="true" size={18} /> Refazer
        </button>
      </header>

      <section className="result-hero shell">
        <div className="result-heading">
          {firstName && <p className="personal-greeting">{firstName}, esta é a sua leitura.</p>}
          <h1>{reading.headline}{reading.secondaryText}</h1>
          <p>{reading.summary}</p>
        </div>
        <ScoreRings result={result} />
      </section>

      <section className="insights shell">
        <h2>O que isso pode revelar</h2>
        <div className="insight-list">
          {reading.content.insights.map((insight, index) => (
            <div className="insight-row" key={insight}>
              <span aria-hidden="true">0{index + 1}</span>
              <p>{insight}</p>
            </div>
          ))}
        </div>

        <div className="ritual-panel">
          <Clock3 aria-hidden="true" size={40} strokeWidth={1.4} />
          <div>
            <h2>Seu primeiro ritual</h2>
            <p>{reading.content.ritual}</p>
          </div>
        </div>

        <p className="education-note"><Info aria-hidden="true" size={17} /> Esta é uma leitura educativa de autoconhecimento, não um diagnóstico.</p>
        {saveWarning && <p className="save-warning" role="status">Seu resultado foi aberto, mas não conseguimos registrar seus dados agora. Tente novamente mais tarde para entrar na lista da Larissa.</p>}
      </section>

      <EbookOfferSection result={result} hasValidResult={hasValidResult} />
      <section className="result-authority" aria-label="Conheça Larissa Petian">
        <div className="shell result-authority-inner">
          <img src="/post-biografia.png" alt="Larissa Petian, professora de Hatha e Vinyasa Yoga e terapeuta Ayurveda" />
          <div>
            <p className="authority-kicker">Seu cuidado pode continuar</p>
            <h2>Conte com a Larissa nessa jornada.</h2>
            <p>Receba inspirações, práticas possíveis e conversas sobre Ayurveda para tornar o cuidado com você uma parte real da sua rotina.</p>
            <a className="instagram-result-link" href="https://www.instagram.com/larissapetian/" target="_blank" rel="noreferrer"><Camera aria-hidden="true" size={19} /> Seguir @larissapetian <ArrowUpRight aria-hidden="true" size={17} /></a>
          </div>
        </div>
      </section>
      <FooterLogo />
    </div>
  )
}
