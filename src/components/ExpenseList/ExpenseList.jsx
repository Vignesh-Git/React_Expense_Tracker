import ExpenseItem from '../ExpenseItem'
import './ExpenseList.css'

function ExpenseList({
  expenses,
  emptyMessage = 'No expenses match your filters yet.',
  categories = [],
  currencyCode,
  onTogglePaid,
  onDelete,
  onUpdate,
}) {
  if (expenses.length === 0) {
    return (
      <section className="card expense-list-card">
        <h2>Expense history</h2>
        <p className="empty-state">{emptyMessage}</p>
      </section>
    )
  }

  return (
    <section className="card expense-list-card">
      <h2>Expense history</h2>
      <ul className="expense-list">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            categories={categories}
            currencyCode={currencyCode}
            onTogglePaid={onTogglePaid}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </section>
  )
}

export default ExpenseList
