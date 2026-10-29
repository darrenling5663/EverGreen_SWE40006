import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultPreferences, normalizePreferences, addPreference, removePreference } from '../src/data/preferences.js'
import { makeExpensesCsv } from '../src/utils/csv.js'

test('default personalization lists include Malaysian bank names and investment types', () => {
  const prefs = defaultPreferences()
  assert.ok(prefs.banks.includes('Maybank'))
  assert.ok(prefs.investmentTypes.includes('ETFs'))
  assert.ok(prefs.categories.includes('Food & Drinks'))
})

test('add custom bank, merchant and category without modifying original default lists', () => {
  const prefs = defaultPreferences()
  const bank = addPreference(prefs, 'banks', 'NewBank')
  assert.equal(bank.ok, true)
  assert.ok(bank.next.banks.includes('NewBank'))
  assert.equal(prefs.banks.includes('NewBank'), false)
  const merchant = addPreference(bank.next, 'merchants', 'My Local Cafe')
  assert.equal(merchant.ok, true)
  const category = addPreference(merchant.next, 'categories', 'Pet Care')
  assert.equal(category.ok, true)
  assert.ok(category.next.categories.includes('Pet Care'))
})

test('invalid, duplicate and malformed custom values are safely rejected', () => {
  const prefs = defaultPreferences()
  assert.equal(addPreference(prefs, 'banks', ' maybank ').ok, false)
  assert.equal(addPreference(prefs, 'banks', '  ').ok, false)
  assert.equal(addPreference(prefs, 'banks', 'x'.repeat(61)).ok, false)
  assert.equal(addPreference(prefs, 'passwords', 'bank').ok, false)
  const normalized = normalizePreferences({ banks: [' Maybank ', 'maybank', 19, '', 'CIMB'] })
  assert.deepEqual(normalized.banks, ['Maybank', 'CIMB'])
  assert.ok(Array.isArray(normalized.categories))
})

test('removing a saved option does not affect unrelated settings', () => {
  const prefs = defaultPreferences()
  const next = removePreference(prefs, 'banks', 'RHB')
  assert.ok(!next.banks.includes('RHB'))
  assert.deepEqual(next.merchants, prefs.merchants)
})

test('CSV exports provider, brand and tags without breaking older data', () => {
  const csv = makeExpensesCsv([
    { date: '2026-10-29', description: 'Coffee', category: 'Food & Drinks', amount: 16.2, paymentMethod: 'Debit Card', bankName: 'Maybank', merchant: 'Local Coffee', tags: ['work', 'study'] },
    { date: '2026-10-28', description: 'Lunch', category: 'Food & Drinks', amount: 22.0 },
  ])
  assert.ok(csv.includes('"Bank / Wallet","Merchant / Brand","Tags"'))
  assert.ok(csv.includes('"Maybank","Local Coffee","work; study"'))
  assert.ok(csv.includes('"2026-10-28","Lunch","Food & Drinks","22.00","","Others","","",""'))
})
