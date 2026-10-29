import test from 'node:test'
import assert from 'node:assert/strict'
import { expenseRepository } from '../src/services/expenseRepository.js'

function storage() {
  const values = new Map()
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null },
    setItem(key, value) { values.set(key, String(value)) },
    removeItem(key) { values.delete(key) },
  }
}

test('clear replaces demo expenses with an empty persistent list', () => {
  globalThis.localStorage = storage()
  assert.ok(expenseRepository.load().length > 0, 'first-load demo seed')
  assert.deepEqual(expenseRepository.clear(), [])
  assert.deepEqual(expenseRepository.load(), [], 'refresh must stay empty')
  assert.equal(localStorage.getItem('evergreen-expense-items-v1'), '[]')
  delete globalThis.localStorage
})

test('after clearing, new spending can still be saved', () => {
  globalThis.localStorage = storage()
  expenseRepository.clear()
  const record = { id: 'one', description: 'Tea', amount: 4, category: 'Food & Drinks', date: '2026-10-29' }
  expenseRepository.save([record])
  assert.deepEqual(expenseRepository.load(), [record])
  delete globalThis.localStorage
})
