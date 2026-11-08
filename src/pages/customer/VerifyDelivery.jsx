import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle2, ShieldCheck, TriangleAlert } from 'lucide-react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Logo from '../../components/ui/Logo'
import { verifyDeliveryQr } from '../../lib/api'
import { ROUTES } from '../../lib/routes'

/**
 * Public QR confirmation page. The customer scans the rider's QR code and
 * lands here; the token is exchanged for a one-time delivery confirmation.
 */
export default function VerifyDelivery() {
  const { token } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    verifyDeliveryQr(token)
      .then((payload) => {
        if (!cancelled) setResult(payload)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--color-ink)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Logo size={30} />
          <span className="font-display text-lg font-semibold text-[var(--color-paper)]">Trakka</span>
        </div>

        <div className="dashboard-panel rounded-xl p-6 text-center">
          {!result && !error && (
            <div className="space-y-3 py-8">
              <Loader size={26} className="mx-auto" />
              <p className="text-sm text-[var(--color-paper-dim)]">Confirming your delivery…</p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <TriangleAlert className="mx-auto text-[var(--color-dispatch-orange)]" size={32} />
              <h1 className="text-lg font-semibold text-[var(--color-paper)]">Could not confirm</h1>
              <Alert tone="error">{error}</Alert>
              <p className="text-xs text-[var(--color-paper-faint)]">
                Ask the rider to refresh the QR code and try again.
              </p>
            </div>
          )}

          {result?.verified && (
            <div className="space-y-4">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-emerald)]/12 text-[var(--color-mint)]">
                <CheckCircle2 size={30} />
              </span>
              <h1 className="text-lg font-semibold text-[var(--color-paper)]">
                {result.alreadyConfirmed ? 'Delivery already confirmed' : 'Delivery confirmed'}
              </h1>
              <p className="text-sm text-[var(--color-paper-dim)]">
                Your package{result.trackingId ? ` (${result.trackingId})` : ''} has been handed over.
                Thank you for using Trakka.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--color-paper-faint)]">
                <ShieldCheck size={12} /> Verified by the recipient’s device
              </div>
            </div>
          )}

          <Link to={ROUTES.customerDashboard} className="mt-6 block">
            <Button variant="secondary" size="sm" className="w-full">
              Continue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
