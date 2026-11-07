import { useEffect, useRef, useState } from 'react'

/**
 * Interval polling that survives failures and background tabs.
 * - `interval` or `getInterval()` is measured between run completion and the
 *   next run, so a slow request never overlaps itself.
 * - Pauses while `document.hidden`; resumes on visibilitychange/focus. While
 *   hidden a run that already fired simply doesn't schedule the next one.
 * - A rejected `fn` never stops the loop; errors surface via `onError` so
 *   callers keep their existing error-display state.
 * - Fully cleared on unmount.
 */
export default function usePolling(fn, { interval = 5_000, getInterval, enabled = true, onError } = {}) {
  const [paused, setPaused] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  )

  // Latest-callback refs so the loop can update per tick without resetting it.
  const callbacksRef = useRef({ fn, getInterval, interval, onError })
  callbacksRef.current = { fn, getInterval, interval, onError }

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    let timer

    const delayMs = () => {
      const { getInterval: resolve, interval: ms } = callbacksRef.current
      return typeof resolve === 'function'
        ? resolve()
        : ms
    }

    const tick = async () => {
      timer = undefined
      if (cancelled || document.hidden) return
      const { fn: run, onError: handle } = callbacksRef.current
      try {
        await run()
        if (handle) handle(null)
      } catch (err) {
        if (handle) handle(err)
      }
      if (cancelled || document.hidden) return
      timer = window.setTimeout(tick, delayMs())
    }

    const onVisibility = () => {
      setPaused(document.hidden)
      // Resume: no timer is pending after a hidden-mode run skipped scheduling.
      if (!document.hidden && !timer) {
        timer = window.setTimeout(tick, 0)
      }
    }
    const onFocus = () => setPaused(false)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)

    if (!document.hidden) timer = window.setTimeout(tick, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
    }
  }, [enabled])

  return { paused, isPaused: () => paused }
}
