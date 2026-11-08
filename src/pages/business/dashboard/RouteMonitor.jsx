import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Clock,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Route as RouteIcon,
  Truck,
} from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import RouteMap from '../../../components/dashboard/RouteMap'
import usePolling from '../../../hooks/usePolling'
import { getRouteRunMonitor } from '../../../lib/api'
import { humanDateTime, humanTime, relativeTime } from '../../../lib/formatDate'
import { ROUTES } from '../../../lib/routes'

const PHASE_META = {
  active: { label: 'Live', tone: 'orange' },
  awaiting_rider: { label: 'Awaiting rider', tone: 'cyan' },
  completed: { label: 'Completed', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

const TASK_META = {
  completed: { label: 'Completed', tone: 'emerald' },
  delivered: { label: 'Delivered', tone: 'emerald' },
  in_transit: { label: 'En route', tone: 'orange' },
  pickup_in_progress: { label: 'Picking up', tone: 'cyan' },
  failed: { label: 'Failed', tone: 'orange' },
  skipped: { label: 'Skipped', tone: 'neutral' },
  pending: { label: 'Scheduled', tone: 'neutral' },
}

const PAYMENT_LABELS = {
  sender_paid: 'Prepaid',
  receiver_online: 'Paid online',
  pay_on_delivery: 'Pay on delivery',
}

const SETTLED = new Set(['completed', 'delivered', 'failed', 'skipped'])

function shortId(id) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

function zoneLabel(zoneCode) {
  return zoneCode ? zoneCode.replaceAll('_', ' / ') : 'Unzoned'
}

function taskMeta(status) {
  return TASK_META[status] ?? { label: status.replaceAll('_', ' '), tone: 'neutral' }
}

function formatDistance(metres) {
  if (!Number.isFinite(metres) || metres <= 0) return 'Not recorded yet'
  if (metres < 1000) return `${Math.round(metres)} m driven`
  return `${(metres / 1000).toFixed(1)} km driven`
}

function durationWords(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null
  const seconds = Math.max(
    0,
    Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  )
  if (seconds < 60) return `${seconds}s at stop`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m at stop`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m at stop`
}

function StopTime({ stop }) {
  if (stop.completedAt) {
    return (
      <span>
        Completed {humanTime(stop.completedAt)}
        {stop.startedAt && stop.completedAt
          ? ` · ${durationWords(stop.startedAt, stop.completedAt)}`
          : ''}
      </span>
    )
  }
  if (stop.startedAt) {
    return <span>Started {humanTime(stop.startedAt)}</span>
  }
  if (stop.plannedArrivalAt) {
    const sameDay =
      new Date(stop.plannedArrivalAt).toDateString() === new Date().toDateString()
    return (
      <span>
        Expected {sameDay ? humanTime(stop.plannedArrivalAt) : humanDateTime(stop.plannedArrivalAt)}
      </span>
    )
  }
  return <span>Awaiting rider start</span>
}

/**
 * Live route monitor — the owner's view of a dispatched run: header facts,
 * stop-by-stop timeline, and the map with numbered pins, planned path and the
 * rider's latest position. Polls every 5s (30s once completed).
 */
export default function RouteMonitor() {
  const { routeRunId } = useParams()
  const [route, setRoute] = useState(null)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try {
      setRoute(await getRouteRunMonitor(routeRunId))
      setError('')
    } catch (err) {
      setError(err.message)
      if (/not found/i.test(err.message)) setNotFound(true)
    }
  }

  usePolling(load, {
    interval: 5_000,
    enabled: !notFound,
    getInterval: () => (route?.phase === 'completed' ? 30_000 : 5_000),
  })

  useEffect(() => {
    setRoute(null)
    setError('')
    setNotFound(false)
  }, [routeRunId])

  const mapStops = useMemo(
    () =>
      (route?.stops ?? []).map((stop) => ({
        ...stop,
        lat: stop.zoneLat,
        lng: stop.zoneLng,
      })),
    [route?.stops],
  )

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <Alert tone="error">{error}</Alert>
        <Link to={ROUTES.businessRoutes}>
          <Button variant="secondary" size="sm">
            <ArrowLeft size={14} /> Back to routes
          </Button>
        </Link>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader size={28} />
      </div>
    )
  }

  const phase = PHASE_META[route.phase] ?? { label: 'Route', tone: 'neutral' }
  const progress = route.stopCount
    ? Math.round((route.completedCount / route.stopCount) * 100)
    : 0

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-route-cyan)]">
            <Link
              to={ROUTES.businessRoutes}
              className="inline-flex items-center gap-1.5 text-[var(--color-paper-faint)] transition-colors hover:text-[var(--color-paper-dim)]"
            >
              <ArrowLeft size={12} /> Routes
            </Link>
            <span className="text-[var(--color-paper-faint)]">·</span>
            <span className="font-mono tracking-normal">{shortId(route.id)}</span>
          </div>
          <h1 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-bold tracking-tight text-[var(--color-paper)] sm:text-3xl">
            {route.riderName}
            <Badge tone={phase.tone}>{phase.label}</Badge>
          </h1>
          <p className="mt-1 text-sm text-[var(--color-paper-dim)]">
            {zoneLabel(route.zoneCode)} ·{' '}
            {route.phase === 'awaiting_rider' ? 'dispatched' : 'started'}{' '}
            {relativeTime(route.startedAt ?? route.createdAt)}
            {route.lastPosition ? ` · last ping ${relativeTime(route.lastPosition.capturedAt)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Link to={ROUTES.businessDispatch}>
            <Button variant="secondary" size="sm">
              <RouteIcon size={14} /> Dispatch
            </Button>
          </Link>
        </div>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="dashboard-panel rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                  Route
                </p>
                <p className="mt-0.5 font-mono text-lg font-semibold text-[var(--color-paper)]">
                  {shortId(route.id)}
                </p>
              </div>
              <Badge tone={phase.tone}>{phase.label}</Badge>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                  <Truck size={12} /> Rider
                </dt>
                <dd className="mt-1 font-medium text-[var(--color-paper)]">{route.riderName}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                  <Phone size={12} /> Contact
                </dt>
                <dd className="mt-1 font-mono text-xs text-[var(--color-paper-dim)]">
                  {route.riderPhone || '—'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                  <Navigation size={12} /> Distance driven
                </dt>
                <dd className="mt-1 text-[var(--color-paper-dim)]">
                  {formatDistance(route.distanceMetres)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                  <MapPin size={12} /> Zone
                </dt>
                <dd className="mt-1 text-[var(--color-paper-dim)]">{zoneLabel(route.zoneCode)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-[var(--color-paper-dim)]">
                <span>
                  {route.completedCount} of {route.stopCount} stops complete
                </span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-border-subtle)]/50">
                <span
                  className="block h-full rounded-full bg-[var(--color-emerald)] transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {route.delaySeconds > 0 && (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--color-dispatch-orange)]/10 px-3 py-2 text-xs text-[var(--color-dispatch-orange)]">
                <Clock size={13} />
                Rider reported {Math.round(route.delaySeconds / 60)} min of delays on this run.
              </p>
            )}
          </section>

          <section className="dashboard-panel rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-paper)]">Stops</h2>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                In route order
              </span>
            </div>

            <ol className="mt-4">
              {route.lastPosition && (
                <li className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--color-emerald)] bg-[var(--color-emerald)]/10 text-[var(--color-mint)]">
                      <Navigation size={13} />
                    </span>
                    <span className="w-px flex-1 bg-[var(--color-border-subtle)]" />
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-mint)]">
                      Current location
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-paper-faint)]">
                      Rider pinged {relativeTime(route.lastPosition.capturedAt)}
                    </p>
                  </div>
                </li>
              )}
              {route.stops.map((stop, index) => {
                const meta = taskMeta(stop.status)
                const settled = SETTLED.has(stop.status)
                return (
                  <li key={stop.routeTaskId} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full border font-mono text-[10px] font-semibold ${
                          settled
                            ? 'border-[var(--color-emerald)] bg-[var(--color-emerald)] text-white'
                            : stop.status === 'in_transit'
                              ? 'border-[var(--color-dispatch-orange)] bg-[var(--color-dispatch-orange)] text-white'
                              : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-paper-dim)]'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {index < route.stops.length - 1 && (
                        <span className="w-px flex-1 bg-[var(--color-border-subtle)]" />
                      )}
                    </div>
                    <div className={`min-w-0 flex-1 pb-5 ${index === route.stops.length - 1 ? 'pb-0' : ''}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                          {PAYMENT_LABELS[stop.paymentType] ?? stop.paymentType}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold text-[var(--color-paper)]">
                        {stop.recipientName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-paper-dim)]">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">
                          {stop.dropoffNeighborhood}
                          {stop.dropoffAddress && stop.dropoffAddress !== stop.dropoffNeighborhood
                            ? ` · ${stop.dropoffAddress}`
                            : ''}
                        </span>
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-[var(--color-paper-faint)]">
                        <Clock size={10} />
                        <StopTime stop={stop} />
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <section className="dashboard-panel relative min-h-[420px] overflow-hidden rounded-xl lg:min-h-[640px]">
          <RouteMap
            stops={mapStops}
            track={route.track}
            position={route.lastPosition}
          />
          <div className="pointer-events-none absolute right-3 top-3 z-[500] flex flex-wrap gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 px-3 py-2 text-[10px] shadow-sm backdrop-blur">
            <span className="flex items-center gap-1.5 text-[var(--color-paper-dim)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-emerald)]" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-[var(--color-paper-dim)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-dispatch-orange)]" /> En route
            </span>
            <span className="flex items-center gap-1.5 text-[var(--color-paper-dim)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-paper-dim)]" /> Scheduled
            </span>
          </div>
          <p className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-xs rounded bg-[var(--color-surface)]/90 px-2 py-1 text-[9px] text-[var(--color-paper-faint)] backdrop-blur">
            Stop pins are zone-level approximations until live stop geocoding is enabled.
          </p>
        </section>
      </div>
    </div>
  )
}
