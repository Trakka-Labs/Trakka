import { useEffect, useRef } from 'react'

export default function OtpInput({ length = 6, value, onChange, error = false, disabled = false }) {
  const inputsRef = useRef([])
  const digits = value.split('').concat(Array(length - value.length).fill(''))

  useEffect(() => {
    if (!disabled) inputsRef.current[0]?.focus()
  }, [disabled])

  const setDigits = (next) => onChange(next.join('').slice(0, length))

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      const next = digits.slice()
      next[index] = ''
      setDigits(next)
      return
    }
    const chars = raw.split('')
    const next = digits.slice()
    for (let i = 0; i < chars.length && index + i < length; i++) {
      next[index + i] = chars[i]
    }
    setDigits(next)
    const nextIndex = Math.min(index + chars.length, length - 1)
    inputsRef.current[nextIndex]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = digits.slice()
      if (next[index]) {
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        next[index - 1] = ''
        setDigits(next)
        inputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    requestAnimationFrame(() => {
      const idx = Math.min(pasted.length, length - 1)
      inputsRef.current[idx]?.focus()
    })
  }

  return (
    <div className="flex gap-2.5 sm:gap-3" onPaste={handlePaste} role="group" aria-label="One-time passcode">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1} of ${length}`}
          className={`h-12 w-11 rounded-xl border bg-white/[0.03] text-center font-mono text-lg font-semibold text-[var(--color-paper)] outline-none transition-colors duration-200 focus:border-[var(--color-route-cyan)] focus:bg-white/[0.05] disabled:opacity-50 sm:h-14 sm:w-12 ${
            error ? 'border-[var(--color-dispatch-orange)]' : 'border-[var(--color-border-subtle)]'
          }`}
        />
      ))}
    </div>
  )
}
