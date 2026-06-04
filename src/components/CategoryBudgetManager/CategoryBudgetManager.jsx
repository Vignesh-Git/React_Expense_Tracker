import { formatCurrency } from '../../lib/currency.js'
import './CategoryBudgetManager.css'

function CategoryBudgetManager({ categories, categoryBudgets, currencyCode, onUpdateCategoryBudget }) {
  return (
    <section className="card category-budget-card">
      <div>
        <h2>Category budgets</h2>
        <p className="chart-subtitle">Set monthly guardrails for each category.</p>
      </div>

      <div className="category-budget-list">
        {categories.map((category) => (
          <label key={category} className="category-budget-row">
            <div>
              <span>{category}</span>
              <p>{formatCurrency(categoryBudgets[category] ?? 0, currencyCode)} monthly limit</p>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={categoryBudgets[category] ?? ''}
              onChange={(event) => onUpdateCategoryBudget(category, event.target.value)}
              placeholder="0.00"
            />
          </label>
        ))}
      </div>
    </section>
  )
}

export default CategoryBudgetManager
