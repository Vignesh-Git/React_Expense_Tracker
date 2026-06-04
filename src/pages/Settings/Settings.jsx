import CategoryManager from '../../components/CategoryManager'
import CategoryBudgetManager from '../../components/CategoryBudgetManager'
import { CURRENCIES, getCurrencyByCode } from '../../lib/currency.js'
import './Settings.css'

function Settings({
  categories,
  expenses,
  currencyCode,
  categoryBudgets,
  onCurrencyChange,
  onUpdateCategoryBudget,
  addCategory,
  deleteCategory,
}) {
  const selectedCurrency = getCurrencyByCode(currencyCode)

  return (
    <div className="settings-page">
      <section className="card settings-hero">
        <div>
          <p className="settings-eyebrow">Setup</p>
          <h1>Workspace settings</h1>
          <p className="chart-subtitle">
            Configure your preferred currency and category structure for this account.
          </p>
        </div>
      </section>

      <section className="card currency-settings-card">
        <div className="settings-section-header">
          <div>
            <h2>Currency</h2>
            <p className="chart-subtitle">
              Choose how amounts are displayed across dashboard, history, export, and charts.
            </p>
          </div>
          <div className="currency-preview" aria-label="Selected currency">
            <span>{selectedCurrency.symbol}</span>
            <p>{selectedCurrency.code}</p>
          </div>
        </div>

        <label className="currency-select-field">
          <span>Preferred currency</span>
          <select
            value={currencyCode}
            onChange={(event) => onCurrencyChange(event.target.value)}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} - {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </label>
      </section>

      <CategoryManager
        categories={categories}
        expenses={expenses}
        onAddCategory={addCategory}
        onDeleteCategory={(category) => deleteCategory(category, expenses)}
      />

      <CategoryBudgetManager
        categories={categories}
        categoryBudgets={categoryBudgets}
        currencyCode={currencyCode}
        onUpdateCategoryBudget={onUpdateCategoryBudget}
      />
    </div>
  )
}

export default Settings
