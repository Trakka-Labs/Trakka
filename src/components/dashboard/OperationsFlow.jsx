import { MapPin, Package, Truck } from 'lucide-react'
import EmptyState from './EmptyState'

export default function OperationsFlow({ metrics, trips }) {
  if (!trips.length) {
    return (
      <section className="dashboard-panel flex min-h-[360px] items-center justify-center rounded-lg p-6">
        <EmptyState
          icon={Package}
          title="No delivery flow yet"
          description="Create a delivery to start building today’s local operations view."
        />
      </section>
    )
  }

  return (
    <section className="dashboard-panel min-h-[360px] rounded-lg p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-[var(--color-route-cyan)]">Local dispatch data</p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--color-paper)]">
            Current delivery flow
          </h2>
        </div>
        <span className="text-[10px] text-[var(--color-paper-faint)]">{metrics.active} active</span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {trips.map((trip) => (
          <article
            key={trip.id}
            className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-center gap-2 text-[var(--color-route-cyan)]">
              {trip.status === 'ready_for_dispatch' ? <Package size={15} /> : <Truck size={15} />}
              <span className="font-mono text-[10px]">{trip.id}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--color-paper)]">{trip.receiver}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-paper-faint)]">
              <MapPin size={12} /> {trip.driver}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
