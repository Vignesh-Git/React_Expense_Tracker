import { useEffect, useMemo, useRef, useState } from 'react'
import { CURRENCIES } from '../../lib/currency.js'
import './VoiceExpenseDialog.css'

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function VoiceExpenseDialog({
  open,
  transcript,
  parseResult,
  categories = [],
  currencyCode,
  source = 'voice',
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null)
  const [draft, setDraft] = useState({
    name: '',
    amount: '',
    currencyCode,
    category: categories[0] ?? '',
    date: getToday(),
    paid: false,
  })
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const expense = parseResult?.ok ? parseResult.expense : null
    setDraft({
      name: expense?.name ?? '',
      amount: expense?.amount ? String(expense.amount) : '',
      currencyCode: expense?.currencyCode ?? currencyCode,
      category: expense?.category ?? categories[0] ?? '',
      date: expense?.date ?? getToday(),
      paid: Boolean(expense?.paid),
    })
    setSubmitError('')
  }, [categories, currencyCode, open, parseResult])

  const amountValue = Number(draft.amount)
  const validationError = useMemo(() => {
    if (!draft.name.trim()) return 'Enter a name before adding.'
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return 'Enter an amount greater than zero.'
    }
    if (!draft.category) return 'Choose a category.'
    if (!draft.date) return 'Choose a date.'
    return ''
  }, [amountValue, draft.category, draft.date, draft.name])

  const canConfirm = !validationError
  const isBill = source === 'bill'

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleConfirm = async () => {
    if (!canConfirm || isSaving) return

    setIsSaving(true)
    setSubmitError('')
    try {
      await onConfirm({
        name: draft.name.trim(),
        amount: Math.round(amountValue * 100) / 100,
        currencyCode: draft.currencyCode,
        category: draft.category,
        date: draft.date,
        paid: draft.paid,
      })
    } catch (error) {
      setSubmitError(error.message || 'Could not convert this expense. Please try again.')
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
          <h3>{isBill ? 'Confirm scanned bill' : 'Confirm voice expense'}</h3>
          <button type="button" className="voice-dialog-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <section className="voice-dialog-section">
          <p className="voice-dialog-label">{isBill ? 'OCR result' : 'We heard'}</p>
          <blockquote className="voice-transcript">&ldquo;{transcript}&rdquo;</blockquote>
        </section>

        {!parseResult?.ok && (
          <p className="form-error voice-parse-error" role="alert">
            {parseResult?.error ??
              (isBill
                ? 'Could not parse this bill. Try uploading a clearer image.'
                : 'Could not parse this phrase. Try speaking again.')}
          </p>
        )}

        <section className="voice-dialog-section" aria-label="Editable expense details">
          <p className="voice-dialog-label">Edit before adding</p>
          <div className="voice-edit-grid">
            <label className="voice-edit-field voice-edit-field--wide">
              <span>Name</span>
              <input
                type="text"
                value={draft.name}
                onChange={(event) => updateDraft('name', event.target.value)}
                placeholder="Expense name"
              />
            </label>

            <label className="voice-edit-field">
              <span>Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.amount}
                onChange={(event) => updateDraft('amount', event.target.value)}
                placeholder="24.50"
              />
            </label>

            <label className="voice-edit-field">
              <span>Currency</span>
              <select
                value={draft.currencyCode}
                onChange={(event) => updateDraft('currencyCode', event.target.value)}
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
              <select
                value={draft.category}
                onChange={(event) => updateDraft('category', event.target.value)}
              >
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
                type="date"
                max={getToday()}
                value={draft.date}
                onChange={(event) => updateDraft('date', event.target.value)}
              />
            </label>

            <label className="voice-paid-toggle">
              <input
                type="checkbox"
                checked={draft.paid}
                onChange={(event) => updateDraft('paid', event.target.checked)}
              />
              <span>Mark as paid</span>
            </label>
          </div>
          {validationError && (
            <p className="voice-edit-hint" role="status">
              {validationError}
            </p>
          )}
          {submitError && (
            <p className="voice-edit-hint voice-edit-hint--error" role="alert">
              {submitError}
            </p>
          )}
        </section>

        <footer className="voice-dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleConfirm}
            disabled={!canConfirm || isSaving}
          >
            {isSaving ? 'Converting...' : 'Add expense'}
          </button>
        </footer>
      </div>
    </dialog>
  )
}

export default VoiceExpenseDialog
