import { useCallback, useState } from 'react'
import { getBudgetForUser, saveBudgetForUser } from '../lib/budgetStorage.js'

export function useUserBudget(userId) {
  const [localBudget, setLocalBudget] = useState(() => ({
    userId,
    budget: getBudgetForUser(userId),
  }))

  const activeBudget =
    localBudget.userId === userId ? localBudget.budget : getBudgetForUser(userId)

  const updateMonthlyBudget = useCallback(
    (monthlyBudget) => {
      const nextBudget = {
        ...activeBudget,
        monthlyBudget: Math.max(0, Number(monthlyBudget) || 0),
      }

      setLocalBudget({ userId, budget: nextBudget })
      if (userId) {
        saveBudgetForUser(userId, nextBudget)
      }
    },
    [activeBudget, userId],
  )

  const updateCategoryBudget = useCallback(
    (category, amount) => {
      const nextBudget = {
        ...activeBudget,
        categoryBudgets: {
          ...activeBudget.categoryBudgets,
          [category]: Math.max(0, Number(amount) || 0),
        },
      }

      setLocalBudget({ userId, budget: nextBudget })
      if (userId) {
        saveBudgetForUser(userId, nextBudget)
      }
    },
    [activeBudget, userId],
  )

  return {
    monthlyBudget: activeBudget.monthlyBudget,
    categoryBudgets: activeBudget.categoryBudgets,
    updateMonthlyBudget,
    updateCategoryBudget,
  }
}
