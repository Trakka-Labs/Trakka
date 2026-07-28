import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPinOff } from 'lucide-react'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import { ROUTES } from '../lib/routes'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-ink)] px-6 text-center">
      <Link to={ROUTES.home} className="flex items-center gap-2.5 mb-12">
        <Logo size={30} />
        <span className="font-display text-lg font-semibold text-[var(--color-paper)]">Trakka</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-[var(--color-border-subtle)] flex items-center justify-center mx-auto">
          <MapPinOff size={28} className="text-[var(--color-paper-faint)]" />
        </div>

        <h1 className="mt-8 font-display text-4xl font-semibold text-[var(--color-paper)]">
          This delivery went missing
        </h1>
        <p className="mt-3 text-[var(--color-paper-dim)] max-w-sm mx-auto">
          The page you're looking for doesn't exist, or may have moved.
        </p>

        <Button as={Link} to={ROUTES.home} variant="primary" size="md" className="mt-8">
          <ArrowLeft size={16} /> Back to home
        </Button>
      </motion.div>
    </div>
  )
}
