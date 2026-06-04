const STORAGE_PREFIX = 'expense-tracker'

export const STORAGE_KEYS = {
  users: `${STORAGE_PREFIX}:users`,
  session: `${STORAGE_PREFIX}:session`,
  expenses: `${STORAGE_PREFIX}:expenses`,
  categories: `${STORAGE_PREFIX}:categories`,
  budgets: `${STORAGE_PREFIX}:budgets`,
  preferences: `${STORAGE_PREFIX}:preferences`,
  recurringRules: `${STORAGE_PREFIX}:recurring-rules`,
  legacyExpenses: 'expenses',
}

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key) {
  localStorage.removeItem(key)
}
