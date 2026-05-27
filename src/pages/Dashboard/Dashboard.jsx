import ExpenseChart from '../../components/ExpenseChart'
import ExpenseForm from '../../components/ExpenseForm'
import './Dashboard.css'

function Dashboard({ expenses, categories, addExpense }) {
  return (
    <div className="dashboard-row">
      <ExpenseChart expenses={expenses} />

      <ExpenseForm categories={categories} onAdd={addExpense} />
    </div>
  )
}

export default Dashboard
