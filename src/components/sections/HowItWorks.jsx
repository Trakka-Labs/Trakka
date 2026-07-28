import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'

const STAGES = [
  { id: '01', title: 'Package Created', detail: 'Business enters delivery details and generates a tracking link + QR code instantly.' },
  { id: '02', title: 'Driver Assigned', detail: 'Business assigns a registered driver, who accepts or rejects the trip.' },
  { id: '03', title: 'Picked Up', detail: 'Driver confirms pickup. Google Maps navigation activates for the route.' },
  { id: '04', title: 'En Route', detail: 'Customer watches a live, moving dot on their tracking page in real time.' },
  { id: '05', title: 'Arriving Soon', detail: 'ETA updates automatically as the driver approaches the drop-off point.' },
  { id: '06', title: 'Delivered', detail: 'Driver marks complete. Customer gets a receipt, and can rate & tip the driver.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[var(--color-ink-deep)]">
      <Container>
        <SectionHeading
          eyebrow="END-TO-END JOURNEY"
          title="Six stages. One tracking link. Zero phone calls."
          description="This is the exact sequence every delivery moves through — visible to your business and your customer at the same time."
          tone="cyan"
        />

        <div className="mt-16 relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-[var(--color-border-subtle)]" />

          <div className="grid lg:grid-cols-6 gap-8 lg:gap-4">
            {STAGES.map((stage, i) => (
              <Reveal key={stage.id} delay={i * 90}>
                <div className="relative flex lg:flex-col items-start lg:items-start gap-4 lg:gap-0">
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-route-cyan)]/40 flex items-center justify-center font-mono text-xs text-[var(--color-route-cyan)] lg:mb-5">
                    {stage.id}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-[var(--color-paper)]">
                      {stage.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-paper-dim)] leading-relaxed">
                      {stage.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
