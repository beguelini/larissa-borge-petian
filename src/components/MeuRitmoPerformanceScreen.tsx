import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BadgePercent, CalendarDays, CheckCircle2, Clock3, CreditCard, RefreshCw, ShoppingBag, Users } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import { FooterLogo } from './FooterLogo'

type DateRange = { from: string; to: string }
type DatePreset = 'today' | 'yesterday' | 'thisWeek' | 'last7Days' | 'thisMonth' | 'lastMonth' | 'last30Days' | 'custom'
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
  registrationsByDay: { date: string; count: number }[]
  attribution: { source: string; medium: string; campaign: string; leads: number }[]
  products: { id: string; name: string }[]
  productSelected: boolean
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

function requestPerformance(range: DateRange, productId: string) {
  const params = new URLSearchParams(range)
  if (productId) params.set('productId', productId)
  return fetch(`/api/meu-ritmo-performance?${params}`).then((response) => {
    if (response.status === 401) window.location.assign('/login')
    if (!response.ok) throw new Error('Falha ao carregar o painel')
    return response.json() as Promise<Performance>
  })
}

function initialProduct(products: Performance['products']) {
  return products.find(({ name }) => /meu\s+ritmo/i.test(name) && !/sabores/i.test(name))?.id ?? ''
}

function emptyPerformance(range: DateRange): Performance {
  return { range, leads: 0, uniqueLeads: 0, convertedLeads: 0, conversionRate: 0, orders: 0, grossRevenue: 0, netRevenue: null, refunds: 0, chargebacks: 0, averageDaysToSale: null, registrationsByDay: [], attribution: [], products: [], productSelected: false }
}

export function MeuRitmoPerformanceScreen() {
  const [range, setRange] = useState<DateRange>(defaultDateRange)
  const [preset, setPreset] = useState<DatePreset>('last30Days')
  const [productId, setProductId] = useState('')
  const [data, setData] = useState<Performance | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  function load(nextRange = range, nextProductId = productId) {
    setLoading(true)
    setError('')
    void requestPerformance(nextRange, nextProductId).then((result) => {
      setData(result)
      if (!nextProductId) {
        const suggested = initialProduct(result.products)
        if (suggested) setProductId(suggested)
      }
    }).catch(() => setError('Não foi possível carregar os indicadores agora.')).finally(() => setLoading(false))
  }

  useEffect(() => {
    const initialRange = defaultDateRange()
    void requestPerformance(initialRange, '').then((result) => {
      setData(result)
      const suggested = initialProduct(result.products)
      if (suggested) {
        setProductId(suggested)
        return requestPerformance(initialRange, suggested).then(setData)
      }
    }).catch(() => setError('Não foi possível carregar os indicadores agora.')).finally(() => setLoading(false))
  }, [])

  const result = data ?? emptyPerformance(range)
  const maxDaily = Math.max(...result.registrationsByDay.map(({ count }) => count), 1)
  const chart = useMemo(() => result.registrationsByDay.map(({ date, count }) => ({ date, count, height: Math.max(count ? 8 : 2, Math.round((count / maxDaily) * 100)) })), [result.registrationsByDay, maxDaily])
  const selectedProduct = result.products.find((product) => product.id === productId)

  return <div className="reference-dashboard" id="meu-ritmo-performance"><DashboardSidebar active="meu-ritmo" /><main className="reference-main">
    <header className="reference-topbar meu-ritmo-performance-header">
      <div><p className="mr-kicker">Lançamento · Comunidade</p><h1>Meu Ritmo</h1><p className="mr-subtitle">Acompanhe os leads captados no período e as compras Hotmart feitas depois da inscrição.</p></div>
      <form className="reference-date-control" onSubmit={(event) => { event.preventDefault(); load() }}><CalendarDays aria-hidden="true" size={19} strokeWidth={1.65} /><label className="reference-date-preset">Período de captação<select value={preset} onChange={(event) => { const nextPreset = event.target.value as DatePreset; setPreset(nextPreset); if (nextPreset !== 'custom') { const nextRange = dateRangeFor(nextPreset); setRange(nextRange); load(nextRange) } }}><option value="today">Hoje</option><option value="yesterday">Ontem</option><option value="thisWeek">Esta semana</option><option value="last7Days">Últimos 7 dias</option><option value="thisMonth">Este mês</option><option value="lastMonth">Mês passado</option><option value="last30Days">Últimos 30 dias</option><option value="custom">Personalizado</option></select></label><div className="reference-date-fields"><label>De<input type="date" value={range.from} max={range.to} onChange={(event) => { setPreset('custom'); setRange((current) => ({ ...current, from: event.target.value })) }} /></label><span aria-hidden="true">até</span><label>Até<input type="date" value={range.to} min={range.from} max={localDate()} onChange={(event) => { setPreset('custom'); setRange((current) => ({ ...current, to: event.target.value })) }} /></label></div><button type="submit" disabled={loading}>Aplicar</button></form>
    </header>
    <div className="mr-product-bar"><label htmlFor="mr-product"><ShoppingBag aria-hidden="true" size={18} /> Produto da comunidade</label><select id="mr-product" value={productId} onChange={(event) => { setProductId(event.target.value); load(range, event.target.value) }} disabled={!result.products.length || loading}><option value="">Selecione o produto vendido na Hotmart</option>{result.products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select><small>Janela de captação: {formatRange(range)} · as vendas são acompanhadas após cada cadastro.</small></div>
    {error ? <div className="reference-error" role="alert">{error}</div> : <>
      {!result.products.length && <div className="mr-status-banner" role="status"><CreditCard aria-hidden="true" size={20} /><span><strong>Vendas da comunidade ainda não identificadas</strong>Quando a Hotmart registrar a primeira compra aprovada, escolha aqui o produto Meu Ritmo para acompanhar conversão e receita. Outros produtos, como os e-books, não serão atribuídos à comunidade automaticamente.</span></div>}
      {result.products.length > 0 && !productId && <div className="mr-status-banner" role="status"><CreditCard aria-hidden="true" size={20} /><span><strong>Selecione o produto da comunidade</strong>Os indicadores de venda ficam em zero até a escolha do produto correto. Compras de e-books não são incluídas sem essa confirmação.</span></div>}
      <section className="reference-metrics mr-metrics" aria-label="Indicadores de captação e venda">
        <Metric icon={<Users />} label="Leads captados" value={result.leads} detail={`${result.uniqueLeads} e-mails únicos`} />
        <Metric icon={<CheckCircle2 />} label="Leads convertidos" value={result.convertedLeads} detail="Compra aprovada após cadastro" />
        <Metric icon={<BadgePercent />} label="Conversão" value={`${result.conversionRate}%`} detail="Da base única de leads" accent />
        <Metric icon={<ShoppingBag />} label="Pedidos ativos" value={result.orders} detail={selectedProduct?.name ?? 'Produto da comunidade'} />
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
      <p className="mr-data-note">A atribuição de venda usa correspondência exata de e-mail entre o cadastro e a compra. Os indicadores de vendas consideram pedidos aprovados depois da inscrição e deixam reembolsos e chargebacks fora da conversão ativa. O repasse só é exibido quando informado pela Hotmart.</p>
    </>}
    <FooterLogo className="reference-footer" />
  </main></div>
}

function Metric({ icon, label, value, detail, accent = false }: { icon: ReactNode; label: ReactNode; value: string | number; detail: string; accent?: boolean }) {
  return <article className={`reference-metric ${accent ? 'is-accent' : ''}`}><span className="reference-metric-icon">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>
}
