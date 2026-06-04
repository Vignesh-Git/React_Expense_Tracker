import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_CATEGORIES,
  getCategoriesForUser,
  normalizeCategoryInput,
  saveCategoriesForUser,
} from '../lib/categoriesStorage.js'

export function useUserCategories(userId) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const hydratedUserIdRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      hydratedUserIdRef.current = null
      setCategories(DEFAULT_CATEGORIES)
      return
    }

    hydratedUserIdRef.current = null
    setCategories(getCategoriesForUser(userId))
    hydratedUserIdRef.current = userId
  }, [userId])

  const persist = useCallback(
    (updater) => {
      setCategories((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater
        if (hydratedUserIdRef.current === userId && userId) {
          saveCategoriesForUser(userId, next)
        }
        return next
      })
    },
    [userId],
  )

  const addCategory = useCallback(
    (name) => {
      const normalized = normalizeCategoryInput(name)
      if (!normalized) {
        return { ok: false, error: 'Enter a category name.' }
      }

      const exists = categories.some(
        (category) => category.toLowerCase() === normalized.toLowerCase(),
      )
      if (exists) {
        return { ok: false, error: 'This category already exists.' }
      }

      persist((previous) => [...previous, normalized])
      return { ok: true }
    },
    [categories, persist],
  )

  const deleteCategory = useCallback(
    (name, expenses = []) => {
      const inUse = expenses.some(
        (expense) => expense.category.toLowerCase() === name.toLowerCase(),
      )
      if (inUse) {
        return { ok: false, error: 'Cannot delete a category that is used by expenses.' }
      }

      if (categories.length <= 1) {
        return { ok: false, error: 'Keep at least one category.' }
      }

      persist((previous) =>
        previous.filter((category) => category.toLowerCase() !== name.toLowerCase()),
      )
      return { ok: true }
    },
    [categories.length, persist],
  )

  return {
    categories,
    addCategory,
    deleteCategory,
  }
}
