import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Mail, Phone } from 'lucide-react'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import PasswordInput from '../../../components/ui/PasswordInput'
import PasswordStrengthMeter from '../../../components/ui/PasswordStrengthMeter'
import Checkbox from '../../../components/ui/Checkbox'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import { businessSignupSchema } from '../../../lib/authSchemas'
import { registerBusiness } from '../../../lib/mockAuthApi'

export default function SignupForm({ onSuccess, onError }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(businessSignupSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const password = watch('password')

  const onSubmit = async (values) => {
    onError('')
    try {
      const account = await registerBusiness(values)
      onSuccess(account)
    } catch (err) {
      onError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormField label="Company name" htmlFor="companyName" error={errors.companyName?.message} required>
        <Input
          icon={Building2}
          placeholder="Swift Logistics Ltd"
          autoComplete="organization"
          error={!!errors.companyName}
          {...register('companyName')}
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

      <FormField label="Phone number" htmlFor="phone" error={errors.phone?.message} required>
        <Input
          icon={Phone}
          type="tel"
          placeholder="080 1234 5678"
          autoComplete="tel"
          error={!!errors.phone}
          {...register('phone')}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>
        <PasswordStrengthMeter password={password} />
      </div>

      <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
        <PasswordInput
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </FormField>

      <FormField htmlFor="agreeToTerms" error={errors.agreeToTerms?.message}>
        <Checkbox label="I agree to the Terms of Service and Privacy Policy" {...register('agreeToTerms')} />
      </FormField>

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? (
          <>
            <Loader size={17} /> Creating account…
          </>
        ) : (
          'Create business account'
        )}
      </Button>
    </form>
  )
}
