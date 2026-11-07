import { useCallback, useEffect, useRef, useState } from 'react'
import { Copy, Link2, MessageSquareText, RefreshCw, Send, UserRound } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/dashboard/EmptyState'
import Loader from '../../../components/ui/Loader'
import usePolling from '../../../hooks/usePolling'
import {
  createOrderLink, createRiderRouteAccess, disableOrderLink, getOrderLinks,
  getBusinessRouteMessages, getCommunicationRoutes, getTrackingAlerts,
  rotateOrderLink, sendBusinessRouteMessage, shareRouteLinks,
} from '../../../lib/api'
import Pagination from '../../../components/ui/Pagination'
import { ROUTES } from '../../../lib/routes'
import { humanDateTime } from '../../../lib/formatDate'


const ROUTES_PAGE_SIZE = 8
const MESSAGES_PAGE_SIZE = 30

function statusTone(status) {
  if (status === 'active' || status === 'accepted') return 'emerald'
  if (status === 'completed') return 'cyan'
  return 'neutral'
}

export default function Communications() {
  const [routes, setRoutes] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [conversation, setConversation] = useState(null)
  const [draft, setDraft] = useState('')
  const [accessLink, setAccessLink] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [orderLink, setOrderLink] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [sharedLinks, setSharedLinks] = useState([])
  const [routesPage, setRoutesPage] = useState(1)
  const [messageWindow, setMessageWindow] = useState(MESSAGES_PAGE_SIZE)
  const endRef = useRef(null)

  const loadAlerts = useCallback(async () => {
    try {
      const result = await getTrackingAlerts()
      setAlerts(result.alerts ?? [])
    } catch {
      setAlerts([])
    }
  }, [])

  const loadOrderLinks = useCallback(async () => {
    try {
      const result = await getOrderLinks()
      const active = (result.links ?? []).find((link) => link.status === 'active')
      // A freshly created/rotated link carries its plaintext token; never clobber
      // it with the list result, which only ever contains the token prefix.
      setOrderLink((current) => (current?.token ? current : active ?? null))
    } catch {
      setOrderLink(null)
    }
  }, [])

  const generateOrderLink = async () => {
    setBusy('order-link')
    try {
      const result = await createOrderLink({})
      setOrderLink(result.link)
      copyLink(intakeUrl(result.link.token))
      await loadOrderLinks()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const rotateLink = async () => {
    if (!orderLink) return
    setBusy('order-link')
    try {
      const result = await rotateOrderLink(orderLink.id)
      setOrderLink(result.link)
      copyLink(intakeUrl(result.link.token))
      await loadOrderLinks()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const retireLink = async () => {
    if (!orderLink) return
    setBusy('order-link')
    try {
      await disableOrderLink(orderLink.id)
      setOrderLink(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const shareTrackingLinks = async (notify) => {
    setBusy('share-links')
    setError('')
    try {
      const result = await shareRouteLinks(selectedId, notify)
      setSharedLinks(result.links)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const loadRoutes = useCallback(async () => {
    const result = await getCommunicationRoutes()
    setRoutes(result.routes)
    setSelectedId((current) => current || result.routes[0]?.routeRunId || '')
  }, [])

  const loadConversation = useCallback(async (quiet = false) => {
    if (!selectedId) return
    try {
      const result = await getBusinessRouteMessages(selectedId)
      setConversation(result)
      if (!quiet) setError('')
    } catch (err) {
      if (!quiet) setError(err.message)
    }
  }, [selectedId])

  useEffect(() => {
    loadRoutes().catch((err) => setError(err.message))
  }, [loadRoutes])

  useEffect(() => {
    setConversation(null)
    setAccessLink('')
    setMessageWindow(MESSAGES_PAGE_SIZE)
    loadConversation()
  }, [loadConversation])

  // 4-second refresh: routes list quietly, conversation quietly (errors only
  // surfaced on manual loads). usePolling also pauses while the tab is hidden.
  usePolling(
    () => Promise.all([loadRoutes().catch(() => {}), loadConversation(true)]),
    { interval: 4_000 },
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages.length])

  const sendMessage = async (event) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || !selectedId) return
    setBusy('send')
    try {
      setConversation(await sendBusinessRouteMessage(selectedId, body, crypto.randomUUID()))
      setDraft('')
      await loadRoutes()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const generateAccess = async () => {
    setBusy('access')
    try {
      const access = await createRiderRouteAccess(selectedId)
      const url = new URL(ROUTES.riderDashboard, window.location.origin)
      url.hash = new URLSearchParams({ access: access.token, route: selectedId }).toString()
      setAccessLink(url.toString())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const copyAccessTimer = useRef(undefined)

  // Single 1.5s "Copied" flash token shared by every copy button on the page,
  // replacing the previously duplicated setTimeout flash keys.
  const flashCopied = () => {
    setBusy('copied')
    window.clearTimeout(copyAccessTimer.current)
    copyAccessTimer.current = window.setTimeout(() => setBusy(''), 1500)
  }

  const copyAccess = async () => {
    await navigator.clipboard.writeText(accessLink)
    flashCopied()
  }

  const intakeUrl = (token) => `${window.location.origin}/order/${token}`

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      flashCopied()
    } catch {
      setError('Could not copy the link automatically — copy it from the field instead.')
    }
  }

  useEffect(() => {
    loadOrderLinks()
    loadAlerts()
  }, [loadAlerts, loadOrderLinks])

  if (!routes && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  const routesTotalPages = Math.max(1, Math.ceil((routes?.length || 0) / ROUTES_PAGE_SIZE))
  const safeRoutesPage = Math.min(routesPage, routesTotalPages)
  const pageRoutes = (routes || []).slice(
    (safeRoutesPage - 1) * ROUTES_PAGE_SIZE,
    safeRoutesPage * ROUTES_PAGE_SIZE,
  )
  const messages = conversation?.messages || []
  const visibleMessages = messages.slice(-messageWindow)

  return (
    <div>
      <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">Route communication</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Communications
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-paper-dim)]">
            Keep dispatch guidance attached to the route where it belongs.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start text-xs text-[var(--color-paper-faint)]">
          <RefreshCw size={13} /> Messages refresh every 4 seconds
        </span>
      </header>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      <section className="dashboard-panel mb-5 rounded-lg p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium text-[var(--color-route-cyan)]">WhatsApp order intake</p>
            <h2 className="mt-1 text-sm font-semibold text-[var(--color-paper)]">Customer self-service order link</h2>
            <p className="mt-1 max-w-xl text-xs text-[var(--color-paper-faint)]">
              Share this link on WhatsApp or your status. Customers order without an account and each parcel gets its own secure tracking link.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {orderLink ? (
              <>
                <Button type="button" size="sm" onClick={rotateLink} disabled={busy === 'order-link'}>
                  <RefreshCw size={13} /> {busy === 'order-link' ? 'Working…' : 'Rotate link'}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => copyLink(intakeUrl(orderLink.token))}>
                  <Copy size={13} /> {busy === 'copied' ? 'Copied' : 'Copy link'}
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={retireLink}>
                  Retire
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" onClick={generateOrderLink} disabled={busy === 'order-link'}>
                <Link2 size={13} /> {busy === 'order-link' ? 'Creating…' : 'Create order link'}
              </Button>
            )}
          </div>
        </div>
        {orderLink?.token && (
          <div className="mt-3 flex flex-col gap-2 border border-[var(--color-border-subtle)] bg-[var(--soft-fill)] px-4 py-3 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-[var(--color-paper-dim)]">{intakeUrl(orderLink.token)}</p>
            <a
              className="shrink-0 text-xs font-medium text-[var(--color-route-cyan)]"
              href={`https://wa.me/?text=${encodeURIComponent('Order a delivery from us in seconds: ' + intakeUrl(orderLink.token))}`}
              target="_blank"
              rel="noreferrer"
            >
              Share on WhatsApp →
            </a>
          </div>
        )}
      </section>

      {alerts.length > 0 && (
        <section className="mb-5 space-y-2">
          <p className="text-xs font-semibold text-[var(--color-paper)]">Live tracking alerts</p>
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-2.5">
              <Badge tone={alert.eventType === 'route.off_route' || alert.eventType === 'route.delay_reported' ? 'orange' : 'cyan'}>
                {alert.eventType.replace('route.', '').replace('order.', '')}
              </Badge>
              <p className="min-w-0 flex-1 truncate text-xs text-[var(--color-paper-dim)]">{alert.payload.reason ?? alert.eventType}</p>
              <span className="shrink-0 font-mono text-[9px] text-[var(--color-paper-faint)]">{time(alert.occurredAt)}</span>
            </div>
          ))}
        </section>
      )}

      {routes?.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No dispatched routes"
          description="A conversation becomes available after a delivery batch is assigned to a rider."
        />
      ) : (
        <section className="dashboard-panel grid min-h-[42rem] overflow-hidden rounded-lg lg:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="border-b border-[var(--color-border-subtle)] lg:border-b-0 lg:border-r">
            <div className="border-b border-[var(--color-border-subtle)] px-4 py-4">
              <p className="text-xs font-semibold text-[var(--color-paper)]">Route conversations</p>
              <p className="mt-1 text-[10px] text-[var(--color-paper-faint)]">{routes?.length || 0} available</p>
            </div>
            <div className="max-h-72 overflow-y-auto lg:max-h-[37rem]">
              {pageRoutes.map((route) => (
                <button
                  key={route.routeRunId}
                  type="button"
                  onClick={() => setSelectedId(route.routeRunId)}
                  className={`block w-full border-b border-[var(--color-border-subtle)] px-4 py-4 text-left transition-colors ${
                    selectedId === route.routeRunId ? 'bg-[var(--soft-fill)]' : 'hover:bg-white/[0.025]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-[var(--color-paper)]">{route.riderName}</span>
                    <Badge tone={statusTone(route.routeStatus)}>{route.routeStatus}</Badge>
                  </div>
                  <p className="mt-2 truncate text-xs text-[var(--color-paper-faint)]">
                    {route.lastMessage || `${route.stopCount} ${route.stopCount === 1 ? 'stop' : 'stops'} · No messages yet`}
                  </p>
                  <p className="mt-2 font-mono text-[9px] text-[var(--color-paper-faint)]">
                    {route.routeRunId.slice(0, 12)} · {humanDateTime(route.lastMessageAt || route.createdAt)}
                  </p>
                </button>
              ))}
            </div>
            <div className="border-t border-[var(--color-border-subtle)] p-4">
              <Pagination
                page={safeRoutesPage}
                pageSize={ROUTES_PAGE_SIZE}
                total={routes?.length || 0}
                onPageChange={setRoutesPage}
              />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col">
            {conversation ? (
              <>
                <header className="flex flex-col justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
                      <UserRound size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-paper)]">{conversation.route.riderName}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--color-paper-faint)]">
                        Route {selectedId.slice(0, 12)} · {conversation.route.stopCount} stops
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={generateAccess} disabled={busy === 'access'}>
                    {busy === 'access' ? <Loader size={14} /> : <><Link2 size={14} /> Rider access</>}
                  </Button>
                </header>

                {accessLink && (
                  <div className="flex flex-col gap-2 border-b border-[var(--color-route-cyan)]/25 bg-[var(--soft-fill)] px-5 py-3 sm:flex-row sm:items-center">
                    <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-[var(--color-paper-dim)]">{accessLink}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={copyAccess}>
                      <Copy size={13} /> {busy === 'copied' ? 'Copied' : 'Copy link'}
                    </Button>
                  </div>
                )}

                <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-ink-deep)]/35 p-5">
                  {messages.length > visibleMessages.length && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMessageWindow((count) => count + MESSAGES_PAGE_SIZE)}
                        className="text-xs font-medium text-[var(--color-dispatch-orange)] hover:underline"
                      >
                        Show earlier messages ({messages.length - visibleMessages.length} more)
                      </button>
                    </div>
                  )}
                  {!messages.length && (
                    <div className="grid min-h-72 place-items-center text-center">
                      <div>
                        <MessageSquareText className="mx-auto text-[var(--color-paper-faint)]" size={24} />
                        <p className="mt-3 text-sm text-[var(--color-paper-dim)]">Start the route conversation.</p>
                        <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Generate a rider-access link so the assigned driver can reply.</p>
                      </div>
                    </div>
                  )}
                  {visibleMessages.map((message) => {
                    const mine = message.senderType === 'business'
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] rounded-lg px-4 py-3 ${
                          mine ? 'bg-[var(--color-route-cyan)] text-white' : 'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]'
                        }`}>
                          <p className={`text-[10px] font-medium ${mine ? 'text-white/70' : 'text-[var(--color-paper-faint)]'}`}>{message.senderName}</p>
                          <p className={`mt-1 whitespace-pre-wrap text-sm leading-5 ${mine ? 'text-white' : 'text-[var(--color-paper)]'}`}>{message.body}</p>
                          <p className={`mt-2 text-right font-mono text-[9px] ${mine ? 'text-white/60' : 'text-[var(--color-paper-faint)]'}`}>{humanDateTime(message.createdAt)}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={endRef} />
                </div>

                <form onSubmit={sendMessage} className="flex gap-3 border-t border-[var(--color-border-subtle)] p-4">
                  <label htmlFor="business-route-message" className="sr-only">Message the rider</label>
                  <textarea
                    id="business-route-message"
                    rows={2}
                    maxLength={1000}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                      }
                    }}
                    placeholder="Send route guidance…"
                    className="min-h-12 flex-1 resize-none rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
                  />
                  <Button type="submit" size="sm" disabled={!draft.trim() || busy === 'send'} aria-label="Send message">
                    {busy === 'send' ? <Loader size={15} /> : <Send size={16} />}
                  </Button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center"><Loader size={24} /></div>
            )}
          </div>
        </section>
      )}

      {selectedId && conversation && (
        <section className="dashboard-panel mt-5 rounded-lg p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium text-[var(--color-route-cyan)]">Customer tracking</p>
              <h2 className="mt-1 text-sm font-semibold text-[var(--color-paper)]">Share live tracking links</h2>
              <p className="mt-1 max-w-xl text-xs text-[var(--color-paper-faint)]">
                Mint a fresh per-parcel tracking link for every pending customer on {selectedId.slice(0, 12)} and optionally blast it over WhatsApp.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => shareTrackingLinks(false)} disabled={busy === 'share-links'}>
                <Link2 size={13} /> Mint links
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => shareTrackingLinks(true)} disabled={busy === 'share-links'}>
                {busy === 'share-links' ? <Loader size={13} /> : 'Mint + notify'}
              </Button>
            </div>
          </div>
          {sharedLinks.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {sharedLinks.map((link) => (
                <div key={link.orderId} className="flex items-center gap-3 rounded border border-[var(--color-border-subtle)] px-3 py-2">
                  <span className="shrink-0 font-mono text-[10px] text-[var(--color-route-cyan)]">{link.trackingId}</span>
                  <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-[var(--color-paper-faint)]">{link.url}</p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(link.url)}
                    className="shrink-0 text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]"
                    aria-label="Copy tracking link"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
