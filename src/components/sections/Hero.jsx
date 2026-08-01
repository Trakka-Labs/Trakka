import { ArrowRight, Check, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import Button from '../ui/Button'
import Container from '../ui/Container'

const TIMELINE = []

function TrackingPreview() {
  return (
    <div className="relative lg:pl-10">
      <div className="landing-product-frame">
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-paper-faint)]">Live delivery</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-paper)]">No active delivery</p>
          </div>
          <span className="flex items-center gap-2 text-[11px] font-medium text-[var(--color-emerald)]">
            <i className="h-1.5 w-1.5 rounded-full bg-[var(--color-emerald)]" />
            Offline
          </span>
        </div>

        <div className="landing-map relative h-64 overflow-hidden sm:h-72">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 290" aria-hidden="true">
            <g fill="none" stroke="var(--color-border-subtle)" strokeWidth="1.1">
              <path d="M-20 64 C80 48 119 102 206 83 S350 15 581 57" />
              <path d="M-15 201 C80 181 142 238 245 204 S410 130 580 171" />
              <path d="M87 -20 C73 67 103 111 84 176 S68 253 117 320" />
              <path d="M380 -20 C349 75 399 133 367 219 S325 278 337 320" />
            </g>
            <path d="M104 211 C158 187 189 210 234 176 S307 118 369 143 S417 117 469 74" fill="none" stroke="var(--color-route-cyan)" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 7" />
            <circle cx="104" cy="211" r="7" fill="var(--color-paper)" stroke="var(--color-route-cyan)" strokeWidth="3" />
            <circle cx="469" cy="74" r="7" fill="var(--color-surface)" stroke="var(--color-dispatch-orange)" strokeWidth="3" />
            <g transform="translate(314 139)">
              <circle r="14" fill="var(--color-route-cyan)" opacity=".16" />
              <circle r="6" fill="var(--color-route-cyan)" />
            </g>
          </svg>
          <div className="absolute bottom-4 left-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/92 px-3 py-2 backdrop-blur">
            <p className="text-[10px] text-[var(--color-paper-faint)]">Current location</p>
            <p className="mt-0.5 text-xs font-medium text-[var(--color-paper)]">Unavailable</p>
          </div>
        </div>

        <div className="grid gap-1 p-3 sm:grid-cols-4">
          {TIMELINE.map((step) => (
            <div key={step.label} className={`rounded-lg px-3 py-3 ${step.active ? 'bg-[var(--soft-fill)]' : ''}`}>
              <div className="flex items-center gap-2">
                <span className={`grid h-4 w-4 place-items-center rounded-full border ${
                  step.done
                    ? 'border-[var(--color-emerald)] bg-[var(--color-emerald)] text-white'
                    : step.active
                      ? 'border-[var(--color-route-cyan)] bg-[var(--color-route-cyan)] text-white'
                      : 'border-[var(--color-border-subtle)] text-[var(--color-paper-faint)]'
                }`}>
                  {step.done && <Check size={9} strokeWidth={3} />}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-paper)]">{step.label}</span>
              </div>
              <p className="ml-6 mt-1 text-[9px] text-[var(--color-paper-faint)]">{step.meta}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-5 right-5 hidden w-52 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 shadow-[var(--panel-shadow)] sm:block">
        <p className="text-[10px] text-[var(--color-paper-faint)]">Route status</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-paper)]">No route in progress</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--color-ink-deep)]">
          <div className="h-full w-0 rounded-full bg-[var(--color-dispatch-orange)]" />
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-36 sm:pt-40 lg:min-h-[52rem] lg:pb-28 lg:pt-44">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div>
            <div className="mb-8 flex items-center gap-3 text-xs text-[var(--color-paper-dim)]">
              <MapPin size={14} className="text-[var(--color-dispatch-orange)]" />
              <span>Phase 1 private pilot · Benin City</span>
            </div>

            <h1 className="max-w-3xl text-[clamp(3.3rem,7vw,6.9rem)] font-medium leading-[0.91] tracking-[-0.065em] text-[var(--color-paper)]">
              Run every delivery from one clear system.
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-[var(--color-paper-dim)] sm:text-lg">
              Trakka helps independent fleet owners receive orders through WhatsApp, protect delivery margins, batch routes, dispatch riders, and keep customers informed without another app download.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button as={Link} to="/get-started" variant="primary" size="lg" className="rounded-xl">
                Join the pilot <ArrowRight size={17} />
              </Button>
              <a href="#product" className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-medium text-[var(--color-paper)]">
                See the operating flow
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <dl className="mt-14 grid max-w-xl grid-cols-3 border-y border-[var(--color-border-subtle)] py-5">
              <div>
                <dt className="text-[10px] text-[var(--color-paper-faint)]">Customer setup</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--color-paper)]">No account</dd>
              </div>
              <div className="border-x border-[var(--color-border-subtle)] px-5">
                <dt className="text-[10px] text-[var(--color-paper-faint)]">Rider access</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--color-paper)]">Mobile web</dd>
              </div>
              <div className="pl-5">
                <dt className="text-[10px] text-[var(--color-paper-faint)]">Customer updates</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--color-paper)]">WhatsApp-first</dd>
              </div>
            </dl>
          </div>

          <TrackingPreview />
        </div>
      </Container>
    </section>
  )
}
