import { useEffect, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/dashboard/EmptyState'
import { ActivityTimeline } from '../../../components/dashboard/RecentActivity'
import Loader from '../../../components/ui/Loader'
import Pagination from '../../../components/ui/Pagination'
import { getActivityFeed } from '../../../lib/api'
import { relativeTime } from '../../../lib/formatDate'

const PAGE_SIZE = 20


/**
 * Full "Recent activity" page — the complete status-history stream with the
 * same timeline language as the dashboard preview, plus pagination.
 */
export default function ActivityFeed() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async (targetPage = page) => {
    setBusy(true)
    setError('')
    try {
      setData(await getActivityFeed({ page: targetPage, pageSize: PAGE_SIZE }))
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

  const activity = (data?.activity || []).map((item) => ({
    ...item,
    time: relativeTime(item.createdAt),
  }))

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-route-cyan)]">
            Operations stream <span className="text-[var(--color-paper-faint)]">·</span>
            <span className="text-[var(--color-dispatch-orange)]">{data?.total ?? 0} events</span>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Recent activity
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-[var(--color-paper-dim)]">
            Every status transition across your deliveries, newest first.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => load()} disabled={busy}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      {!activity.length && !error ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here once your operations begin."
        />
      ) : (
        <>
          <section
            aria-busy={busy}
            className={`dashboard-panel rounded-2xl p-6 ${busy ? 'opacity-60' : ''}`}
          >
            <ActivityTimeline activity={activity} />
          </section>
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
