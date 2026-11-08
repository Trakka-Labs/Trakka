import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react'
import Button from '../ui/Button'
import Logo from '../ui/Logo'

const STEPS = [
  {
    target: 'sidebar',
    title: 'Welcome to your command centre',
    body: 'Everything you run lives in this sidebar — deliveries, dispatch, riders and reports. We will take 30 seconds to show you around.',
  },
  {
    target: 'nav-deliveries',
    title: 'Every package, one register',
    body: 'Create deliveries here, filter by status, driver or date, and open any package to see its full timeline.',
  },
  {
    target: 'nav-dispatch',
    title: 'Dispatch in a few taps',
    body: 'Ready deliveries appear here. Group them by area, pick a rider, and Trakka builds the stop sequence for you.',
  },
  {
    target: 'nav-drivers',
    title: 'Your riders, your capacity',
    body: 'Onboard riders and set how many stops each can carry. Disable a rider any time without losing their history.',
  },
  {
    target: 'stats',
    title: 'Know how today is going',
    body: 'These cards update live: packages in transit, completed drop-offs and what still needs dispatching.',
  },
  {
    target: 'notifications',
    title: 'Never miss a beat',
    body: 'Rider acceptances, delays and completed deliveries land here. Customers also get live tracking links automatically.',
  },
]

const MOBILE_POINTS = [
  'Create a delivery and watch it move through dispatch.',
  'Assign riders and share live tracking links automatically.',
  'Track revenue, ratings and rider performance in Analytics.',
]

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsDesktop(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return isDesktop
}

function measure(target) {
  if (!target) return null
  const element = document.querySelector(`[data-tour="${target}"]`)
  if (!element) return null
  const box = element.getBoundingClientRect()
  if (box.width === 0 && box.height === 0) return null
  return {
    top: box.top - 6,
    left: box.left - 6,
    width: box.width + 12,
    height: box.height + 12,
  }
}

export default function CoachTour({ status, onFinish }) {
  const isDesktop = useIsDesktop()
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState(null)
  const [visible, setVisible] = useState(false)
  const cardRef = useRef(null)
  const [cardSize, setCardSize] = useState({ width: 340, height: 220 })

  const open = Boolean(status && !status.tourSeen)

  // Let the dashboard paint before the spotlight appears.
  useEffect(() => {
    if (!open) {
      setVisible(false)
      return undefined
    }
    const timer = window.setTimeout(() => setVisible(true), 700)
    return () => window.clearTimeout(timer)
  }, [open])

  const step = STEPS[index]
  const updateRect = useCallback(() => {
    if (!isDesktop) {
      setRect(null)
      return
    }
    setRect(measure(step?.target))
  }, [isDesktop, step?.target])

  useLayoutEffect(() => {
    if (!open || !visible) return undefined
    updateRect()
    const frame = window.requestAnimationFrame(updateRect)
    const onScroll = () => updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, visible, index, updateRect])

  useLayoutEffect(() => {
    const node = cardRef.current
    if (!node) return
    const box = node.getBoundingClientRect()
    setCardSize({ width: box.width, height: box.height })
  }, [index, visible, rect])

  const finish = useCallback(() => {
    setVisible(false)
    onFinish?.()
  }, [onFinish])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') finish()
      if (event.key === 'ArrowRight') {
        setIndex((current) => (current + 1 < STEPS.length ? current + 1 : current))
      }
      if (event.key === 'ArrowLeft') {
        setIndex((current) => Math.max(0, current - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, finish])

  const cardPosition = useMemo(() => {
    if (!rect || typeof window === 'undefined') return null
    const gap = 16
    const margin = 16
    const maxLeft = window.innerWidth - cardSize.width - margin
    const below = rect.top + rect.height + gap
    const above = rect.top - cardSize.height - gap
    const placeBelow = below + cardSize.height < window.innerHeight - margin || above < margin
    return {
      top: Math.max(margin, Math.min(placeBelow ? below : above, window.innerHeight - cardSize.height - margin)),
      left: Math.max(margin, Math.min(rect.left, maxLeft)),
    }
  }, [rect, cardSize])

  const isLast = index === STEPS.length - 1

  return (
    <AnimatePresence>
      {open && visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70]"
          aria-live="polite"
        >
          {!isDesktop ? (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          ) : rect ? (
            <motion.div
              animate={rect}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="pointer-events-none absolute rounded-2xl ring-2 ring-[var(--color-route-cyan)]"
              style={{ boxShadow: '0 0 0 9999px rgba(4, 12, 10, 0.78)' }}
            />
          ) : (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          )}

          <div
            className={
              isDesktop && cardPosition
                ? 'absolute z-10'
                : 'absolute inset-0 z-10 grid place-items-center p-4'
            }
            style={
              isDesktop && cardPosition
                ? { top: cardPosition.top, left: cardPosition.left }
                : undefined
            }
          >
          <motion.div
            ref={cardRef}
            key={index}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Product tour"
            className="w-full max-w-[340px] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] shadow-2xl"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[var(--color-route-cyan)] via-[var(--color-emerald)] to-[var(--color-dispatch-orange)]" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-route-cyan)]">
                  <Sparkles size={12} />
                  {isDesktop ? `Quick tour · ${index + 1}/${STEPS.length}` : 'Welcome to Trakka'}
                </span>
                <button
                  type="button"
                  onClick={finish}
                  aria-label="Skip tour"
                  className="-mr-1 -mt-1 rounded-full p-1.5 text-[var(--color-paper-faint)] transition-colors hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]"
                >
                  <X size={16} />
                </button>
              </div>

              {isDesktop ? (
                <>
                  <h2 className="mt-2 text-lg font-semibold leading-snug text-[var(--color-paper)]">
                    {step.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-paper-dim)]">
                    {step.body}
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <Logo size={26} />
                    <h2 className="text-lg font-semibold text-[var(--color-paper)]">
                      Your first delivery is closer than you think
                    </h2>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {MOBILE_POINTS.map((point) => (
                      <li key={point} className="flex gap-2 text-sm text-[var(--color-paper-dim)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-route-cyan)]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {isDesktop ? (
                <>
                  <div className="mt-4 flex items-center gap-1.5">
                    {STEPS.map((_, dotIndex) => (
                      <button
                        key={dotIndex}
                        type="button"
                        aria-label={`Go to tour step ${dotIndex + 1}`}
                        onClick={() => setIndex(dotIndex)}
                        className={`h-1.5 rounded-full transition-all ${
                          dotIndex === index
                            ? 'w-5 bg-[var(--color-route-cyan)]'
                            : 'w-1.5 bg-[var(--color-border-subtle)] hover:bg-[var(--color-paper-faint)]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={finish}
                      className="text-xs text-[var(--color-paper-faint)] transition-colors hover:text-[var(--color-paper)]"
                    >
                      Skip tour
                    </button>
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIndex((current) => current - 1)}
                        >
                          <ArrowLeft size={14} /> Back
                        </Button>
                      )}
                      <Button size="sm" onClick={() => (isLast ? finish() : setIndex((c) => c + 1))}>
                        {isLast ? 'Finish' : 'Next'}
                        {!isLast && <ArrowRight size={14} />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <Button className="mt-5 w-full" size="sm" onClick={finish}>
                  Take me to my dashboard
                </Button>
              )}
            </div>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
