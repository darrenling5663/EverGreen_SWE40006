import test from 'node:test'
import assert from 'node:assert/strict'
import { dateKey, weekStart, periodSummary, paymentBreakdown, dailyBreakdown, dueDate } from '../src/utils/periods.js'

const now = new Date(2026, 9, 29, 12)
const records = [
  { date:'2026-10-29',amount:11.5,paymentMethod:'Cash' },
  { date:'2026-10-26',amount:20,paymentMethod:'Debit Card' },
  { date:'2026-10-01',amount:40,paymentMethod:'Credit Card' },
  { date:'2026-04-05',amount:55.25,paymentMethod:'Touch ‘n Go eWallet' },
  { date:'2025-12-31',amount:100 },
]
test('week starts Monday and excludes earlier days', () => {
  assert.equal(weekStart(now),'2026-10-26')
  assert.equal(dateKey(now),'2026-10-29')
  const result=periodSummary(records,now,'2026-04')
  assert.equal(result.today,11.5)
  assert.equal(result.week,31.5)
  assert.equal(result.month,71.5)
  assert.equal(result.year,126.75)
  assert.equal(result.selectedTotal,55.25)
  assert.equal(result.selectedCount,1)
})
test('payment methods use safe fallback for existing V8 data', () => {
  assert.deepEqual(paymentBreakdown(records.filter(x=>x.date.startsWith('2026-10'))), [
    {name:'Credit Card',value:40},{name:'Debit Card',value:20},{name:'Cash',value:11.5}
  ])
  assert.deepEqual(paymentBreakdown([{amount:3,date:'2026-10-01'}]),[{name:'Others',value:3}])
})
test('daily chart and due date use correct month lengths',()=>{
  const october=dailyBreakdown(records.filter(x=>x.date.startsWith('2026-10')),'2026-10')
  assert.equal(october.length,31)
  assert.equal(october[28].total,11.5)
  assert.equal(october[25].total,20)
  assert.equal(dueDate('2026-02',31),'2026-02-28')
  assert.equal(dueDate('2028-02',31),'2028-02-29')
})
