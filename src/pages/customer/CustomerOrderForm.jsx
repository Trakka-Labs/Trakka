import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Camera, Info, MapPin, Package, Phone, ShieldCheck, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Loader from '../../components/ui/Loader'
import Logo from '../../components/ui/Logo'
import Select from '../../components/ui/Select'
import { BENIN_NEIGHBOURHOODS } from '../../lib/geoData'
import { getIntakeConfig, submitCustomerOrder } from '../../lib/api'

const intakeSchema = z
  .object({
    serviceType: z.enum(['normal', 'urgent']),
    paymentType: z.enum(['sender_paid', 'pay_on_delivery']),
    pickupAddress: z.string().trim().min(5, 'Enter the pickup address'),
    pickupNeighborhood: z.string().trim().min(1, 'Select a pickup area'),
    pickupLandmark: z.string().trim().max(120).optional(),
    dropoffAddress: z.string().trim().min(5, 'Enter the delivery address'),
    dropoffNeighborhood: z.string().trim().min(1, 'Select a delivery area'),
    dropoffLandmark: z.string().trim().max(120).optional(),
    packageDescription: z.string().trim().min(3, 'Describe the package'),
    declaredValue: z.coerce.number({ invalid_type_error: 'Enter the package value' }).int().positive('Enter a value above 0'),
    notes: z.string().trim().max(300).optional(),
    senderName: z.string().trim().min(2, 'Enter your name'),
    senderPhone: z.string().trim().regex(/^\d{10,15}$/, 'Phone must contain 10 to 15 digits'),
    recipientName: z.string().trim().min(2, 'Enter the receiver name'),
    recipientPhone: z.string().trim().regex(/^\d{10,15}$/, 'Phone must contain 10 to 15 digits'),
  })


function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const maxSize = 1280
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      image.onerror = () => reject(new Error('Could not read this image'))
      image.src = reader.result
    }
    reader.onerror = () => reject(new Error('Could not read the package photo'))
    reader.readAsDataURL(file)
  })
}

