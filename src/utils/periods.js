const pad = n => String(n).padStart(2, '0')
export const dateKey = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`
export const monthKey = date => dateKey(date).slice(0,7)
export const safeAmount = x => Number.isFinite(Number(x)) ? Number(x) : 0
export const sumAmount = items => items.reduce((n, item) => n + safeAmount(item.amount), 0)
export function weekStart(now) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = (date.getDay() + 6) % 7 // Monday-start week
  date.setDate(date.getDate() - day)
  return dateKey(date)
}
export function periodSummary(expenses, now = new Date(), selected = monthKey(now)) {
  const day = dateKey(now)
  const start = weekStart(now)
  const thisMonth = monthKey(now)
  const thisYear = String(now.getFullYear())
  const valid = expenses.filter(item => /^\d{4}-\d{2}-\d{2}$/.test(item.date || ''))
  const take = predicate => valid.filter(predicate)
  const today = take(item => item.date === day)
  const week = take(item => item.date >= start && item.date <= day)
  const month = take(item => item.date.startsWith(thisMonth))
  const year = take(item => item.date.startsWith(thisYear + '-'))
  const chosen = take(item => item.date.startsWith(selected)).sort((a,b) => b.date.localeCompare(a.date))
  return { today: sumAmount(today), week: sumAmount(week), month: sumAmount(month), year: sumAmount(year),
    counts: { today: today.length, week: week.length, month: month.length, year: year.length },
    selected: chosen, selectedTotal: sumAmount(chosen), selectedCount: chosen.length }
}
export function paymentBreakdown(items) {
  const by = new Map()
  for (const item of items) {
    const name = item.paymentMethod || 'Others'
    by.set(name, (by.get(name) || 0) + safeAmount(item.amount))
  }
  return [...by].map(([name,value])=>({name,value})).sort((a,b) => b.value-a.value)
}
export function dailyBreakdown(items, key) {
  const [year, month] = key.split('-').map(Number)
  const days = new Date(year, month, 0).getDate()
  const totals = new Map()
  for (const item of items) totals.set(Number(item.date.slice(8)), (totals.get(Number(item.date.slice(8))) || 0) + safeAmount(item.amount))
  return Array.from({ length: days }, (_, i) => ({ day: String(i+1), total: Math.round((totals.get(i+1)||0)*100)/100 }))
}
export function monthLabel(key) {
  const [y,m] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('en-MY',{month:'long',year:'numeric'}).format(new Date(y,m-1,1))
}
export function dueDate(month, day) {
  const [y,m]=month.split('-').map(Number)
  const last=new Date(y,m,0).getDate()
  return `${month}-${pad(Math.min(Math.max(1,day),last))}`
}
