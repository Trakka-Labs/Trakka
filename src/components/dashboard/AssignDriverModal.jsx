import { useEffect, useState } from 'react'
import { Bike, X } from 'lucide-react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Loader from '../ui/Loader'
import Select from '../ui/Select'
import { assignSingleDelivery, getDrivers } from '../../lib/api'

/**
 * Assign one delivery straight to a rider from the dashboard's delivery-flow
 * card — no trip to the dispatch page. Loads only available riders.
 */
export default function AssignDriverModal({ delivery, onClose, onAssigned }) {
  const [drivers, setDrivers] = useState(null)
  const [riderId, setRiderId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getDrivers({ page: 1, pageSize: 100 })
      .then((result) => {
        if (cancelled) return
        setDrivers((result.drivers || []).filter((driver) => driver.available))
      })
      .catch((err) => {
        if (cancelled) return
        setDrivers([])
        setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [busy, onClose])

  const submit = async () => {
    if (!riderId) return
    setBusy(true)
    setError('')
    try {
      await assignSingleDelivery(delivery.orderId, riderId)
      onAssigned?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const selected = drivers?.find((driver) => driver.id === riderId)

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => { if (!busy) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-driver-title"
        tabIndex={-1}
        className="dashboard-panel w-full max-w-md rounded-2xl border-[var(--color-border-subtle)] p-5 shadow-2xl outline-none"
        onClick={(event) => event.stopPropagation()}
        ref={(node) => node?.focus()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-dispatch-orange)]">
              Direct assignment
            </p>
            <h2 id="assign-driver-title" className="mt-1 text-lg font-bold text-[var(--color-paper)]">
              Assign a driver
            </h2>
            <p className="mt-1 text-xs text-[var(--color-paper-dim)]">
              {delivery.id} · {delivery.receiver}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-paper-dim)] hover:bg-[var(--soft-fill)] hover:text-[var(--color-paper)] disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-5">
          {drivers === null ? (
            <div className="flex items-center justify-center py-6">
              <Loader size={22} />
            </div>
          ) : !drivers.length ? (
            <div className="rounded-lg border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)]/50 p-4 text-center">
              <Bike className="mx-auto text-[var(--color-paper-faint)]" size={20} />
              <p className="mt-2 text-xs text-[var(--color-paper-dim)]">
                No available riders right now. Free a rider or onboard one from the Drivers page.
              </p>
            </div>
          ) : (
            <>
              <label htmlFor="assign-driver-select" className="mb-1.5 block text-xs font-medium text-[var(--color-paper-dim)]">
                Available rider
              </label>
              <Select
                id="assign-driver-select"
                value={riderId}
                onChange={(event) => setRiderId(event.target.value)}
              >
                <option value="">Choose a rider</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.displayName} • capacity {driver.capacity} {driver.capacity === 1 ? 'stop' : 'stops'}
                  </option>
                ))}
              </Select>
              {selected && (
                <p className="mt-2 text-xs text-[var(--color-paper-faint)]">
                  A one-stop dispatch will be created and sent to{' '}
                  <span className="font-medium text-[var(--color-paper-dim)]">{selected.displayName}</span>.
                </p>
              )}
            </>
          )}
        </div>

        {error && <Alert tone="error" className="mt-4">{error}</Alert>}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            disabled={!riderId || busy || !drivers?.length}
            onClick={submit}
          >
            {busy ? <Loader size={14} /> : 'Assign driver'}
          </Button>
        </div>
      </div>
    </div>
  )
}
