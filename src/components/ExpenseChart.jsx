import { useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const categoryColors = {
  Food: '#a78bfa',
  Travel: '#38bdf8',
  Shopping: '#f97316',
  Bills: '#22c55e',
}

function ExpenseChart({ expenses }) {
  const chartData = useMemo(() => {
    const totals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})

    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount,
    }))
  }, [expenses])

  if (chartData.length === 0) {
    return (
      <section className="card chart-card">
        <h2>Spending breakdown</h2>
        <p className="empty-state">Graph will be shown once an expense is added.</p>
      </section>
    )
  }

  return (
    <section className="card chart-card">
      <div className="chart-header">
        <div>
          <h2>Spending breakdown</h2>
          <p className="chart-subtitle">Live category totals from your expenses.</p>
        </div>
      </div>
      <div className="chart-wrapper">
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
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={categoryColors[entry.category] ?? '#64748b'} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default ExpenseChart
