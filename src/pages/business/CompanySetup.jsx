import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import OnboardingLayout from '../../components/business/OnboardingLayout'
import StepIndicator from '../../components/business/StepIndicator'
import CompanyInfoForm from '../../components/business/CompanyInfoForm'
import PaymentAccountForm from '../../components/business/PaymentAccountForm'
import PriceFloorForm from '../../components/business/PriceFloorForm'
import ReviewSummary from '../../components/business/ReviewSummary'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Alert from '../../components/ui/Alert'
import { getBusinessProfile, getCurrentAccount, completeCompanySetup } from '../../lib/api'
import { ROUTES } from '../../lib/routes'

export default function CompanySetup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    logoUrl: null,
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
  })
  const [paymentAccount, setPaymentAccount] = useState(null)
  const [priceBaselines, setPriceBaselines] = useState(null)
  const [serverError, setServerError] = useState('')
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getCurrentAccount(), getBusinessProfile()])
      .then(([account, profile]) => {
        if (cancelled) return
        if (account.setupComplete) {
          navigate(ROUTES.businessDashboard, { replace: true })
          return
        }
        setCompanyInfo({
          companyName: profile.companyName || account.companyName || '',
          logoUrl: profile.logoUrl || null,
          phone: (profile.phone || account.phone || '').replace(/\D/g, ''),
          email: profile.email || account.email || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || 'Nigeria',
        })
        setPriceBaselines(
          profile.normalPriceBaseline && profile.urgentPriceBaseline
            ? {
                normalPriceBaseline: profile.normalPriceBaseline,
                urgentPriceBaseline: profile.urgentPriceBaseline,
              }
            : null,
        )
        setLoading(false)
      })
      .catch(() => navigate(ROUTES.businessLogin, { replace: true }))
    return () => {
      cancelled = true
    }
  }, [navigate])

  if (loading) {
    return (
      <OnboardingLayout>
        <div className="flex min-h-80 items-center justify-center">
          <Loader size={28} />
        </div>
      </OnboardingLayout>
    )
  }

  const handleCompanyInfoSubmit = (values) => {
    setCompanyInfo(values)
    setStep(2)
  }

  const handlePaymentSubmit = (values) => {
    setPaymentAccount(values)
    setStep(3)
  }

  const handlePriceFloorSubmit = (values) => {
    setPriceBaselines(values)
    setStep(4)
  }

  const handleFinish = async () => {
    setServerError('')
    setFinishing(true)
    try {
      const profile = await completeCompanySetup({ ...companyInfo, paymentAccount, ...priceBaselines })
      if (profile.setupComplete) {
        navigate(ROUTES.businessDashboard, { replace: true })
      } else {
        setServerError('Some required details are still missing. Please review each step and try again.')
        setFinishing(false)
      }
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
      setFinishing(false)
    }
  }

  return (
    <OnboardingLayout>
      <div className="mb-8">
        <span className="font-mono text-xs tracking-widest text-[var(--color-mint)]">GETTING STARTED</span>
        <h1 className="mt-3 font-display text-2xl font-semibold text-[var(--color-paper)] sm:text-3xl">
          Set up your business
        </h1>
        <p className="mt-2 text-sm text-[var(--color-paper-dim)]">
          A few details before your dashboard is ready. This only takes a few minutes.
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="mt-8 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 sm:p-8">
        {serverError && (
          <Alert tone="error" className="mb-5">
            {serverError}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <CompanyInfoForm defaultValues={companyInfo} onSubmit={handleCompanyInfoSubmit} submitLabel="Continue" />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <PaymentAccountForm defaultValues={paymentAccount} onSubmit={handlePaymentSubmit} submitLabel="Continue" />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <PriceFloorForm
                defaultValues={priceBaselines ? {
                  normalPriceBaseline: String(priceBaselines.normalPriceBaseline),
                  urgentPriceBaseline: String(priceBaselines.urgentPriceBaseline),
                } : undefined}
                onSubmit={handlePriceFloorSubmit}
                submitLabel="Continue"
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ReviewSummary
                companyInfo={companyInfo}
                paymentAccount={paymentAccount}
                priceBaselines={priceBaselines}
                onEditStep={setStep}
              />
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-sm text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]"
                >
                  Back
                </button>
                <Button type="button" variant="primary" size="lg" onClick={handleFinish} disabled={finishing}>
                  {finishing ? (
                    <>
                      <Loader size={17} /> Finishing up…
                    </>
                  ) : (
                    'Complete company setup'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  )
}
