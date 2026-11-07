import { useCallback, useState } from 'react'

/**
 * Tracks "one keyed thing is busy at a time" — the `busy === key` /
 * `run(key, action)` pattern the pages already use, extracted so pages adopt
 * it without rewriting their JSX.
 *
 *   const [busy, run] = useBusy()
 *   run(`assign-${batch.id}`, () => assignDispatchBatch(...))
 *   ...
 *   disabled={busy === `assign-${batch.id}`}
 *
 * `run` sets `busy` to the key while `action()` is in flight, clears it in a
 * `finally`, and resolves with the action's result (errors propagate) so
 * callers keep their existing success/error handling.
 */
export default function useBusy(initialKey = '') {
  const [busy, setBusy] = useState(initialKey)
  const run = useCallback(async (key, action) => {
    setBusy(key)
    try {
      return await action()
    } finally {
      setBusy('')
    }
  }, [])
  return [busy, run, setBusy]
}
