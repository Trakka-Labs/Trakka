import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import Badge from '../ui/Badge'
import EmptyState from './EmptyState'
import { STATUS_META } from '../../lib/mockDashboardData'

export default function TodaysTrips({ trips }) {
  if (!trips.length) {
    return (
      <EmptyState
        icon={Package}
        title="No trips scheduled for today"
        description="Trips will appear here once deliveries are created and assigned to drivers."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-[var(--color-border-subtle)] text-xs uppercase tracking-wide text-[var(--color-paper-faint)]">
            <th className="px-6 py-4 font-medium">Tracking ID</th>
            <th className="px-6 py-4 font-medium">Receiver</th>
            <th className="px-6 py-4 font-medium">Driver</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">ETA</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip, i) => {
            const meta = STATUS_META[trip.status]
            return (
              <motion.tr
                key={trip.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="border-b border-[var(--color-border-subtle)] text-sm transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4 font-mono text-xs text-[var(--color-paper)]">{trip.id}</td>
                <td className="px-6 py-4 text-[var(--color-paper)]">{trip.receiver}</td>
                <td className="px-6 py-4 text-[var(--color-paper-dim)]">{trip.driver}</td>
                <td className="px-6 py-4">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </td>
                <td className="px-6 py-4 text-[var(--color-paper-dim)]">{trip.eta}</td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>

      <div className="divide-y divide-[var(--color-border-subtle)] md:hidden">
        {trips.map((trip, i) => {
          const meta = STATUS_META[trip.status]
          return (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex flex-col gap-2 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--color-paper)]">{trip.id}</span>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </div>
              <p className="text-sm text-[var(--color-paper)]">{trip.receiver}</p>
              <div className="flex items-center justify-between text-xs text-[var(--color-paper-faint)]">
                <span>Driver: {trip.driver}</span>
                <span>{trip.eta}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
