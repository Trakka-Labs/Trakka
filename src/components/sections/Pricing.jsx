import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Reveal from '../ui/Reveal'

const PLANS = [
  {
    name: 'Starter',
    price: '₦7,000',
    period: '/month',
    description: 'For small dispatch teams just getting off WhatsApp.',
    features: ['Up to 3 drivers', 'Unlimited deliveries', 'Live GPS tracking', 'Customer tracking links'],
    featured: false,
  },
  {
    name: 'Growth',
    price: '₦15,000',
    period: '/month',
    description: 'For operators running daily, multi-driver dispatch.',
    features: ['Up to 15 drivers', 'Everything in Starter', 'In-app payment collection', 'Business branding on tracking pages', 'Priority support'],
    featured: true,
  },
  {
    name: 'Fleet',
    price: 'Custom',
    period: '',
    description: 'For 3PLs and haulage businesses with larger fleets.',
    features: ['Unlimited drivers', 'Everything in Growth', 'Dedicated onboarding', 'Custom reporting'],
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="PRICING"
          title="Simple, flat pricing. No per-trip surprises."
          description="Every plan starts with a free trial — no card required to get your first deliveries moving."
          align="center"
        />

        <Reveal className="mt-6 flex justify-center">
          <Badge tone="orange">3–4 WEEKS FREE, THEN PLANS FROM ₦7,000/MO</Badge>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <div
                className={`relative rounded-2xl border p-7 h-full flex flex-col ${
                  plan.featured
                    ? 'border-[var(--color-dispatch-orange)]/50 bg-[var(--color-surface-raised)] md:-translate-y-4 shadow-[0_20px_60px_-20px_rgba(255,107,53,0.25)]'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)]'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-dispatch-orange)] px-3 py-1 text-xs font-mono text-white">
                    MOST POPULAR
                  </span>
                )}

                <h3 className="font-display text-lg font-semibold text-[var(--color-paper)]">{plan.name}</h3>
                <p className="mt-2 text-sm text-[var(--color-paper-dim)] min-h-10">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-mono text-3xl text-[var(--color-paper)]">{plan.price}</span>
                  <span className="text-sm text-[var(--color-paper-faint)]">{plan.period}</span>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--color-paper-dim)]">
                      <Check size={16} className="text-[var(--color-mint)] flex-shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  as={Link}
                  to="/get-started"
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="md"
                  className="mt-7 w-full"
                >
                  {plan.price === 'Custom' ? 'Talk to us' : 'Start free trial'}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
