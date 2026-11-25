import { CalendarDays, ChevronLeft, ChevronRight, House, List, LockKeyhole, Settings2, Van } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Overview } from './Overview'
import { EntryEditor, Ledger } from './Ledger'
import { Settings } from './Settings'
import { TripPlanner } from './TripPlanner'
import { getPlan, monthLabel, shiftMonth, today, type Category, type Entry } from './model'
import { useVault } from './useVault'

const tabs = [
  ['overview', 'Visão geral', House], ['ledger', 'Lançamentos', List],
  ['trip', 'Viagem', Van], ['settings', 'Ajustes', Settings2],
] as const
type Tab = typeof tabs[number][0]
const changed = 'Outra pessoa atualizou estes dados. Recarregue a página e revise as alterações antes de salvar.'

function Brand() {
  return <div className="fr-brand">
    <span className="fr-mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16.5" /><path d="M2 22c9 3 14-7 22-7 4 0 7 2 10 4M5 27c8-1 12-5 19-5 3 0 5 1 8 2" />
    </svg></span>
    Casa em Rota
  </div>
}

export function Finance() {
  const vault = useVault()
  const [month, setMonth] = useState(() => today().slice(0, 7))
  const [tab, setTab] = useState<Tab>('overview')
  const [editing, setEditing] = useState<{ initial: Entry | null; category?: Category } | null>(null)
  const [keyInput, setKeyInput] = useState('')
  const { family } = vault

  function go(next: Tab) {
    vault.clearError()
    setTab(next)
    window.scrollTo(0, 0)
  }
  function unlock(event: FormEvent) {
    event.preventDefault()
    void vault.unlock(keyInput)
    setKeyInput('')
  }
  if (!family) return <div className="fr-app fr-locked">
    <header className="fr-header"><Brand /></header>
    <main className="fr-lock-card fr-glass">
      <span className="fr-icon fr-tone-sand"><LockKeyhole size={20} aria-hidden="true" /></span>
      <h1>Finanças da família</h1>
      <p className="fr-muted">Acesse o orçamento e os planos de vocês com a chave privada do cofre.</p>
      <form className="fr-stack" onSubmit={unlock}>
        <label>Chave privada<input type="password" autoComplete="current-password" autoCapitalize="none" spellCheck={false} value={keyInput} onChange={event => setKeyInput(event.target.value)} required /></label>
        {vault.error && <p className="fr-error" role="alert">{vault.error}</p>}
        <button className="fr-primary" disabled={vault.busy}>{vault.busy ? 'Abrindo…' : 'Abrir cofre'}</button>
        {import.meta.env.DEV && <button type="button" className="fr-secondary" disabled={vault.busy} onClick={vault.openDemo}>Experimentar sem salvar</button>}
      </form>
    </main>
  </div>

  const entries = family.entries.filter(entry => entry.date.startsWith(month))
  const plan = getPlan(family, month)

  function openEditor(initial: Entry | null, category?: Category) {
    vault.clearError()
    setEditing({ initial, category })
  }
  async function saveEntries(next: Entry[]) {
    const initial = editing?.initial
    const saved = await vault.save(current => {
      if (initial && JSON.stringify(current.entries.find(entry => entry.id === initial.id)) !== JSON.stringify(initial)) throw new Error(changed)
      return { ...current, entries: [...current.entries.filter(entry => entry.id !== initial?.id), ...next] }
    })
    if (saved) {
      setEditing(null)
      setMonth(next[0].date.slice(0, 7))
      go('ledger')
    }
  }
  async function deleteEntry() {
    const initial = editing?.initial
    if (!initial) return
    if (await vault.save(current => {
      if (JSON.stringify(current.entries.find(entry => entry.id === initial.id)) !== JSON.stringify(initial)) throw new Error(changed)
      return { ...current, entries: current.entries.filter(entry => entry.id !== initial.id) }
    })) setEditing(null)
  }

  return <div className="fr-app">
    <header className="fr-header">
      <Brand />
      <button className="fr-icon-button" aria-label="Bloquear cofre" disabled={vault.busy} onClick={() => { setTab('overview'); vault.lock() }}><LockKeyhole size={18} /></button>
    </header>
    <main className="fr-main">
      {tab !== 'trip' && <div className="fr-month">
        <button type="button" disabled={month <= '2000-01'} aria-label="Mês anterior" onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft size={18} /></button>
        <span aria-live="polite"><CalendarDays size={16} aria-hidden="true" />{monthLabel(month)}</span>
        <button type="button" disabled={month >= '2099-12'} aria-label="Próximo mês" onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight size={18} /></button>
      </div>}
      {vault.stale && <div className="fr-notice" role="status">Sem conexão com o cofre. <button className="fr-link" onClick={() => void vault.refresh()}>Tentar novamente</button></div>}
      {vault.demo && <p className="fr-notice">Demonstração local. As alterações são descartadas ao sair.</p>}
      {vault.error && !editing && <p className="fr-error" role="alert">{vault.error}</p>}
      {tab === 'overview' && <Overview entries={entries} plan={plan} trip={family.trip} openTrip={() => go('trip')} openLedger={() => go('ledger')} />}
      {tab === 'ledger' && <Ledger entries={entries} onNew={() => openEditor(null)} onEdit={entry => openEditor(entry)} />}
      {tab === 'trip' && <TripPlanner trip={family.trip} entries={family.entries} busy={vault.busy} onContribution={() => openEditor(null, 'trip')}
        onSave={(next, baseline) => vault.save(current => {
          if (JSON.stringify(current.trip) !== JSON.stringify(baseline)) throw new Error(changed)
          return { ...current, trip: next }
        })} />}
      {tab === 'settings' && <Settings family={family} plan={plan} month={month} busy={vault.busy} accessCode={vault.accessCode}
        onLock={() => { setTab('overview'); vault.lock() }}
        onSave={(next, baseline) => vault.save(current => {
          if (JSON.stringify(getPlan(current, month)) !== JSON.stringify(baseline)) throw new Error(changed)
          return { ...current, plans: { ...current.plans, [month]: next } }
        })} />}
    </main>
    <nav className="fr-navigation" aria-label="Menu principal">
      {tabs.map(([key, label, Icon]) => <button key={key} aria-current={tab === key ? 'page' : undefined} onClick={() => go(key)}>
        <Icon size={22} strokeWidth={1.6} aria-hidden="true" /><span>{label}</span>
      </button>)}
    </nav>
    {editing && <EntryEditor initial={editing.initial} category={editing.category} month={month} busy={vault.busy} error={vault.error}
      onClose={() => { vault.clearError(); setEditing(null) }} onSave={saveEntries} onDelete={deleteEntry} />}
  </div>
}
