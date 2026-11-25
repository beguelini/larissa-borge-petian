import { describe, expect, it } from 'vitest'
import { blankFamily, blankPlan, blankTrip, csv, estimate, getPlan, monthlySummary, splitEntry, type Entry } from './model'

const entry: Entry = {
  id: 'original', label: 'Compra', cents: 10000, date: '2026-01-31',
  category: 'food', who: 'Família', method: 'Crédito', paid: true,
}

describe('Orçamento familiar', () => {
  it('soma os limites sugeridos no orçamento de R$ 8.000 e respeita o histórico de alterações', () => {
    expect(Object.values(blankPlan.caps).reduce((a, b) => a + b, 0)).toBe(800000)
    const family = { ...blankFamily, plans: { '2026-12': { ...blankPlan, limit: 750000 } } }
    expect(getPlan(family, '2026-11').limit).toBe(800000)
    expect(getPlan(family, '2027-01').limit).toBe(750000)
  })

  it('considera pagamentos, pendências e aportes uma vez no saldo', () => {
    expect(monthlySummary([
      entry, { ...entry, paid: false, cents: 2500 }, { ...entry, category: 'trip', cents: 5000 },
    ], 25000)).toEqual({ paid: 10000, pending: 2500, saved: 5000, available: 7500 })
  })

  it('mantém os centavos e ajusta os vencimentos ao parcelar no fim do mês', () => {
    const installments = splitEntry(entry, 3)
    expect(installments.map(item => [item.date, item.cents, item.paid])).toEqual([
      ['2026-01-31', 3334, true], ['2026-02-28', 3333, false], ['2026-03-31', 3333, false],
    ])
    expect(new Set(installments.map(item => item.id)).size).toBe(3)
  })

  it('calcula viagem com margem e trata pedágio zero como confirmado', () => {
    expect(estimate(blankTrip, []).complete).toBe(false)
    const trip = { ...blankTrip, km: '1000', efficiency: '10', price: '6', tolls: '0',
      ferry: '80', nights: '2', camp: '70', extras: '60', margin: '10', saved: '100' }
    expect(estimate(trip, [{ ...entry, category: 'trip' }])).toMatchObject({
      complete: true, fuel: 60000, camping: 14000, margin: 8800, total: 96800, saved: 20000, gap: 76800,
    })
    expect(estimate({ ...trip, tolls: '' }, []).complete).toBe(false)
  })

  it('neutraliza descrições interpretadas como fórmula pelo aplicativo de planilha', () => {
    expect(csv({ ...blankFamily, entries: [{ ...entry, label: '=2+2' }] })).toContain(`"'=2+2"`)
  })
})
