import { forwardRef } from 'react'

const variants = {
  primary:
    'bg-[var(--color-dispatch-orange)] text-white hover:bg-[var(--color-dispatch-orange-bright)] shadow-[0_0_0_0_rgba(255,107,53,0)] hover:shadow-[0_8px_30px_-6px_rgba(255,107,53,0.5)]',
  secondary:
    'bg-transparent text-[var(--color-paper)] border border-[var(--color-border-subtle)] hover:border-[var(--color-paper-dim)] hover:bg-white/5',
  ghost:
    'bg-transparent text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', as: Comp = 'button', ...props },
  ref
) {
  return (
    <Comp
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-medium
        transition-all duration-300 ease-out
        active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dispatch-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ink)]
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </Comp>
  )
})

export default Button
