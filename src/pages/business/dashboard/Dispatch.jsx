import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Check,
  MapPin,
  RefreshCw,
  Route,
  Truck,
  X,
} from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import Select from '../../../components/ui/Select'
import usePolling from '../../../hooks/usePolling'
import useBusy from '../../../hooks/useBusy'
import {
  assignDispatchBatch,
  createDispatchBatches,
  discontinueDispatchBatch,
  getDispatchWorkspace,
  saveDispatchSequence,
} from '../../../lib/api'
import Pagination from '../../../components/ui/Pagination'

const READY_PAGE_SIZE = 10
const BATCH_TASKS_COLLAPSED = 6

const STATS = [
  {
    key: 'ready', label: 'Ready to batch', icon: MapPin,
    chip: 'bg-[var(--color-route-cyan)]/10 text-[var(--color-route-cyan)]',
    context: () => <span className="text-xs text-[var(--color-paper-faint)]">parcels staged</span>,
  },
  {
    key: 'riders', label: 'Available riders', icon: Truck,
    chip: 'bg-[var(--color-emerald)]/10 text-[var(--color-mint)]',
    context: () => <span className="text-xs font-medium text-[var(--color-mint)]">Ready on shift</span>,
  },
  {
    key: 'batches', label: 'Open batches', icon: Route,
    chip: 'bg-purple-500/10 text-purple-400',
    context: (value) => (
      <span className={`text-xs font-medium ${value > 0 ? 'text-amber-400/90' : 'text-[var(--color-paper-faint)]'}`}>
        {value > 0 ? `${value} in staging / draft` : 'none in staging'}
      </span>
    ),
  },
]

function Stat({ label, value, icon: Icon, chip, context }) {
  return (
    <div className="dashboard-panel rounded-xl border-[var(--color-border-subtle)] p-5 transition-colors hover:border-[var(--color-paper-faint)]">
      <div className="flex items-center justify-between text-[var(--color-paper-faint)]">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${chip}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums text-[var(--color-paper)]">{value}</span>
        {context}
      </p>
    </div>
  )
}

