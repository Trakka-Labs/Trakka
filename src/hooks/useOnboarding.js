import { useCallback, useEffect, useRef, useState } from 'react'
import { getOnboardingStatus, markOnboarding } from '../lib/api'

/**
 * First-run onboarding state for the signed-in business user.
 *
 * The status is derived server-side from real business data (profile, riders,
 * deliveries, routes, shared tracking), so the checklist can never drift from
 * reality. Only "tour seen" and "checklist dismissed" are stored flags.
 */
export default function useOnboarding() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const next = await getOnboardingStatus()
      if (mounted.current) {
        setStatus(next)
        setError('')
      }
      return next
    } catch (err) {
      if (mounted.current) setError(err.message)
      return null
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const mark = useCallback(
    async (action) => {
      // Update optimistically so the tour/checklist closes instantly.
      setStatus((current) => {
        if (!current) return current
        return action === 'tour'
          ? { ...current, tourSeen: true }
          : { ...current, checklistDismissed: true }
      })
      try {
        const next = await markOnboarding(action)
        if (mounted.current) setStatus(next)
      } catch {
        // If persisting fails the UI has already closed for this visit; the
        // tour may reappear on the next load, which is the safer failure mode.
      }
    },
    [],
  )

  return {
    status,
    error,
    ready: status !== null,
    refresh,
    markTourSeen: () => mark('tour'),
    dismissChecklist: () => mark('checklist'),
  }
}
