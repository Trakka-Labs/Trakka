import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright'

const argumentsList = process.argv.slice(2)
const countArgument = argumentsList.find((argument) => argument.startsWith('--count='))
const count = Number(countArgument?.split('=')[1] || 1)
const actionDelay = Number(process.env.TRAKKA_ACTION_DELAY_MS || 350)
const successHold = Number(process.env.TRAKKA_SUCCESS_HOLD_MS || 3000)
const loginTimeout = Number(process.env.TRAKKA_LOGIN_TIMEOUT_MS || 300_000)
const appUrl = (process.env.TRAKKA_APP_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const profileDirectory = resolve(
  process.env.TRAKKA_BROWSER_PROFILE || '.cache/trakka-delivery-browser',
)

if (!Number.isInteger(count) || count < 1 || count > 100) {
  throw new Error('--count must be a whole number between 1 and 100')
}
if (!Number.isFinite(actionDelay) || actionDelay < 0) {
  throw new Error('TRAKKA_ACTION_DELAY_MS must be zero or a positive number')
}
if (!Number.isFinite(successHold) || successHold < 0) {
  throw new Error('TRAKKA_SUCCESS_HOLD_MS must be zero or a positive number')
}
if (!Number.isFinite(loginTimeout) || loginTimeout < 1_000) {
  throw new Error('TRAKKA_LOGIN_TIMEOUT_MS must be at least 1000')
}
if (Boolean(process.env.TRAKKA_EMAIL) !== Boolean(process.env.TRAKKA_PASSWORD)) {
  throw new Error('Set both TRAKKA_EMAIL and TRAKKA_PASSWORD, or leave both unset')
}

function chromeExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)
  const executable = candidates.find(existsSync)
  if (!executable) {
    throw new Error('Chrome was not found. Set CHROME_PATH to a Chrome or Chromium executable.')
  }
  return executable
}

function randomDigits(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

function testPhone() {
  return `080${randomDigits(8)}`
}

function deliveryValues(index) {
  const sequence = `${Date.now().toString().slice(-6)}-${index + 1}`
  return {
    pickupAddress: process.env.TRAKKA_PICKUP_ADDRESS || '12 Ihama Road, Benin City',
    pickupNeighborhood: process.env.TRAKKA_PICKUP_NEIGHBORHOOD || 'GRA',
    pickupLandmark: process.env.TRAKKA_PICKUP_LANDMARK || 'Opposite the health centre',
    pickupContactName: process.env.TRAKKA_PICKUP_CONTACT || 'Trakka Test Sender',
    pickupContactPhone: process.env.TRAKKA_PICKUP_PHONE || testPhone(),
    dropoffAddress:
      process.env.TRAKKA_DROPOFF_ADDRESS || '45 Ugbowo-Lagos Road, Benin City',
    dropoffNeighborhood: process.env.TRAKKA_DROPOFF_NEIGHBORHOOD || 'Ugbowo',
    dropoffLandmark:
      process.env.TRAKKA_DROPOFF_LANDMARK || 'Blue gate beside the filling station',
    recipientName: process.env.TRAKKA_RECIPIENT_NAME || `Test Receiver ${sequence}`,
    recipientPhone: process.env.TRAKKA_RECIPIENT_PHONE || testPhone(),
    packageDescription:
      process.env.TRAKKA_PACKAGE_DESCRIPTION || `Automated test parcel ${sequence}`,
    declaredValue: process.env.TRAKKA_DECLARED_VALUE || '25000',
    notes:
      process.env.TRAKKA_NOTES ||
      'Created by automation/create-delivery.js for local development testing.',
    serviceType: process.env.TRAKKA_SERVICE_TYPE || 'normal',
    paymentType: process.env.TRAKKA_PAYMENT_TYPE || 'sender_paid',
    deliveryFee: process.env.TRAKKA_DELIVERY_FEE,
  }
}

function field(page, name) {
  return page.locator(`[name="${name}"]`)
}

async function clickButton(page, text) {
  await page
    .locator('button:visible')
    .filter({ hasText: text })
    .first()
    .click()
}

async function currentAccount(page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/v1/auth/me', { credentials: 'include' })
    if (!response.ok) return null
    const payload = await response.json().catch(() => null)
    return payload?.account || null
  })
}

async function logout(page) {
  await page.evaluate(async () => {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
  })
}

function shouldSwitchAccount(account) {
  if (!account) return false
  const requestedEmail = process.env.TRAKKA_EMAIL?.toLowerCase()
  if (requestedEmail) return account.email?.toLowerCase() !== requestedEmail
  return account.email?.toLowerCase().startsWith('delivery.bot.')
}

