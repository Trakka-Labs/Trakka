import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    className = '',
    error = false,
    icon: Icon,
    integerOnly = false,
    maxDigits,
    inputMode,
    pattern,
    onChange,
    ...props
  },
  ref,
) {
  const handleChange = (event) => {
    if (integerOnly) {
      const digits = event.currentTarget.value.replace(/\D/g, '')
      event.currentTarget.value = maxDigits ? digits.slice(0, maxDigits) : digits
    }
    onChange?.(event)
  }

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
        inputMode={integerOnly ? 'numeric' : inputMode}
        pattern={integerOnly ? '[0-9]*' : pattern}
        onChange={handleChange}
        className={`
          w-full rounded border bg-[var(--color-surface)] py-3 text-sm text-[var(--color-paper)]
          placeholder:text-[var(--color-paper-faint)] outline-none transition-colors duration-200
          focus:border-[var(--color-paper)] focus:ring-1 focus:ring-[var(--color-paper)]
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
