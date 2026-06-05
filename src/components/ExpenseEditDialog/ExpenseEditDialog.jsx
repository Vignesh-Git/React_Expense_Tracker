import { useEffect, useRef, useState } from 'react'
import { CURRENCIES } from '../../lib/currency.js'
import '../VoiceExpenseDialog/VoiceExpenseDialog.css'

function ExpenseEditDialog({ open, expense, categories, currencyCode, onSave, onClose }) {
  const dialogRef = useRef(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const handleSave = async (event) => {
    event.preventDefault()
    if (!expense) return

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const amountValue = Number(formData.get('amount'))
    const expenseCurrencyCode = String(formData.get('currencyCode') ?? currencyCode)
    const category = String(formData.get('category') ?? '')
    const date = String(formData.get('date') ?? '')

    if (!name) {
      setError('Enter a name before saving.')
      return
    }
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }
    if (!category) {
      setError('Choose a category.')
      return
    }
    if (!date) {
      setError('Choose a date.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      await onSave(expense.id, {
        name,
        amount: Math.round(amountValue * 100) / 100,
        currencyCode: expenseCurrencyCode,
        category,
        date,
        paid: formData.get('paid') === 'on',
      })
      onClose()
    } catch (saveError) {
      setError(saveError.message || 'Could not convert this expense. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="voice-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="voice-dialog-panel">
        <header className="voice-dialog-header">
          <h3>Edit expense</h3>
          <button type="button" className="voice-dialog-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form className="voice-dialog-section" aria-label="Editable expense details" onSubmit={handleSave} key={expense?.id}>
          <div className="voice-edit-grid">
            <label className="voice-edit-field voice-edit-field--wide">
              <span>Name</span>
              <input name="name" defaultValue={expense?.name ?? ''} />
            </label>
            <label className="voice-edit-field">
              <span>Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                name="amount"
                defaultValue={expense?.originalAmount ?? expense?.amount ?? ''}
              />
            </label>
            <label className="voice-edit-field">
              <span>Currency</span>
              <select
                name="currencyCode"
                defaultValue={expense?.originalCurrencyCode ?? expense?.currencyCode ?? currencyCode}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.code}
                  </option>
                ))}
              </select>
            </label>
            <label className="voice-edit-field">
              <span>Category</span>
              <select name="category" defaultValue={expense?.category ?? categories[0] ?? ''}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="voice-edit-field">
              <span>Date</span>
              <input
                name="date"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                defaultValue={expense?.date ?? new Date().toISOString().slice(0, 10)}
              />
            </label>
            <label className="voice-paid-toggle">
              <input
                name="paid"
                type="checkbox"
                defaultChecked={Boolean(expense?.paid)}
              />
              <span>Mark as paid</span>
            </label>
          </div>
          {error && <p className="voice-edit-hint">{error}</p>}
          <footer className="voice-dialog-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Converting...' : 'Save changes'}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  )
}

export default ExpenseEditDialog