async function waitForCurrentBusinessLogin(page) {
  console.log('Sign in to the business that should receive automated deliveries.')
  console.log(`Waiting up to ${Math.round(loginTimeout / 60_000)} minutes for sign-in...`)
  await page.goto(`${appUrl}/business/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForURL(
    (url) => !['/business/login', '/business/signup'].includes(url.pathname),
    { timeout: loginTimeout },
  )
}

async function login(page) {
  const email = process.env.TRAKKA_EMAIL
  const password = process.env.TRAKKA_PASSWORD
  if (!email || !password) return false

  await field(page, 'email').fill(email)
  await field(page, 'password').fill(password)
  await clickButton(page, 'Sign in')
  await page.waitForURL((url) => !['/business/login', '/business/signup'].includes(url.pathname))
  return true
}

async function ensureBusinessSession(page) {
  await page.goto(`${appUrl}/business/deliveries/new`, {
    waitUntil: 'domcontentloaded',
    timeout: 20_000,
  })

  await page.waitForFunction(
    () =>
      Boolean(document.querySelector('[name="pickupAddress"]')) ||
      ['/business/login', '/business/company-setup'].includes(window.location.pathname),
  )

  let account = await currentAccount(page)

  if (shouldSwitchAccount(account)) {
    console.log(`Switching away from saved automation account: ${account.email}`)
    await logout(page)
    account = null
  }

  if (!account) {
    await page.goto(`${appUrl}/business/login`, { waitUntil: 'domcontentloaded' })
    const loggedIn = await login(page)
    if (!loggedIn) await waitForCurrentBusinessLogin(page)
    account = await currentAccount(page)
  }

  if (!account) {
    throw new Error('Sign-in completed without an active business account')
  }

  if (new URL(page.url()).pathname === '/business/company-setup') {
    throw new Error(
      'The selected business still needs company setup. Complete setup before creating automated deliveries.',
    )
  }

  console.log(`Creating deliveries for: ${account.companyName} (${account.email})`)
  await page.goto(`${appUrl}/business/deliveries/new`, {
    waitUntil: 'domcontentloaded',
  })
  await field(page, 'pickupAddress').waitFor({ state: 'visible' })
}

async function createDelivery(page, values) {
  const textFields = [
    'pickupAddress',
    'pickupLandmark',
    'pickupContactName',
    'pickupContactPhone',
    'dropoffAddress',
    'dropoffLandmark',
    'recipientName',
    'recipientPhone',
    'packageDescription',
    'declaredValue',
    'notes',
  ]
  for (const name of textFields) await field(page, name).fill(values[name])

  await field(page, 'pickupNeighborhood').selectOption(values.pickupNeighborhood)
  await field(page, 'dropoffNeighborhood').selectOption(values.dropoffNeighborhood)
  await page
    .locator(`[name="serviceType"][value="${values.serviceType}"]`)
    .check({ force: true })
  await page
    .locator(`[name="paymentType"][value="${values.paymentType}"]`)
    .check({ force: true })
  if (values.deliveryFee) await field(page, 'deliveryFee').fill(values.deliveryFee)

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname.endsWith('/api/v1/orders'),
  )
  await clickButton(page, 'Create delivery')
  const response = await responsePromise
  const payload = await response.json().catch(() => null)
  if (!response.ok()) {
    const message = payload?.message || payload?.error?.message || response.statusText()
    throw new Error(
      `Delivery request failed (${response.status()}): ${
        Array.isArray(message) ? message.join(' ') : message
      }`,
    )
  }

  await page.getByText('Delivery created', { exact: true }).waitFor()
  return payload?.order?.trackingId
}

await mkdir(profileDirectory, { recursive: true })

const context = await chromium.launchPersistentContext(profileDirectory, {
  executablePath: chromeExecutable(),
  headless: false,
  slowMo: actionDelay,
  viewport: { width: 1440, height: 1000 },
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

try {
  const page = context.pages()[0] || (await context.newPage())
  page.setDefaultTimeout(12_000)

  try {
    await ensureBusinessSession(page)
  } catch (error) {
    if (/ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|Navigation timeout/.test(error.message)) {
      throw new Error(
        `Trakka is not reachable at ${appUrl}. Start "npm run dev:backend" and "npm run dev", then retry.`,
      )
    }
    throw error
  }

  for (let index = 0; index < count; index += 1) {
    const trackingId = await createDelivery(page, deliveryValues(index))
    console.log(`Created delivery ${index + 1}/${count}: ${trackingId || 'tracking ID unavailable'}`)
    if (index < count - 1) {
      await clickButton(page, 'Create another delivery')
      await field(page, 'pickupAddress').waitFor({ state: 'visible' })
    }
  }
  await page.waitForTimeout(successHold)
} catch (error) {
  const page = context.pages()[0]
  if (page) {
    const screenshotPath = '/tmp/trakka-create-delivery-error.png'
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
    console.error(`Browser state saved to ${screenshotPath}`)
  }
  throw error
} finally {
  await context.close()
}
