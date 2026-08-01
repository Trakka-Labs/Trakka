import { Link } from 'react-router'
import { motion } from 'framer-motion'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'
import { ROUTES } from '../../lib/routes'

export default function OnboardingLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-ink)]">
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 sm:px-10">
        <Link to={ROUTES.home} className="inline-flex items-center gap-2.5">
          <Logo size={30} />
          <span className="font-display text-lg font-semibold text-[var(--color-paper)]">Trakka</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