export default function CustomerOrderForm() {
  const { token } = useParams()
  const [config, setConfig] = useState(null)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [photoName, setPhotoName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getIntakeConfig(token)
      .then(setConfig)
      .catch((err) => setError(err.message))
  }, [token])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(intakeSchema),
    defaultValues: { serviceType: 'normal', paymentType: 'pay_on_delivery' },
  })

  const serviceType = watch('serviceType')
  const baseline = config
    ? serviceType === 'urgent'
      ? config.baselines.urgent
      : config.baselines.normal
    : null

  const onSubmit = useCallback(
    async (values) => {
      if (!photo) {
        setError('Add a photo of the package before submitting.')
        return
      }
      setSubmitting(true)
      setError('')
      try {
        const response = await submitCustomerOrder(token, {
          ...values,
          packagePhotoDataUrl: photo,
        })
        setSubmitted(response.trackingUrl ?? null)
      } catch (err) {
        setError(err.message)
      } finally {
        setSubmitting(false)
      }
    },
    [token, photo],
  )

  const onPickPhoto = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 6 * 1024 * 1024) {
      setError('Photo is too large. Keep it under 6 MB.')
      return
    }
    try {
      const dataUrl = await compressPhoto(file)
      if (dataUrl.length > 1_400_000) {
        setError('Photo is still too large after compression. Try a smaller image.')
        return
      }
      setPhoto(dataUrl)
      setPhotoName(file.name)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!config && !error) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--color-ink)]">
        <Loader size={30} />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--color-ink)] px-4">
        <div className="max-w-sm space-y-4 text-center">
          <Logo size={36} className="mx-auto" />
          <div className="dashboard-panel rounded-lg p-6">
            <Package className="mx-auto text-[var(--color-route-cyan)]" size={30} />
            <h1 className="mt-3 text-lg font-semibold text-[var(--color-paper)]">Order received</h1>
            <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
              {config?.business?.name ?? 'The business'} will dispatch a rider shortly. You'll get a live tracking link on WhatsApp.
            </p>
            {submitted && (
              <Button
                className="mt-4"
                onClick={() => {
                  window.location.href = submitted
                }}
              >
                Open my tracking link
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--color-ink)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Logo size={27} />
            <div>
              <p className="text-sm font-semibold text-[var(--color-paper)]">{config?.business?.name}</p>
              <p className="text-[10px] text-[var(--color-paper-faint)]">
                {config?.business?.city ? `${config.business.city}, ` : ''}
                {config?.business?.state}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--color-paper-faint)]">
            <ShieldCheck size={12} /> Secured by Trakka
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        {error && <Alert tone="error" className="mb-4">{error}</Alert>}

        <FormSection icon={MapPin} title="Pickup" subtitle="Where should the rider collect your package?">
          <FormField label="Pickup address" htmlFor="pickupAddress" error={errors.pickupAddress?.message} required>
            <Input id="pickupAddress" placeholder="12 Ihama Road, Benin City" error={!!errors.pickupAddress} {...register('pickupAddress')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Pickup area" htmlFor="pickupNeighborhood" error={errors.pickupNeighborhood?.message} required>
              <Select id="pickupNeighborhood" error={!!errors.pickupNeighborhood} {...register('pickupNeighborhood')}>
                <option value="">Select neighborhood</option>
                {BENIN_NEIGHBOURHOODS.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}
              </Select>
            </FormField>
            <FormField label="Nearest landmark" htmlFor="pickupLandmark" error={errors.pickupLandmark?.message} hint="Optional">
              <Input id="pickupLandmark" placeholder="Opposite the health centre" error={!!errors.pickupLandmark} {...register('pickupLandmark')} />
            </FormField>
          </div>
        </FormSection>

        <FormSection icon={Phone} title="Delivery" subtitle="Who receives the package?">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Receiver name" htmlFor="recipientName" error={errors.recipientName?.message} required>
              <Input id="recipientName" error={!!errors.recipientName} {...register('recipientName')} />
            </FormField>
            <FormField label="Receiver phone" htmlFor="recipientPhone" error={errors.recipientPhone?.message} required>
              <Input id="recipientPhone" inputMode="numeric" error={!!errors.recipientPhone} {...register('recipientPhone')} />
            </FormField>
          </div>
          <FormField label="Delivery address" htmlFor="dropoffAddress" error={errors.dropoffAddress?.message} required>
            <Input id="dropoffAddress" placeholder="45 Ugbowo-Lagos Road" error={!!errors.dropoffAddress} {...register('dropoffAddress')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Delivery area" htmlFor="dropoffNeighborhood" error={errors.dropoffNeighborhood?.message} required>
              <Select id="dropoffNeighborhood" error={!!errors.dropoffNeighborhood} {...register('dropoffNeighborhood')}>
                <option value="">Select neighborhood</option>
                {BENIN_NEIGHBOURHOODS.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}
              </Select>
            </FormField>
            <FormField label="Nearest landmark" htmlFor="dropoffLandmark" error={errors.dropoffLandmark?.message} hint="Optional">
              <Input id="dropoffLandmark" placeholder="Blue gate beside the filling station" error={!!errors.dropoffLandmark} {...register('dropoffLandmark')} />
            </FormField>
          </div>
        </FormSection>

        <FormSection icon={Package} title="Package" subtitle="What exactly are we moving?">
          <FormField label="Package description" htmlFor="packageDescription" error={errors.packageDescription?.message} required>
            <Input id="packageDescription" error={!!errors.packageDescription} {...register('packageDescription')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Package value (₦)" htmlFor="declaredValue" error={errors.declaredValue?.message} required>
              <Input id="declaredValue" inputMode="numeric" error={!!errors.declaredValue} {...register('declaredValue')} />
            </FormField>
            <FormField label="Package photo" htmlFor="packagePhoto" hint="Required · auto-compressed to save data" required>
              <div>
                <label
                  htmlFor="packagePhoto"
                  className="flex cursor-pointer items-center gap-2 rounded border border-[var(--color-border-subtle)] px-4 py-3 text-sm text-[var(--color-paper-dim)] hover:border-[var(--color-route-cyan)]"
                >
                  <Camera size={15} />
                  <span className="truncate">{photoName || 'Capture / choose photo'}</span>
                </label>
                <input id="packagePhoto" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPickPhoto} />
              </div>
            </FormField>
          </div>
          <FormField label="Delivery notes" htmlFor="notes" error={errors.notes?.message} hint="Optional">
            <Input id="notes" error={!!errors.notes} {...register('notes')} />
          </FormField>
        </FormSection>

        <FormSection
          icon={Wallet}
          title="Payment"
          subtitle={`${config?.business?.name ?? 'The business'} protects its price floor — you can never be undercharged.`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Service type" htmlFor="serviceType" error={errors.serviceType?.message} required>
              <Select id="serviceType" error={!!errors.serviceType} {...register('serviceType')}>
                <option value="normal">Normal / Batched route</option>
                <option value="urgent">Urgent / Direct run</option>
              </Select>
            </FormField>
            <FormField label="Payment method" htmlFor="paymentType" error={errors.paymentType?.message} required>
              <Select id="paymentType" error={!!errors.paymentType} {...register('paymentType')}>
                <option value="pay_on_delivery">Pay on delivery</option>
                <option value="sender_paid">Paid via the sender</option>
              </Select>
            </FormField>
          </div>
          {baseline != null && (
            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--soft-fill)] px-4 py-3 text-sm text-[var(--color-paper-dim)]">
              Delivery fee (fixed):{' '}
              <strong className="text-[var(--color-paper)]">{money(baseline)}</strong>
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--color-paper-faint)]">
                <Info size={12} /> fees below this floor are blocked by Trakka
              </span>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Your name" htmlFor="senderName" error={errors.senderName?.message} required>
              <Input id="senderName" error={!!errors.senderName} {...register('senderName')} />
            </FormField>
            <FormField label="Your phone" htmlFor="senderPhone" error={errors.senderPhone?.message} required>
              <Input id="senderPhone" inputMode="numeric" error={!!errors.senderPhone} {...register('senderPhone')} />
            </FormField>
          </div>
        </FormSection>

        <Button
          type="button"
          disabled={submitting}
          onClick={handleSubmit(onSubmit)}
          className="w-full"
        >
          {submitting ? 'Submitting…' : 'Submit my order'}
        </Button>
        <p className="mt-4 text-center text-[10px] text-[var(--color-paper-faint)]">
          No account needed. You'll receive a unique, single-per-parcel tracking link — powered by Trakka.
        </p>
      </main>
    </div>
  )
}

function FormSection({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="dashboard-panel mb-4 rounded-lg p-5">
      <div className="mb-4 flex items-start gap-3">
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-paper)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--color-paper-faint)]">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function money(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}
