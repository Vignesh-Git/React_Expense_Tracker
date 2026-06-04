import { useMemo, useState } from 'react'
import ExpenseList from '../../components/ExpenseList'
import { formatCurrency } from '../../lib/currency.js'
import { exportExpensesToExcel } from '../../lib/exportExpensesExcel.js'
import './History.css'

const INITIAL_FILTERS = {
  search: '',
  category: 'all',
  status: 'all',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
}

function normalizeText(value) {
  return value.trim().toLowerCase()
}

function getExpenseDateValue(date) {
  if (!date) return ''
  return date.slice(0, 10)
}

function isAmountInRange(amount, minAmount, maxAmount) {
  const min = minAmount === '' ? null : Number(minAmount)
  const max = maxAmount === '' ? null : Number(maxAmount)

  if (min !== null && amount < min) return false
  if (max !== null && amount > max) return false
  return true
}

function hasActiveFilters(filters) {
  return Object.entries(filters).some(([key, value]) => {
    if (key === 'category' || key === 'status') return value !== 'all'
    return value !== ''
  })
}

function applyExpenseFilters(expenses, filters) {
  const search = normalizeText(filters.search)

  return expenses.filter((expense) => {
    const expenseDate = getExpenseDateValue(expense.date)
    const searchableText = normalizeText(
      [expense.name, expense.category, expense.amount?.toString(), expenseDate].filter(Boolean).join(' '),
    )

    if (search && !searchableText.includes(search)) return false
    if (filters.category !== 'all' && expense.category !== filters.category) return false
    if (filters.status === 'paid' && !expense.paid) return false
    if (filters.status === 'unpaid' && expense.paid) return false
    if (filters.startDate && (!expenseDate || expenseDate < filters.startDate)) return false
    if (filters.endDate && (!expenseDate || expenseDate > filters.endDate)) return false

    return isAmountInRange(expense.amount, filters.minAmount, filters.maxAmount)
  })
}

function History({ expenses, categories, currencyCode, togglePaid, deleteExpense, updateExpense }) {
  const [exportError, setExportError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const filtered = useMemo(() => applyExpenseFilters(expenses, filters), [expenses, filters])
  const activeFilters = hasActiveFilters(filters)
  const filteredTotal = filtered.reduce((sum, expense) => sum + expense.amount, 0)

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  const handleExport = async () => {
    setExportError('')
    setIsExporting(true)

    try {
      const result = await exportExpensesToExcel(filtered, currencyCode)
      if (!result.ok) {
        setExportError(result.error)
      }
    } catch {
      setExportError('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="history-page">
      <section className="card history-header-card">
        <div className="history-header">
          <div>
            <h2>All expenses</h2>
            <p className="chart-subtitle">Complete history of your spending</p>
          </div>
          <button
            type="button"
            className="export-excel-button"
            onClick={handleExport}
            disabled={filtered.length === 0 || isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export filtered'}
          </button>
        </div>
        {exportError && (
          <p className="form-error history-export-error" role="alert">
            {exportError}
          </p>
        )}
      </section>

      <section className="card advanced-filter-card" aria-label="Advanced expense filters">
        <div className="advanced-filter-header">
          <div>
            <h2>Advanced filters</h2>
            <p className="chart-subtitle">Refine by date, category, amount, status, or text.</p>
          </div>
          <button
            type="button"
            className="clear-filters-button"
            onClick={resetFilters}
            disabled={!activeFilters}
          >
            Clear filters
          </button>
        </div>

        <div className="advanced-filter-grid">
          <label className="filter-field filter-field--wide">
            <span>Search text</span>
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search name, category, amount, date"
            />
          </label>

          <label className="filter-field">
            <span>From date</span>
            <input
              type="date"
              value={filters.startDate}
              max={filters.endDate || undefined}
              onChange={(event) => updateFilter('startDate', event.target.value)}
            />
          </label>

          <label className="filter-field">
            <span>To date</span>
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(event) => updateFilter('endDate', event.target.value)}
            />
          </label>

          <label className="filter-field">
            <span>Category</span>
            <select
              value={filters.category}
              onChange={(event) => updateFilter('category', event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
            >
              <option value="all">Paid & unpaid</option>
              <option value="paid">Paid only</option>
              <option value="unpaid">Unpaid only</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Min amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minAmount}
              onChange={(event) => updateFilter('minAmount', event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="filter-field">
            <span>Max amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxAmount}
              onChange={(event) => updateFilter('maxAmount', event.target.value)}
              placeholder="500.00"
            />
          </label>
        </div>

        <div className="filter-summary" aria-live="polite">
          <span>
            Showing <strong>{filtered.length}</strong> of <strong>{expenses.length}</strong> expenses
          </span>
          <span>
            Filtered total: <strong>{formatCurrency(filteredTotal, currencyCode)}</strong>
          </span>
        </div>
      </section>

      <ExpenseList
        expenses={filtered}
        categories={categories}
        emptyMessage={
          activeFilters
            ? 'No expenses match your filters. Adjust or clear filters to see more results.'
            : 'No expenses yet. Add your first expense from the Dashboard.'
        }
        currencyCode={currencyCode}
        onTogglePaid={togglePaid}
        onDelete={deleteExpense}
        onUpdate={updateExpense}
      />
    </div>
  )
}

export default History
