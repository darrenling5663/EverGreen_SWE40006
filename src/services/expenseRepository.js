import { sampleExpenses } from '../data/sampleExpenses.js'

const STORAGE_KEY = 'evergreen-expense-items-v1'

export const expenseRepository = {
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleExpenses))
        return sampleExpenses
      }
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : sampleExpenses
    } catch {
      return sampleExpenses
    }
  },

  save(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
  },

  // Clear all expense records without re-inserting the sample dataset.
  // Persist [] so a refresh does not trigger first-run demo seeding.
  clear() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    return []
  },

  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleExpenses))
    return sampleExpenses
  },
}

// Future backend integration:
// Replace this repository with fetch/axios calls to a Flask REST API while
// keeping the component-facing data shape unchanged.
