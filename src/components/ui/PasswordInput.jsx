import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Input from './Input'

const PasswordInput = forwardRef(function PasswordInput({ error = false, className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        error={error}
        className={`pr-11 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-paper-faint)] transition-colors hover:text-[var(--color-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-route-cyan)] rounded-md"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
})

export default PasswordInput
