import { useEffect, useRef } from 'react'
import './ConfirmationDialog.css'

function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleConfirm = () => {
    onClose()
    onConfirm()
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirmation-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="confirmation-dialog-panel">
        <div className={`confirmation-dialog-icon confirmation-dialog-icon--${tone}`} aria-hidden="true">
          !
        </div>

        <div className="confirmation-dialog-content">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>

        <footer className="confirmation-dialog-actions">
          <button type="button" className="confirmation-cancel-button" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirmation-confirm-button confirmation-confirm-button--${tone}`}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </dialog>
  )
}

export default ConfirmationDialog
