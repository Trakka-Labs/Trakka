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
    defaultValues: { normalPriceBaseline: '', urgentPriceBaseline: '', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] p-4 text-sm text-[var(--color-paper-dim)]">
        Set separate starting prices for batched and direct deliveries. Each delivery fee must meet the baseline for
        its selected service, protecting your margin without pricing both services the same way.
      </div>

      <FormField
        label="Normal delivery baseline (₦)"
        htmlFor="normalPriceBaseline"
        error={errors.normalPriceBaseline?.message}
        hint="Minimum fee for normal, batched deliveries"
        required
      >
        <Input
          icon={Wallet}
          integerOnly
          placeholder="1500"
          error={!!errors.normalPriceBaseline}
          {...register('normalPriceBaseline')}
        />
      </FormField>

      <FormField
        label="Urgent delivery baseline (₦)"
        htmlFor="urgentPriceBaseline"
        error={errors.urgentPriceBaseline?.message}
        hint="Minimum fee for priority, direct deliveries"
        required
      >
        <Input
          icon={Wallet}
          integerOnly
          placeholder="3000"
          error={!!errors.urgentPriceBaseline}
          {...register('urgentPriceBaseline')}
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
