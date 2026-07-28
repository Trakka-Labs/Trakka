// Mock backend for Business Authentication and Company Setup.
// Simulates network latency and a persistent business profile store so the
// full flow — signup, login, onboarding — can be reviewed end-to-end
// before a real API exists.

const DEMO_ACCOUNT = {
  email: 'demo@trakka.africa',
  password: 'Trakka@123',
  companyName: 'Demo Logistics Ltd',
}

export const DEMO_OTP = '123456'

const registeredEmails = new Set([DEMO_ACCOUNT.email])

// email -> business profile. Tracks onboarding status so returning users
// skip Company Setup once it's been completed.
const businessProfiles = new Map([
  [
    DEMO_ACCOUNT.email,
    {
      email: DEMO_ACCOUNT.email,
      companyName: DEMO_ACCOUNT.companyName,
      phone: '+234 801 234 5678',
      address: '14 Adeola Odeku Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      paymentAccount: {
        bankName: 'GTBank',
        accountNumber: '0123456789',
        accountHolderName: 'Demo Logistics Ltd',
      },
      priceFloor: 1500,
      setupComplete: true,
    },
  ],
])

const delay = (ms = 1100) => new Promise((resolve) => setTimeout(resolve, ms))

export function maskEmail(email) {
  const [user, domain] = email.split('@')
  if (!domain) return email
  const visible = user.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(user.length - 2, 2))}@${domain}`
}

export async function registerBusiness({ companyName, email, phone, password }) {
  await delay()
  const key = email.toLowerCase()
  if (registeredEmails.has(key)) {
    throw new Error('An account with this email already exists.')
  }
  if (!password) {
    throw new Error('A password is required.')
  }
  registeredEmails.add(key)
  businessProfiles.set(key, { email, companyName, phone, setupComplete: false })
  return { companyName, email, phone, setupComplete: false }
}

export async function loginBusiness({ email, password }) {
  await delay(900)
  const key = email.toLowerCase()
  const isDemoAccount = key === DEMO_ACCOUNT.email
  const knownEmail = isDemoAccount || registeredEmails.has(key)

  if (!knownEmail) {
    throw new Error('No business account found for this email.')
  }
  if (isDemoAccount && password !== DEMO_ACCOUNT.password) {
    throw new Error('Incorrect email or password.')
  }

  const profile = businessProfiles.get(key)
  return {
    email,
    companyName: profile?.companyName || (isDemoAccount ? DEMO_ACCOUNT.companyName : 'Your Business'),
    setupComplete: profile?.setupComplete ?? false,
  }
}

export async function googleAuth({ intent = 'login' } = {}) {
  await delay(1200)
  const email = 'you@business.com'
  const key = email.toLowerCase()

  if (intent === 'signup' && !businessProfiles.has(key)) {
    businessProfiles.set(key, { email, companyName: 'Your Business', phone: '', setupComplete: false })
  }
  if (!businessProfiles.has(key)) {
    businessProfiles.set(key, { email, companyName: 'Your Business', phone: '', setupComplete: false })
  }

  const profile = businessProfiles.get(key)
  return { email, companyName: profile.companyName, setupComplete: profile.setupComplete }
}

export async function requestPasswordReset({ email }) {
  await delay(1000)
  const key = email.toLowerCase()
  const isDemoAccount = key === DEMO_ACCOUNT.email
  if (!isDemoAccount && !registeredEmails.has(key)) {
    throw new Error('No business account found for this email.')
  }
  return { maskedDestination: maskEmail(email) }
}

export async function verifyOtp({ email, code }) {
  await delay(800)
  if (code !== DEMO_OTP) {
    throw new Error('That code is incorrect or expired.')
  }
  return { resetToken: btoa(`${email}:${Date.now()}`) }
}

export async function resetPassword({ email, password, resetToken }) {
  await delay(1000)
  if (!resetToken) {
    throw new Error('Your reset session expired. Please start again.')
  }
  if (!password) {
    throw new Error('A new password is required.')
  }
  return { success: true, email }
}

export function getBusinessProfile(email) {
  return businessProfiles.get(email.toLowerCase()) || null
}

// A business is only considered fully onboarded once company info, a
// payout account, and a minimum price floor all exist — matching the
// three conditions required to reach the Business Dashboard.
export function isOnboardingComplete(profile) {
  if (!profile) return false
  const hasCompanyInfo = Boolean(
    profile.companyName && profile.address && profile.city && profile.state && profile.country
  )
  const hasPayoutAccount = Boolean(
    profile.paymentAccount?.bankName && profile.paymentAccount?.accountNumber && profile.paymentAccount?.accountHolderName
  )
  const hasPriceFloor = typeof profile.priceFloor === 'number' && profile.priceFloor > 0
  return hasCompanyInfo && hasPayoutAccount && hasPriceFloor
}

export async function completeCompanySetup(email, payload) {
  await delay(900)
  const key = email.toLowerCase()
  const existing = businessProfiles.get(key) || {}
  const merged = { ...existing, ...payload, email }
  const profile = {
    ...merged,
    setupComplete: isOnboardingComplete(merged),
    completedAt: new Date().toISOString(),
  }
  businessProfiles.set(key, profile)
  return profile
}
