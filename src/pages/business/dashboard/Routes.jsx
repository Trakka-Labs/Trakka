import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  Route as RouteIcon,
  Truck,
} from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/dashboard/EmptyState'
import Loader from '../../../components/ui/Loader'
import usePolling from '../../../hooks/usePolling'
import { getRouteRuns } from '../../../lib/api'
import { relativeTime } from '../../../lib/formatDate'
import { businessRouteRoute, ROUTES } from '../../../lib/routes'

const PHASE_META = {
  active: { label: 'In progress', tone: 'orange' },
  awaiting_rider: { label: 'Awaiting rider', tone: 'cyan' },
  completed: { label: 'Completed', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

const FILTERS = [
  { key: 'open', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
]

function shortId(id) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

function phaseMeta(phase) {
  return PHASE_META[phase] ?? { label: 'Route', tone: 'neutral' }
}

function zoneLabel(zoneCode) {
  return zoneCode ? zoneCode.replaceAll('_', ' / ') : 'Unzoned'
}

function RouteCard({ route }) {
  const meta = phaseMeta(route.phase)
  const progress = route.stopCount
    ? Math.round((route.completedCount / route.stopCount) * 100)
    : 0

  return (
    <Link
      to={businessRouteRoute(route.id)}
      className="dashboard-panel group block rounded-xl border-[var(--color-border-subtle)] p-5 transition-colors hover:border-[var(--color-route-cyan)]/50"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-[var(--color-paper-faint)]">
              {shortId(route.id)}
            </span>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
          <p className="mt-2 flex items-center gap-2 text-base font-semibold text-[var(--color-paper)]">
            <Truck size={16} className="text-[var(--color-paper-faint)]" />
            {route.riderName}
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-paper-dim)]">
            <MapPin size={13} />
            {zoneLabel(route.zoneCode)}
            <span className="text-[var(--color-paper-faint)]">•</span>
            <Clock size={13} />
            {route.phase === 'awaiting_rider' ? 'Dispatched' : 'Started'}{' '}
            {relativeTime(route.startedAt ?? route.createdAt)}
          </p>
        </div>
        <ChevronRight
          size={18}
          className="mt-1 shrink-0 text-[var(--color-paper-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-route-cyan)]"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border-subtle)]/50">
          <span
            className="block h-full rounded-full bg-[var(--color-emerald)] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-[var(--color-paper-dim)]">
          {route.completedCount}/{route.stopCount} stops
        </span>
        <span className="shrink-0 text-[10px] text-[var(--color-paper-faint)]">
          {route.lastActivityAt ? relativeTime(route.lastActivityAt) : 'No activity yet'}
        </span>
      </div>
    </Link>
  )
}

/**
 * Separate live-operations page reachable from Dispatch. Lists route runs
 * (active first) and links into the route monitor with its map + stop timeline.
 */
export default function Routes() {
  const [routes, setRoutes] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('open')

  const load = async () => {
    try {
      setRoutes(await getRouteRuns())
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  usePolling(load, { interval: 5_000 })

  const visible = useMemo(() => {
    const list = routes ?? []
    if (filter === 'completed') return list.filter((route) => route.phase === 'completed')
    if (filter === 'open') {
      return list.filter(
        (route) => route.phase === 'active' || route.phase === 'awaiting_rider',
      )
    }
    return list
  }, [routes, filter])

  const active = (routes ?? []).filter(
    (route) => route.phase === 'active' || route.phase === 'awaiting_rider',
  )
  const parcelsOnRoad = active.reduce((sum, route) => sum + route.stopCount, 0)
  const completedStops = (routes ?? []).reduce(
    (sum, route) => sum + route.completedCount,
    0,
  )

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (!routes && !error) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-route-cyan)]">
            Live operations <span className="text-[var(--color-paper-faint)]">·</span>
            <span className="text-[var(--color-dispatch-orange)]">
              {active.length} {active.length === 1 ? 'route' : 'routes'} on the road
            </span>
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-paper)] sm:text-3xl">
            Routes in progress
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-paper-dim)]">
            Follow every dispatched run, its rider position and stop-by-stop progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.businessDispatch}>
            <Button variant="secondary" size="sm">
              <ArrowLeft size={14} /> Back to dispatch
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="dashboard-panel rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-paper-faint)]">
            Active routes
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--color-paper)]">
            {active.length}
          </p>
          <p className="mt-1 text-xs text-[var(--color-paper-dim)]">
            {parcelsOnRoad} {parcelsOnRoad === 1 ? 'parcel' : 'parcels'} on the road
          </p>
        </div>
        <div className="dashboard-panel rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-paper-faint)]">
            Stops completed
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--color-paper)]">
            {completedStops}
          </p>
          <p className="mt-1 text-xs text-[var(--color-paper-dim)]">Across recent runs</p>
        </div>
        <div className="dashboard-panel rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-paper-faint)]">
            Route runs
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--color-paper)]">
            {(routes ?? []).length}
          </p>
          <p className="mt-1 text-xs text-[var(--color-paper-dim)]">Last 100 dispatched</p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === item.key
                ? 'border-[var(--color-route-cyan)]/50 bg-[var(--color-route-cyan)]/10 text-[var(--color-route-cyan)]'
                : 'border-[var(--color-border-subtle)] text-[var(--color-paper-dim)] hover:border-[var(--color-paper-faint)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!visible.length ? (
        <EmptyState
          icon={RouteIcon}
          title={
            filter === 'completed' ? 'No completed routes yet' : 'No routes on the road'
          }
          description={
            filter === 'completed'
              ? 'Completed runs will appear here after the last stop is delivered.'
              : 'Assign a batch in Dispatch and the rider’s run will show up here in real time.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visible.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  )
}
