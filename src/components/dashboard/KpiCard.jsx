import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

const TONE_CLASSES = {
  cyan: 'bg-[var(--color-route-cyan)]/12 text-[var(--color-route-cyan)]',
  orange: 'bg-[var(--color-dispatch-orange)]/12 text-[var(--color-dispatch-orange-bright)]',
  emerald: 'bg-[var(--color-emerald)]/15 text-[var(--color-mint)]',
  mint: 'bg-[var(--color-mint)]/12 text-[var(--color-mint)]',
  neutral: 'bg-white/5 text-[var(--color-paper-dim)]',
}

export default function KpiCard({ label, value, helper, trend, trendDirection, icon: Icon, tone = 'cyan', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      className="rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 transition-colors duration-300 hover:border-[var(--color-paper-dim)]/40"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${TONE_CLASSES[tone]}`}>
          {Icon && <Icon size={19} aria-hidden="true" />}
        </span>
        {typeof trend === 'number' && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono ${
              trendDirection === 'up'
                ? 'bg-[var(--color-mint)]/10 text-[var(--color-mint)]'
                : 'bg-[var(--color-dispatch-orange)]/10 text-[var(--color-dispatch-orange-bright)]'
            }`}
          >
            {trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-5 font-display text-3xl font-semibold text-[var(--color-paper)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--color-paper-dim)]">{label}</p>
      {helper && <p className="mt-3 text-xs text-[var(--color-paper-faint)]">{helper}</p>}
    </motion.div>
  )
}
