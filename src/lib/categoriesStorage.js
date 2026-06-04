import { readJson, STORAGE_KEYS, writeJson } from './storage.js'

export const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills']

function normalizeCategoryName(name) {
  return name.trim().replace(/\s+/g, ' ')
}

function getCategoryMap() {
  const map = readJson(STORAGE_KEYS.categories, {})
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {}
}

function saveCategoryMap(map) {
  writeJson(STORAGE_KEYS.categories, map)
}

function uniqueCategories(categories) {
  const seen = new Set()
  return categories
    .map(normalizeCategoryName)
    .filter(Boolean)
    .filter((category) => {
      const key = category.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function getCategoriesForUser(userId) {
  if (!userId) return DEFAULT_CATEGORIES

  const categories = getCategoryMap()[userId]
  if (!Array.isArray(categories) || categories.length === 0) {
    saveCategoriesForUser(userId, DEFAULT_CATEGORIES)
    return DEFAULT_CATEGORIES
  }

  return uniqueCategories(categories)
}

export function saveCategoriesForUser(userId, categories) {
  if (!userId) return
  const map = getCategoryMap()
  map[userId] = uniqueCategories(categories)
  saveCategoryMap(map)
}

export function buildCategoryList(categories, expenses = []) {
  return uniqueCategories([
    ...(Array.isArray(categories) ? categories : []),
    ...expenses.map((expense) => expense.category).filter(Boolean),
  ])
}

export function normalizeCategoryInput(name) {
  return normalizeCategoryName(name)
}
