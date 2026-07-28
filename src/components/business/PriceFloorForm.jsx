import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Wallet } from 'lucide-react'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Loader from '../ui/Loader'
import { priceFloorSchema } from '../../lib/companySchemas'

export default function PriceFloorForm({ defaultValues, onSubmit, submitLabel = 'Continue' }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(priceFloorSchema),
    defaultValues: { minimumPrice: '', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] p-4 text-sm text-[var(--color-paper-dim)]">
        Set the lowest price any delivery can ever be booked at on Trakka. Negotiated or bid prices will never be
        allowed to drop below this floor, protecting your margin on every job.
      </div>

      <FormField
        label="Minimum delivery price (₦)"
        htmlFor="minimumPrice"
        error={errors.minimumPrice?.message}
        hint="Applies to every delivery across your business"
        required
      >
        <Input
          icon={Wallet}
          inputMode="decimal"
          placeholder="1500"
          error={!!errors.minimumPrice}
          {...register('minimumPrice')}
        />
      </FormField>

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="mt-1 self-start">
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
