import { useEffect, useMemo, useState } from 'react'
import { BarChart3, RefreshCw, Star, TrendingUp, Wallet } from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import { getAnalytics } from '../../../lib/api'
import { humanDateTime } from '../../../lib/formatDate'

function money(minor) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format((Number(minor) || 0) / 100)
}

function Metric({ label, value, hint, icon: Icon, tone = 'cyan' }) {
  const tones = {
    cyan: 'bg-[var(--color-route-cyan)]/10 text-[var(--color-route-cyan)]',
    emerald: 'bg-[var(--color-emerald)]/10 text-[var(--color-mint)]',
    orange: 'bg-[var(--color-dispatch-orange)]/10 text-[var(--color-dispatch-orange)]',
  }
  return (
    <div className="dashboard-panel rounded-xl p-5">
      <div className="flex items-center justify-between text-[var(--color-paper-faint)]">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-[var(--color-paper)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-paper-dim)]">{hint}</p>
    </div>
  )
}

export default function Reports() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setBusy(true)
    setError('')
    try {
      setData(await getAnalytics())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dailyMax = useMemo(
    () => Math.max(1, ...(data?.daily ?? []).map((day) => day.revenueMinor)),
    [data],
  )

  if (!data && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  const financial = data?.financial
  const performance = data?.performance

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-route-cyan)]">
            Business reports <span className="text-[var(--color-paper-faint)]">·</span>
            <span className="text-[var(--color-dispatch-orange)]">{financial?.deliveredCount ?? 0} delivered</span>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Analytics
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-[var(--color-paper-dim)]">
            Revenue, pay-on-delivery collections, delivery performance and rider results.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} disabled={busy}>
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> Refresh
        </Button>
      </header>

      {error && <Alert tone="error">{error}</Alert>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Revenue"
          value={money(financial?.revenueMinor)}
          hint={`${financial?.deliveredCount ?? 0} completed deliveries`}
          icon={TrendingUp}
          tone="emerald"
        />
        <Metric
          label="Pending PoD"
          value={money(financial?.pendingPodMinor)}
          hint={`${financial?.podCount ?? 0} pay-on-delivery collections`}
          icon={Wallet}
          tone="orange"
        />
        <Metric
          label="Success rate"
          value={`${performance?.successRate ?? 0}%`}
          hint={`${financial?.unsuccessfulCount ?? 0} failed or cancelled`}
          icon={BarChart3}
          tone="cyan"
        />
        <Metric
          label="Avg delivery time"
          value={performance?.averageDeliveryMinutes != null ? `${performance.averageDeliveryMinutes} min` : '—'}
          hint={
            performance?.etaAccuracyMinutes != null
              ? `ETA accuracy ±${performance.etaAccuracyMinutes} min`
              : 'ETA accuracy accrues with live pings'
          }
          icon={BarChart3}
          tone="cyan"
        />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_1fr]">
        <section className="dashboard-panel rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-paper)]">Revenue — last 14 days</h2>
          {!data?.daily?.length ? (
            <p className="mt-4 text-xs text-[var(--color-paper-faint)]">No completed deliveries in this window yet.</p>
          ) : (
            <div className="mt-5 flex h-40 items-end gap-2">
              {data.daily.map((day) => (
                <div key={day.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[9px] tabular-nums text-[var(--color-paper-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                    {money(day.revenueMinor)}
                  </span>
                  <div
                    className="w-full rounded-t bg-[var(--color-route-cyan)]/70 transition-colors group-hover:bg-[var(--color-route-cyan)]"
                    style={{ height: `${Math.max(4, (day.revenueMinor / dailyMax) * 100)}%` }}
                    title={`${day.date}: ${money(day.revenueMinor)} · ${day.deliveries} deliveries`}
                  />
                  <span className="truncate text-[9px] text-[var(--color-paper-faint)]">
                    {new Date(`${day.date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[var(--color-paper)]">Customer feedback</h2>
          <div className="mt-4 flex items-end gap-6">
            <div>
              <p className="flex items-center gap-1.5 text-3xl font-bold text-[var(--color-paper)]">
                <Star size={22} className="text-[var(--color-dispatch-orange)]" fill="currentColor" />
                {data?.feedback?.averageRating ?? '—'}
              </p>
              <p className="mt-1 text-xs text-[var(--color-paper-faint)]">
                {data?.feedback?.ratingCount ?? 0} ratings
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-[var(--color-paper)]">
                {money(data?.feedback?.tipsMinor)}
              </p>
              <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Tips received</p>
            </div>
          </div>
          <p className="mt-4 border-t border-[var(--color-border-subtle)] pt-3 text-xs text-[var(--color-paper-dim)]">
            Ratings and tips come from the customer tracking page after delivery.
          </p>
        </section>
      </div>

      <section className="dashboard-panel overflow-hidden rounded-xl">
        <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--color-paper)]">Rider performance</h2>
        </div>
        {!data?.drivers?.length ? (
          <p className="p-5 text-xs text-[var(--color-paper-faint)]">No rider data yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] text-[10px] uppercase tracking-wide text-[var(--color-paper-faint)]">
                <th className="px-5 py-3 font-medium">Rider</th>
                <th className="px-5 py-3 font-medium">Completed stops</th>
                <th className="px-5 py-3 font-medium">Active stops</th>
              </tr>
            </thead>
            <tbody>
              {data.drivers.map((driver) => (
                <tr key={driver.riderId} className="border-b border-[var(--color-border-subtle)] last:border-0">
                  <td className="px-5 py-3 text-[var(--color-paper)]">{driver.riderName}</td>
                  <td className="px-5 py-3 tabular-nums text-[var(--color-paper-dim)]">{driver.completed}</td>
                  <td className="px-5 py-3 tabular-nums text-[var(--color-paper-dim)]">{driver.active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dashboard-panel overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--color-paper)]">Recent transactions</h2>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-paper-faint)]">Last 50</span>
        </div>
        {!data?.transactions?.length ? (
          <p className="p-5 text-xs text-[var(--color-paper-faint)]">No completed transactions yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] text-[10px] uppercase tracking-wide text-[var(--color-paper-faint)]">
                <th className="px-5 py-3 font-medium">Tracking ID</th>
                <th className="px-5 py-3 font-medium">Recipient</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr key={tx.orderId} className="border-b border-[var(--color-border-subtle)] last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-[var(--color-paper)]">{tx.trackingId}</td>
                  <td className="px-5 py-3 text-[var(--color-paper-dim)]">{tx.recipientName}</td>
                  <td className="px-5 py-3">
                    <Badge tone={tx.paymentType === 'pay_on_delivery' ? 'orange' : 'neutral'}>
                      {tx.paymentType === 'pay_on_delivery' ? 'PoD' : 'Prepaid'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 tabular-nums text-[var(--color-paper)]">{money(tx.amountMinor)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-[var(--color-paper-dim)]">
                    {tx.completedAt ? humanDateTime(tx.completedAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
