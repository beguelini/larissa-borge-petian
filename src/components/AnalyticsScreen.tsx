import {
  CalendarDays, ChevronRight, Flame, Leaf,
  RefreshCw, ShieldCheck, Users, Wind,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Dosha } from '../types'
import { DashboardSidebar } from './DashboardSidebar'
import { FooterLogo } from './FooterLogo'

type RecentLead = { initials: string; timeLabel: string; dosha: Dosha }
type DayRegistration = { date: string; count: number }
type Analytics = {
  total: number; today: number; marketingConsentRate: number; balancedCount: number
  dominantDosha: Dosha | null; doshas: Record<Dosha, number>
  registrationsByDay: DayRegistration[]; recentLeads: RecentLead[]
}
type DateRange = { from: string; to: string }
type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'last7Days' | 'thisMonth' | 'lastMonth' | 'last30Days' | 'custom'

const doshaLabel: Record<Dosha, string> = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }
const doshaClass: Record<Dosha, string> = { vata: 'vata', pitta: 'pitta', kapha: 'kapha' }

function localDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function defaultDateRange(): DateRange {
  const to = localDate()
  return { from: shiftDate(to, -29), to }
}

function dateRangeFor(preset: Exclude<DatePreset, 'custom'>): DateRange {
  const today = localDate()
  if (preset === 'today') return { from: today, to: today }
  if (preset === 'yesterday') return { from: shiftDate(today, -1), to: shiftDate(today, -1) }
  if (preset === 'last7Days') return { from: shiftDate(today, -6), to: today }
  if (preset === 'last30Days') return defaultDateRange()
  if (preset === 'thisWeek') {
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay()
    return { from: shiftDate(today, -((weekday + 6) % 7)), to: today }
  }
  if (preset === 'thisMonth') return { from: `${today.slice(0, 8)}01`, to: today }
  const currentMonth = new Date(`${today.slice(0, 8)}01T12:00:00Z`)
  currentMonth.setUTCMonth(currentMonth.getUTCMonth() - 1)
  const from = currentMonth.toISOString().slice(0, 10)
  return { from, to: shiftDate(`${today.slice(0, 8)}01`, -1) }
}

function requestAnalytics(range: DateRange) {
  const params = new URLSearchParams(range)
  return fetch(`/api/analytics?${params}`).then((response) => {
    if (response.status === 401) window.location.assign('/login')
    if (!response.ok) throw new Error('Falha ao carregar o painel')
    return response.json() as Promise<Analytics>
  })
}

