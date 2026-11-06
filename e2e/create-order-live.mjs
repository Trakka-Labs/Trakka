/**
 * Visible (non-headless) automation for the Trakka dashboard.
 * On first load it asks which flow to run: create delivery, or create driver.
 * A persistent profile keeps the login; the first run may need a one-time
 * manual login (the script waits for it). Fields are typed with a visible
 * keystroke delay so a human watching the window sees every input.
 *
 * Run:  node e2e/create-order-live.mjs
 * Env:  E2E_APP_URL        (default https://www.trakka.online)
 *       E2E_BROWSER_PATH   (default: system Brave/Chrome, via browser.mjs)
 *       E2E_PROFILE_DIR    (default ~/.trakka-automation-profile)
 *       E2E_PHOTO          optional path to a package photo (JPEG/PNG/WebP, <2 MB)
 *       E2E_TASK           optional "delivery" | "driver" to skip the prompt
 */
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import puppeteer from 'puppeteer-core'
import { browserExecutable, expect } from './browser.mjs'

const APP_URL = (process.env.E2E_APP_URL || 'https://www.trakka.online').replace(/\/$/, '')
const appUrl = (path = '/') => `${APP_URL}${path}`

const VIEW_DELAY_MS = Number(process.env.E2E_TYPE_DELAY || 25)
const STEP_PAUSE_MS = Number(process.env.E2E_STEP_PAUSE || 500)

const PROFILE_DIR = process.env.E2E_PROFILE_DIR
  ? resolve(process.env.E2E_PROFILE_DIR)
  : join(homedir(), '.trakka-automation-profile')

const PHOTO = process.env.E2E_PHOTO ? resolve(process.env.E2E_PHOTO) : null

// ------------------------------------------------------------ driver payload

const DRIVER = {
  displayName: 'Osaze Iyamu',
  phone: '08031459029',
  capacity: '12',
}

async function askTask() {
  const forced = process.env.E2E_TASK?.toLowerCase()
  if (forced === 'delivery' || forced === 'driver') return forced
  const readline = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = (
      await readline.question(
        'What should this automation run?\n  1) Create a delivery order\n  2) Create (onboard) a driver\nChoice [1]: ',
      )
    ).trim()
    return answer === '2' ? 'driver' : 'delivery'
  } finally {
    readline.close()
  }
}


// ------------------------------------------------------------ order payload

