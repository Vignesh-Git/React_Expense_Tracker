import { useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getCategoryColor } from '../../lib/categoryColors.js'
import { formatCurrency } from '../../lib/currency.js'
import { getCategoryTotals } from '../../lib/expenseAnalytics.js'
import './ExpenseChart.css'

function ExpenseChart({
  expenses,
  categories = [],
  currencyCode,
  title = 'Spending breakdown',
  subtitle = 'Live category totals from your expenses.',
}) {
  const chartData = useMemo(() => {
    return getCategoryTotals(expenses, categories).map((item) => ({
      ...item,
      colorIndex: categories.findIndex((category) => category === item.category),
    }))
  }, [categories, expenses])
  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0)

  if (chartData.length === 0) {
    return (
      <section className="card chart-card">
        <h2>{title}</h2>
        <p className="empty-state">Graph will be shown once an expense is added.</p>
      </section>
    )
  }

  return (
    <section className="card chart-card">
      <div className="chart-header">
        <div>
          <h2>{title}</h2>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="chart-wrapper">
        <div className="chart-center-label" aria-label="Overall expense total">
          <span className="chart-center-label-title">Overall</span>
          <strong className="chart-center-label-value">
            {formatCurrency(totalAmount, currencyCode, { compact: true })}
          </strong>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              stroke="transparent"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={getCategoryColor(
                    entry.category,
                    entry.colorIndex >= 0 ? entry.colorIndex : index,
                  )}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [formatCurrency(value, currencyCode), 'Amount']} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default ExpenseChart
