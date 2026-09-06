import { BarChart3, CalendarDays, HeartHandshake, Leaf, RefreshCw, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Dosha } from '../types'
import { Brand } from './Brand'

type Analytics = {
  total: number
  today: number
  marketingConsentRate: number
  balancedCount: number
  dominantDosha: Dosha | null
  doshas: Record<Dosha, number>
  registrationsByDay: { date: string; count: number }[]
}

const doshaLabel: Record<Dosha, string> = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }
const doshaClass: Record<Dosha, string> = { vata: 'vata', pitta: 'pitta', kapha: 'kapha' }

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
    new Date(`${date}T12:00:00`),
  )
}

function emptyAnalytics(): Analytics {
  return {
    total: 0,
    today: 0,
    marketingConsentRate: 0,
    balancedCount: 0,
    dominantDosha: null,
    doshas: { vata: 0, pitta: 0, kapha: 0 },
    registrationsByDay: [],
  }
}

export function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function requestAnalytics() {
    const response = await fetch('/api/analytics')
    if (!response.ok) throw new Error('Falha ao carregar o painel')
    return response.json() as Promise<Analytics>
  }

  function loadAnalytics() {
    setLoading(true)
    setError('')
    void requestAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Não foi possível carregar os indicadores agora. Tente atualizar novamente.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void requestAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Não foi possível carregar os indicadores agora. Tente atualizar novamente.'))
      .finally(() => setLoading(false))
  }, [])

  const data = analytics ?? emptyAnalytics()
  const largestDoshaCount = Math.max(...Object.values(data.doshas), 1)
  const largestDayCount = Math.max(...data.registrationsByDay.map(({ count }) => count), 1)
  const totalProfiled = Object.values(data.doshas).reduce((sum, value) => sum + value, 0)
  const dominantLabel = data.dominantDosha ? doshaLabel[data.dominantDosha] : '—'
  const balancedRate = data.total ? Math.round((data.balancedCount / data.total) * 100) : 0

  const registrationPoints = useMemo(() => data.registrationsByDay.map(({ count }, index, entries) => {
    const x = entries.length === 1 ? 50 : (index / (entries.length - 1)) * 100
    const y = 100 - (count / largestDayCount) * 84 - 8
    return `${x},${y}`
  }).join(' '), [data.registrationsByDay, largestDayCount])

  return (
    <div className="analytics-screen">
      <header className="analytics-header shell">
        <Brand />
        <a className="analytics-back" href="/">Ver quiz</a>
      </header>

      <main className="analytics-shell shell">
        <div className="analytics-title-row">
          <div>
            <p className="analytics-kicker">Pré-lançamento</p>
            <h1>Painel de interesse</h1>
            <p>Leitura consolidada dos cadastros e dos perfis de dosha.</p>
          </div>
          <button className="analytics-refresh" type="button" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw aria-hidden="true" size={18} className={loading ? 'is-spinning' : ''} />
            Atualizar
          </button>
        </div>

        {error ? (
          <div className="analytics-error" role="alert">{error}</div>
        ) : (
          <>
            <section className="metric-grid" aria-label="Indicadores dos cadastros">
              <Metric icon={<Users />} label="Cadastros" value={data.total} detail="Total registrado" />
              <Metric icon={<CalendarDays />} label="Hoje" value={data.today} detail="No horário de Brasília" />
              <Metric icon={<HeartHandshake />} label="Consentimento" value={`${data.marketingConsentRate}%`} detail="Para receber novidades" />
              <Metric icon={<Leaf />} label="Dosha predominante" value={dominantLabel} detail={data.total ? `${balancedRate}% com perfil equilibrado` : 'Aguardando cadastros'} />
            </section>

            <section className="analytics-card dosha-card">
              <div className="card-heading">
                <div>
                  <p className="analytics-kicker">Perfil de doshas</p>
                  <h2>Como as interessadas se distribuem</h2>
                </div>
                <span>{totalProfiled} leituras</span>
              </div>
              <div className="dosha-bars">
                {(['vata', 'pitta', 'kapha'] as Dosha[]).map((dosha) => {
                  const count = data.doshas[dosha]
                  const percentage = totalProfiled ? Math.round((count / totalProfiled) * 100) : 0
                  return (
                    <div className="dosha-bar-row" key={dosha}>
                      <span className={`dosha-dot ${doshaClass[dosha]}`} aria-hidden="true" />
                      <strong>{doshaLabel[dosha]}</strong>
                      <div className="dosha-bar-track" aria-label={`${doshaLabel[dosha]}: ${percentage}%`}>
                        <div className={`dosha-bar-fill ${doshaClass[dosha]}`} style={{ width: `${(count / largestDoshaCount) * 100}%` }} />
                      </div>
                      <span>{count} <small>({percentage}%)</small></span>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="analytics-card registrations-card">
              <div className="card-heading">
                <div>
                  <p className="analytics-kicker">Cadastros por dia</p>
                  <h2>Últimos 14 dias com movimentação</h2>
                </div>
                <BarChart3 aria-hidden="true" size={25} />
              </div>
              {data.registrationsByDay.length ? (
                <div className="registration-chart" role="img" aria-label="Gráfico de cadastros diários">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polyline points={registrationPoints} fill="none" stroke="currentColor" strokeWidth="2.7" vectorEffect="non-scaling-stroke" />
                    {data.registrationsByDay.map(({ count }, index, entries) => {
                      const x = entries.length === 1 ? 50 : (index / (entries.length - 1)) * 100
                      const y = 100 - (count / largestDayCount) * 84 - 8
                      return <circle key={index} cx={x} cy={y} r="2.2" fill="currentColor" vectorEffect="non-scaling-stroke" />
                    })}
                  </svg>
                  <div className="chart-labels">
                    {data.registrationsByDay.map(({ date, count }) => <span key={date}>{formatDate(date)}<strong>{count}</strong></span>)}
                  </div>
                </div>
              ) : <p className="analytics-empty">Os indicadores aparecerão assim que os primeiros cadastros forem concluídos.</p>}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string | number; detail: string }) {
  return <article className="metric-card"><span className="metric-icon" aria-hidden="true">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>
}
