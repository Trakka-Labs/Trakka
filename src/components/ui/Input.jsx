import { forwardRef } from 'react'

const Input = forwardRef(function Input({ className = '', error = false, icon: Icon, ...props }, ref) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-paper-faint)]"
          aria-hidden="true"
        />
      )}
      <input
        ref={ref}
        className={`
          w-full rounded-xl border bg-white/[0.03] py-3 text-sm text-[var(--color-paper)]
          placeholder:text-[var(--color-paper-faint)] outline-none transition-colors duration-200
          focus:border-[var(--color-route-cyan)] focus:bg-white/[0.05]
          ${Icon ? 'pl-11 pr-4' : 'px-4'}
          ${error ? 'border-[var(--color-dispatch-orange)]' : 'border-[var(--color-border-subtle)]'}
          ${className}
        `}
        {...props}
      />
    </div>
  )
})

export default Input
