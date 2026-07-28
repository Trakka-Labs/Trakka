import { cloneElement } from 'react'
import { AlertCircle } from 'lucide-react'

export default function FormField({ label, htmlFor, error, hint, required = false, children }) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined

  const field = cloneElement(children, {
    id: htmlFor,
    'aria-invalid': !!error,
    'aria-describedby': describedBy,
  })

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--color-paper)]">
          {label}
          {required && <span className="text-[var(--color-dispatch-orange-bright)]"> *</span>}
        </label>
      )}

      {field}

      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-[var(--color-dispatch-orange-bright)]">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-[var(--color-paper-faint)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
