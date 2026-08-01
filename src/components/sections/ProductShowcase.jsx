import { Check, Clock3, MapPin, Navigation, PackageCheck, Smartphone } from 'lucide-react'
import Container from '../ui/Container'

const RIDER_STOPS = []

export default function ProductShowcase() {
  return (
    <section className="py-24 md:py-36">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="landing-kicker">Three views, one delivery</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[var(--color-paper)] sm:text-5xl">
              Each person sees only what they need.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[var(--color-paper-dim)] lg:justify-self-end">
            Fleet owners get control, riders get a fast mobile queue, and customers get a branded live map. All three stay attached to the same delivery record.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="landing-product-frame overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-paper-faint)]">Owner dashboard</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-paper)]">Dispatch queue · No orders</p>
              </div>
              <span className="rounded-md bg-[var(--soft-fill)] px-2.5 py-1 text-[10px] text-[var(--color-route-cyan)]">GRA zone</span>
            </div>
            <div className="overflow-x-auto p-5">
              <div className="min-w-[35rem]">
                <div className="grid grid-cols-[1fr_1.4fr_1fr_0.8fr] border-b border-[var(--color-border-subtle)] pb-3 text-[10px] text-[var(--color-paper-faint)]">
                  <span>TRACKING ID</span><span>ROUTE</span><span>PAYMENT</span><span>STATUS</span>
                </div>
                {[].map((row, index) => (
                  <div key={row[0]} className="grid grid-cols-[1fr_1.4fr_1fr_0.8fr] items-center border-b border-[var(--color-border-subtle)] py-4 text-xs last:border-0">
                    <span className="font-medium text-[var(--color-paper)]">{row[0]}</span>
                    <span className="text-[var(--color-paper-dim)]">{row[1]}</span>
                    <span className="text-[var(--color-paper-dim)]">{row[2]}</span>
                    <span className={index === 0 ? 'text-[var(--color-emerald)]' : index === 2 ? 'text-[var(--color-route-cyan)]' : 'text-[var(--color-paper-faint)]'}>{row[3]}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="landing-product-frame p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--soft-fill)] text-[var(--color-route-cyan)]"><Smartphone size={17} /></span>
              <div>
                <p className="text-[10px] text-[var(--color-paper-faint)]">Rider portal</p>
                <p className="text-sm font-semibold text-[var(--color-paper)]">No active route</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {RIDER_STOPS.map(([type, address, status], index) => (
                <div key={address} className="flex items-center gap-3 rounded-lg bg-[var(--color-ink)] px-3 py-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-md ${index === 0 ? 'bg-[var(--color-emerald)] text-white' : 'bg-[var(--soft-fill)] text-[var(--color-route-cyan)]'}`}>
                    {index === 0 ? <Check size={13} /> : <MapPin size={13} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[var(--color-paper-faint)]">{type}</p>
                    <p className="truncate text-xs font-medium text-[var(--color-paper)]">{address}</p>
                  </div>
                  <span className="text-[9px] text-[var(--color-paper-faint)]">{status}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-paper)] px-4 py-3 text-xs font-medium text-[var(--color-ink)]">
              <Navigation size={14} /> Open route in Google Maps
            </button>
          </article>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            [Clock3, 'Live ETA', 'Updates when traffic, rain, checkpoints, or delays change the route.'],
            [PackageCheck, 'Verified handoff', 'OTP or QR confirmation records time, location, and completion.'],
            [Check, 'Payment flexibility', 'Sender paid or cash and transfer collection on delivery.'],
          ].map(([Icon, title, body]) => (
            <div key={title} className="border-t border-[var(--color-border-subtle)] pt-5">
              <Icon size={17} className="text-[var(--color-dispatch-orange)]" />
              <h3 className="mt-5 text-base font-medium text-[var(--color-paper)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-paper-dim)]">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
