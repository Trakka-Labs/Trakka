/**
 * Visible (non-headless) demo automation: create a delivery order.
 *
 * Assumes the user is already logged in — a persistent profile is used, so
 * the first run may need a one-time manual login (the script waits for it).
 * Every field is typed with a visible keystroke delay so a human watching the
 * window sees the information being entered.
 *
 * Run:  node e2e/create-order-live.mjs
 * Env:  E2E_APP_URL        (default https://www.trakka.online)
 *       E2E_BROWSER_PATH   (default: system Brave/Chrome, via browser.mjs)
 *       E2E_PROFILE_DIR    (default ~/.trakka-automation-profile)
 *       E2E_PHOTO          optional path to a package photo (JPEG/PNG/WebP, <2 MB)
 */
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import puppeteer from 'puppeteer-core'
import { appUrl, browserExecutable, expect, waitForText } from './browser.mjs'

const VIEW_DELAY_MS = Number(process.env.E2E_TYPE_DELAY || 25)
const STEP_PAUSE_MS = Number(process.env.E2E_STEP_PAUSE || 500)

const PROFILE_DIR = process.env.E2E_PROFILE_DIR
  ? resolve(process.env.E2E_PROFILE_DIR)
  : join(homedir(), '.trakka-automation-profile')

const PHOTO = process.env.E2E_PHOTO ? resolve(process.env.E2E_PHOTO) : null

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
  await page.click(selector, { clickCount: 3 }) // select existing content, if any
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
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,1000'],
  defaultViewport: null, // use the real window size
})

try {
  const page = (await browser.pages())[0] ?? (await browser.newPage())

  // 1. Open the create-delivery page and make sure we are authenticated.
  await page.goto(appUrl('/business/deliveries/new'), { waitUntil: 'domcontentloaded' })
  await sleep(1_000)

  const bodyText = await page.evaluate(() => document.body?.innerText ?? '')
  if (/log in|sign in|welcome back/i.test(bodyText) && !/create delivery/i.test(bodyText)) {
    console.log('\n⏳ Not logged in yet. Log in inside the opened window; the script will continue automatically…\n')
    await page.waitForFunction(
      () => /create delivery/i.test(document.body?.innerText ?? ''),
      { timeout: 300_000 },
    )
    await page.goto(appUrl('/business/deliveries/new'), { waitUntil: 'domcontentloaded' })
  }
  await waitForText(page, 'Create delivery', 30_000)
  console.log('✔ Authenticated session confirmed — filling the form visibly')

  // 2. Pickup section.
  await typeVisible(page, '#pickupAddress', ORDER.pickupAddress)
  await selectNeighborhood(page, 'pickupNeighborhood', ORDER.pickupNeighborhood)
  await typeVisible(page, '#pickupLandmark', ORDER.pickupLandmark)
  await typeVisible(page, '#pickupContactName', ORDER.pickupContactName)
  await typeVisible(page, '#pickupContactPhone', ORDER.pickupContactPhone)
  console.log('✔ Pickup section entered')

  // 3. Delivery section.
  await typeVisible(page, '#dropoffAddress', ORDER.dropoffAddress)
  await selectNeighborhood(page, 'dropoffNeighborhood', ORDER.dropoffNeighborhood)
  await typeVisible(page, '#dropoffLandmark', ORDER.dropoffLandmark)
  await typeVisible(page, '#recipientName', ORDER.recipientName)
  await typeVisible(page, '#recipientPhone', ORDER.recipientPhone)
  console.log('✔ Delivery section entered')

  // 4. Package section.
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

  // 5. Service and payment (service default = "Normal / batched"; payment default = "Sender paid").
  //    The delivery-fee field is left at its prefilled baseline so the schema floor passes.
  await clickChoice(page, 'Sender paid')
  console.log('✔ Service & payment confirmed (defaults kept as-is)')

  // 6. Submit and capture the success screen.
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
} finally {
  await browser.close()
}
