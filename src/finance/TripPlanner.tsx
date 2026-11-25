import { CalendarDays, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { estimate, money, shortDate, today, tripFields, type Entry, type Trip } from './model'

export function TripPlanner({ trip, entries, busy, onSave, onContribution }: {
  trip: Trip; entries: Entry[]; busy: boolean; onSave: (next: Trip, baseline: Trip) => Promise<boolean>; onContribution: () => void
}) {
  const [draft, setDraft] = useState<{ values: Trip; baseline: Trip } | null>(null)
  const [saved, setSaved] = useState(false)
  const values = draft?.values ?? trip
  const totals = estimate(values, entries)
  const weeks = values.date ? Math.ceil((Date.parse(values.date) - Date.parse(today())) / 604800000) : 0
  const lines = [
    ['Combustível', totals.fuel], ['Pedágios', totals.tolls], ['Balsa', totals.ferry],
    ['Camping', totals.camping], ['Alimentação e outros', totals.extras], ['Margem', totals.margin],
  ] as const
  function update(key: keyof Trip, value: string) {
    setSaved(false)
    setDraft(current => ({ baseline: current?.baseline ?? trip, values: { ...(current?.values ?? trip), [key]: value } }))
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (draft && await onSave({ ...draft.values, title: draft.values.title.trim() || 'Nossa viagem' }, draft.baseline)) {
      setDraft(null)
      setSaved(true)
    }
  }

  return <>
    <h1>{trip.title}</h1>
    {trip.date && <p className="fr-departure"><CalendarDays size={19} aria-hidden="true" /> Saída em {shortDate(trip.date)} {trip.route && <span>· {trip.route}</span>}</p>}
    <div className="fr-trip-photo" />
    <div className="fr-columns fr-trip-columns">
      <form className="fr-glass fr-pad fr-stack" onSubmit={save}>
        <div className="fr-fields fr-trip-identity">
          <label>Nome da viagem<input maxLength={60} value={values.title} onChange={event => update('title', event.target.value)} required /></label>
          <label>Data de saída<input type="date" min="2000-01-01" max="2099-12-31" value={values.date} onChange={event => update('date', event.target.value)} /></label>
        </div>
        <label>Rota<input value={values.route} maxLength={120} onChange={event => update('route', event.target.value)} placeholder="Origem e destino" /></label>
        <div className="fr-fields fr-trip-fields">
          {tripFields.map(([key, label, step]) => <label key={key}>{label}
            <input type="number" inputMode={step === '1' ? 'numeric' : 'decimal'} min={key === 'price' || key === 'efficiency' ? '0.01' : '0'} max={key === 'margin' ? '100' : '100000'} step={step} placeholder={key === 'nights' ? '0' : 'A confirmar'} value={values[key]}
              onChange={event => update(key, event.target.value)} />
          </label>)}
          <label>Valor já guardado antes dos lançamentos (R$)
            <input type="number" inputMode="decimal" min="0" max="9999999" step="0.01" value={values.saved} placeholder="0,00" onChange={event => update('saved', event.target.value)} />
          </label>
        </div>
        <small>Inclua ida e volta na distância e nos pedágios se quiser planejar a viagem completa. Preencha zero se não houver pedágio.</small>
        <div className="fr-actions"><button className="fr-primary" disabled={busy || !draft}>{busy ? 'Salvando…' : 'Salvar planejamento'}</button>
          {draft && <button type="button" className="fr-link" disabled={busy} onClick={() => setDraft(null)}>Descartar alterações</button>}</div>
        {saved && <p role="status" className="fr-positive">Planejamento salvo.</p>}
      </form>
      <div className="fr-stack">
        <section className="fr-glass fr-pad fr-trip-summary">
          <h2>Estimativa da viagem</h2>
          <dl>{lines.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{money(value)}</dd></div>)}</dl>
          <div className="fr-trip-total"><span>{totals.complete ? 'Total estimado' : 'Total parcial'}</span><strong>{money(totals.total)}</strong></div>
          {!totals.complete && <small>Confirme distância, consumo, preço por litro, pedágios e diária quando houver camping.</small>}
        </section>
        <section className="fr-glass fr-pad fr-stack fr-small-gap">
          <h2>Fundo da viagem</h2>
          <p className="fr-fund-number">{money(totals.saved)}</p>
          {totals.complete && <p>{totals.gap > 0 ? 'Faltam ' + money(totals.gap) : 'Estimativa coberta pelo valor guardado.'}</p>}
          {totals.complete && totals.gap > 0 && weeks > 0 && <small>{money(Math.ceil(totals.gap / weeks))} por semana até a saída.</small>}
          <button className="fr-secondary" onClick={onContribution}><Plus size={17} aria-hidden="true" /> Registrar aporte</button>
        </section>
      </div>
    </div>
  </>
}
