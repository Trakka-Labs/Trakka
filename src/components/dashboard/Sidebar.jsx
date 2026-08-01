import { Link, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, LayoutDashboard, MessageSquareText, Package, Route as RouteIcon, Settings, Users, Wallet, X } from 'lucide-react'
import Logo from '../ui/Logo'
import { ROUTES } from '../../lib/routes'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.businessDashboard },
  { label: 'Deliveries', icon: Package, to: ROUTES.businessDeliveries, matchChildren: true },
  { label: 'Dispatch', icon: RouteIcon, to: ROUTES.businessDispatch },
  { label: 'Drivers', icon: Users, to: ROUTES.businessDrivers },
  { label: 'Communications', icon: MessageSquareText, to: ROUTES.businessCommunications },
  { label: 'Payments', icon: Wallet },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

function NavList({ onNavigate }) {
  const location = useLocation()

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        if (item.to) {
          const isActive = item.matchChildren
            ? location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
            : location.pathname === item.to
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/[0.06] text-[var(--color-paper)]'
                  : 'text-[var(--color-paper-faint)] hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]'
              }`}
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 flex-col overflow-hidden border-r border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 py-6 backdrop-blur-xl lg:flex">
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
