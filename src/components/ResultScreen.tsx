import { Clock3, Headphones, Info, NotebookPen, RotateCcw, Users, Waves } from 'lucide-react'
import type { Dosha, QuizResult } from '../types'
import { Brand } from './Brand'
import { RitmoEssencialDrawing } from './Illustrations'

type ResultScreenProps = {
  firstName: string
  result: QuizResult
  saveWarning: boolean
  onRestart: () => void
}

const doshaName: Record<Dosha, string> = {
  vata: 'Vata',
  pitta: 'Pitta',
  kapha: 'Kapha',
}

const doshaEssence: Record<Dosha, string> = {
  vata: 'leveza',
  pitta: 'força',
  kapha: 'estabilidade',
}

const resultContent: Record<Dosha, { support: string; insights: string[]; ritual: string }> = {
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

const productUrl = import.meta.env.VITE_PRODUCT_CTA_URL || 'https://www.instagram.com/larissaborgepetian/'

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
              <circle
                cx="65"
                cy="65"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
              />
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

export function ResultScreen({ firstName, result, saveWarning, onRestart }: ResultScreenProps) {
  const content = resultContent[result.primary]
  const secondaryText = result.secondary
    ? ` com traços de ${doshaName[result.secondary]}`
    : ''

  const headline = result.isBalanced
    ? 'Seu ritmo reúne as três forças'
    : `Seu ritmo tem a ${doshaEssence[result.primary]} de ${doshaName[result.primary]}`

  return (
    <div className="result-screen">
      <header className="app-header shell result-header">
        <Brand />
        <button className="text-button restart-button" type="button" onClick={onRestart}>
          <RotateCcw aria-hidden="true" size={18} /> Refazer
        </button>
      </header>

      <section className="result-hero shell">
        <div className="result-heading">
          {firstName && <p className="personal-greeting">{firstName}, esta é a sua leitura.</p>}
          <h1>{headline}{secondaryText}</h1>
          <p>{result.isBalanced ? 'Movimento, intensidade e estabilidade aparecem de forma próxima no seu jeito de viver.' : content.support}</p>
        </div>
        <ScoreRings result={result} />
      </section>

      <section className="insights shell">
        <h2>O que isso pode revelar</h2>
        <div className="insight-list">
          {content.insights.map((insight, index) => (
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
            <p>{content.ritual}</p>
          </div>
        </div>

        <p className="education-note"><Info aria-hidden="true" size={17} /> Esta é uma leitura educativa de autoconhecimento, não um diagnóstico.</p>
        {saveWarning && (
          <p className="save-warning" role="status">
            Seu resultado foi aberto, mas não conseguimos registrar seus dados agora. Tente novamente mais tarde para entrar na lista da Larissa.
          </p>
        )}
      </section>

      <section className="product-section">
        <div className="shell product-grid">
          <div className="product-copy">
            <h2>Conhecer o seu ritmo é o começo. Sustentá-lo é a transformação.</h2>
            <p>No Ritmo Essencial, Larissa guia você por 21 dias para observar, ajustar e sustentar uma rotina ayurvédica possível — com 10 a 15 minutos por dia.</p>
          </div>
          <div className="product-drawing" role="img" aria-label="Ilustração do caderno Ritmo Essencial e uma xícara de chá">
            <RitmoEssencialDrawing />
          </div>
          <div className="product-proof" aria-label="O que está incluído">
            <span><Headphones aria-hidden="true" /> 21 áudios</span>
            <span><Waves aria-hidden="true" /> 3 práticas de yoga</span>
            <span><NotebookPen aria-hidden="true" /> Caderno Meu Ritmo</span>
            <span><Users aria-hidden="true" /> Encontro fechado</span>
          </div>
          <div className="product-action">
            <p>Turma fundadora <span>•</span> <strong>R$197</strong></p>
            <a className="product-button" href={productUrl}>Quero voltar ao meu ritmo</a>
            <a className="product-link" href={productUrl}>Conhecer o programa</a>
            <small>Acesso por 12 meses + canal de suporte</small>
          </div>
        </div>
      </section>
    </div>
  )
}
