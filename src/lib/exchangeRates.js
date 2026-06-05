import { DEFAULT_CURRENCY, getCurrencyByCode } from './currency.js'

const CURRENCY_API_BASE_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api'

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeRateDate(date) {
  const rawDate = date || getTodayIso()
  return rawDate > getTodayIso() ? getTodayIso() : rawDate
}

async function fetchRateFromFeed(version, fromCurrencyCode, toCurrencyCode) {
  const sourceKey = fromCurrencyCode.toLowerCase()
  const targetKey = toCurrencyCode.toLowerCase()
  const response = await fetch(`${CURRENCY_API_BASE_URL}@${version}/v1/currencies/${sourceKey}.json`)

  if (!response.ok) {
    throw new Error(`Could not fetch ${fromCurrencyCode} rates.`)
  }

  const data = await response.json()
  const rate = Number(data?.[sourceKey]?.[targetKey])

  if (!rate || Number.isNaN(rate)) {
    throw new Error(`${fromCurrencyCode} to ${toCurrencyCode} rate is not available.`)
  }

  return {
    exchangeRate: rate,
    exchangeRateDate: data.date ?? version,
  }
}

async function fetchHistoricalRate(fromCurrencyCode, toCurrencyCode, date) {
  try {
    return await fetchRateFromFeed(date, fromCurrencyCode, toCurrencyCode)
  } catch (error) {
    if (date !== getTodayIso()) throw error
    return fetchRateFromFeed('latest', fromCurrencyCode, toCurrencyCode)
  }
}

export async function normalizeExpenseCurrency(expense, baseCurrencyCode = DEFAULT_CURRENCY) {
  const targetCurrencyCode = getCurrencyByCode(baseCurrencyCode).code
  const sourceCurrencyCode = getCurrencyByCode(
    expense.currencyCode ?? expense.originalCurrencyCode ?? targetCurrencyCode,
  ).code
  const originalAmount = roundMoney(expense.originalAmount ?? expense.amount)
  const rateDate = normalizeRateDate(expense.date)

  if (!originalAmount || originalAmount <= 0) {
    throw new Error('Enter an amount greater than zero.')
  }

  if (sourceCurrencyCode === targetCurrencyCode) {
    return {
      ...expense,
      amount: originalAmount,
      currencyCode: targetCurrencyCode,
      originalAmount,
      originalCurrencyCode: sourceCurrencyCode,
      exchangeRate: 1,
      exchangeRateDate: rateDate,
    }
  }

  const { exchangeRate, exchangeRateDate } = await fetchHistoricalRate(
    sourceCurrencyCode,
    targetCurrencyCode,
    rateDate,
  )

  return {
    ...expense,
    amount: roundMoney(originalAmount * exchangeRate),
    currencyCode: targetCurrencyCode,
    originalAmount,
    originalCurrencyCode: sourceCurrencyCode,
    exchangeRate,
    exchangeRateDate,
  }
}
