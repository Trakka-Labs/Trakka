import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { Activity, ArrowRight, Clock3, PackageCheck, UserCheck, CreditCard, CheckCircle2 } from 'lucide-react'
import EmptyState from './EmptyState'
import { ROUTES } from '../../lib/routes'

/**
 * "Recent activity" — mockup pattern: a vertical timeline with a connecting
 * line, per-event nodes (latest event highlighted in brand orange), and
 * elevated event cards carrying the message + relative time.
 *
 * The dashboard renders a two-item preview with a "View more" link; the full
 * activity page reuses `ActivityEvent` inside the same timeline shell.
 */
const ICONS = {
  order_created: Activity,
  trip_assigned: UserCheck,
  delivery_completed: PackageCheck,
  payment_received: CreditCard,
  driver_accepted: CheckCircle2,
}

export function ActivityEvent({ item, index }) {
  const Icon = ICONS[item.type] || Activity
  const latest = index === 0
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.05 }}
      className="group relative"
    >
      <div className={`absolute -left-[30px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-[var(--color-surface)] ${
        latest
          ? 'border-[var(--color-dispatch-orange)]'
          : 'border-[var(--color-border-subtle)]'
      }`}>
        <div className={`h-1.5 w-1.5 rounded-full ${
          latest ? 'bg-[var(--color-dispatch-orange)]' : 'bg-[var(--color-paper-faint)]'
        }`} />
      </div>

      <div className="rounded-xl border border-[var(--color-border-subtle)]/60 bg-[var(--color-surface-raised)]/50 p-3.5 transition-colors hover:border-[var(--color-paper-faint)]">
        <div className="flex items-start gap-2.5 text-xs font-semibold text-[var(--color-paper)]">
          <Icon size={14} className={`mt-0.5 shrink-0 ${latest ? 'text-[var(--color-dispatch-orange)]' : 'text-[var(--color-paper-faint)]'}`} />
          <span>{item.message}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-paper-faint)]">
          <Clock3 size={13} />
          <span>{item.time}</span>
        </div>
      </div>
    </motion.div>
  )
}

export function ActivityTimeline({ activity }) {
  return (
    <div className="relative space-y-6 pl-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-[var(--color-border-subtle)]">
      {activity.map((item, index) => (
        <ActivityEvent key={item.id} item={item} index={index} />
      ))}
    </div>
  )
}

export default function RecentActivity({ activity, total = activity.length }) {
  if (!activity.length) {
    return (
      <aside className="dashboard-panel rounded-2xl border-[var(--color-border-subtle)] p-6">
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here once your operations begin."
        />
      </aside>
    )
  }

  return (
    <aside className="dashboard-panel sticky top-24 rounded-2xl border-[var(--color-border-subtle)] p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[var(--color-paper)]">Recent activity</h2>
        {total > activity.length ? (
          <Link
            to={ROUTES.businessActivity}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-dispatch-orange)] hover:text-[var(--color-dispatch-orange-bright)]"
          >
            View more <ArrowRight size={13} />
          </Link>
        ) : (
          <span className="text-[11px] font-medium text-[var(--color-paper-faint)]">Live stream</span>
        )}
      </div>

      <ActivityTimeline activity={activity} />

      <div className="mt-6 border-t border-[var(--color-border-subtle)] pt-4 text-center">
        <span className="text-xs font-medium text-[var(--color-paper-faint)]">
          Newest events appear first
        </span>
      </div>
    </aside>
  )
}
