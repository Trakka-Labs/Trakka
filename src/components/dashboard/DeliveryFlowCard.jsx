import { Link } from 'react-router'
import { MapPin, Package, Truck } from 'lucide-react'
import Badge from '../ui/Badge'
import AssignDriverModal from './AssignDriverModal'
import { STATUS_META } from '../../lib/dashboardConfig'
import { ORDER_STATUSES } from '../../lib/statuses'
import { businessDeliveryDetailsRoute } from '../../lib/routes'
import { humanDate } from '../../lib/formatDate'
import { useState } from 'react'

// Phases come from the shared order-status vocabulary; anything outside the
// ordered set (draft, terminal) can't be placed on a progress axis.
const PHASES = ORDER_STATUSES

function progressFor(status) {
  const index = PHASES.indexOf(status)
  if (index < 0) return null
  return `${Math.round(((index + 1) / PHASES.length) * 100)}%`
}

// Terminal non-progress statuses get a full-width marker instead of a healthy
// partial bar — red for failures/cancellations, neutral for returns.
const TERMINAL_PROGRESS = {
  cancelled: 'bg-[var(--color-paper-faint)]',
  failed: 'bg-[var(--color-dispatch-orange)]',
  returned: 'bg-[var(--color-paper-faint)]',
}

/**
 * One delivery-flow card: tracking chip, status pill, recipient, driver,
 * dispatch-phase progress, ETA and the assign action. Shared by the dashboard
 * section (first two) and the full delivery-flow page.
 */
export default function DeliveryFlowCard({ trip, onAssigned }) {
  const [assignOpen, setAssignOpen] = useState(false)
  const meta = STATUS_META[trip.status] || { label: trip.status, tone: 'neutral' }
  const progress = progressFor(trip.status)
  const terminalTone = TERMINAL_PROGRESS[trip.status]

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]/70 p-4 transition-all hover:border-[var(--color-paper-faint)]">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] px-2.5 py-1 font-mono text-xs text-[var(--color-paper-dim)] transition-colors group-hover:border-[var(--color-paper-faint)]">
            {trip.status === 'ready_for_dispatch'
              ? <Package size={13} className="text-[var(--color-dispatch-orange)]" />
              : <Truck size={13} className="text-[var(--color-dispatch-orange)]" />}
            {trip.id}
          </span>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>

        <div className="mb-3">
          <h3 className="text-base font-bold text-[var(--color-paper)]">{trip.receiver}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-paper-dim)]">
            <MapPin size={13} className="text-[var(--color-dispatch-orange)]/80" />
            <span>
              Driver:{' '}
              <strong className="font-medium text-[var(--color-paper)]">{trip.driver}</strong>
            </span>
          </div>
        </div>

        <div className="my-4 border-t border-[var(--color-border-subtle)]/60 pt-2">
          <div className="mb-1.5 flex justify-between text-[11px] font-medium text-[var(--color-paper-dim)]">
            <span>Dispatch phase</span>
            <span className="text-[var(--color-dispatch-orange)]">{meta.label}</span>
          </div>
          {terminalTone ? (
            <span
              className={`inline-block h-1.5 w-full rounded-full ${terminalTone}`}
              aria-label={meta.label}
            />
          ) : progress ? (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-ink-deep)]">
              <div
                className="h-full rounded-full bg-[var(--color-dispatch-orange)] transition-all"
                style={{ width: progress }}
              />
            </div>
          ) : (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-ink-deep)]">
              <div className="h-full w-0 rounded-full bg-[var(--color-dispatch-orange)]" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3">
        <span className="text-[11px] text-[var(--color-paper-dim)]">
          ETA:{' '}
          <span className="text-[var(--color-paper)]">
            {trip.eta === 'Delivered' ? 'Delivered' : humanDate(trip.eta)}
          </span>
        </span>
        {trip.status === 'ready_for_dispatch' ? (
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-dispatch-orange)] transition-colors hover:text-[var(--color-dispatch-orange-bright)]"
          >
            Assign driver →
          </button>
        ) : (
          <Link
            to={businessDeliveryDetailsRoute(trip.orderId)}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-dispatch-orange)] transition-colors hover:text-[var(--color-dispatch-orange-bright)]"
          >
            View details →
          </Link>
        )}
      </div>

      {assignOpen && (
        <AssignDriverModal
          delivery={trip}
          onClose={() => setAssignOpen(false)}
          onAssigned={onAssigned}
        />
      )}
    </article>
  )
}
