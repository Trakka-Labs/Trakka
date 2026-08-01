import { useCallback, useEffect, useRef, useState } from 'react'
import { Bike, MessageSquareText, Send } from 'lucide-react'
import { useParams } from 'react-router'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Logo from '../../components/ui/Logo'
import { getRiderRouteMessages, sendRiderRouteMessage } from '../../lib/api'

const QUICK_REPLIES = ['Traffic delay', 'Road blocked', 'Wrong address', 'I need assistance']

function time(value) {
  return new Intl.DateTimeFormat('en-NG', { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export default function RiderRouteMessages() {
  const { routeRunId } = useParams()
  const [token] = useState(() => {
    const storageKey = `trakka-rider-route-access:${routeRunId}`
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get('access')
    if (fragmentToken) sessionStorage.setItem(storageKey, fragmentToken)
    return fragmentToken || sessionStorage.getItem(storageKey) || ''
  })
  const [conversation, setConversation] = useState(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (!window.location.hash) return
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
  }, [])

  const load = useCallback(async (quiet = false) => {
    try {
      setConversation(await getRiderRouteMessages(routeRunId, token))
      if (!quiet) setError('')
    } catch (err) {
      if (!quiet) setError(err.message)
    }
  }, [routeRunId, token])

  useEffect(() => {
    load()
    const interval = window.setInterval(() => load(true), 4_000)
    return () => window.clearInterval(interval)
  }, [load])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages.length])

  const send = async (event, quickReply) => {
    event?.preventDefault()
    const body = (quickReply || draft).trim()
    if (!body) return
    setSending(true)
    try {
      setConversation(await sendRiderRouteMessage(routeRunId, token, body, crypto.randomUUID()))
      setDraft('')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5"><Logo size={27} /><span className="font-semibold text-[var(--color-paper)]">Trakka</span></div>
          <span className="flex items-center gap-2 text-xs text-[var(--color-paper-faint)]"><Bike size={14} /> Rider route</span>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-2xl flex-col px-3 py-4 sm:px-5">
        {error && <Alert tone="error" className="mb-4">{error}</Alert>}
        {!conversation && !error && <div className="grid flex-1 place-items-center"><Loader size={28} /></div>}
        {conversation && (
          <section className="dashboard-panel flex min-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden rounded-lg">
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
                  <button key={reply} type="button" disabled={sending} onClick={() => send(null, reply)} className="shrink-0 rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs text-[var(--color-paper-dim)] hover:border-[var(--color-route-cyan)]">
                    {reply}
                  </button>
                ))}
              </div>
              <form onSubmit={send} className="flex gap-2">
                <label htmlFor="rider-route-message" className="sr-only">Message dispatch</label>
                <textarea id="rider-route-message" rows={2} maxLength={1000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message dispatch…" className="min-h-12 flex-1 resize-none rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-3 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]" />
                <Button type="submit" size="sm" disabled={!draft.trim() || sending} aria-label="Send message">{sending ? <Loader size={15} /> : <Send size={16} />}</Button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
