import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSession, signIn, signOut, signUp } from '../lib/auth.js'
import { migrateLegacyExpenses } from '../lib/expensesStorage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) {
      migrateLegacyExpenses(session.userId)
      setUser(session)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const result = await signIn(credentials)
    if (!result.ok) return result

    migrateLegacyExpenses(result.user.userId)
    setUser(result.user)
    return result
  }, [])

  const signup = useCallback(async (payload) => {
    const result = await signUp(payload)
    if (!result.ok) return result

    migrateLegacyExpenses(result.user.userId)
    setUser(result.user)
    return result
  }, [])

  const logout = useCallback(() => {
    signOut()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
    }),
    [user, isLoading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
