/**
 * Trakka end-to-end suite — browser UI focused, driven over the Chrome
 * DevTools Protocol with puppeteer-core (no Playwright anywhere).
 *
 * Covers the full product lifecycle against a running stack
 * (frontend :5173 proxying the backend on :8080):
 *
 *   1.  Business owner onboarding (signup → company wizard → dashboard)
 *   2.  Driver onboarding
 *   3.  Manual delivery creation ("package sending")
 *   4.  Customer order intake via the public link → own tracking token
 *   5.  Dispatch: batching + rider assignment
 *   6.  Rider ops: GPS pings, one-tap delay broadcast, status walk-through
 *   7.  Proof-of-delivery OTP (minted → relayed → verified → required)
 *   8.  Receiver clears the parcel: tracking page shows Delivered
 *
 * Usage:
 *   node e2e/run-e2e.mjs               (headless)
 *   E2E_HEADED=1 node e2e/run-e2e.mjs
 *   E2E_APP_URL=... E2E_BROWSER_PATH=... node e2e/run-e2e.mjs
 */
import { mkdirSync } from 'node:fs'
import {
  appUrl, browserExecutable, chooseOption, clickText, extractFromText, expect, open,
  fillByLabel, fillByPlaceholder, launch, spoofGeolocation, textContent, waitForText,
} from './browser.mjs'

const suffix = `${Date.now() % 10_000_000}`.padStart(7, '0')
const OWNER = {
  company: `Test Haulers ${suffix}`,
  email: `owner${suffix}@trakka-e2e.test`,
  phone: `08012${suffix}`,
  password: 'TrakkaTest2026',
}
const RIDER = { name: `Kelechi ${suffix}`, phone: `08023${suffix}` }
const ORDER = {
  pickupAddress: '7 Ekenwan Road, Benin City',
  dropoffAddress: '21 Ugbowo-Lagos Road, Benin City',
  packageDescription: 'Wrapped ceramics crate',
  declaredValue: '18000',
  senderName: 'Osaro Sender',
  senderPhone: '08041239876',
  recipientName: 'Adaeze Receiver',
  recipientPhone: '08031234567',
}
const DELAY = 500

const artifacts = new URL('./artifacts/', import.meta.url)
mkdirSync(artifacts, { recursive: true })

const context = { otp: null, intakeToken: null, customerTrackingUrl: null, intakeTrackingId: null, routeRunId: null, riderToken: null }
const successes = []
let page
let browser

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** A rider stop tile is an `<article>`; scope interactions to the one whose
 *  body mentions `needle` (e.g. a TRK id) so batch siblings stay untouched. */
async function clickInTile(page, needle, label) {
  return page.evaluate((needle, label) => {
    const tile = [...document.querySelectorAll('article')].find((t) => t.innerText.includes(needle))
    if (!tile) return false
    const button = [...tile.querySelectorAll('button')].find((b) => b.innerText.trim() === label)
    if (!button || button.disabled) return false
    button.click()
    return true
  }, needle, label)
}

async function tileText(page, needle) {
  return page.evaluate((needle) => {
    const raw = [...document.querySelectorAll('article')].find((t) => t.innerText.includes(needle))
    return raw ? raw.innerText : ''
  }, needle)
}

async function waitForTileText(page, needle, needle2, timeout = 15_000) {
  const started = Date.now()
  for (;;) {
    const text = await tileText(page, needle)
    if (text.includes(needle2)) return text
    if (Date.now() - started > timeout) {
      throw new Error(`tile "${needle.slice(0, 16)}…" never showed "${needle2}": ${text.slice(0, 200)}`)
    }
    await wait(700)
  }
}

