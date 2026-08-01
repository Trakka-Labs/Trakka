import { ArrowDown, GripVertical, MessageCircle, ShieldCheck } from 'lucide-react'
import Container from '../ui/Container'

function OrderFormPreview() {
  return (
    <div className="landing-product-frame max-w-md">
      <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-paper-faint)]">Business order form</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-paper)]">Book a delivery</p>
      </div>
      <div className="space-y-4 p-5">
        {[
          ['Pickup address', 'Not entered'],
          ['Delivery address', 'Not entered'],
          ['Receiver', 'Not entered'],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] text-[var(--color-paper-faint)]">{label}</p>
            <div className="mt-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-ink)] px-3 py-2.5 text-xs text-[var(--color-paper)]">{value}</div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg border border-dashed border-[var(--color-route-cyan)]/50 bg-[var(--soft-fill)] px-3 py-3">
          <span className="text-xs text-[var(--color-paper-dim)]">No package photo</span>
        </div>
      </div>
    </div>
  )
}

function BatchingPreview() {
  const stops = []
  return (
    <div className="landing-product-frame max-w-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-paper-faint)]">Suggested batch</p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--color-paper)]">No batch selected</h3>
        </div>
      </div>
      <ol className="mt-5 space-y-2">
        {stops.map(([area, address, number]) => (
          <li key={number} className="flex items-center gap-3 rounded-lg bg-[var(--color-ink)] px-3 py-3">
            <GripVertical size={14} className="text-[var(--color-paper-faint)]" />
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--soft-fill)] text-[10px] font-semibold text-[var(--color-route-cyan)]">{number}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--color-paper)]">{area}</p>
              <p className="mt-0.5 truncate text-[10px] text-[var(--color-paper-faint)]">{address}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-4">
        <span className="flex items-center gap-2 text-[10px] text-[var(--color-paper-dim)]"><ShieldCheck size={13} className="text-[var(--color-emerald)]" /> Price floor protected</span>
        <button type="button" className="rounded-lg bg-[var(--color-paper)] px-3 py-2 text-[10px] font-medium text-[var(--color-ink)]">Send to rider</button>
      </div>
    </div>
  )
}

const SYSTEMS = [
  {
    index: 'A',
    eyebrow: 'Zero-entry order intake',
    title: 'The customer enters the details once.',
    body: 'Share one reusable order link in WhatsApp. The customer adds pickup and drop-off addresses, receiver details, a package description, and a compressed photo from their browser. The verified order lands in your dispatch queue.',
    note: 'No customer account. No app install. Fewer transcription errors.',
    visual: <OrderFormPreview />,
  },
  {
    index: 'B',
    eyebrow: 'Margin and route control',
    title: 'Protect the fee. Then protect the fuel.',
    body: 'Trakka blocks bids below your minimum price floor. Accepted orders can then be grouped by neighborhood, manually reordered, and sent to a rider as one clear sequence.',
    note: 'Designed for zone-based operations in Benin City.',
    visual: <BatchingPreview />,
  },
]

export default function Features() {
  return (
    <section className="py-24 md:py-36">
      <Container>
        <div className="mb-20 grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <p className="landing-kicker">The Trakka operating loop</p>
          <h2 className="max-w-4xl text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[var(--color-paper)] sm:text-6xl">
            Less data entry for the owner. More certainty for everyone else.
          </h2>
        </div>

        <div className="space-y-6">
          {SYSTEMS.map((system, index) => (
            <article key={system.index} className="grid overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] lg:grid-cols-2">
              <div className={`flex min-h-[31rem] items-center justify-center bg-[var(--color-ink-deep)] p-6 sm:p-10 ${index % 2 ? 'lg:order-2' : ''}`}>
                {system.visual}
              </div>
              <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-md border border-[var(--color-border-subtle)] text-[10px] font-semibold text-[var(--color-route-cyan)]">{system.index}</span>
                    <p className="text-xs font-medium text-[var(--color-route-cyan)]">{system.eyebrow}</p>
                  </div>
                  <h3 className="mt-8 max-w-lg text-3xl font-medium leading-[1.06] tracking-[-0.04em] text-[var(--color-paper)] sm:text-4xl">{system.title}</h3>
                  <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-paper-dim)]">{system.body}</p>
                </div>
                <p className="mt-12 flex items-start gap-3 border-t border-[var(--color-border-subtle)] pt-5 text-sm text-[var(--color-paper)]">
                  <MessageCircle size={16} className="mt-0.5 shrink-0 text-[var(--color-dispatch-orange)]" />
                  {system.note}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 flex w-fit items-center gap-2 text-xs text-[var(--color-paper-faint)]">
          <ArrowDown size={13} />
          From confirmed order to live tracking
        </div>
      </Container>
    </section>
  )
}
