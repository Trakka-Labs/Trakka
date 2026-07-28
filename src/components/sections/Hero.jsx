import { ArrowRight, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'
import RouteTicker from '../ui/RouteTicker'
import Reveal from '../ui/Reveal'

const HONEST_STATS = [
  { label: 'Dispatch a delivery in', value: '< 2 min' },
  { label: 'Tracking access for customers', value: 'No app needed' },
  { label: 'Currently', value: 'Private pilot · Lagos' },
]

export default function Hero() {
  return (
    <section id="top" className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
      {/* Ambient background glow, product-relevant not decorative */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[var(--color-emerald)]/10 blur-[140px]" />
        <div className="absolute top-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-[var(--color-route-cyan)]/10 blur-[100px]" />
      </div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] text-[var(--color-paper)]">
              Dispatch smarter.<br />
              Let customers <span className="text-gradient-orange">watch it happen.</span>
            </h1>

            <p className="mt-6 text-lg text-[var(--color-paper-dim)] leading-relaxed max-w-xl">
              Trakka gives Nigerian logistics businesses one dashboard to manage drivers, create deliveries, and collect payment — while every customer gets a live tracking link, with nothing to download and no account to create.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button as={Link} to="/get-started" variant="primary" size="lg">
                Start free trial <ArrowRight size={18} />
              </Button>
              <Button variant="secondary" size="lg">
                <PlayCircle size={18} /> See how it works
              </Button>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
              {HONEST_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono text-lg sm:text-xl text-[var(--color-mint)]">{stat.value}</p>
                  <p className="mt-1 text-xs text-[var(--color-paper-faint)] leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div className="glass-panel rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-[var(--color-paper-faint)]">LIVE TRACKING PREVIEW</span>
                  <span className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-mint)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-mint)] animate-pulse" />
                    EN ROUTE
                  </span>
                </div>

                <RouteTicker variant="hero" />

                <div className="mt-8 space-y-3">
                  {[
                    { stage: 'Package Created', done: true },
                    { stage: 'Driver Assigned', done: true },
                    { stage: 'En Route', done: true, active: true },
                    { stage: 'Delivered', done: false },
                  ].map((row) => (
                    <div key={row.stage} className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          row.active
                            ? 'bg-[var(--color-dispatch-orange)]'
                            : row.done
                            ? 'bg-[var(--color-emerald-bright)]'
                            : 'bg-[var(--color-border-subtle)]'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          row.done ? 'text-[var(--color-paper)]' : 'text-[var(--color-paper-faint)]'
                        }`}
                      >
                        {row.stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 glass-panel rounded-2xl px-5 py-4 hidden sm:block">
                <p className="text-xs font-mono text-[var(--color-paper-faint)]">DRIVER</p>
                <p className="text-sm text-[var(--color-paper)] mt-0.5">Adewale O. — Honda CB125</p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
