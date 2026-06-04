import { readJson, STORAGE_KEYS, writeJson } from './storage.js'

const DEFAULT_BUDGET = {
  monthlyBudget: 0,
  categoryBudgets: {},
}

function getBudgetMap() {
  const map = readJson(STORAGE_KEYS.budgets, {})
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {}
}

function saveBudgetMap(map) {
  writeJson(STORAGE_KEYS.budgets, map)
}

export function getBudgetForUser(userId) {
  if (!userId) return DEFAULT_BUDGET

  const budget = getBudgetMap()[userId]
  if (!budget || typeof budget !== 'object') return DEFAULT_BUDGET

  return {
    monthlyBudget: Number(budget.monthlyBudget) || 0,
    categoryBudgets:
      budget.categoryBudgets && typeof budget.categoryBudgets === 'object'
        ? budget.categoryBudgets
        : {},
  }
}

export function saveBudgetForUser(userId, budget) {
  if (!userId) return

  const map = getBudgetMap()
  map[userId] = {
    monthlyBudget: Math.max(0, Number(budget.monthlyBudget) || 0),
    categoryBudgets:
      budget.categoryBudgets && typeof budget.categoryBudgets === 'object'
        ? Object.fromEntries(
            Object.entries(budget.categoryBudgets).map(([category, amount]) => [
              category,
              Math.max(0, Number(amount) || 0),
            ]),
          )
        : {},
  }
  saveBudgetMap(map)
}
