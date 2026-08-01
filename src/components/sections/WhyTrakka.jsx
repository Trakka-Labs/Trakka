import { Check, Minus } from 'lucide-react'
import Container from '../ui/Container'

const ROWS = [
  ['Customer enters their own order details', false, true],
  ['Minimum delivery fee is enforced', false, true],
  ['Orders grouped into zone-based routes', false, true],
  ['Rider works from a mobile browser', false, true],
  ['Customer follows a live, no-login map', false, true],
  ['Delivery completion has a recorded proof', false, true],
]

export default function WhyTrakka() {
  return (
    <section className="border-y border-[var(--color-border-subtle)] bg-[var(--color-surface)] py-24 md:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="landing-kicker">The difference</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[var(--color-paper)] sm:text-5xl">
              WhatsApp stays. The operational chaos does not.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-[var(--color-paper-dim)]">
              Trakka uses the channel customers already know, then gives every delivery a proper system of record behind it.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
            <div className="grid grid-cols-[1fr_5rem_5rem] border-b border-[var(--color-border-subtle)] bg-[var(--color-ink)] px-5 py-4 text-[10px] font-medium text-[var(--color-paper-faint)] sm:grid-cols-[1fr_9rem_9rem]">
              <span>CAPABILITY</span><span className="text-center">CHAT ONLY</span><span className="text-center text-[var(--color-route-cyan)]">TRAKKA</span>
            </div>
            {ROWS.map(([label], index) => (
              <div key={label} className={`grid grid-cols-[1fr_5rem_5rem] items-center px-5 py-4 text-sm sm:grid-cols-[1fr_9rem_9rem] ${index < ROWS.length - 1 ? 'border-b border-[var(--color-border-subtle)]' : ''}`}>
                <span className="pr-4 text-[var(--color-paper-dim)]">{label}</span>
                <span className="flex justify-center"><Minus size={15} className="text-[var(--color-paper-faint)]" /></span>
                <span className="flex justify-center"><Check size={15} strokeWidth={2.4} className="text-[var(--color-emerald)]" /></span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
