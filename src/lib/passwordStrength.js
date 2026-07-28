export function getPasswordStrength(password = '') {
  if (!password) {
    return { score: 0, label: '', color: 'var(--color-border-subtle)' }
  }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  score = Math.min(score, 4)

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = [
    'var(--color-dispatch-orange)',
    'var(--color-dispatch-orange)',
    'var(--color-dispatch-orange-bright)',
    'var(--color-route-cyan)',
    'var(--color-mint)',
  ]

  return { score, label: labels[score], color: colors[score] }
}
