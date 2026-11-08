import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { Link } from 'react-router'
import ThemeToggle from '../ui/ThemeToggle'
import GlobalSearch from './GlobalSearch'
import { getTrackingAlerts, logoutBusiness } from '../../lib/api'
import { relativeTime } from '../../lib/formatDate'
import { ROUTES } from '../../lib/routes'

function initials(name = '') {
  const letters = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
  return letters || 'T'
}

export default function Topbar({ companyName, onMenuClick }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [alerts, setAlerts] = useState([])

  const handleSignOut = async () => {
    await logoutBusiness().catch(() => undefined)
    navigate(ROUTES.businessLogin)
  }

  useEffect(() => {
    let cancelled = false
    const load = () =>
      getTrackingAlerts()
        .then((result) => {
          if (!cancelled) setAlerts(result.alerts ?? [])
        })
        .catch(() => undefined)
    load()
    const timer = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const alertText = (alert) => {
    const tracking = alert.payload?.trackingId
    switch (alert.eventType) {
      case 'order.created':
        return `New order${tracking ? ` ${tracking}` : ''} received`
      case 'order.delivered':
        return `Delivery${tracking ? ` ${tracking}` : ''} completed`
      case 'rider.assignment.accepted':
        return 'A rider accepted a dispatch'
      case 'rider.assignment.rejected':
        return 'A rider declined a dispatch'
      case 'route.delay_reported':
        return 'A rider reported a delay'
      case 'route.off_route':
        return 'A rider appears to be off route'
      default:
        return 'Route update'
    }
  }

  // Global hotkeys: "/" or ⌘K/Ctrl+K opens search (when not already typing).
  useEffect(() => {
    const onKey = (event) => {
      const typingField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName)
        || event.target?.isContentEditable
      if (event.key === '/' && !typingField) {
        event.preventDefault()
        setSearchOpen(true)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/90 backdrop-blur-xl">
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="mx-auto flex h-[4.5rem] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-paper-dim)] hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={19} />
        </button>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-9 min-w-0 max-w-md flex-1 items-center gap-2.5 rounded-lg border border-transparent bg-[var(--color-ink-deep)] pl-3.5 pr-3 text-left text-xs text-[var(--color-paper-faint)] transition-colors hover:border-[var(--color-route-cyan)] lg:flex"
          aria-label="Search trips, drivers, tracking IDs"
        >
          <Search size={15} />
          <span className="flex-1 truncate">Search trips, drivers, tracking IDs</span>
          <kbd className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--color-paper-faint)]">
            /
          </kbd>
        </button>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-paper-dim)] hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)] lg:hidden"
          aria-label="Search"
        >
          <Search size={17} />
        </button>

        <nav className="ml-auto hidden h-full items-center gap-7 lg:flex" aria-label="Dashboard previews">
          {[
            ['Business', ROUTES.businessDashboard],
            ['Rider', ROUTES.riderDashboard],
            ['Customer', ROUTES.customerDashboard],
          ].map(([item, to]) => (
            <Link
              key={item}
              to={to}
              aria-current={item === 'Business' ? 'page' : undefined}
              className={`relative flex h-full items-center text-xs transition-colors ${
                item === 'Business'
                  ? 'font-medium text-[var(--color-paper)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--color-dispatch-orange)]'
                  : 'text-[var(--color-paper-faint)] hover:text-[var(--color-paper)]'
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <ThemeToggle className="hidden sm:inline-flex" />
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((value) => !value)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-paper-dim)] hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]"
            aria-label={`Notifications${alerts.length ? `, ${alerts.length} unread` : ''}`}
            aria-expanded={notificationsOpen}
            data-tour="notifications"
          >
            <Bell size={17} />
            {alerts.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-dispatch-orange)]" />
            )}
          </button>
          <AnimatePresence>
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotificationsOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] shadow-2xl"
                >
                  <div className="border-b border-[var(--color-border-subtle)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--color-paper)]">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {!alerts.length ? (
                      <p className="px-4 py-6 text-center text-xs text-[var(--color-paper-faint)]">
                        Nothing new right now.
                      </p>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="border-b border-[var(--color-border-subtle)] px-4 py-3 last:border-0"
                        >
                          <p className="text-xs text-[var(--color-paper)]">{alertText(alert)}</p>
                          <p className="mt-1 text-[10px] text-[var(--color-paper-faint)]">
                            {relativeTime(alert.occurredAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] py-1.5 pl-1.5 pr-2 text-sm text-[var(--color-paper)] transition-colors hover:border-[var(--color-paper-dim)]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--soft-fill)] font-mono text-xs font-semibold text-[var(--color-route-cyan)]">
              {initials(companyName)}
            </span>
            <span className="hidden max-w-[8rem] truncate xl:inline">{companyName || 'Your Business'}</span>
            <ChevronDown size={14} className="text-[var(--color-paper-faint)]" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-1.5 shadow-2xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-paper-dim)] transition-colors hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </header>
  )
}
