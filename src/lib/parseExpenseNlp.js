const CATEGORY_KEYWORDS = {
  Food: [
    'lunch',
    'dinner',
    'breakfast',
    'brunch',
    'coffee',
    'cafe',
    'grocery',
    'groceries',
    'restaurant',
    'food',
    'pizza',
    'burger',
    'sushi',
    'doordash',
    'uber eats',
    'grubhub',
    'starbucks',
    'chipotle',
    'snack',
    'baker',
    'bakery',
  ],
  Travel: [
    'flight',
    'airline',
    'hotel',
    'motel',
    'uber',
    'lyft',
    'taxi',
    'cab',
    'gas',
    'fuel',
    'petrol',
    'train',
    'metro',
    'bus',
    'travel',
    'airbnb',
    'parking',
    'toll',
  ],
  Shopping: [
    'amazon',
    'shopping',
    'mall',
    'clothes',
    'clothing',
    'shoes',
    'target',
    'walmart',
    'costco',
    'ikea',
    'electronics',
    'gift',
  ],
  Bills: [
    'rent',
    'mortgage',
    'electric',
    'electricity',
    'water bill',
    'internet',
    'wifi',
    'phone bill',
    'subscription',
    'netflix',
    'spotify',
    'utility',
    'utilities',
    'insurance',
    'bill',
    'bills',
  ],
}

const ONES = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
}

const TENS = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
}

const FILLER_PATTERN =
  /\b(?:i|me|my|the|a|an|for|on|at|to|of|just|please|add|spent|spend|paid|pay|cost|was|were|about|around|roughly|like|dollars?|bucks?|usd|category|under|in)\b/gi

export const VOICE_EXAMPLES = [
  {
    id: 'coffee',
    label: 'Quick coffee',
    phrase: 'Five dollars for coffee',
    hint: 'Amount + item',
  },
  {
    id: 'chipotle',
    label: 'Restaurant',
    phrase: 'Spent $12.50 on lunch at Chipotle',
    hint: 'Merchant + Food',
  },
  {
    id: 'groceries',
    label: 'Groceries',
    phrase: 'Forty two dollars groceries yesterday',
    hint: 'Amount words + date',
  },
  {
    id: 'uber',
    label: 'Ride share',
    phrase: 'Uber ride twenty five dollars',
    hint: 'Travel keywords',
  },
  {
    id: 'netflix',
    label: 'Subscription',
    phrase: 'Netflix fifteen bucks bills category',
    hint: 'Explicit category',
  },
  {
    id: 'gas',
    label: 'Fuel',
    phrase: 'Paid fifty for gas',
    hint: 'Marks as paid',
  },
  {
    id: 'amazon',
    label: 'Online shopping',
    phrase: 'Amazon shopping ninety nine dollars',
    hint: 'Shopping keywords',
  },
  {
    id: 'rent',
    label: 'Rent',
    phrase: 'Rent twelve hundred dollars bills',
    hint: 'Large amount',
  },
]

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function parseWordsToNumber(text) {
  const lower = text.toLowerCase()
  const hundredMatch = lower.match(
    /(?:(\w+)\s+)?hundred(?:\s+and\s+)?(?:(\w+)(?:\s+(\w+))?)?/,
  )
  if (hundredMatch) {
    const hundreds = hundredMatch[1] ? wordToNumber(hundredMatch[1]) : 1
    const rest = [hundredMatch[2], hundredMatch[3]].filter(Boolean).join(' ')
    return hundreds * 100 + (rest ? parseWordsToNumber(rest) : 0)
  }

  const parts = lower.split(/[\s-]+/).filter(Boolean)
  let total = 0
  let current = 0

  for (const part of parts) {
    if (part === 'and') continue
    if (TENS[part] !== undefined) {
      current += TENS[part]
      continue
    }
    if (ONES[part] !== undefined) {
      current += ONES[part]
      continue
    }
    return null
  }

  total += current
  return total > 0 ? total : null
}

function wordToNumber(word) {
  if (ONES[word] !== undefined) return ONES[word]
  if (TENS[word] !== undefined) return TENS[word]
  return 0
}

function extractAmount(text) {
  const dollarMatch = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/i)
  if (dollarMatch) {
    return parseFloat(dollarMatch[1].replace(/,/g, ''))
  }

  const numericPatterns = [
    /([\d,]+(?:\.\d{1,2})?)\s*(?:dollars?|bucks?|usd)\b/i,
    /\b(?:spent|paid|cost|for|was|about|around)\s+\$?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\b\$?\s*([\d,]+(?:\.\d{1,2})?)\s+(?:on|for|at)\b/i,
  ]

  for (const pattern of numericPatterns) {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ''))
      if (!Number.isNaN(value) && value > 0) return value
    }
  }

  const spokenDollar = text.match(
    /\b((?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[\s-]+)?)?(?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)(?:[\s-]+)?)?(?:hundred(?:[\s-]+and)?(?:[\s-]+)?(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[\s-]+)?)?(?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen))?)?)\s*(?:dollars?|bucks?)\b/i,
  )
  if (spokenDollar) {
    const value = parseWordsToNumber(spokenDollar[1])
    if (value && value > 0) return value
  }

  const spokenLeading = text.match(
    /^\s*((?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[\s-]+)?)?(?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)(?:[\s-]+)?)?)\s+(?:for|on|at)\b/i,
  )
  if (spokenLeading) {
    const value = parseWordsToNumber(spokenLeading[1])
    if (value && value > 0) return value
  }

  const hundredPhrase = text.match(/\b([\w\s-]+?)\s+hundred\b/i)
  if (hundredPhrase) {
    const base = parseWordsToNumber(hundredPhrase[1].trim())
    if (base && base > 0) return base * 100
  }

  return null
}

