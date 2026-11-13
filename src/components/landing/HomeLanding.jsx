import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  Check,
  Link2,
  Map,
  MapPin,
  Menu,
  Navigation,
  QrCode,
  Radar,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react'
import Logo from '../ui/Logo'
import { ROUTES } from '../../lib/routes'
import '../../styles/landing.css'

const NAV = [
  ['Features', 'features'],
  ['Operations', 'operations'],
  ['Workflows', 'workflows'],
  ['Safeguards', 'protection'],
]

const FEATURES = [
  {
    icon: Link2,
    tone: 'orange',
    title: 'Smart intake links',
    body: 'One WhatsApp link collects pickup, drop-off and package details from the customer.',
  },
  {
    icon: Map,
    tone: 'navy',
    title: 'Zone-based batching',
    body: 'Group orders by neighbourhood, set the stop order and send one route to the rider.',
  },
  {
    icon: MapPin,
    tone: 'green',
    title: 'Live rider tracking',
    body: 'Customers follow the rider on a branded page with no account or app download.',
  },
]

const OPS = [
  'Neighbourhood grouping',
  'Manual stop sequencing',
  'Price-floor protection',
]

const WORKFLOW = [
  ['01', 'Accept the route', 'The rider opens a WhatsApp link and accepts the trip.'],
  ['02', 'Open Maps', 'The full stop list opens in Google Maps with one tap.'],
  ['03', 'Confirm hand-off', 'QR or OTP closes the delivery and updates the customer.'],
]

const SAFEGUARDS = [
  {
    icon: ShieldCheck,
    tone: 'orange',
    title: 'Price-floor protection',
    body: 'Counter-offers below your minimum delivery price never reach dispatch.',
  },
  {
    icon: Wallet,
    tone: 'navy',
    title: 'Payment records',
    body: 'Prepaid and pay-on-delivery amounts stay attached to the delivery.',
  },
  {
    icon: QrCode,
    tone: 'green',
    title: 'Verified hand-off',
    body: 'QR or OTP proof with the time, GPS position and method on file.',
  },
  {
    icon: Smartphone,
    tone: 'blue',
    title: 'Lightweight mobile',
    body: 'Riders and customers use browser pages on ordinary phones.',
  },
]

function Brand({ light = false }) {
  return (
    <span className={`lp-brand${light ? ' lp-brand--light' : ''}`}>
      <Logo size={28} />
      <span className="lp-brand__name">Trakka</span>
    </span>
  )
}

