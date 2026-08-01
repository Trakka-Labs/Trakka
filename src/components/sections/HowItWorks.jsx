import Container from '../ui/Container'

const STAGES = [
  ['01', 'Order created', 'Customer form or business dashboard'],
  ['02', 'Price confirmed', 'Protected by the business floor'],
  ['03', 'Route batched', 'Grouped and sequenced by zone'],
  ['04', 'Rider accepts', 'Lightweight browser queue'],
  ['05', 'Customer tracks', 'Secure WhatsApp link and live ETA'],
  ['06', 'Delivery verified', 'OTP or QR, time and location recorded'],
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-[var(--color-border-subtle)] bg-[var(--color-ink-deep)] py-24 md:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-24">
          <div>
            <p className="landing-kicker">One continuous record</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[var(--color-paper)] sm:text-5xl">Nothing gets lost between order and handoff.</h2>
          </div>

          <ol className="grid border-l border-t border-[var(--color-border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map(([number, title, detail]) => (
              <li key={number} className="min-h-48 border-b border-r border-[var(--color-border-subtle)] p-6">
                <span className="text-[10px] font-medium text-[var(--color-route-cyan)]">{number}</span>
                <h3 className="mt-10 text-base font-medium text-[var(--color-paper)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-paper-dim)]">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
