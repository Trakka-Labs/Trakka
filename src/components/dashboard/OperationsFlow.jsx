import { Link } from 'react-router'
import { ArrowRight, Package } from 'lucide-react'
import EmptyState from './EmptyState'
import DeliveryFlowCard from './DeliveryFlowCard'
import { ROUTES } from '../../lib/routes'

/**
 * "Current delivery flow" section. Shows a preview of the newest trips
 * (default two) with a "View more" link to the full delivery-flow page.
 */
export default function OperationsFlow({ metrics, trips, total = trips.length, onAssigned }) {
  if (!trips.length) {
    return (
      <section className="dashboard-panel flex min-h-[360px] items-center justify-center rounded-2xl border-[var(--color-border-subtle)] p-6">
        <EmptyState
          icon={Package}
          title="No delivery flow yet"
          description="Create a delivery to start building today’s local operations view."
        />
      </section>
    )
  }

  const active = trips.filter((trip) => trip.status !== 'delivered').length

  return (
    <section className="dashboard-panel rounded-2xl border-[var(--color-border-subtle)] p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-route-cyan)]">
            Local dispatch data
          </div>
          <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[var(--color-paper)]">
            Current delivery flow
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-emerald)]/20 bg-[var(--color-emerald)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-mint)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mint)]" />
            {active} active {active === 1 ? 'dispatch' : 'dispatches'}
          </span>
          {total > trips.length && (
            <Link
              to={ROUTES.businessDeliveryFlow}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-dispatch-orange)] hover:text-[var(--color-dispatch-orange-bright)]"
            >
              View more <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {trips.map((trip) => (
          <DeliveryFlowCard key={trip.id} trip={trip} onAssigned={onAssigned} />
        ))}
      </div>

      {metrics?.active > trips.length && (
        <p className="mt-4 text-center text-[11px] text-[var(--color-paper-faint)]">
          +{metrics.active - trips.length} more in transit not shown
        </p>
      )}
    </section>
  )
}
