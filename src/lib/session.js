// Lightweight client-side session used only to carry the authenticated
// business's identity between the mocked auth flow and onboarding.
// This is not a real auth/session mechanism and will be replaced once
// a backend exists.

const STORAGE_KEY = 'trakka_business_session'

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage failures (e.g. private browsing) — session context
    // simply won't persist across a refresh in that case.
  }
}

export function updateSession(patch) {
  const next = { ...getSession(), ...patch }
  setSession(next)
  return next
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}
