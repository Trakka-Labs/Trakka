import { useEffect, useState } from 'react'
import { Bike, Check, Gauge, Phone, RefreshCw, UserPlus } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Loader from '../../../components/ui/Loader'
import Pagination from '../../../components/ui/Pagination'
import useBusy from '../../../hooks/useBusy'
import {
  createDriver,
  getDrivers,
  setDriverStatus,
  updateDriver,
  updateDriverCapacity,
} from '../../../lib/api'

// No prefilled digits: a fixed default ("10") used to sit in the capacity
// input, so typing 12 produced 1012 — an invisible overflow past the 3-digit
// cap and the backend's max(100). Empty start + placeholder instead.
const EMPTY_DRIVER = { displayName: '', phone: '', capacity: '' }

export default function Drivers() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [drivers, setDrivers] = useState(null)
  const [total, setTotal] = useState(0)
  const [busyPage, setBusyPage] = useState(false)
  const [form, setForm] = useState(EMPTY_DRIVER)
  const [capacityDrafts, setCapacityDrafts] = useState({})
  const [editing, setEditing] = useState('')
  const [editForm, setEditForm] = useState({ displayName: '', phone: '' })
  const [busy, withBusy] = useBusy()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async (targetPage = page) => {
    setError('')
    setBusyPage(true)
    try {
      const result = await getDrivers({ page: targetPage, pageSize })
      setDrivers(result.drivers)
      setTotal(result.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyPage(false)
    }
  }

  useEffect(() => {
    load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const run = (key, action, successMessage) =>
    withBusy(key, async () => {
      setError('')
      setNotice('')
      try {
        await action()
        // Reload the list (and totals) so newly onboarded drivers and
        // capacity changes are reflected immediately.
        await load()
        setNotice(successMessage)
        return true
      } catch (err) {
        setError(err.message)
        return false
      }
    })

  const onboard = async (event) => {
    event.preventDefault()
    const created = await run(
      'create',
      () => createDriver({ ...form, capacity: Number(form.capacity) }),
      `${form.displayName} was added to your driver team.`,
    )
    if (created) setForm(EMPTY_DRIVER)
  }

  const beginEdit = (driver) => {
    setEditing(driver.id)
    setEditForm({ displayName: driver.displayName, phone: driver.phone.replace(/^\+234/, '0') })
  }

  const saveEdit = (driver) => {
    const displayName = editForm.displayName.trim()
    const phone = editForm.phone.replace(/\D/g, '')
    if (displayName.length < 2) {
      setError('Driver name must be at least 2 characters.')
      return
    }
    if (phone.length < 10 || phone.length > 15) {
      setError('Phone must contain 10 to 15 digits.')
      return
    }
    run(
      `edit-${driver.id}`,
      () => updateDriver(driver.id, { displayName, phone }),
      `${displayName}'s details were updated.`,
    ).then((saved) => {
      if (saved) setEditing('')
    })
  }

  const toggleStatus = (driver) => {
    const next = driver.riderStatus === 'disabled' ? 'active' : 'disabled'
    run(
      `status-${driver.id}`,
      () => setDriverStatus(driver.id, next),
      next === 'active'
        ? `${driver.displayName} can receive dispatches again.`
        : `${driver.displayName} was disabled and will not receive dispatches.`,
    )
  }

  const saveCapacity = (driver) => {
    const capacity = Number(capacityDrafts[driver.id] ?? driver.capacity)
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
      setError('Driver capacity must be a whole number between 1 and 100.')
      return
    }
    run(
      `capacity-${driver.id}`,
      () => updateDriverCapacity(driver.id, capacity),
      `${driver.displayName}'s capacity was updated.`,
    )
  }

  if (!drivers && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  const available = drivers?.filter((driver) => driver.available).length || 0

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-dispatch-orange)]">
            Driver operations <span className="text-[var(--color-paper-faint)]">·</span>
            <span className="text-[var(--color-route-cyan)]">{total || drivers?.length || 0} on the team</span>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Drivers
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-[var(--color-paper-dim)]">
            Onboard riders and control how many deliveries each person can carry per route.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </header>

      {error && <Alert tone="error">{error}</Alert>}
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-[var(--color-emerald)]/30 bg-[var(--color-emerald)]/10 p-3 text-sm text-[var(--color-emerald)]">
          <Check size={15} /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ['Total drivers', total || drivers?.length || 0, Bike],
          ['Available now', available, Check],
          ['On active routes', (drivers?.length || 0) - available, Gauge],
        ].map(([label, value, Icon]) => (
          <div key={label} className="dashboard-panel rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-paper-faint)]">{label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--color-paper)]">{value}</p>
          </div>
        ))}
      </div>

      <section className="dashboard-panel rounded-xl p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
            <UserPlus size={17} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-paper)]">Onboard a driver</h2>
            <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Capacity is the maximum stops allowed in one assignment.</p>
          </div>
        </div>
        <form onSubmit={onboard} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]">
          <Input
            required
            minLength={2}
            maxLength={120}
            placeholder="Driver name"
            value={form.displayName}
            onChange={(event) => setForm({ ...form, displayName: event.target.value })}
          />
          <Input
            required
            integerOnly
            maxDigits={15}
            minLength={10}
            placeholder="Phone number"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <Input
            required
            integerOnly
            maxDigits={3}
            min={1}
            max={100}
            aria-label="Route capacity"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(event) => setForm({ ...form, capacity: event.target.value })}
          />
          <Button disabled={busy === 'create'}>
            {busy === 'create' ? <Loader size={16} /> : 'Add driver'}
          </Button>
        </form>
      </section>

      <section className="dashboard-panel overflow-hidden rounded-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] p-5 sm:p-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-paper)]">Driver team</h2>
            <p className="mt-1 text-xs text-[var(--color-paper-faint)]">
              {total > (drivers?.length || 0)
                ? `Showing page ${page} of drivers. Capacity changes apply to future dispatch assignments.`
                : 'Capacity changes apply to future dispatch assignments.'}
            </p>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
            <Bike size={16} />
          </span>
        </div>
        {!drivers?.length ? (
          <div className="p-10 text-center">
            <Bike className="mx-auto text-[var(--color-paper-faint)]" size={26} />
            <p className="mt-3 text-sm text-[var(--color-paper-dim)]">No drivers have been onboarded.</p>
          </div>
        ) : (
          <>
            <div
              aria-busy={busyPage}
              className={busyPage ? 'opacity-60 transition-opacity' : 'transition-opacity'}
            >
              <div className="divide-y divide-[var(--color-border-subtle)]">
            {drivers.map((driver) => (
              <article key={driver.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
                    <Bike size={17} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-[var(--color-paper)]">{driver.displayName}</h3>
                      <Badge
                        tone={
                          driver.riderStatus === 'disabled'
                            ? 'neutral'
                            : driver.available
                              ? 'emerald'
                              : 'orange'
                        }
                      >
                        {driver.riderStatus === 'disabled'
                          ? 'DISABLED'
                          : driver.available
                            ? 'AVAILABLE'
                            : 'ASSIGNED'}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-paper-faint)]">
                      <Phone size={12} /> {driver.phone}
                    </p>
                    {editing === driver.id && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                        <Input
                          aria-label="Driver name"
                          value={editForm.displayName}
                          onChange={(event) =>
                            setEditForm({ ...editForm, displayName: event.target.value })
                          }
                        />
                        <Input
                          aria-label="Driver phone"
                          integerOnly
                          maxDigits={15}
                          value={editForm.phone}
                          onChange={(event) =>
                            setEditForm({ ...editForm, phone: event.target.value })
                          }
                        />
                        <Button
                          size="sm"
                          disabled={busy === `edit-${driver.id}`}
                          onClick={() => saveEdit(driver)}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditing('')}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Gauge size={15} className="text-[var(--color-paper-faint)]" />
                  <span className="text-xs text-[var(--color-paper-dim)]">Route capacity</span>
                  <Input
                    integerOnly
                    maxDigits={3}
                    min={1}
                    max={100}
                    aria-label={`Capacity for ${driver.displayName}`}
                    className="w-20 py-2"
                    value={capacityDrafts[driver.id] ?? String(driver.capacity)}
                    onChange={(event) => setCapacityDrafts({
                      ...capacityDrafts,
                      [driver.id]: event.target.value,
                    })}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === `capacity-${driver.id}`}
                    onClick={() => saveCapacity(driver)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => beginEdit(driver)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === `status-${driver.id}`}
                    onClick={() => toggleStatus(driver)}
                  >
                    {driver.riderStatus === 'disabled' ? 'Reactivate' : 'Disable'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
            </div>
          <div className="border-t border-[var(--color-border-subtle)] p-4 sm:px-6">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
          </>
        )}
      </section>
    </div>
  )
}
