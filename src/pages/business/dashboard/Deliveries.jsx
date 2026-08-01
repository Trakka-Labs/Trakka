import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, Package, Plus, RefreshCw } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/dashboard/EmptyState'
import { STATUS_META } from '../../../lib/dashboardConfig'
import { getDeliveries } from '../../../lib/api'
import { businessDeliveryDetailsRoute, ROUTES } from '../../../lib/routes'

function formatNaira(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function statusMeta(status) {
  return STATUS_META[status] || {
    label: status.replaceAll('_', ' '),
    tone: 'neutral',
  }
}

function DeliveryListSkeleton() {
  return (
    <div className="dashboard-panel overflow-hidden rounded-lg" aria-label="Loading deliveries">
      <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
        <div className="h-3 w-28 animate-pulse rounded bg-white/[0.07]" />
      </div>
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid gap-3 px-5 py-5 md:grid-cols-[1fr_1.2fr_1.4fr_0.8fr]">
            <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-3 w-full max-w-52 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  )
}

function DesktopTable({ deliveries, onOpen }) {
  return (
    <table className="hidden w-full text-left lg:table">
      <thead>
        <tr className="border-b border-[var(--color-border-subtle)] text-[10px] uppercase tracking-wide text-[var(--color-paper-faint)]">
          <th className="px-5 py-4 font-medium">Tracking ID</th>
          <th className="px-5 py-4 font-medium">Receiver</th>
          <th className="px-5 py-4 font-medium">Route</th>
          <th className="px-5 py-4 font-medium">Service</th>
          <th className="px-5 py-4 font-medium">Requested</th>
          <th className="px-5 py-4 font-medium">Fee</th>
          <th className="px-5 py-4 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {deliveries.map((delivery) => {
          const meta = statusMeta(delivery.status)
          return (
            <tr
              key={delivery.id}
              role="link"
              tabIndex={0}
              aria-label={`View delivery ${delivery.trackingId}`}
              onClick={() => onOpen(delivery.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpen(delivery.id)
                }
              }}
              className="cursor-pointer border-b border-[var(--color-border-subtle)] text-sm transition-colors last:border-0 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-route-cyan)]"
            >
              <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-[var(--color-paper)]">
                {delivery.trackingId}
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-[var(--color-paper)]">{delivery.recipientName}</p>
                <p className="mt-1 text-xs text-[var(--color-paper-faint)]">{delivery.recipientPhone}</p>
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-[var(--color-paper-dim)]">
                  {delivery.pickupNeighborhood}
                  <ArrowRight size={12} className="text-[var(--color-route-cyan)]" aria-hidden="true" />
                  {delivery.dropoffNeighborhood}
                </span>
              </td>
              <td className="px-5 py-4 text-xs capitalize text-[var(--color-paper-dim)]">
                {delivery.serviceType}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-paper-dim)]">
                {formatDate(delivery.requestedDate)}
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-[var(--color-paper)]">
                {formatNaira(delivery.deliveryFee)}
              </td>
              <td className="px-5 py-4">
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function MobileList({ deliveries }) {
  return (
    <div className="divide-y divide-[var(--color-border-subtle)] lg:hidden">
      {deliveries.map((delivery) => {
        const meta = statusMeta(delivery.status)
        return (
          <Link
            key={delivery.id}
            to={businessDeliveryDetailsRoute(delivery.id)}
            className="block p-5 transition-colors hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-route-cyan)]"
            aria-label={`View delivery ${delivery.trackingId}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs font-medium text-[var(--color-paper)]">
                {delivery.trackingId}
              </p>
              <Badge tone={meta.tone}>{meta.label}</Badge>
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--color-paper)]">
              {delivery.recipientName}
            </p>
            <p className="mt-1 text-xs text-[var(--color-paper-faint)]">{delivery.recipientPhone}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-paper-dim)]">
              <span>{delivery.pickupNeighborhood}</span>
              <ArrowRight size={12} className="text-[var(--color-route-cyan)]" aria-hidden="true" />
              <span>{delivery.dropoffNeighborhood}</span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--color-border-subtle)] pt-4">
              <div>
                <dt className="text-[10px] text-[var(--color-paper-faint)]">Service</dt>
                <dd className="mt-1 text-xs capitalize text-[var(--color-paper-dim)]">
                  {delivery.serviceType}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--color-paper-faint)]">Requested</dt>
                <dd className="mt-1 text-xs text-[var(--color-paper-dim)]">
                  {formatDate(delivery.requestedDate)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--color-paper-faint)]">Fee</dt>
                <dd className="mt-1 text-xs font-medium text-[var(--color-paper)]">
                  {formatNaira(delivery.deliveryFee)}
                </dd>
              </div>
            </dl>
          </Link>
        )
      })}
    </div>
  )
}

export default function Deliveries() {
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState(null)
  const [error, setError] = useState('')

  const loadDeliveries = async () => {
    setError('')
    try {
      setDeliveries(await getDeliveries())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadDeliveries()
  }, [])

  return (
    <div>
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">Delivery register</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Deliveries
          </h1>
          <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
            {deliveries ? `${deliveries.length} ${deliveries.length === 1 ? 'delivery' : 'deliveries'}` : 'All business deliveries'}
          </p>
        </div>
        <Button as={Link} to={ROUTES.businessCreateDelivery} size="sm" className="self-start">
          <Plus size={15} aria-hidden="true" /> Create delivery
        </Button>
      </header>

      {error && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Alert className="flex-1">{error}</Alert>
          <Button type="button" variant="secondary" size="sm" onClick={loadDeliveries}>
            <RefreshCw size={14} aria-hidden="true" /> Retry
          </Button>
        </div>
      )}

      {!deliveries && !error && <DeliveryListSkeleton />}

      {deliveries?.length === 0 && (
        <EmptyState
          icon={Package}
          title="No deliveries yet"
          description="Created deliveries will appear here in newest-first order."
        />
      )}

      {deliveries?.length > 0 && (
        <section className="dashboard-panel overflow-hidden rounded-lg" aria-label="All deliveries">
          <DesktopTable
            deliveries={deliveries}
            onOpen={(deliveryId) => navigate(businessDeliveryDetailsRoute(deliveryId))}
          />
          <MobileList deliveries={deliveries} />
        </section>
      )}
    </div>
  )
}
