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
} from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import Select from '../../../components/ui/Select'
import {
  assignDispatchBatch,
  createDispatchBatches,
  getDispatchWorkspace,
  saveDispatchSequence,
} from '../../../lib/api'

function statusTone(status) {
  if (status === 'dispatched') return 'emerald'
  if (status === 'finalized') return 'cyan'
  return 'neutral'
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="dashboard-panel rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-paper-faint)]">{label}</span>
        <Icon size={16} className="text-[var(--color-route-cyan)]" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--color-paper)]">{value}</p>
    </div>
  )
}

export default function Dispatch() {
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [riders, setRiders] = useState({})
  const [confirming, setConfirming] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      setData(await getDispatchWorkspace())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
    const interval = window.setInterval(load, 15_000)
    return () => window.clearInterval(interval)
  }, [])

  const availableDrivers = useMemo(
    () => data?.drivers.filter((driver) => driver.available) || [],
    [data],
  )
  const openBatches = data?.batches.filter((batch) => batch.status !== 'dispatched') || []

  const run = async (key, action) => {
    setBusy(key)
    setError('')
    try {
      const next = await action()
      setData(next)
      setConfirming('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const buildBatches = () =>
    run('batches', async () => {
      const next = await createDispatchBatches([...selected])
      setSelected(new Set())
      return next
    })

  const moveTask = (batch, index, direction) => {
    const target = index + direction
    if (target < 0 || target >= batch.tasks.length) return
    const taskIds = batch.tasks.map((task) => task.taskId)
    ;[taskIds[index], taskIds[target]] = [taskIds[target], taskIds[index]]
    run(`sequence-${batch.id}`, () => saveDispatchSequence(batch.id, taskIds))
  }

  if (!data && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">Dispatch control</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Assign deliveries
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-paper-dim)]">
            Group ready deliveries by zone, set the stop order, and confirm a rider assignment.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      {data?.notifications?.map((notification) => (
        <div
          key={notification.id}
          role="status"
          className="flex items-start gap-3 rounded-lg border border-[var(--color-emerald)]/35 bg-[var(--color-emerald)]/10 p-4"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-emerald)]/15 text-[var(--color-emerald)]">
            <Bell size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--color-paper)]">{notification.title}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-paper-dim)]">{notification.message}</p>
          </div>
        </div>
      ))}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Ready to batch" value={data?.orders.length || 0} icon={MapPin} />
        <Stat label="Available riders" value={availableDrivers.length} icon={Truck} />
        <Stat label="Open batches" value={openBatches.length} icon={Route} />
      </div>

      <section className="dashboard-panel overflow-hidden rounded-lg">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--color-border-subtle)] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-paper)]">Ready deliveries</h2>
            <p className="mt-1 text-xs text-[var(--color-paper-faint)]">
              Selected deliveries are split into separate zone batches.
            </p>
          </div>
          <Button
            size="sm"
            disabled={!selected.size || busy === 'batches'}
            onClick={buildBatches}
          >
            {busy === 'batches' ? <Loader size={15} /> : `Build ${selected.size} selected`}
          </Button>
        </div>
        {!data?.orders.length ? (
          <p className="p-8 text-center text-sm text-[var(--color-paper-faint)]">
            No normal deliveries are ready for batching.
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {data.orders.map((order) => (
              <label key={order.id} className="flex cursor-pointer items-center gap-4 p-4 hover:bg-white/[0.02]">
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
                    {order.trackingId} · {order.dropoffNeighborhood}
                  </p>
                </div>
                <Badge tone="neutral">{order.zoneCode.replace('_', ' / ')}</Badge>
              </label>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-paper)]">Dispatch batches</h2>
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-paper-faint)]">
            <Bell size={13} /> Rider responses refresh automatically
          </span>
        </div>
        {!data?.batches.length ? (
          <div className="dashboard-panel rounded-lg p-8 text-center text-sm text-[var(--color-paper-faint)]">
            Select deliveries above to create the first batch.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.batches.map((batch) => {
              const chosenRider = riders[batch.id] || ''
              const chosenDriver = availableDrivers.find((driver) => driver.id === chosenRider)
              const capacityOkay = chosenDriver && chosenDriver.capacity >= batch.tasks.length
              const locked = batch.status === 'dispatched'
              return (
                <article key={batch.id} className="dashboard-panel rounded-lg p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-[var(--color-route-cyan)]">
                        {batch.zoneCode.replace('_', ' / ')}
                      </p>
                      <h3 className="mt-1 text-lg font-medium text-[var(--color-paper)]">
                        {batch.tasks.length} {batch.tasks.length === 1 ? 'stop' : 'stops'}
                      </h3>
                    </div>
                    <Badge tone={statusTone(batch.status)}>{batch.status.toUpperCase()}</Badge>
                  </div>

                  <ol className="my-4 space-y-2">
                    {batch.tasks.map((task, index) => (
                      <li key={task.taskId} className="flex items-center gap-3 rounded border border-[var(--color-border-subtle)] p-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--soft-fill)] font-mono text-xs text-[var(--color-paper)]">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[var(--color-paper)]">{task.recipientName}</p>
                          <p className="truncate text-[11px] text-[var(--color-paper-faint)]">{task.dropoffNeighborhood} · {task.trackingId}</p>
                          <p className="mt-1 truncate text-[11px] text-[var(--color-paper-dim)]">
                            Driver: <span className={batch.riderName ? 'font-medium text-[var(--color-paper)]' : 'text-[var(--color-paper-faint)]'}>
                              {batch.riderName || 'Unassigned'}
                            </span>
                          </p>
                        </div>
                        {!locked && (
                          <div className="flex">
                            <button
                              type="button"
                              aria-label={`Move ${task.trackingId} up`}
                              disabled={index === 0 || busy === `sequence-${batch.id}`}
                              onClick={() => moveTask(batch, index, -1)}
                              className="p-1.5 text-[var(--color-paper-faint)] disabled:opacity-25"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Move ${task.trackingId} down`}
                              disabled={index === batch.tasks.length - 1 || busy === `sequence-${batch.id}`}
                              onClick={() => moveTask(batch, index, 1)}
                              className="p-1.5 text-[var(--color-paper-faint)] disabled:opacity-25"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>

                  {locked ? (
                    <div className={`rounded border p-3 ${
                      batch.assignmentStatus === 'accepted'
                        ? 'border-[var(--color-emerald)]/30 bg-[var(--color-emerald)]/10'
                        : 'border-[var(--color-route-cyan)]/25 bg-[var(--soft-fill)]'
                    }`}>
                      <p className={`flex items-center gap-2 text-sm ${
                        batch.assignmentStatus === 'accepted'
                          ? 'text-[var(--color-mint)]'
                          : 'text-[var(--color-paper)]'
                      }`}>
                        <Check size={15} /> Assigned to {batch.riderName}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-paper-faint)]">
                        {batch.assignmentStatus === 'accepted'
                          ? 'Rider accepted this assignment.'
                          : 'Waiting for the rider to accept.'}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[var(--color-paper-faint)]">Route {batch.routeRunId}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Select
                        value={chosenRider}
                        onChange={(event) => {
                          setRiders({ ...riders, [batch.id]: event.target.value })
                          setConfirming('')
                        }}
                      >
                        <option value="">Choose an available rider</option>
                        {availableDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id} disabled={driver.capacity < batch.tasks.length}>
                            {driver.displayName} · capacity {driver.capacity}
                          </option>
                        ))}
                      </Select>
                      {chosenDriver && !capacityOkay && (
                        <p className="text-xs text-[var(--color-dispatch-orange)]">This batch exceeds the rider&apos;s capacity.</p>
                      )}
                      {confirming === batch.id ? (
                        <div className="flex items-center justify-between gap-3 rounded border border-[var(--color-dispatch-orange)]/30 bg-[var(--color-dispatch-orange)]/10 p-3">
                          <p className="text-xs text-[var(--color-paper-dim)]">
                            Confirm {batch.tasks.length} stops for {chosenDriver?.displayName}?
                          </p>
                          <Button
                            size="sm"
                            disabled={!capacityOkay || busy === `assign-${batch.id}`}
                            onClick={() => run(`assign-${batch.id}`, () => assignDispatchBatch(batch.id, chosenRider))}
                          >
                            Confirm
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          disabled={!capacityOkay}
                          onClick={() => setConfirming(batch.id)}
                        >
                          Review assignment
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
