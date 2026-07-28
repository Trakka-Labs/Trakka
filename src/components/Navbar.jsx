import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './ui/Logo'
import Button from './ui/Button'
import Container from './ui/Container'
import { useActiveSection } from '../hooks/useActiveSection'

const NAV_LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeId = useActiveSection(NAV_LINKS.map((l) => l.id))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <Container>
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-5 py-3 transition-all duration-300 ${
            scrolled ? 'glass-panel shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]' : 'bg-transparent'
          }`}
        >
          <a href="#top" className="flex items-center gap-2.5 group">
            <Logo size={30} />
            <span className="font-display text-lg font-semibold text-[var(--color-paper)]">
              Trakka
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                  activeId === link.id
                    ? 'text-[var(--color-paper)] bg-white/5'
                    : 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button as={Link} to="/business/login" variant="ghost" size="sm">Log in</Button>
            <Button as={Link} to="/get-started" variant="primary" size="sm">
              Start free trial
            </Button>
          </div>

          <button
            className="md:hidden text-[var(--color-paper)] p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="md:hidden mt-2 glass-panel rounded-2xl p-4 flex flex-col gap-1 animate-[fade-up_0.3s_ease-out]">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left px-4 py-3 rounded-xl text-sm text-[var(--color-paper-dim)] hover:text-[var(--color-paper)] hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-2 px-2">
              <Button as={Link} to="/business/login" variant="secondary" size="sm">Log in</Button>
              <Button as={Link} to="/get-started" variant="primary" size="sm">
                Start free trial
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
