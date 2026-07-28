import { motion } from 'framer-motion'
import { Building2, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import RoleCard from '../components/ui/RoleCard'
import { ROUTES } from '../lib/routes'

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-[var(--color-ink)] relative overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[var(--color-emerald)]/10 blur-[150px]" />
      </div>

      <header className="pt-8 px-6 sm:px-10">
        <Link to={ROUTES.home} className="inline-flex items-center gap-2.5">
          <Logo size={30} />
          <span className="font-display text-lg font-semibold text-[var(--color-paper)]">Trakka</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-paper)]">
            Welcome to Trakka
          </h1>
          <p className="mt-4 text-lg text-[var(--color-paper-dim)]">
            Choose how you want to use Trakka.
          </p>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <RoleCard
            icon={Building2}
            title="Business Owner"
            description="Manage deliveries, drivers, customers, vehicles, and operations from one dashboard."
            primaryLabel="Continue as Business Owner"
            primaryTo={ROUTES.businessSignup}
            loginTo={ROUTES.businessLogin}
            accent="emerald"
            delay={0.1}
          />
          <RoleCard
            icon={Truck}
            title="Driver"
            description="Receive assignments, update delivery status, and manage your work on the go."
            primaryLabel="Continue as Driver"
            primaryTo={ROUTES.driverSignup}
            loginTo={ROUTES.driverLogin}
            accent="cyan"
            delay={0.2}
          />
        </div>
      </main>
    </div>
  )
}
