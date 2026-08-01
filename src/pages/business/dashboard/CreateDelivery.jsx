import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useOutletContext } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  Package,
  Phone,
  Plus,
  ReceiptText,
  Route,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import Loader from '../../../components/ui/Loader'
import { createDeliverySchema } from '../../../lib/deliverySchemas'
import { createDelivery } from '../../../lib/api'
import { ROUTES } from '../../../lib/routes'

const NEIGHBORHOODS = [
  'Airport Road',
  'Ekenwan',
  'Evbuotubu',
  'GRA',
  'Ikpoba Hill',
  'New Benin',
  'Ogida',
  'Oregbeni',
  'Ring Road',
  'Sapele Road',
  'Ugbowo',
  'Upper Mission',
]

const PAYMENT_OPTIONS = [
  {
    value: 'sender_paid',
    label: 'Sender paid',
    description: 'Record this delivery as paid by the sender.',
  },
  {
    value: 'pay_on_delivery',
    label: 'Pay on delivery',
    description: 'Collect cash or transfer at the handoff.',
  },
]

const SERVICE_OPTIONS = [
  {
    value: 'normal',
    label: 'Normal / batched',
    description: 'Eligible for neighborhood batching and a flexible delivery window.',
    meta: 'Fuel-efficient',
  },
  {
    value: 'urgent',
    label: 'Urgent / direct',
    description: 'A dedicated run that should be priced above the normal route rate.',
    meta: 'Priority',
  },
]

function localDateValue() {
  const today = new Date()
  const offset = today.getTimezoneOffset()
  return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function fileToDataUrl(file) {
  if (!file) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the package photo'))
    reader.readAsDataURL(file)
  })
}

function formatNaira(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return '₦0'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

function FieldGrid({ children }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>
}

function SectionBlock({ icon: Icon, title, description, children }) {
  return (
    <section className="dashboard-panel overflow-hidden rounded-lg">
      <header className="flex items-start gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4 sm:px-6">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
          <Icon size={17} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-[var(--color-paper)]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--color-paper-faint)]">{description}</p>
        </div>
      </header>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  )
}