const ORDER = {
  pickupAddress: '12 Ihama Road, Benin City',
  pickupNeighborhood: 'GRA',
  pickupLandmark: 'Opposite the old pilgrim centre',
  pickupContactName: 'Ivie Omoregie',
  pickupContactPhone: '08032147726',
  dropoffAddress: '45 Ugbowo-Lagos Road, Benin City',
  dropoffNeighborhood: 'Ugbowo',
  dropoffLandmark: 'Blue gate beside the filling station',
  recipientName: 'Efe Osagie',
  recipientPhone: '08032147726',
  packageDescription: 'Small electronics parcel',
  declaredValue: '25000',
  notes: 'Fragile item. Keep upright and call before arrival.',
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

/** Wait until the rendered page contains the given text. */
async function waitForText(page, text, timeout = 15_000) {
  await page.waitForFunction(
    (target) => document.body?.innerText.includes(target),
    { timeout, polling: 250 },
    text,
  )
}

// ------------------------------------------------------- visible primitives

async function scrollToField(page, selector) {
  await page.waitForSelector(selector, { visible: true, timeout: 15_000 })
  await page.evaluate((target) => {
    document.querySelector(target)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, selector)
  await sleep(200)
}

/** Focus a control and type with a visible keystroke delay. */
async function typeVisible(page, selector, value) {
  await scrollToField(page, selector)
  // Clear any prefilled value deterministically (e.g. the Capacity input
  // defaults to "10") before typing, so we append nothing to existing digits.
  await page.focus(selector)
  await page.evaluate((target) => {
    const control = document.querySelector(target)
    if (!control) return
    const proto = control.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype
    const setValue = Object.getOwnPropertyDescriptor(proto, 'value').set
    setValue.call(control, '')
    control.dispatchEvent(new Event('input', { bubbles: true }))
    control.dispatchEvent(new Event('change', { bubbles: true }))
  }, selector)
  await sleep(150)
  if (value) {
    await page.type(selector, value, { delay: VIEW_DELAY_MS })
  }
  await sleep(150)
}

async function selectNeighborhood(page, selectId, value) {
  await scrollToField(page, `#${selectId}`)
  await page.select(`#${selectId}`, value)
  await sleep(150)
}

/** Click a ChoiceCard radio by its rendered description text. */
async function clickChoice(page, descriptionText) {
  const clicked = await page.evaluate((text) => {
    const label = [...document.querySelectorAll('label')]
      .find((n) => n.textContent.includes(text))
    if (!label) return false
    label.scrollIntoView({ block: 'center', behavior: 'smooth' })
    label.click()
    return true
  }, descriptionText)
  expect(clicked, `choice card not found: ${descriptionText}`)
  await sleep(STEP_PAUSE_MS)
}

async function clickButtonByText(page, text) {
  const clicked = await page.evaluate((needle) => {
    const node = [...document.querySelectorAll('button')]
      .find((n) => n.textContent.trim().includes(needle))
    if (!node) return false
    node.scrollIntoView({ block: 'center', behavior: 'smooth' })
    node.click()
    return true
  }, text)
  expect(clicked, `button not found: ${text}`)
}

// ------------------------------------------------------------------- runner

const browser = await puppeteer.launch({
  executablePath: browserExecutable(),
  headless: false, // always visible — this is the point of the script
  slowMo: 60,
  userDataDir: PROFILE_DIR, // persisted login across runs
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=BraveWelcome,BraveVPN,BraveWallet,BraveAIAPI,BraveNews',
    '--window-size=1280,1000',
  ],
  defaultViewport: null, // use the real window size
})

try {
  // Always drive an explicitly created, foregrounded tab — never assume the
  // browser's initial tab is the visible one (Brave's welcome/first-run tabs
  // and preexisting about:blank tabs differ across profiles).
  const page = await browser.newPage()
  await page.bringToFront()

  // Surface the browser-side console so a blank page is never silent.
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) console.log(`[console] ${message.type()}: ${message.text()}`)
  })
  page.on('pageerror', (error) => console.log(`[pageerror] ${error.message}`))
  page.on('response', async (response) => {
    if (response.url().includes('/api/') && response.status() >= 400) {
      const body = await response.json().catch(() => null)
      console.log(`[api ${response.status()}] ${response.request().method()} ${response.request().url()}`)
      if (body !== null) console.log('           body:', JSON.stringify(body).slice(0, 300))
    }
  })
  page.on('requestfailed', (request) => {
    if (request.resourceType() === 'document' || request.resourceType() === 'script') {
      console.log(`[requestfailed] ${request.failure()?.errorText} at ${request.url()}`)
    }
  })

  // 1. Land on the homepage, then let the user log in by hand. The script
  // waits until a signed-in state is visible, then continues automatically.
  console.log(`→ opening ${APP_URL} …`)
  await page.goto(APP_URL, { waitUntil: 'load', timeout: 60_000 })
  await page.bringToFront()
  console.log(`→ landed on ${page.url()}`)

  // Optional nudge: if the landing page shows a "Log in" affordance, click it
  // so the login form is on screen; otherwise the user can use the site nav.
  await sleep(2_000)
  await page.evaluate(() => {
    const node = [...document.querySelectorAll('a, button')]
      .find((n) => /^log in|sign in$/i.test(n.textContent.trim()))
    node?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    node?.click()
  })
  console.log('\n⏳ The window is on the site — enter your email and password and log in.')
  console.log('   The script continues automatically once you are signed in…\n')

  await page.waitForFunction(
    () => {
      const url = location.href
      const text = document.body?.innerText ?? ''
      const onBusinessApp = /\/business(?!\/login|\/register)/.test(url)
      const passwordField = document.querySelector('input[type="password"]')
      return onBusinessApp && !passwordField && text.trim().length > 40
    },
    { timeout: 300_000, polling: 500 },
  )
  console.log(`✔ Signed in as of ${page.url()}`)

  const task = await askTask()

  if (task === 'driver') {
    await runCreateDriver(page)
  } else {
    await runCreateDelivery(page)
  }
} finally {
  await browser.close()
}

