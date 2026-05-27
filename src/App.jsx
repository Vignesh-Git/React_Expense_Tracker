import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import History from './pages/History'

const categories = ['Food', 'Travel', 'Shopping', 'Bills']

function App() {
  const [filter, setFilter] = useState('all')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses')
    if (!saved) return []
    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const addExpense = (expense) => {
    setExpenses((prevExpenses) => [
      ...prevExpenses,
      { id: crypto.randomUUID(), ...expense },
    ])
  }

  const deleteExpense = (id) => {
    setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id))
  }

  const togglePaid = (id) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === id ? { ...expense, paid: !expense.paid } : expense,
      ),
    )
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header total={totalAmount} count={expenses.length} theme={theme} onToggleTheme={toggleTheme} />

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
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