function ChoiceCard({
  type = 'radio',
  name,
  value,
  checked,
  registration,
  onSelect,
  label,
  description,
  meta,
}) {
  const inputId = `${name}-${value}`

  return (
    <label
      htmlFor={inputId}
      className={`relative flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
        checked
          ? 'border-[var(--color-route-cyan)] bg-[var(--soft-fill)]'
          : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:border-[var(--color-paper-faint)]'
      }`}
    >
      <input
        {...registration}
        id={inputId}
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => {
          registration.onChange(event)
          onSelect(value)
        }}
        className="sr-only"
      />
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          checked
            ? 'border-[var(--color-route-cyan)] bg-[var(--color-route-cyan)] text-white'
            : 'border-[var(--color-border-subtle)]'
        }`}
        aria-hidden="true"
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--color-paper)]">{label}</span>
          {meta && <span className="font-mono text-[9px] text-[var(--color-route-cyan)]">{meta}</span>}
        </span>
        <span className="mt-1 block text-xs leading-5 text-[var(--color-paper-faint)]">{description}</span>
      </span>
    </label>
  )
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-xs text-[var(--color-paper-faint)]">{label}</dt>
      <dd className={`max-w-[62%] text-right text-xs ${strong ? 'font-semibold text-[var(--color-paper)]' : 'text-[var(--color-paper-dim)]'}`}>
        {value}
      </dd>
    </div>
  )
}

function SuccessState({ delivery, onCreateAnother }) {
  return (
    <div className="mx-auto max-w-3xl py-5 sm:py-10">
      <section className="dashboard-panel overflow-hidden rounded-lg">
        <div className="border-b border-[var(--color-border-subtle)] p-6 sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--color-emerald)]/12 text-[var(--color-emerald)]">
            <CheckCircle2 size={24} />
          </span>
          <p className="mt-6 text-xs font-medium text-[var(--color-emerald)]">Delivery created</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Ready for dispatch
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-paper-dim)]">
            The order is pending and unassigned. Review it in dispatch when you are ready to add it to a route.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_0.72fr]">
          <div className="p-6 sm:p-9">
            <p className="font-mono text-[10px] font-semibold text-[var(--color-paper-faint)]">TRACKING ID</p>
            <p className="mt-2 font-mono text-xl font-semibold tracking-[0.04em] text-[var(--color-paper)]">
              {delivery.trackingId}
            </p>
            <div className="mt-6 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] p-4">
              <p className="text-xs leading-5 text-[var(--color-paper-dim)]">
                Customer tracking activates after this order is assigned and dispatched. No public location is
                exposed while the delivery is still unassigned.
              </p>
            </div>
          </div>

          <aside className="border-t border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] p-6 sm:p-9 lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold text-[var(--color-paper)]">Order summary</p>
            <dl className="mt-4 divide-y divide-[var(--color-border-subtle)]">
              <SummaryRow label="Receiver" value={delivery.recipientName} />
              <SummaryRow label="Route" value={`${delivery.pickupNeighborhood} to ${delivery.dropoffNeighborhood}`} />
              <SummaryRow label="Service" value={delivery.serviceType === 'urgent' ? 'Urgent / direct' : 'Normal / batched'} />
              <SummaryRow label="Delivery fee" value={formatNaira(delivery.deliveryFee)} strong />
            </dl>
          </aside>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-[var(--color-border-subtle)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9">
          <Button as={Link} to={ROUTES.businessDashboard} variant="ghost" size="sm">
            <ArrowLeft size={15} /> Back to dashboard
          </Button>
          <Button type="button" onClick={onCreateAnother} variant="secondary" size="sm">
            <Plus size={15} /> Create another delivery
          </Button>
        </footer>
      </section>
    </div>
  )
}

export default function CreateDelivery() {
  const { session } = useOutletContext()
  const priceBaselines = useMemo(() => ({
    normal: session?.normalPriceBaseline || session?.priceFloor || 1500,
    urgent: session?.urgentPriceBaseline || session?.normalPriceBaseline || session?.priceFloor || 1500,
  }), [session])
  const schema = useMemo(() => createDeliverySchema(priceBaselines), [priceBaselines])
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [createdDelivery, setCreatedDelivery] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pickupAddress: '',
      pickupNeighborhood: '',
      pickupLandmark: '',
      pickupContactName: '',
      pickupContactPhone: '',
      dropoffAddress: '',
      dropoffNeighborhood: '',
      dropoffLandmark: '',
      recipientName: '',
      recipientPhone: '',
      packageDescription: '',
      declaredValue: '',
      notes: '',
      serviceType: 'normal',
      requestedDate: localDateValue(),
      paymentType: 'sender_paid',
      deliveryFee: String(priceBaselines.normal),
    },
  })

  const values = watch()
  const fieldErrorCount = Object.keys(errors).length
  const activePriceBaseline = values.serviceType === 'urgent'
    ? priceBaselines.urgent
    : priceBaselines.normal
  const feeMeetsFloor = Number(values.deliveryFee) >= activePriceBaseline

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(photo)
    setPhotoPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])

  const handlePhoto = (event) => {
    const file = event.target.files?.[0]
    setPhotoError('')

    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Upload a JPG, PNG, or WebP image')
      event.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Keep the package photo under 2 MB for local testing')
      event.target.value = ''
      return
    }
    setPhoto(file)
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoError('')
  }

  const submitDelivery = async (formValues) => {
    setSubmitError('')
    try {
      const packagePhotoDataUrl = await fileToDataUrl(photo)
      const delivery = await createDelivery({
        ...formValues,
        packagePhotoDataUrl,
      })
      setCreatedDelivery(delivery)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setSubmitError('The delivery could not be created. Check your details and try again.')
    }
  }

  const createAnother = () => {
    reset()
    setPhoto(null)
    setPhotoError('')
    setSubmitError('')
    setCreatedDelivery(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (createdDelivery) {
    return <SuccessState delivery={createdDelivery} onCreateAnother={createAnother} />
  }

  return (
    <div>
      <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            to={ROUTES.businessDashboard}
            className="mb-4 inline-flex items-center gap-2 text-xs text-[var(--color-paper-faint)] hover:text-[var(--color-paper)]"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <p className="text-xs font-medium text-[var(--color-route-cyan)]">New order</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-paper)] sm:text-4xl">
            Create delivery
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-paper-dim)]">
            Record the pickup, handoff, package, payment, and service details before the order enters dispatch.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-paper-faint)]">
          <Clock3 size={14} />
          Saves to the local backend
        </div>
      </header>

      {submitError && <Alert tone="error" className="mb-5">{submitError}</Alert>}
      {submitCount > 0 && fieldErrorCount > 0 && (
        <Alert tone="error" className="mb-5">
          Review {fieldErrorCount} highlighted {fieldErrorCount === 1 ? 'field' : 'fields'} before creating this delivery.
        </Alert>
      )}

      <form id="create-delivery-form" onSubmit={handleSubmit(submitDelivery)} noValidate>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <SectionBlock
              icon={MapPin}
              title="Pickup"
              description="Where the rider collects the package and who can release it."
            >
              <FieldGrid>
                <FormField
                  label="Pickup address"
                  htmlFor="pickupAddress"
                  error={errors.pickupAddress?.message}
                  required
                >
                  <Input icon={MapPin} placeholder="12 Ihama Road, Benin City" error={!!errors.pickupAddress} {...register('pickupAddress')} />
                </FormField>
                <FormField
                  label="Pickup neighborhood"
                  htmlFor="pickupNeighborhood"
                  error={errors.pickupNeighborhood?.message}
                  required
                >
                  <Select error={!!errors.pickupNeighborhood} {...register('pickupNeighborhood')}>
                    <option value="">Select neighborhood</option>
                    {NEIGHBORHOODS.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}
                  </Select>
                </FormField>
              </FieldGrid>
              <FormField
                label="Pickup landmark"
                htmlFor="pickupLandmark"
                error={errors.pickupLandmark?.message}
                hint="Optional, but useful when the street is difficult to find"
              >
                <Input placeholder="Opposite the health centre" error={!!errors.pickupLandmark} {...register('pickupLandmark')} />
              </FormField>
              <FieldGrid>
                <FormField
                  label="Pickup contact"
                  htmlFor="pickupContactName"
                  error={errors.pickupContactName?.message}
                  required
                >
                  <Input icon={UserRound} placeholder="Ivie Omoregie" error={!!errors.pickupContactName} {...register('pickupContactName')} />
                </FormField>
                <FormField
                  label="Contact phone"
                  htmlFor="pickupContactPhone"
                  error={errors.pickupContactPhone?.message}
                  required
                >
                  <Input icon={Phone} integerOnly maxDigits={15} placeholder="08032147726" error={!!errors.pickupContactPhone} {...register('pickupContactPhone')} />
                </FormField>
              </FieldGrid>
            </SectionBlock>

            <SectionBlock
              icon={Route}
              title="Delivery"
              description="The destination and the person receiving the package."
            >
              <FieldGrid>
                <FormField
                  label="Delivery address"
                  htmlFor="dropoffAddress"
                  error={errors.dropoffAddress?.message}
                  required
                >
                  <Input icon={MapPin} placeholder="45 Ugbowo-Lagos Road" error={!!errors.dropoffAddress} {...register('dropoffAddress')} />
                </FormField>
                <FormField
                  label="Delivery neighborhood"
                  htmlFor="dropoffNeighborhood"
                  error={errors.dropoffNeighborhood?.message}
                  required
                >
                  <Select error={!!errors.dropoffNeighborhood} {...register('dropoffNeighborhood')}>
                    <option value="">Select neighborhood</option>
                    {NEIGHBORHOODS.map((neighborhood) => <option key={neighborhood}>{neighborhood}</option>)}
                  </Select>
                </FormField>
              </FieldGrid>
              <FormField
                label="Delivery landmark"
                htmlFor="dropoffLandmark"
                error={errors.dropoffLandmark?.message}
                hint="Optional direction the rider can recognize quickly"
              >
                <Input placeholder="Blue gate beside the filling station" error={!!errors.dropoffLandmark} {...register('dropoffLandmark')} />
              </FormField>
              <FieldGrid>
                <FormField
                  label="Receiver name"
                  htmlFor="recipientName"
                  error={errors.recipientName?.message}
                  required
                >
                  <Input icon={UserRound} placeholder="Efe Osagie" error={!!errors.recipientName} {...register('recipientName')} />
                </FormField>
                <FormField
                  label="Receiver phone"
                  htmlFor="recipientPhone"
                  error={errors.recipientPhone?.message}
                  required
                >
                  <Input icon={Phone} integerOnly maxDigits={15} placeholder="08032147726" error={!!errors.recipientPhone} {...register('recipientPhone')} />
                </FormField>
              </FieldGrid>
            </SectionBlock>

            <SectionBlock
              icon={Package}
              title="Package"
              description="Record enough detail for the rider and receiver to identify the item."
            >
              <FieldGrid>
                <FormField
                  label="Package description"
                  htmlFor="packageDescription"
                  error={errors.packageDescription?.message}
                  required
                >
                  <Input icon={Package} placeholder="Small electronics parcel" error={!!errors.packageDescription} {...register('packageDescription')} />
                </FormField>
                <FormField
                  label="Declared value (₦)"
                  htmlFor="declaredValue"
                  error={errors.declaredValue?.message}
                  hint="The value of the item, not the delivery fee"
                  required
                >
                  <Input icon={Wallet} integerOnly placeholder="25000" error={!!errors.declaredValue} {...register('declaredValue')} />
                </FormField>
              </FieldGrid>

              <FormField label="Handling notes" htmlFor="notes" error={errors.notes?.message} hint="Optional, maximum 300 characters">
                <textarea
                  rows={4}
                  placeholder="Fragile item. Keep upright and call before arrival."
                  className={`w-full resize-y rounded border bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 text-[var(--color-paper)] outline-none transition-colors placeholder:text-[var(--color-paper-faint)] focus:border-[var(--color-paper)] focus:ring-1 focus:ring-[var(--color-paper)] ${
                    errors.notes ? 'border-[var(--color-dispatch-orange)]' : 'border-[var(--color-border-subtle)]'
                  }`}
                  {...register('notes')}
                />
              </FormField>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-paper)]">Package photo</p>
                    <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Optional for owner-created deliveries · JPG, PNG or WebP · 5 MB maximum</p>
                  </div>
                  {photo && (
                    <button type="button" onClick={removePhoto} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-dispatch-orange)] hover:underline">
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>
                {photo && photoPreview ? (
                  <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] p-3">
                    <img src={photoPreview} alt="Selected package preview" className="h-20 w-20 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-paper)]">{photo.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-paper-faint)]">{(photo.size / 1024 / 1024).toFixed(2)} MB · Ready for upload</p>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] px-5 py-8 text-center transition-colors hover:border-[var(--color-route-cyan)]">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]">
                      <Camera size={19} />
                    </span>
                    <span className="mt-3 text-sm font-medium text-[var(--color-paper)]">Add package photo</span>
                    <span className="mt-1 text-xs text-[var(--color-paper-faint)]">Use the camera or choose an image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      onChange={handlePhoto}
                      className="sr-only"
                    />
                  </label>
                )}
                {photoError && <p role="alert" className="mt-2 text-xs text-[var(--color-dispatch-orange)]">{photoError}</p>}
              </div>
            </SectionBlock>

            <SectionBlock
              icon={CalendarDays}
              title="Service and payment"
              description="Choose how quickly this order should move and how payment will be collected."
            >
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--color-paper)]">Delivery service <span className="text-[var(--color-dispatch-orange)]">*</span></p>
                <div className="grid gap-3 md:grid-cols-2">
                  {SERVICE_OPTIONS.map((option) => (
                    <ChoiceCard
                      key={option.value}
                      {...option}
                      name="serviceType"
                      registration={register('serviceType')}
                      checked={values.serviceType === option.value}
                      onSelect={(value) => {
                        const previousBaseline = values.serviceType === 'urgent'
                          ? priceBaselines.urgent
                          : priceBaselines.normal
                        setValue('serviceType', value, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        if (!values.deliveryFee || Number(values.deliveryFee) === previousBaseline) {
                          setValue('deliveryFee', String(
                            value === 'urgent' ? priceBaselines.urgent : priceBaselines.normal,
                          ), { shouldValidate: true })
                        }
                      }}
                    />
                  ))}
                </div>
                {errors.serviceType && <p role="alert" className="mt-2 text-xs text-[var(--color-dispatch-orange)]">{errors.serviceType.message}</p>}
              </div>

              <FormField
                label="Requested delivery date"
                htmlFor="requestedDate"
                error={errors.requestedDate?.message}
                required
              >
                <Input icon={CalendarDays} type="date" min={localDateValue()} error={!!errors.requestedDate} {...register('requestedDate')} />
              </FormField>

              <div>
                <p className="mb-2 text-sm font-medium text-[var(--color-paper)]">Payment responsibility <span className="text-[var(--color-dispatch-orange)]">*</span></p>
                <div className="grid gap-3 md:grid-cols-2">
                  {PAYMENT_OPTIONS.map((option) => (
                    <ChoiceCard
                      key={option.value}
                      {...option}
                      name="paymentType"
                      registration={register('paymentType')}
                      checked={values.paymentType === option.value}
                      onSelect={(value) =>
                        setValue('paymentType', value, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  ))}
                </div>
                {errors.paymentType && <p role="alert" className="mt-2 text-xs text-[var(--color-dispatch-orange)]">{errors.paymentType.message}</p>}
              </div>

              <FormField
                label="Delivery fee (₦)"
                htmlFor="deliveryFee"
                error={errors.deliveryFee?.message}
                hint={values.serviceType === 'urgent' ? 'Set a direct-run rate above your normal delivery fee' : 'Enter the final batched rate agreed with the customer'}
                required
              >
                <Input icon={ReceiptText} integerOnly placeholder="2500" error={!!errors.deliveryFee} {...register('deliveryFee')} />
              </FormField>

              <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
                feeMeetsFloor
                  ? 'border-[var(--color-emerald)]/30 bg-[var(--color-emerald)]/8'
                  : 'border-[var(--color-dispatch-orange)]/35 bg-[var(--color-dispatch-orange)]/8'
              }`}>
                <ShieldCheck size={17} className={`mt-0.5 shrink-0 ${feeMeetsFloor ? 'text-[var(--color-emerald)]' : 'text-[var(--color-dispatch-orange)]'}`} />
                <div>
                  <p className="text-xs font-semibold text-[var(--color-paper)]">
                    {feeMeetsFloor ? 'Price baseline protected' : 'Below your price baseline'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-paper-faint)]">
                    {session?.companyName || 'Your business'} cannot create a {values.serviceType} delivery below {formatNaira(activePriceBaseline)}.
                  </p>
                </div>
              </div>
            </SectionBlock>

            <div className="dashboard-panel rounded-lg p-4 xl:hidden">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader size={16} /> Creating delivery...</> : <>Create delivery <ArrowRight size={15} /></>}
              </Button>
              <p className="mt-3 text-center text-[10px] leading-4 text-[var(--color-paper-faint)]">
                Creates an unassigned order in the local backend.
              </p>
            </div>
          </div>

          <aside className="dashboard-panel sticky top-[6.25rem] hidden overflow-hidden rounded-lg xl:block">
            <header className="border-b border-[var(--color-border-subtle)] px-5 py-4">
              <p className="text-sm font-semibold text-[var(--color-paper)]">Delivery review</p>
              <p className="mt-1 text-xs text-[var(--color-paper-faint)]">Updates as you complete the form.</p>
            </header>

            <div className="p-5">
              <div className="rounded-lg bg-[var(--color-ink-deep)] p-4">
                <div className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-route-cyan)] bg-[var(--color-surface)]" />
                    <span className="my-1 w-px flex-1 bg-[var(--color-border-subtle)]" />
                    <span className="mb-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-dispatch-orange)] bg-[var(--color-surface)]" />
                  </div>
                  <div className="space-y-5">
                    <div>
                      <p className="font-mono text-[9px] text-[var(--color-paper-faint)]">PICKUP</p>
                      <p className="mt-1 text-xs font-medium text-[var(--color-paper)]">{values.pickupNeighborhood || 'Not selected'}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[var(--color-paper-faint)]">{values.pickupAddress || 'Add pickup address'}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-[var(--color-paper-faint)]">DROP-OFF</p>
                      <p className="mt-1 text-xs font-medium text-[var(--color-paper)]">{values.dropoffNeighborhood || 'Not selected'}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[var(--color-paper-faint)]">{values.dropoffAddress || 'Add delivery address'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <dl className="mt-4 divide-y divide-[var(--color-border-subtle)]">
                <SummaryRow label="Receiver" value={values.recipientName || 'Not added'} />
                <SummaryRow label="Package" value={values.packageDescription || 'Not described'} />
                <SummaryRow label="Service" value={values.serviceType === 'urgent' ? 'Urgent / direct' : 'Normal / batched'} />
                <SummaryRow
                  label="Payment"
                  value={PAYMENT_OPTIONS.find((option) => option.value === values.paymentType)?.label || 'Not selected'}
                />
                <SummaryRow label="Declared value" value={formatNaira(values.declaredValue)} />
                <SummaryRow label="Delivery fee" value={formatNaira(values.deliveryFee)} strong />
              </dl>

              <div className="mt-5 flex items-start gap-2.5 border-l-2 border-[var(--color-route-cyan)] bg-[var(--color-ink-deep)] px-3 py-3">
                <Info size={14} className="mt-0.5 shrink-0 text-[var(--color-route-cyan)]" />
                <p className="text-[10px] leading-4 text-[var(--color-paper-faint)]">
                  Tracking assets are generated after creation. Rider assignment happens later in dispatch.
                </p>
              </div>

              <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader size={16} /> Creating delivery...</> : <>Create delivery <ArrowRight size={15} /></>}
              </Button>
              <p className="mt-3 text-center text-[10px] leading-4 text-[var(--color-paper-faint)]">
                Creates an unassigned order in the local backend.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}