function extractDate(text) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  if (/\byesterday\b/i.test(text)) {
    const date = new Date(today)
    date.setDate(date.getDate() - 1)
    return date.toISOString().slice(0, 10)
  }

  if (/\b(last week|a week ago)\b/i.test(text)) {
    const date = new Date(today)
    date.setDate(date.getDate() - 7)
    return date.toISOString().slice(0, 10)
  }

  if (/\b(today|just now)\b/i.test(text)) {
    return today.toISOString().slice(0, 10)
  }

  const isoMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/)
  if (isoMatch) return isoMatch[1]

  return today.toISOString().slice(0, 10)
}

function scoreCategory(text, category, keywords) {
  let score = 0
  for (const keyword of keywords) {
    if (text.includes(keyword)) score += keyword.includes(' ') ? 2 : 1
  }
  return score
}

function inferCategory(text, categories) {
  const explicit = text.match(
    /\b(?:category|under|in|type)\s+(food|travel|shopping|bills)\b/i,
  )
  if (explicit) {
    const value = explicit[1].toLowerCase()
    const match = categories.find((c) => c.toLowerCase() === value)
    if (match) return match
  }

  const scores = categories.map((category) => ({
    category,
    score: scoreCategory(text, category, CATEGORY_KEYWORDS[category] ?? []),
  }))

  scores.sort((a, b) => b.score - a.score)
  if (scores[0].score > 0) return scores[0].category
  return categories[0] ?? 'Food'
}

function buildName(originalText, amount, category) {
  let name = originalText

  if (amount !== null) {
    name = name.replace(/\$\s*[\d,]+(?:\.\d{1,2})?/gi, ' ')
    name = name.replace(
      new RegExp(
        `\\b${amount.toString().replace('.', '\\.')}\\b|\\b${Math.floor(amount)}\\b`,
        'gi',
      ),
      ' ',
    )
    name = name.replace(
      /\b(?:spent|paid|cost|for|was|about|around)\s+\$?\s*[\d,]+(?:\.\d{1,2})?/gi,
      ' ',
    )
    name = name.replace(/[\d,]+(?:\.\d{1,2})?\s*(?:dollars?|bucks?|usd)\b/gi, ' ')
  }

  name = name.replace(/\b(?:yesterday|today|last week|a week ago|just now)\b/gi, ' ')
  name = name.replace(/\b(?:category|under|in|type)\s+(?:food|travel|shopping|bills)\b/gi, ' ')
  name = name.replace(FILLER_PATTERN, ' ')
  name = name.replace(/\s+/g, ' ').trim()

  if (!name) {
    name = category === 'Bills' ? 'Bill payment' : `${category} expense`
  }

  return name.charAt(0).toUpperCase() + name.slice(1)
}

function detectPaid(text) {
  return /\b(?:already\s+)?paid\b/i.test(text) && !/\bunpaid\b/i.test(text)
}

/**
 * Parse natural language or voice transcript into an expense object.
 * @returns {{ ok: true, expense: object, confidence: number, hints: string[] } | { ok: false, error: string }}
 */
export function parseExpenseNlp(text, categories = ['Food', 'Travel', 'Shopping', 'Bills']) {
  const raw = normalizeText(text)
  if (!raw) {
    return { ok: false, error: 'Say or type an expense to parse.' }
  }

  const lower = raw.toLowerCase()
  const amount = extractAmount(raw)

  if (amount === null || amount <= 0) {
    return {
      ok: false,
      error: 'Could not find an amount. Try: "Spent $24 on coffee" or "Five dollars for lunch".',
    }
  }

  const category = inferCategory(lower, categories)
  const name = buildName(raw, amount, category)
  const date = extractDate(lower)
  const paid = detectPaid(lower)

  const hints = []
  if (/\b(yesterday|today|last week)\b/i.test(raw)) hints.push('Date detected')
  if (paid) hints.push('Marked as paid')
  if (scoreCategory(lower, category, CATEGORY_KEYWORDS[category] ?? []) > 0) {
    hints.push(`Category: ${category}`)
  }

  const confidence = Math.min(
    1,
    0.5 + (amount ? 0.25 : 0) + (name.length > 3 ? 0.15 : 0) + (hints.length > 0 ? 0.1 : 0),
  )

  return {
    ok: true,
    expense: {
      name,
      amount: Math.round(amount * 100) / 100,
      category,
      date,
      paid,
    },
    confidence,
    hints,
  }
}
