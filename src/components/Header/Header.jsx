import { NavLink } from 'react-router-dom'
import './Header.css'

function getInitials(displayName, email) {
  const source = displayName?.trim() || email || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function Header({ user, total, count, theme, onToggleTheme, onLogout }) {
  const itemLabel = count === 1 ? 'item' : 'items'

  return (
    <header className="header-card">
      <div className="header-intro">
        <p className="label">Total expenses</p>
        <h1>${total.toFixed(2)}</h1>
        {user?.displayName && (
          <p className="header-greeting">Hi, {user.displayName.split(' ')[0]}</p>
        )}
      </div>

      <nav className="header-controls" aria-label="Main navigation">
        <div className="nav-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            History
          </NavLink>
        </div>

        <div className="summary-badge" title="Expenses in your account">
          <span>{count}</span>
          <p>{itemLabel}</p>
        </div>

        <div className="user-menu">
          <div className="user-avatar" aria-hidden="true">
            {getInitials(user?.displayName, user?.email)}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.displayName}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Toggle theme"
          className="theme-toggle"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        <button type="button" className="sign-out-button" onClick={onLogout}>
          Sign out
        </button>
      </nav>
    </header>
  )
}

export default Header
