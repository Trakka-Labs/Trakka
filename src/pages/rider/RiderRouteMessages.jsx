import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Bike, CheckCircle2, CloudRain, MessageSquareText, Navigation,
  Send, ShieldCheck, TriangleAlert,
} from 'lucide-react'
import { useParams } from 'react-router'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Logo from '../../components/ui/Logo'
import {
  getRiderRoute, getRiderRouteMessages, prepareDeliveryVerification,
  reportRiderDelay, sendRiderPing, sendRiderRouteMessage, updateStopStatus,
  verifyDeliveryOtp,
} from '../../lib/api'

const QUICK_REPLIES = ['Traffic delay', 'Road blocked', 'Wrong address', 'I need assistance']

const DELAY_REASONS = [
  { value: 'police', label: 'Police checkpoint' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'rain', label: 'Heavy rain' },
  { value: 'breakdown', label: 'Bike breakdown' },
  { value: 'other', label: 'Other incident' },
]

const STATUS_ACTIONS = [
  { value: 'pickup_in_progress', label: 'At pickup' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'in_transit', label: 'En route' },
  { value: 'arriving', label: 'Arriving' },
]

const ORDER_STATUS_LABELS = {
  ready_for_dispatch: 'Confirmed', assigned: 'Assigned', accepted: 'Accepted',
  pickup_in_progress: 'At pickup', picked_up: 'Picked up', in_transit: 'En route',
  arriving: 'Arriving', delivered: 'Delivered', failed: 'Failed', returned: 'Returned',
}

