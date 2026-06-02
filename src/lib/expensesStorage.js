import { readJson, removeItem, STORAGE_KEYS, writeJson } from './storage.js'

function getExpenseMap() {
  const map = readJson(STORAGE_KEYS.expenses, {})
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {}
}

function saveExpenseMap(map) {
  writeJson(STORAGE_KEYS.expenses, map)
}

export function getExpensesForUser(userId) {
  if (!userId) return []
  const expenses = getExpenseMap()[userId]
  return Array.isArray(expenses) ? expenses : []
}

export function saveExpensesForUser(userId, expenses) {
  if (!userId) return
  const map = getExpenseMap()
  map[userId] = expenses
  saveExpenseMap(map)
}

export function migrateLegacyExpenses(userId) {
  if (!userId) return

  const legacyRaw = localStorage.getItem(STORAGE_KEYS.legacyExpenses)
  if (!legacyRaw) return

  try {
    const parsed = JSON.parse(legacyRaw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      removeItem(STORAGE_KEYS.legacyExpenses)
      return
    }

    const current = getExpensesForUser(userId)
    if (current.length === 0) {
      saveExpensesForUser(userId, parsed)
    }
  } catch {
    // Ignore invalid legacy data
  } finally {
    removeItem(STORAGE_KEYS.legacyExpenses)
  }
}