// ---------------------------------------------------------------- delivery

async function runCreateDelivery(page) {
  await page.goto(appUrl('/business/deliveries/new'), { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    () => /create delivery/i.test(document.body?.innerText ?? ''),
    { timeout: 45_000, polling: 500 },
  )
  console.log('✔ Create-delivery form visible — filling the form visibly')

  // Pickup section.
  await typeVisible(page, '#pickupAddress', ORDER.pickupAddress)
  await selectNeighborhood(page, 'pickupNeighborhood', ORDER.pickupNeighborhood)
  await typeVisible(page, '#pickupLandmark', ORDER.pickupLandmark)
  await typeVisible(page, '#pickupContactName', ORDER.pickupContactName)
  await typeVisible(page, '#pickupContactPhone', ORDER.pickupContactPhone)
  console.log('✔ Pickup section entered')

  // Delivery section.
  await typeVisible(page, '#dropoffAddress', ORDER.dropoffAddress)
  await selectNeighborhood(page, 'dropoffNeighborhood', ORDER.dropoffNeighborhood)
  await typeVisible(page, '#dropoffLandmark', ORDER.dropoffLandmark)
  await typeVisible(page, '#recipientName', ORDER.recipientName)
  await typeVisible(page, '#recipientPhone', ORDER.recipientPhone)
  console.log('✔ Delivery section entered')

  // Package section.
  await typeVisible(page, '#packageDescription', ORDER.packageDescription)
  await typeVisible(page, '#declaredValue', ORDER.declaredValue)
  await typeVisible(page, '#notes', ORDER.notes)

  if (PHOTO) {
    if (!existsSync(PHOTO)) throw new Error(`E2E_PHOTO not found: ${PHOTO}`)
    const fileInput = await page.$('input[type="file"][accept*="image"]')
    expect(fileInput, 'package photo input not found')
    await fileInput.uploadFile(PHOTO)
    await sleep(STEP_PAUSE_MS)
  }
  console.log('✔ Package section entered')

  // Service and payment (service default = "Normal / batched"; payment default = "Sender paid").
  // The delivery-fee field is left at its prefilled baseline so the schema floor passes.
  await clickChoice(page, 'Sender paid')
  console.log('✔ Service & payment confirmed (defaults kept as-is)')

  // Submit and capture the success screen.
  await scrollToField(page, 'button[type="submit"]')
  await clickButtonByText(page, 'Create delivery')
  await waitForText(page, 'Delivery created', 30_000)
  await waitForText(page, 'Ready for dispatch', 30_000)

  const trackingId = await page.evaluate(() => {
    const text = document.body.innerText
    return text.match(/TRK-\d{4}-[0-9A-Z]+/)?.[0] ?? 'tracking id not shown'
  })
  console.log(`\n🎉 Delivery created — tracking id: ${trackingId}`)
  console.log('   The window stays open for 10s so you can see the success page…')
  await sleep(10_000)
}

// ------------------------------------------------------------------ driver

async function runCreateDriver(page) {
  await page.goto(appUrl('/business/drivers'), { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    () => /onboard a driver/i.test(document.body?.innerText ?? ''),
    { timeout: 45_000, polling: 500 },
  )
  console.log('✔ Drivers page visible — onboarding a driver…')

  await typeVisible(page, 'input[placeholder="Driver name"]', DRIVER.displayName)
  await typeVisible(page, 'input[placeholder="Phone number"]', DRIVER.phone)
  await typeVisible(page, 'input[placeholder="Capacity"]', DRIVER.capacity)
  console.log('✔ Driver details entered')

  await clickButtonByText(page, 'Add driver')
  await waitForText(page, 'was added to your driver team', 30_000)
  const createdName = (await page.evaluate(() => document.body?.innerText ?? '')).match(
    /\S[\S ]*?was added to your driver team/,
  )?.[0]
  console.log(`\n🎉 Driver onboarded — "${createdName ?? DRIVER.displayName}"`)
  console.log('   The window stays open for 10s so you can see the team…')
  await sleep(10_000)
}
