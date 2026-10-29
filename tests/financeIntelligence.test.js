import test from 'node:test'
import assert from 'node:assert/strict'
import { getTransferCandidates, getBillChanges, depositForecast, purchaseDeadline, validDate, daysBetween } from '../src/utils/financeIntelligence.js'

test('guard flags transfer-like descriptions without automatically deleting expenses', () => {
 const expenses=[{id:1, description:'Lunch'}, {id:2,description:'Transfer to Maybank'}, {id:3,description:'Credit card repayment'}]
 assert.deepEqual(getTransferCandidates(expenses).map(x=>x.id),[2,3]); assert.equal(expenses.length,3)
 assert.deepEqual(getTransferCandidates(expenses,[{originalExpenseId:2}]).map(x=>x.id),[3])
})
test('bill warnings only on recorded actuals with material increases', () => {
 const bills=[{id:'a',name:'Mobile',amount:80,actualAmounts:{'2026-09':80,'2026-10':110}},{id:'b',name:'Rent',amount:900,actualAmounts:{'2026-10':902}},{id:'c',name:'Electric',amount:55}]
 const changes=getBillChanges(bills,'2026-10'); assert.equal(changes.length,2);assert.equal(changes[0].warning,true);assert.equal(changes[1].warning,false)
})
test('date validators reject impossible dates',()=>{assert.equal(validDate('2026-02-29'),false);assert.equal(validDate('2028-02-29'),true);assert.equal(daysBetween('2026-10-29','2026-11-01'),3)})
test('fixed deposit estimates simple (non-guaranteed) interest and maturity status',()=>{
 const info=depositForecast({type:'Fixed Deposit',balance:10000,annualRate:3.65,openedOn:'2026-01-01',maturesOn:'2027-01-01'},'2026-12-15')
 assert.equal(info.projectedInterest,365);assert.equal(info.remaining,17);assert.equal(info.soon,true)
 assert.equal(depositForecast({type:'Savings',balance:100},'2026-12-15'),null)
})
test('purchase alerts honor received refunds and time windows',()=>{
 assert.equal(purchaseDeadline({returnBy:'2026-11-01',refundStatus:'none'},'2026-10-29').urgent,true)
 assert.equal(purchaseDeadline({returnBy:'2026-11-01',refundStatus:'received'},'2026-10-29'),null)
})
