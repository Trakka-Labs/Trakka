import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../ui/Logo'
import RouteTicker from '../ui/RouteTicker'
import { ROUTES } from '../../lib/routes'

const HIGHLIGHTS = [
  'Live GPS tracking your customers can trust',
  'In-app payments, settled automatically',
  'Built for African logistics, from day one',
]

export default function AuthLayout({ children, eyebrow = 'BUSINESS PORTAL' }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-ink)]">
      {/* Branding panel */}
      <aside className="relative hidden overflow-hidden border-r border-[var(--color-border-subtle)] lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12 xl:w-[40%] xl:p-16">
        <div
          className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-[var(--color-emerald)]/10 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[var(--color-route-cyan)]/10 blur-[140px]"
          aria-hidden="true"
        />

        <Link to={ROUTES.home} className="relative z-10 flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-display text-xl font-semibold text-[var(--color-paper)]">Trakka</span>
        </Link>

        <div className="relative z-10">
          <span className="font-mono text-xs tracking-widest text-[var(--color-mint)]">{eyebrow}</span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-[var(--color-paper)] xl:text-4xl">
            Run your logistics operation like it&apos;s already scaled.
          </h1>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[var(--color-paper-dim)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-dispatch-orange)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <RouteTicker />
          </div>
        </div>

        <p className="relative z-10 text-xs text-[var(--color-paper-faint)]">
          © {new Date().getFullYear()} Trakka. Built for African logistics.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <Link to={ROUTES.home} className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display text-lg font-semibold text-[var(--color-paper)]">Trakka</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
