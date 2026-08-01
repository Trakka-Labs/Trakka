import { Link } from 'react-router'
import Logo from './ui/Logo'
import Container from './ui/Container'

const LINKS = [
  ['Product', '#product'],
  ['Operating flow', '#how-it-works'],
  ['Pricing', '#pricing'],
  ['Questions', '#faq'],
  ['Contact', 'mailto:hello@trakka.app'],
]

export default function Footer() {
  return (
    <footer className="pb-10 pt-8">
      <Container>
        <div className="grid gap-10 border-t border-[var(--color-border-subtle)] py-10 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="text-base font-semibold tracking-[-0.03em] text-[var(--color-paper)]">Trakka</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-paper-faint)]">
              A web-based logistics operating system for independent fleet owners, riders, and the customers waiting for their packages.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 lg:justify-end" aria-label="Footer navigation">
            {LINKS.map(([label, href]) => (
              <a key={label} href={href} className="text-xs text-[var(--color-paper-dim)] transition-colors hover:text-[var(--color-paper)]">{label}</a>
            ))}
            <Link to="/business/login" className="text-xs text-[var(--color-paper-dim)] transition-colors hover:text-[var(--color-paper)]">Business login</Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--color-border-subtle)] pt-6 text-[10px] text-[var(--color-paper-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trakka. Private pilot in Benin City, Nigeria.</p>
          <div className="flex gap-5">
            <span>Privacy policy</span>
            <span>Terms of service</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
