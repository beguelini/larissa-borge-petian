export const categories = [
  ['stay', 'Estadia e estacionamento', 1200],
  ['food', 'Alimentação', 1300],
  ['transport', 'Deslocamento local', 450],
  ['gym', 'Academia', 250],
  ['doctor', 'Psiquiatria e consultas', 450],
  ['medicine', 'Remédios', 250],
  ['health', 'Plano de saúde', 800],
  ['card', 'Fatura anterior e encargos', 600],
  ['maintenance', 'Manutenção do motorhome', 500],
  ['leisure', 'Lazer', 400],
  ['household', 'Internet, gás e outros', 200],
  ['emergency', 'Reserva de emergência', 600],
  ['trip', 'Fundo da viagem', 1000],
] as const

export type Category = typeof categories[number][0]
export type Entry = {
  id: string
  label: string
  cents: number
  date: string
  category: Category
  who: string
  method: string
  paid: boolean
}
export const tripFields = [
  ['km', 'Distância total (km)', '1'],
  ['efficiency', 'Consumo (km/L)', '0.01'],
  ['price', 'Preço por litro (R$)', '0.01'],
  ['tolls', 'Pedágios (R$)', '0.01'],
  ['ferry', 'Balsa (R$)', '0.01'],
  ['nights', 'Noites de camping', '1'],
  ['camp', 'Diária do camping (R$)', '0.01'],
  ['extras', 'Alimentação e outros na estrada (R$)', '0.01'],
  ['margin', 'Margem para imprevistos (%)', '1'],
] as const
export type Trip = { title: string; route: string; date: string; saved: string } & Record<typeof tripFields[number][0], string>
export type Plan = { limit: number; caps: Record<Category, number> }
export type Family = { version: 1; entries: Entry[]; plans: Record<string, Plan>; trip: Trip }

export const blankPlan: Plan = {
  limit: 800000,
  caps: Object.fromEntries(categories.map(([key, , value]) => [key, value * 100])) as Plan['caps'],
}
export const blankTrip: Trip = {
  title: 'Nossa viagem', route: '', date: '', saved: '', km: '', efficiency: '', price: '',
  tolls: '', ferry: '', nights: '', camp: '', extras: '', margin: '10',
}
export const blankFamily: Family = { version: 1, entries: [], plans: {}, trip: blankTrip }
export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const money = (cents: number) => brl.format(cents / 100)
export const sum = (entries: Entry[]) => entries.reduce((total, entry) => total + entry.cents, 0)
export const isReserve = (key: Category) => key === 'emergency' || key === 'trip'
export const categoryLabel = (key: Category) => categories.find(([id]) => id === key)?.[1] ?? key

export function today() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

export function monthLabel(month: string) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(month + '-01T12:00:00Z'))
}

export function shortDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(date + 'T12:00:00Z'))
}

export function shiftMonth(month: string, offset: number) {
  const [year, number] = month.split('-').map(Number)
  return new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7)
}

export function getPlan(family: Family, month: string) {
  const effectiveMonth = Object.keys(family.plans).filter(key => key <= month).sort().at(-1)
  return effectiveMonth ? family.plans[effectiveMonth] : blankPlan
}

export function cents(value: string | number) {
  const number = typeof value === 'string' ? Number(value.replace(',', '.')) : value
  return Number.isFinite(number) ? Math.round(number * 100) : 0
}

export function monthlySummary(entries: Entry[], budget: number) {
  const paid = sum(entries.filter(entry => entry.paid && !isReserve(entry.category)))
  const pending = sum(entries.filter(entry => !entry.paid))
  const saved = sum(entries.filter(entry => entry.paid && isReserve(entry.category)))
  return { paid, pending, saved, available: budget - paid - pending - saved }
}

export function estimate(trip: Trip, entries: Entry[]) {
  const km = Number(trip.km)
  const efficiency = Number(trip.efficiency)
  const price = Number(trip.price)
  const complete = km > 0 && efficiency > 0 && price > 0 && trip.tolls.trim() !== '' &&
    (Number(trip.nights) === 0 || trip.camp.trim() !== '')
  const fuel = km && efficiency && price ? cents(km / efficiency * price) : 0
  const tolls = cents(trip.tolls)
  const ferry = cents(trip.ferry)
  const camping = cents(Number(trip.nights) * Number(trip.camp))
  const extras = cents(trip.extras)
  const subtotal = fuel + tolls + ferry + camping + extras
  const margin = Math.round(subtotal * Number(trip.margin) / 100)
  const total = subtotal + margin
  const saved = cents(trip.saved) + sum(entries.filter(entry => entry.category === 'trip' && entry.paid))
  return { complete, fuel, tolls, ferry, camping, extras, margin, total, saved, gap: Math.max(0, total - saved) }
}

export function splitEntry(entry: Entry, installments: number) {
  const base = Math.floor(entry.cents / installments)
  const remainder = entry.cents % installments
  return Array.from({ length: installments }, (_, index): Entry => {
    if (installments === 1) return entry
    const month = shiftMonth(entry.date.slice(0, 7), index)
    const lastDay = new Date(shiftMonth(month, 1) + '-01T00:00:00Z').getTime() - 86400000
    const day = Math.min(Number(entry.date.slice(-2)), new Date(lastDay).getUTCDate())
    return {
      ...entry, id: crypto.randomUUID(), label: `${entry.label} (${index + 1}/${installments})`,
      cents: base + Number(index < remainder), paid: index === 0 && entry.paid,
      date: month + '-' + String(day).padStart(2, '0'),
    }
  })
}

export function csv(family: Family) {
  const cell = (value: string) => {
    const text = /^\s*[=+@-]/.test(value) ? "'" + value : value
    return '"' + text.replaceAll('"', '""') + '"'
  }
  return '\uFEFF' + [
    ['Data', 'Descrição', 'Categoria', 'Responsável', 'Pagamento', 'Status', 'Valor (R$)'],
    ...[...family.entries].sort((a, b) => b.date.localeCompare(a.date)).map(entry => [
      entry.date, entry.label, categoryLabel(entry.category), entry.who, entry.method,
      entry.paid ? 'Concluído' : 'Pendente', (entry.cents / 100).toFixed(2).replace('.', ','),
    ]),
  ].map(row => row.map(cell).join(';')).join('\r\n')
}
