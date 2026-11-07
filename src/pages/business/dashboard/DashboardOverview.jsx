import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router'
import { CheckCircle2, Clock3, Package, Truck } from 'lucide-react'
import OperationsFlow from '../../../components/dashboard/OperationsFlow'
import RecentActivity from '../../../components/dashboard/RecentActivity'
import Loader from '../../../components/ui/Loader'
import Alert from '../../../components/ui/Alert'
import { getDashboard } from '../../../lib/api'
import { relativeTime } from '../../../lib/formatDate'

const METRIC_CONFIG = [
  {
    key: 'total', label: 'Total deliveries', icon: Package,
    chip: 'bg-[var(--color-route-cyan)]/10 border-[var(--color-route-cyan)]/25 text-[var(--color-route-cyan)]',
    caption: 'Active records in current cycle',
  },
  {
    key: 'active', label: 'In transit', icon: Truck,
    chip: 'bg-[var(--color-dispatch-orange)]/10 border-[var(--color-dispatch-orange)]/25 text-[var(--color-dispatch-orange)]',
    live: true, caption: 'Live on the road right now',
  },
  {
    key: 'completed', label: 'Completed', icon: CheckCircle2,
    chip: 'bg-[var(--color-emerald)]/10 border-[var(--color-emerald)]/25 text-[var(--color-mint)]',
    caption: 'Drop-offs completed so far',
  },
  {
    key: 'pending', label: 'Pending pickup', icon: Clock3,
    chip: 'bg-[var(--color-dispatch-orange)]/10 border-[var(--color-dispatch-orange)]/25 text-[var(--color-dispatch-orange-bright)]',
    caption: 'Awaiting dispatch queues',
  },
]

function StatCards({ metrics }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {METRIC_CONFIG.map(({ key, label, icon: Icon, chip, live, caption }) => (
        <div
          key={key}
          className="dashboard-panel rounded-xl border-[var(--color-border-subtle)] p-5 transition-all duration-200 hover:border-[var(--color-paper-faint)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-paper-faint)]">{label}</span>
            <span className={`grid h-8 w-8 place-items-center rounded-lg border ${chip}`}>
              <Icon size={16} />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold tracking-tight tabular-nums text-[var(--color-paper)]">
              {metrics[key]}
            </span>
            {live && metrics[key] > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-dispatch-orange)]/25 bg-[var(--color-dispatch-orange)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-dispatch-orange)]">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[var(--color-dispatch-orange)]" />
                Active tracking
              </span>
            )}
            {key === 'pending' && metrics[key] === 0 && (
              <span className="text-[11px] font-medium text-[var(--color-paper-faint)]">All cleared</span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-[var(--color-paper-faint)]">{caption}</p>
        </div>
      ))}
    </section>
  )
}


export default function DashboardOverview() {
  const { session } = useOutletContext()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = () =>
    getDashboard()
      .then((result) => {
        setData(result)
        setError('')
      })
      .catch((err) => setError(err.message))

  useEffect(() => {
    let cancelled = false
    getDashboard()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activity = useMemo(
    () => data?.activity.map((item) => ({ ...item, time: relativeTime(item.createdAt) })) || [],
    [data],
  )
  if (!data && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  const metrics = data?.metrics || { total: 0, active: 0, completed: 0, pending: 0 }
  const trips = data?.trips || []

  return (
    <div>
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-dispatch-orange)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-dispatch-orange)]" />
            Operations overview
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-paper)] sm:text-3xl">
            General statistics
          </h1>
          <p className="mt-1 text-sm text-[var(--color-paper-dim)]">
            {session.companyName} currently has{' '}
            <span className="font-medium text-[var(--color-paper)]">
              {metrics.active} active {metrics.active === 1 ? 'delivery' : 'deliveries'}
            </span>{' '}
            moving across local dispatch zones.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="mr-1 text-xs font-medium text-[var(--color-paper-faint)]">Timeframe:</span>
          <button
            type="button"
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-paper)] shadow-xs"
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-[var(--color-paper-dim)] transition-colors hover:text-[var(--color-paper)]"
          >
            All time
          </button>
        </div>
      </header>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      <StatCards metrics={metrics} />

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <OperationsFlow
            metrics={metrics}
            trips={trips.slice(0, 2)}
            total={trips.length}
            onAssigned={load}
          />
        </div>
        <div className="xl:col-span-1">
          <section className="mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-paper)]">Recent activity</h2>
          </section>
          <RecentActivity activity={activity.slice(0, 2)} total={activity.length} />
        </div>
      </div>
    </div>
  )
}
