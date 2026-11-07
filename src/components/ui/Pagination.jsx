import { ChevronLeft, ChevronRight } from 'lucide-react'

// Compact numbered window: current page ± 2, with first and last pages and
// ellipsis gaps kept always visible when they get cut out.
function pageWindow(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  const pages = new Set(
    [1, totalPages, current - 2, current - 1, current, current + 1, current + 2].filter(
      (page) => page >= 1 && page <= totalPages,
    ),
  )
  const sorted = [...pages].sort((a, b) => a - b)
  const items = []
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push('…')
    items.push(page)
  })
  return items
}

/**
 * Server-driven pagination footer. Shows the current range and, when the
 * results span more than one page, Prev/Next plus a numbered window.
 * On a single page only the caption is shown — controls would be dead weight.
 */
export default function Pagination({ page, pageSize, total, onPageChange }) {
  if (!total) return null

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = (page - 1) * pageSize + 1
  const rangeEnd = Math.min(total, page * pageSize)
  const singlePage = totalPages <= 1

  const goTo = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    onPageChange(nextPage)
  }

  const changeButtonClass =
    'inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--color-border-subtle)] bg-transparent px-2.5 text-xs font-medium text-[var(--color-paper-dim)] transition-colors hover:bg-[var(--soft-fill)] hover:text-[var(--color-paper)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--color-paper-dim)]'

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1"
    >
      <p className="text-xs text-[var(--color-paper-faint)]" aria-live="polite">
        Showing {rangeStart}&ndash;{rangeEnd} of {total}
      </p>
      {!singlePage && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={changeButtonClass}
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={13} aria-hidden="true" /> Prev
          </button>
          <ul className="hidden items-center gap-1 sm:flex">
            {pageWindow(page, totalPages).map((item, index) =>
              item === '…' ? (
                <li
                  key={`gap-${index}`}
                  aria-hidden="true"
                  className="px-1 text-xs text-[var(--color-paper-faint)]"
                >
                  …
                </li>
              ) : (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => goTo(item)}
                    disabled={item === page}
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? 'page' : undefined}
                    className={`h-7 min-w-7 rounded-lg border px-2 text-xs font-medium tabular-nums transition-colors ${
                      item === page
                        ? 'border-[var(--color-route-cyan)]/50 bg-[var(--soft-fill)] text-[var(--color-paper)]'
                        : 'border-[var(--color-border-subtle)] bg-transparent text-[var(--color-paper-dim)] hover:bg-[var(--soft-fill)] hover:text-[var(--color-paper)]'
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ),
            )}
          </ul>
          <button
            type="button"
            className={changeButtonClass}
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next <ChevronRight size={13} aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  )
}
