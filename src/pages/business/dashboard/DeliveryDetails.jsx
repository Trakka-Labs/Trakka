import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft, MapPin, Package, Phone, ReceiptText, RefreshCw, Route,
} from 'lucide-react'
import Alert from '../../../components/ui/Alert'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import { STATUS_META } from '../../../lib/dashboardConfig'
import { getDelivery } from '../../../lib/api'
import { ROUTES } from '../../../lib/routes'

const PAYMENT_LABELS = {
  sender_paid: 'Sender paid',
  receiver_online: 'Receiver paid online',
  pay_on_delivery: 'Pay on delivery',
}

function formatNaira(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

function formatDate(value, includeTime = false) {
  if (!value) return '—'
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value)
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date)
}

function InfoRow({ label, value, children }) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-border-subtle)] py-3.5 last:border-0 sm:grid-cols-[10rem_1fr] sm:gap-5">
      <dt className="text-xs text-[var(--color-paper-faint)]">{label}</dt>
      <dd className="break-words text-sm text-[var(--color-paper)]">{children || value || '—'}</dd>
    </div>
  )
}

function DetailSection({ icon: Icon, title, children }) {
  return (
    <section className="dashboard-panel overflow-hidden rounded-lg">
      <header className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4 sm:px-6">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
          <Icon size={17} aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-[var(--color-paper)]">{title}</h2>
      </header>
      <dl className="px-5 sm:px-6">{children}</dl>
    </section>
  )
}

export default function DeliveryDetails() {
  const { deliveryId } = useParams()
  const [delivery, setDelivery] = useState(null)
  const [error, setError] = useState('')

  const loadDelivery = useCallback(async () => {
    setError('')
    try {
      setDelivery(await getDelivery(deliveryId))
    } catch (err) {
      setError(err.message)
    }
  }, [deliveryId])

  useEffect(() => {
    loadDelivery()
  }, [loadDelivery])

  if (!delivery && !error) {
    return <div className="flex min-h-80 items-center justify-center"><Loader size={28} /></div>
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Alert tone="error">{error}</Alert>
        <div className="mt-4 flex gap-3">
          <Button as={Link} to={ROUTES.businessDeliveries} variant="secondary" size="sm">
            <ArrowLeft size={14} /> Deliveries
          </Button>
          <Button type="button" onClick={loadDelivery} size="sm">
            <RefreshCw size={14} /> Retry
          </Button>
        </div>
      </div>
    )
  }

  const status = STATUS_META[delivery.status] || {
    label: delivery.status.replaceAll('_', ' '), tone: 'neutral',
  }

  return (
    <div>
      <Link
        to={ROUTES.businessDeliveries}
        className="mb-5 inline-flex items-center gap-2 text-xs text-[var(--color-paper-faint)] hover:text-[var(--color-paper)]"
      >
        <ArrowLeft size={14} /> All deliveries
      </Link>

      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">Delivery details</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold tracking-[0.03em] text-[var(--color-paper)] sm:text-3xl">
            {delivery.trackingId}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
            Created {formatDate(delivery.createdAt, true)}
          </p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <DetailSection icon={MapPin} title="Pickup">
          <InfoRow label="Address" value={delivery.pickupAddress} />
          <InfoRow label="Neighborhood" value={delivery.pickupNeighborhood} />
          <InfoRow label="Landmark" value={delivery.pickupLandmark} />
          <InfoRow label="Contact" value={delivery.pickupContactName} />
          <InfoRow label="Phone">
            <a className="inline-flex items-center gap-2 text-[var(--color-route-cyan)] hover:underline" href={`tel:${delivery.pickupContactPhone}`}>
              <Phone size={13} /> {delivery.pickupContactPhone}
            </a>
          </InfoRow>
        </DetailSection>

        <DetailSection icon={Route} title="Drop-off">
          <InfoRow label="Address" value={delivery.dropoffAddress} />
          <InfoRow label="Neighborhood" value={delivery.dropoffNeighborhood} />
          <InfoRow label="Landmark" value={delivery.dropoffLandmark} />
          <InfoRow label="Receiver" value={delivery.recipientName} />
          <InfoRow label="Phone">
            <a className="inline-flex items-center gap-2 text-[var(--color-route-cyan)] hover:underline" href={`tel:${delivery.recipientPhone}`}>
              <Phone size={13} /> {delivery.recipientPhone}
            </a>
          </InfoRow>
        </DetailSection>

        <DetailSection icon={Package} title="Package">
          <InfoRow label="Description" value={delivery.packageDescription} />
          <InfoRow label="Declared value" value={formatNaira(delivery.declaredValue)} />
          <InfoRow label="Handling notes" value={delivery.notes} />
          {delivery.packagePhotoDataUrl && (
            <div className="py-4">
              <dt className="mb-3 text-xs text-[var(--color-paper-faint)]">Package photo</dt>
              <dd><img src={delivery.packagePhotoDataUrl} alt="Delivery package" className="max-h-72 rounded-lg object-contain" /></dd>
            </div>
          )}
        </DetailSection>

        <DetailSection icon={ReceiptText} title="Service and payment">
          <InfoRow label="Service" value={delivery.serviceType === 'urgent' ? 'Urgent / direct' : 'Normal / batched'} />
          <InfoRow label="Requested date" value={formatDate(delivery.requestedDate)} />
          <InfoRow label="Payment responsibility" value={PAYMENT_LABELS[delivery.paymentType] || delivery.paymentType} />
          <InfoRow label="Delivery fee" value={formatNaira(delivery.deliveryFee)} />
          <InfoRow label="Last updated" value={formatDate(delivery.updatedAt, true)} />
        </DetailSection>
      </div>
    </div>
  )
}
