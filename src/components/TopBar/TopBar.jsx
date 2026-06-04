import { formatCurrency } from '../../lib/currency.js'
import './TopBar.css'

function TopBar({ title, total, currencyCode, onMenuClick }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <span className="topbar-menu-icon" aria-hidden="true" />
      </button>

      <div className="topbar-title-wrap">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-total" title="Total expenses">
        <span className="topbar-total-label">Total</span>
        <span className="topbar-total-value">{formatCurrency(total, currencyCode)}</span>
      </div>
    </header>
  )
}

export default TopBar
