import test from 'node:test'
import assert from 'node:assert/strict'
import { getAnalytics, amountText } from '../src/utils/analytics.js'
const d = (description, amount, category, date, id) => ({ description, amount, category, date, id, notes: '' })
const now = new Date('2026-10-27T12:00:00')

test('empty expenses have zero spending and no misleading trend', () => {
  const a = getAnalytics([], now)
  assert.equal(a.total, 0)
  assert.equal(a.thisMonth, 0)
  assert.equal(a.transactionCount, 0)
  assert.equal(a.trendStatus, 'flat')
  assert.equal(a.highestCategory.name, 'No spending yet')
  assert.deepEqual(a.categoryData, [])
})
test('totals, categories, recents and current monthly average are calculated from entries', () => {
  const rows = [
    d('A', 18.5, 'Food & Drinks', '2026-10-01', 'a'),
    d('B', 20, 'Transportation', '2026-10-25', 'b'),
    d('C', 15.5, 'Food & Drinks', '2026-09-19', 'c'),
  ]
  const a = getAnalytics(rows, now)
  assert.equal(a.total, 54)
  assert.equal(a.thisMonth, 38.5)
  assert.equal(a.currentMonthCount, 2)
  assert.equal(a.averageDaily, 38.5 / 27)
  assert.equal(a.highestCategory.name, 'Food & Drinks')
  assert.equal(a.recent[0].id, 'b')
  assert.equal(a.monthlyData.at(-1).total, 38.5)
  assert.equal(a.trendStatus, 'up')
})
test('previous month zero and current month positive has unavailable percentage baseline', () => {
  const a = getAnalytics([d('A',100,'Shopping','2026-10-03','a')], now)
  assert.equal(a.trendStatus, 'no-baseline')
  assert.equal(a.trendPercent, null)
})
test('spending reduction and unchanged spending are distinguished', () => {
  const lower = getAnalytics([d('A',200,'Shopping','2026-09-01','a'),d('B',100,'Shopping','2026-10-03','b')], now)
  assert.equal(lower.trendStatus, 'down')
  assert.equal(lower.trendPercent, -50)
  const flat = getAnalytics([d('A',100,'Shopping','2026-09-01','a'),d('B',100,'Shopping','2026-10-03','b')], now)
  assert.equal(flat.trendStatus, 'flat')
  assert.equal(flat.trendPercent, 0)
})
test('large MYR numbers format accurately', () => {
  assert.equal(amountText(1234567890.55), '1,234,567,890.55')
})
