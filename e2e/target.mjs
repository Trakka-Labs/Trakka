/**
 * Shared environment selection for the visible "live" automation scripts.
 *
 * The scripts can run against the local dev stack (vite on :5173 proxying to
 * the local backend) or the deployed production site. Since the two stacks
 * hold different accounts, each environment gets its own persistent browser
 * profile so a login saved for one never leaks into the other.
 *
 * Precedence:
 *   1. E2E_APP_URL  — an explicit URL wins outright, no prompt.
 *   2. E2E_ENV      — "local" | "remote" (or "prod"/"production") skips the
 *                     prompt and picks the matching built-in URL.
 *   3. Otherwise the user is prompted interactively (default: local).
 */
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'

export const TARGETS = {
  local: 'http://localhost:5173',
  remote: 'https://www.trakka.online',
}

const ALIASES = {
  local: 'local', localhost: 'local', dev: 'local',
  remote: 'remote', prod: 'remote', production: 'remote', deployed: 'remote',
}

/**
 * Resolve the run target. Returns { env: 'local'|'remote', url }.
 */
export async function askEnvironment() {
  if (process.env.E2E_APP_URL) {
    const url = process.env.E2E_APP_URL.replace(/\/$/, '')
    const env = url.includes('localhost') || url.includes('127.0.0.1') ? 'local' : 'remote'
    return { env, url }
  }

  const forced = ALIASES[process.env.E2E_ENV?.toLowerCase()]
  if (forced) return { env: forced, url: TARGETS[forced] }

  const readline = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = (
      await readline.question(
        'Which stack is this run for?\n' +
        '  1) Local dev (http://localhost:5173 — local backend + sqlite)\n' +
        '  2) Remote / deployed (https://www.trakka.online — production Postgres)\n' +
        'Choice [1]: ',
      )
    ).trim()
    const env = answer === '2' ? 'remote' : 'local'
    return { env, url: TARGETS[env] }
  } finally {
    readline.close()
  }
}

/**
 * Persistent browser profile per environment. Override with E2E_PROFILE_DIR.
 */
export function profileDirFor(env) {
  if (process.env.E2E_PROFILE_DIR) return process.env.E2E_PROFILE_DIR
  return env === 'local'
    ? join(homedir(), '.trakka-automation-profile-local')
    : join(homedir(), '.trakka-automation-profile')
}
