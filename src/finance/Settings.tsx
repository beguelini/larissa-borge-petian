import { Copy, Download, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { categories, cents, csv, money, monthLabel, type Family, type Plan } from './model'

export function Settings({ family, plan, month, busy, accessCode, onSave, onLock }: {
  family: Family; plan: Plan; month: string; busy: boolean; accessCode: string
  onSave: (next: Plan, baseline: Plan) => Promise<boolean>; onLock: () => void
}) {
  const [edit, setEdit] = useState<{ month: string; values: Plan; baseline: Plan } | null>(null)
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState('')
  const values = edit?.month === month ? edit.values : plan
  const unallocated = values.limit - Object.values(values.caps).reduce((total, cap) => total + cap, 0)

  function update(next: Plan) {
    setNotice('')
    setEdit({ month, values: next, baseline: edit?.month === month ? edit.baseline : plan })
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (edit?.month !== month) return
    if (unallocated < 0) {
      setNotice('Os limites por categoria precisam caber no orçamento do mês.')
      return
    }
    if (await onSave(values, edit.baseline)) {
      setEdit(null)
      setNotice('Orçamento salvo.')
    }
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(accessCode)
      setCopied('Chave copiada. Envie só para quem deve acessar o cofre.')
    } catch {
      setCopied('O navegador não liberou a cópia. Use a chave que você guardou.')
    }
  }
  function exportCsv() {
    const objectUrl = URL.createObjectURL(new Blob([csv(family)], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = 'casa-em-rota-lancamentos.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }

  return <>
    <h1>Ajustes</h1>
    <div className="fr-columns">
      <form className="fr-glass fr-pad fr-stack" onSubmit={submit}>
        <div><h2>Orçamento mensal</h2><p className="fr-muted">Válido a partir de {monthLabel(month)} até o próximo ajuste.</p></div>
        <label>Limite do mês (R$)<input type="number" inputMode="decimal" step="0.01" min="0.01" max="99999999" required
          value={values.limit ? values.limit / 100 : ''} onChange={event => update({ ...values, limit: cents(event.target.value) })} /></label>
        <div className="fr-budget-fields">{categories.map(([key, label]) => <label key={key}>{label}
          <input type="number" inputMode="decimal" step="0.01" min="0" max="99999999" value={values.caps[key] / 100}
            aria-label={label + ' em reais'} onChange={event => update({ ...values, caps: { ...values.caps, [key]: cents(event.target.value) } })} />
        </label>)}</div>
        <p className={unallocated < 0 ? 'fr-negative' : ''}>{unallocated < 0 ? 'Acima do limite' : 'Ainda sem categoria'} · {money(Math.abs(unallocated))}</p>
        <button className="fr-primary" disabled={busy || edit?.month !== month}>{busy ? 'Salvando…' : 'Salvar orçamento'}</button>
        {notice && <p role="status" className={unallocated < 0 ? 'fr-negative' : 'fr-positive'}>{notice}</p>}
      </form>
      <div className="fr-stack">
        <section className="fr-glass fr-pad fr-stack">
          <h2>Cofre compartilhado</h2>
          <p className="fr-muted">A mesma chave abre o cofre nos dois celulares. Guarde uma cópia em um gerenciador de senhas.</p>
          <button className="fr-secondary" disabled={!accessCode || busy} onClick={() => void copyCode()}><Copy size={17} aria-hidden="true" /> Copiar chave privada</button>
          {copied && <p className="fr-muted" role="status">{copied}</p>}
          <button className="fr-secondary" disabled={busy} onClick={onLock}><LockKeyhole size={17} aria-hidden="true" /> Bloquear cofre</button>
        </section>
        <section className="fr-glass fr-pad fr-stack">
          <h2>Exportar lançamentos</h2>
          <p className="fr-muted">O CSV contém os lançamentos de todos os meses e pode ser aberto em uma planilha. Guarde o arquivo em local privado.</p>
          <button className="fr-secondary" disabled={!family.entries.length} onClick={exportCsv}><Download size={17} aria-hidden="true" /> Baixar CSV</button>
        </section>
      </div>
    </div>
  </>
}
