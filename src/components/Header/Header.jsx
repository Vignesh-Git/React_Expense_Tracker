import { NavLink } from 'react-router-dom'
import './Header.css'

function Header({ total, count, theme, onToggleTheme }) {
  return (
    <header className="header-card">
      <div>
        <p className="label">Total expenses</p>
        <h1>${total.toFixed(2)}</h1>
      </div>

      <nav className="header-controls">
        <div className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            History
          </NavLink>
        </div>

        <div className="summary-badge">
          <span>{count}</span>
          <p>items</p>
        </div>

        <button
          aria-label="Toggle theme"
          className="theme-toggle"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  )
}

export default Header
