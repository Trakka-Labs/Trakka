import { ArrowLeft, ArrowRight, Building2, LockKeyhole, LogIn } from 'lucide-react'
import { Link } from 'react-router'
import Logo from '../components/ui/Logo'
import ThemeToggle from '../components/ui/ThemeToggle'
import { ROUTES } from '../lib/routes'

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-paper)]">
      <header className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to={ROUTES.home} className="flex items-center gap-2.5">
            <Logo size={29} />
            <span className="text-lg font-bold tracking-[-0.03em]">Trakka</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Link to={ROUTES.home} className="inline-flex items-center gap-2 text-sm text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]">
          <ArrowLeft size={15} /> Back to website
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-dispatch-orange)]">Product access</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">Start with the business workspace</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[var(--color-paper-dim)]">
              Business registration, authentication, onboarding, session protection, and the operations dashboard are available now.
            </p>
          </div>

          <div className="grid gap-4">
            <article className="border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-[var(--color-ink-deep)] text-[var(--color-route-cyan)]"><Building2 size={21} /></span>
                <div>
                  <h2 className="text-xl font-bold">Create a business account</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-paper-dim)]">Register your fleet operation, then add company, payout, and minimum-price information.</p>
                </div>
              </div>
              <Link to={ROUTES.businessSignup} className="mt-7 inline-flex items-center gap-2 rounded bg-[var(--color-dispatch-orange)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--color-dispatch-orange-bright)]">
                Continue to registration <ArrowRight size={15} />
              </Link>
            </article>

            <article className="border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-[var(--color-ink-deep)] text-[var(--color-route-cyan)]"><LogIn size={21} /></span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Already registered?</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-paper-dim)]">Sign in to continue company setup or open your operations dashboard.</p>
                  <Link to={ROUTES.businessLogin} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-paper)] underline decoration-[var(--color-border-subtle)] underline-offset-4">
                    Business login <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>

            <div className="flex items-start gap-3 border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] p-5 text-sm leading-6 text-[var(--color-paper-dim)]">
              <LockKeyhole size={18} className="mt-0.5 shrink-0 text-[var(--color-dispatch-orange)]" />
              Rider authentication is not implemented yet. The freely accessible rider dashboard preview is available from the landing page.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
