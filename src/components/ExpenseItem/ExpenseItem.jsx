import "./ExpenseItem.css";

function formatExpenseDate(isoDate) {
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}

function ExpenseItem({ expense, onTogglePaid, onDelete }) {
  const { id, name, amount, category, paid, date } = expense;

  return (
    <li className="expense-item">
      <div className="expense-info">
        <p className="expense-name">{name}</p>
        <div className="expense-tags">
          <span className="expense-category">{category}</span>
          {date && <span className="expense-date">{formatExpenseDate(date)}</span>}
        </div>
      </div>

      <div className="expense-meta">
        <span className="expense-amount">${amount.toFixed(2)}</span>
      </div>

      <div className="expense-actions">
        <button
          type="button"
          onClick={() => onTogglePaid(id)}
          className="secondary-button"
        >
          {paid ? "Mark unpaid" : "Mark paid"}
        </button>

        <button
          type="button"
          onClick={() => onDelete(id)}
          className="danger-button"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default ExpenseItem;
