import { useState } from 'react'

const STORAGE_KEY = 'evergreen-expense-monthly-budget-v1'
const DEFAULT_BUDGET = 1500

function readBudget() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_BUDGET
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 ? value : DEFAULT_BUDGET
  } catch { return DEFAULT_BUDGET }
}

export function useBudget() {
  const [budget, setBudgetValue] = useState(readBudget)
  const setBudget = (value) => {
    const n = Number(value)
    if (!Number.isFinite(n) || n < 0 || n > 1000000000) return false
    const rounded = Math.round(n * 100) / 100
    try { localStorage.setItem(STORAGE_KEY, String(rounded)) } catch { /* Still available for this session. */ }
    setBudgetValue(rounded)
    return true
  }
  return { budget, setBudget }
}
