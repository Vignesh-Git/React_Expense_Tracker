const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  year: '2-digit',
})

function toDate(value) {
  if (!value) return new Date()

  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return MONTH_LABEL_FORMATTER.format(new Date(year, month - 1, 1))
}

export function getCurrentMonthKey() {
  return getMonthKey(new Date())
}

export function getCurrentMonthExpenses(expenses) {
  const currentMonth = getCurrentMonthKey()
  return expenses.filter((expense) => getMonthKey(toDate(expense.date)) === currentMonth)
}

export function getPreviousMonthExpenses(expenses) {
  const now = new Date()
  const previousMonth = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  return expenses.filter((expense) => getMonthKey(toDate(expense.date)) === previousMonth)
}

export function getTotalSpent(expenses) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

export function getCategoryTotals(expenses, categories = []) {
  const categoryOrder = new Map(categories.map((category, index) => [category, index]))
  const totals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount
    return acc
  }, {})

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      order: categoryOrder.get(category) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => b.amount - a.amount || a.order - b.order)
}

export function getTopExpenses(expenses, limit = 5) {
  return [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

export function getMonthlyTrend(expenses, monthsToShow = 6) {
  const now = new Date()
  const months = Array.from({ length: monthsToShow }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1 - index), 1)
    const key = getMonthKey(date)
    return {
      month: key,
      label: getMonthLabel(key),
      amount: 0,
    }
  })
  const monthMap = new Map(months.map((month) => [month.month, month]))

  expenses.forEach((expense) => {
    const key = getMonthKey(toDate(expense.date))
    const bucket = monthMap.get(key)
    if (bucket) {
      bucket.amount += expense.amount
    }
  })

  return months
}

export function getHighestCategory(categoryTotals) {
  return categoryTotals[0] ?? null
}

export function forecastMonthlySpend(monthTotal) {
  const now = new Date()
  const elapsedDays = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  if (elapsedDays <= 0) return monthTotal
  return (monthTotal / elapsedDays) * daysInMonth
}

export function getDailyHeatmap(expenses) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const currentMonth = getCurrentMonthKey()
  const totals = expenses.reduce((acc, expense) => {
    const date = toDate(expense.date)
    const key = getMonthKey(date)
    if (key !== currentMonth) return acc
    const day = date.getDate()
    acc[day] = (acc[day] ?? 0) + expense.amount
    return acc
  }, {})
  const max = Math.max(...Object.values(totals), 0)

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const amount = totals[day] ?? 0
    return {
      day,
      date: new Date(year, month, day).toISOString().slice(0, 10),
      amount,
      intensity: max > 0 ? Math.ceil((amount / max) * 4) : 0,
    }
  })
}
