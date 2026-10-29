import { useEffect, useState } from 'react'
import { PREFERENCES_KEY, defaultPreferences, normalizePreferences, addPreference, removePreference } from '../data/preferences.js'

const load = () => {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY)
    return raw === null ? defaultPreferences() : normalizePreferences(JSON.parse(raw))
  } catch { return defaultPreferences() }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)) }
    catch (error) { console.warn('Unable to store personalization settings', error) }
  }, [preferences])
  const add = (key, value) => {
    const result = addPreference(preferences, key, value)
    if (result.ok) setPreferences(result.next)
    return result
  }
  const remove = (key, value) => setPreferences(current => removePreference(current, key, value))
  const reset = () => setPreferences(defaultPreferences())
  return { preferences, add, remove, reset }
}
