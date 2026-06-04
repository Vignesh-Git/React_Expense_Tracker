import { useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import ExpenseEditDialog from '../ExpenseEditDialog'
import { formatCurrency } from '../../lib/currency.js'
import './ExpenseItem.css'

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

function ExpenseItem({ expense, categories, currencyCode, onTogglePaid, onDelete, onUpdate }) {
  const { id, name, amount, category, paid, date } = expense
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

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
        <span className="expense-amount">{formatCurrency(amount, currencyCode)}</span>
      </div>

      <div className="expense-actions">
        <button type="button" onClick={() => setEditOpen(true)} className="secondary-button">
          Edit
        </button>
        <button
          type="button"
          onClick={() => onTogglePaid(id)}
          className="secondary-button"
        >
          {paid ? 'Mark unpaid' : 'Mark paid'}
        </button>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="danger-button"
        >
          Delete
        </button>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete expense?"
        description={`This will permanently delete "${name}" from your expense history.`}
        confirmLabel="Delete expense"
        onConfirm={() => onDelete(id)}
        onClose={() => setConfirmOpen(false)}
      />

      <ExpenseEditDialog
        open={editOpen}
        expense={expense}
        categories={categories}
        onSave={onUpdate}
        onClose={() => setEditOpen(false)}
      />
    </li>
  )
}

export default ExpenseItem
