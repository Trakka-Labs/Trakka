import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Camera, PackageCheck, ShieldCheck, Star, Truck } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Loader from '../../components/ui/Loader'
import Logo from '../../components/ui/Logo'
import LiveMap from '../../components/ui/LiveMap'
import usePolling from '../../hooks/usePolling'
import { getTracking, submitDeliveryFeedback } from '../../lib/api'
import { ORDER_STATUSES, orderStatusIndex } from '../../lib/statuses'

// One ordered timeline, derived from the shared order-status vocabulary so the
// page can never diverge from it again (the second inline copy is gone).
const TRACKING_STEPS = [
  ['ready_for_dispatch', 'Order confirmed'],
  ['assigned', 'Rider assigned'],
  ['accepted', 'Rider accepted'],
  ['pickup_in_progress', 'Heading to pickup'],
  ['picked_up', 'Package picked up'],
  ['in_transit', 'En route'],
  ['arriving', 'Arriving soon'],
  ['delivered', 'Delivered'],
].filter(([key]) => ORDER_STATUSES.includes(key))
const TIMELINE = TRACKING_STEPS.map(([key, label]) => ({ key, label }))


/**
 * Customer tracking page. Polls adaptively: every 4s while actively in
 * transit, 15s while pending, and stops entirely once delivered/expired,
 * so public endpoints stay cool and the secret link never leaks anywhere.
 */
export default function TrackingPage() {
  const { token } = useParams()
  const [tracking, setTracking] = useState(null)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [tip, setTip] = useState('')
  const [comment, setComment] = useState('')
  const [feedbackBusy, setFeedbackBusy] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  const data = tracking?.tracking
  const stateRef = useRef(null)
  stateRef.current = data

  // Adaptive polling: 4s while actively en route, 15s otherwise, paused while
  // hidden, and stopped entirely once delivered/expired. Failures keep polling
  // — the error only clears once a successful fetch replaces it.
  const pollEnabled = !data || (data.state !== 'delivered' && data.state !== 'expired')
  usePolling(
    async () => {
      const payload = await getTracking(token)
      setTracking(payload)
      setError('')
    },
    {
      enabled: pollEnabled,
      onError: (err) => {
        if (err) setError(err.message)
      },
      getInterval: () => {
        const status = stateRef.current?.status
        if (status === 'in_transit' || status === 'arriving') return 4_000
        return 15_000
      },
    },
  )

  const activeIndex = useMemo(() => {
    if (!data) return -1
    // status values not on the timeline (cancelled/failed/assigned) resolve to
    // -1 here; clampToTimeline below keeps the stepper rendering sensibly.
    return orderStatusIndex(data.status)
  }, [data])
  // Active row index within the rendered timeline (unknown status → no row).
  const timelineIndex = activeIndex < 0 ? -1 : TIMELINE.findIndex((step) => step.key === data?.status)

  const feedback = data?.feedback ?? null
  const submitFeedback = async (event) => {
    event.preventDefault()
    if (!rating) {
      setFeedbackError('Choose a star rating first.')
      return
    }
    setFeedbackBusy(true)
    setFeedbackError('')
    try {
      const result = await submitDeliveryFeedback(token, {
        rating,
        tipAmount: Number(tip) || 0,
        comment: comment.trim() || undefined,
      })
      setTracking((current) => ({
        ...current,
        tracking: { ...current.tracking, feedback: result.feedback },
      }))
    } catch (err) {
      setFeedbackError(err.message)
    } finally {
      setFeedbackBusy(false)
    }
  }

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
                    {data.completedAt ? humanTime(data.completedAt) : '—'}
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">Package</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-paper)]">{data.packageDescription}</p>
              <p className="mt-1 text-xs text-[var(--color-paper-dim)]">
                {data.serviceType === 'urgent' ? 'Urgent direct run' : 'Batched route'} ·{' '}
                {data.paymentType === 'pay_on_delivery' ? 'Pay on delivery' : 'Prepaid by sender'}
              </p>
            </div>
            {data.packagePhotoDataUrl && (
              <img
                src={data.packagePhotoDataUrl}
                alt="Package"
                className="h-20 w-20 shrink-0 rounded-lg border border-[var(--color-border-subtle)] object-cover"
              />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
              <Camera size={12} /> Receipt
            </span>
            <span className="text-sm font-semibold text-[var(--color-paper)]">
              {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
                (data.deliveryFeeMinor ?? 0) / 100,
              )}
            </span>
          </div>
        </section>

        {data.state === 'delivered' && (
          <section className="dashboard-panel mt-4 rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">
              {feedback ? 'Thanks for your feedback' : 'Rate this delivery'}
            </p>
            {feedback ? (
              <div className="mt-2 space-y-1">
                <p className="flex items-center gap-1 text-[var(--color-dispatch-orange)]">
                  {Array.from({ length: feedback.rating }, (_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </p>
                {feedback.tipAmountMinor > 0 && (
                  <p className="text-xs text-[var(--color-paper-dim)]">
                    Tip sent: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(feedback.tipAmountMinor / 100)}
                  </p>
                )}
                {feedback.comment && (
                  <p className="text-xs text-[var(--color-paper-dim)]">“{feedback.comment}”</p>
                )}
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="mt-3 space-y-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} star${value === 1 ? '' : 's'}`}
                      onClick={() => setRating(value)}
                      className={value <= rating ? 'text-[var(--color-dispatch-orange)]' : 'text-[var(--color-paper-faint)]'}
                    >
                      <Star size={24} fill={value <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  step="50"
                  value={tip}
                  onChange={(event) => setTip(event.target.value)}
                  placeholder="Tip the rider (optional, ₦)"
                  className="w-full rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
                />
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder="Any comment about the delivery? (optional)"
                  className="w-full rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
                />
                {feedbackError && <p className="text-xs text-red-500">{feedbackError}</p>}
                <button
                  type="submit"
                  disabled={feedbackBusy}
                  className="w-full rounded-lg bg-[var(--color-route-cyan)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {feedbackBusy ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
          </section>
        )}

        <section className="dashboard-panel mt-4 rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">Your rider</p>
              <p className="text-sm font-semibold text-[var(--color-paper)]">{data.riderName ?? 'Will be assigned'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">Requested</p>
              <p className="text-sm text-[var(--color-paper-dim)]">{humanDate(data.requestedDate)}</p>
            </div>
          </div>

          <ol className="mt-5 space-y-0">
            {TIMELINE.map((step, index) => {
              const reached = timelineIndex >= index
                // A status outside the ordered set (e.g. cancelled/failed)
                // keeps the rows unhighlighted rather than jumping.
                || (timelineIndex === -1 && step.key === 'ready_for_dispatch')
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
                    {reached && data.timeline.length > 0 && index === timelineIndex && (
                      <p className="text-[10px] text-[var(--color-paper-faint)]">
                        {humanTime(data.timeline[data.timeline.length - 1].at)}
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
