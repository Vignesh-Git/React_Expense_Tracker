import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getCategoryTotals,
  getCurrentMonthExpenses,
  getDailyHeatmap,
  getHighestCategory,
  getMonthlyTrend,
  getPreviousMonthExpenses,
  getTopExpenses,
  getTotalSpent,
  forecastMonthlySpend,
} from '../../lib/expenseAnalytics.js'
import { formatCurrency, getCurrencyByCode } from '../../lib/currency.js'
import { getCategoryColor } from '../../lib/categoryColors.js'
import './SmartDashboard.css'

function formatDate(isoDate) {
  if (!isoDate) return 'No date'

  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}

function StatCard({ label, value, helper, tone = 'neutral' }) {
  return (
    <article className={`smart-stat-card smart-stat-card--${tone}`}>
      <p className="smart-stat-label">{label}</p>
      <p className="smart-stat-value">{value}</p>
      {helper && <p className="smart-stat-helper">{helper}</p>}
    </article>
  )
}

function BudgetEditor({ monthlyBudget, currencyCode, onUpdateMonthlyBudget }) {
  const currency = getCurrencyByCode(currencyCode)

  const saveBudget = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onUpdateMonthlyBudget(formData.get('monthlyBudget'))
  }

  return (
    <form className="budget-editor" onSubmit={saveBudget}>
      <label>
        <span>Monthly budget ({currency.symbol})</span>
        <input
          key={monthlyBudget}
          name="monthlyBudget"
          type="number"
          min="0"
          step="0.01"
          defaultValue={monthlyBudget || ''}
          placeholder="Set budget"
        />
      </label>
      <button type="submit">Save</button>
    </form>
  )
}

