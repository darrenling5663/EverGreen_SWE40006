const monthFormatter = new Intl.DateTimeFormat('en-MY', { month: 'short' })
export const currency = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 })
export const amountText = (amount) => new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0)
export const formatDate = (iso) => new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${iso}T00:00:00`))

export function getAnalytics(expenses, now = new Date()) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id)))
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthList = expenses.filter((item) => item.date.startsWith(currentMonth))
  const thisMonth = thisMonthList.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const averageDaily = thisMonth / Math.max(now.getDate(), 1)

  const categoryMap = expenses.reduce((map, item) => {
    map[item.category] = (map[item.category] || 0) + Number(item.amount || 0)
    return map
  }, {})
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value: +value.toFixed(2) })).sort((a,b) => b.value - a.value)
  const highestCategory = categoryData[0] || { name: 'No spending yet', value: 0 }

  const months = []
  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push({ key, month: monthFormatter.format(date), total: 0, current: offset === 0 })
  }
  const map = Object.fromEntries(months.map((month) => [month.key, month]))
  expenses.forEach((item) => { const bucket = map[item.date.slice(0, 7)]; if (bucket) bucket.total += Number(item.amount || 0) })
  const monthlyData = months.map((month) => ({ ...month, total: +month.total.toFixed(2) }))

  const previous = monthlyData.at(-2)?.total ?? 0
  const latest = monthlyData.at(-1)?.total ?? 0
  let trendStatus = 'flat'
  let trendPercent = 0
  if (previous === 0 && latest > 0) {
    trendStatus = 'no-baseline'
    trendPercent = null
  } else if (previous > 0) {
    const raw = ((latest - previous) / previous) * 100
    trendPercent = raw
    trendStatus = Math.abs(raw) < 0.005 ? 'flat' : raw > 0 ? 'up' : 'down'
  }

  return {
    total, thisMonth, averageDaily, transactionCount: expenses.length,
    currentMonthCount: thisMonthList.length, categoryData, highestCategory,
    monthlyData, previousMonth: previous, trendStatus, trendPercent, recent: sorted.slice(0, 5),
  }
}
