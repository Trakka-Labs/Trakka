import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import Container from '../ui/Container'
import Button from '../ui/Button'

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-[var(--color-paper)] px-7 py-14 text-[var(--color-ink)] sm:px-12 sm:py-20 lg:px-20">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-xs font-medium text-[var(--color-dispatch-orange)]">Private pilot · Benin City</p>
              <h2 className="mt-5 max-w-4xl text-4xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                Put a proper operating system behind every delivery.
              </h2>
            </div>
            <div>
              <p className="max-w-md text-sm leading-6 opacity-70">Set up your business, define your price floor, and prepare your team for the first tracked order.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button as={Link} to="/get-started" variant="primary" size="lg" className="rounded-xl">
                  Join the pilot <ArrowRight size={17} />
                </Button>
                <a href="mailto:hello@trakka.app" className="inline-flex items-center px-3 py-3 text-sm font-medium underline decoration-current/30 underline-offset-4">Talk to us</a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
