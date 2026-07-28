import { motion } from 'framer-motion'

const TABS = [
  { key: 'signup', label: 'Sign up' },
  { key: 'login', label: 'Sign in' },
]

export default function AuthTabs({ mode, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Business authentication"
      className="relative grid grid-cols-2 rounded-full border border-[var(--color-border-subtle)] bg-white/[0.03] p-1"
    >
      {TABS.map((tab) => {
        const active = mode === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`relative z-10 rounded-full py-2.5 text-sm font-medium transition-colors duration-200 ${
              active ? 'text-[var(--color-ink)]' : 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]'
            }`}
          >
            {active && (
              <motion.span
                layoutId="auth-tab-pill"
                className="absolute inset-0 -z-10 rounded-full bg-[var(--color-paper)]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
