import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthTabs from '../../components/auth/AuthTabs'
import GoogleIdentityButton from '../../components/auth/GoogleIdentityButton'
import Alert from '../../components/ui/Alert'
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'
import { ROUTES } from '../../lib/routes'

export default function BusinessAuth() {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = location.pathname === ROUTES.businessLogin ? 'login' : 'signup'

  const [serverError, setServerError] = useState('')

  const switchMode = (next) => {
    if (next === mode) return
    setServerError('')
    navigate(next === 'signup' ? ROUTES.businessSignup : ROUTES.businessLogin, { replace: true })
  }

  const finalizeAuth = (account) => {
    if (account.setupComplete) {
      navigate(ROUTES.businessDashboard)
    } else {
      navigate(ROUTES.companySetup, {
        state: { email: account.email, companyName: account.companyName, phone: account.phone },
      })
    }
  }

  return (
    <AuthLayout eyebrow="BUSINESS PORTAL">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-[var(--color-paper)] sm:text-3xl">
          {mode === 'signup' ? 'Create your business account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
          {mode === 'signup'
            ? 'Set up dispatch, drivers, and live tracking in minutes.'
            : 'Sign in to manage your deliveries and drivers.'}
        </p>
      </div>

      <AuthTabs mode={mode} onChange={switchMode} />

      <div className="mt-7">
        {serverError && (
          <Alert tone="error" className="mb-5">
            {serverError}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {mode === 'signup' ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <SignupForm onSuccess={finalizeAuth} onError={setServerError} />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25 }}
            >
              <LoginForm onSuccess={finalizeAuth} onError={setServerError} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="my-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
          <span className="font-mono text-xs text-[var(--color-paper-faint)]">OR</span>
          <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
        </div>

        <GoogleIdentityButton intent={mode} onSuccess={finalizeAuth} onError={setServerError} />

        <p className="mt-8 text-center text-xs leading-relaxed text-[var(--color-paper-faint)]">
          By continuing, you agree to Trakka&apos;s{' '}
          <a href="#" className="text-[var(--color-paper-dim)] underline underline-offset-2 hover:text-[var(--color-paper)]">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[var(--color-paper-dim)] underline underline-offset-2 hover:text-[var(--color-paper)]">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </AuthLayout>
  )
}
