import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Company Info' },
  { id: 2, label: 'Payment Account' },
  { id: 3, label: 'Price Floor' },
  { id: 4, label: 'Review & Finish' },
]

export default function StepIndicator({ current }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Company setup progress">
      {STEPS.map((step, i) => {
        const state = step.id < current ? 'done' : step.id === current ? 'active' : 'upcoming'
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-current={state === 'active' ? 'step' : undefined}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold transition-colors duration-300 ${
                  state === 'done'
                    ? 'border-[var(--color-emerald)] bg-[var(--color-emerald)] text-[var(--color-ink)]'
                    : state === 'active'
                      ? 'border-[var(--color-route-cyan)] text-[var(--color-route-cyan)]'
                      : 'border-[var(--color-border-subtle)] text-[var(--color-paper-faint)]'
                }`}
              >
                {state === 'done' ? <Check size={14} strokeWidth={3} /> : step.id}
              </span>
              <span
                className={`hidden text-sm sm:inline ${
                  state === 'upcoming' ? 'text-[var(--color-paper-faint)]' : 'text-[var(--color-paper)]'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`h-px flex-1 transition-colors duration-300 ${
                  state === 'done' ? 'bg-[var(--color-emerald)]' : 'bg-[var(--color-border-subtle)]'
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
