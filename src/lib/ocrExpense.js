import { parseExpenseNlp } from './parseExpenseNlp.js'

const TOTAL_KEYWORDS = [
  'grand total',
  'amount due',
  'balance due',
  'total due',
  'total',
]

const IGNORE_TOTAL_KEYWORDS = ['subtotal', 'sub total', 'tax', 'change', 'cash', 'card']

function getCleanLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function extractAmounts(line) {
  const matches = line.match(/(?:\$|usd)?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})|\d+\.\d{2})/gi) ?? []
  return matches
    .map((match) => Number(match.replace(/[$,\s]|usd/gi, '')))
    .filter((value) => Number.isFinite(value) && value > 0)
}

function findTotalAmount(lines) {
  const rankedTotals = lines
    .map((line) => {
      const lower = line.toLowerCase()
      const hasTotalKeyword = TOTAL_KEYWORDS.some((keyword) => lower.includes(keyword))
      const ignored = IGNORE_TOTAL_KEYWORDS.some((keyword) => lower.includes(keyword))
      const amounts = extractAmounts(line)

      if (!hasTotalKeyword || ignored || amounts.length === 0) return null

      const keywordScore = TOTAL_KEYWORDS.findIndex((keyword) => lower.includes(keyword))
      return {
        amount: Math.max(...amounts),
        score: keywordScore === -1 ? TOTAL_KEYWORDS.length : keywordScore,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || b.amount - a.amount)

  if (rankedTotals.length > 0) return rankedTotals[0].amount

  const allAmounts = lines.flatMap(extractAmounts)
  return allAmounts.length > 0 ? Math.max(...allAmounts) : null
}

function findMerchantName(lines) {
  const ignored = /\b(total|subtotal|tax|invoice|receipt|date|time|cashier|change|visa|mastercard|card)\b/i

  return (
    lines.find((line) => {
      const hasLetter = /[a-z]/i.test(line)
      const mostlyNumbers = line.replace(/[^0-9]/g, '').length > line.length / 2
      return hasLetter && !mostlyNumbers && !ignored.test(line)
    }) ?? 'Scanned bill'
  )
}

function normalizeMerchantName(name) {
  return name
    .replace(/[^a-z0-9&' -]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
}

export async function readBillImage(file, onProgress) {
  if (!file) {
    return { ok: false, error: 'Please choose a bill image.' }
  }

  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Please upload an image file like JPG, PNG, or WEBP.' }
  }

  const tesseractModule = await import('tesseract.js')
  const recognize = tesseractModule.recognize ?? tesseractModule.default?.recognize

  if (!recognize) {
    return { ok: false, error: 'OCR engine could not be loaded. Please try again.' }
  }

  const result = await recognize(file, 'eng', {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.(Math.round(message.progress * 100))
      }
    },
  })

  const text = result.data.text.trim()
  if (!text) {
    return { ok: false, error: 'Could not read text from this bill. Try a clearer photo.' }
  }

  return { ok: true, text }
}

export function parseBillOcrText(text, categories) {
  const lines = getCleanLines(text)
  const amount = findTotalAmount(lines)

  if (!amount) {
    return {
      ok: false,
      error: 'Could not find a total amount in the bill. Try a clearer photo.',
    }
  }

  const merchantName = normalizeMerchantName(findMerchantName(lines))
  const parserInput = `${merchantName} ${amount.toFixed(2)} dollars ${text}`
  const parsed = parseExpenseNlp(parserInput, categories)

  if (!parsed.ok) return parsed

  return {
    ...parsed,
    expense: {
      ...parsed.expense,
      name: merchantName || parsed.expense.name,
      amount,
      paid: true,
    },
    hints: ['OCR bill scan', ...(parsed.hints ?? [])],
  }
}
