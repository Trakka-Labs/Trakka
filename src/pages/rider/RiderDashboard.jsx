import { useCallback, useEffect, useState } from 'react'
import { Bike, Check, ChevronRight, Clock3, MapPin, MessageSquareText, Navigation, PackageCheck, RotateCw } from 'lucide-react'
import { Link } from 'react-router'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Logo from '../../components/ui/Logo'
import { acceptRiderAssignment, declineRiderAssignment, getRiderRoute } from '../../lib/api'
import { riderRouteMessagesRoute } from '../../lib/routes'
import { ASSIGNMENT_STATUSES, ROUTE_RUN_STATUSES } from '../../lib/statuses'

const STATUS_LABELS = {
  pending: 'Awaiting your response',
  accepted: 'Assignment accepted',
  active: 'Route in progress',
  paused: 'Route paused',
  completed: 'Route complete',
  cancelled: 'Route cancelled',
  rejected: 'Assignment declined',
}

// In-flight/terminal run states that imply the assignment was accepted (or the
// route moved past it) even when the backend omits route.assignment entirely.
const RUN_IMPLIED_STATUSES = ['active', 'paused', 'completed', 'cancelled']

function getRouteLink() {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const routeRunId = params.get('route') || ''
  const token = params.get('access') || (routeRunId
    ? sessionStorage.getItem(`trakka-rider-route-access:${routeRunId}`)
    : '') || ''

  if (routeRunId && token) sessionStorage.setItem(`trakka-rider-route-access:${routeRunId}`, token)
  if (window.location.hash) {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
  }
  return { routeRunId, token }
}

