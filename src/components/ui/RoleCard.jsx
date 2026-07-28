import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function RoleCard({ icon: Icon, title, description, primaryLabel, primaryTo, loginTo, accent = 'emerald', delay = 0 }) {
  const accentMap = {
    emerald: { iconBg: 'bg-[var(--color-emerald)]/15', iconColor: 'text-[var(--color-mint)]', glow: 'rgba(31,122,92,0.35)' },
    cyan: { iconBg: 'bg-[var(--color-route-cyan)]/15', iconColor: 'text-[var(--color-route-cyan)]', glow: 'rgba(34,211,238,0.3)' },
  }
  const a = accentMap[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group relative rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8 sm:p-9 flex flex-col focus-within:ring-2 focus-within:ring-[var(--color-emerald)]/50"
    >
      <div
        className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"
        style={{ background: a.glow }}
        aria-hidden="true"
      />

      <div className={`w-14 h-14 rounded-2xl ${a.iconBg} flex items-center justify-center`}>
        <Icon size={26} className={a.iconColor} strokeWidth={1.75} />
      </div>

      <h3 className="font-display text-2xl font-semibold text-[var(--color-paper)] mt-6">{title}</h3>
      <p className="mt-3 text-[var(--color-paper-dim)] leading-relaxed text-sm flex-1">{description}</p>

      <Link
        to={primaryTo}
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-dispatch-orange)] hover:bg-[var(--color-dispatch-orange-bright)] text-white font-medium px-6 py-3.5 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dispatch-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
      >
        {primaryLabel} <ArrowRight size={16} />
      </Link>

      <p className="mt-4 text-center text-sm text-[var(--color-paper-faint)]">
        Already have an account?{' '}
        <Link to={loginTo} className="text-[var(--color-mint)] hover:underline">
          Login
        </Link>
      </p>
    </motion.div>
  )
}
