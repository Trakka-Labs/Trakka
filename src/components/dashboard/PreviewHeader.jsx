import { Link } from 'react-router'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'
import { ROUTES } from '../../lib/routes'

const VIEWS = [
  ['Business', ROUTES.businessDashboard],
  ['Rider', ROUTES.riderDashboard],
  ['Customer', ROUTES.customerDashboard],
]

export default function PreviewHeader({ current, suffix }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link to={ROUTES.home} className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="text-base font-bold tracking-[-0.03em] text-[var(--color-paper)]">Trakka</span>
        </Link>
        {suffix && <span className="hidden border-l border-[var(--color-border-subtle)] pl-4 text-xs text-[var(--color-paper-faint)] sm:inline">{suffix}</span>}

        <nav className="ml-auto hidden h-full items-center gap-6 sm:flex" aria-label="Dashboard previews">
          {VIEWS.map(([label, to]) => (
            <Link
              key={label}
              to={to}
              aria-current={current === label.toLowerCase() ? 'page' : undefined}
              className={`relative flex h-full items-center text-xs ${
                current === label.toLowerCase()
                  ? 'font-semibold text-[var(--color-paper)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--color-dispatch-orange)]'
                  : 'text-[var(--color-paper-faint)] hover:text-[var(--color-paper)]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <ThemeToggle className="ml-auto sm:ml-2" />
      </div>
    </header>
  )
}
