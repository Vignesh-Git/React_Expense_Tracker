import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MobileBottomNav from '../components/MobileBottomNav'
import SideNav from '../components/SideNav'
import Toast from '../components/Toast'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext.jsx'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses.js'
import { useUserBudget } from '../hooks/useUserBudget.js'
import { useUserCategories } from '../hooks/useUserCategories.js'
import { useUserExpenses } from '../hooks/useUserExpenses.js'
import { useUserPreferences } from '../hooks/useUserPreferences.js'
import { buildCategoryList } from '../lib/categoriesStorage.js'
import { normalizeExpenseCurrency } from '../lib/exchangeRates.js'
import AddExpense from '../pages/AddExpense'
import Dashboard from '../pages/Dashboard'
import History from '../pages/History'
import Settings from '../pages/Settings'
import './MainLayout.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/add-expense': 'Add Expense',
  '/history': 'History',
  '/settings': 'Setup',
}

function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [deletedExpense, setDeletedExpense] = useState(null)
  const { expenses, addExpense, deleteExpense, updateExpense, restoreExpense, togglePaid } = useUserExpenses(user?.userId)
  const { categories, addCategory, deleteCategory } = useUserCategories(user?.userId)
  const { monthlyBudget, categoryBudgets, updateMonthlyBudget, updateCategoryBudget } = useUserBudget(user?.userId)
  const { currencyCode, updateCurrency } = useUserPreferences(user?.userId)
  const { recurringRules, addRecurringRule, deleteRecurringRule } = useRecurringExpenses(user?.userId)
  const visibleCategories = buildCategoryList(categories, expenses)

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'SpendWise'

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!mobileNavOpen) {
      document.body.style.overflow = ''
      return undefined
    }

    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileNavOpen])

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  const handleAddExpense = useCallback(
    async (expense) => {
      const normalizedExpense = await normalizeExpenseCurrency(expense, currencyCode)
      addExpense(normalizedExpense)
    },
    [addExpense, currencyCode],
  )

  const handleUpdateExpense = useCallback(
    async (id, updates) => {
      const normalizedExpense = await normalizeExpenseCurrency(updates, currencyCode)
      updateExpense(id, normalizedExpense)
    },
    [currencyCode, updateExpense],
  )

  const handleDeleteExpense = (id) => {
    const expense = expenses.find((item) => item.id === id)
    if (!expense) return
    deleteExpense(id)
    setDeletedExpense(expense)
  }

  const undoDeleteExpense = () => {
    if (!deletedExpense) return
    restoreExpense(deletedExpense)
    setDeletedExpense(null)
  }

  return (
    <div className="app-layout">
      <button
        type="button"
        className={`sidebar-overlay ${mobileNavOpen ? 'sidebar-overlay--visible' : ''}`}
        aria-label="Close navigation menu"
        onClick={() => setMobileNavOpen(false)}
        tabIndex={mobileNavOpen ? 0 : -1}
      />

      <SideNav
        user={user}
        total={totalAmount}
        count={expenses.length}
        currencyCode={currencyCode}
        theme={theme}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />

      <div className="app-main">
        <TopBar
          title={pageTitle}
          total={totalAmount}
          currencyCode={currencyCode}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main className="app-content" id="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  expenses={expenses}
                  categories={categories}
                  monthlyBudget={monthlyBudget}
                  categoryBudgets={categoryBudgets}
                  currencyCode={currencyCode}
                  updateMonthlyBudget={updateMonthlyBudget}
                />
              }
            />
            <Route
              path="/add-expense"
              element={
                <AddExpense
                  expenses={expenses}
                  categories={categories}
                  chartCategories={visibleCategories}
                  addExpense={handleAddExpense}
                  recurringRules={recurringRules}
                  addRecurringRule={addRecurringRule}
                  deleteRecurringRule={deleteRecurringRule}
                  currencyCode={currencyCode}
                />
              }
            />
            <Route
              path="/history"
              element={
                <History
                  expenses={expenses}
                  categories={visibleCategories}
                  currencyCode={currencyCode}
                  togglePaid={togglePaid}
                  deleteExpense={handleDeleteExpense}
                  updateExpense={handleUpdateExpense}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  expenses={expenses}
                  categories={categories}
                  currencyCode={currencyCode}
                  categoryBudgets={categoryBudgets}
                  onCurrencyChange={updateCurrency}
                  onUpdateCategoryBudget={updateCategoryBudget}
                  addCategory={addCategory}
                  deleteCategory={deleteCategory}
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <MobileBottomNav />
        <Toast
          open={Boolean(deletedExpense)}
          message={deletedExpense ? `"${deletedExpense.name}" deleted.` : ''}
          actionLabel="Undo"
          onAction={undoDeleteExpense}
          onClose={() => setDeletedExpense(null)}
        />
      </div>
    </div>
  )
}

export default MainLayout
