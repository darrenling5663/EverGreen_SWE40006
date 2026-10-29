import test from 'node:test'
import assert from 'node:assert/strict'
import { makeExpensesCsv } from '../src/utils/csv.js'

test('CSV exports every supplied field with Malaysian currency amounts', () => {
  const csv = makeExpensesCsv([{ date: '2026-10-29', description: 'Lunch', category: 'Food & Drinks', amount: 25.5, notes: 'Campus' }])
  assert.match(csv, /"Date","Description","Category","Amount \(MYR\)","Notes","Payment Method"/)
  assert.match(csv, /"2026-10-29","Lunch","Food & Drinks","25.50","Campus","Others"/)
})

test('CSV escapes commas, quotes and spreadsheet formulas in text fields', () => {
  const csv = makeExpensesCsv([{ date: '2026-10-29', description: '=HYPERLINK("bad","bad")', category: 'Other', amount: 2, notes: 'Hi, "there"' }])
  assert.ok(csv.includes("'="))
  assert.ok(csv.includes('"Hi, ""there"""'))
})

test('CSV handles an empty filtered list with a header', () => {
  assert.equal(makeExpensesCsv([]).split('\r\n').length, 1)
})
