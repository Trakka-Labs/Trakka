import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Bike, CornerDownLeft, Loader, Package, Search } from 'lucide-react'
import { searchWorkspace } from '../../lib/api'
import { ROUTES, businessDeliveryDetailsRoute } from '../../lib/routes'
import { STATUS_META } from '../../lib/dashboardConfig'

const DEBOUNCE_MS = 250

/**
 * Global search across the business workspace, powered by the backend
 * `GET /search` endpoint (deliveries + drivers, tenant-scoped server-side).
 * Opens via the topbar search field, "/" or ⌘K/Ctrl+K.
 */
export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    deliveries: [],
    drivers: [],
    totalDeliveries: null,
    totalDrivers: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults({ deliveries: [], drivers: [], totalDeliveries: null, totalDrivers: null })
    setError('')
    setActiveIndex(0)
    // Focus after the open animation paints.
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => window.clearTimeout(timer)
  }, [open])

  // Debounced server-side search as the user types.
  useEffect(() => {
    const q = query.trim()
    if (!open || !q) {
      setLoading(false)
      setResults({ deliveries: [], drivers: [], totalDeliveries: null, totalDrivers: null })
      return undefined
    }
    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(() => {
      searchWorkspace(q, 6, 1)
        .then((data) => {
          if (cancelled) return
          setResults({
            deliveries: data.deliveries ?? [],
            drivers: data.drivers ?? [],
            totalDeliveries: data.totalDeliveries ?? null,
            totalDrivers: data.totalDrivers ?? null,
          })
          setError('')
        })
        .catch((err) => {
          if (cancelled) return
          setError(err.message)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, DEBOUNCE_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, open])

  // One derived structure drives both the row numbering shown on screen and
  // the keyboard navigation — no render-time mutation to stay in sync with.
  const flat = useMemo(() => [
    ...results.deliveries.map((d) => ({ kind: 'delivery', id: d.id, data: d })),
    ...results.drivers.map((d) => ({ kind: 'driver', id: d.id, data: d })),
  ], [results])
  const driverIndexOffset = results.deliveries.length

  useEffect(() => setActiveIndex(0), [query])

  const go = (item) => {
    if (!item) return
    onClose()
    if (item.kind === 'delivery') navigate(businessDeliveryDetailsRoute(item.id))
    else navigate(ROUTES.businessDrivers)
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') return onClose()
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      go(flat[activeIndex])
    }
  }

  // Keep the active row in view while arrowing through results.
  useEffect(() => {
    listRef.current
      ?.querySelectorAll('[data-search-row]')
      ?.[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search the workspace"
            className="fixed inset-x-4 top-[12vh] z-50 mx-auto max-w-xl overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] px-4">
              <Search size={17} className="shrink-0 text-[var(--color-paper-faint)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search tracking IDs, recipients, drivers…"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-[var(--color-paper)] outline-none placeholder:text-[var(--color-paper-faint)]"
              />
              {loading && <Loader size={15} className="shrink-0 animate-spin text-[var(--color-paper-faint)]" />}
              <kbd className="hidden shrink-0 rounded border border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-paper-faint)] sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {error && (
                <p className="px-3 py-6 text-center text-xs text-[var(--color-dispatch-orange)]">{error}</p>
              )}
              {!error && !query.trim() && (
                <div className="px-3 py-6 text-center">
                  <p className="text-xs text-[var(--color-paper-dim)]">Search across deliveries and drivers.</p>
                  <p className="mt-1 text-[11px] text-[var(--color-paper-faint)]">
                    Try a tracking ID (TRK-…), a recipient name, or a driver&apos;s name.
                  </p>
                </div>
              )}
              {!error && query.trim() && !loading && !flat.length && (
                <p className="px-3 py-6 text-center text-xs text-[var(--color-paper-faint)]">
                  No matches for “{query.trim()}”.
                </p>
              )}

              {!!results.deliveries.length && (
                <Group label="Deliveries">
                  {results.deliveries.map((delivery, position) => {
                    const index = position
                    const meta = STATUS_META[delivery.status] || { label: delivery.status, tone: 'neutral' }
                    return (
                      <Row
                        key={delivery.id}
                        active={index === activeIndex}
                        onSelect={() => go({ kind: 'delivery', id: delivery.id })}
                        onHover={() => setActiveIndex(index)}
                        icon={<Package size={15} />}
                      >
                        <span className="font-mono text-xs text-[var(--color-paper)]">{delivery.trackingId}</span>
                        <span className="text-xs text-[var(--color-paper-dim)]">
                          {delivery.recipientName} · {delivery.pickupNeighborhood}
                        </span>
                        <span className="ml-auto rounded-full bg-[var(--color-ink-deep)] px-2 py-0.5 text-[10px] text-[var(--color-paper-faint)]">
                          {meta.label}
                        </span>
                      </Row>
                    )
                  })}
                  {!loading && typeof results.totalDeliveries === 'number' && results.totalDeliveries > results.deliveries.length && (
                    <p className="px-3 pb-2 pt-1 text-[11px] text-[var(--color-paper-faint)]">
                      +{results.totalDeliveries - results.deliveries.length} more — refine your search
                    </p>
                  )}
                </Group>
              )}

              {!!results.drivers.length && (
                <Group label="Drivers">
                  {results.drivers.map((driver, position) => {
                    const index = driverIndexOffset + position
                    return (
                      <Row
                        key={driver.id}
                        active={index === activeIndex}
                        onSelect={() => go({ kind: 'driver', id: driver.id })}
                        onHover={() => setActiveIndex(index)}
                        icon={<Bike size={15} />}
                      >
                        <span className="text-xs font-medium text-[var(--color-paper)]">{driver.displayName}</span>
                        <span className="text-xs text-[var(--color-paper-dim)]">{driver.phone}</span>
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                          driver.available
                            ? 'bg-[var(--color-emerald)]/10 text-[var(--color-mint)]'
                            : 'bg-[var(--color-dispatch-orange)]/10 text-[var(--color-dispatch-orange)]'
                        }`}>
                          {driver.available ? 'AVAILABLE' : 'ASSIGNED'}
                        </span>
                      </Row>
                    )
                  })}
                  {!loading && typeof results.totalDrivers === 'number' && results.totalDrivers > results.drivers.length && (
                    <p className="px-3 pb-2 pt-1 text-[11px] text-[var(--color-paper-faint)]">
                      +{results.totalDrivers - results.drivers.length} more — refine your search
                    </p>
                  )}
                </Group>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-4 py-2.5 text-[10px] text-[var(--color-paper-faint)]">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] px-1 py-0.5 font-mono">↑↓</kbd>
                navigate
                <kbd className="ml-1 flex items-center gap-0.5 rounded border border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] px-1 py-0.5 font-mono">
                  <CornerDownLeft size={9} /> enter
                </kbd>
                open
              </span>
              <span>Deliveries · Drivers</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Group({ label, children }) {
  return (
    <section className="mb-1">
      <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-paper-faint)]">
        {label}
      </p>
      {children}
    </section>
  )
}

function Row({ active, onSelect, onHover, icon, children }) {
  return (
    <button
      type="button"
      data-search-row
      onClick={onSelect}
      onMouseMove={onHover}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active
          ? 'bg-[var(--soft-fill)] text-[var(--color-paper)]'
          : 'text-[var(--color-paper-dim)] hover:bg-[var(--soft-fill)]'
      }`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--color-ink-deep)] text-[var(--color-route-cyan)]">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
    </button>
  )
}
