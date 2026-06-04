import ExpenseChart from '../../components/ExpenseChart'
import ExpenseForm from '../../components/ExpenseForm'
import RecurringManager from '../../components/RecurringManager'
import './AddExpense.css'

function AddExpense({
  expenses,
  categories,
  chartCategories,
  addExpense,
  recurringRules,
  addRecurringRule,
  deleteRecurringRule,
  currencyCode,
}) {
  return (
    <div className="add-expense-page">
      <section className="card add-expense-hero">
        <div>
          <p className="add-expense-eyebrow">Track spend</p>
          <h1>Add an expense</h1>
          <p className="chart-subtitle">
            Add expenses manually, by voice, or by scanning a bill. Your all-time category mix
            updates instantly.
          </p>
        </div>
      </section>

      <div className="add-expense-grid">
        <ExpenseChart
          expenses={expenses}
          categories={chartCategories}
          title="All-time category mix"
          subtitle="Lifetime spending split across your categories."
          currencyCode={currencyCode}
        />
        <ExpenseForm categories={categories} onAdd={addExpense} />
      </div>

      <RecurringManager
        categories={categories}
        rules={recurringRules}
        currencyCode={currencyCode}
        onAddRule={addRecurringRule}
        onDeleteRule={deleteRecurringRule}
        onCreateCurrentExpense={addExpense}
      />
    </div>
  )
}

export default AddExpense