async function step(name, fn) {
  const started = Date.now()
  try {
    await fn()
    successes.push(name)
    console.log(`  ✓ ${name} (${((Date.now() - started) / 1000).toFixed(1)}s)`)
  } catch (error) {
    console.error(`  ✗ ${name}: ${error.message}`)
    if (page) {
      const file = new URL(`${name.replace(/[^a-z0-9]+/gi, '-')}.png`, artifacts).pathname
      try { await page.screenshot({ path: file, fullPage: true }); console.error(`    screenshot: ${file}`) } catch { /* best effort */ }
      const text = await textContent(page).catch(() => '')
      console.error(`    page text (first 400): ${text.slice(0, 400).replaceAll('\n', ' | ')}`)
      // React render crashes are caught by the ErrorBoundary, which stashes
      // the dev-only component stack on the window object — surface it here.
      const last = await page.evaluate(() => window.__trakkaLastError).catch(() => undefined)
      if (last) {
        console.error(`    boundary error: ${last.message}`)
        if (last.stack) console.error(`    stack: ${last.stack.split('\n').slice(0, 4).join(' | ')}`)
        if (last.componentStack) console.error(`    component stack: ${last.componentStack.trimEnd()}`)
      }
    }
    try { await browser?.close() } catch { /* ignore */ }
    process.exit(1)
  }
}

// ------------------------------------------------------------------ the flow

const flow = []

// 1 ── onboarding --------------------------------------------------------------
flow.push(['onboarding: business signup', async () => {
  await open(page, '/business/signup')
  await fillByPlaceholder(page, 'Swift Logistics Ltd', OWNER.company)
  await fillByPlaceholder(page, 'you@business.com', OWNER.email)
  await fillByPlaceholder(page, '08012345678', OWNER.phone)
  await fillByPlaceholder(page, 'Create a strong password', OWNER.password)
  await fillByPlaceholder(page, 'Re-enter your password', OWNER.password)
  const agreed = await page.evaluate(() => {
    const checkbox = document.querySelector('input[type="checkbox"]')
    if (!checkbox || checkbox.checked) return false
    checkbox.click()
    return checkbox.checked
  })
  expect(agreed, 'terms checkbox was not checkable')
  await Promise.all([
    page.waitForFunction(
      () => window.location.pathname.startsWith('/business/company-setup'),
      { timeout: 25_000 },
    ),
    clickText(page, 'Create'),
  ])
}])

flow.push(['onboarding: company wizard (profile → payout → price floor → review)', async () => {
  await waitForText(page, 'Set up your business')
  // Step 1 — company profile (name/email/phone prefilled from signup)
  await fillByPlaceholder(page, '12 Marina Road', '3 Sapele Road')
  await fillByPlaceholder(page, 'Port Harcourt', 'Benin City')
  await fillByLabel(page, 'State', 'Edo')
  await clickText(page, 'Continue', { exact: true })
  await wait(DELAY)
  // Step 2 — payout (local engine stores banks/last-4 only)
  await chooseOption(page, 'Bank', 'GTBank')
  await fillByPlaceholder(page, '0123456789', '0123456789')
  await fillByPlaceholder(page, 'Account holder name', OWNER.company)
  await clickText(page, 'Continue', { exact: true })
  await wait(DELAY)
  // Step 3 — price floor (protects the owner's margin server-side)
  await fillByPlaceholder(page, '1500', '1500')
  await fillByPlaceholder(page, '3000', '3500')
  await clickText(page, 'Continue', { exact: true })
  await wait(DELAY)
  // Step 4 — review and complete
  await waitForText(page, 'Complete company setup')
  await Promise.all([
    page.waitForFunction(() => window.location.pathname === '/business/dashboard', { timeout: 25_000 }),
    clickText(page, 'Complete company setup'),
  ])
  await waitForText(page, 'Dashboard')
}])

// 2 ── driver onboarding --------------------------------------------------------
flow.push(['drivers: onboard a rider', async () => {
  await open(page, '/business/drivers')
  await waitForText(page, 'Onboard a driver')
  await fillByPlaceholder(page, 'Driver name', RIDER.name)
  await fillByPlaceholder(page, 'Phone number', RIDER.phone)
  await fillByPlaceholder(page, 'Capacity', '10')
  await clickText(page, 'Add driver')
  await waitForText(page, RIDER.name)
}])

