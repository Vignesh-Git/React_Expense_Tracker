import { NavLink } from 'react-router-dom'
import {
  IconAddExpense,
  IconDashboard,
  IconHistory,
  IconLogout,
  IconSettings,
  IconTheme,
} from './NavIcons.jsx'
import { formatCurrency } from '../../lib/currency.js'
import './SideNav.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { to: '/add-expense', label: 'Add Expense', Icon: IconAddExpense },
  { to: '/history', label: 'History', Icon: IconHistory },
  { to: '/settings', label: 'Setup', Icon: IconSettings },
]

function getInitials(displayName, email) {
  const source = displayName?.trim() || email || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function SideNav({
  user,
  total,
  count,
  currencyCode,
  theme,
  isOpen,
  onClose,
  onToggleTheme,
  onLogout,
}) {
  const itemLabel = count === 1 ? 'expense' : 'expenses'

  return (
    <aside
      className={`sidenav ${isOpen ? 'sidenav--open' : ''}`}
      aria-label="Main sidebar"
    >
      <div className="sidenav-inner">
        <div className="sidenav-brand">
          <div className="sidenav-logo" aria-hidden="true">
            SW
          </div>
          <div>
            <p className="sidenav-brand-name">SpendWise</p>
            <p className="sidenav-brand-tag">Expense tracker</p>
          </div>
          <button
            type="button"
            className="sidenav-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="sidenav-stats card">
          <p className="sidenav-stat-label">Total spent</p>
          <p className="sidenav-stat-value">{formatCurrency(total, currencyCode)}</p>
          <p className="sidenav-stat-meta">
            {count} {itemLabel}
            {user?.displayName ? ` · ${user.displayName.split(' ')[0]}` : ''}
          </p>
        </div>

        <nav className="sidenav-nav" aria-label="Primary">
          <p className="sidenav-section-label">Menu</p>
          <ul className="sidenav-links">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `sidenav-link ${isActive ? 'sidenav-link--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidenav-link-icon">
                    <Icon />
                  </span>
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidenav-footer">
          <div className="sidenav-user">
            <div className="sidenav-avatar" aria-hidden="true">
              {getInitials(user?.displayName, user?.email)}
            </div>
            <div className="sidenav-user-text">
              <p className="sidenav-user-name">{user?.displayName}</p>
              <p className="sidenav-user-email">{user?.email}</p>
            </div>
          </div>

          <div className="sidenav-actions">
            <button
              type="button"
              className="sidenav-action-btn"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
            >
              <IconTheme />
              <span>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
            </button>
            <button type="button" className="sidenav-action-btn sidenav-action-btn--danger" onClick={onLogout}>
              <IconLogout />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default SideNav
