import { useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import { formatCurrency } from '../../lib/currency.js'
import './RecurringManager.css'

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7)
}

function RecurringManager({
  categories,
  rules,
  currencyCode,
  onAddRule,
  onDeleteRule,
  onCreateCurrentExpense,
}) {
  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: categories[0] ?? '',
    startDate: new Date().toISOString().slice(0, 10),
    paid: false,
  })
  const [message, setMessage] = useState('')
  const [ruleToDelete, setRuleToDelete] = useState(null)

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.name.trim() || Number.isNaN(amount) || amount <= 0 || !form.category) {
      setMessage('Enter name, amount, and category for the recurring rule.')
      return
    }

    const currentMonth = getCurrentMonthKey()
    const rule = onAddRule({
      ...form,
      amount,
      lastGeneratedMonth: currentMonth,
    })

    onCreateCurrentExpense({
      name: rule.name,
      amount: rule.amount,
      category: rule.category,
      paid: rule.paid,
      date: new Date().toISOString().slice(0, 10),
      recurringRuleId: rule.id,
      recurringMonth: currentMonth,
    })

    setForm({
      name: '',
      amount: '',
      category: categories[0] ?? '',
      startDate: new Date().toISOString().slice(0, 10),
      paid: false,
    })
    setMessage('Recurring rule added and this month’s expense created.')
  }

  return (
    <section className="card recurring-card">
      <div className="recurring-header">
        <div>
          <h2>Recurring expenses</h2>
          <p className="chart-subtitle">Create monthly rules for rent, subscriptions, and bills.</p>
        </div>
      </div>

      <form className="recurring-form" onSubmit={handleSubmit}>
        <label className="recurring-field recurring-field--wide">
          <span>Name</span>
          <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Netflix, Rent, Gym" />
        </label>
        <label className="recurring-field">
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => updateForm('amount', event.target.value)}
            placeholder="99.00"
          />
        </label>
        <label className="recurring-field">
          <span>Category</span>
          <select value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="recurring-field">
          <span>Start date</span>
          <input type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} />
        </label>
        <label className="recurring-paid-toggle">
          <input
            type="checkbox"
            checked={form.paid}
            onChange={(event) => updateForm('paid', event.target.checked)}
          />
          <span>Mark generated expenses as paid</span>
        </label>
        <button type="submit" className="primary-button">
          Add recurring
        </button>
      </form>

      {message && <p className="recurring-message">{message}</p>}

      <ul className="recurring-list">
        {rules.map((rule) => (
          <li key={rule.id}>
            <div>
              <p>{rule.name}</p>
              <span>
                {formatCurrency(rule.amount, currencyCode)} · {rule.category} · Monthly
              </span>
            </div>
            <button type="button" onClick={() => setRuleToDelete(rule)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {rules.length === 0 && <p className="recurring-empty">No recurring rules yet.</p>}

      <ConfirmationDialog
        open={Boolean(ruleToDelete)}
        title="Delete recurring rule?"
        description={ruleToDelete ? `Future "${ruleToDelete.name}" expenses will no longer be generated.` : ''}
        confirmLabel="Delete rule"
        onConfirm={() => onDeleteRule(ruleToDelete.id)}
        onClose={() => setRuleToDelete(null)}
      />
    </section>
  )
}

export default RecurringManager
