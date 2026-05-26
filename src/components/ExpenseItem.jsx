function ExpenseItem({ expense, onTogglePaid, onDelete }) {
  const { id, name, amount, category, paid } = expense

  return (
    <li className="expense-item">
      <div>
        <p className="expense-name">{name}</p>
        <span className="expense-category">{category}</span>
      </div>

      <div className="expense-meta">
        <span className="expense-amount">${amount.toFixed(2)}</span>
        <span className={paid ? 'badge paid' : 'badge unpaid'}>{paid ? 'Paid' : 'Unpaid'}</span>
      </div>

      <div className="expense-actions">
        <button type="button" onClick={() => onTogglePaid(id)} className="secondary-button">
          {paid ? 'Mark unpaid' : 'Mark paid'}
        </button>
        <button type="button" onClick={() => onDelete(id)} className="danger-button">
          Delete
        </button>
      </div>
    </li>
  )
}

export default ExpenseItem
