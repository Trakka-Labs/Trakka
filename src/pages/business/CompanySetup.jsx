import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { getBusinessProfile, completeCompanySetup } from '../../lib/mockAuthApi'
import { getSession, updateSession } from '../../lib/session'
import { ROUTES } from '../../lib/routes'

export default function CompanySetup() {
  const location = useLocation()
  const navigate = useNavigate()

  const [session] = useState(() => getSession())
  const email = location.state?.email || session?.email
  const [existingProfile] = useState(() => (email ? getBusinessProfile(email) : null))

  const [step, setStep] = useState(1)
  const [companyInfo, setCompanyInfo] = useState(() => ({
    companyName: location.state?.companyName || existingProfile?.companyName || '',
    logoUrl: existingProfile?.logoUrl || null,
    phone: location.state?.phone || existingProfile?.phone || '',
    email: email || '',
    address: existingProfile?.address || '',
    city: existingProfile?.city || '',
    state: existingProfile?.state || '',
    country: existingProfile?.country || 'Nigeria',
  }))
  const [paymentAccount, setPaymentAccount] = useState(existingProfile?.paymentAccount || null)
  const [priceFloor, setPriceFloor] = useState(existingProfile?.priceFloor ?? null)
  const [serverError, setServerError] = useState('')
  const [finishing, setFinishing] = useState(false)

  // Company Setup is strictly one-time: no session sends you to login,
  // and an already-onboarded session sends you straight to the dashboard.
  useEffect(() => {
    if (!email) {
      navigate(ROUTES.businessLogin, { replace: true })
      return
    }
    if (session?.setupComplete) {
      navigate(ROUTES.businessDashboard, { replace: true })
    }
  }, [email, session, navigate])

  if (!email || session?.setupComplete) return null

  const handleCompanyInfoSubmit = (values) => {
    setCompanyInfo(values)
    setStep(2)
  }

  const handlePaymentSubmit = (values) => {
    setPaymentAccount(values)
    setStep(3)
  }

  const handlePriceFloorSubmit = (values) => {
    setPriceFloor(values.minimumPrice)
    setStep(4)
  }

  const handleFinish = async () => {
    setServerError('')
    setFinishing(true)
    try {
      const profile = await completeCompanySetup(email, { ...companyInfo, paymentAccount, priceFloor })
      updateSession({ email, companyName: companyInfo.companyName, setupComplete: profile.setupComplete })
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

      <div className="mt-8 rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 sm:p-8">
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
                defaultValues={priceFloor ? { minimumPrice: String(priceFloor) } : undefined}
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
                priceFloor={priceFloor}
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
