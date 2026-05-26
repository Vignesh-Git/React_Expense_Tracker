import ExpenseChart from '../components/ExpenseChart.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'

function Dashboard({ expenses, categories, addExpense }) {
  return (
    <div className="dashboard-row">
      <ExpenseChart expenses={expenses} />

      <ExpenseForm categories={categories} onAdd={addExpense} />
    </div>
  )
}

export default Dashboard
