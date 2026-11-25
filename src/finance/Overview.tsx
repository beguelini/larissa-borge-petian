import { ArrowUpRight, CircleDollarSign, Clock3, Dumbbell, HeartPulse, House, Utensils, Wallet } from 'lucide-react'
import { useState } from 'react'
import { categories, categoryLabel, money, monthlySummary, shortDate, sum, today, type Entry, type Plan, type Trip } from './model'

const categoryIcons = { stay: House, food: Utensils, gym: Dumbbell, health: HeartPulse, emergency: Wallet }

export function Overview({ entries, plan, trip, openTrip, openLedger }: {
  entries: Entry[]; plan: Plan; trip: Trip; openTrip: () => void; openLedger: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? categories : categories.filter(([key]) => key === 'stay' || key === 'food' || key === 'health')
  const { paid, pending, saved, available } = monthlySummary(entries, plan.limit)
  const used = paid + pending + saved
  const percentage = plan.limit ? Math.round(used / plan.limit * 100) : 0
  const due = entries.filter(entry => !entry.paid).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)
  const now = today()
  return <>
    <h1>O mês em equilíbrio.</h1>
    <div className="fr-columns fr-overview">
      <div className="fr-stack fr-overview-main">
        <section className="fr-glass fr-balance">
          <div>Disponível no mês</div>
          <p className={available < 0 ? 'fr-negative fr-balance-value' : 'fr-balance-value'}>{money(available)}</p>
          <div className="fr-metrics">
            <div><span>Pago</span><strong>{money(paid)}</strong></div>
            <div><span>Pendente</span><strong>{money(pending)}</strong></div>
            <div><span>Reservado</span><strong>{money(saved)}</strong></div>
          </div>
          <div className="fr-progress">
            <progress value={Math.min(percentage, 100)} max="100" aria-label="Percentual do orçamento comprometido" />
            <strong>{percentage}%</strong>
          </div>
          <small>Do limite de {money(plan.limit)} no mês</small>
          {available < 0 && <p className="fr-negative">O mês ultrapassou o limite em {money(-available)}.</p>}
        </section>

        <button className="fr-trip-teaser" onClick={openTrip}>
          <span>{trip.title}<small>{trip.date ? 'Saída em ' + shortDate(trip.date) : 'Calcule o custo da estrada'}</small></span>
          <ArrowUpRight size={19} aria-hidden="true" />
        </button>

        <section className="fr-stack fr-small-gap fr-overview-due">
          <div className="fr-heading"><h2>Contas pendentes</h2><button className="fr-link" onClick={openLedger}>Ver lançamentos</button></div>
          <div className="fr-glass fr-list">
            {!due.length && <p className="fr-empty">Nenhuma conta pendente neste mês.</p>}
            {due.map(entry => <div className="fr-row" key={entry.id}>
              <span className="fr-icon fr-tone-sand"><Clock3 size={17} aria-hidden="true" /></span>
              <div><strong>{entry.label}</strong><small className={entry.date < now ? 'fr-negative' : ''}>{entry.date < now ? 'Atrasada · ' : ''}{shortDate(entry.date)}</small></div>
              <strong>{money(entry.cents)}</strong>
            </div>)}
          </div>
        </section>
      </div>

      <section className="fr-stack fr-small-gap fr-categories">
        <div className="fr-heading"><h2>Orçamento por categoria</h2><button className="fr-link fr-categories-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Mostrar menos" : "Ver todas"}</button></div>
        <div className="fr-glass fr-list">
          {shown.map(([key]) => {
            const cap = plan.caps[key]
            const committed = sum(entries.filter(entry => entry.category === key))
            const Icon = categoryIcons[key as keyof typeof categoryIcons] ?? CircleDollarSign
            return <div className="fr-category" key={key}>
              <Icon size={20} aria-hidden="true" />
              <div>
                <div className="fr-heading"><strong>{categoryLabel(key)}</strong><small className={committed > cap ? 'fr-negative' : ''}>{money(committed)} / {money(cap)}</small></div>
                <progress value={cap ? Math.min(committed, cap) : Number(committed > 0)} max={cap || 1} aria-label={categoryLabel(key)} />
              </div>
            </div>
          })}
        </div>
      </section>
    </div>
  </>
}
