import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import EmptyState from './EmptyState'
import { STATUS_META } from '../../lib/dashboardConfig'
import { humanDate } from '../../lib/formatDate'

/**
 * "Recent deliveries" table — mockup pattern: bold uppercase 11px headers,
 * mono tracking IDs (hover → brand orange), status pills with a leading dot,
 * quiet ETA column. Renders bare (no outer card) — the parent page provides
 * the section panel.
 */
export default function TodaysTrips({ trips }) {
  if (!trips.length) {
    return (
      <div className="py-10">
        <EmptyState
          icon={Package}
          title="No trips scheduled for today"
          description="Trips will appear here once deliveries are created and assigned to drivers."
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-paper-faint)]">
            <th scope="col" className="pb-3 pr-4">Tracking ID</th>
            <th scope="col" className="px-4 pb-3">Receiver</th>
            <th scope="col" className="px-4 pb-3">Driver</th>
            <th scope="col" className="px-4 pb-3">Status</th>
            <th scope="col" className="pl-4 pb-3">ETA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-subtle)] text-xs">
          {trips.map((trip, i) => {
            const meta = STATUS_META[trip.status] || { label: trip.status, tone: 'neutral' }
            return (
              <motion.tr
                key={trip.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="group transition-colors hover:bg-[var(--soft-fill)]"
              >
                <td className="py-4 pr-4 font-mono font-medium text-[var(--color-paper)] transition-colors group-hover:text-[var(--color-dispatch-orange)]">
                  {trip.id}
                </td>
                <td className="px-4 py-4 font-medium text-[var(--color-paper)]">{trip.receiver}</td>
                <td className="px-4 py-4 text-[var(--color-paper-dim)]">
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--color-ink-deep)] px-2 py-0.5 text-[11px]">
                    {trip.driver}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <StatusPill tone={meta.tone} label={meta.label} />
                </td>
                <td className="py-4 pl-4 font-mono text-[11px] text-[var(--color-paper-dim)]">
                  {trip.eta === 'Delivered' ? 'Delivered' : humanDate(trip.eta)}
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const DOT_TONES = {
  emerald: 'bg-[var(--color-mint)]',
  orange: 'bg-[var(--color-dispatch-orange)]',
  cyan: 'bg-[var(--color-route-cyan)]',
  neutral: 'bg-[var(--color-paper-faint)]',
}

const PILL_TONES = {
  emerald: 'border-[var(--color-emerald)]/20 bg-[var(--color-emerald)]/10 text-[var(--color-mint)]',
  orange: 'border-[var(--color-dispatch-orange)]/20 bg-[var(--color-dispatch-orange)]/10 text-[var(--color-dispatch-orange)]',
  cyan: 'border-[var(--color-route-cyan)]/20 bg-[var(--color-route-cyan)]/10 text-[var(--color-route-cyan)]',
  neutral: 'border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] text-[var(--color-paper-dim)]',
}

export function StatusPill({ tone = 'neutral', label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${PILL_TONES[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONES[tone]}`} />
      {label}
    </span>
  )
}
