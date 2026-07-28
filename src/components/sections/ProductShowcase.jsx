import { Truck, Package, CheckCircle2, Clock } from 'lucide-react'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'

const DASHBOARD_ROWS = [
  { id: '#TRK-4471', route: 'Ikeja → Lekki Phase 1', driver: 'Adewale O.', status: 'En Route', tone: 'orange' },
  { id: '#TRK-4470', route: 'Yaba → Victoria Island', driver: 'Chidi N.', status: 'Delivered', tone: 'mint' },
  { id: '#TRK-4469', route: 'Surulere → Ajah', driver: 'Unassigned', status: 'Pending', tone: 'faint' },
]

const toneClass = {
  orange: 'text-[var(--color-dispatch-orange-bright)]',
  mint: 'text-[var(--color-mint)]',
  faint: 'text-[var(--color-paper-faint)]',
}

export default function ProductShowcase() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="INSIDE THE PRODUCT"
          title="Built for the person running dispatch — not for a demo reel."
          align="center"
          tone="emerald"
        />

        <div className="mt-16 grid lg:grid-cols-5 gap-6">
          {/* Business dashboard mockup */}
          <Reveal className="lg:col-span-3">
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] overflow-hidden h-full">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-border-subtle)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-dispatch-orange)]/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-paper-faint)]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-paper-faint)]/30" />
                <span className="ml-3 font-mono text-xs text-[var(--color-paper-faint)]">
                  dashboard.trakka.app
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Active', value: '18' },
                    { label: 'Completed today', value: '42' },
                    { label: 'Drivers online', value: '11' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white/[0.03] p-4">
                      <p className="font-mono text-2xl text-[var(--color-paper)]">{stat.value}</p>
                      <p className="text-xs text-[var(--color-paper-faint)] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {DASHBOARD_ROWS.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 text-sm"
                    >
                      <span className="font-mono text-[var(--color-paper-faint)] w-24">{row.id}</span>
                      <span className="text-[var(--color-paper-dim)] hidden sm:block flex-1 px-3">{row.route}</span>
                      <span className="text-[var(--color-paper-dim)] w-24 hidden md:block">{row.driver}</span>
                      <span className={`font-mono text-xs ${toneClass[row.tone]}`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Tracking page mockup */}
          <Reveal delay={120} className="lg:col-span-2">
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] h-full p-6 flex flex-col">
              <p className="font-mono text-xs text-[var(--color-paper-faint)] mb-5">CUSTOMER TRACKING PAGE</p>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--color-emerald)]/20 flex items-center justify-center">
                  <Truck size={18} className="text-[var(--color-mint)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-paper)]">Adewale O.</p>
                  <p className="text-xs text-[var(--color-paper-faint)]">Honda CB125 · ★ 4.9</p>
                </div>
              </div>

              <div className="flex-1 rounded-xl bg-white/[0.03] flex items-center justify-center mb-6 relative overflow-hidden min-h-32">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle, var(--color-border-subtle) 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }} />
                <span className="relative w-3 h-3 rounded-full bg-[var(--color-dispatch-orange)] animate-pulse" />
              </div>

              <div className="space-y-3">
                {[
                  { icon: Package, label: 'Package Created', done: true },
                  { icon: CheckCircle2, label: 'Driver Assigned', done: true },
                  { icon: Clock, label: 'En Route · ETA 14 min', done: true, active: true },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2.5">
                    <row.icon size={15} className={row.active ? 'text-[var(--color-dispatch-orange)]' : 'text-[var(--color-mint)]'} />
                    <span className="text-xs text-[var(--color-paper-dim)]">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