function time(value) {
  return new Intl.DateTimeFormat('en-NG', { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function readToken(routeRunId) {
  const storageKey = `trakka-rider-route-access:${routeRunId}`
  const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get('access')
  if (fragmentToken) sessionStorage.setItem(storageKey, fragmentToken)
  return fragmentToken || sessionStorage.getItem(storageKey) || ''
}

export default function RiderRouteMessages() {
  const { routeRunId } = useParams()
  const token = useMemo(() => readToken(routeRunId), [routeRunId])
  const [tab, setTab] = useState('stops')
  const [route, setRoute] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyStop, setBusyStop] = useState('')
  const [otpFor, setOtpFor] = useState(null)
  const [otpValue, setOtpValue] = useState('')
  const [delayFor, setDelayFor] = useState(false)
  const [pingState, setPingState] = useState('idle')
  const sending = useRef(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (!window.location.hash) return
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
  }, [])

  const loadStops = useCallback(async (quiet = false) => {
    try {
      setRoute(await getRiderRoute(routeRunId, token))
      if (!quiet) setError('')
      return true
    } catch (err) {
      if (!quiet) setError(err.message)
      return false
    }
  }, [routeRunId, token])

  const loadMessages = useCallback(async (quiet = false) => {
    try {
      setConversation(await getRiderRouteMessages(routeRunId, token))
      if (!quiet) setError('')
      return true
    } catch (err) {
      if (!quiet) setError(err.message)
      return false
    }
  }, [routeRunId, token])

  useEffect(() => {
    loadStops()
    loadMessages()
    const interval = window.setInterval(() => {
      if (tab === 'stops') loadStops(true)
      else loadMessages(true)
    }, 5_000)
    return () => window.clearInterval(interval)
  }, [loadStops, loadMessages, tab])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages?.length])

  // ------------------------------------------------------------- GPS pings
  useEffect(() => {
    if (!route?.route || route.route.stopCount === 0) return undefined
    if (!navigator.geolocation) {
      setPingState('unsupported')
      return undefined
    }
    let eventId = crypto.randomUUID()
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const capturedAt = new Date(position.timestamp).toISOString()
        try {
          await sendRiderPing(routeRunId, token, {
            eventId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || 50,
            speed: position.coords.speed ?? undefined,
            heading: position.coords.heading ?? undefined,
            capturedAt,
          })
          eventId = crypto.randomUUID()
          setPingState('live')
        } catch {
          setPingState('error')
        }
      },
      () => setPingState('denied'),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [route?.route?.stopCount, routeRunId, token, route?.route])

  // ------------------------------------------------------------- actions
  const send = async (event, quickReply) => {
    event?.preventDefault()
    const body = (quickReply || draft).trim()
    if (!body || sending.current) return
    sending.current = true
    try {
      setConversation(await sendRiderRouteMessage(routeRunId, token, body, crypto.randomUUID()))
      setDraft('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      sending.current = false
    }
  }

  const act = async (orderId, action, extra) => {
    setBusyStop(orderId)
    setError('')
    try {
      if (action === 'status') {
        await updateStopStatus(routeRunId, token, orderId, extra)
        await loadStops(true)
        setNotice(`Stop marked ${ORDER_STATUS_LABELS[extra]?.toLowerCase() ?? extra}.`)
      } else if (action === 'prepare') {
        const result = await prepareDeliveryVerification(routeRunId, token, orderId)
        await loadStops(true)
        if (result.testCode) {
          setOtpFor(orderId)
          setNotice(`Verification code (test mode): ${result.testCode}. Relay it to the customer.`)
        } else {
          setOtpFor(orderId)
          setNotice('Verification code was relayed to the customer over WhatsApp. Ask them to read it out.')
        }
      } else if (action === 'verify') {
        await verifyDeliveryOtp(routeRunId, token, orderId, String(extra))
        setOtpFor(null)
        setOtpValue('')
        setNotice('Code verified. You can mark the delivery complete.')
        await loadStops(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyStop('')
    }
  }

  const reportDelay = async (reason) => {
    setError('')
    try {
      const result = await reportRiderDelay(routeRunId, token, reason)
      setNotice(`Delay broadcast sent. Revised ETA shared with customers (${result.revisedEta}).`)
      setDelayFor(false)
      setTab('stops')
      await loadStops(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const stops = route?.stops ?? []
  const activeStop = stops.find((stop) => !['completed', 'failed', 'skipped'].includes(stop.status))
  const completedCount = stops.length - stops.filter((stop) => !['completed', 'failed', 'skipped'].includes(stop.status)).length

  return (
    <div className="min-h-dvh bg-[var(--color-ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5"><Logo size={27} /><span className="font-semibold text-[var(--color-paper)]">Trakka</span></div>
          <span className="flex items-center gap-2 text-xs text-[var(--color-paper-faint)]">
            <Bike size={14} /> {route?.route?.riderName ?? 'Rider'} · {completedCount}/{route?.route?.stopCount ?? 0} stops
          </span>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-2xl flex-col px-3 py-4 sm:px-5">
        {error && <Alert tone="error" className="mb-4">{error}</Alert>}
        {notice && <Alert tone="success" className="mb-4">{notice}</Alert>}
        {pingState !== 'live' && tab === 'stops' && pingState !== 'idle' && (
          <Alert tone="neutral" className="mb-4">
            {pingState === 'denied' && 'Location sharing is off — customers can only see your last known stop. Enable it when safe to ride.'}
            {pingState === 'unsupported' && 'This browser cannot share live location.'}
            {pingState === 'error' && 'Location upload hiccup — retrying automatically.'}
          </Alert>
        )}

        {!route && !error && tab === 'stops' && <div className="grid flex-1 place-items-center"><Loader size={28} /></div>}
        {!conversation && !error && tab === 'chat' && <div className="grid flex-1 place-items-center"><Loader size={28} /></div>}

        <nav className="mb-4 grid grid-cols-3 gap-2">
          <TabButton active={tab === 'stops'} onClick={() => { setTab('stops'); loadStops() }}>Stops</TabButton>
          <TabButton active={tab === 'chat'} onClick={() => { setTab('chat'); loadMessages() }}>Chat</TabButton>
          <TabButton active={delayFor} onClick={() => { setDelayFor(true) }} tone="danger">Report delay</TabButton>
        </nav>

        {delayFor && (
          <section className="dashboard-panel mb-4 rounded-lg p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-paper)]">
              <CloudRain size={15} /> One-tap delay broadcast
            </h2>
            <p className="mt-1 mb-3 text-xs text-[var(--color-paper-faint)]">
              Every customer still waiting on this route gets an updated ETA on WhatsApp automatically.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DELAY_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => reportDelay(reason.value)}
                  className="rounded border border-[var(--color-border-subtle)] px-3 py-2.5 text-left text-sm text-[var(--color-paper-dim)] hover:border-[var(--color-route-cyan)]"
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <Button type="button" variant="ghost" className="mt-3 w-full" onClick={() => setDelayFor(false)}>Cancel</Button>
          </section>
        )}

        {tab === 'stops' && route && (
          <section className="space-y-3">
            {route.route?.delayMinutes > 0 && (
              <Alert tone="neutral">{route.route?.delayMinutes} min of reported delays on this route today.</Alert>
            )}
            {stops.map((stop) => (
              <article key={stop.orderId} className="dashboard-panel rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-route-cyan)]">
                      Stop {stop.stopNumber} · {stop.zone.replaceAll('_', ' / ')}
                    </p>
                    <h3 className="mt-0.5 text-sm font-semibold text-[var(--color-paper)]">{stop.recipientName}</h3>
                    <p className="mt-1 text-xs text-[var(--color-paper-dim)]">{stop.dropoffAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--color-paper-faint)]">{ORDER_STATUS_LABELS[stop.orderStatus] ?? stop.orderStatus}</span>
                    <p className="mt-1 font-mono text-[9px] text-[var(--color-paper-faint)]">{stop.trackingId}</p>
                  </div>
                </div>

                {otpFor === stop.orderId && stop.verificationState !== 'verified' && (
                  <div className="mt-3 flex gap-2">
                    <input
                      inputMode="numeric"
                      maxLength={6}
                      value={otpValue}
                      onChange={(event) => setOtpValue(event.target.value.replace(/\D/g, ''))}
                      placeholder="Customer's 6-digit code"
                      className="min-w-0 flex-1 rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
                    />
                    <Button
                      size="sm"
                      disabled={otpValue.length !== 6 || busyStop === stop.orderId}
                      onClick={() => act(stop.orderId, 'verify', otpValue)}
                    >
                      {busyStop === stop.orderId ? <Loader size={13} /> : <ShieldCheck size={14} />} Verify
                    </Button>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {STATUS_ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      disabled={busyStop === stop.orderId || stop.verificationState === 'verified'}
                      onClick={() => act(stop.orderId, 'status', action.value)}
                      className="rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-paper-dim)] hover:border-[var(--color-route-cyan)] disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                  {stop.verificationState !== 'verified' ? (
                    <button
                      type="button"
                      disabled={busyStop === stop.orderId}
                      onClick={() => act(stop.orderId, 'prepare')}
                      className="rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-paper-dim)] hover:border-[var(--color-route-cyan)] disabled:opacity-50"
                    >
                      Get customer code
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-[var(--soft-fill)] px-3 py-1.5 text-xs text-[var(--color-route-cyan)]">
                      <CheckCircle2 size={12} /> Code verified
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={
                      busyStop === stop.orderId ||
                      stop.verificationState !== 'verified' ||
                      stop.orderStatus === 'delivered'
                    }
                    onClick={() => act(stop.orderId, 'status', 'delivered')}
                    className="flex items-center gap-1.5 rounded-full bg-[var(--color-route-cyan)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                  >
                    <TriangleAlert size={12} /> Mark delivered
                  </button>
                </div>
                {activeStop && activeStop.orderId === stop.orderId && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.dropoffAddress + ', Benin City')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-route-cyan)]"
                  >
                    <Navigation size={12} /> Navigate with Google Maps
                  </a>
                )}
              </article>
            ))}
          </section>
        )}

        {tab === 'chat' && conversation && (
          <section className="dashboard-panel flex flex-1 flex-col overflow-hidden rounded-lg">
            <header className="border-b border-[var(--color-border-subtle)] px-4 py-4">
              <p className="text-xs font-medium text-[var(--color-route-cyan)]">Route communication</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold text-[var(--color-paper)]">{conversation.route.riderName}</h1>
                  <p className="mt-1 font-mono text-[10px] text-[var(--color-paper-faint)]">{routeRunId.slice(0, 12)} · {conversation.route.stopCount} stops</p>
                </div>
                <span className="text-xs capitalize text-[var(--color-paper-faint)]">{conversation.route.routeStatus}</span>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-ink-deep)]/35 p-4">
              {!conversation.messages.length && (
                <div className="grid min-h-64 place-items-center text-center">
                  <div><MessageSquareText className="mx-auto text-[var(--color-paper-faint)]" size={24} /><p className="mt-3 text-sm text-[var(--color-paper-dim)]">No route messages yet.</p></div>
                </div>
              )}
              {conversation.messages.map((message) => {
                const mine = message.senderType === 'rider'
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[86%] rounded-lg px-4 py-3 ${mine ? 'bg-[var(--color-route-cyan)] text-white' : 'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]'}`}>
                      <p className={`text-[10px] ${mine ? 'text-white/70' : 'text-[var(--color-paper-faint)]'}`}>{message.senderName}</p>
                      <p className={`mt-1 whitespace-pre-wrap text-sm leading-5 ${mine ? 'text-white' : 'text-[var(--color-paper)]'}`}>{message.body}</p>
                      <p className={`mt-2 text-right font-mono text-[9px] ${mine ? 'text-white/60' : 'text-[var(--color-paper-faint)]'}`}>{time(message.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>

            <div className="border-t border-[var(--color-border-subtle)] p-3">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {QUICK_REPLIES.map((reply) => (
                  <button key={reply} type="button" disabled={sending.current} onClick={() => send(null, reply)} className="shrink-0 rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-paper-dim)] hover:border-[var(--color-route-cyan)]">
                    {reply}
                  </button>
                ))}
              </div>
              <form onSubmit={send} className="flex gap-2">
                <label htmlFor="rider-route-message" className="sr-only">Message dispatch</label>
                <textarea id="rider-route-message" rows={2} maxLength={1000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message dispatch…" className="min-h-12 flex-1 resize-none rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-3 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]" />
                <Button type="submit" size="sm" disabled={!draft.trim() || sending.current} aria-label="Send message">{sending.current ? <Loader size={15} /> : <Send size={16} />}</Button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function TabButton({ active, onClick, children, tone = 'default' }) {
  const danger = tone === 'danger'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
        active
          ? danger
            ? 'border-[var(--color-dispatch-orange)] bg-[var(--color-dispatch-orange)]/10 text-[var(--color-dispatch-orange)]'
            : 'border-[var(--color-route-cyan)] bg-[var(--soft-fill)] text-[var(--color-route-cyan)]'
          : 'border-[var(--color-border-subtle)] text-[var(--color-paper-faint)] hover:text-[var(--color-paper-dim)]'
      }`}
    >
      {children}
    </button>
  )
}

