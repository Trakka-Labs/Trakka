import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Alert from '../../components/ui/Alert'
import { forgotPasswordSchema } from '../../lib/authSchemas'
import { requestPasswordReset } from '../../lib/api'
import { ROUTES } from '../../lib/routes'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }) => {
    setServerError('')
    try {
      const result = await requestPasswordReset({ email })
      navigate(ROUTES.businessVerifyOtp, { state: { email, localTestCode: result.localTestCode } })
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <AuthLayout eyebrow="ACCOUNT RECOVERY">
      <Link
        to={ROUTES.businessLogin}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]"
      >
        <ArrowLeft size={15} /> Back to sign in
      </Link>

      <h2 className="font-display text-2xl font-semibold text-[var(--color-paper)] sm:text-3xl">
        Forgot your password?
      </h2>
      <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
        Enter the email registered to your business account and we&apos;ll send you a verification code.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-5">
        {serverError && <Alert tone="error">{serverError}</Alert>}

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

        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader size={17} /> Sending code…
            </>
          ) : (
            'Send verification code'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
