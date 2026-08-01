import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'trakka-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved

  return 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const syncTheme = (event) => setTheme(event.detail)
    window.addEventListener('trakka-theme-change', syncTheme)
    return () => window.removeEventListener('trakka-theme-change', syncTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.dataset.theme || 'light'
    const next = current === 'dark' ? 'light' : 'dark'
    setTheme(next)
    window.dispatchEvent(new CustomEvent('trakka-theme-change', { detail: next }))
  }, [])

  return { theme, setTheme, toggleTheme }
}
