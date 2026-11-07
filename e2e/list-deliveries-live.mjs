/**
 * Read-only inspection: open /business/deliveries in the automation profile
 * and print the deliveries that THIS account sees on the chosen stack
 * (local dev or the deployed site — it prompts, same as create-order-live).
 * Creates nothing. Run: node e2e/list-deliveries-live.mjs
 */
import puppeteer from 'puppeteer-core'
import { browserExecutable } from './browser.mjs'
import { askEnvironment, profileDirFor } from './target.mjs'

const TARGET = await askEnvironment()
const APP_URL = TARGET.url
const appUrl = (path = '/') => `${APP_URL}${path}`
const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

const PROFILE_DIR = profileDirFor(TARGET.env)

const browser = await puppeteer.launch({
  executablePath: browserExecutable(),
  headless: false,
  slowMo: 40,
  userDataDir: PROFILE_DIR,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=BraveWelcome,BraveVPN,BraveWallet,BraveAIAPI,BraveNews',
    '--window-size=1280,1000',
  ],
  defaultViewport: null,
})

try {
  const page = await browser.newPage()
  await page.bringToFront()

  console.log(`→ target: ${TARGET.env === 'local' ? 'LOCAL dev' : 'REMOTE / deployed'} — ${APP_URL}`)
  console.log(`→ browser profile: ${PROFILE_DIR}`)
  await page.goto(appUrl('/business/deliveries'), { waitUntil: 'load', timeout: 60_000 })
  await page.bringToFront()
  await sleep(3_000)

  const state = await page.evaluate(() => ({
    url: location.href,
    text: (document.body?.innerText ?? '').slice(0, 1_500),
  }))
  console.log(`URL: ${state.url}\n`)
  console.log('---- deliveries page shows ----')
  console.log(state.text)

  // Keep the window open briefly so the human can eyeball it too.
  await sleep(15_000)
} finally {
  await browser.close()
}
