import { ChevronLeft, ChevronRight, RefreshCw, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Dosha } from '../types'
import { DashboardSidebar } from './DashboardSidebar'
import { FooterLogo } from './FooterLogo'

type Registration = { id: string; firstName: string; email: string; initials: string; date: string; time: string; dosha: Dosha; secondaryDosha: Dosha | null; isBalanced: boolean; marketingConsent: boolean }
type RegistrationResponse = { total: number; page: number; pageSize: number; records: Registration[] }
type Filters = { dosha: string; marketing: string }

const doshaLabel: Record<Dosha, string> = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }

function fetchRegistrations(page: number, filters: Filters) {
  const params = new URLSearchParams({ page: String(page) })
  if (filters.dosha) params.set('dosha', filters.dosha)
  if (filters.marketing) params.set('marketing', filters.marketing)
  return fetch(`/api/registrations?${params}`).then((response) => {
    if (response.status === 401) window.location.assign('/login')
    if (!response.ok) throw new Error('Falha ao carregar cadastros')
    return response.json() as Promise<RegistrationResponse>
  })
}

export function RegistrationsScreen() {
  const [filters, setFilters] = useState<Filters>({ dosha: '', marketing: '' })
  const [page, setPage] = useState(1)
  const [data, setData] = useState<RegistrationResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  function load(nextPage = page, nextFilters = filters) {
    setLoading(true); setError('')
    void fetchRegistrations(nextPage, nextFilters)
      .then(setData)
      .catch(() => setError('Não foi possível carregar os cadastros agora.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void fetchRegistrations(1, filters)
      .then(setData)
      .catch(() => setError('Não foi possível carregar os cadastros agora.'))
      .finally(() => setLoading(false))
  }, [filters])
  async function remove(record: Registration) {
    if (!window.confirm(`Excluir permanentemente o cadastro de ${record.firstName}? Esta ação não pode ser desfeita.`)) return
    setDeletingId(record.id); setError('')
    try {
      const response = await fetch(`/api/registrations?id=${encodeURIComponent(record.id)}`, { method: 'DELETE' })
      if (response.status === 401) { window.location.assign('/login'); return }
      if (!response.ok) throw new Error('delete')
      load(data?.records.length === 1 && page > 1 ? page - 1 : page)
    } catch { setError('Não foi possível excluir o cadastro agora.') } finally { setDeletingId('') }
  }
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 20)))

  return <div className="reference-dashboard registrations-dashboard"><DashboardSidebar active="registrations" /><main className="reference-main registrations-main">
    <header className="registrations-header"><div><h1>Cadastros</h1><p>Acompanhe as novas interessadas no pré-lançamento.</p></div><button className="registrations-refresh" type="button" onClick={() => load()} disabled={loading}><RefreshCw aria-hidden="true" size={18} className={loading ? 'is-spinning' : ''} /> Atualizar</button></header>
    <section className="registrations-filters" aria-label="Filtros de cadastros"><span><SlidersHorizontal aria-hidden="true" size={18} /> Filtrar por</span><label>Dosha<select value={filters.dosha} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, dosha: event.target.value })) }}><option value="">Todos os doshas</option><option value="vata">Vata</option><option value="pitta">Pitta</option><option value="kapha">Kapha</option></select></label><label>Marketing<select value={filters.marketing} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, marketing: event.target.value })) }}><option value="">Todos</option><option value="true">Com consentimento</option><option value="false">Sem consentimento</option></select></label></section>
    {error && <p className="reference-error" role="alert">{error}</p>}
    <section className="registrations-table-card"><div className="registrations-table-heading"><div><h2>Interessadas</h2><p>{data?.total ?? 0} cadastros encontrados</p></div><small>Acesso administrativo</small></div><div className="registrations-table" role="table" aria-label="Lista de cadastros"><div className="registrations-row registrations-columns" role="row"><span>Interessada</span><span>Contato</span><span>Data</span><span>Resultado</span><span>Marketing</span><span>Ação</span></div>{data?.records.map((record) => <div className="registrations-row" role="row" key={record.id}><span className="registration-person"><i>{record.initials}</i>{record.firstName}</span><span className="registration-email">{record.email}</span><span>{record.date}<small>{record.time}</small></span><span><b className={`registration-dosha ${record.dosha}`}>{doshaLabel[record.dosha]}</b>{record.secondaryDosha && <small className="registration-secondary">+ {doshaLabel[record.secondaryDosha]}</small>}{record.isBalanced && <small className="registration-secondary">Equilibrado</small>}</span><span><em className={record.marketingConsent ? 'is-yes' : 'is-no'}>{record.marketingConsent ? 'Autorizado' : 'Não autorizado'}</em></span><span><button className="registration-delete" type="button" aria-label={`Excluir cadastro de ${record.firstName}`} onClick={() => void remove(record)} disabled={deletingId === record.id}><Trash2 size={17} />{deletingId === record.id ? 'Excluindo…' : 'Excluir'}</button></span></div>)}</div>{!loading && !data?.records.length && <p className="registrations-empty">Nenhum cadastro encontrado com estes filtros.</p>}<footer className="registrations-pagination"><span>Página {data?.page ?? 1} de {totalPages}</span><div><button type="button" aria-label="Página anterior" onClick={() => { const next = Math.max(1, page - 1); setPage(next); load(next) }} disabled={loading || page === 1}><ChevronLeft size={19} /></button><button type="button" aria-label="Próxima página" onClick={() => { const next = Math.min(totalPages, page + 1); setPage(next); load(next) }} disabled={loading || page >= totalPages}><ChevronRight size={19} /></button></div></footer></section>
  <FooterLogo className="reference-footer" /></main></div>
}
