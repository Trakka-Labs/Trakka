import { useCallback, useEffect, useState } from 'react'

export function useCountdown(initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) return undefined
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  const reset = useCallback((seconds = initialSeconds) => setSecondsLeft(seconds), [initialSeconds])

  return { secondsLeft, isActive: secondsLeft > 0, reset }
}
