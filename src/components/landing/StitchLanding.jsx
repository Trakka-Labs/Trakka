import { useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Link2,
  Map,
  MapPin,
  Menu,
  Navigation,
  QrCode,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react'
import { Link } from 'react-router'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'
import { ROUTES } from '../../lib/routes'

const HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxluTgrnJjGXpqeeVD0AkZ2tnSJLSZL7Madn5vWAGR2pM8TEugtx8wFuN8AlgzKHRy7ssnibNa_lccEMpar2KUwIFeTJA_LUGCTe05km70X1JoUfgXwBquNzFkXIZ3OWxsipdO6hLWUA_52PxEfVOLFe_EtX5VmGQtnYwFcdIYKga434trJiO1TtbHNR91ac5LGXOZyVp0tNUVvHg6K085-Av3KBXB9FApPH0HrJXhOtnRjgbesI5Utw'
const OPERATIONS_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi65KGIgWEzN7PmkDeD7Tk54E0ALC8igxSf-ZQIr3QpLFG3dCvW4C0sj9N4FJoX87tLms3d-IE8ImsA0XvROrR3KCAIYztRhUtbSi_kLKU8Xwhre33tHwNvHV8uWYsgG5M8VDdpLQCgTi5DYGMXyovIeMzqxyk8mVZGW19Klg8gVRbpEjjiAaHpGetp538_R9ekqMXECMWF6WHsscqndPbDim8Cyl7lUUoMWMIlQlokUvUAe18Ci2AKg'
const WORKFLOW_IMAGE = '/images/rider-workflow.png'

const NAV_ITEMS = [
  ['Solutions', 'solutions'],
  ['Tracking', 'tracking'],
  ['Resources', 'resources'],
  ['Product access', 'access'],
]

const FEATURES = [
  {
    icon: Link2,
    title: 'Smart intake links',
    body: 'Share one reusable WhatsApp order link and collect pickup, delivery, receiver, and package details directly from the customer.',
    accent: 'orange',
  },
  {
    icon: Map,
    title: 'Zone-based batching',
    body: 'Group orders by Benin City neighborhood, arrange the stop sequence, and send one clear route run to the assigned rider.',
    accent: 'navy',
  },
  {
    icon: MapPin,
    title: 'Live rider tracking',
    body: 'Give customers a secure, branded tracking page with live rider position and ETA—without an account or app download.',
    accent: 'orange',
  },
]

function scrollToSection(id, closeMenu) {
  closeMenu?.()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function TopNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="stitch-nav">
      <div className="stitch-container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Trakka home">
          <Logo size={29} />
          <span className="text-lg font-bold tracking-[-0.03em] text-[var(--lp-text)]">Trakka</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map(([label, id]) => (
            <button key={id} type="button" onClick={() => scrollToSection(id)} className="text-sm text-[var(--lp-muted)] transition-colors hover:text-[var(--lp-orange)]">
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link to={ROUTES.businessLogin} className="px-3 py-2 text-sm font-medium text-[var(--lp-text)]">Log in</Link>
          <Link to={ROUTES.businessSignup} className="stitch-button stitch-button--orange">Create business account</Link>
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center text-[var(--lp-text)] md:hidden" aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--lp-border)] bg-[var(--lp-surface)] p-4 md:hidden">
          {NAV_ITEMS.map(([label, id]) => (
            <button key={id} type="button" onClick={() => scrollToSection(id, () => setOpen(false))} className="block w-full border-b border-[var(--lp-border)] px-2 py-3 text-left text-sm text-[var(--lp-muted)]">
              {label}
            </button>
          ))}
          <div className="mt-4 flex items-center justify-between">
            <ThemeToggle />
            <Link to={ROUTES.businessSignup} className="stitch-button stitch-button--orange">Create account</Link>
          </div>
        </div>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="stitch-hero" style={{ '--hero-image': `url("${HERO_IMAGE}")` }}>
      <div className="stitch-hero__overlay" />
      <div className="stitch-container relative z-10 flex min-h-[78dvh] items-center justify-center py-24 text-center">
        <div className="flex max-w-4xl flex-col items-center">
          <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#ffb690]">Built for local fleet owners</p>
          <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.04] tracking-[-0.045em] text-white">
            Intelligent Logistics Management Software for Dispatch Businesses in Nigeria
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#dce9ff] sm:text-lg">
            Receive orders through WhatsApp, protect your margins, group routes by neighborhood, and give every customer a live view of their delivery.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={ROUTES.businessSignup} className="stitch-button stitch-button--orange px-8 py-3.5">Create business account</Link>
            <Link to={ROUTES.businessLogin} className="stitch-button border border-white/50 px-8 py-3.5 text-white hover:bg-white/10">Business login</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProofBar() {
  const facts = [
    ['3', 'Core operating workflows'],
    ['< 3 sec', 'Mobile order-form target'],
    ['0', 'Customer app installs'],
  ]

  return (
    <section className="border-y border-[var(--lp-border)] bg-[var(--lp-panel)]">
      <div className="stitch-container grid md:grid-cols-3">
        {facts.map(([value, label], index) => (
          <div key={label} className={`py-7 text-center ${index ? 'border-t border-[var(--lp-border)] md:border-l md:border-t-0' : ''}`}>
            <p className="font-mono text-2xl font-semibold text-[var(--lp-orange)]">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--lp-muted)]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Solutions() {
  return (
    <section id="solutions" className="bg-[var(--lp-bg)] py-20 sm:py-24">
      <div className="stitch-container">
        <div className="mb-10 text-center">
          <p className="stitch-label">Core features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[var(--lp-text)]">Built for the demands of local delivery</h2>
          <p className="mt-3 text-[var(--lp-muted)]">The shortest path from customer request to verified handoff.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, accent }) => (
            <article key={title} className="stitch-feature-card group">
              <span className={`absolute inset-y-0 left-0 w-1 ${accent === 'orange' ? 'bg-[var(--lp-orange)]' : 'bg-[var(--lp-navy)]'}`} />
              <Icon size={36} strokeWidth={1.55} className={accent === 'orange' ? 'text-[var(--lp-orange)]' : 'text-[var(--lp-navy)]'} />
              <h3 className="mt-6 text-lg font-bold text-[var(--lp-text)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--lp-muted)]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Operations() {
  return (
    <section id="tracking" className="bg-[var(--lp-panel)] py-20 sm:py-24">
      <div className="stitch-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded border border-[var(--lp-border)] bg-[var(--lp-surface)]">
          <img src={OPERATIONS_IMAGE} alt="A logistics operator coordinating deliveries from a workspace" className="aspect-video h-full w-full object-cover" />
        </div>
        <div>
          <p className="stitch-label">Operations</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[var(--lp-text)]">Intelligent dispatching</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--lp-muted)] sm:text-lg">
            Trakka groups confirmed orders by area and proximity so the business owner can build a practical route, reorder stops, and reduce costly double-backing.
          </p>
          <ul className="mt-6 space-y-3">
            {['Neighborhood-based route grouping', 'Manual stop sequencing before dispatch', 'Minimum price-floor protection'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-[var(--lp-text)]">
                <CheckCircle2 size={18} className="text-[var(--lp-orange)]" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Workflow() {
  return (
    <section id="resources" className="bg-[var(--lp-surface)] py-20 sm:py-24">
      <div className="stitch-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
         
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[var(--lp-text)]">Rider workflow management</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--lp-muted)] sm:text-lg">
            Riders work from a fast mobile browser queue: accept or reject a trip, open the assigned route in Google Maps, and update delivery status while the customer follows the ETA.
          </p>
          <button type="button" onClick={() => scrollToSection('access')} className="stitch-button stitch-button--outline mt-7">
            Access the platform <Navigation size={15} />
          </button>
        </div>
        <div className="overflow-hidden rounded border border-[var(--lp-border)] bg-[var(--lp-bg)] shadow-sm">
          <img src={WORKFLOW_IMAGE} alt="Dispatcher monitoring an active delivery workflow" className="aspect-video h-full w-full object-cover" />
        </div>
      </div>
    </section>
  )
}

function MvpCapabilities() {
  const capabilities = [
    {
      icon: ShieldCheck,
      title: 'Price-floor protection',
      body: 'Set a minimum delivery price. Customer counter-offers below that amount are blocked before dispatch.',
    },
    {
      icon: CreditCard,
      title: 'Three payment paths',
      body: 'Support sender-paid orders and cash or transfer collection on delivery.',
    },
    {
      icon: QrCode,
      title: 'Verified handoff',
      body: 'Complete deliveries with an OTP or QR code and preserve the final time, location, and status.',
    },
    {
      icon: Smartphone,
      title: 'Lightweight mobile delivery',
      body: 'Customers and riders use responsive browser experiences designed for ordinary smartphones and mobile networks.',
    },
  ]

  return (
    <section className="bg-[var(--lp-bg)] py-20 sm:py-24">
      <div className="stitch-container grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div>
         
          <h2 className="mt-4 max-w-lg text-4xl font-bold tracking-[-0.04em] text-[var(--lp-text)]">More than a moving dot on a map</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[var(--lp-muted)]">
            Trakka keeps pricing, payment, route execution, customer visibility, and delivery proof attached to the same operating record.
          </p>
        </div>
        <div className="grid border-l border-t border-[var(--lp-border)] sm:grid-cols-2">
          {capabilities.map(({ icon: Icon, title, body }) => (
            <article key={title} className="min-h-56 border-b border-r border-[var(--lp-border)] bg-[var(--lp-surface)] p-6">
              <Icon size={22} strokeWidth={1.7} className="text-[var(--lp-orange)]" />
              <h3 className="mt-8 text-base font-bold text-[var(--lp-text)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--lp-muted)]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductAccess() {
  const entries = [
    {
      icon: LayoutDashboard,
      eyebrow: 'Fleet owner',
      title: 'Business operations dashboard',
      body: 'Review delivery volume, live dispatch routes, trip activity, and fleet-level operating metrics.',
      label: 'View business dashboard',
      to: ROUTES.businessDashboard,
    },
    {
      icon: Smartphone,
      eyebrow: 'Rider',
      title: 'Mobile route workspace',
      body: 'Review the exact stop sequence, current task, navigation actions, delays, and incoming assignments.',
      label: 'View rider dashboard',
      to: ROUTES.riderDashboard,
    },
    {
      icon: MapPin,
      eyebrow: 'Customer',
      title: 'Live customer tracking',
      body: 'Preview the public, no-account tracking map, dynamic ETA, delivery timeline, rider identity, and OTP.',
      label: 'View customer dashboard',
      to: ROUTES.customerDashboard,
    },
  ]

  return (
    <section id="access" className="bg-[var(--lp-panel)] py-20 sm:py-24">
      <div className="stitch-container">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="stitch-label">Use the product</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[var(--lp-text)]">Choose where you need to go</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[var(--lp-muted)] lg:justify-self-end">
            All three prototype views are freely accessible for review. No registration, login, setup form, or secure tracking token is required at this stage.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {entries.map(({ icon: Icon, eyebrow, title, body, label, to }) => (
            <article key={title} className="flex min-h-72 flex-col border border-[var(--lp-border)] bg-[var(--lp-surface)] p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded bg-[var(--lp-panel)] text-[var(--lp-navy)]">
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--lp-orange)]">{eyebrow}</span>
              </div>
              <h3 className="mt-8 text-xl font-bold tracking-[-0.025em] text-[var(--lp-text)]">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--lp-muted)]">{body}</p>
              <Link to={to} className="stitch-button stitch-button--outline mt-7 self-start">{label}</Link>
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-[var(--lp-border)] bg-[var(--lp-bg)] px-5 py-4 text-sm text-[var(--lp-muted)]">
          <span>Want to review the existing account flow as well?</span>
          <div className="flex items-center gap-4">
            <Link to={ROUTES.businessSignup} className="font-semibold text-[var(--lp-text)] underline underline-offset-4">Create account</Link>
            <Link to={ROUTES.businessLogin} className="font-semibold text-[var(--lp-text)] underline underline-offset-4">Business login</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-[var(--lp-navy)] px-4 py-20 text-center text-white sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#ffb690]">Private pilot · Benin City</p>
        <h2 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">Ready to put every delivery on one system?</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#bec6e0] sm:text-lg">Set up your business, define your minimum price, and prepare your first tracked order.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={ROUTES.businessSignup} className="stitch-button stitch-button--orange px-8 py-3.5">Create business account</Link>
          <Link to={ROUTES.businessLogin} className="stitch-button border border-white/40 px-8 py-3.5 text-white hover:bg-white/10">Sign in</Link>
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="bg-[var(--lp-navy)] text-white">
      <div className="stitch-container grid gap-8 border-t border-white/15 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={27} />
            <span className="text-lg font-black">Trakka</span>
          </div>
          <p className="mt-3 text-xs text-[#bec6e0]">© {new Date().getFullYear()} Trakka. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-6 text-xs text-[#bec6e0]" aria-label="Footer navigation">
          <a href="mailto:hello@trakka.app" className="transition-colors hover:text-white">Support</a>
          <Link to={ROUTES.businessSignup} className="transition-colors hover:text-white">Create account</Link>
          <Link to={ROUTES.businessLogin} className="transition-colors hover:text-white">Business login</Link>
          <Link to={ROUTES.businessDashboard} className="transition-colors hover:text-white">Dashboard</Link>
          <Link to={ROUTES.riderDashboard} className="transition-colors hover:text-white">Rider view</Link>
          <Link to={ROUTES.customerDashboard} className="transition-colors hover:text-white">Customer view</Link>
          <span>Privacy</span>
          <span>Terms</span>
        </nav>
      </div>
    </footer>
  )
}

export default function StitchLanding() {
  return (
    <div className="stitch-landing">
      <a href="#landing-main" className="skip-link">Skip to content</a>
      <TopNav />
      <main id="landing-main">
        <Hero />
        <ProofBar />
        <Solutions />
        <Operations />
        <Workflow />
        <MvpCapabilities />
        <ProductAccess />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
