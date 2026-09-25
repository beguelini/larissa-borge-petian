import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BadgePercent, CalendarDays, CheckCircle2, Clock3, CreditCard, RefreshCw, Search, ShoppingBag, Users } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import { FooterLogo } from './FooterLogo'

type DateRange = { from: string; to: string }
type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'last7Days' | 'thisMonth' | 'lastMonth' | 'last30Days' | 'custom'
type LaunchLead = { name: string; email: string; whatsapp: string; createdAt: string; privacyConsent: boolean; communicationsConsent: boolean; source: string; medium: string; campaign: string }
type Performance = {
  range: DateRange
  leads: number
  uniqueLeads: number
  convertedLeads: number
  conversionRate: number
  orders: number
  grossRevenue: number
  netRevenue: number | null
  refunds: number
  chargebacks: number
  averageDaysToSale: number | null
  leadList: LaunchLead[]
  registrationsByDay: { date: string; count: number }[]
  attribution: { source: string; medium: string; campaign: string; leads: number }[]
}

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
  return { from: currentMonth.toISOString().slice(0, 10), to: shiftDate(`${today.slice(0, 8)}01`, -1) }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatRange(range: DateRange) {
  const format = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${format.format(new Date(`${range.from}T12:00:00`))} a ${format.format(new Date(`${range.to}T12:00:00`))}`
}

function requestPerformance(range: DateRange) {
  const params = new URLSearchParams(range)
  return fetch(`/api/meu-ritmo-performance?${params}`).then((response) => {
    if (response.status === 401) window.location.assign('/login')
    if (!response.ok) throw new Error('Falha ao carregar o painel')
    return response.json() as Promise<Performance>
  })
}

function emptyPerformance(range: DateRange): Performance {
  return { range, leads: 0, uniqueLeads: 0, convertedLeads: 0, conversionRate: 0, orders: 0, grossRevenue: 0, netRevenue: null, refunds: 0, chargebacks: 0, averageDaysToSale: null, leadList: [], registrationsByDay: [], attribution: [] }
}

export function MeuRitmoPerformanceScreen() {
  const [range, setRange] = useState<DateRange>(defaultDateRange)
  const [preset, setPreset] = useState<DatePreset>('last30Days')
  const [data, setData] = useState<Performance | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  function load(nextRange = range) {
    setLoading(true)
    setError('')
    void requestPerformance(nextRange).then(setData).catch(() => setError('Não foi possível carregar os indicadores agora.')).finally(() => setLoading(false))
  }

  useEffect(() => {
    const initialRange = defaultDateRange()
    void requestPerformance(initialRange).then(setData).catch(() => setError('Não foi possível carregar os indicadores agora.')).finally(() => setLoading(false))
  }, [])

  const result = data ?? emptyPerformance(range)
  const maxDaily = Math.max(...result.registrationsByDay.map(({ count }) => count), 1)
  const chart = useMemo(() => result.registrationsByDay.map(({ date, count }) => ({ date, count, height: Math.max(count ? 8 : 2, Math.round((count / maxDaily) * 100)) })), [result.registrationsByDay, maxDaily])
  const filteredLeads = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    if (!term) return result.leadList
    return result.leadList.filter((lead) => [lead.name, lead.email, lead.whatsapp].some((value) => value.toLocaleLowerCase('pt-BR').includes(term)))
  }, [result.leadList, search])

  function applyPreset(nextPreset: Exclude<DatePreset, 'custom'>) {
    const nextRange = dateRangeFor(nextPreset)
    setPreset(nextPreset)
    setRange(nextRange)
    load(nextRange)
  }

  const presets: { id: Exclude<DatePreset, 'custom'>; label: string }[] = [
    { id: 'today', label: 'Hoje' }, { id: 'thisWeek', label: 'Esta semana' }, { id: 'last7Days', label: '7 dias' }, { id: 'thisMonth', label: 'Este mês' }, { id: 'last30Days', label: '30 dias' },
  ]

  return <div className="reference-dashboard" id="meu-ritmo-performance"><DashboardSidebar active="meu-ritmo" /><main className="reference-main">
    <header className="reference-topbar meu-ritmo-performance-header">
      <div><p className="mr-kicker">Lançamento · Comunidade</p><h1>Meu Ritmo</h1><p className="mr-subtitle">Acompanhe os leads captados no período e as compras Hotmart feitas depois da inscrição.</p></div>
      <div className="mr-date-panel">
        <div className="mr-date-heading"><span><CalendarDays aria-hidden="true" size={17} /> Período de captação</span><small>{formatRange(range)}</small></div>
        <div className="mr-date-presets" role="group" aria-label="Períodos rápidos">{presets.map(({ id, label }) => <button className={preset === id ? 'is-active' : ''} type="button" key={id} onClick={() => applyPreset(id)} aria-pressed={preset === id}>{label}</button>)}<button className={preset === 'custom' ? 'is-active' : ''} type="button" onClick={() => setPreset('custom')} aria-pressed={preset === 'custom'}>Personalizado</button></div>
        <form className="mr-date-form" onSubmit={(event) => { event.preventDefault(); load() }}><label>De<input type="date" value={range.from} max={range.to} onChange={(event) => { setPreset('custom'); setRange((current) => ({ ...current, from: event.target.value })) }} /></label><span aria-hidden="true">até</span><label>Até<input type="date" value={range.to} min={range.from} max={localDate()} onChange={(event) => { setPreset('custom'); setRange((current) => ({ ...current, to: event.target.value })) }} /></label><button type="submit" disabled={loading}>{loading ? 'Atualizando…' : 'Aplicar período'}</button></form>
      </div>
    </header>
    {error ? <div className="reference-error" role="alert">{error}</div> : <>
      {result.orders === 0 && <div className="mr-status-banner" role="status"><CreditCard aria-hidden="true" size={20} /><span><strong>Nenhuma venda da comunidade no período</strong>Quando houver uma compra aprovada do Meu Ritmo após a inscrição, a conversão e a receita serão atualizadas automaticamente pelo webhook Hotmart.</span></div>}
      <section className="reference-metrics mr-metrics" aria-label="Indicadores de captação e venda">
        <Metric icon={<Users />} label="Leads captados" value={result.leads} detail={`${result.uniqueLeads} e-mails únicos`} />
        <Metric icon={<CheckCircle2 />} label="Leads convertidos" value={result.convertedLeads} detail="Compra aprovada após cadastro" />
        <Metric icon={<BadgePercent />} label="Conversão" value={`${result.conversionRate}%`} detail="Da base única de leads" accent />
        <Metric icon={<ShoppingBag />} label="Pedidos ativos" value={result.orders} detail="Comunidade Meu Ritmo" />
      </section>
      <section className="reference-metrics mr-finance-metrics" aria-label="Indicadores financeiros da comunidade">
        <Metric icon={<CreditCard />} label="Receita bruta" value={formatMoney(result.grossRevenue)} detail="Pedidos aprovados ativos" />
        <Metric icon={<CreditCard />} label="Repasse Hotmart" value={result.netRevenue === null ? '—' : formatMoney(result.netRevenue)} detail={result.netRevenue === null ? 'A Hotmart ainda não informou' : 'Comissão informada no webhook'} />
        <Metric icon={<RefreshCw />} label="Estornos e chargebacks" value={formatMoney(result.refunds + result.chargebacks)} detail={`Reembolsos ${formatMoney(result.refunds)} · chargebacks ${formatMoney(result.chargebacks)}`} />
        <Metric icon={<Clock3 />} label="Tempo médio até a venda" value={result.averageDaysToSale === null ? '—' : `${result.averageDaysToSale} dias`} detail="A partir do cadastro" />
      </section>
      <section className="mr-insights-grid">
        <article className="reference-card mr-daily-card"><h2>Captação por dia</h2><p>Leads inscritos em cada data do período escolhido.</p>{chart.length ? <div className="mr-bar-chart" role="img" aria-label="Gráfico de leads captados por dia">{chart.map(({ date, count, height }) => <div className="mr-bar-column" key={date} title={`${date}: ${count} leads`}><span>{count || ''}</span><i style={{ height: `${height}%` }} /><small>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T12:00:00`))}</small></div>)}</div> : <p className="reference-empty">Os cadastros aparecerão aqui.</p>}</article>
        <article className="reference-card mr-sources-card"><h2>Origem dos leads</h2><p>Campanha, fonte e mídia registrados no formulário.</p>{result.attribution.length ? <div className="mr-source-list">{result.attribution.map((source, index) => <div className="mr-source-row" key={`${source.source}-${source.medium}-${source.campaign}-${index}`}><span><strong>{source.campaign}</strong><small>{source.source} · {source.medium}</small></span><b>{source.leads}</b></div>)}</div> : <p className="reference-empty">Ainda não há parâmetros de campanha nos cadastros deste período.</p>}</article>
      </section>
      <section className="mr-leads-card" aria-labelledby="mr-leads-title">
        <div className="mr-leads-heading"><div><p className="mr-kicker">Base de captação</p><h2 id="mr-leads-title">Leads do Meu Ritmo <span>{result.leads}</span></h2><p>Dados informados no formulário entre {formatRange(range)}.</p></div><label className="mr-leads-search"><Search size={17} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, e-mail ou WhatsApp" aria-label="Buscar leads" /></label></div>
        <div className="mr-leads-table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Cadastro</th><th>Origem</th><th>Privacidade</th><th>Informativos</th></tr></thead><tbody>{filteredLeads.map((lead) => <tr key={`${lead.createdAt}-${lead.email}`}><td><strong>{lead.name}</strong></td><td><a href={`mailto:${lead.email}`}>{lead.email}</a></td><td><a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{lead.whatsapp}</a></td><td>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(lead.createdAt))}</td><td><strong>{lead.campaign}</strong><small>{lead.source} · {lead.medium}</small></td><td>{lead.privacyConsent ? 'Aceito' : 'Não registrado'}</td><td>{lead.communicationsConsent ? 'Sim' : 'Não'}</td></tr>)}{filteredLeads.length === 0 && <tr><td colSpan={7} className="mr-leads-empty">{result.leadList.length ? 'Nenhum lead corresponde à busca.' : 'Ainda não há leads neste período.'}</td></tr>}</tbody></table></div>
        <div className="mr-leads-footer"><span>{filteredLeads.length} de {result.leads} cadastros</span><button type="button" onClick={() => load()} disabled={loading}><RefreshCw size={15} aria-hidden="true" className={loading ? 'mr-refreshing' : ''} /> Atualizar lista</button></div>
      </section>
      <p className="mr-data-note">A atribuição de venda usa correspondência exata de e-mail entre o cadastro e a compra. Os indicadores de vendas consideram pedidos aprovados depois da inscrição e deixam reembolsos e chargebacks fora da conversão ativa. O repasse só é exibido quando informado pela Hotmart.</p>
    </>}
    <FooterLogo className="reference-footer" />
  </main></div>
}

function Metric({ icon, label, value, detail, accent = false }: { icon: ReactNode; label: ReactNode; value: string | number; detail: string; accent?: boolean }) {
  return <article className={`reference-metric ${accent ? 'is-accent' : ''}`}><span className="reference-metric-icon">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>
}
