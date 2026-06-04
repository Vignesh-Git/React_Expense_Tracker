import { useMemo, useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'
import './CategoryManager.css'

function CategoryManager({ categories, expenses, onAddCategory, onDeleteCategory }) {
  const [categoryName, setCategoryName] = useState('')
  const [message, setMessage] = useState('')
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const usageMap = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + 1
      return acc
    }, {})
  }, [expenses])

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = onAddCategory(categoryName)
    if (!result.ok) {
      setMessage(result.error)
      return
    }

    setCategoryName('')
    setMessage('Category added.')
  }

  const handleDelete = (category) => {
    const result = onDeleteCategory(category)
    setMessage(result.ok ? 'Category removed.' : result.error)
  }

  return (
    <section className="card category-manager-card">
      <div className="category-manager-header">
        <div>
          <h2>Categories</h2>
          <p className="chart-subtitle">Create your own spending buckets.</p>
        </div>
      </div>

      <form className="category-form" onSubmit={handleSubmit}>
        <label>
          <span>New category</span>
          <input
            type="text"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Health, Pets, Education"
            maxLength={28}
          />
        </label>
        <button type="submit" className="primary-button">
          Add
        </button>
      </form>

      {message && <p className="category-message">{message}</p>}

      <ul className="category-list">
        {categories.map((category) => {
          const usageCount = usageMap[category] ?? 0
          return (
            <li key={category} className="category-list-item">
              <div>
                <p className="category-name">{category}</p>
                <p className="category-usage">
                  {usageCount} {usageCount === 1 ? 'expense' : 'expenses'}
                </p>
              </div>
              <button
                type="button"
                className="category-delete-button"
                onClick={() => setCategoryToDelete(category)}
                disabled={usageCount > 0 || categories.length <= 1}
                title={
                  usageCount > 0
                    ? 'Used categories cannot be deleted'
                    : 'Delete category'
                }
              >
                Delete
              </button>
            </li>
          )
        })}
      </ul>

      <ConfirmationDialog
        open={Boolean(categoryToDelete)}
        title="Delete category?"
        description={
          categoryToDelete
            ? `This will permanently delete "${categoryToDelete}" from your category list.`
            : ''
        }
        confirmLabel="Delete category"
        onConfirm={() => handleDelete(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
      />
    </section>
  )
}

export default CategoryManager
