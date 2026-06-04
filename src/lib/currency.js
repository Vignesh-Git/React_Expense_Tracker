import { readJson, STORAGE_KEYS, writeJson } from './storage.js'

export const DEFAULT_CURRENCY = 'USD'

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
]

export function getCurrencyByCode(code) {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0]
}

export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY, options = {}) {
  const currency = getCurrencyByCode(currencyCode)
  const value = Number(amount) || 0
  const formattedAmount = value.toLocaleString(undefined, {
    minimumFractionDigits: options.compact ? 0 : 2,
    maximumFractionDigits: options.compact ? 0 : 2,
  })

  return `${currency.symbol}${formattedAmount}`
}

function getPreferenceMap() {
  const map = readJson(STORAGE_KEYS.preferences, {})
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {}
}

function savePreferenceMap(map) {
  writeJson(STORAGE_KEYS.preferences, map)
}

export function getPreferencesForUser(userId) {
  if (!userId) return { currencyCode: DEFAULT_CURRENCY }

  const preferences = getPreferenceMap()[userId]
  const currencyCode = getCurrencyByCode(preferences?.currencyCode).code
  return { currencyCode }
}

export function savePreferencesForUser(userId, preferences) {
  if (!userId) return

  const map = getPreferenceMap()
  map[userId] = {
    currencyCode: getCurrencyByCode(preferences.currencyCode).code,
  }
  savePreferenceMap(map)
}
