import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout, { AuthFooterLink } from '../../components/AuthLayout'
import { useAuth } from '../../context/AuthContext.jsx'
import './AuthForm.css'

const MIN_PASSWORD_LENGTH = 6

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!displayName.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = await signup({
      displayName,
      email,
      password,
    })
    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Each user gets a private expense vault on this device."
      footer={
        <AuthFooterLink prompt="Already have an account?" linkText="Sign in" to="/login" />
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          <span>Name</span>
          <input
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Alex Morgan"
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
          />
        </label>

        <p className="form-hint">Passwords are hashed before storage in localStorage.</p>

        <label>
          <span>Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
          />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Signup
