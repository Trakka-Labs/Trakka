import { motion } from 'framer-motion'
import { Activity, CheckCircle2, CreditCard, PackageCheck, UserCheck } from 'lucide-react'
import EmptyState from './EmptyState'

const ICONS = {
  trip_assigned: UserCheck,
  delivery_completed: PackageCheck,
  payment_received: CreditCard,
  driver_accepted: CheckCircle2,
}

const TONES = {
  trip_assigned: 'bg-[var(--color-route-cyan)]/12 text-[var(--color-route-cyan)]',
  delivery_completed: 'bg-[var(--color-emerald)]/15 text-[var(--color-mint)]',
  payment_received: 'bg-[var(--color-dispatch-orange)]/12 text-[var(--color-dispatch-orange-bright)]',
  driver_accepted: 'bg-[var(--color-emerald)]/15 text-[var(--color-mint)]',
}

export default function RecentActivity({ activity }) {
  if (!activity.length) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Activity will appear here once your operations begin."
      />
    )
  }

  return (
    <ol className="flex flex-col gap-1 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3">
      {activity.map((item, i) => {
        const Icon = ICONS[item.type] || CheckCircle2
        const tone = TONES[item.type] || 'bg-white/5 text-[var(--color-paper-dim)]'
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.02]"
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
              <Icon size={14} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-[var(--color-paper)]">{item.message}</p>
              <p className="mt-0.5 text-xs text-[var(--color-paper-faint)]">{item.time}</p>
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
