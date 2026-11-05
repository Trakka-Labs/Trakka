import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Loader from '../../components/ui/Loader'
import Logo from '../../components/ui/Logo'
import LiveMap from '../../components/ui/LiveMap'
import { getTracking } from '../../lib/api'

const TIMELINE = [
  { key: 'ready_for_dispatch', label: 'Order confirmed' },
  { key: 'accepted', label: 'Rider assigned' },
  { key: 'picked_up', label: 'Package picked up' },
  { key: 'in_transit', label: 'En route' },
  { key: 'arriving', label: 'Arriving soon' },
  { key: 'delivered', label: 'Delivered' },
]

function timeOf(value) {
  return new Intl.DateTimeFormat('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

/**
 * Customer tracking page. Polls adaptively: every 4s while actively in
 * transit, 15s while pending, and stops entirely once delivered/expired,
 * so public endpoints stay cool and the secret link never leaks anywhere.
 */
export default function TrackingPage() {
  const { token } = useParams()
  const [tracking, setTracking] = useState(null)
  const [error, setError] = useState('')

  const data = tracking?.tracking
  const stateRef = useRef(null)
  stateRef.current = data

  useEffect(() => {
    let cancelled = false
    let timer

    const tick = async () => {
      try {
        const payload = await getTracking(token)
        if (cancelled) return
        setTracking(payload)
        setError('')
      } catch (err) {
        if (cancelled) return
        setError(err.message)
        return
      }
      if (cancelled) return
      timer = window.setTimeout(tick, nextDelayMs(stateRef.current))
    }
    tick()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [token])

  const activeIndex = useMemo(() => {
    if (!data) return -1
    const order = ['ready_for_dispatch', 'accepted', 'picked_up', 'in_transit', 'arriving', 'delivered']
    return order.indexOf(data.status)
  }, [data])

  const etaLabel = data?.eta
    ? data.eta.minutes >= 90
      ? `${Math.round(data.eta.minutes / 60)} hr ${data.eta.minutes % 60} min`
      : `${data.eta.minutes} min`
    : null

  if (error && !data) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--color-ink)] px-4">
        <div className="max-w-sm space-y-4 text-center">
          <Logo size={34} className="mx-auto" />
          <Alert tone="error">{error}</Alert>
          <p className="text-xs text-[var(--color-paper-faint)]">
            Tracking links are single customer-per-parcel and expire 3 days after dispatch.
          </p>
        </div>
      </div>
    )
  }
  if (!data) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--color-ink)]">
        <Loader size={30} />
      </div>
    )
  }

  const hideLive = data.state !== 'active'
  const showExpiredState = data.state === 'expired'

  return (
    <div className="min-h-dvh bg-[var(--color-ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Logo size={27} />
            <div>
              <p className="text-sm font-semibold text-[var(--color-paper)]">{data.company.name}</p>
              <p className="font-mono text-[10px] text-[var(--color-paper-faint)]">{data.trackingId}</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] px-2.5 py-1 text-[10px] text-[var(--color-paper-faint)]">
            <ShieldCheck size={12} /> Secure link
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        {showExpiredState && (
          <Alert tone="neutral" className="mb-4">
            This tracking link has expired. Contact {data.company.name} for your delivery status.
          </Alert>
        )}

        <section className="dashboard-panel overflow-hidden rounded-lg">
          <div className="relative h-64 w-full sm:h-80">
            {!hideLive && data.position ? (
              <LiveMap position={data.position} follow />
            ) : (
              !hideLive && (
                <div className="grid h-full place-items-center text-sm text-[var(--color-paper-faint)]">
                  Live tracking starts when the rider is en route.
                </div>
              )
            )}
            {hideLive && (
              <div className="grid h-full place-items-center">
                <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-6 py-5 text-center">
                  <PackageCheck className="mx-auto text-[var(--color-route-cyan)]" size={26} />
                  <p className="mt-2 text-sm font-medium text-[var(--color-paper)]">
                    {data.state === 'delivered'
                      ? 'Package was delivered on'
                      : 'Link expired on'}
                  </p>
                  <p className="text-lg font-semibold text-[var(--color-paper)]">
                    {data.completedAt ? timeOf(data.completedAt) : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {etaLabel && !hideLive && (
            <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border-subtle)] px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
                  {data.eta?.delaySeconds > 0 ? 'Revised arrival estimate' : 'Estimated arrival'}
                </p>
                <p className="text-xl font-semibold text-[var(--color-paper)]">{etaLabel}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[var(--soft-fill)] px-3 py-1.5 text-[var(--color-route-cyan)]">
                <Truck size={14} />
                <span className="text-xs">{data.statusLabel}</span>
              </div>
            </div>
          )}
        </section>

        <section className="dashboard-panel mt-4 rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">Your rider</p>
              <p className="text-sm font-semibold text-[var(--color-paper)]">{data.riderName ?? 'Will be assigned'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">Requested</p>
              <p className="text-sm text-[var(--color-paper-dim)]">{data.requestedDate}</p>
            </div>
          </div>

          <ol className="mt-5 space-y-0">
            {TIMELINE.map((step, index) => {
              const reached = activeIndex >= index
              return (
                <li key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full border text-[9px] ${
                        reached
                          ? 'border-[var(--color-route-cyan)] bg-[var(--color-route-cyan)] text-white'
                          : 'border-[var(--color-border-subtle)] text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    {index < TIMELINE.length - 1 && (
                      <span
                        className={`w-px flex-1 ${reached ? 'bg-[var(--color-route-cyan)]/60' : 'bg-[var(--color-border-subtle)]'}`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm ${reached ? 'text-[var(--color-paper)]' : 'text-[var(--color-paper-faint)]'}`}>
                      {step.label}
                    </p>
                    {reached && data.timeline.length > 0 && index === activeIndex && (
                      <p className="text-[10px] text-[var(--color-paper-faint)]">
                        {timeOf(data.timeline[data.timeline.length - 1].at)}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <p className="mt-6 text-center text-[10px] text-[var(--color-paper-faint)]">
          Powered by <span className="font-semibold text-[var(--color-route-cyan)]">Trakka</span>
        </p>
      </main>
    </div>
  )
}

function nextDelayMs(tracking) {
  const status = tracking?.tracking?.status
  if (status === 'in_transit' || status === 'arriving') return 4_000
  return 15_000
}
