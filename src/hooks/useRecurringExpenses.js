import { useCallback, useState } from 'react'
import {
  getRecurringRulesForUser,
  saveRecurringRulesForUser,
} from '../lib/recurringStorage.js'

export function useRecurringExpenses(userId) {
  const [localRules, setLocalRules] = useState(() => ({
    userId,
    rules: getRecurringRulesForUser(userId),
  }))

  const rules = localRules.userId === userId ? localRules.rules : getRecurringRulesForUser(userId)

  const persist = useCallback(
    (updater) => {
      const nextRules = typeof updater === 'function' ? updater(rules) : updater
      setLocalRules({ userId, rules: nextRules })
      if (userId) {
        saveRecurringRulesForUser(userId, nextRules)
      }
      return nextRules
    },
    [rules, userId],
  )

  const addRecurringRule = useCallback(
    (rule) => {
      const newRule = {
        id: crypto.randomUUID(),
        name: rule.name.trim(),
        amount: Math.max(0, Number(rule.amount) || 0),
        category: rule.category,
        startDate: rule.startDate || new Date().toISOString().slice(0, 10),
        paid: Boolean(rule.paid),
        active: true,
        lastGeneratedMonth: rule.lastGeneratedMonth ?? '',
        createdAt: new Date().toISOString(),
      }

      persist((previous) => [...previous, newRule])
      return newRule
    },
    [persist],
  )

  const deleteRecurringRule = useCallback(
    (id) => {
      persist((previous) => previous.filter((rule) => rule.id !== id))
    },
    [persist],
  )

  const replaceRecurringRules = useCallback(
    (nextRules) => {
      persist(nextRules)
    },
    [persist],
  )

  return {
    recurringRules: rules,
    addRecurringRule,
    deleteRecurringRule,
    replaceRecurringRules,
  }
}
