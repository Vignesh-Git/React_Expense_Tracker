import { Link } from 'react-router-dom'
import './AuthLayout.css'

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand" aria-hidden="false">
        <div className="auth-brand-inner">
          <p className="auth-logo">SpendWise</p>
          <h1>Your money, organized.</h1>
          <p className="auth-tagline">
            Track spending by category, mark bills paid, and see insights — all stored securely in
            your browser, scoped to your account.
          </p>
          <ul className="auth-features">
            <li>Per-user expense vault in localStorage</li>
            <li>Dashboard charts and category filters</li>
            <li>Dark mode and instant sync on this device</li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card card">
          <header className="auth-card-header">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </header>
          {children}
          {footer && <footer className="auth-card-footer">{footer}</footer>}
        </div>
        <p className="auth-disclaimer">
          Demo app — data stays on this device only. Use a strong password if you share this
          computer.
        </p>
      </main>
    </div>
  )
}

export function AuthFooterLink({ prompt, linkText, to }) {
  return (
    <p className="auth-switch">
      {prompt}{' '}
      <Link to={to} className="auth-link">
        {linkText}
      </Link>
    </p>
  )
}

export default AuthLayout
