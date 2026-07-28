import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export default function QuickActions({ actions }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <motion.button
            key={action.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
            className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 text-left transition-colors duration-300 hover:border-[var(--color-route-cyan)]/40"
          >
            <span className="absolute right-4 top-4 rounded-full border border-[var(--color-border-subtle)] bg-white/5 px-2 py-0.5 font-mono text-[10px] tracking-wide text-[var(--color-paper-faint)]">
              Coming Soon
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-route-cyan)]/12 text-[var(--color-route-cyan)]">
              {Icon && <Icon size={19} aria-hidden="true" />}
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-[var(--color-paper)]">{action.label}</p>
              <p className="mt-1 text-xs text-[var(--color-paper-faint)]">{action.description}</p>
            </div>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-paper-faint)] transition-colors group-hover:text-[var(--color-route-cyan)]">
              Open <ArrowUpRight size={13} />
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
