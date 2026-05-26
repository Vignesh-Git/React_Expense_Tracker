function FilterBar({ categories, activeFilter, onFilterChange }) {
  return (
    <section className="card filter-card">
      <h2>Filter by category</h2>
      <div className="filter-buttons">
        <button
          type="button"
          className={activeFilter === 'all' ? 'filter-button active' : 'filter-button'}
          onClick={() => onFilterChange('all')}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeFilter === category ? 'filter-button active' : 'filter-button'}
            onClick={() => onFilterChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  )
}

export default FilterBar