function Cockpit() {
  return (
    <div className="lp-cockpit" id="cockpit">
      <div className="lp-cockpit__bar">
        <span className="lp-cockpit__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="lp-mono"><Radar size={14} /> Dispatch · Route 14</span>
        <span className="lp-cockpit__bar-right">
          <span className="lp-mono lp-cockpit__live"><i /> 5 stops · 3 done</span>
        </span>
      </div>

      <div className="lp-cockpit__grid">
        <section className="lp-cockpit__pane lp-cockpit__intake" aria-label="Incoming WhatsApp orders">
          <div className="lp-pane__head">
            <div>
              <span className="lp-label">Incoming orders</span>
              <h3>WhatsApp batches</h3>
            </div>
            <span className="lp-pill lp-pill--warning">5 ready</span>
          </div>
          <div className="lp-batch">
            <div className="lp-batch__head"><span>GRA / Airport Road</span><strong>4 orders</strong></div>
            <p>₦11,400 · Rider Emeka</p>
          </div>
          <div className="lp-batch">
            <div className="lp-batch__head"><span>Ugbowo Corridor</span><strong>3 orders</strong></div>
            <p>₦8,900 · Awaiting pickup</p>
          </div>
        </section>

        <section className="lp-cockpit__pane lp-cockpit__map" aria-label="Active route map">
          <div className="lp-pane__head">
            <div>
              <span className="lp-label">Live route</span>
              <h3>Active run map</h3>
            </div>
            <span className="lp-chip">ETA 4:18 PM</span>
          </div>
          <div className="lp-map">
            <svg viewBox="0 0 600 330" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <pattern id="lp-map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="600" height="330" fill="url(#lp-map-grid)" />
              <path className="lp-map__road" d="M-20 90C100 60 180 130 280 110S450 40 620 80" />
              <path className="lp-map__road" d="M-20 250C120 210 210 280 340 240S500 170 620 210" />
              <path className="lp-map__road" d="M120-20C90 90 160 180 130 350" />
              <path className="lp-map__road" d="M420-20C380 100 460 220 430 350" />
              <path className="lp-map__route" d="M70 260C170 210 220 240 300 170S430 100 500 60" />
              <circle cx="70" cy="260" r="7" className="lp-map__pin" />
              <circle cx="300" cy="170" r="6" className="lp-map__pin lp-map__pin--done" />
              <circle cx="500" cy="60" r="9" className="lp-map__pin lp-map__pin--now" />
            </svg>
            <div className="lp-map__top">
              <span className="lp-mono">Sapele Road hub · 08:30</span>
              <span className="lp-mono lp-map__rider">Emeka · Bajaj Boxer</span>
            </div>
          </div>
          <div className="lp-metrics">
            <div><span className="lp-label">Stops</span><strong>5</strong></div>
            <div><span className="lp-label">Done</span><strong>3</strong></div>
            <div><span className="lp-label">Next</span><strong>GRA</strong></div>
          </div>
        </section>

        <section className="lp-cockpit__pane lp-cockpit__rider" aria-label="Rider mobile view">
          <div className="lp-rider__head">
            <span className="lp-label lp-label--orange"><Smartphone size={14} /> Rider view</span>
            <h3>No app needed</h3>
          </div>
          <div className="lp-phone">
            <div className="lp-phone__top">
              <span className="lp-mono">Next stop</span>
              <span className="lp-pill lp-pill--success">Active</span>
            </div>
            <div className="lp-phone__card">
              <strong>Mrs. Enoma</strong>
              <p>Boundary Road, GRA</p>
              <span className="lp-mono lp-orange">Collect ₦4,500</span>
            </div>
            <div className="lp-phone__btn lp-phone__btn--orange" aria-hidden="true">
              <Navigation size={15} /> Open route
            </div>
          </div>
          <div className="lp-rider__sync"><Check size={14} /> Customer tracking updated</div>
        </section>
      </div>
    </div>
  )
}

export default function HomeLanding() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="lp-root">
      <a className="lp-skip" href="#main">Skip to content</a>

      <header className="lp-nav">
        <div className="lp-wrap lp-nav__bar">
          <a href="#top" aria-label="Trakka home"><Brand /></a>
          <nav className="lp-nav__links" aria-label="Main">
            {NAV.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <div className="lp-nav__actions">
            <span className="lp-pilot"><i />Pilot active</span>
            <Link className="lp-nav__signin" to={ROUTES.businessLogin}>Sign in</Link>
            <Link className="lp-btn lp-btn--primary" to={ROUTES.businessSignup}>Create business account</Link>
          </div>
          <button
            type="button"
            className="lp-nav__toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="lp-sheet">
            {NAV.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <Link to={ROUTES.businessLogin} onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link className="lp-btn lp-btn--primary" to={ROUTES.businessSignup} onClick={() => setMenuOpen(false)}>Create business account</Link>
          </div>
        )}
      </header>

      <main id="main">
        <section className="lp-hero" id="top" aria-labelledby="hero-h">
          <div className="lp-hero__grid" aria-hidden="true" />
          <div className="lp-hero__glow lp-hero__glow--a" aria-hidden="true" />
          <div className="lp-hero__glow lp-hero__glow--b" aria-hidden="true" />
          <div className="lp-wrap lp-hero__inner">
            <span className="lp-hero__pill"><i />Private pilot · Benin City</span>
            <h1 id="hero-h">Intelligent logistics management software for dispatch businesses in Nigeria</h1>
            <p className="lp-hero__lead">
              WhatsApp orders, zone batching, rider links and live customer tracking in one system.
            </p>
            <div className="lp-hero__actions">
              <Link className="lp-btn lp-btn--primary lp-btn--lg" to={ROUTES.businessSignup}>
                Create business account <ArrowRight size={18} />
              </Link>
              
            </div>
            <Cockpit />
          </div>
        </section>

        <section className="lp-section" id="features" aria-labelledby="features-h">
          <div className="lp-wrap">
            <div className="lp-section__head">
              <span className="lp-eyebrow">Core features</span>
              <h2 id="features-h">Built for the demands of local delivery</h2>
              <p>The shortest path from customer request to verified hand-off.</p>
            </div>
            <div className="lp-features">
              {FEATURES.map(({ icon: Icon, tone, title, body }) => (
                <article className={`lp-card lp-card--${tone}`} key={title}>
                  <span className="lp-card__rail" aria-hidden="true" />
                  <div className="lp-card__body">
                    <span className="lp-card__icon"><Icon size={22} /></span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--tint" id="operations" aria-labelledby="ops-h">
          <div className="lp-wrap lp-split">
            <div className="lp-split__media">
              <img
                src="/images/dispatch-rider.jpg"
                alt="A dispatch rider's handlebars and phone navigation on a busy Benin City street"
                loading="lazy"
                decoding="async"
              />
              <div className="lp-overlay">
                <div>
                  <span className="lp-label lp-label--orange">Rider cockpit</span>
                  <h3>Turn-by-turn on the handlebar</h3>
                </div>
              </div>
            </div>
            <div className="lp-split__copy">
              <span className="lp-eyebrow">Operations</span>
              <h2 id="ops-h">Intelligent dispatching</h2>
              <p className="lp-lead">
                Trakka groups orders by area, sets the stop order and gives the rider one clear route.
              </p>
              <ul className="lp-ops">
                {OPS.map((item) => (
                  <li key={item}><Check size={14} /> {item}</li>
                ))}
              </ul>
              <a className="lp-link" href="#workflows">See how a route runs <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="lp-section" id="workflows" aria-labelledby="workflow-h">
          <div className="lp-wrap lp-split lp-split--reverse">
            <div className="lp-split__copy">
              <span className="lp-eyebrow">Field execution</span>
              <h2 id="workflow-h">Rider workflow</h2>
              <p className="lp-lead">
                Riders accept a route, open Maps and confirm hand-off from the phone browser.
              </p>
              <div className="lp-steps">
                {WORKFLOW.map(([num, title, body]) => (
                  <div className="lp-step" key={num}>
                    <span className="lp-mono">{num}</span>
                    <div><strong>{title}</strong><p>{body}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-split__media lp-split__media--panel">
              <div className="lp-rider-card">
                <div className="lp-rider-card__head">
                  <span className="lp-label lp-label--orange"><Smartphone size={14} /> Rider view</span>
                  <span className="lp-pill lp-pill--success">On route</span>
                </div>
                <div className="lp-task">
                  <span className="lp-mono">Next stop · GRA</span>
                  <strong>Mrs. Enoma</strong>
                  <p>Boundary Road, GRA</p>
                  <span className="lp-orange lp-mono">Collect ₦4,500</span>
                </div>
                <div className="lp-rider-actions">
                  <span><Navigation size={15} /> Open in Google Maps</span>
                  <span><QrCode size={15} /> Verify with QR</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--tint" id="protection" aria-labelledby="protection-h">
          <div className="lp-wrap">
            <div className="lp-section__head">
              <span className="lp-eyebrow">Safeguards</span>
              <h2 id="protection-h">More than a moving dot on a map</h2>
              <p>Pricing, payment and proof stay attached to the same delivery record.</p>
            </div>
            <div className="lp-safeguards">
              {SAFEGUARDS.map(({ icon: Icon, tone, title, body }) => (
                <article className={`lp-guard lp-guard--${tone}`} key={title}>
                  <span className="lp-guard__icon"><Icon size={20} /></span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-cta" id="pilot" aria-labelledby="cta-h">
          <div className="lp-cta__rings" aria-hidden="true" />
          <div className="lp-wrap lp-cta__inner">
            <span className="lp-hero__pill"><i />Private pilot · Benin City</span>
            <h2 id="cta-h">Ready to put every delivery on one system?</h2>
            <p>Set up your business, set your minimum price and prepare your first delivery.</p>
            <div className="lp-hero__actions">
              <Link className="lp-btn lp-btn--primary lp-btn--lg" to={ROUTES.businessSignup}>
                Create business account <ArrowRight size={18} />
              </Link>
              <Link className="lp-btn lp-btn--ghost lp-btn--lg" to={ROUTES.businessLogin}>
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer__grid">
          <div className="lp-footer__brand">
            <Brand />
            <p>Logistics operating software for motorcycle courier fleets in Nigeria.</p>
            <span className="lp-pilot"><i />Private pilot · Benin City</span>
          </div>
          <div className="lp-footer__col">
            <h3>Platform</h3>
            <a href="#features">Dispatch engine</a>
            <a href="#operations">Route batching</a>
            <a href="#workflows">Proof of delivery</a>
          </div>
          <div className="lp-footer__col">
            <h3>Company</h3>
            <a href="#pilot">Pilot access</a>
            <Link to={ROUTES.businessSignup}>Create account</Link>
            <Link to={ROUTES.businessLogin}>Sign in</Link>
          </div>
          <div className="lp-footer__col">
            <h3>Access</h3>
            <a href="mailto:hello@trakka.example">Email us</a>
            <a href="#protection">Safeguards</a>
            <a href="#top">Back to top</a>
          </div>
        </div>
        <div className="lp-wrap lp-footer__legal">
          <span>© {new Date().getFullYear()} Trakka. Built for dispatch businesses in Nigeria.</span>
          <span className="lp-mono">BNI · PRIVATE PILOT</span>
        </div>
      </footer>
    </div>
  )
}
