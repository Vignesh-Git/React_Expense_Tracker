import ExpenseChart from '../../components/ExpenseChart'
import ExpenseForm from '../../components/ExpenseForm'
import SmartExpenseInput from '../../components/SmartExpenseInput'
import './Dashboard.css'

function Dashboard({ expenses, categories, addExpense }) {
  return (
    <>
      <SmartExpenseInput categories={categories} onAdd={addExpense} />

      <div className="dashboard-row">
        <ExpenseChart expenses={expenses} />
        <ExpenseForm categories={categories} onAdd={addExpense} />
      </div>
    </>
  )
}

export default Dashboard