function StopStatus({ status }) {
  const complete = status === 'delivered'
  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${
      complete
        ? 'bg-[var(--color-emerald)]/15 text-[var(--color-mint)]'
        : 'bg-white/[0.07] text-[var(--color-paper-dim)]'
    }`}>
      {complete ? <Check size={13} /> : <Clock3 size={13} />}
      {status.replaceAll('_', ' ')}
    </span>
  )
}

export default function RiderDashboard() {
  const [link] = useState(getRouteLink)
  const { routeRunId, token } = link
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    if (!routeRunId || !token) return
    setError('')
    try {
      setData(await getRiderRoute(routeRunId, token))
    } catch (err) {
      setError(err.message)
    }
  }, [routeRunId, token])

  useEffect(() => { load() }, [load])

  const respond = async (decision) => {
    setBusy(decision)
    setError('')
    try {
      if (decision === 'accept') await acceptRiderAssignment(routeRunId, token)
      else await declineRiderAssignment(routeRunId, token)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const stops = data?.stops ?? []
  const nextStops = stops.filter((stop) => stop.status !== 'delivered').slice(0, 3)
  const route = data?.route
  // Fail-closed: never invent 'pending' when the backend field is missing —
  // a renamed field would otherwise show Accept/Decline buttons forever.
  const savedAssignmentStatus = route?.assignment?.status
  const runStatus = route?.routeStatus
  const assignmentStatus =
    (ROUTE_RUN_STATUSES.includes(runStatus) && RUN_IMPLIED_STATUSES.includes(runStatus))
      ? runStatus
      : ASSIGNMENT_STATUSES.includes(savedAssignmentStatus)
        ? savedAssignmentStatus
        : null
  const workspace = routeRunId ? riderRouteMessagesRoute(routeRunId) : ''
  // Only an explicitly-pending persisted assignment opens the accept/decline UI.
  const assignmentPending = assignmentStatus === 'pending'
  const terminal = ['completed', 'cancelled', 'rejected'].includes(assignmentStatus)

  return (
    <div className="min-h-dvh bg-[var(--color-ink)] pb-[max(1rem,env(safe-area-inset-bottom))] text-[var(--color-paper)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-ink)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-paper-dim)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-emerald)]" /> Rider workspace
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
        {!routeRunId || !token ? (
          <section className="dashboard-panel rounded-2xl p-6 text-center sm:p-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
              <Bike size={26} />
            </span>
            <h1 className="mt-5 text-xl font-semibold">Open your rider link</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-paper-dim)]">
              Ask your dispatch team to send your secure route link. It opens your assigned stops and rider tools.
            </p>
          </section>
        ) : !data && !error ? (
          <div className="flex min-h-64 items-center justify-center"><Loader size={30} /></div>
        ) : error && !data ? (
          <section className="dashboard-panel space-y-4 rounded-2xl p-5">
            <Alert tone="error">{error}</Alert>
            <p className="text-sm leading-6 text-[var(--color-paper-dim)]">
              This link may have expired. Ask your dispatch team to create and send you a fresh rider link.
            </p>
            <Button variant="secondary" onClick={load}><RotateCw size={16} /> Try again</Button>
          </section>
        ) : (
          <>
            <section className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-route-cyan)]">Good day, rider</p>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{data.route.riderName}</h1>
                  <p className="mt-1 text-sm text-[var(--color-paper-dim)]">Your route overview</p>
                </div>
                <button
                  type="button"
                  onClick={load}
                  aria-label="Refresh route"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-paper-dim)] active:scale-95"
                >
                  <RotateCw size={17} />
                </button>
              </div>
            </section>

            {error && <Alert tone="error">{error}</Alert>}

            <section className="dashboard-panel overflow-hidden rounded-2xl">
              <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-paper-faint)]">Today&apos;s route</p>
                  <h2 className="mt-2 text-lg font-semibold">{data.route.stopCount} {data.route.stopCount === 1 ? 'stop' : 'stops'}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-paper-dim)]">
                    <Navigation size={14} /> {data.route.delayMinutes ? `${data.route.delayMinutes} min reported delay` : 'No reported delays'}
                  </p>
                </div>
                <span className="rounded-full border border-[var(--color-route-cyan)]/30 bg-[var(--soft-fill)] px-3 py-1.5 text-xs font-medium text-[var(--color-route-cyan)]">
                  {assignmentStatus
                    ? (STATUS_LABELS[assignmentStatus] || assignmentStatus.replaceAll('_', ' '))
                    : 'Waiting for assignment'}
                </span>
              </div>

              {assignmentStatus === null && !terminal && (
                <div className="border-t border-[var(--color-border-subtle)] px-5 py-4 text-sm text-[var(--color-paper-dim)]">
                  Waiting for dispatch to assign you to this route. This page updates once an assignment arrives.
                </div>
              )}

              {assignmentPending && (
                <div className="border-t border-[var(--color-border-subtle)] bg-[var(--soft-fill)] p-5 sm:p-6">
                  <p className="text-sm font-semibold">New route assignment</p>
                  <p className="mt-1 text-sm leading-5 text-[var(--color-paper-dim)]">Review the stops, then accept or decline this route.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      className="min-h-12"
                      disabled={Boolean(busy)}
                      onClick={() => respond('accept')}
                    >
                      {busy === 'accept' ? <Loader size={16} /> : <><Check size={16} /> Accept route</>}
                    </Button>
                    <Button
                      variant="secondary"
                      className="min-h-12"
                      disabled={Boolean(busy)}
                      onClick={() => respond('decline')}
                    >
                      {busy === 'decline' ? <Loader size={16} /> : 'Decline'}
                    </Button>
                  </div>
                </div>
              )}

              {assignmentStatus === 'accepted' && (
                <div className="flex items-center gap-2 border-t border-[var(--color-emerald)]/20 bg-[var(--color-emerald)]/10 px-5 py-3 text-sm text-[var(--color-mint)]">
                  <Check size={16} /> You accepted this route. You&apos;re ready to start.
                </div>
              )}
              {terminal && (
                <div className="border-t border-[var(--color-border-subtle)] px-5 py-4 text-sm text-[var(--color-paper-dim)]">
                  {assignmentStatus === 'rejected' ? 'You declined this assignment. Contact dispatch if this was a mistake.' : STATUS_LABELS[assignmentStatus]}
                </div>
              )}
            </section>

            <section className="dashboard-panel rounded-2xl p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Next stops</h2>
                  <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Follow the sequence set by dispatch.</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
                  <MapPin size={17} />
                </span>
              </div>

              {!nextStops.length ? (
                <div className="rounded-xl border border-dashed border-[var(--color-border-subtle)] px-4 py-8 text-center">
                  <PackageCheck className="mx-auto text-[var(--color-paper-faint)]" size={24} />
                  <p className="mt-3 text-sm text-[var(--color-paper-dim)]">All stops are complete.</p>
                </div>
              ) : (
                <ol className="space-y-3">
                  {nextStops.map((stop) => (
                    <li key={stop.routeTaskId} className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[var(--color-border-subtle)] p-3.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--soft-fill)] font-mono text-sm font-semibold text-[var(--color-route-cyan)]">
                        {stop.stopNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{stop.recipientName}</p>
                        <p className="mt-1 truncate text-xs text-[var(--color-paper-dim)]">{stop.dropoffNeighborhood} · {stop.trackingId}</p>
                      </div>
                      <StopStatus status={stop.status} />
                    </li>
                  ))}
                </ol>
              )}

              {stops.length > 3 && (
                <p className="mt-3 text-center text-xs text-[var(--color-paper-faint)]">+{stops.length - 3} more stops in your route</p>
              )}
            </section>

            <Link
              to={workspace}
              className="flex min-h-14 items-center justify-between rounded-2xl bg-[var(--color-dispatch-orange)] px-5 font-semibold text-[var(--color-ink)] shadow-lg shadow-black/15 active:scale-[0.99]"
            >
              <span className="flex items-center gap-2"><Bike size={18} /> Open route workspace</span>
              <ChevronRight size={20} />
            </Link>
          </>
        )}
      </main>

      {data && workspace && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border-subtle)] bg-[var(--color-ink)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto grid max-w-2xl grid-cols-3 px-3 py-2">
            <Link to="/rider/dashboard" className="flex min-h-12 flex-col items-center justify-center gap-1 text-xs font-medium text-[var(--color-route-cyan)]">
              <Bike size={18} /> Home
            </Link>
            <Link to={workspace} className="flex min-h-12 flex-col items-center justify-center gap-1 text-xs text-[var(--color-paper-dim)]">
              <MapPin size={18} /> Stops
            </Link>
            <Link to={`${workspace}?tab=chat`} className="flex min-h-12 flex-col items-center justify-center gap-1 text-xs text-[var(--color-paper-dim)]">
              <MessageSquareText size={18} /> Chat
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}
