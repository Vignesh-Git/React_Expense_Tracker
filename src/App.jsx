import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header.jsx'
import ExpenseChart from './components/ExpenseChart.jsx'
import ExpenseForm from './components/ExpenseForm.jsx'
import FilterBar from './components/FilterBar.jsx'
import ExpenseList from './components/ExpenseList.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'

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

  const filteredExpenses = useMemo(
    () =>
      filter === 'all'
        ? expenses
        : expenses.filter((expense) => expense.category === filter),
    [expenses, filter],
  )

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
