import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden border border-[var(--color-border-subtle)] px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[var(--color-emerald)]/15 blur-[130px]" />
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--color-paper)] max-w-2xl mx-auto leading-[1.1]">
              Stop running dispatch from memory. Start running it from a dashboard.
            </h2>
            <p className="mt-5 text-[var(--color-paper-dim)] max-w-lg mx-auto">
              Join the private pilot in Lagos. Set up your business profile and create your first tracked delivery in minutes.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button as={Link} to="/get-started" variant="primary" size="lg">
                Start free trial <ArrowRight size={18} />
              </Button>
              <Button variant="secondary" size="lg">
                Talk to us
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
