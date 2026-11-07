import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/dashboard/EmptyState'
import DeliveryFlowCard from '../../../components/dashboard/DeliveryFlowCard'
import Loader from '../../../components/ui/Loader'
import Pagination from '../../../components/ui/Pagination'
import { getDeliveryFlow } from '../../../lib/api'
import { Package } from 'lucide-react'

const PAGE_SIZE = 12

/**
 * Full "Current delivery flow" page — every delivery with its dispatch phase,
 * not just the two-card dashboard preview.
 */
export default function DeliveryFlow() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async (targetPage = page) => {
    setBusy(true)
    setError('')
    try {
      setData(await getDeliveryFlow({ page: targetPage, pageSize: PAGE_SIZE }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  if (!data && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  const trips = data?.trips || []

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-route-cyan)]">
            Dispatch phases <span className="text-[var(--color-paper-faint)]">·</span>
            <span className="text-[var(--color-dispatch-orange)]">{data?.total ?? 0} deliveries</span>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Current delivery flow
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-[var(--color-paper-dim)]">
            Every delivery in the current cycle with its live dispatch phase, driver and ETA.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => load()} disabled={busy}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      {!trips.length && !error ? (
        <EmptyState
          icon={Package}
          title="No deliveries in the flow"
          description="Create a delivery to start building the dispatch view."
        />
      ) : (
        <>
          <div aria-busy={busy} className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${busy ? 'opacity-60' : ''}`}>
            {trips.map((trip) => (
              <DeliveryFlowCard key={trip.id} trip={trip} onAssigned={() => load()} />
            ))}
          </div>
          <div className="dashboard-panel rounded-xl p-4">
            <Pagination
              page={data?.page ?? page}
              pageSize={data?.pageSize ?? PAGE_SIZE}
              total={data?.total ?? 0}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  )
}
