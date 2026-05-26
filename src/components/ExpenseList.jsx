import ExpenseItem from './ExpenseItem.jsx'

function ExpenseList({ expenses, onTogglePaid, onDelete }) {
  if (expenses.length === 0) {
    return (
      <section className="card expense-list-card">
        <h2>Expense history</h2>
        <p className="empty-state">No expenses match this category yet.</p>
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
            onTogglePaid={onTogglePaid}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  )
}

export default ExpenseList
