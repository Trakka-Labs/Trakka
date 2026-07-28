import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Mail, MapPin, Phone } from 'lucide-react'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import Loader from '../ui/Loader'
import LogoUploader from './LogoUploader'
import { companyInfoSchema } from '../../lib/companySchemas'
import { COUNTRIES, NIGERIAN_STATES } from '../../lib/geoData'

export default function CompanyInfoForm({ defaultValues, onSubmit, submitLabel = 'Continue' }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: '',
      logoUrl: null,
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      ...defaultValues,
    },
  })

  const country = watch('country')
  const logoUrl = watch('logoUrl')

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormField htmlFor="logoUrl">
        <LogoUploader value={logoUrl} onChange={(val) => setValue('logoUrl', val, { shouldValidate: true })} />
      </FormField>

      <FormField label="Company name" htmlFor="companyName" error={errors.companyName?.message} required>
        <Input
          icon={Building2}
          placeholder="Swift Logistics Ltd"
          autoComplete="organization"
          error={!!errors.companyName}
          {...register('companyName')}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Business phone number" htmlFor="phone" error={errors.phone?.message} required>
          <Input
            icon={Phone}
            type="tel"
            placeholder="080 1234 5678"
            autoComplete="tel"
            error={!!errors.phone}
            {...register('phone')}
          />
        </FormField>

        <FormField label="Business email" htmlFor="email" error={errors.email?.message} required>
          <Input
            icon={Mail}
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>
      </div>

      <FormField label="Business address" htmlFor="address" error={errors.address?.message} required>
        <Input
          icon={MapPin}
          placeholder="12 Marina Road"
          autoComplete="street-address"
          error={!!errors.address}
          {...register('address')}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="City" htmlFor="city" error={errors.city?.message} required>
          <Input placeholder="Port Harcourt" autoComplete="address-level2" error={!!errors.city} {...register('city')} />
        </FormField>

        <FormField label="State" htmlFor="state" error={errors.state?.message} required>
          {country === 'Nigeria' ? (
            <Select error={!!errors.state} {...register('state')}>
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
          ) : (
            <Input placeholder="State / region" error={!!errors.state} {...register('state')} />
          )}
        </FormField>

        <FormField label="Country" htmlFor="country" error={errors.country?.message} required>
          <Select error={!!errors.country} {...register('country')}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

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
