import { useCallback, useState } from 'react'
import { getExpensesForUser, saveExpensesForUser } from '../lib/expensesStorage.js'
import {
  getDueRecurringExpenses,
  getRecurringRulesForUser,
  markRulesGenerated,
  saveRecurringRulesForUser,
} from '../lib/recurringStorage.js'

function hydrateExpenses(userId) {
  if (!userId) return []

  const savedExpenses = getExpensesForUser(userId)
  const recurringRules = getRecurringRulesForUser(userId)
  const dueItems = getDueRecurringExpenses(recurringRules, savedExpenses)
  const hydratedExpenses = [...savedExpenses, ...dueItems.map((item) => item.expense)]

  if (dueItems.length > 0) {
    saveExpensesForUser(userId, hydratedExpenses)
    saveRecurringRulesForUser(userId, markRulesGenerated(recurringRules, dueItems))
  }

  return hydratedExpenses
}

export function useUserExpenses(userId) {
  const [localExpenses, setLocalExpenses] = useState(() => ({
    userId,
    expenses: hydrateExpenses(userId),
  }))

  const expenses =
    localExpenses.userId === userId ? localExpenses.expenses : hydrateExpenses(userId)

  const persist = useCallback(
    (updater) => {
      setLocalExpenses((previousState) => {
        const previous =
          previousState.userId === userId ? previousState.expenses : hydrateExpenses(userId)
        const next = typeof updater === 'function' ? updater(previous) : updater
        if (userId) {
          saveExpensesForUser(userId, next)
        }
        return { userId, expenses: next }
      })
    },
    [userId],
  )

  const addExpense = useCallback(
    (expense) => {
      persist((previous) => [...previous, { id: crypto.randomUUID(), ...expense }])
    },
    [persist],
  )

  const deleteExpense = useCallback(
    (id) => {
      persist((previous) => previous.filter((expense) => expense.id !== id))
    },
    [persist],
  )

  const updateExpense = useCallback(
    (id, updates) => {
      persist((previous) =>
        previous.map((expense) =>
          expense.id === id ? { ...expense, ...updates, id: expense.id } : expense,
        ),
      )
    },
    [persist],
  )

  const restoreExpense = useCallback(
    (expense) => {
      persist((previous) => {
        if (previous.some((item) => item.id === expense.id)) return previous
        return [...previous, expense]
      })
    },
    [persist],
  )

  const togglePaid = useCallback(
    (id) => {
      persist((previous) =>
        previous.map((expense) =>
          expense.id === id ? { ...expense, paid: !expense.paid } : expense,
        ),
      )
    },
    [persist],
  )

  return {
    expenses,
    addExpense,
    deleteExpense,
    updateExpense,
    restoreExpense,
    togglePaid,
  }
}
