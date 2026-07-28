import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'

const FAQS = [
  {
    q: 'Does the customer receiving a package need to download an app?',
    a: 'No. Customers get a unique tracking link via SMS or WhatsApp and open it directly in their browser — no account, no app install, no login required.',
  },
  {
    q: 'Does my driver need a smartphone?',
    a: 'Yes, currently Trakka\u2019s live GPS tracking requires the driver to use a browser-based dashboard with location access, and the tracking screen open while a trip is active.',
  },
  {
    q: 'How does payment actually work?',
    a: 'You choose per delivery: the sender pays upfront, the receiver pays before dispatch, or the receiver pays on delivery. All three are collected securely in-app \u2014 never cash-in-hand.',
  },
  {
    q: 'Can I edit or cancel a delivery after it\u2019s created?',
    a: 'Yes, business owners can edit or cancel a delivery from the dashboard. If a driver has already accepted the trip, they\u2019ll be notified of the change.',
  },
  {
    q: 'What happens if no driver is available for a delivery?',
    a: 'The delivery can be marked as failed from the dashboard, and the customer\u2019s tracking page reflects that status \u2014 so you\u2019re never leaving them guessing.',
  },
  {
    q: 'Is my business\u2019s data visible to other businesses on Trakka?',
    a: 'No. Every business on Trakka has a fully isolated account \u2014 your drivers, deliveries, and customer data are never shared with or visible to other businesses.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="py-24 md:py-32 bg-[var(--color-ink-deep)]">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions dispatch owners actually ask us."
              tone="emerald"
            />
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i
              return (
                <Reveal key={faq.q} delay={i * 60}>
                  <div className="rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-[var(--color-paper)] font-medium text-sm sm:text-base">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`flex-shrink-0 text-[var(--color-paper-faint)] transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className="grid transition-all duration-300 ease-out"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 sm:px-6 pb-5 text-sm text-[var(--color-paper-dim)] leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
