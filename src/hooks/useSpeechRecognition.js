import { useCallback, useEffect, useRef, useState } from 'react'

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useSpeechRecognition({ lang = 'en-US', onFinalTranscript } = {}) {
  const recognitionRef = useRef(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognition()))
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }

    setError('')
    setTranscript('')

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) {
          finalText += text
        } else {
          interim += text
        }
      }

      const combined = (finalText || interim).trim()
      setTranscript(combined)

      if (finalText.trim()) {
        onFinalTranscript?.(finalText.trim())
      }
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      if (event.error === 'aborted') return
      const messages = {
        'not-allowed': 'Microphone access denied. Allow the mic in browser settings.',
        'no-speech': 'No speech detected. Try again and speak clearly.',
        'network': 'Voice recognition needs a network connection in some browsers.',
      }
      setError(messages[event.error] ?? `Voice error: ${event.error}`)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [lang, onFinalTranscript])

  const toggle = useCallback(() => {
    if (isListening) {
      stop()
      return
    }
    start()
  }, [isListening, start, stop])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  return {
    isSupported,
    isListening,
    transcript,
    error,
    setTranscript,
    start,
    stop,
    toggle,
  }
}
