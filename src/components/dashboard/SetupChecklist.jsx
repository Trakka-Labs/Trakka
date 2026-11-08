import { useMemo } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Check,
  Circle,
  Package,
  Route as RouteIcon,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { ROUTES } from '../../lib/routes'

const STEP_CONFIG = {
  profile: {
    title: 'Complete your company profile',
    body: 'Add your logo, city and delivery price floors so every quote is ready.',
    href: ROUTES.companySetup,
    cta: 'Finish profile',
    icon: Building2,
    tone: 'text-[var(--color-route-cyan)]',
  },
  rider: {
    title: 'Onboard your first rider',
    body: 'Riders receive dispatch links on WhatsApp — no app install needed.',
    href: ROUTES.businessDrivers,
    cta: 'Add a rider',
    icon: Users,
    tone: 'text-[var(--color-emerald)]',
  },
  delivery: {
    title: 'Create your first delivery',
    body: 'Add the pickup, drop-off and package photo. We generate the tracking ID.',
    href: ROUTES.businessCreateDelivery,
    cta: 'New delivery',
    icon: Package,
    tone: 'text-[var(--color-dispatch-orange)]',
  },
  dispatch: {
    title: 'Dispatch your first route',
    body: 'Group ready deliveries by area and assign them to a rider in one go.',
    href: ROUTES.businessDispatch,
    cta: 'Open dispatch',
    icon: RouteIcon,
    tone: 'text-[var(--color-route-cyan)]',
  },
  tracking: {
    title: 'Share live tracking',
    body: 'Customers get a live map link automatically when a rider accepts.',
    href: ROUTES.businessRoutes,
    cta: 'View routes',
    icon: Send,
    tone: 'text-[var(--color-emerald)]',
  },
}

function nextStep(steps) {
  return steps.find((step) => !step.done) ?? null
}

export default function SetupChecklist({ status, onDismiss }) {
  const steps = useMemo(
    () =>
      (status?.steps ?? [])
        .filter((step) => STEP_CONFIG[step.key])
        .map((step) => ({ ...step, ...STEP_CONFIG[step.key] })),
    [status],
  )

  if (!status || status.checklistDismissed) return null
  if (!steps.length) return null

  if (status.allDone) {
    return (
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-panel relative mb-6 overflow-hidden rounded-xl border-[var(--color-emerald)]/30 p-5"
        aria-label="Setup complete"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--color-emerald)]/10 blur-2xl" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-emerald)]/15 text-[var(--color-mint)]">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-paper)]">
                You&apos;re fully set up — nice work
              </h2>
              <p className="mt-0.5 text-xs text-[var(--color-paper-dim)]">
                Profile, rider, delivery, dispatch and live tracking are all live.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.businessAnalytics}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-subtle)] px-3.5 py-2 text-sm text-[var(--color-paper)] transition-colors hover:border-[var(--color-paper-dim)]"
            >
              See your analytics <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss setup complete"
              className="rounded-full p-2 text-[var(--color-paper-faint)] transition-colors hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.section>
    )
  }

  const current = nextStep(steps)
  const progress = Math.round((status.completedCount / status.totalSteps) * 100)

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-panel relative mb-6 overflow-hidden rounded-xl p-5"
      aria-label="Getting started checklist"
      data-tour="checklist"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--color-route-cyan)]/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-route-cyan)]/12 text-[var(--color-route-cyan)]">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-paper)]">
                Get your first delivery live
              </h2>
              <p className="mt-0.5 text-xs text-[var(--color-paper-dim)]">
                {status.completedCount} of {status.totalSteps} done
                {current ? ` · next: ${current.title.toLowerCase()}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss checklist"
            className="rounded-full p-2 text-[var(--color-paper-faint)] transition-colors hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-ink-deep)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-route-cyan)] to-[var(--color-emerald)]"
          />
        </div>

        <ol className="mt-4 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <li key={step.key}>
                <Link
                  to={step.href}
                  className={`group flex h-full items-start gap-2.5 rounded-lg p-2.5 transition-colors ${
                    step.done
                      ? 'opacity-60'
                      : step.key === current?.key
                        ? 'bg-[var(--soft-fill)] ring-1 ring-[var(--color-route-cyan)]/25'
                        : 'hover:bg-[var(--soft-hover)]'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {step.done ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--color-emerald)]/15 text-[var(--color-mint)]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <Circle size={20} className={step.tone} strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        step.done
                          ? 'text-[var(--color-paper-dim)] line-through'
                          : 'text-[var(--color-paper)]'
                      }`}
                    >
                      <Icon size={12} className={step.done ? 'opacity-50' : step.tone} />
                      <span className="truncate">{step.title}</span>
                    </span>
                    {!step.done && (
                      <span className="mt-0.5 block text-[11px] leading-snug text-[var(--color-paper-faint)]">
                        {step.body}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>

        {current && (
          <div className="mt-3 flex items-center justify-end border-t border-[var(--color-border-subtle)] pt-3">
            <Link
              to={current.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-route-cyan)]/12 px-3.5 py-2 text-xs font-semibold text-[var(--color-route-cyan)] transition-colors hover:bg-[var(--color-route-cyan)]/20"
            >
              {current.cta} <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  )
}
