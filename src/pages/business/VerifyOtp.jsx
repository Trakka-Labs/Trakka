import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import OtpInput from '../../components/ui/OtpInput'
import Loader from '../../components/ui/Loader'
import Alert from '../../components/ui/Alert'
import { useCountdown } from '../../hooks/useCountdown'
import { verifyOtp, requestPasswordReset, maskEmail } from '../../lib/api'
import { ROUTES } from '../../lib/routes'

const RESEND_SECONDS = 45

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const [localTestCode, setLocalTestCode] = useState(location.state?.localTestCode || '')

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const { secondsLeft, isActive, reset } = useCountdown(RESEND_SECONDS)

  useEffect(() => {
    if (!email) navigate(ROUTES.businessForgotPassword, { replace: true })
  }, [email, navigate])

  if (!email) return null

  const submitCode = async (fullCode) => {
    setError('')
    setVerifying(true)
    try {
      const { resetToken } = await verifyOtp({ email, code: fullCode })
      navigate(ROUTES.businessResetPassword, { state: { email, resetToken } })
    } catch (err) {
      setError(err.message || 'That code is incorrect or expired.')
      setVerifying(false)
    }
  }

  const handleChange = (value) => {
    setCode(value)
    if (value.length === 6 && !verifying) submitCode(value)
  }

  const handleResend = async () => {
    setError('')
    setResending(true)
    try {
      const result = await requestPasswordReset({ email })
      setLocalTestCode(result.localTestCode || '')
      setCode('')
      reset(RESEND_SECONDS)
    } catch (err) {
      setError(err.message || 'Could not resend the code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout eyebrow="ACCOUNT RECOVERY">
      <Link
        to={ROUTES.businessForgotPassword}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <h2 className="font-display text-2xl font-semibold text-[var(--color-paper)] sm:text-3xl">
        Enter verification code
      </h2>
      <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
        We sent a 6-digit code to <span className="text-[var(--color-paper)]">{maskEmail(email)}</span>.
      </p>

      <div className="mt-8">
        {error && (
          <Alert tone="error" className="mb-5">
            {error}
          </Alert>
        )}

        <OtpInput value={code} onChange={handleChange} error={!!error} disabled={verifying} />

        {verifying && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-paper-dim)]">
            <Loader size={15} /> Verifying code…
          </div>
        )}

        {localTestCode && (
          <p className="mt-3 font-mono text-xs text-[var(--color-paper-faint)]">
            Local test code: {localTestCode}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between text-sm">
          <span className="text-[var(--color-paper-faint)]">
            {isActive ? `Resend code in ${secondsLeft}s` : "Didn't get the code?"}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isActive || resending}
            className="font-medium text-[var(--color-mint)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--color-paper-faint)] disabled:no-underline"
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
