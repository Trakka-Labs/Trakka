import { useCallback, useEffect, useRef, useState } from 'react'
import { Copy, Link2, MessageSquareText, RefreshCw, Send, UserRound } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/dashboard/EmptyState'
import Loader from '../../../components/ui/Loader'
import {
  createRiderRouteAccess,
  getBusinessRouteMessages,
  getCommunicationRoutes,
  sendBusinessRouteMessage,
} from '../../../lib/api'
import { riderRouteMessagesRoute } from '../../../lib/routes'

function time(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(new Date(value))
}

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
  const endRef = useRef(null)

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
    loadConversation()
  }, [loadConversation])

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadRoutes().catch(() => {})
      loadConversation(true)
    }, 4_000)
    return () => window.clearInterval(interval)
  }, [loadConversation, loadRoutes])

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
      const url = new URL(riderRouteMessagesRoute(selectedId), window.location.origin)
      url.hash = new URLSearchParams({ access: access.token }).toString()
      setAccessLink(url.toString())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const copyAccess = async () => {
    await navigator.clipboard.writeText(accessLink)
    setBusy('copied')
    window.setTimeout(() => setBusy(''), 1500)
  }

  if (!routes && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

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
              {routes?.map((route) => (
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
                    {route.routeRunId.slice(0, 12)} · {time(route.lastMessageAt || route.createdAt)}
                  </p>
                </button>
              ))}
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
                  {!conversation.messages.length && (
                    <div className="grid min-h-72 place-items-center text-center">
                      <div>
                        <MessageSquareText className="mx-auto text-[var(--color-paper-faint)]" size={24} />
                        <p className="mt-3 text-sm text-[var(--color-paper-dim)]">Start the route conversation.</p>
                        <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Generate a rider-access link so the assigned driver can reply.</p>
                      </div>
                    </div>
                  )}
                  {conversation.messages.map((message) => {
                    const mine = message.senderType === 'business'
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] rounded-lg px-4 py-3 ${
                          mine ? 'bg-[var(--color-route-cyan)] text-white' : 'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]'
                        }`}>
                          <p className={`text-[10px] font-medium ${mine ? 'text-white/70' : 'text-[var(--color-paper-faint)]'}`}>{message.senderName}</p>
                          <p className={`mt-1 whitespace-pre-wrap text-sm leading-5 ${mine ? 'text-white' : 'text-[var(--color-paper)]'}`}>{message.body}</p>
                          <p className={`mt-2 text-right font-mono text-[9px] ${mine ? 'text-white/60' : 'text-[var(--color-paper-faint)]'}`}>{time(message.createdAt)}</p>
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
    </div>
  )
}
