import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Landmark, User } from 'lucide-react'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import Loader from '../ui/Loader'
import Badge from '../ui/Badge'
import { paymentAccountSchema } from '../../lib/companySchemas'
import { NIGERIAN_BANKS } from '../../lib/banks'

export default function PaymentAccountForm({ defaultValues, onSubmit, submitLabel = 'Continue' }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentAccountSchema),
    defaultValues: { bankName: '', accountNumber: '', accountHolderName: '', ...defaultValues },
  })

  const accountHolderName = watch('accountHolderName')
  const hasAccountName = Boolean(accountHolderName)

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] p-4 text-sm text-[var(--color-paper-dim)]">
        Local testing stores only the final four account-number digits. Enter the account name exactly as it appears
        at the bank. Provider verification will replace this manual step outside the local engine.
      </div>

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
          integerOnly
          maxDigits={10}
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
          <Badge tone={hasAccountName ? 'emerald' : 'neutral'}>{hasAccountName ? 'Local entry' : 'Pending'}</Badge>
        </div>
        <Input
          id="accountHolderName"
          icon={User}
          placeholder="Account holder name"
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
            Entered manually for the local testing engine
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting || !accountHolderName}
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
