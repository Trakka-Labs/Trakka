import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, Package, Plus, RefreshCw } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/dashboard/EmptyState'
import { STATUS_META } from '../../../lib/dashboardConfig'
import { getDeliveries, getDrivers } from '../../../lib/api'
import Pagination from '../../../components/ui/Pagination'
import { businessDeliveryDetailsRoute, ROUTES } from '../../../lib/routes'
import { humanDate } from '../../../lib/formatDate'

function formatNaira(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
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
                {humanDate(delivery.requestedDate)}
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
                  {humanDate(delivery.requestedDate)}
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

const FILTER_STATUSES = [
  'ready_for_dispatch',
  'assigned',
  'accepted',
  'pickup_in_progress',
  'picked_up',
  'in_transit',
  'arriving',
  'delivered',
  'failed',
  'returned',
  'cancelled',
]

const EMPTY_FILTERS = { status: '', driverId: '', serviceType: '', from: '', to: '' }

export default function Deliveries() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [deliveries, setDeliveries] = useState(null)
  const [total, setTotal] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [drivers, setDrivers] = useState([])

  useEffect(() => {
    getDrivers({ page: 1, pageSize: 100 })
      .then((result) => setDrivers(result.drivers ?? []))
      .catch(() => setDrivers([]))
  }, [])

  const loadDeliveries = async (targetPage = page, activeFilters = filters) => {
    setError('')
    setBusy(true)
    try {
      const result = await getDeliveries({
        page: targetPage,
        pageSize,
        ...activeFilters,
      })
      setDeliveries(result.deliveries)
      setTotal(result.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadDeliveries(page, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters])

  const updateFilter = (key, value) => {
    setPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div>
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">Delivery register</p>
          <h1 className="mt-1 text-3xl font-medium tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Deliveries
          </h1>
          <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
            {deliveries
              ? `${total || deliveries.length} ${(total || deliveries.length) === 1 ? 'delivery' : 'deliveries'}`
              : 'All business deliveries'}
          </p>
        </div>
        <Button as={Link} to={ROUTES.businessCreateDelivery} size="sm" className="self-start">
          <Plus size={15} aria-hidden="true" /> Create delivery
        </Button>
      </header>

      {error && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Alert className="flex-1">{error}</Alert>
          <Button type="button" variant="secondary" size="sm" onClick={() => loadDeliveries()}>
            <RefreshCw size={14} aria-hidden="true" /> Retry
          </Button>
        </div>
      )}

      <section className="dashboard-panel mb-5 rounded-lg p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="block text-xs text-[var(--color-paper-faint)]">
            Status
            <select
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
              className="mt-1 w-full rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
            >
              <option value="">All statuses</option>
              {FILTER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusMeta(status).label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--color-paper-faint)]">
            Driver
            <select
              value={filters.driverId}
              onChange={(event) => updateFilter('driverId', event.target.value)}
              className="mt-1 w-full rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
            >
              <option value="">All drivers</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--color-paper-faint)]">
            Service
            <select
              value={filters.serviceType}
              onChange={(event) => updateFilter('serviceType', event.target.value)}
              className="mt-1 w-full rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
            >
              <option value="">All service types</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label className="block text-xs text-[var(--color-paper-faint)]">
            From
            <input
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter('from', event.target.value)}
              className="mt-1 w-full rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
            />
          </label>
          <label className="block text-xs text-[var(--color-paper-faint)]">
            To
            <div className="mt-1 flex gap-2">
              <input
                type="date"
                value={filters.to}
                onChange={(event) => updateFilter('to', event.target.value)}
                className="w-full rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-paper)] outline-none focus:border-[var(--color-route-cyan)]"
              />
              {hasFilters && (
                <Button size="sm" variant="ghost" onClick={() => { setPage(1); setFilters(EMPTY_FILTERS) }}>
                  Clear
                </Button>
              )}
            </div>
          </label>
        </div>
      </section>

      {!deliveries && !error && <DeliveryListSkeleton />}

      {deliveries?.length === 0 && !error && (
        <EmptyState
          icon={Package}
          title={hasFilters ? 'No deliveries match these filters' : 'No deliveries yet'}
          description={
            hasFilters
              ? 'Try clearing one or more filters to widen the register.'
              : 'Create your first delivery and Trakka generates the tracking ID for you.'
          }
          action={
            hasFilters ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPage(1)
                  setFilters(EMPTY_FILTERS)
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Link to={ROUTES.businessCreateDelivery}>
                <Button size="sm">
                  <Plus size={14} /> Create delivery
                </Button>
              </Link>
            )
          }
        />
      )}

      {deliveries?.length > 0 && (
        <section className="dashboard-panel overflow-hidden rounded-lg" aria-label="All deliveries">
          <div aria-busy={busy}>
            <DesktopTable
              deliveries={deliveries}
              onOpen={(deliveryId) => navigate(businessDeliveryDetailsRoute(deliveryId))}
            />
            <MobileList deliveries={deliveries} />
          </div>
          <div className="border-t border-[var(--color-border-subtle)] p-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(nextPage) => {
                setPage(nextPage)
                document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        </section>
      )}
    </div>
  )
}
