import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { getBreadcrumbs } from '../../lib/api'
import { clientBreadcrumbs } from '../../lib/breadcrumbs'

/**
 * Breadcrumb trail for the current route. Paints instantly from the client
 * map, then swaps in the canonical server trail (which resolves dynamic
 * segments such as tracking ids). If the server call fails the client trail
 * simply stays — navigation never breaks.
 */
export default function Breadcrumbs({ className = '' }) {
  const location = useLocation()
  const path = location.pathname
  const [items, setItems] = useState(() => clientBreadcrumbs(path))

  useEffect(() => {
    let cancelled = false
    setItems(clientBreadcrumbs(path))
    getBreadcrumbs(path)
      .then((result) => {
        if (cancelled) return
        if (Array.isArray(result?.breadcrumbs) && result.breadcrumbs.length) {
          setItems(result.breadcrumbs)
        }
      })
      .catch(() => {
        /* Keep the client-side trail. */
      })
    return () => {
      cancelled = true
    }
  }, [path])

  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  size={12}
                  aria-hidden="true"
                  className="text-[var(--color-paper-faint)]/60"
                />
              )}
              {last || !item.href ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={last ? 'font-medium text-[var(--color-paper)]' : 'text-[var(--color-paper-faint)]'}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-[var(--color-paper-faint)] transition-colors hover:text-[var(--color-paper-dim)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
