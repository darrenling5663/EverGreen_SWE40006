// Export is client-side only. Escape spreadsheet formulas to prevent CSV injection.
const safeCell = (value) => {
  let text = String(value ?? '')
  if (/^[\t\r\n ]*[=+@-]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function makeExpensesCsv(expenses) {
  const rows = [
    ['Date', 'Description', 'Category', 'Amount (MYR)', 'Notes', 'Payment Method', 'Bank / Wallet', 'Merchant / Brand', 'Tags'],
    ...expenses.map(item => [item.date, item.description, item.category, Number(item.amount).toFixed(2), item.notes || '', item.paymentMethod || 'Others', item.bankName || '', item.merchant || '', Array.isArray(item.tags) ? item.tags.join('; ') : (item.tags || '')]),
  ]
  return '\uFEFF' + rows.map(row => row.map(safeCell).join(',')).join('\r\n')
}

export function downloadExpensesCsv(expenses) {
  const blob = new Blob([makeExpensesCsv(expenses)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `evergreen-expenses-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
