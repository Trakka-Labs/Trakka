import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const VARIANTS = {
  error: {
    icon: AlertTriangle,
    classes: 'bg-[var(--color-dispatch-orange)]/10 border-[var(--color-dispatch-orange)]/30 text-[var(--color-dispatch-orange-bright)]',
  },
  success: {
    icon: CheckCircle2,
    classes: 'bg-[var(--color-emerald)]/10 border-[var(--color-emerald)]/30 text-[var(--color-mint)]',
  },
  info: {
    icon: Info,
    classes: 'bg-[var(--color-route-cyan)]/10 border-[var(--color-route-cyan)]/30 text-[var(--color-route-cyan)]',
  },
}

export default function Alert({ tone = 'error', children, className = '' }) {
  const variant = VARIANTS[tone]
  const Icon = variant.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${variant.classes} ${className}`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </motion.div>
  )
}
