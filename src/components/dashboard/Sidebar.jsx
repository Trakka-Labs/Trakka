import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, LayoutDashboard, Package, Route as RouteIcon, Settings, Users, Wallet, X } from 'lucide-react'
import Logo from '../ui/Logo'
import { ROUTES } from '../../lib/routes'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.businessDashboard, active: true },
  { label: 'Deliveries', icon: Package },
  { label: 'Dispatch', icon: RouteIcon },
  { label: 'Drivers', icon: Users },
  { label: 'Payments', icon: Wallet },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        if (item.active) {
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-sm font-medium text-[var(--color-paper)]"
            >
              <Icon size={17} aria-hidden="true" />
              {item.label}
            </Link>
          )
        }
        return (
          <div
            key={item.label}
            aria-disabled="true"
            className="flex cursor-not-allowed items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-paper-faint)]"
          >
            <span className="flex items-center gap-3">
              <Icon size={17} aria-hidden="true" />
              {item.label}
            </span>
            <span className="rounded-full border border-[var(--color-border-subtle)] px-2 py-0.5 font-mono text-[9px] tracking-wide">
              SOON
            </span>
          </div>
        )
      })}
    </nav>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface)]/60 py-6 lg:flex">
      <Link to={ROUTES.home} className="mb-8 flex items-center gap-2.5 px-6">
        <Logo size={28} />
        <span className="font-display text-lg font-semibold text-[var(--color-paper)]">Trakka</span>
      </Link>
      <NavList />
    </aside>
  )
}

export function MobileDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-6 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="mb-8 flex items-center justify-between px-6">
              <Link to={ROUTES.home} className="flex items-center gap-2.5" onClick={onClose}>
                <Logo size={28} />
                <span className="font-display text-lg font-semibold text-[var(--color-paper)]">Trakka</span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-paper-dim)] hover:bg-white/5 hover:text-[var(--color-paper)]"
              >
                <X size={18} />
              </button>
            </div>
            <NavList onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
