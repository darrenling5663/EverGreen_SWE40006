// Rule-based, manual-first helpers. Nothing connects to a bank or moves real funds.
export const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100
export const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
}
export const daysBetween = (start, end) => validDate(start) && validDate(end) ? Math.round((Date.parse(end+'T00:00:00Z') - Date.parse(start+'T00:00:00Z')) / 86400000) : null

const transferPatterns = [
  /\btransfer\s+(?:to|from)\b/i, /\bself[ -]?transfer\b/i, /\bown account\b/i,
  /\be[ -]?wallet\s+top[ -]?up\b/i, /\btng\s+top[ -]?up\b/i,
  /\bcredit card (?:repayment|payment)\b/i, /\bcard repayment\b/i,
  /\bduitnow transfer\b/i,
]
export const getTransferCandidates = (expenses, transfers = []) => {
  const moved = new Set(transfers.map(item => String(item.originalExpenseId || '')).filter(Boolean))
  return expenses.filter(item => !moved.has(String(item.id)) && transferPatterns.some(pattern => pattern.test(item.description || '')))
}

// Only compare a bill's recorded ACTUAL amounts, falling back to the planned
// monthly amount for the first observation. Ignore missing months rather than
// inventing a bill history.
export function getBillChanges(bills, month) {
  return bills.map(bill => {
    const actuals = bill.actualAmounts || {}
    const current = Number(actuals[month])
    if (!Object.prototype.hasOwnProperty.call(actuals, month) || !Number.isFinite(current) || current < 0) return null
    const older = Object.keys(actuals).filter(key => key < month && Number.isFinite(Number(actuals[key]))).sort().at(-1)
    const baseline = older ? Number(actuals[older]) : Number(bill.amount)
    if (!Number.isFinite(baseline) || baseline <= 0) return null
    const delta = money(current - baseline)
    const percent = delta / baseline * 100
    return { id: bill.id, name: bill.name, current, baseline, delta, percent, baselineLabel: older || 'planned amount', warning: delta >= 10 && percent >= 15 }
  }).filter(Boolean)
}

export const purchaseDeadline = (purchase, today) => {
  if (!purchase.returnBy || !validDate(purchase.returnBy) || purchase.refundStatus === 'received') return null
  const days = daysBetween(today, purchase.returnBy)
  if (days === null) return null
  return { days, urgent: days >= 0 && days <= 7, expired: days < 0 }
}

export function depositForecast(asset, today) {
  if (asset.type !== 'Fixed Deposit' || !validDate(asset.maturesOn)) return null
  const remaining = daysBetween(today, asset.maturesOn)
  const duration = daysBetween(asset.openedOn, asset.maturesOn)
  const principal = Number(asset.balance)
  const rate = asset.annualRate === '' || asset.annualRate === null || asset.annualRate === undefined ? NaN : Number(asset.annualRate)
  const projectedInterest = duration > 0 && principal >= 0 && Number.isFinite(rate) && rate >= 0
    ? money(principal * rate / 100 * duration / 365) : null
  return { remaining, projectedInterest, maturityDate: asset.maturesOn, overdue: remaining < 0, soon: remaining >= 0 && remaining <= 30 }
}
