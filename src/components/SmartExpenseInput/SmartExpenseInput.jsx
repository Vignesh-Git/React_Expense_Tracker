import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseExpenseNlp, VOICE_EXAMPLES } from '../../lib/parseExpenseNlp.js'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js'
import './SmartExpenseInput.css'

function formatDate(isoDate) {
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return isoDate
  }
}

function SmartExpenseInput({ categories, onAdd }) {
  const [input, setInput] = useState('')
  const [parseError, setParseError] = useState('')
  const [preview, setPreview] = useState(null)
  const [showExamples, setShowExamples] = useState(true)

  const runParse = useCallback(
    (text) => {
      const result = parseExpenseNlp(text, categories)
      if (!result.ok) {
        setPreview(null)
        setParseError(result.error)
        return null
      }
      setParseError('')
      setPreview(result)
      return result
    },
    [categories],
  )

  const handleFinalVoice = useCallback(
    (text) => {
      setInput(text)
      runParse(text)
    },
    [runParse],
  )

  const {
    isSupported,
    isListening,
    transcript,
    error: voiceError,
    setTranscript,
    toggle,
  } = useSpeechRecognition({ onFinalTranscript: handleFinalVoice })

  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript)
      runParse(transcript)
    }
  }, [isListening, transcript, runParse])

  const livePreview = useMemo(() => {
    if (!input.trim()) return null
    return parseExpenseNlp(input, categories)
  }, [input, categories])

  const displayPreview = preview ?? (livePreview?.ok ? livePreview : null)

  const handleInputChange = (event) => {
    const value = event.target.value
    setInput(value)
    setTranscript(value)
    if (!value.trim()) {
      setPreview(null)
      setParseError('')
      return
    }
    runParse(value)
  }

  const applyExample = (phrase) => {
    setInput(phrase)
    setTranscript(phrase)
    runParse(phrase)
    setShowExamples(false)
  }

  const handleAdd = () => {
    const result = runParse(input)
    if (!result?.ok) return

    onAdd(result.expense)
    setInput('')
    setTranscript('')
    setPreview(null)
    setParseError('')
    setShowExamples(true)
  }

  const canAdd = displayPreview?.ok

  return (
    <section className="card smart-expense-card">
      <div className="smart-expense-header">
        <div>
          <h2>Smart add</h2>
          <p className="chart-subtitle">Type or speak naturally — NLP fills in the details.</p>
        </div>
        {isSupported ? (
          <button
            type="button"
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={toggle}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <span className="voice-icon" aria-hidden="true">
              {isListening ? '◼' : '🎤'}
            </span>
            {isListening ? 'Listening…' : 'Voice'}
          </button>
        ) : (
          <span className="voice-unsupported">Voice unavailable in this browser</span>
        )}
      </div>

      <div className="smart-input-row">
        <textarea
          className="smart-textarea"
          value={input}
          onChange={handleInputChange}
          placeholder='e.g. "Spent $12.50 on lunch at Chipotle yesterday"'
          rows={2}
          aria-label="Natural language expense"
        />
        <button
          type="button"
          className="primary-button smart-add-button"
          onClick={handleAdd}
          disabled={!canAdd}
        >
          Add from text
        </button>
      </div>

      {isListening && (
        <p className="voice-live" role="status">
          <span className="voice-pulse" aria-hidden="true" />
          Speak now — we&apos;ll parse when you pause.
        </p>
      )}

      {(parseError || voiceError) && (
        <p className="form-error" role="alert">
          {parseError || voiceError}
        </p>
      )}

      {displayPreview?.ok && (
        <div className="nlp-preview" role="region" aria-label="Parsed expense preview">
          <p className="nlp-preview-title">Parsed preview</p>
          <dl className="nlp-preview-grid">
            <div>
              <dt>Name</dt>
              <dd>{displayPreview.expense.name}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>${displayPreview.expense.amount.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{displayPreview.expense.category}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatDate(displayPreview.expense.date)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{displayPreview.expense.paid ? 'Paid' : 'Unpaid'}</dd>
            </div>
          </dl>
          {displayPreview.hints?.length > 0 && (
            <ul className="nlp-hints">
              {displayPreview.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="voice-examples">
        <button
          type="button"
          className="examples-toggle"
          onClick={() => setShowExamples((open) => !open)}
          aria-expanded={showExamples}
        >
          {showExamples ? 'Hide' : 'Show'} voice &amp; text examples
        </button>

        {showExamples && (
          <ul className="examples-list">
            {VOICE_EXAMPLES.map((example) => (
              <li key={example.id}>
                <button
                  type="button"
                  className="example-chip"
                  onClick={() => applyExample(example.phrase)}
                  title={example.hint}
                >
                  <span className="example-label">{example.label}</span>
                  <span className="example-phrase">&ldquo;{example.phrase}&rdquo;</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default SmartExpenseInput
