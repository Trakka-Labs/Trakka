import { forwardRef } from 'react'
import { Check } from 'lucide-react'

const Checkbox = forwardRef(function Checkbox({ label, id, className = '', ...props }, ref) {
  return (
    <label htmlFor={id} className={`group flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input ref={ref} id={id} type="checkbox" className="peer sr-only" {...props} />
        <span className="absolute inset-0 rounded-md border border-[var(--color-border-subtle)] bg-white/[0.03] transition-colors duration-200 peer-checked:border-[var(--color-emerald)] peer-checked:bg-[var(--color-emerald)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-route-cyan)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-surface)]" />
        <Check
          size={13}
          strokeWidth={3}
          className="relative scale-75 text-[var(--color-ink)] opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100"
        />
      </span>
      {label && <span className="text-sm text-[var(--color-paper-dim)]">{label}</span>}
    </label>
  )
})

export default Checkbox
