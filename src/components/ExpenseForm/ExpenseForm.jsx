import { useCallback, useEffect, useRef, useState } from 'react'
import { parseExpenseNlp } from '../../lib/parseExpenseNlp.js'
import { parseBillOcrText, readBillImage } from '../../lib/ocrExpense.js'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js'
import VoiceExpenseDialog from '../VoiceExpenseDialog'
import './ExpenseForm.css'

function ExpenseForm({ categories, onAdd }) {
  const billInputRef = useRef(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[0] ?? '')
  const [error, setError] = useState('')
  const [voiceError, setVoiceError] = useState('')
  const [billError, setBillError] = useState('')
  const [isReadingBill, setIsReadingBill] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogText, setDialogText] = useState('')
  const [dialogSource, setDialogSource] = useState('voice')
  const [parseResult, setParseResult] = useState(null)

  useEffect(() => {
    if (categories.length === 0) return
    if (!categories.includes(category)) {
      setCategory(categories[0])
    }
  }, [categories, category])

  const openVoiceDialog = useCallback(
    (transcript) => {
      setDialogText(transcript)
      setDialogSource('voice')
      setParseResult(parseExpenseNlp(transcript, categories))
      setDialogOpen(true)
      setVoiceError('')
    },
    [categories],
  )

  const handleFinalTranscript = useCallback(
    (text) => {
      if (text.trim()) openVoiceDialog(text.trim())
    },
    [openVoiceDialog],
  )

  const {
    isSupported,
    isListening,
    error: speechError,
    start,
    stop,
  } = useSpeechRecognition({ onFinalTranscript: handleFinalTranscript })

  const handleVoiceClick = () => {
    setVoiceError('')
    setBillError('')
    if (!isSupported) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }
    if (isListening) {
      stop()
      return
    }
    start()
  }

  const handleBillButtonClick = () => {
    setBillError('')
    billInputRef.current?.click()
  }

  const handleBillUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setBillError('')
    setOcrProgress(0)

    if (!file) return

    setIsReadingBill(true)
    try {
      const ocrResult = await readBillImage(file, setOcrProgress)
      if (!ocrResult.ok) {
        setBillError(ocrResult.error)
        return
      }

      setDialogText(ocrResult.text)
      setDialogSource('bill')
      setParseResult(parseBillOcrText(ocrResult.text, categories))
      setDialogOpen(true)
    } catch {
      setBillError('Could not scan this bill. Try a clearer image.')
    } finally {
      setIsReadingBill(false)
      setOcrProgress(0)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setDialogText('')
    setParseResult(null)
  }

  const handleConfirmParsedExpense = (expense) => {
    onAdd(expense)
    closeDialog()
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Please enter an expense name.')
      return
    }

    const parsedAmount = Number(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter an amount greater than zero.')
      return
    }

    onAdd({
      name: name.trim(),
      amount: parsedAmount,
      category,
      paid: false,
      date: new Date().toISOString().slice(0, 10),
    })
    setName('')
    setAmount('')
    setCategory(categories[0] ?? '')
    setError('')
  }

  const activeAssistError = voiceError || speechError || billError

  return (
    <section className="card expense-form-card">
      <div className="expense-form-header">
        <h2>Add an expense</h2>
        <div className="expense-assist-actions">
          <input
            ref={billInputRef}
            type="file"
            accept="image/*"
            className="bill-upload-input"
            onChange={handleBillUpload}
          />
          <button
            type="button"
            className={`assist-trigger ${isReadingBill ? 'processing' : ''}`}
            onClick={handleBillButtonClick}
            aria-label="Upload bill for OCR"
            title="Upload bill"
            disabled={isReadingBill}
          >
            <svg
              className="assist-trigger-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.5-2 1-2-1-2 1-2-1L5 21V5a2 2 0 0 1 2-2zm1 5h8V6H8v2zm0 4h8v-2H8v2zm0 4h5v-2H8v2z"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`assist-trigger ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceClick}
            aria-label={isListening ? 'Stop listening' : 'Add expense by voice'}
            aria-pressed={isListening}
            title={
              isSupported
                ? isListening
                  ? 'Listening... click to stop'
                  : 'Add by voice'
                : 'Voice not supported in this browser'
            }
            disabled={!isSupported}
          >
            <svg
              className="assist-trigger-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {isListening && (
        <p className="voice-listening-hint" role="status">
          Listening… describe your expense, then pause.
        </p>
      )}

      {isReadingBill && (
        <p className="voice-listening-hint" role="status">
          Reading bill image... {ocrProgress > 0 ? `${ocrProgress}%` : 'Preparing OCR'}
        </p>
      )}

      {activeAssistError && !dialogOpen && (
        <p className="form-error voice-inline-error" role="alert">
          {activeAssistError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="expense-form">
        <label>
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Coffee, ticket, groceries"
          />
        </label>

        <label>
          <span>Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="24.50"
          />
        </label>

        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button">
          Add expense
        </button>
      </form>

      <VoiceExpenseDialog
        open={dialogOpen}
        transcript={dialogText}
        parseResult={parseResult}
        categories={categories}
        source={dialogSource}
        onConfirm={handleConfirmParsedExpense}
        onClose={closeDialog}
      />
    </section>
  )
}

export default ExpenseForm