export default function Dispatch() {
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [riders, setRiders] = useState({})
  const [confirming, setConfirming] = useState('')
  const [discontinuing, setDiscontinuing] = useState('')
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [busy, withBusy] = useBusy()
  const [error, setError] = useState('')
  const [readyPage, setReadyPage] = useState(1)
  const [expandedBatches, setExpandedBatches] = useState(new Set())

  const load = async () => {
    setError('')
    try {
      const next = await getDispatchWorkspace()
      setData(next)
      // Drop selections for orders that left the ready pool (built, assigned or
      // consumed elsewhere) so "Review N selected" never counts ghosts.
      const readyIds = new Set(next.orders.map((order) => order.id))
      setSelected((current) => {
        const filtered = [...current].filter((id) => readyIds.has(id))
        return filtered.length === current.size ? current : new Set(filtered)
      })
    } catch (err) {
      setError(err.message)
    }
  }

  usePolling(load, { interval: 5_000 })

  const modalOpen = dispatchOpen || Boolean(discontinuing)
  useEffect(() => {
    if (!modalOpen) return undefined
    const requestInFlight =
      busy.startsWith('assign-') ||
      busy.startsWith('cancel-') ||
      busy.startsWith('batches')
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape' || requestInFlight) return
      setConfirming('')
      setDiscontinuing('')
      setDispatchOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [modalOpen, busy])

  const availableDrivers = useMemo(
    () => data?.drivers.filter((driver) => driver.available) || [],
    [data],
  )
  const batches = data?.batches || []
  const openBatches = batches.filter((batch) => batch.status !== 'dispatched')
  const declined = batches.filter(
    (batch) => batch.status === 'dispatched' && batch.assignmentStatus === 'rejected',
  )

  const run = (key, action) =>
    withBusy(key, async () => {
      setError('')
      try {
        const next = await action()
        setData(next)
        setConfirming('')
        return next
      } catch (err) {
        setError(err.message)
        return undefined
      }
    })

  const buildAndOpen = () =>
    run('batches', async () => {
      const next = await createDispatchBatches([...selected])
      setSelected(new Set())
      setDispatchOpen(true)
      return next
    })

  const moveTask = (batch, index, direction) => {
    const target = index + direction
    if (target < 0 || target >= batch.tasks.length) return
    const taskIds = batch.tasks.map((task) => task.taskId)
    ;[taskIds[index], taskIds[target]] = [taskIds[target], taskIds[index]]
    run(`sequence-${batch.id}`, () => saveDispatchSequence(batch.id, taskIds))
  }

  const readyOrders = data?.orders || []
  const readyTotalPages = Math.max(1, Math.ceil(readyOrders.length / READY_PAGE_SIZE))
  const safeReadyPage = Math.min(readyPage, readyTotalPages)
  const pageReadyOrders = readyOrders.slice(
    (safeReadyPage - 1) * READY_PAGE_SIZE,
    safeReadyPage * READY_PAGE_SIZE,
  )
  const pageAllSelected =
    pageReadyOrders.length > 0 && pageReadyOrders.every((order) => selected.has(order.id))
  const togglePageSelection = () => {
    const pageIds = pageReadyOrders.map((order) => order.id)
    const next = new Set(selected)
    pageIds.forEach((id) => (pageAllSelected ? next.delete(id) : next.add(id)))
    setSelected(next)
  }
  const toggleBatchTasks = (batchId) =>
    setExpandedBatches((current) => {
      const next = new Set(current)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })

  if (!data && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  const statValues = {
    ready: readyOrders.length,
    riders: availableDrivers.length,
    batches: openBatches.length,
  }

  const unassigned = batches.filter((batch) => batch.status !== 'dispatched')

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-7 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-dispatch-orange)]">
            <span>Dispatch control</span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-dispatch-orange)]/60" />
            <span className="font-normal text-[var(--color-paper-faint)]">Active session</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-paper)] sm:text-3xl">
            Assign deliveries
          </h1>
          <p className="mt-1 text-sm text-[var(--color-paper-dim)]">
            Select ready deliveries, then group them by zone and confirm a rider in the dispatch workspace.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCw size={14} className="active:rotate-180" /> Refresh
        </Button>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map(({ key, label, icon, chip, context }) => (
          <Stat key={key} label={label} value={statValues[key]} icon={icon} chip={chip} context={context(statValues[key])} />
        ))}
      </section>

      <section className="dashboard-panel rounded-xl border-[var(--color-border-subtle)] p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">Ready deliveries</h2>
            <p className="mt-0.5 text-xs text-[var(--color-paper-dim)]">
              Selected deliveries are grouped into zone batches inside the dispatch workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {pageReadyOrders.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--color-paper-dim)]">
                <input
                  type="checkbox"
                  checked={pageAllSelected}
                  onChange={togglePageSelection}
                  className="h-4 w-4 accent-[var(--color-dispatch-orange)]"
                />
                Select page ({pageReadyOrders.length})
              </label>
            )}
            {unassigned.length > 0 && (
              <Button variant="secondary" onClick={() => setDispatchOpen(true)}>
                Continue dispatch ({unassigned.length})
              </Button>
            )}
            <button
              type="button"
              disabled={!selected.size || busy === 'batches'}
              onClick={buildAndOpen}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                selected.size && busy !== 'batches'
                  ? 'bg-[var(--color-dispatch-orange)] text-white hover:bg-[var(--color-dispatch-orange-bright)]'
                  : 'cursor-not-allowed border border-[var(--color-dispatch-orange)]/30 bg-[var(--color-dispatch-orange)]/20 text-[var(--color-dispatch-orange)]/60 opacity-70'
              }`}
            >
              {busy === 'batches' && <Loader size={14} />}
              Review {selected.size} selected
            </button>
          </div>
        </div>

        {!readyOrders.length ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)]/50 px-4 py-10 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--soft-fill)] text-[var(--color-paper-faint)]">
              <MapPin size={18} />
            </span>
            <p className="mt-3 text-sm font-medium text-[var(--color-paper-dim)]">
              No normal deliveries are ready for batching.
            </p>
            <span className="mt-1 text-xs text-[var(--color-paper-faint)]">
              New orders will automatically appear here once packaged.
            </span>
          </div>
        ) : (
          <>
            <div className="mt-5 divide-y divide-[var(--color-border-subtle)]">
              {pageReadyOrders.map((order) => (
                <label key={order.id} className="flex cursor-pointer items-center gap-4 py-3.5 transition-colors hover:bg-[var(--soft-fill)]">
                  <input
                    type="checkbox"
                    checked={selected.has(order.id)}
                    onChange={() => {
                      const next = new Set(selected)
                      if (next.has(order.id)) next.delete(order.id)
                      else next.add(order.id)
                      setSelected(next)
                    }}
                    className="h-4 w-4 accent-[var(--color-dispatch-orange)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-paper)]">{order.recipientName}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-paper-faint)]">
                      <span className="font-mono">{order.trackingId}</span>
                      <span className="mx-1.5 text-[var(--color-paper-faint)]">•</span>
                      {order.dropoffNeighborhood}
                    </p>
                  </div>
                  <Badge tone="neutral">{order.zoneCode.replace('_', ' / ')}</Badge>
                </label>
              ))}
            </div>
            <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4">
              <Pagination
                page={safeReadyPage}
                pageSize={READY_PAGE_SIZE}
                total={readyOrders.length}
                onPageChange={setReadyPage}
              />
            </div>
          </>
        )}
      </section>

      {dispatchOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => { if (!busy.startsWith('assign-')) setDispatchOpen(false) }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dispatch-workspace-title"
            tabIndex={-1}
            className="dashboard-panel flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-[var(--color-border-subtle)] shadow-2xl outline-none"
            onClick={(event) => event.stopPropagation()}
            ref={(node) => node?.focus()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] p-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-dispatch-orange)]">
                  Dispatch workspace
                </p>
                <h2 id="dispatch-workspace-title" className="mt-1 text-lg font-bold text-[var(--color-paper)]">
                  Assign batches to riders
                </h2>
                <p className="mt-1 text-xs text-[var(--color-paper-dim)]">
                  {unassigned.length
                    ? `${unassigned.length} ${unassigned.length === 1 ? 'batch' : 'batches'} awaiting a rider · ${unassigned.reduce((sum, batch) => sum + batch.tasks.length, 0)} stops total`
                    : 'Every batch has a rider.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOpen(false)}
                aria-label="Close dispatch workspace"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-paper-dim)] hover:bg-[var(--soft-fill)] hover:text-[var(--color-paper)]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {declined.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-[var(--color-dispatch-orange)]/30 bg-[var(--color-dispatch-orange)]/10 p-3">
                  <Bell size={15} className="mt-0.5 shrink-0 text-[var(--color-dispatch-orange)]" />
                  <p className="text-xs leading-5 text-[var(--color-paper-dim)]">
                    {declined.length === 1 ? 'A rider declined a batch' : `${declined.length} riders declined batches`} —
                    Stops were returned to the ready pool. Rebuild them from the deliveries list.
                  </p>
                </div>
              )}

              {!unassigned.length ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)]/50 px-4 py-12 text-center">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--soft-fill)] text-[var(--color-mint)]">
                    <Check size={18} />
                  </span>
                  <p className="mt-3 text-sm font-medium text-[var(--color-paper-dim)]">
                    All batches are assigned.
                  </p>
                </div>
              ) : (
                unassigned.map((batch) => {
                  const chosenRider = riders[batch.id] || ''
                  const chosenDriver = availableDrivers.find((driver) => driver.id === chosenRider)
                  const capacityOkay = Boolean(chosenDriver) && chosenDriver.capacity >= batch.tasks.length
                  const expanded = expandedBatches.has(batch.id)
                  const visibleTasks = expanded
                    ? batch.tasks
                    : batch.tasks.slice(0, BATCH_TASKS_COLLAPSED)
                  const hasCapableDriver = availableDrivers.some(
                    (driver) => driver.capacity >= batch.tasks.length,
                  )
                  return (
                    <article key={batch.id} className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
                      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                            {batch.zoneCode.replace('_', ' / ')}
                          </span>
                          <span className="text-sm font-semibold text-[var(--color-paper)]">
                            {batch.tasks.length} {batch.tasks.length === 1 ? 'stop' : 'stops'}
                          </span>
                          <StatusPill tone="neutral" label={batch.status.toUpperCase()} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setDiscontinuing(batch.id)}
                          className="text-xs font-medium text-[var(--color-paper-faint)] hover:text-[var(--color-dispatch-orange)]"
                        >
                          Disband
                        </button>
                      </div>

                      <ol className="mt-3 space-y-2">
                        {visibleTasks.map((task, index) => (
                          <li
                            key={task.taskId}
                            className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] p-3"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--soft-fill)] text-xs font-bold text-[var(--color-paper-dim)]">
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--color-paper)]">{task.recipientName}</p>
                                <p className="mt-0.5 truncate text-xs text-[var(--color-paper-dim)]">
                                  {task.dropoffNeighborhood}
                                  <span className="mx-1 text-[var(--color-paper-faint)]">•</span>
                                  <span className="font-mono">{task.trackingId}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 text-[var(--color-paper-faint)]">
                              <button
                                type="button"
                                aria-label={`Move ${task.trackingId} up`}
                                disabled={index === 0 || busy === `sequence-${batch.id}`}
                                onClick={() => moveTask(batch, index, -1)}
                                className="p-0.5 transition-colors hover:text-[var(--color-paper)] disabled:opacity-25"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Move ${task.trackingId} down`}
                                disabled={index >= visibleTasks.length - 1 || busy === `sequence-${batch.id}`}
                                onClick={() => moveTask(batch, index, 1)}
                                className="p-0.5 transition-colors hover:text-[var(--color-paper)] disabled:opacity-25"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ol>
                      {batch.tasks.length > BATCH_TASKS_COLLAPSED && (
                        <button
                          type="button"
                          onClick={() => toggleBatchTasks(batch.id)}
                          className="mt-2 text-xs font-medium text-[var(--color-dispatch-orange)] hover:underline"
                        >
                          {expanded ? 'Show fewer stops' : `Show all ${batch.tasks.length} stops`}
                        </button>
                      )}

                      <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4">
                        <label className="mb-1.5 block text-xs font-medium text-[var(--color-paper-dim)]" htmlFor={`rider-${batch.id}`}>
                          Assign active rider
                        </label>
                        <Select
                          id={`rider-${batch.id}`}
                          value={chosenRider}
                          onChange={(event) => {
                            setRiders({ ...riders, [batch.id]: event.target.value })
                            setConfirming('')
                          }}
                        >
                          <option value="">Choose an available rider</option>
                          {availableDrivers.map((driver) => (
                            <option key={driver.id} value={driver.id} disabled={driver.capacity < batch.tasks.length}>
                              {driver.displayName} • capacity {driver.capacity} {driver.capacity === 1 ? 'stop' : 'stops'}
                            </option>
                          ))}
                        </Select>
                        {!hasCapableDriver ? (
                          <p className="mt-2 text-xs leading-5 text-[var(--color-dispatch-orange)]">
                            No available rider has capacity for {batch.tasks.length} stops. Raise a rider&apos;s
                            capacity on the Drivers page, or disband this batch and select fewer deliveries.
                          </p>
                        ) : !chosenDriver ? (
                          <p className="mt-2 text-xs text-[var(--color-paper-faint)]">
                            Select a rider above to confirm the assignment.
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-[var(--color-paper-faint)]">
                            Batch: <span className="font-medium text-[var(--color-paper-dim)]">{batch.tasks.length} {batch.tasks.length === 1 ? 'stop' : 'stops'}</span>
                            <span className="mx-2">•</span>
                            Rider limit: <span className="font-medium text-[var(--color-paper-dim)]">{chosenDriver.capacity} {chosenDriver.capacity === 1 ? 'stop' : 'stops'}</span>
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {confirming === batch.id ? (
                            <>
                              <Button
                                disabled={!capacityOkay || busy === `assign-${batch.id}`}
                                onClick={() => run(`assign-${batch.id}`, () => assignDispatchBatch(batch.id, chosenRider))}
                              >
                                {busy === `assign-${batch.id}` ? <Loader size={14} /> : 'Confirm dispatch'}
                              </Button>
                              <Button variant="ghost" onClick={() => setConfirming('')} disabled={busy === `assign-${batch.id}`}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="secondary"
                              disabled={!capacityOkay}
                              title={!capacityOkay ? 'Choose a rider with enough capacity first' : undefined}
                              onClick={() => setConfirming(batch.id)}
                            >
                              Dispatch to {chosenDriver?.displayName ?? 'rider'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {discontinuing && (() => {
        const batch = batches.find((item) => item.id === discontinuing)
        if (!batch) return null
        const cancelBusy = busy === `cancel-${batch.id}`
        return (
          <div
            role="presentation"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => { if (!cancelBusy) setDiscontinuing('') }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="discontinue-batch-title"
              tabIndex={-1}
              className="dashboard-panel w-full max-w-md rounded-2xl border-[var(--color-border-subtle)] p-5 shadow-2xl outline-none"
              onClick={(event) => event.stopPropagation()}
              ref={(node) => node?.focus()}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 id="discontinue-batch-title" className="text-lg font-bold text-[var(--color-paper)]">
                  Disband this batch?
                </h2>
                <button
                  type="button"
                  onClick={() => setDiscontinuing('')}
                  disabled={cancelBusy}
                  aria-label="Close"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-paper-dim)] hover:bg-[var(--soft-fill)] hover:text-[var(--color-paper)] disabled:opacity-50"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-paper-dim)]">
                {batch.tasks.length} {batch.tasks.length === 1 ? 'delivery' : 'deliveries'} will return
                to the ready pool for rebatching.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setDiscontinuing('')} disabled={cancelBusy}>
                  Keep batch
                </Button>
                <Button
                  disabled={cancelBusy}
                  onClick={() =>
                    run(`cancel-${batch.id}`, async () => {
                      const next = await discontinueDispatchBatch(batch.id)
                      setDiscontinuing('')
                      return next
                    })
                  }
                >
                  {cancelBusy ? <Loader size={14} /> : 'Disband batch'}
                </Button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

const PILL_TONES = {
  emerald: 'border-[var(--color-emerald)]/30 bg-[var(--color-emerald)]/10 text-[var(--color-mint)]',
  orange: 'border-[var(--color-dispatch-orange)]/30 bg-[var(--color-dispatch-orange)]/10 text-[var(--color-dispatch-orange)]',
  neutral: 'border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] text-[var(--color-paper-dim)]',
}

const PILL_DOTS = {
  emerald: 'bg-[var(--color-mint)]',
  orange: 'bg-[var(--color-dispatch-orange)]',
  neutral: 'bg-[var(--color-paper-faint)]',
}

function StatusPill({ tone = 'neutral', label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PILL_TONES[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${PILL_DOTS[tone]}`} />
      {label}
    </span>
  )
}
