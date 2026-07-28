import { Check, X } from 'lucide-react'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'

const ROWS = [
  { label: 'Customer visibility into delivery status', old: false, trakka: true },
  { label: 'Dispatch coordinated in one place', old: false, trakka: true },
  { label: 'Customer needs to download an app', old: null, trakka: false },
  { label: 'Payment collected securely, in-app', old: false, trakka: true },
  { label: 'Proof of delivery on record', old: false, trakka: true },
]

export default function WhyTrakka() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-ink-deep)]">
      <Container>
        <SectionHeading
          eyebrow="THE ALTERNATIVE"
          title="Compared to running dispatch over WhatsApp and phone calls"
          tone="orange"
        />

        <Reveal>
          <div className="mt-12 rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_140px_140px] bg-white/[0.02] px-5 sm:px-6 py-4 text-sm font-mono text-[var(--color-paper-faint)]">
              <span>CAPABILITY</span>
              <span className="text-center">WHATSAPP + CALLS</span>
              <span className="text-center text-[var(--color-mint)]">TRAKKA</span>
            </div>

            {ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_140px_140px] items-center px-5 sm:px-6 py-4 text-sm ${
                  i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                }`}
              >
                <span className="text-[var(--color-paper-dim)] pr-4">{row.label}</span>
                <span className="flex justify-center">
                  {row.old === false ? (
                    <X size={16} className="text-[var(--color-paper-faint)]" />
                  ) : (
                    <span className="text-[var(--color-paper-faint)] text-xs">—</span>
                  )}
                </span>
                <span className="flex justify-center">
                  {row.trakka ? (
                    <Check size={16} className="text-[var(--color-mint)]" />
                  ) : (
                    <X size={16} className="text-[var(--color-mint)]" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
