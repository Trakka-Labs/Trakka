export default function Badge({ children, tone = 'emerald', className = '' }) {
  const tones = {
    emerald: 'bg-[var(--color-emerald)]/15 text-[var(--color-mint)] border-[var(--color-emerald)]/30',
    orange: 'bg-[var(--color-dispatch-orange)]/15 text-[var(--color-dispatch-orange-bright)] border-[var(--color-dispatch-orange)]/30',
    cyan: 'bg-[var(--color-route-cyan)]/15 text-[var(--color-route-cyan)] border-[var(--color-route-cyan)]/30',
    neutral: 'bg-white/5 text-[var(--color-paper-dim)] border-[var(--color-border-subtle)]',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono tracking-wide ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
