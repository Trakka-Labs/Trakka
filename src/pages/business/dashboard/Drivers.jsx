import { useEffect, useState } from 'react'
import { Bike, Check, Gauge, Phone, RefreshCw, UserPlus } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Loader from '../../../components/ui/Loader'
import {
  createDriver,
  getDrivers,
  updateDriverCapacity,
} from '../../../lib/api'

const EMPTY_DRIVER = { displayName: '', phone: '', capacity: '10' }

export default function Drivers() {
  const [drivers, setDrivers] = useState(null)
  const [form, setForm] = useState(EMPTY_DRIVER)
  const [capacityDrafts, setCapacityDrafts] = useState({})
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setError('')
    try {
      const result = await getDrivers()
      setDrivers(result.drivers)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const run = async (key, action, successMessage) => {
    setBusy(key)
    setError('')
    setNotice('')
    try {
      const result = await action()
      setDrivers(result.drivers)
      setNotice(successMessage)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setBusy('')
    }
  }

  const onboard = async (event) => {
    event.preventDefault()
    const created = await run(
      'create',
      () => createDriver({ ...form, capacity: Number(form.capacity) }),
      `${form.displayName} was added to your driver team.`,
    )
    if (created) setForm(EMPTY_DRIVER)
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
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">Driver operations</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Drivers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-paper-dim)]">
            Onboard riders and control how many deliveries each person can carry per route.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </header>

      {error && <Alert tone="error">{error}</Alert>}
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-[var(--color-emerald)]/30 bg-[var(--color-emerald)]/10 p-3 text-sm text-[var(--color-emerald)]">
          <Check size={15} /> {notice}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Total drivers', drivers?.length || 0],
          ['Available now', available],
          ['On active routes', (drivers?.length || 0) - available],
        ].map(([label, value]) => (
          <div key={label} className="dashboard-panel rounded-lg p-4">
            <p className="text-xs text-[var(--color-paper-faint)]">{label}</p>
            <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--color-paper)]">{value}</p>
          </div>
        ))}
      </div>

      <section className="dashboard-panel rounded-lg p-5 sm:p-6">
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

      <section className="dashboard-panel overflow-hidden rounded-lg">
        <div className="border-b border-[var(--color-border-subtle)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-paper)]">Driver team</h2>
          <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Capacity changes apply to future dispatch assignments.</p>
        </div>
        {!drivers?.length ? (
          <div className="p-10 text-center">
            <Bike className="mx-auto text-[var(--color-paper-faint)]" size={26} />
            <p className="mt-3 text-sm text-[var(--color-paper-dim)]">No drivers have been onboarded.</p>
          </div>
        ) : (
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
                      <Badge tone={driver.available ? 'emerald' : 'orange'}>
                        {driver.available ? 'AVAILABLE' : 'ASSIGNED'}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-paper-faint)]">
                      <Phone size={12} /> {driver.phone}
                    </p>
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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
