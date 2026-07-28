import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import FormField from '../../../components/ui/FormField'
import Input from '../../../components/ui/Input'
import PasswordInput from '../../../components/ui/PasswordInput'
import Checkbox from '../../../components/ui/Checkbox'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import { businessLoginSchema } from '../../../lib/authSchemas'
import { loginBusiness } from '../../../lib/mockAuthApi'
import { ROUTES } from '../../../lib/routes'

export default function LoginForm({ onSuccess, onError }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(businessLoginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (values) => {
    onError('')
    try {
      const account = await loginBusiness(values)
      onSuccess(account)
    } catch (err) {
      onError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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

      <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
        <PasswordInput
          placeholder="Enter your password"
          autoComplete="current-password"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <div className="-mt-1 flex items-center justify-between">
        <Checkbox id="rememberMe" label="Remember me" {...register('rememberMe')} />
        <Link to={ROUTES.businessForgotPassword} className="text-sm text-[var(--color-mint)] hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? (
          <>
            <Loader size={17} /> Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      <p className="text-center font-mono text-xs text-[var(--color-paper-faint)]">
        Demo: demo@trakka.africa / Trakka@123
      </p>
    </form>
  )
}
