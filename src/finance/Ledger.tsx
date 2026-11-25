import { Check, Clock3, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { categories, categoryLabel, cents, isReserve, money, shortDate, splitEntry, sum, today, type Category, type Entry } from './model'

export function Ledger({ entries, onNew, onEdit }: { entries: Entry[]; onNew: () => void; onEdit: (entry: Entry) => void }) {
  const [filter, setFilter] = useState('all')
  const groups = [
    { title: 'Pagos e reservados', key: 'paid', match: (entry: Entry) => entry.paid, icon: Check },
    { title: 'Pendentes', key: 'pending', match: (entry: Entry) => !entry.paid, icon: Clock3 },
  ]
  return <>
    <div className="fr-heading fr-page-heading"><h1>Lançamentos</h1>
      <button className="fr-primary" onClick={onNew}><Plus size={19} aria-hidden="true" />Novo lançamento</button>
    </div>
    <div className="fr-ledger fr-stack">
      <label className="fr-filter">Status <select value={filter} onChange={event => setFilter(event.target.value)}>
        <option value="all">Todos</option><option value="paid">Concluídos</option><option value="pending">Pendentes</option>
      </select></label>
      {groups.filter(group => filter === 'all' || group.key === filter).map(({ title, key, match, icon: Icon }) => {
        const items = entries.filter(match).sort((a, b) => key === 'paid' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
        return <section className="fr-glass fr-list" key={key}>
          <div className="fr-group"><h2>{title}</h2><strong>{money(sum(items))}</strong></div>
          {items.length === 0 && <p className="fr-empty">Nenhum lançamento por aqui.</p>}
          {items.map(entry => <button className="fr-row fr-edit-row" key={entry.id} onClick={() => onEdit(entry)}>
            <span className={'fr-icon ' + (entry.paid ? 'fr-tone-olive' : 'fr-tone-sand')}><Icon size={18} aria-hidden="true" /></span>
            <span><strong>{entry.label}</strong><small>{categoryLabel(entry.category)} · {entry.who}</small></span>
            <span className="fr-row-amount"><small>{shortDate(entry.date)}</small><strong>{money(entry.cents)}</strong></span>
          </button>)}
        </section>
      })}
    </div>
  </>
}

export function EntryEditor({ initial, month, category: startingCategory, busy, error, onClose, onSave, onDelete }: {
  initial: Entry | null; month: string; category?: Category; busy: boolean; error: string; onClose: () => void
  onSave: (entries: Entry[]) => Promise<void>; onDelete: () => Promise<void>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [method, setMethod] = useState(initial?.method ?? 'Pix')
  const [category, setCategory] = useState<Category>(initial?.category ?? startingCategory ?? 'food')
  const [confirm, setConfirm] = useState(false)
  const [localError, setLocalError] = useState('')
  useEffect(() => { dialog.current?.showModal() }, [])
  const date = today()
  const inputDate = initial?.date ?? (month === date.slice(0, 7) ? date : month + '-01')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const label = String(data.get('label')).trim()
    const total = cents(String(data.get('value')))
    const installments = Number(data.get('installments') ?? 1)
    if (!label || total < installments) {
      setLocalError('Informe uma descrição e um valor suficiente para as parcelas.')
      return
    }
    setLocalError('')
    const entry: Entry = {
      id: initial?.id ?? crypto.randomUUID(), label, cents: total, category,
      date: String(data.get('date')), who: String(data.get('who')), method,
      paid: data.get('paid') === 'on',
    }
    void onSave(splitEntry(entry, installments))
  }

  return <dialog className="fr-dialog" ref={dialog} aria-labelledby="fr-editor-title" onCancel={event => { event.preventDefault(); if (!busy) onClose() }}>
    <div className="fr-heading"><h2 id="fr-editor-title">{initial ? 'Editar lançamento' : 'Novo lançamento'}</h2>
      <button className="fr-icon-button" aria-label="Fechar" type="button" disabled={busy} onClick={onClose}><X size={22} /></button></div>
    <form className="fr-stack" onSubmit={submit}>
      <label>Descrição<input name="label" required maxLength={100} defaultValue={initial?.label ?? ''} placeholder="Ex.: mercado" /></label>
      <div className="fr-fields">
        <label>Valor (R$)<input name="value" type="number" inputMode="decimal" step="0.01" min="0.01" max="9999999" required defaultValue={initial ? initial.cents / 100 : ''} /></label>
        <label>{method === 'Crédito' ? 'Vencimento da fatura' : 'Data'}<input name="date" type="date" required min="2000-01-01" max="2097-12-31" defaultValue={inputDate} /></label>
      </div>
      <div className="fr-fields">
        <label>Categoria<select name="category" value={category} onChange={event => setCategory(event.target.value as Category)}>
          {categories.map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select></label>
        <label>Responsável<select name="who" defaultValue={initial?.who ?? 'Família'}><option>Família</option><option>Eu</option><option>Larissa</option></select></label>
      </div>
      <div className="fr-fields">
        <label>Forma de pagamento<select name="method" value={method} onChange={event => setMethod(event.target.value)}>
          <option>Pix</option><option>Débito</option><option>Crédito</option><option>Dinheiro</option><option>Boleto</option><option>Transferência</option>
        </select></label>
        {method === 'Crédito' && !initial && <label>Parcelas<input name="installments" type="number" inputMode="numeric" min="1" max="36" required defaultValue="1" /></label>}
      </div>
      <label className="fr-check"><input name="paid" type="checkbox" defaultChecked={initial?.paid ?? true} />{isReserve(category) ? 'Valor já guardado' : method === 'Crédito' ? 'Fatura deste lançamento já paga' : 'Já pago'}</label>
      {method === 'Crédito' && <small>Registre a compra na categoria dela. Use a categoria de fatura anterior apenas para valores ainda não lançados.</small>}
      {(localError || error) && <p className="fr-error" role="alert">{localError || error}</p>}
      <button className="fr-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar lançamento'}</button>
    </form>
    {initial && <div className="fr-delete">
      {confirm ? <>
        <p>Remover este lançamento do cofre?</p>
        <div className="fr-actions"><button type="button" className="fr-secondary" disabled={busy} onClick={() => setConfirm(false)}>Cancelar</button>
          <button type="button" className="fr-danger-button" disabled={busy} onClick={() => void onDelete()}>Confirmar exclusão</button></div>
      </> : <button type="button" className="fr-link fr-negative" disabled={busy} onClick={() => setConfirm(true)}>Excluir lançamento</button>}
    </div>}
  </dialog>
}
