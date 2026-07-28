import { motion } from 'framer-motion'

function formatToday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function WelcomeHeader({ companyName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-1.5"
    >
      <span className="font-mono text-xs tracking-widest text-[var(--color-mint)]">{formatToday().toUpperCase()}</span>
      <h1 className="font-display text-2xl font-semibold text-[var(--color-paper)] sm:text-3xl">
        Welcome back{companyName ? `, ${companyName}` : ''}
      </h1>
      <p className="text-sm text-[var(--color-paper-dim)]">Here&apos;s what&apos;s happening across your operations today.</p>
    </motion.div>
  )
}
