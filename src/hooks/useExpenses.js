import { useEffect, useMemo, useState } from 'react'
import { expenseRepository } from '../services/expenseRepository'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExpenses(expenseRepository.load())
      setLoading(false)
    }, 320)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading) expenseRepository.save(expenses)
  }, [expenses, loading])

  const actions = useMemo(() => ({
    add(expense) {
      setExpenses((current) => [
        { ...expense, id: crypto.randomUUID() },
        ...current,
      ])
    },
    update(id, values) {
      setExpenses((current) => current.map((item) => item.id === id ? { ...item, ...values } : item))
    },
    remove(id) {
      setExpenses((current) => current.filter((item) => item.id !== id))
    },
    reset() {
      setExpenses(expenseRepository.reset())
    },
    clear() {
      setExpenses(expenseRepository.clear())
    },
  }), [])

  return { expenses, loading, ...actions }
}
