import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { ArrowUpRight, CheckCircle2, Clock3, Package, Truck } from 'lucide-react'
import OperationsFlow from '../../../components/dashboard/OperationsFlow'
import TodaysTrips from '../../../components/dashboard/TodaysTrips'
import RecentActivity from '../../../components/dashboard/RecentActivity'
import Loader from '../../../components/ui/Loader'
import Alert from '../../../components/ui/Alert'
import { getDashboard } from '../../../lib/api'
import { ROUTES } from '../../../lib/routes'

const METRIC_CONFIG = [
  { key: 'total', label: 'Total deliveries', icon: Package, tone: 'text-[var(--color-route-cyan)]' },
  { key: 'active', label: 'In transit', icon: Truck, tone: 'text-[var(--color-dispatch-orange)]' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, tone: 'text-[var(--color-emerald)]' },
  { key: 'pending', label: 'Pending pickup', icon: Clock3, tone: 'text-[var(--color-paper-faint)]' },
]

function MetricsRail({ metrics }) {
  return (
    <aside className="dashboard-panel overflow-hidden rounded-lg self-start">
      {METRIC_CONFIG.map(({ key, label, icon: Icon, tone }, index) => (
        <div
          key={key}
          className={`flex items-center gap-3 px-4 py-4 ${index ? 'border-t border-[var(--color-border-subtle)]' : ''}`}
        >
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--soft-fill)] ${tone}`}>
            <Icon size={16} />
          </span>
          <div>
            <p className="text-[10px] text-[var(--color-paper-faint)]">{label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--color-paper)]">{metrics[key]}</p>
          </div>
        </div>
      ))}
    </aside>
  )
}

function relativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return new Date(value).toLocaleDateString()
}

export default function DashboardOverview() {
  const { session } = useOutletContext()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

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
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">Operations overview</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            General statistics
          </h1>
          <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
            {session.companyName} has {metrics.active} active {metrics.active === 1 ? 'delivery' : 'deliveries'}.
          </p>
        </div>
        <Link
          to={ROUTES.businessCreateDelivery}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-[var(--color-paper)] px-4 py-2.5 text-xs font-medium text-[var(--color-ink)]"
        >
          Create delivery <ArrowUpRight size={14} />
        </Link>
      </header>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <MetricsRail metrics={metrics} />
        <OperationsFlow metrics={metrics} trips={trips} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-paper)]">Recent deliveries</h2>
          <TodaysTrips trips={trips} />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-paper)]">Recent activity</h2>
          <RecentActivity activity={activity} />
        </section>
      </div>
    </div>
  )
}