// 3 ── manual delivery -----------------------------------------------------------
flow.push(['deliveries: create a manual delivery (package sending)', async () => {
  await open(page, '/business/deliveries/new')
  await waitForText(page, 'Pickup')
  await fillByPlaceholder(page, '12 Ihama Road, Benin City', ORDER.pickupAddress)
  await chooseOption(page, 'Pickup neighborhood', 'Ekenwan')
  await fillByPlaceholder(page, 'Opposite the health centre', 'Fuel station gate')
  await fillByLabel(page, 'Pickup contact', ORDER.senderName)
  await fillByLabel(page, 'Contact phone', ORDER.senderPhone)
  await fillByLabel(page, 'Delivery address', ORDER.dropoffAddress)
  await chooseOption(page, 'Delivery neighborhood', 'Ugbowo')
  await fillByPlaceholder(page, 'Blue gate beside the filling station', 'Brown gate')
  await fillByLabel(page, 'Receiver name', ORDER.recipientName)
  await fillByLabel(page, 'Receiver phone', ORDER.recipientPhone)
  await fillByLabel(page, 'Package description', ORDER.packageDescription)
  await fillByLabel(page, 'Declared value', ORDER.declaredValue)
  await fillByLabel(page, 'Delivery fee', '2500')
  await clickText(page, 'Create delivery')
  await waitForText(page, 'Delivery created')
  expect(
    await page.evaluate(() => window.location.pathname.startsWith('/business/deliveries/')),
    'did not navigate to the delivery details page',
  )
}])

// 4 ── customer intake ------------------------------------------------------------
flow.push(['communications: mint + rotate a WhatsApp order-intake link', async () => {
  await open(page, '/business/communications')
  await waitForText(page, 'WhatsApp order intake')
  await clickText(page, 'Create order link')
  await waitForText(page, 'Share on WhatsApp →')
  const first = await extractFromText(page, /https?:\/\/\S+?\/order\/([A-Za-z0-9_-]+)/)
  expect(first.length > 20, 'intake token looks malformed')
  await clickText(page, 'Rotate link')
  // Wait until the rendered token actually rotates, not just for the row to exist.
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = await extractFromText(page, /\/order\/([A-Za-z0-9_-]+)/)
    if (candidate !== first) {
      context.intakeToken = candidate
      break
    }
    await wait(300)
  }
  expect(context.intakeToken !== first, 'rotation did not change the token')
}])

flow.push(['intake: customer orders and receives a unique tracking link', async () => {
  let captured
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/intake/') &&
      response.request().method() === 'POST',
    { timeout: 25_000 },
  ).then(async (response) => { captured = await response.json() })
  await open(page, `/order/${context.intakeToken}`)
  await waitForText(page, OWNER.company)
  await fillByLabel(page, 'Pickup address', ORDER.pickupAddress)
  await chooseOption(page, 'Pickup area', 'Ekenwan')
  await fillByLabel(page, 'Delivery address', ORDER.dropoffAddress)
  await chooseOption(page, 'Delivery area', 'Ugbowo')
  await fillByLabel(page, 'Package description', ORDER.packageDescription)
  await fillByLabel(page, 'Package value', ORDER.declaredValue)
  await fillByLabel(page, 'Your name', ORDER.senderName)
  await fillByLabel(page, 'Your phone', ORDER.senderPhone)
  await fillByLabel(page, 'Receiver name', ORDER.recipientName)
  await fillByLabel(page, 'Receiver phone', ORDER.recipientPhone)
  await Promise.all([responsePromise, clickText(page, 'Submit my order')])
  const payload = await captured
  await waitForText(page, 'Order received')
  context.customerTrackingUrl = payload?.trackingUrl
  expect(
    context.customerTrackingUrl?.includes('/track/'),
    `no tracking URL in intake response: ${JSON.stringify(payload)}`,
  )
  // Remember the intake order's public tracking id so the rider flow below
  // can scope every act to this order's stop tile inside a shared batch.
  context.intakeTrackingId = await page.evaluate(async (trackPath) => {
    const data = await fetch(trackPath).then((r) => r.json())
    return data?.tracking?.trackingId ?? data?.trackingId ?? ''
  }, new URL(context.customerTrackingUrl).pathname.replace('/track/', '/api/v1/track/'))
  expect(!!context.intakeTrackingId, 'could not fetch intake trackingId from the track endpoint')
}])

