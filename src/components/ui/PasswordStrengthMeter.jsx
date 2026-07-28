import { getPasswordStrength } from '../../lib/passwordStrength'

export default function PasswordStrengthMeter({ password }) {
  if (!password) return null

  const { score, label, color } = getPasswordStrength(password)
  const filled = Math.max(score, 1)

  return (
    <div className="-mt-1" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i < filled ? color : 'var(--color-border-subtle)' }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-mono" style={{ color }}>
        {label}
      </p>
    </div>
  )
}
