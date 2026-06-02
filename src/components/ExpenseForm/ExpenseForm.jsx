import { useState } from 'react'
import './ExpenseForm.css'

function ExpenseForm({ categories, onAdd }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[0] ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Please enter an expense name.')
      return
    }

    const parsedAmount = Number(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter an amount greater than zero.')
      return
    }

    onAdd({
      name: name.trim(),
      amount: parsedAmount,
      category,
      paid: false,
      date: new Date().toISOString().slice(0, 10),
    })
    setName('')
    setAmount('')
    setCategory(categories[0] ?? '')
    setError('')
  }

  return (
    <section className="card expense-form-card">
      <h2>Add an expense</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <label>
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Coffee, ticket, groceries"
          />
        </label>

        <label>
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="24.50"
          />
        </label>

        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button">
          Add expense
        </button>
      </form>
    </section>
  )
}

export default ExpenseForm
