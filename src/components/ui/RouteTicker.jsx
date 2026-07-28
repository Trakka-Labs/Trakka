import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const STAGES = ['Package Created', 'Driver Assigned', 'Picked Up', 'En Route', 'Arriving Soon', 'Delivered']

export default function RouteTicker({ variant = 'hero' }) {
  const reducedMotion = usePrefersReducedMotion()

  if (variant === 'divider') {
    return (
      <div className="relative w-full h-px my-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[var(--color-border-subtle)]" />
        <div
          className={`absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[var(--color-route-cyan)] to-transparent ${
            reducedMotion ? '' : 'animate-[route-slide_6s_linear_infinite]'
          }`}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative h-16 w-full">
        {/* dashed route path */}
        <svg viewBox="0 0 400 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <line x1="10" y1="30" x2="390" y2="30" stroke="var(--color-border-subtle)" strokeWidth="2" />
          <line
            x1="10" y1="30" x2="390" y2="30"
            stroke="var(--color-route-cyan)"
            strokeWidth="2"
            strokeDasharray="1 8"
            strokeLinecap="round"
            opacity="0.6"
          />
          <circle cx="10" cy="30" r="5" fill="var(--color-paper)" />
          <circle cx="390" cy="30" r="5" fill="var(--color-dispatch-orange)" opacity="0.4" />

          {!reducedMotion && (
            <circle r="6" fill="var(--color-dispatch-orange)">
              <animate attributeName="cx" values="10;390;10" dur="6s" repeatCount="indefinite" />
              <animate attributeName="cy" values="30;30;30" dur="6s" repeatCount="indefinite" />
            </circle>
          )}
          {reducedMotion && <circle cx="150" cy="30" r="6" fill="var(--color-dispatch-orange)" />}
        </svg>
      </div>

      <div className="flex items-center justify-between mt-2 font-mono text-xs text-[var(--color-paper-faint)]">
        <span>PICKUP</span>
        <span className="text-[var(--color-route-cyan)]">TRIP #4471 · EN ROUTE · ETA 14 MIN</span>
        <span>DROP-OFF</span>
      </div>
    </div>
  )
}

export { STAGES }
