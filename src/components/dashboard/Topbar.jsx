import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react'
import { clearSession } from '../../lib/session'
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

  const handleSignOut = () => {
    clearSession()
    navigate(ROUTES.home)
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-ink)]/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-paper-dim)] hover:bg-white/5 hover:text-[var(--color-paper)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={19} />
        </button>
        <span className="font-display text-sm font-semibold text-[var(--color-paper)] sm:text-base">Dashboard</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-paper-dim)] hover:bg-white/5 hover:text-[var(--color-paper)]"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-dispatch-orange)]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] py-1.5 pl-1.5 pr-3 text-sm text-[var(--color-paper)] transition-colors hover:border-[var(--color-paper-dim)]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-emerald)]/20 font-mono text-xs font-semibold text-[var(--color-mint)]">
              {initials(companyName)}
            </span>
            <span className="hidden max-w-[10rem] truncate sm:inline">{companyName || 'Your Business'}</span>
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
                  className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-1.5 shadow-2xl"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--color-paper-dim)] transition-colors hover:bg-white/5 hover:text-[var(--color-paper)]"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
