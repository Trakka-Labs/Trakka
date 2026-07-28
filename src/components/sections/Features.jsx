import { ArrowUpRight, PackagePlus, MapPinned, CreditCard, LayoutDashboard } from 'lucide-react'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'

const FEATURES = [
  {
    icon: PackagePlus,
    title: 'Create & assign deliveries',
    description: 'Enter pickup, drop-off, and receiver details, pick a delivery type and payment method, and assign a driver — all in one flow built for speed, not paperwork.',
  },
  {
    icon: MapPinned,
    title: 'Live GPS tracking',
    description: 'Every delivery gets a unique tracking link and QR code the moment it\u2019s created. Customers watch their driver move on a live map — no login required.',
  },
  {
    icon: CreditCard,
    title: 'Flexible in-app payments',
    description: 'Sender paid, receiver pays before dispatch, or receiver pays on delivery — all settled securely in-app, never cash-in-hand.',
  },
  {
    icon: LayoutDashboard,
    title: 'One dashboard for everything',
    description: 'Revenue, active deliveries, driver status, trip history — filterable by driver, status, and date, so nothing falls through the cracks.',
  },
]

export default function Features() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="WHAT TRAKKA DOES"
          title="Everything your dispatch operation actually needs — nothing it doesn't."
          description="No AI gimmicks bolted on for marketing. Just the tools that get a package from pickup to a happy customer, reliably."
        />

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 80}>
              <div className="group relative rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-7 h-full transition-all duration-300 hover:border-[var(--color-emerald)]/50 hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-emerald)]/15 flex items-center justify-center">
                    <feature.icon size={20} className="text-[var(--color-mint)]" strokeWidth={1.75} />
                  </div>
                  <span className="w-8 h-8 rounded-full bg-[var(--color-dispatch-orange)]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight size={15} className="text-white" />
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-[var(--color-paper)] mt-6">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[var(--color-paper-dim)] leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
