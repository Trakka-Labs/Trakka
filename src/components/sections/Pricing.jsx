import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../ui/Container'
import Button from '../ui/Button'

const PLANS = [
  {
    name: 'Starter',
    price: '₦7,000',
    detail: 'For an owner moving a small team out of chat and notebooks.',
    limits: 'Up to 3 drivers',
    features: ['Unlimited delivery records', 'Live tracking links', 'Customer order form'],
  },
  {
    name: 'Growth',
    price: '₦15,000',
    detail: 'For a multi-rider operation dispatching throughout the week.',
    limits: 'Up to 15 drivers',
    features: ['Everything in Starter', 'Payment collection workflows', 'Branded tracking pages'],
    featured: true,
  },
  {
    name: 'Fleet',
    price: 'Let’s talk',
    detail: 'For larger fleets that need a tailored rollout and reporting.',
    limits: 'Custom driver count',
    features: ['Everything in Growth', 'Dedicated onboarding', 'Custom reporting'],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-36">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="landing-kicker">Pricing</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.05em] text-[var(--color-paper)] sm:text-5xl">
              Flat monthly plans, built around fleet size.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[var(--color-paper-dim)] lg:justify-self-end">
            Start with 3–4 weeks free during the pilot. No per-trip fee surprises while you learn whether Trakka fits the way your team works.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
          {PLANS.map((plan, index) => (
            <article key={plan.name} className={`relative grid gap-7 p-7 sm:p-9 lg:grid-cols-[0.55fr_0.8fr_1fr_auto] lg:items-center ${index < PLANS.length - 1 ? 'border-b border-[var(--color-border-subtle)]' : ''} ${plan.featured ? 'bg-[var(--soft-fill)]' : ''}`}>
              <div>
                {plan.featured && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-dispatch-orange)]">Recommended</p>}
                <h3 className="text-lg font-medium text-[var(--color-paper)]">{plan.name}</h3>
                <p className="mt-1 text-xs text-[var(--color-paper-faint)]">{plan.limits}</p>
              </div>
              <div>
                <span className="text-3xl font-medium tracking-[-0.04em] text-[var(--color-paper)]">{plan.price}</span>
                {plan.price.startsWith('₦') && <span className="ml-1 text-xs text-[var(--color-paper-faint)]">/ month</span>}
                <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--color-paper-dim)]">{plan.detail}</p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-[var(--color-paper-dim)]">
                    <Check size={13} className="shrink-0 text-[var(--color-emerald)]" /> {feature}
                  </li>
                ))}
              </ul>
              <Button as={Link} to="/get-started" variant={plan.featured ? 'primary' : 'secondary'} size="sm" className="rounded-lg whitespace-nowrap">
                {plan.price.startsWith('₦') ? 'Start free' : 'Contact us'} <ArrowRight size={14} />
              </Button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
