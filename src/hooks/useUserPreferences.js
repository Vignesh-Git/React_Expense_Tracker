import { useCallback, useState } from 'react'
import { getPreferencesForUser, savePreferencesForUser } from '../lib/currency.js'

export function useUserPreferences(userId) {
  const [localPreferences, setLocalPreferences] = useState(() => ({
    userId,
    preferences: getPreferencesForUser(userId),
  }))

  const activePreferences =
    localPreferences.userId === userId
      ? localPreferences.preferences
      : getPreferencesForUser(userId)

  const updateCurrency = useCallback(
    (currencyCode) => {
      const nextPreferences = {
        ...activePreferences,
        currencyCode,
      }

      setLocalPreferences({ userId, preferences: nextPreferences })
      if (userId) {
        savePreferencesForUser(userId, nextPreferences)
      }
    },
    [activePreferences, userId],
  )

  return {
    currencyCode: activePreferences.currencyCode,
    updateCurrency,
  }
}
