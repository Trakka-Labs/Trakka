import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Landmark, User } from 'lucide-react'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import Loader from '../ui/Loader'
import Alert from '../ui/Alert'
import Badge from '../ui/Badge'
import { paymentAccountSchema } from '../../lib/companySchemas'
import { resolveAccountName } from '../../lib/mockPaymentApi'
import { NIGERIAN_BANKS } from '../../lib/banks'

export default function PaymentAccountForm({ defaultValues, onSubmit, submitLabel = 'Continue' }) {
  const [resolveError, setResolveError] = useState('')
  const [resolving, setResolving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentAccountSchema),
    defaultValues: { bankName: '', accountNumber: '', accountHolderName: '', ...defaultValues },
  })

  const bankName = watch('bankName')
  const accountNumber = watch('accountNumber')
  const accountHolderName = watch('accountHolderName')
  const isVerified = Boolean(accountHolderName) && !resolving

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      if (!bankName || !/^\d{10}$/.test(accountNumber || '')) {
        setValue('accountHolderName', '')
        return
      }
      setResolveError('')
      setResolving(true)
      try {
        const { accountHolderName: resolved } = await resolveAccountName({ bankName, accountNumber })
        if (!cancelled) setValue('accountHolderName', resolved, { shouldValidate: true })
      } catch (err) {
        if (!cancelled) {
          setResolveError(err.message || 'Could not verify this account. Check the details and try again.')
          setValue('accountHolderName', '')
        }
      } finally {
        if (!cancelled) setResolving(false)
      }
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [bankName, accountNumber, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] p-4 text-sm text-[var(--color-paper-dim)]">
        Connect a settlement account so Trakka can pay out delivery earnings automatically via Paystack. This is
        required before your dashboard is ready.
      </div>

      {resolveError && <Alert tone="error">{resolveError}</Alert>}

      <FormField label="Bank" htmlFor="bankName" error={errors.bankName?.message} required>
        <Select error={!!errors.bankName} {...register('bankName')}>
          <option value="">Select your bank</option>
          {NIGERIAN_BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Account number"
        htmlFor="accountNumber"
        error={errors.accountNumber?.message}
        hint="10-digit NUBAN account number"
        required
      >
        <Input
          icon={Landmark}
          inputMode="numeric"
          maxLength={10}
          placeholder="0123456789"
          error={!!errors.accountNumber}
          {...register('accountNumber')}
        />
      </FormField>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="accountHolderName" className="text-sm font-medium text-[var(--color-paper)]">
            Account name<span className="text-[var(--color-dispatch-orange-bright)]"> *</span>
          </label>
          <Badge tone={isVerified ? 'emerald' : 'neutral'}>{isVerified ? 'Verified' : 'Pending'}</Badge>
        </div>
        <Input
          id="accountHolderName"
          icon={User}
          placeholder="Verified account name appears here"
          readOnly
          error={!!errors.accountHolderName}
          aria-invalid={!!errors.accountHolderName}
          aria-describedby={errors.accountHolderName ? 'accountHolderName-error' : 'accountHolderName-hint'}
          {...register('accountHolderName')}
        />
        {errors.accountHolderName ? (
          <p id="accountHolderName-error" role="alert" className="mt-1.5 text-xs text-[var(--color-dispatch-orange-bright)]">
            {errors.accountHolderName.message}
          </p>
        ) : (
          <p id="accountHolderName-hint" className="mt-1.5 text-xs text-[var(--color-paper-faint)]">
            Verified automatically from your bank details
          </p>
        )}
      </div>

      {resolving && (
        <div className="-mt-3 flex items-center gap-2 text-sm text-[var(--color-paper-dim)]">
          <Loader size={15} /> Verifying account…
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting || resolving || !accountHolderName}
        className="mt-1 self-start"
      >
        {isSubmitting ? (
          <>
            <Loader size={17} /> Saving…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
