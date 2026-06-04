import './Toast.css'

function Toast({ open, message, actionLabel, onAction, onClose }) {
  if (!open) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      <p>{message}</p>
      {actionLabel && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}

export default Toast
