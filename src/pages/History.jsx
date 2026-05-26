import ExpenseList from '../components/ExpenseList.jsx'
import FilterBar from '../components/FilterBar.jsx'

function History({ expenses, categories, filter, setFilter, togglePaid, deleteExpense }) {
  const filtered = filter === 'all' ? expenses : expenses.filter((e) => e.category === filter)

  return (
    <div>
      <section className="card">
        <h2>All expenses</h2>
        <p className="chart-subtitle">Complete history of your spending</p>
      </section>

      <div className="filter-row card" style={{ marginTop: 16 }}>
        <FilterBar categories={categories} activeFilter={filter} onFilterChange={setFilter} />
      </div>

      <ExpenseList expenses={filtered} onTogglePaid={togglePaid} onDelete={deleteExpense} />
    </div>
  )
}

export default History
