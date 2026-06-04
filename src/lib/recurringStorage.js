import { readJson, STORAGE_KEYS, writeJson } from './storage.js'

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7)
}

function getRuleMap() {
  const map = readJson(STORAGE_KEYS.recurringRules, {})
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {}
}

function saveRuleMap(map) {
  writeJson(STORAGE_KEYS.recurringRules, map)
}

function sanitizeRule(rule) {
  return {
    id: rule.id,
    name: rule.name,
    amount: Number(rule.amount) || 0,
    category: rule.category,
    startDate: rule.startDate || new Date().toISOString().slice(0, 10),
    paid: Boolean(rule.paid),
    active: rule.active !== false,
    lastGeneratedMonth: rule.lastGeneratedMonth ?? '',
    createdAt: rule.createdAt ?? new Date().toISOString(),
  }
}

export function getRecurringRulesForUser(userId) {
  if (!userId) return []

  const rules = getRuleMap()[userId]
  return Array.isArray(rules) ? rules.map(sanitizeRule) : []
}

export function saveRecurringRulesForUser(userId, rules) {
  if (!userId) return

  const map = getRuleMap()
  map[userId] = rules.map(sanitizeRule)
  saveRuleMap(map)
}

export function getDueRecurringExpenses(rules, expenses) {
  const currentMonth = getCurrentMonthKey()
  const existingKeys = new Set(
    expenses
      .filter((expense) => expense.recurringRuleId && expense.recurringMonth)
      .map((expense) => `${expense.recurringRuleId}:${expense.recurringMonth}`),
  )

  return rules
    .filter((rule) => {
      const startMonth = rule.startDate.slice(0, 7)
      return (
        rule.active &&
        rule.amount > 0 &&
        startMonth <= currentMonth &&
        rule.lastGeneratedMonth !== currentMonth &&
        !existingKeys.has(`${rule.id}:${currentMonth}`)
      )
    })
    .map((rule) => ({
      rule,
      expense: {
        id: crypto.randomUUID(),
        name: rule.name,
        amount: rule.amount,
        category: rule.category,
        paid: rule.paid,
        date: new Date().toISOString().slice(0, 10),
        recurringRuleId: rule.id,
        recurringMonth: currentMonth,
      },
    }))
}

export function markRulesGenerated(rules, generatedItems) {
  if (generatedItems.length === 0) return rules

  const generatedRuleIds = new Set(generatedItems.map((item) => item.rule.id))
  const currentMonth = getCurrentMonthKey()

  return rules.map((rule) =>
    generatedRuleIds.has(rule.id)
      ? { ...rule, lastGeneratedMonth: currentMonth }
      : rule,
  )
}
