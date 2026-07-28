import Logo from './ui/Logo'
import Container from './ui/Container'

const COLUMNS = [
  {
    title: 'Product',
    links: ['How it works', 'Pricing', 'FAQ'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy policy', 'Terms of service'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] py-14">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="font-display text-base font-semibold text-[var(--color-paper)]">Trakka</span>
            </div>
            <p className="mt-4 text-sm text-[var(--color-paper-faint)] max-w-xs leading-relaxed">
              The logistics operating system for Nigerian dispatch businesses, couriers, and 3PLs.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-xs text-[var(--color-paper-faint)] tracking-wide mb-4">
                {col.title.toUpperCase()}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-[var(--color-paper-dim)] hover:text-[var(--color-paper)] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-paper-faint)]">
            © {new Date().getFullYear()} Trakka.
          </p>
        </div>
      </Container>
    </footer>
  )
}
