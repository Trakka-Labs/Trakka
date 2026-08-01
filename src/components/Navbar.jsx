import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'
import Logo from './ui/Logo'
import ThemeToggle from './ui/ThemeToggle'
import { useActiveSection } from '../hooks/useActiveSection'

const NAV_LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'how-it-works', label: 'Operating flow' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'Questions' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeId = useActiveSection(NAV_LINKS.map((link) => link.id))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <nav className={`flex h-14 items-center justify-between px-3 transition-all duration-300 sm:px-4 ${scrolled ? 'rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/92 shadow-[var(--panel-shadow)] backdrop-blur-xl' : ''}`}>
          <a href="#top" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-semibold tracking-[-0.03em] text-[var(--color-paper)]">Trakka</span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className={`relative py-2 text-xs transition-colors ${
                  activeId === link.id
                    ? 'font-medium text-[var(--color-paper)] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-[var(--color-route-cyan)]'
                    : 'text-[var(--color-paper-faint)] hover:text-[var(--color-paper)]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link to="/business/login" className="px-3 py-2 text-xs font-medium text-[var(--color-paper-dim)] transition-colors hover:text-[var(--color-paper)]">Log in</Link>
            <Link to="/get-started" className="rounded-lg bg-[var(--color-paper)] px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0">Join the pilot</Link>
          </div>

          <button type="button" className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-paper)] md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="mt-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 shadow-[var(--panel-shadow)] md:hidden">
            {NAV_LINKS.map((link) => (
              <button key={link.id} type="button" onClick={() => scrollTo(link.id)} className="block w-full rounded-lg px-3 py-3 text-left text-sm text-[var(--color-paper-dim)] hover:bg-[var(--soft-hover)] hover:text-[var(--color-paper)]">
                {link.label}
              </button>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border-subtle)] px-3 py-3">
              <span className="text-xs text-[var(--color-paper-faint)]">Appearance</span>
              <ThemeToggle />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/business/login" className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-3 text-center text-xs font-medium text-[var(--color-paper)]">Log in</Link>
              <Link to="/get-started" className="rounded-lg bg-[var(--color-paper)] px-4 py-3 text-center text-xs font-medium text-[var(--color-ink)]">Join the pilot</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
