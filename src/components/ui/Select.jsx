import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select({ className = '', error = false, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`
          w-full appearance-none rounded-xl border bg-white/[0.03] px-4 py-3 pr-10 text-sm text-[var(--color-paper)]
          outline-none transition-colors duration-200
          focus:border-[var(--color-route-cyan)] focus:bg-white/[0.05]
          [&>option]:bg-[var(--color-surface)] [&>option]:text-[var(--color-paper)]
          ${error ? 'border-[var(--color-dispatch-orange)]' : 'border-[var(--color-border-subtle)]'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-paper-faint)]"
        aria-hidden="true"
      />
    </div>
  )
})

export default Select
