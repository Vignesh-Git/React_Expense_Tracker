import { useCallback, useEffect, useRef, useState } from 'react'
import { getExpensesForUser, saveExpensesForUser } from '../lib/expensesStorage.js'

/**
 * Loads expenses when userId changes and persists only after hydration
 * or on explicit mutations — avoids overwriting storage with [] on login.
 */
export function useUserExpenses(userId) {
  const [expenses, setExpenses] = useState([])
  const hydratedUserIdRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      hydratedUserIdRef.current = null
      setExpenses([])
      return
    }

    hydratedUserIdRef.current = null
    setExpenses(getExpensesForUser(userId))
    hydratedUserIdRef.current = userId
  }, [userId])

  const persist = useCallback(
    (updater) => {
      setExpenses((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater
        if (hydratedUserIdRef.current === userId && userId) {
          saveExpensesForUser(userId, next)
        }
        return next
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
    togglePaid,
  }
}
