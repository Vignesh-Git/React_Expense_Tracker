import { NavLink } from 'react-router-dom'
import { IconAddExpense, IconDashboard, IconHistory, IconSettings } from '../SideNav/NavIcons.jsx'
import './MobileBottomNav.css'

const ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { to: '/add-expense', label: 'Add', Icon: IconAddExpense },
  { to: '/history', label: 'History', Icon: IconHistory },
  { to: '/settings', label: 'Setup', Icon: IconSettings },
]

function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `mobile-bottom-nav__link ${isActive ? 'mobile-bottom-nav__link--active' : ''}`
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default MobileBottomNav