function CategorySpendingList({ categoryTotals, totalSpent, currencyCode }) {
  if (categoryTotals.length === 0) {
    return <p className="smart-empty">No category spending this month yet.</p>
  }

  return (
    <ul className="category-spending-list">
      {categoryTotals.map((item, index) => {
        const percent = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0
        return (
          <li key={item.category}>
            <div className="category-spending-row">
              <span
                className="category-dot"
                style={{ background: getCategoryColor(item.category, index) }}
                aria-hidden="true"
              />
              <div className="category-spending-text">
                <p>{item.category}</p>
                <span>{percent}% of this month</span>
              </div>
              <strong>{formatCurrency(item.amount, currencyCode)}</strong>
            </div>
            <div className="category-progress" aria-hidden="true">
              <span
                style={{
                  width: `${percent}%`,
                  background: getCategoryColor(item.category, index),
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function MonthlyTrendChart({ trendData, currencyCode }) {
  return (
    <section className="card smart-panel">
      <div className="smart-panel-header">
        <div>
          <h2>Monthly trends</h2>
          <p className="chart-subtitle">Last 6 months of spending.</p>
        </div>
      </div>

      <div className="trend-chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={trendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, currencyCode, { compact: true })}
            />
            <Tooltip formatter={(value) => [formatCurrency(value, currencyCode), 'Spent']} />
            <Bar dataKey="amount" fill="var(--accent)" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function TopExpenses({ expenses, currencyCode }) {
  if (expenses.length === 0) {
    return <p className="smart-empty">No expenses this month yet.</p>
  }

  return (
    <ol className="top-expenses-list">
      {expenses.map((expense) => (
        <li key={expense.id}>
          <div>
            <p>{expense.name}</p>
            <span>
              {expense.category} · {formatDate(expense.date)}
            </span>
          </div>
          <strong>{formatCurrency(expense.amount, currencyCode)}</strong>
        </li>
      ))}
    </ol>
  )
}

function BudgetAlerts({ alerts }) {
  if (alerts.length === 0) {
    return <p className="smart-empty">No budget alerts. You are on track.</p>
  }

  return (
    <ul className="budget-alert-list">
      {alerts.map((alert) => (
        <li key={alert.label} className={`budget-alert budget-alert--${alert.tone}`}>
          <strong>{alert.label}</strong>
          <span>{alert.message}</span>
        </li>
      ))}
    </ul>
  )
}

function DailyHeatmap({ days, currencyCode }) {
  return (
    <section className="card smart-panel">
      <div className="smart-panel-header">
        <div>
          <h2>Daily spend heatmap</h2>
          <p className="chart-subtitle">Current month activity by day.</p>
        </div>
      </div>
      <div className="heatmap-grid">
        {days.map((day) => (
          <div
            key={day.date}
            className={`heatmap-cell heatmap-cell--${day.intensity}`}
            title={`${day.date}: ${formatCurrency(day.amount, currencyCode)}`}
            aria-label={`${day.date}: ${formatCurrency(day.amount, currencyCode)}`}
          >
            {day.day}
          </div>
        ))}
      </div>
    </section>
  )
}

function SmartDashboard({
  expenses,
  categories,
  monthlyBudget,
  categoryBudgets = {},
  currencyCode,
  onUpdateMonthlyBudget,
}) {
  const insights = useMemo(() => {
    const monthExpenses = getCurrentMonthExpenses(expenses)
    const previousMonthExpenses = getPreviousMonthExpenses(expenses)
    const monthTotal = getTotalSpent(monthExpenses)
    const previousMonthTotal = getTotalSpent(previousMonthExpenses)
    const categoryTotals = getCategoryTotals(monthExpenses, categories)
    const topExpenses = getTopExpenses(monthExpenses, 5)
    const trendData = getMonthlyTrend(expenses, 6)
    const highestCategory = getHighestCategory(categoryTotals)
    const forecast = forecastMonthlySpend(monthTotal)
    const heatmap = getDailyHeatmap(expenses)

    return {
      monthExpenses,
      monthTotal,
      previousMonthTotal,
      categoryTotals,
      topExpenses,
      trendData,
      highestCategory,
      forecast,
      heatmap,
    }
  }, [categories, expenses])

  const remainingBudget = monthlyBudget - insights.monthTotal
  const budgetProgress =
    monthlyBudget > 0 ? Math.min(100, Math.round((insights.monthTotal / monthlyBudget) * 100)) : 0
  const budgetTone = monthlyBudget > 0 && remainingBudget < 0 ? 'danger' : 'success'
  const previousDelta = insights.monthTotal - insights.previousMonthTotal
  const previousPercent =
    insights.previousMonthTotal > 0
      ? Math.round((previousDelta / insights.previousMonthTotal) * 100)
      : null
  const categoryBudgetAlerts = insights.categoryTotals
    .map((item) => {
      const limit = categoryBudgets[item.category] ?? 0
      if (limit <= 0) return null
      const usage = Math.round((item.amount / limit) * 100)
      if (usage < 80) return null
      return {
        label: item.category,
        tone: usage >= 100 ? 'danger' : 'warning',
        message: `${usage}% of ${formatCurrency(limit, currencyCode)} used`,
      }
    })
    .filter(Boolean)
  const alerts = [
    ...(monthlyBudget > 0 && insights.forecast > monthlyBudget
      ? [
          {
            label: 'Forecast alert',
            tone: 'danger',
            message: `Projected month-end spend is ${formatCurrency(insights.forecast, currencyCode)}.`,
          },
        ]
      : []),
    ...categoryBudgetAlerts,
  ]

  return (
    <section className="smart-dashboard" aria-label="Smart dashboard">
      <div className="smart-dashboard-header">
        <div>
          <p className="smart-eyebrow">Smart dashboard</p>
          <h1>Financial snapshot</h1>
          <p className="chart-subtitle">
            This month’s spending, budget health, trends, and high-value expenses.
          </p>
        </div>
        <BudgetEditor
          monthlyBudget={monthlyBudget}
          currencyCode={currencyCode}
          onUpdateMonthlyBudget={onUpdateMonthlyBudget}
        />
      </div>

      <div className="smart-stats-grid">
        <StatCard
          label="Spent this month"
          value={formatCurrency(insights.monthTotal, currencyCode)}
          helper={`${insights.monthExpenses.length} expense${insights.monthExpenses.length === 1 ? '' : 's'} logged`}
        />
        <StatCard
          label="Remaining budget"
          value={
            monthlyBudget > 0
              ? formatCurrency(remainingBudget, currencyCode)
              : 'Set budget'
          }
          helper={
            monthlyBudget > 0
              ? `${budgetProgress}% of ${formatCurrency(monthlyBudget, currencyCode)} used`
              : 'Add a monthly budget to track runway'
          }
          tone={monthlyBudget > 0 ? budgetTone : 'neutral'}
        />
        <StatCard
          label="Top category"
          value={insights.highestCategory?.category ?? 'No data'}
          helper={
            insights.highestCategory
              ? formatCurrency(insights.highestCategory.amount, currencyCode)
              : 'Add expenses to see category leaders'
          }
        />
        <StatCard
          label="Average expense"
          value={
            insights.monthExpenses.length > 0
              ? formatCurrency(insights.monthTotal / insights.monthExpenses.length, currencyCode)
              : formatCurrency(0, currencyCode)
          }
          helper="Current month average"
        />
        <StatCard
          label="Forecast"
          value={formatCurrency(insights.forecast, currencyCode)}
          helper="Projected month-end spend"
          tone={monthlyBudget > 0 && insights.forecast > monthlyBudget ? 'danger' : 'neutral'}
        />
        <StatCard
          label="Vs last month"
          value={
            previousPercent === null
              ? 'No baseline'
              : `${previousDelta >= 0 ? '+' : ''}${previousPercent}%`
          }
          helper={
            previousPercent === null
              ? 'Add prior month expenses to compare'
              : `${formatCurrency(Math.abs(previousDelta), currencyCode)} ${
                  previousDelta >= 0 ? 'more' : 'less'
                } than last month`
          }
          tone={previousDelta > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="smart-insights-grid">
        <section className="card smart-panel">
          <div className="smart-panel-header">
            <div>
              <h2>Budget alerts</h2>
              <p className="chart-subtitle">Monthly and category budget signals.</p>
            </div>
          </div>
          <BudgetAlerts alerts={alerts} />
        </section>

        <section className="card smart-panel">
          <div className="smart-panel-header">
            <div>
              <h2>Category-wise spending</h2>
              <p className="chart-subtitle">Current month by category.</p>
            </div>
          </div>
          <CategorySpendingList
            categoryTotals={insights.categoryTotals}
            totalSpent={insights.monthTotal}
            currencyCode={currencyCode}
          />
        </section>

        <MonthlyTrendChart trendData={insights.trendData} currencyCode={currencyCode} />
        <DailyHeatmap days={insights.heatmap} currencyCode={currencyCode} />

        <section className="card smart-panel">
          <div className="smart-panel-header">
            <div>
              <h2>Top expenses</h2>
              <p className="chart-subtitle">Largest transactions this month.</p>
            </div>
          </div>
          <TopExpenses expenses={insights.topExpenses} currencyCode={currencyCode} />
        </section>
      </div>
    </section>
  )
}

export default SmartDashboard