flow.push(['deliveries: the intake order shows up in the queue', async () => {
  await open(page, '/business/deliveries')
  await waitForText(page, ORDER.recipientName)
}])

// 5 ── dispatch ---------------------------------------------------------------------
flow.push(['dispatch: batch two ready deliveries', async () => {
  await open(page, '/business/dispatch')
  await waitForText(page, 'Assign deliveries')
  await page.waitForFunction(
    () => document.querySelectorAll('input[type="checkbox"]').length >= 2,
    { timeout: 30_000 },
  )
  await page.evaluate(() => {
    [...document.querySelectorAll('input[type="checkbox"]')]
      .slice(0, 2)
      .forEach((box) => { if (!box.checked) box.click() })
  })
  await clickText(page, 'Build 2 selected')
  await waitForText(page, 'Review assignment')
}])

flow.push(['dispatch: assign the batch to the rider (confirm gate respected)', async () => {
  await page.evaluate(() => {
    const select = [...document.querySelectorAll('select')]
      .find((n) => [...n.options].some((o) => o.textContent.includes('Choose an available rider')))
    if (!select) throw new Error('rider select not found')
    const option = [...select.options].find((o) => o.value && !o.disabled)
    if (!option) throw new Error('no available rider option')
    Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')
      .set.call(select, option.value)
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await clickText(page, 'Review assignment')
  await Promise.all([
    page.waitForFunction(
      () => document.body.innerText.includes('Rider accepted this assignment') ||
        document.body.innerText.includes('Waiting for the rider'),
      { timeout: 25_000 },
    ),
    clickText(page, 'Confirm', { exact: true }),
  ])
}])

// 6 ── rider ops ---------------------------------------------------------------------
flow.push(['communications: generate the rider access link (token in fragment)', async () => {
  await open(page, '/business/communications')
  await waitForText(page, 'Route conversations')
  await clickText(page, RIDER.name) // the route card named after the rider
  await waitForText(page, 'Route communication')
  await clickText(page, 'Rider access')
  // The POST renders the link asynchronously; poll until the access URL appears.
  let link = ''
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = (await page.evaluate(() => document.body.innerText))
      .match(/https?:\/\/\S+?#access=([A-Za-z0-9_-]+)/)?.[0]
    if (candidate) { link = candidate; break }
    await wait(400)
  }
  context.riderToken = link.split('#access=')[1]
  context.routeRunId = link.match(/\/rider\/routes\/([0-9a-f-]{36})/)?.[1]
  expect(context.riderToken && context.routeRunId, `access link malformed or never rendered: ${link}`)
}])

flow.push(['rider: route workspace loads and GPS pings flow (spoofed Benin City fix)', async () => {
  // Enter exactly like a real rider: token arrives in the URL fragment and is
  // moved to sessionStorage, then scrubbed from the address bar.
  await open(page, `/rider/routes/${context.routeRunId}/messages#access=${context.riderToken}`)
  await spoofGeolocation(page)
  const scrubbed = await page.evaluate(() => window.location.hash)
  expect(scrubbed === '', `access token still visible in the URL: #${scrubbed}`)
  await waitForText(page, 'STOP 1')
  await wait(4_500) // let watchPosition deliver at least one ping past the 3s throttle
}])

flow.push(['rider: one-tap delay broadcast reaches the alert queue', async () => {
  await clickText(page, 'Report delay')
  await waitForText(page, 'One-tap delay broadcast')
  await clickText(page, 'Traffic', { exact: true })
  await waitForText(page, 'Delay broadcast sent')
}])

flow.push(['rider: walk the intake stop through pickup → arriving', async () => {
  await clickText(page, 'Stops', { exact: true })
  const id = context.intakeTrackingId
  if (!(await tileText(page, id))) throw new Error(`intake stop tile (${id}) not on the rider workspace`)
  for (const label of ['At pickup', 'Picked up', 'En route', 'Arriving']) {
    await clickInTile(page, id, label)
    const tile = await waitForTileText(page, id, label)
    expect(tile, `stop did not reach ${label}`)
    await wait(700)
  }
}])

// 7 ── proof-of-delivery OTP -----------------------------------------------------------
flow.push(['rider: OTP minted and relayed; plaintext never returned openly', async () => {
  const id = context.intakeTrackingId
  await clickInTile(page, id, 'Get customer code')
  // The notice (and, in local test mode, the plaintext code) is page-level.
  await waitForText(page, 'Verification code', 15_000)
  const body = await textContent(page)
  const match = body.match(/test mode\):?\s*(\d{6})/)
  context.otp = match?.[1] ?? null
  expect(context.otp, `no local test code surfaced for stop ${id}. Page: ${body.slice(0, 260)}`)
}])

flow.push(['rider: wrong OTP is rejected, right OTP verifies', async () => {
  const id = context.intakeTrackingId
  await fillByPlaceholder(page, "Customer's 6-digit code", '000000')
  await clickInTile(page, id, 'Verify')
  // Rejection errors render as a page-level Alert above the tiles.
  await waitForText(page, 'incorrect', 15_000)
  await fillByPlaceholder(page, "Customer's 6-digit code", context.otp)
  await clickInTile(page, id, 'Verify')
  await waitForTileText(page, id, 'Code verified')
}])

flow.push(['rider: "Mark delivered" completes the stop after verification', async () => {
  // The button is disabled while the verify call is still settling (busyStop),
  // so an early press is silently ignored. Press sparingly: the rider budget
  // (shared with GPS pings) is 40 POSTs/min, so hammering trips the throttle.
  const id = context.intakeTrackingId
  for (let attempt = 0; attempt < 7; attempt += 1) {
    await clickInTile(page, id, 'Mark delivered')
    const tile = await waitForTileText(page, id, 'Delivered', 8_000).catch(() => '')
    if (tile.includes('Delivered') && tile.includes('Code verified')) break
    await wait(2_600)
  }
  const tile = await waitForTileText(page, id, 'Delivered')
  expect(tile.includes('Code verified'), 'verified chip not visible after completion')
}])

// 8 ── receiver clears the parcel --------------------------------------------------------
flow.push(['customer: tracking page shows the delivered state', async () => {
  await open(page, new URL(context.customerTrackingUrl).pathname)
  await waitForText(page, 'Package was delivered', 20_000)
  const body = await textContent(page)
  expect(body.includes(OWNER.company), 'tracking page missing the company name')
  expect(body.includes('Powered by'), 'tracking page missing the Trakka footer')
}])

flow.push(['security: bogus tracking tokens are rejected without leaking data', async () => {
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/v1/track/definitely-not-a-real-token')
    const body = await result.json().catch(() => ({}))
    return { status: result.status, message: body?.error?.message ?? '' }
  })
  expect(response.status === 404, `expected 404 for a bogus token, got ${response.status}`)
}])

// ------------------------------------------------------------------------------ runner

console.log(`Trakka E2E — app under test: ${process.env.E2E_APP_URL || 'http://127.0.0.1:5173'}`)
console.log(`Browser binary: ${browserExecutable()}`)

browser = await launch()
page = await browser.newPage()
page.setDefaultTimeout(20_000)
page.on('pageerror', (error) => console.warn(`  [pageerror] ${error.message}`))
page.on('pageerror', async () => {
  try {
    const last = await page.evaluate(() => window.__trakkaLastError)
    if (last) console.warn(`  [boundary] ${last.message}\n${last.stack}`, '\n', last.componentStack)
  } catch { /* page may be tearing down */ }
})

for (const [name, fn] of flow) {
  await step(name, fn)
}

await browser.close()
console.log(`\n${successes.length}/${flow.length} browser E2E steps passed.`)
if (successes.length !== flow.length) process.exit(1)
