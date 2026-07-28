import { PhoneCall, MessageSquareText, HelpCircle } from 'lucide-react'
import Container from '../ui/Container'
import Reveal from '../ui/Reveal'
import RouteTicker from '../ui/RouteTicker'

const PAINS = [
  {
    icon: PhoneCall,
    text: '"Where is my package?" calls flooding your one phone line, every single day.',
  },
  {
    icon: MessageSquareText,
    text: 'Dispatch coordinated over scattered WhatsApp groups, with no single source of truth.',
  },
  {
    icon: HelpCircle,
    text: 'No way to prove a delivery happened — or show a customer their driver is actually close.',
  },
]

export default function ProblemStatement() {
  return (
    <section id="product" className="py-24 md:py-32 relative">
      <RouteTicker variant="divider" />
      <Container className="pt-24 md:pt-32">
        <Reveal>
          <p className="font-mono text-xs text-[var(--color-dispatch-orange-bright)] tracking-widest mb-4">
            THE PROBLEM
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--color-paper)] max-w-2xl leading-[1.1]">
            Most logistics businesses in Lagos are still running dispatch by phone call and guesswork.
          </h2>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {PAINS.map((pain, i) => (
            <Reveal key={pain.text} delay={i * 100}>
              <div className="flex flex-col gap-4 p-6 rounded-2xl border border-[var(--color-border-subtle)] h-full">
                <pain.icon className="text-[var(--color-dispatch-orange)]" size={26} strokeWidth={1.75} />
                <p className="text-[var(--color-paper-dim)] leading-relaxed">{pain.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
