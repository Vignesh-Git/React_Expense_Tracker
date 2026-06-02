import { readJson, STORAGE_KEYS, writeJson } from './storage.js'

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function getUsers() {
  const users = readJson(STORAGE_KEYS.users, [])
  return Array.isArray(users) ? users : []
}

function saveUsers(users) {
  writeJson(STORAGE_KEYS.users, users)
}

export function getSession() {
  const session = readJson(STORAGE_KEYS.session, null)
  if (!session?.userId) return null

  const user = getUsers().find((entry) => entry.id === session.userId)
  if (!user) {
    writeJson(STORAGE_KEYS.session, null)
    return null
  }

  return {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  }
}

export function clearSession() {
  writeJson(STORAGE_KEYS.session, null)
}

function createSession(user) {
  const session = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  }
  writeJson(STORAGE_KEYS.session, session)
  return session
}

export async function signUp({ displayName, email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const users = getUsers()

  if (users.some((user) => user.email === normalizedEmail)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }

  const user = {
    id: crypto.randomUUID(),
    displayName: displayName.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  }

  saveUsers([...users, user])
  const session = createSession(user)

  return {
    ok: true,
    user: session,
  }
}

export async function signIn({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const users = getUsers()
  const user = users.find((entry) => entry.email === normalizedEmail)

  if (!user) {
    return { ok: false, error: 'No account found with this email.' }
  }

  const passwordHash = await hashPassword(password)
  if (user.passwordHash !== passwordHash) {
    return { ok: false, error: 'Incorrect password. Please try again.' }
  }

  const session = createSession(user)

  return {
    ok: true,
    user: session,
  }
}

export function signOut() {
  clearSession()
}
