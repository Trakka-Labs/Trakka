import { cloneElement, isValidElement } from 'react'
import { AlertCircle } from 'lucide-react'

export default function FormField({ label, htmlFor, error, hint, required = false, children }) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined

  if (!isValidElement(children)) {
    // A FormField must wrap exactly one input element. Multiple JSX siblings
    // arrive as an array, and cloneElement on an array silently produces an
    // element with an undefined type that then crashes deep inside React
    // rendering with "Element type is invalid". Fail here, within this
    // component, so the offending field is named directly.
    throw new Error(
      `FormField "${label ?? htmlFor}" must wrap a single input element (got ${
        Array.isArray(children) ? 'multiple children' : String(children)
      })`
    )
  }

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
