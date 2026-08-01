import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { Link } from 'react-router'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'
import { logoutBusiness } from '../../lib/api'
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

  const handleSignOut = async () => {
    await logoutBusiness().catch(() => undefined)
    navigate(ROUTES.businessLogin)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-paper-dim)] hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={19} />
        </button>
        <Link to={ROUTES.home} className="mr-2 flex shrink-0 items-center gap-2.5">
          <Logo size={28} />
          <span className="font-display text-lg font-semibold tracking-[-0.03em] text-[var(--color-paper)]">Trakka</span>
        </Link>

        <label className="relative hidden min-w-0 max-w-md flex-1 lg:block">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-paper-faint)]" />
          <input
            type="search"
            placeholder="Search trips, drivers, tracking IDs"
            className="h-9 w-full rounded-lg border border-transparent bg-[var(--color-ink-deep)] pl-10 pr-4 text-xs text-[var(--color-paper)] outline-none placeholder:text-[var(--color-paper-faint)] focus:border-[var(--color-route-cyan)]"
          />
        </label>

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
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-paper-dim)] hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]"
          aria-label="Notifications"
        >
          <Bell size={17} />
        </button>

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
