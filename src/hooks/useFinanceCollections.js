import { useEffect, useState } from 'react'

// A dedicated repository boundary: future Flask endpoints can replace localStorage.
function load(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return structuredClone(seed)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : structuredClone(seed)
  } catch { return structuredClone(seed) }
}
export function useFinanceCollection(key, seed) {
  const [records, setRecords] = useState(() => load(key, seed))
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(records)) } catch (e) { console.warn('Unable to save local finance records', e) }
  }, [key, records])
  const add = (values) => setRecords(current => [{ ...values, id: crypto.randomUUID() }, ...current])
  const update = (id, patch) => setRecords(current => current.map(row => row.id === id ? { ...row, ...patch } : row))
  const remove = (id) => setRecords(current => current.filter(row => row.id !== id))
  const reset = () => setRecords(structuredClone(seed))
  const clear = () => {
    try { localStorage.setItem(key, '[]') } catch { /* React state still updates for this session. */ }
    setRecords([])
  }
  return { records, add, update, remove, reset, clear }
}
