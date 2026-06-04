import SmartDashboard from '../../components/SmartDashboard'
import './Dashboard.css'

function Dashboard({
  expenses,
  categories,
  monthlyBudget,
  categoryBudgets,
  currencyCode,
  updateMonthlyBudget,
}) {
  return (
    <div className="dashboard-page">
      <SmartDashboard
        expenses={expenses}
        categories={categories}
        monthlyBudget={monthlyBudget}
        categoryBudgets={categoryBudgets}
        currencyCode={currencyCode}
        onUpdateMonthlyBudget={updateMonthlyBudget}
      />
    </div>
  )
}

export default Dashboard
