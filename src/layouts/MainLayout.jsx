import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserExpenses } from '../hooks/useUserExpenses.js'
import Dashboard from '../pages/Dashboard'
import History from '../pages/History'

const categories = ['Food', 'Travel', 'Shopping', 'Bills']

function MainLayout() {
  const { user, logout } = useAuth()
  const [filter, setFilter] = useState('all')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const { expenses, addExpense, deleteExpense, togglePaid } = useUserExpenses(user?.userId)

  useEffect(() => {
    if (user?.userId) {
      setFilter('all')
    }
  }, [user?.userId])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return (
    <div className="app-shell">
      <Header
        user={user}
        total={totalAmount}
        count={expenses.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={<Dashboard expenses={expenses} categories={categories} addExpense={addExpense} />}
        />
        <Route
          path="/history"
          element={
            <History
              expenses={expenses}
              categories={categories}
              filter={filter}
              setFilter={setFilter}
              togglePaid={togglePaid}
              deleteExpense={deleteExpense}
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default MainLayout
