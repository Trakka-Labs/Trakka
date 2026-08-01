import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/ui/FormField'
import PasswordInput from '../../components/ui/PasswordInput'
import PasswordStrengthMeter from '../../components/ui/PasswordStrengthMeter'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Alert from '../../components/ui/Alert'
import { resetPasswordSchema } from '../../lib/authSchemas'
import { resetPassword } from '../../lib/api'
import { ROUTES } from '../../lib/routes'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const resetToken = location.state?.resetToken

  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })
  const password = watch('password')

  useEffect(() => {
    if (!email || !resetToken) navigate(ROUTES.businessForgotPassword, { replace: true })
  }, [email, resetToken, navigate])

  if (!email || !resetToken) return null

  const onSubmit = async (values) => {
    setServerError('')
    try {
      await resetPassword({ email, password: values.password, resetToken })
      setDone(true)
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (done) {
    return (
      <AuthLayout eyebrow="ACCOUNT RECOVERY">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-emerald)]/15">
            <CheckCircle2 size={30} className="text-[var(--color-mint)]" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold text-[var(--color-paper)] sm:text-3xl">
            Password updated
          </h2>
          <p className="mt-3 text-sm text-[var(--color-paper-dim)]">
            Your password has been changed. Sign in with your new password to continue.
          </p>
          <Button as={Link} to={ROUTES.businessLogin} variant="primary" size="md" className="mt-8">
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    )
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
        Set a new password
      </h2>
      <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
        Choose a strong password you haven&apos;t used before.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-5">
        {serverError && <Alert tone="error">{serverError}</Alert>}

        <div className="flex flex-col gap-2">
          <FormField label="New password" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={!!errors.password}
              {...register('password')}
            />
          </FormField>
          <PasswordStrengthMeter password={password} />
        </div>

        <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
          <PasswordInput
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader size={17} /> Updating password…
            </>
          ) : (
            'Update password'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