function formatRange(range: DateRange) {
  const format = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${format.format(new Date(`${range.from}T12:00:00`))} – ${format.format(new Date(`${range.to}T12:00:00`))}`
}

function emptyAnalytics(): Analytics {
  return { total: 0, today: 0, marketingConsentRate: 0, balancedCount: 0, dominantDosha: null, doshas: { vata: 0, pitta: 0, kapha: 0 }, registrationsByDay: [], recentLeads: [] }
}

export function AnalyticsScreen() {
  const [range, setRange] = useState<DateRange>(defaultDateRange)
  const [preset, setPreset] = useState<DatePreset>('last30Days')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  function loadAnalytics(nextRange = range) {
    setLoading(true); setError('')
    void requestAnalytics(nextRange).then(setAnalytics).catch(() => setError('Não foi possível carregar os indicadores agora.')).finally(() => setLoading(false))
  }
  useEffect(() => { const initialRange = defaultDateRange(); void requestAnalytics(initialRange).then(setAnalytics).catch(() => setError('Não foi possível carregar os indicadores agora.')).finally(() => setLoading(false)) }, [])

  const data = analytics ?? emptyAnalytics()
  const totalProfiled = Object.values(data.doshas).reduce((sum, value) => sum + value, 0)
  const maxCount = Math.max(...Object.values(data.doshas), 1)
  const maxDaily = Math.max(...data.registrationsByDay.map(({ count }) => count), 3)
  const lastDateCount = data.registrationsByDay.at(-1)?.count ?? 0
  const dominantLabel = data.dominantDosha ? doshaLabel[data.dominantDosha] : '—'
  const graph = useMemo(() => chartPath(data.registrationsByDay, maxDaily), [data.registrationsByDay, maxDaily])

  return <div className="reference-dashboard" id="painel"><DashboardSidebar active="panel" /><main className="reference-main">
    <header className="reference-topbar"><h1>Painel de interesse</h1><form className="reference-date-control" onSubmit={(event) => { event.preventDefault(); loadAnalytics() }}><CalendarDays aria-hidden="true" size={19} strokeWidth={1.65} /><label className="reference-date-preset">Período<select value={preset} onChange={(event) => { const nextPreset = event.target.value as DatePreset; setPreset(nextPreset); if (nextPreset !== 'custom') { const nextRange = dateRangeFor(nextPreset); setRange(nextRange); loadAnalytics(nextRange) } }}><option value="today">Hoje</option><option value="yesterday">Ontem</option><option value="thisWeek">Esta semana</option><option value="last7Days">Últimos 7 dias</option><option value="thisMonth">Este mês</option><option value="lastMonth">Mês passado</option><option value="last30Days">Últimos 30 dias</option><option value="custom">Personalizado</option></select></label><div className="reference-date-fields"><label>De<input type="date" value={range.from} max={range.to} onChange={(event) => { setPreset('custom'); setRange((current) => ({ ...current, from: event.target.value })) }} /></label><span aria-hidden="true">até</span><label>Até<input type="date" value={range.to} min={range.from} max={localDate()} onChange={(event) => { setPreset('custom'); setRange((current) => ({ ...current, to: event.target.value })) }} /></label></div><button type="submit" disabled={loading}>Aplicar</button></form></header>
    {error ? <div className="reference-error" role="alert">{error}</div> : <>
      <section className="reference-metrics" aria-label="Indicadores dos cadastros">
        <Metric icon={<Users />} label="Cadastros" value={data.total} detail="Total no período" />
        <Metric icon={<CalendarDays />} label="Fim do período" value={lastDateCount} detail={formatRange(range).split(' – ')[1]} />
        <Metric icon={<ShieldCheck />} label={<>Consentimento<br />de marketing</>} value={`${data.marketingConsentRate}%`} detail="Dos cadastros" />
        <Metric icon={<Leaf />} label="Perfil de doshas" value={dominantLabel} detail={data.total ? 'Predominante' : 'Aguardando cadastros'} accent />
      </section>
      <section className="reference-card reference-dosha-card"><h2>Perfil de doshas</h2><div className="reference-dosha-list">
        {(['vata', 'pitta', 'kapha'] as Dosha[]).map((dosha) => {
          const count = data.doshas[dosha]; const percentage = totalProfiled ? Math.round((count / totalProfiled) * 100) : 0
          const DoshaIcon = dosha === 'vata' ? Wind : dosha === 'pitta' ? Flame : Leaf
          return <div className="reference-dosha-row" key={dosha}><span className={`reference-dosha-icon ${doshaClass[dosha]}`}><DoshaIcon aria-hidden="true" size={24} strokeWidth={1.45} /></span><span className="reference-dosha-name">{doshaLabel[dosha]}</span><div className="reference-dosha-track"><span className={`reference-dosha-fill ${doshaClass[dosha]}`} style={{ width: `${(count / maxCount) * 100}%` }} /></div><span className="reference-dosha-percent">{percentage}%</span></div>
        })}
      </div></section>
      <section className="reference-lower-grid">
        <div className="reference-card reference-chart-card"><h2>Cadastros por dia</h2>{data.registrationsByDay.length ? <RegistrationChart graph={graph} maxDaily={maxDaily} days={data.registrationsByDay} /> : <p className="reference-empty">Os pontos diários aparecerão com os primeiros cadastros.</p>}</div>
        <div className="reference-card reference-recent-card"><h2>Cadastros recentes</h2>{data.recentLeads.length ? <div className="reference-recent-list">{data.recentLeads.map((lead, index) => <div className="reference-recent-row" key={`${lead.initials}-${index}`}><span className={`reference-initials ${doshaClass[lead.dosha]}`}>{lead.initials}</span><span>{lead.timeLabel}</span><strong className={doshaClass[lead.dosha]}><i />{doshaLabel[lead.dosha]}</strong></div>)}</div> : <p className="reference-empty">Os novos cadastros aparecerão aqui.</p>}<button className="reference-see-all" type="button" onClick={() => loadAnalytics()} disabled={loading}>{loading ? <RefreshCw className="is-spinning" size={16} /> : <>Ver todos <ChevronRight aria-hidden="true" size={18} /></>}</button></div>
      </section>
    </>}<FooterLogo className="reference-footer" />
  </main></div>
}

function Metric({ icon, label, value, detail, accent = false }: { icon: ReactNode; label: ReactNode; value: string | number; detail: string; accent?: boolean }) {
  return <article className={`reference-metric ${accent ? 'is-accent' : ''}`}><span className="reference-metric-icon">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>
}

function RegistrationChart({ graph, maxDaily, days }: { graph: { points: string; dots: { x: number; y: number }[] }; maxDaily: number; days: DayRegistration[] }) {
  const markers = [maxDaily, Math.round(maxDaily * 0.75), Math.round(maxDaily * 0.5), Math.round(maxDaily * 0.25), 0]
  const labels = days.filter((_, index) => index % Math.ceil(days.length / 6) === 0 || index === days.length - 1)
  return <div className="reference-chart"><div className="reference-axis">{markers.map((marker, index) => <span key={`${marker}-${index}`}>{marker}</span>)}</div><div className="reference-chart-plot"><svg viewBox="0 0 520 220" preserveAspectRatio="none" role="img" aria-label="Evolução de cadastros por dia"><g className="reference-grid-lines">{[0, 1, 2, 3, 4].map((line) => <line key={line} x1="0" x2="520" y1={15 + line * 47} y2={15 + line * 47} />)}</g><polyline points={graph.points} fill="none" stroke="currentColor" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />{graph.dots.map(({ x, y }, index) => <circle key={index} cx={x} cy={y} r="4.3" fill="currentColor" vectorEffect="non-scaling-stroke" />)}</svg><div className="reference-chart-labels">{labels.map(({ date }) => <span key={date}>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T12:00:00`))}</span>)}</div><p><i />Cadastros</p></div></div>
}

function chartPath(days: DayRegistration[], maxDaily: number) {
  const dots = days.map(({ count }, index) => ({ x: days.length === 1 ? 260 : 14 + (index / (days.length - 1)) * 492, y: 203 - (count / maxDaily) * 188 }))
  return { dots, points: dots.map(({ x, y }) => `${x},${y}`).join(' ') }
}
