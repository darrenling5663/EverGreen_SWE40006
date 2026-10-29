import { categories } from './sampleExpenses.js'

export const PREFERENCES_KEY = 'evergreen-preferences-v1'
export const preferenceGroups = {
  banks: {
    title: 'Banks & wallets', description: 'The bank, eWallet or financial provider linked to a transaction.',
    examples: 'Maybank, CIMB, RHB, GXBank, Touch ’n Go eWallet',
    defaults: ['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong Bank', 'Bank Islam', 'GXBank', 'Touch ’n Go eWallet'],
  },
  merchants: {
    title: 'Merchants & brands', description: 'Keep your favourite shops, services and merchants in one reusable list.',
    examples: 'Grab, Shopee, Jaya Grocer, Netflix',
    defaults: ['Grab', 'Shopee', 'Jaya Grocer', 'Uniqlo', 'Maxis', 'Spotify', 'GSC', 'Watsons'],
  },
  categories: {
    title: 'Expense categories', description: 'Organise spending in ways that match your actual lifestyle.',
    examples: 'Pet care, Side projects, Family, Travel', defaults: categories,
  },
  investmentTypes: {
    title: 'Investment types', description: 'Describe investments without connecting brokerage or bank accounts.',
    examples: 'Stocks, ETFs, REITs, Unit Trust',
    defaults: ['Stocks / Shares', 'ETFs', 'Unit Trust', 'Bonds', 'REITs', 'ASB / ASM', 'Gold', 'Crypto', 'Other'],
  },
}

export const preferenceKeys = Object.keys(preferenceGroups)
export const defaultPreferences = () => Object.fromEntries(preferenceKeys.map(k => [k, [...preferenceGroups[k].defaults]]))

export function normalizePreferences(value) {
  const base = defaultPreferences()
  if (!value || typeof value !== 'object') return base
  for (const key of preferenceKeys) {
    if (!Array.isArray(value[key])) continue
    const seen = new Set()
    base[key] = value[key].filter(item => {
      if (typeof item !== 'string' || !item.trim() || item.trim().length > 60) return false
      const lower = item.trim().toLocaleLowerCase()
      if (seen.has(lower)) return false
      seen.add(lower)
      return true
    }).map(item => item.trim())
  }
  return base
}

export function addPreference(preferences, key, input) {
  if (!preferenceKeys.includes(key)) return { ok: false, message: 'Unknown preference group.' }
  const value = String(input ?? '').trim().replace(/\s+/g, ' ')
  if (value.length < 2 || value.length > 60) return { ok: false, message: 'Use a name between 2 and 60 characters.' }
  if (preferences[key].some(item => item.toLocaleLowerCase() === value.toLocaleLowerCase())) return { ok: false, message: 'That name already exists in this list.' }
  return { ok: true, value, next: { ...preferences, [key]: [...preferences[key], value].sort((a,b) => a.localeCompare(b)) } }
}

export function removePreference(preferences, key, name) {
  if (!preferenceKeys.includes(key)) return preferences
  return { ...preferences, [key]: preferences[key].filter(item => item !== name) }
}
