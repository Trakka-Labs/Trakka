/**
 * Minimal CDP-driven browser harness (puppeteer-core, no Playwright).
 *
 * Reuses the Chromium-based browser already installed on the machine
 * (Brave, Google Chrome, or Chromium) — nothing else is downloaded.
 */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const APP_URL = (process.env.E2E_APP_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')

export function browserExecutable() {
  const candidates = [
    process.env.E2E_BROWSER_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/opt/brave.com/brave/brave',
  ].filter(Boolean)
  const found = candidates.find(existsSync)
  if (!found) throw new Error('No Chromium browser found. Set E2E_BROWSER_PATH.')
  return found
}

export async function launch() {
  const browser = await puppeteer.launch({
    executablePath: browserExecutable(),
    headless: process.env.E2E_HEADED === '1' ? false : 'shell',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,900',
      '--lang=en-NG',
    ],
    defaultViewport: { width: 1280, height: 900 },
  })
  return browser
}

export function appUrl(path = '/') {
  return `${APP_URL}${path}`
}

/** Navigate and wait until the React app has actually rendered text. */
export async function open(page, path) {
  await page.goto(appUrl(path), { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    () => (document.body?.innerText ?? '').trim().length > 40,
    { timeout: 30_000 },
  )
  return page
}

// --------------------------------------------------------------- primitives

export async function textContent(page) {
  return page.evaluate(() => document.body.innerText)
}

export async function waitForText(page, text, timeout = 15_000) {
  await page.waitForFunction(
    (target) => document.body?.innerText.includes(target),
    { timeout },
    text,
  )
}

/** Click the first button/anchor whose trimmed text matches. */
export async function clickText(page, text, { exact = false, timeout = 10_000 } = {}) {
  const ok = await page.evaluate(({ text, exact }) => {
    const nodes = [...document.querySelectorAll('button, a, [role="button"]')]
    const predicate = exact
      ? (n) => n.textContent.trim() === text
      : (n) => n.textContent.trim().includes(text)
    const node = nodes.find(predicate)
    if (!node) return false
    node.scrollIntoView({ block: 'center' })
    node.click()
    return true
  }, { text, exact })
  if (!ok) {
    const visible = (await textContent(page)).slice(0, 600)
    throw new Error(`clickText: no element containing "${text}". Page starts with: ${visible}`)
  }
}

/** Fill an input/select by its accessible label text. */
export async function fillByLabel(page, labelText, value) {
  const filled = await page.evaluate(({ labelText, value }) => {
    const labels = [...document.querySelectorAll('label')]
    const label = labels.find((n) => n.textContent.trim().startsWith(labelText))
    if (!label) return false
    const control =
      document.getElementById(label.getAttribute('for') ?? '') ??
      label.querySelector('input, select, textarea')
    if (!control || control.type === 'file') return false
    control.scrollIntoView({ block: 'center' })
    control.focus()
    // Native setter so React's onChange sees the value.
    const proto = control.tagName === 'SELECT'
      ? window.HTMLSelectElement.prototype
      : control.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(control, value)
    control.dispatchEvent(new Event('input', { bubbles: true }))
    control.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { labelText, value })
  if (!filled) {
    const visible = (await textContent(page)).slice(0, 600)
    throw new Error(`fillByLabel: no control labelled "${labelText}". Page starts with: ${visible}`)
  }
}

/** Select an <option> by visible text inside the select with the given label. */
export async function chooseOption(page, labelText, optionText) {
  await fillByLabel(page, labelText, optionText)
}

/** Fill an input by placeholder text. */
export async function fillByPlaceholder(page, placeholder, value) {
  const filled = await page.evaluate(({ placeholder, value }) => {
    const control = [...document.querySelectorAll('input, textarea')]
      .find((n) => n.placeholder === placeholder && n.type !== 'file')
    if (!control) return false
    control.scrollIntoView({ block: 'center' })
    control.focus()
    const proto = control.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(control, value)
    control.dispatchEvent(new Event('input', { bubbles: true }))
    control.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { placeholder, value })
  if (!filled) {
    const visible = (await textContent(page)).slice(0, 600)
    throw new Error(`fillByPlaceholder: no input with placeholder "${placeholder}". Page starts with: ${visible}`)
  }
}

/** Extract the first regex match from the rendered page text. */
export async function extractFromText(page, regex) {
  const text = await textContent(page)
  const match = text.match(regex)
  if (!match) throw new Error(`extractFromText: ${regex} not found on page`)
  return match[1] ?? match[0]
}

// --------------------------------------------------------------- geolocation

const BENIN_CITY = { latitude: 6.335, longitude: 5.6037, accuracy: 30 }

/** Grant geolocation permission and spoof the position to Benin City. */
export async function spoofGeolocation(page) {
  const cdp = await page.createCDPSession()
  await cdp.send('Browser.grantPermissions', {
    permissions: ['geolocation'],
    origin: APP_URL,
  })
  await cdp.send('Emulation.setGeolocationOverride', BENIN_CITY)
  return cdp
}

// ---------------------------------------------------------------- assertion

export class TestError extends Error {}

export function expect(condition, message) {
  if (!condition) throw new TestError(message)
}
