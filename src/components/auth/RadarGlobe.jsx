import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const TAU = Math.PI * 2
const D2R = Math.PI / 180
const KS = 1000

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
// Quintic smootherstep — zero velocity and acceleration at both ends, so the
// camera glides between the Africa → Nigeria → Edo stages without hitches.
const ease = (t) => { const x = clamp(t); return x * x * x * (x * (x * 6 - 15) + 10) }
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * D2R) / 2))
const unmerc = (y) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / D2R

const NEIGHBOURS = new Set(['Niger', 'Chad', 'Cameroon', 'Benin', 'Togo', 'Ghana', 'Burkina Faso'])

const CITY_DEF = [
  ['Lagos', 3.38, 6.52, 1, '#ff6b2c', 'l'], ['Abuja', 7.4, 9.08, 1, '#38bdf8', 'r'], ['Kano', 8.52, 12.0, 1, '#10b981', 'r'], ['Port Harcourt', 7.03, 4.82, 1, '#f59e0b', 'r'],
  ['Benin City', 5.63, 6.34, 1, '#ff6b2c', 'l'],
  ['Ibadan', 3.9, 7.38, 2, '#e2e8f0', 'l'], ['Kaduna', 7.44, 10.52, 2, '#e2e8f0', 'l'], ['Maiduguri', 13.15, 11.85, 2, '#e2e8f0', 'r'],
  ['Enugu', 7.5, 6.44, 2, '#e2e8f0', 'r'], ['Jos', 8.89, 9.93, 2, '#e2e8f0', 'r'], ['Ilorin', 4.55, 8.5, 2, '#e2e8f0', 'l'], ['Sokoto', 5.24, 13.06, 2, '#e2e8f0', 'r'],
  ['Calabar', 8.32, 4.95, 2, '#e2e8f0', 'r'], ['Yola', 12.46, 9.2, 2, '#e2e8f0', 'r'],
  ['Warri', 5.75, 5.52, 3, '#cbd5e1', 'l'], ['Onitsha', 6.79, 6.14, 3, '#cbd5e1', 'r'], ['Abeokuta', 3.35, 7.16, 3, '#cbd5e1', 'l'], ['Akure', 5.19, 7.25, 3, '#cbd5e1', 'l'],
  ['Owerri', 7.03, 5.48, 3, '#cbd5e1', 'l'], ['Makurdi', 8.52, 7.73, 3, '#cbd5e1', 'r'], ['Minna', 6.55, 9.61, 3, '#cbd5e1', 'l'], ['Katsina', 7.6, 12.99, 3, '#cbd5e1', 'r'],
  ['Uyo', 7.93, 5.05, 3, '#cbd5e1', 'r'], ['Osogbo', 4.56, 7.77, 3, '#cbd5e1', 'l'], ['Lokoja', 6.74, 7.8, 3, '#cbd5e1', 'r'], ['Bauchi', 9.84, 10.31, 3, '#cbd5e1', 'r'], ['Gombe', 11.17, 10.29, 3, '#cbd5e1', 'r'],
  ['Asaba', 6.74, 6.2, 3, '#cbd5e1', 'r'],
]
const EDO_TOWNS = [['Ekpoma', 6.14, 6.75, 'l'], ['Auchi', 6.27, 7.07, 'r'], ['Uromi', 6.33, 6.71, 'r'], ['Igarra', 6.11, 7.26, 'l'], ['Okada', 5.39, 6.74, 'l'], ['Agenebode', 6.69, 7.11, 'r'], ['Ubiaja', 6.38, 6.65, 'r'], ['Igueben', 6.2, 6.57, 'l']]
  .map((h) => ({ name: h[0], ll: [h[1], h[2]], side: h[3] }))
const HUBS = [['Accra', -0.19, 5.6, 'r'], ['Abidjan', -4.02, 5.36, 'l'], ['Dakar', -17.47, 14.69, 'r'], ['Casablanca', -7.59, 33.57, 'l'], ['Algiers', 3.06, 36.75, 'r'],
  ['Cairo', 31.24, 30.04, 'r'], ['Addis Ababa', 38.75, 9.03, 'r'], ['Nairobi', 36.82, -1.29, 'r'], ['Kinshasa', 15.27, -4.44, 'r'], ['Luanda', 13.23, -8.84, 'l'],
  ['Johannesburg', 28.05, -26.2, 'r'], ['Cape Town', 18.42, -33.92, 'l']].map((h) => ({ name: h[0], ll: [h[1], h[2]], side: h[3] }))
const OCEANS = [['ATLANTIC OCEAN', -19, -8], ['INDIAN OCEAN', 56, -16], ['MEDITERRANEAN SEA', 17, 35.9], ['RED SEA', 38.6, 20.5], ['GULF OF GUINEA', 1.2, 3.4]]

// Faster than the reference timeline (33s): 19.4s total, still readable.
const T = { wide: 1.6, f1: 3.2, h1: 2.2, f2: 4.2, h2: 4.6, out: 3.6 }
const TOTAL = T.wide + T.f1 + T.h1 + T.f2 + T.h2 + T.out

const AFRICA_B = [[-17.6, -34.9], [51.5, 37.4]]

const LAT_STOPS = [[40, '#242c2a'], [31, '#2d2b22'], [24, '#322d22'], [16, '#2a2c21'], [10, '#1d2f22'], [4, '#15321f'], [-5, '#15321f'], [-12, '#1d2f21'], [-20, '#2b2c20'], [-28, '#2e2b22'], [-36, '#232c28']]

const UI_FONT = '"Inter", "Plus Jakarta Sans", system-ui, sans-serif'

function catmull(pts, seg) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    for (let k = 0; k < seg; k++) {
      const t = k / seg
      const t2 = t * t
      const t3 = t2 * t
      const pt = []
      for (let d = 0; d < 2; d++) {
        pt.push(0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))
      }
      out.push(pt)
    }
  }
  out.push(pts[pts.length - 1])
  return out
}
const RIVERS = [
  { w: 1.7, g: { type: 'LineString', coordinates: catmull([[3.45, 11.88], [4.1, 11.0], [4.6, 10.4], [4.65, 9.9], [4.8, 9.15], [5.5, 9.0], [6.0, 8.8], [6.4, 8.6], [6.75, 7.8], [6.78, 6.15], [6.7, 5.4], [6.3, 4.5]], 8) } },
  { w: 1.3, g: { type: 'LineString', coordinates: catmull([[13.0, 9.4], [12.4, 9.25], [11.8, 9.45], [11.0, 9.3], [10.4, 8.9], [9.8, 8.2], [8.5, 7.75], [7.5, 7.7], [6.75, 7.8]], 8) } },
]

function toPath(g) {
  const p = new Path2D()
  const ring = (r, close) => {
    for (let i = 0; i < r.length; i++) {
      const x = r[i][0] * D2R * KS
      const y = -merc(clamp(r[i][1], -85, 85)) * KS
      if (i) p.lineTo(x, y); else p.moveTo(x, y)
    }
    if (close) p.closePath()
  }
  if (g.type === 'Polygon') g.coordinates.forEach((r) => ring(r, true))
  else if (g.type === 'MultiPolygon') g.coordinates.forEach((pl) => pl.forEach((r) => ring(r, true)))
  else if (g.type === 'LineString') ring(g.coordinates, false)
  return p
}

const worldX = (lon) => lon * D2R * KS

/** Bounding box in world units for a GeoJSON geometry. */
function bounds(g) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity
  const scan = (coords) => {
    if (typeof coords[0] === 'number') {
      const [lon, lat] = coords
      if (lon < minLon) minLon = lon
      if (lon > maxLon) maxLon = lon
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      return
    }
    coords.forEach(scan)
  }
  scan(g.coordinates)
  return [[minLon, minLat], [maxLon, maxLat]]
}
function centroid(b) { return [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2] }

function prepareScene(data) {
  const countries = data.countries.map((d) => {
    const b = bounds(d.g)
    return { id: +d.id, name: d.n, p: toPath(d.g), b, c: centroid(b), w: b[1][0] - b[0][0], ng: +d.id === 566, nb: NEIGHBOURS.has(d.n) }
  })
  const loPaths = {}
  data.countriesLo.forEach((d) => { loPaths[d.id] = toPath(d.g) })
  countries.forEach((c) => { c.pl = loPaths[c.id] || c.p })

  const nigeria = countries.find((c) => c.ng)

  // Combine outlines once — every frame then draws a single Path2D per layer.
  const landHi = new Path2D()
  const landLo = new Path2D()
  for (const c of countries) {
    landHi.addPath(c.p)
    landLo.addPath(c.pl)
  }

  const states = data.states.map((s, i) => {
    const b = bounds(s.g)
    return { name: s.n, p: toPath(s.g), b, c: centroid(b), edo: /^edo$/i.test(s.n), bk: (i * 37) % 3, tint: 0.012 + ((i * 37) % 7) / 7 * 0.05 }
  })
  const edo = states.find((s) => s.edo)
  const stateBuckets = [new Path2D(), new Path2D(), new Path2D()]
  const allStates = new Path2D()
  for (const st of states) {
    if (st.edo) continue
    stateBuckets[st.bk].addPath(st.p)
    allStates.addPath(st.p)
  }

  const lgas = data.lgas.map((s) => {
    const b = bounds(s.g)
    return { name: s.n.replace(/-/g, '‑'), p: toPath(s.g), b, c: centroid(b), bk: 0 }
  })
  const lgaBuckets = [new Path2D(), new Path2D(), new Path2D()]
  const allLgas = new Path2D()
  lgas.forEach((lg, i) => {
    lg.bk = i % 3
    lgaBuckets[lg.bk].addPath(lg.p)
    allLgas.addPath(lg.p)
  })

  const cityByName = {}
  const cities = CITY_DEF.map((d, i) => {
    const o = { name: d[0], ll: [d[1], d[2]], tier: d[3], color: d[4], side: d[5], i }
    cityByName[o.name] = o
    return o
  })

  const makeRoute = (a, b, c1, c2, n, lift, speed, off) => {
    const ip = (t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]
    const ux = []
    const uy = []
    for (let i = 0; i < n; i++) {
      const q = ip(i / (n - 1))
      ux.push(worldX(q[0]))
      uy.push(-merc(q[1]) * KS)
    }
    return { ux, uy, c1, c2, lift, speed, off }
  }
  const DOM_ROUTES = [
    ['Lagos', 'Abuja', '#38bdf8', '#ff6b2c'], ['Abuja', 'Kano', '#10b981', '#ff6b2c'], ['Lagos', 'Port Harcourt', '#38bdf8', '#38bdf8'],
    ['Lagos', 'Ibadan', '#f59e0b', '#ff6b2c'], ['Abuja', 'Kaduna', '#10b981', '#10b981'], ['Port Harcourt', 'Enugu', '#f59e0b', '#f59e0b'],
    ['Kano', 'Maiduguri', '#10b981', '#38bdf8'], ['Lagos', 'Benin City', '#38bdf8', '#f59e0b'], ['Abuja', 'Jos', '#38bdf8', '#10b981'],
    ['Kano', 'Sokoto', '#10b981', '#10b981'], ['Benin City', 'Port Harcourt', '#f59e0b', '#f59e0b'], ['Abuja', 'Port Harcourt', '#38bdf8', '#f59e0b'],
  ].map((r, i) => makeRoute(cityByName[r[0]].ll, cityByName[r[1]].ll, r[2], r[3], 36, 0.2, 0.09 + (i % 5) * 0.025, (i * 0.37) % 1))
  const CONT_ROUTES = HUBS.map((h, i) => makeRoute(cityByName.Lagos.ll, h.ll, i % 2 ? '#10b981' : '#38bdf8', '#ff6b2c', 56, 0.26, 0.06 + (i % 4) * 0.015, (i * 0.23) % 1))
  const BEN = cityByName['Benin City'].ll
  const EDO_ROUTES = EDO_TOWNS.map((h, i) => makeRoute(BEN, h.ll, i % 2 ? '#38bdf8' : '#10b981', '#ff6b2c', 32, 0.2, 0.1 + (i % 4) * 0.03, (i * 0.29) % 1))
    .concat([['Warri', '#f59e0b'], ['Akure', '#38bdf8'], ['Asaba', '#10b981'], ['Onitsha', '#f59e0b']].map((r, i) => makeRoute(BEN, cityByName[r[0]].ll, r[1], '#ff6b2c', 32, 0.18, 0.08 + i * 0.02, (i * 0.41) % 1)))

  RIVERS.forEach((r) => { r.p = toPath(r.g) })

  return {
    countries, nigeria, landHi, landLo, states, edo, stateBuckets, allStates,
    lgas, lgaBuckets, allLgas, cities, cityByName, DOM_ROUTES, CONT_ROUTES, EDO_ROUTES,
  }
}

/**
 * Flat Mercator map flight: all of Africa → Nigeria → Edo State/Benin City and
 * back out. Geometry is built once in world space (milli-radian Mercator) and
 * each frame only changes the camera transform, which keeps the animation
 * smooth at every zoom level.
 */
export default function RadarGlobe({ className = '' }) {
  const hostRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    let cancelled = false
    let sketch = null

    Promise.all([import('p5'), import('./flatMapData.json')])
      .then(([p5Module, dataModule]) => {
        if (cancelled) return
        const P5 = p5Module.default
        const data = dataModule.default || dataModule
        sketch = new P5((p) => {
          let globe = null
          let observer = null
          let startedAt = 0
          let lastFrame = 0
          let ema = 16
          let slowFrames = 0
          const densitySteps = [Math.min(window.devicePixelRatio || 1, 2), 1.5, 1, 0.75]
          let densityIndex = 0

          p.setup = () => {
            const width = Math.max(1, host.clientWidth)
            const height = Math.max(1, host.clientHeight)
            const canvas = p.createCanvas(width, height)
            canvas.parent(host)
            p.pixelDensity(densitySteps[0])
            p.frameRate(60)
            globe = bootstrapMap(canvas.elt, data, densitySteps[0])
            startedAt = p.millis()
            if (reducedMotion) {
              globe.drawStatic()
              p.noLoop()
              return
            }
            observer = new ResizeObserver(() => {
              const nextWidth = Math.max(1, host.clientWidth)
              const nextHeight = Math.max(1, host.clientHeight)
              p.resizeCanvas(nextWidth, nextHeight)
              p.pixelDensity(densitySteps[densityIndex])
              globe.resize(nextWidth, nextHeight, densitySteps[densityIndex])
            })
            observer.observe(host)
            globe.resize(width, height, densitySteps[0])
          }

          p.draw = () => {
            if (!globe) return
            const now = p.millis()
            // Adaptive quality: if frames stay slow, drop the render density a
            // step so the motion stays fluid instead of stuttering.
            if (lastFrame) {
              ema = ema * 0.92 + Math.min(120, now - lastFrame) * 0.08
              slowFrames = ema > 34 ? slowFrames + 1 : 0
              if (slowFrames > 45 && densityIndex < densitySteps.length - 1) {
                densityIndex += 1
                slowFrames = 0
                ema = 16
                p.pixelDensity(densitySteps[densityIndex])
                globe.resize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight), densitySteps[densityIndex])
              }
            }
            lastFrame = now
            globe.drawFrame(now - startedAt)
          }

          p.remove = ((originalRemove) => (...args) => {
            observer?.disconnect()
            return originalRemove.apply(p, args)
          })(p.remove)
        }, host)
      })
      .catch((err) => {
        console.error('map animation failed to boot', err)
        setFailed(true)
      })

    return () => {
      cancelled = true
      if (sketch) sketch.remove()
    }
  }, [reducedMotion])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {failed && <div className="absolute inset-0 bg-[var(--color-ink)]" />}
      <div ref={hostRef} className="absolute inset-0 [&>canvas]:!block [&>canvas]:!h-full [&>canvas]:!w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(2,4,8,0)_58%,rgba(2,4,8,0.6)_100%)]" />
    </div>
  )
}

function bootstrapMap(canvas, data, pixelDensity = 1) {
  const ctx = canvas.getContext('2d')
  const scene = prepareScene(data)

  let W = 0
  let H = 0
  let DPR = pixelDensity
  const safeTop = 16
  const safeBot = 16
  let STAGE = null

  // World-space camera: cx/cy in Mercator milli-radians, s = pixels per unit.
  const CAM = { cx: 0, cy: 0, s: 1 }
  let WK = 1
  const V = { lon0: 0, lon1: 0, lat0: 0, lat1: 0 }

  const proj = (ll) => [W / 2 + (ll[0] * D2R - CAM.cx) * CAM.s, H / 2 - (merc(ll[1]) - CAM.cy) * CAM.s]
  const world = () => {
    const k = CAM.s / KS
    WK = 1 / k
    ctx.setTransform(DPR * k, 0, 0, DPR * k, DPR * (W / 2 - CAM.cx * CAM.s), DPR * (H / 2 + CAM.cy * CAM.s))
  }
  const screen = () => ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  const fillP = (p, a, col) => { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fill(p, 'evenodd') }
  const strokeP = (p, a, col, px) => { ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = px * WK; ctx.stroke(p) }

  const seaCv = document.createElement('canvas')
  function buildSea() {
    seaCv.width = Math.round(W * DPR)
    seaCv.height = Math.round(H * DPR)
    const g = seaCv.getContext('2d')
    const gr = g.createRadialGradient(seaCv.width * 0.45, seaCv.height * 0.4, 0, seaCv.width / 2, seaCv.height / 2, Math.hypot(seaCv.width, seaCv.height) * 0.6)
    gr.addColorStop(0, '#0e2744')
    gr.addColorStop(0.55, '#09182b')
    gr.addColorStop(1, '#050c17')
    g.fillStyle = gr
    g.fillRect(0, 0, seaCv.width, seaCv.height)
  }

  function fitBounds(b, ext) {
    const ux0 = b[0][0] * D2R
    const ux1 = b[1][0] * D2R
    const uy0 = merc(b[0][1])
    const uy1 = merc(b[1][1])
    const s = Math.min((ext[2] - ext[0]) / (ux1 - ux0), (ext[3] - ext[1]) / (uy1 - uy0))
    const dx = (ext[0] + ext[2]) / 2 - W / 2
    const dy = (ext[1] + ext[3]) / 2 - H / 2
    return { s, cx: (ux0 + ux1) / 2 - dx / s, cy: (uy0 + uy1) / 2 + dy / s }
  }

  function resize(width, height, dpr = pixelDensity) {
    if (!width || !height) return
    DPR = dpr
    W = width
    H = height
    const px = W * 0.05
    STAGE = {
      A: fitBounds(AFRICA_B, [px, safeTop + 4, W - px, H - safeBot - 4]),
      N: fitBounds(scene.nigeria.b, [W * 0.1, safeTop + 36, W * 0.9, H - safeBot - 4]),
      E: fitBounds(scene.edo.b, [W * 0.12, safeTop + 40, W * 0.88, H - safeBot - 6]),
    }
    buildSea()
    draw(lastElapsed)
  }

  function flight(a, b, u) {
    const uc = ease(clamp(u / 0.88))
    const us = ease(clamp((u - 0.08) / 0.92))
    return { cx: lerp(a.cx, b.cx, uc), cy: lerp(a.cy, b.cy, uc), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), us)) }
  }
  function hold(a, u, tt) {
    const bump = Math.pow(Math.sin(Math.PI * u), 2)
    return { cx: a.cx + (8 * Math.sin(tt * 0.5) * bump) / a.s, cy: a.cy + (5 * Math.cos(tt * 0.43) * bump) / a.s, s: a.s * (1 + 0.03 * bump) }
  }
  function camera(t, tt) {
    const A = STAGE.A
    const N = STAGE.N
    const E = STAGE.E
    let c
    let k = t
    if (k < T.wide) { c = hold(A, k / T.wide, tt) } else if ((k -= T.wide) < T.f1) { c = flight(A, N, k / T.f1) } else if ((k -= T.f1) < T.h1) { c = hold(N, k / T.h1, tt) } else if ((k -= T.h1) < T.f2) { c = flight(N, E, k / T.f2) } else if ((k -= T.f2) < T.h2) { c = hold(E, k / T.h2, tt) } else { k -= T.h2; c = flight(A, E, 1 - clamp(k / T.out)) }
    const lA = Math.log(A.s)
    const lN = Math.log(N.s)
    const lE = Math.log(E.s)
    const ls = Math.log(c.s)
    return {
      cx: c.cx,
      cy: c.cy,
      s: c.s,
      lon: c.cx / D2R,
      lat: unmerc(c.cy),
      zN: clamp((ls - lA) / (lN - lA)),
      zE: clamp((ls - lN) / (lE - lN)),
      zoom: c.s / A.s,
    }
  }

  /* ---------- routes & labels ---------- */
  function projectRoute(r) {
    const n = r.ux.length
    const out = new Array(n)
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9
    const s = CAM.s
    const ox = W / 2 - CAM.cx * s
    const oy = H / 2 + CAM.cy * s
    for (let i = 0; i < n; i++) {
      const x = ox + r.ux[i] * s
      const y = oy - r.uy[i] * s
      out[i] = [x, y]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    if (maxX < -60 || minX > W + 60 || maxY < -60 || minY > H + 60) return null
    const amp = Math.hypot(out[n - 1][0] - out[0][0], out[n - 1][1] - out[0][1]) * r.lift
    for (let i = 0; i < n; i++) out[i][1] -= amp * Math.sin(Math.PI * (i / (n - 1)))
    return out
  }
  function tracePts(pts) {
    ctx.beginPath()
    for (let i = 0; i < pts.length; i++) {
      if (i) ctx.lineTo(pts[i][0], pts[i][1]); else ctx.moveTo(pts[i][0], pts[i][1])
    }
  }
  function sampleAt(pts, f) {
    const i = clamp(f) * (pts.length - 1)
    const i0 = Math.floor(i)
    const i1 = Math.min(pts.length - 1, i0 + 1)
    const t = i - i0
    return [lerp(pts[i0][0], pts[i1][0], t), lerp(pts[i0][1], pts[i1][1], t)]
  }
  function drawRoute(r, pts, alpha, width, tt) {
    const first = pts[0]
    const last = pts[pts.length - 1]
    const g = ctx.createLinearGradient(first[0], first[1], last[0], last[1])
    g.addColorStop(0, rgba(r.c1, 0.85))
    g.addColorStop(1, rgba(r.c2, 0.85))
    ctx.globalAlpha = alpha * 0.28
    ctx.strokeStyle = g
    ctx.lineWidth = width * 3.2
    tracePts(pts)
    ctx.stroke()
    ctx.globalAlpha = alpha * 0.9
    ctx.lineWidth = width
    ctx.setLineDash([4 * width + 1, 5 * width + 2])
    ctx.lineDashOffset = -tt * 16
    tracePts(pts)
    ctx.stroke()
    ctx.setLineDash([])
    for (let k = 0; k < 2; k++) {
      const f = (tt * r.speed + r.off + k * 0.5) % 1
      const head = sampleAt(pts, f)
      let prev = head
      const segs = 6
      for (let i = 1; i <= segs; i++) {
        const q = sampleAt(pts, f - 0.1 * i / segs)
        ctx.globalAlpha = alpha * (1 - i / segs) * 0.9
        ctx.strokeStyle = rgba(r.c2, 1)
        ctx.lineWidth = width * 1.5 * (1 - i / (segs + 2))
        ctx.beginPath()
        ctx.moveTo(prev[0], prev[1])
        ctx.lineTo(q[0], q[1])
        ctx.stroke()
        prev = q
      }
      ctx.globalAlpha = alpha
      const s = 11 + width * 4
      ctx.drawImage(sprite(r.c2), head[0] - s / 2, head[1] - s / 2, s, s)
    }
    ctx.globalAlpha = 1
  }

  const mcache = new Map()
  function setLS(ls) { if ('letterSpacing' in ctx) ctx.letterSpacing = `${ls || 0}px` }
  function tw(font, ls, text) {
    const k = `${font}|${ls}|${text}`
    let w = mcache.get(k)
    if (w === undefined) { ctx.font = font; setLS(ls); w = ctx.measureText(text).width; mcache.set(k, w) }
    return w
  }
  function placeLabels(list, placed) {
    list.sort((a, b) => b.prio - a.prio)
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.lineJoin = 'round'
    for (const l of list) {
      if (l.a < 0.02) continue
      const w = tw(l.font, l.ls, l.text)
      const h = l.size + 4
      const x0 = l.side === 'r' ? l.x : l.side === 'l' ? l.x - w : l.x - w / 2
      const y0 = l.y - h / 2
      if (x0 < 8 || x0 + w > W - 8 || y0 < safeTop || y0 + h > H - safeBot) continue
      let hit = false
      for (const p of placed) { if (x0 < p[2] + 3 && x0 + w > p[0] - 3 && y0 < p[3] + 1 && y0 + h > p[1] - 1) { hit = true; break } }
      if (hit) continue
      placed.push([x0, y0, x0 + w, y0 + h])
      ctx.font = l.font
      setLS(l.ls)
      ctx.globalAlpha = l.a
      ctx.lineWidth = 3.2
      ctx.strokeStyle = 'rgba(4,8,14,.82)'
      ctx.strokeText(l.text, x0, l.y)
      ctx.fillStyle = l.color
      ctx.fillText(l.text, x0, l.y)
    }
    ctx.globalAlpha = 1
    setLS(0)
  }
  function tag(text, sub, ax, ay, k, a) {
    const tx = ax + lerp(54, 0, k)
    const ty = Math.max(safeTop + 14, ay - lerp(54, 30, k))
    const tf = `800 12px ${UI_FONT}`
    const w = tw(tf, 2.2, text) + 22
    const h = 22
    ctx.globalAlpha = a * 0.8
    ctx.strokeStyle = 'rgba(255,107,44,.8)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(tx, ty + h / 2)
    ctx.stroke()
    ctx.globalAlpha = a
    ctx.fillStyle = 'rgba(8,13,22,.9)'
    ctx.strokeStyle = '#ff6b2c'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(tx - w / 2, ty - h / 2, w, h, 5); else ctx.rect(tx - w / 2, ty - h / 2, w, h)
    ctx.fill()
    ctx.stroke()
    ctx.font = tf
    setLS(2.2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffedd5'
    ctx.fillText(text, tx - w / 2 + 11, ty + 1)
    setLS(0)
    if (sub) {
      ctx.globalAlpha = a * 0.85
      ctx.font = `600 9px ${UI_FONT}`
      setLS(1.2)
      ctx.fillStyle = '#ffb27a'
      ctx.textAlign = 'center'
      ctx.fillText(sub, tx, ty + h / 2 + 9)
      ctx.textAlign = 'left'
      setLS(0)
    }
    ctx.globalAlpha = 1
    return [tx - w / 2, ty - h / 2, tx + w / 2, ty + h / 2 + (sub ? 14 : 0)]
  }

  function radar(ll, tt, sr, rmax, alpha) {
    const lp = proj(ll)
    if (alpha < 0.02 || !onScreen(lp, sr + 20)) return
    const ang = tt * 1.6
    ctx.globalAlpha = alpha
    if (ctx.createConicGradient) {
      const cg = ctx.createConicGradient(ang, lp[0], lp[1])
      cg.addColorStop(0, 'rgba(255,107,44,0)')
      cg.addColorStop(0.78, 'rgba(255,107,44,0)')
      cg.addColorStop(1, 'rgba(255,107,44,.30)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(lp[0], lp[1], sr, 0, TAU)
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(255,107,44,.7)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(lp[0], lp[1])
    ctx.lineTo(lp[0] + Math.cos(ang) * sr, lp[1] + Math.sin(ang) * sr)
    ctx.stroke()
    for (let rk = 0; rk < 2; rk++) {
      const ph = (tt / 2.5 + rk * 0.5) % 1
      const rr = Math.max(0, 4 + (rmax - 4) * (1 - Math.pow(1 - ph, 2.2)))
      ctx.globalAlpha = alpha * (1 - ph) * 0.9
      ctx.lineWidth = 2 * (1 - ph) + 0.5
      ctx.strokeStyle = '#ff6b2c'
      ctx.beginPath()
      ctx.arc(lp[0], lp[1], rr, 0, TAU)
      ctx.stroke()
    }
    ctx.globalAlpha = alpha * 0.3
    ctx.strokeStyle = '#ff6b2c'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(lp[0], lp[1], sr, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const onScreen = (p, m) => p && p[0] > -m && p[0] < W + m && p[1] > -m && p[1] < H + m

  let lastElapsed = (T.wide + T.f1 + T.h1 / 2) * 1000

  function draw(elapsedMs) {
    if (!STAGE) return
    lastElapsed = elapsedMs
    const tt = Math.max(0, elapsedMs / 1000)
    const t = tt % TOTAL
    const cam = camera(t, tt)
    const zN = cam.zN
    const zE = cam.zE
    const s = cam.s
    CAM.cx = cam.cx
    CAM.cy = cam.cy
    CAM.s = s
    const hw = W / 2 / s
    const hh = H / 2 / s
    V.lon0 = (cam.cx - hw) / D2R - 0.1
    V.lon1 = (cam.cx + hw) / D2R + 0.1
    V.lat0 = unmerc(cam.cy - hh) - 0.1
    V.lat1 = unmerc(cam.cy + hh) + 0.1

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    ctx.globalAlpha = 1
    ctx.drawImage(seaCv, 0, 0, W, H)

    /* graticule */
    const steps = [10, 5, 1, 0.25]
    const pxDeg = s * D2R
    for (const st0 of steps) {
      const pxs = st0 * pxDeg
      const ga = 0.13 * smooth(22, 70, pxs) * (1 - smooth(320, 640, pxs))
      if (ga < 0.008) continue
      ctx.globalAlpha = ga
      ctx.strokeStyle = '#7fa6d6'
      ctx.lineWidth = 0.7
      ctx.beginPath()
      let n = 0
      for (let gx = Math.ceil(V.lon0 / st0) * st0; gx <= V.lon1 && n < 160; gx += st0, n++) {
        const xx = proj([gx, 0])[0]
        ctx.moveTo(xx, 0)
        ctx.lineTo(xx, H)
      }
      for (let gy = Math.ceil(V.lat0 / st0) * st0; gy <= V.lat1 && n < 320; gy += st0, n++) {
        const yy = proj([0, gy])[1]
        ctx.moveTo(0, yy)
        ctx.lineTo(W, yy)
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    const labels = []
    const placed = []
    const oa = 0.5 * (1 - smooth(0.35, 0.8, zN))
    if (oa > 0.01) {
      for (const o of OCEANS) {
        const op = proj([o[1], o[2]])
        if (onScreen(op, 0)) labels.push({ text: o[0], x: op[0], y: op[1], side: 'c', a: oa, prio: 5, size: 9, font: `italic 600 9px ${UI_FONT}`, ls: 3.4, color: '#4f7aa6' })
      }
    }

    /* Africa land: coarse + detailed outlines, drawn via one transform */
    const wHi = smooth(1.6, 2.6, cam.zoom)
    const wGl = smooth(3, 4, cam.zoom)
    world()
    ctx.lineJoin = 'round'
    const glow = (p, a) => { strokeP(p, 0.12 * a, '#3aa6c8', 4) }
    const fillEdge = (p, fa, sa) => {
      ctx.globalAlpha = fa
      ctx.fillStyle = LAND_GRAD || '#1d2f22'
      ctx.fill(p, 'evenodd')
      strokeP(p, sa, 'rgba(150,178,210,.32)', 0.7)
    }
    if (wGl < 1) glow(scene.landLo, 1 - wGl)
    if (wGl > 0) glow(scene.landHi, wGl)
    if (wHi < 1) fillEdge(scene.landLo, 1, 1 - wHi)
    if (wHi > 0) fillEdge(scene.landHi, wHi, wHi)

    fillP(scene.nigeria.p, 0.13 + 0.03 * Math.sin(tt * 1.6), '#ff6b2c')

    /* Nigeria states, Edo, rivers */
    const sz = smooth(0.55, 0.9, zN)
    const edz = smooth(0.1, 0.7, zE)
    const hint = smooth(0.88, 1, zN)
    if (sz > 0.01) {
      const dim = 1 - 0.5 * edz
      for (let k = 0; k < 3; k++) fillP(scene.stateBuckets[k], sz * dim * (0.012 + k * 0.025) * 3.2, '#ffb27a')
      strokeP(scene.allStates, sz * dim * 0.34, 'rgba(255,190,140,.9)', 0.6)
      fillP(scene.edo.p, sz * (0.1 + 0.2 * hint), '#ff9a52')
      strokeP(scene.edo.p, sz * 0.6, 'rgba(255,190,140,.9)', 1.1)
      ctx.lineCap = 'round'
      for (const rv of RIVERS) {
        strokeP(rv.p, sz * 0.16, '#3b8fb8', rv.w * 4.5 * (1 + zE))
        strokeP(rv.p, sz * 0.85, '#4aa3cf', rv.w * (1 + zE))
      }
      ctx.lineCap = 'butt'
    }

    /* Edo State LGAs */
    if (edz > 0.01) {
      for (let i = 0; i < 3; i++) fillP(scene.lgaBuckets[i], edz * (0.1 + i * 0.035), '#ffa766')
      strokeP(scene.allLgas, edz * 0.55, 'rgba(255,205,160,.95)', 0.9)
      strokeP(scene.edo.p, edz * (0.1 + 0.04 * Math.sin(tt * 2)), '#ff7a38', 18)
      strokeP(scene.edo.p, edz * 0.18, '#ff7a38', 8)
      strokeP(scene.edo.p, edz * 0.95, '#ffc9a0', 2)
    }

    const pulse = 0.5 + 0.5 * Math.sin(tt * 2)
    strokeP(scene.nigeria.p, 0.07 + 0.03 * pulse, '#ff6b2c', 16)
    strokeP(scene.nigeria.p, 0.14, '#ff6b2c', 7)
    strokeP(scene.nigeria.p, 0.95 * (1 - 0.6 * edz), '#ff6b2c', 1.7)
    ctx.globalAlpha = 1
    screen()

    radar(scene.cityByName.Lagos.ll, tt, lerp(30, 90, zN), lerp(20, 58, zN), 1 - smooth(0.1, 0.6, zE))
    radar(scene.cityByName['Benin City'].ll, tt, lerp(40, 120, zE), lerp(30, 80, zE), smooth(0.3, 0.9, zE))

    /* route networks */
    const dz = smooth(0.5, 0.88, zN) * (1 - 0.6 * edz)
    const cz = 1 - smooth(0.3, 0.75, zN)
    if (cz > 0.01) {
      for (const r of scene.CONT_ROUTES) {
        const rp = projectRoute(r)
        if (rp) drawRoute(r, rp, cz * 0.7, 0.9, tt)
      }
      for (const h of HUBS) {
        const hp = proj(h.ll)
        if (!onScreen(hp, 0)) continue
        ctx.globalAlpha = cz * 0.9
        ctx.fillStyle = '#64748b'
        ctx.strokeStyle = 'rgba(148,163,184,.55)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(hp[0], hp[1], 2.6, 0, TAU)
        ctx.fill()
        ctx.stroke()
        labels.push({ text: h.name.toUpperCase(), x: hp[0] + (h.side === 'r' ? 7 : -7), y: hp[1], side: h.side, a: cz * 0.8, prio: 60, size: 9, font: `600 9px ${UI_FONT}`, ls: 0.8, color: '#9fb2c8' })
      }
      ctx.globalAlpha = 1
    }
    if (dz > 0.01) {
      for (const r of scene.DOM_ROUTES) {
        const rp = projectRoute(r)
        if (rp) drawRoute(r, rp, dz * 0.85, 1.1, tt)
      }
    }
    if (edz > 0.01) {
      for (const r of scene.EDO_ROUTES) {
        const rp = projectRoute(r)
        if (rp) drawRoute(r, rp, edz * 0.9, 1.3, tt)
      }
    }

    /* cities */
    for (const ct of scene.cities) {
      const isL = ct.name === 'Lagos'
      const isB = ct.name === 'Benin City'
      let ca = isL ? 1 : smooth(0.5 + ct.i * 0.006, 0.72 + ct.i * 0.006, zN)
      if (isB) ca = Math.max(ca, 0.25 * (1 - zN) + 0.75 * smooth(0.45, 0.7, zN))
      if (ca < 0.02) continue
      const pp = proj(ct.ll)
      if (!onScreen(pp, 30)) continue
      let gs = (ct.tier === 1 ? 40 : ct.tier === 2 ? 26 : 18) * (isL ? 0.85 + 0.15 * Math.sin(tt * 3.2) : 1) * (0.55 + 0.45 * ca) * (1 + 0.7 * zE)
      if (isL && zN < 0.5) gs *= 0.6 + 0.8 * zN
      if (isB) gs *= 1 + 0.5 * edz * (0.8 + 0.2 * Math.sin(tt * 3.2))
      ctx.globalAlpha = ca
      ctx.drawImage(sprite(ct.color), pp[0] - gs / 2, pp[1] - gs / 2, gs, gs)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(pp[0], pp[1], (ct.tier === 1 ? 1.7 : ct.tier === 2 ? 1.3 : 1) * (1 + 0.8 * zE), 0, TAU)
      ctx.fill()
      ctx.globalAlpha = 1
      if (isL) labels.push({ text: 'LAGOS HQ', x: pp[0] - 10, y: pp[1] + 1, side: 'l', a: 0.2 + 0.8 * smooth(0.1, 0.45, zN), prio: 100, size: 11, font: `800 11px ${UI_FONT}`, ls: 0.6, color: '#ffffff' })
      else if (isB) labels.push({ text: 'BENIN CITY', x: pp[0] - 11, y: pp[1] + 1, side: 'l', a: smooth(0.45, 0.7, zN), prio: 110, size: lerp(10, 13, edz), font: `800 ${lerp(10, 13, edz).toFixed(1)}px ${UI_FONT}`, ls: 0.8, color: '#ffffff' })
      else if (ct.tier < 3 || zN > 0.97) labels.push({ text: ct.tier === 1 ? ct.name.toUpperCase() : ct.name, x: pp[0] + (ct.side === 'r' ? 8 : -8), y: pp[1], side: ct.side, a: ca, prio: ct.tier === 1 ? 95 : ct.tier === 2 ? 70 : 50, size: ct.tier === 1 ? 10 : 9.5, font: `${ct.tier === 1 ? '700 10px' : '600 9.5px'} ${UI_FONT}`, ls: ct.tier === 1 ? 0.8 : 0.2, color: ct.tier === 1 ? '#e2e8f0' : '#94a3b8' })
    }
    if (edz > 0.02) {
      for (const et of EDO_TOWNS) {
        const ep = proj(et.ll)
        if (!onScreen(ep, 20)) continue
        ctx.globalAlpha = edz
        ctx.drawImage(sprite('#e2e8f0'), ep[0] - 15, ep[1] - 15, 30, 30)
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(ep[0], ep[1], 2, 0, TAU)
        ctx.fill()
        ctx.globalAlpha = 1
        labels.push({ text: et.name, x: ep[0] + (et.side === 'r' ? 9 : -9), y: ep[1], side: et.side, a: edz, prio: 80, size: 10, font: `700 10.5px ${UI_FONT}`, ls: 0.3, color: '#e2e8f0' })
      }
    }

    /* country names */
    for (const c of scene.countries) {
      if (c.ng || (c.w < 2.5 && !c.nb)) continue
      const cpx = proj(c.c)
      if (!onScreen(cpx, 0)) continue
      const fa = c.nb ? 0.6 * smooth(0.2, 0.55, zN) * (1 - smooth(0.2, 0.6, zE)) : 0.55 * (1 - smooth(0.5, 0.9, zN))
      if (fa < 0.02) continue
      labels.push({ text: c.name.toUpperCase(), x: cpx[0], y: cpx[1], side: 'c', a: fa, prio: 30, size: 9, font: `600 9px ${UI_FONT}`, ls: 2.2, color: '#7d90a8' })
    }
    /* state + LGA names */
    const stz = smooth(0.92, 1, zN)
    if (stz > 0.02) {
      for (const sn of scene.states) {
        if (sn.edo && zE > 0.15) continue
        const spx = proj(sn.c)
        if (!onScreen(spx, 0)) continue
        labels.push({ text: sn.name, x: spx[0], y: spx[1], side: 'c', a: stz * (sn.edo ? 1 : 0.62 * (1 - 0.5 * edz)), prio: sn.edo ? 90 : 20, size: sn.edo ? 10 : 8.5, font: `${sn.edo ? '800 10px' : '500 8.5px'} ${UI_FONT}`, ls: sn.edo ? 1.6 : 0.2, color: sn.edo ? '#ffe1c2' : '#ffc9a3' })
      }
    }
    if (edz > 0.05) {
      for (const lg of scene.lgas) {
        const lc = proj(lg.c)
        if (!onScreen(lc, 0)) continue
        labels.push({ text: lg.name.toUpperCase(), x: lc[0], y: lc[1], side: 'c', a: edz * 0.8, prio: 25, size: 9, font: `600 9px ${UI_FONT}`, ls: 1.4, color: '#ffd9b8' })
      }
    }

    /* tags */
    const nta = 1 - smooth(0.02, 0.3, zE)
    if (nta > 0.02) {
      const an = proj([8.7, 13.95])
      if (onScreen(an, 200)) placed.push(tag('NIGERIA', smooth(0.85, 1, zN) > 0.02 ? '36 STATES + FCT' : '', an[0], an[1], smooth(0.15, 0.85, zN), nta))
    }
    const eta = smooth(0.1, 0.5, zE)
    if (eta > 0.02) {
      const ae = proj([5.85, 7.56])
      placed.push(tag('EDO STATE', '18 LGAs · BENIN CITY', ae[0], ae[1], 1, eta))
    }
    placeLabels(labels, placed)
  }

  // Land gradient is in world coordinates so it can be reused every frame.
  const gradA = merc(40)
  const gradB = merc(-36)
  const gradCanvas = document.createElement('canvas')
  gradCanvas.width = 8
  gradCanvas.height = 256
  const gradCtx = gradCanvas.getContext('2d')
  const grad = gradCtx.createLinearGradient(0, 0, 0, 256)
  for (const st of LAT_STOPS) grad.addColorStop(clamp((gradA - merc(st[0])) / (gradA - gradB)), st[1])
  gradCtx.fillStyle = grad
  gradCtx.fillRect(0, 0, 8, 256)
  const LAND_GRAD = ctx.createPattern(gradCanvas, 'repeat')
  if (LAND_GRAD && LAND_GRAD.setTransform) {
    // Map the vertical pattern across the Mercator world span once.
    const span = (gradA - gradB) * KS
    LAND_GRAD.setTransform(new DOMMatrix([1, 0, 0, span / 256, 0, -gradA * KS]))
  }

  const sprites = {}
  function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
  function rgba(hex, a) { const c = hexRGB(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})` }
  function sprite(hex) {
    if (sprites[hex]) return sprites[hex]
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    const s = hexRGB(hex).join(',')
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    gr.addColorStop(0, 'rgba(255,255,255,.95)')
    gr.addColorStop(0.14, `rgba(${s},.95)`)
    gr.addColorStop(0.4, `rgba(${s},.28)`)
    gr.addColorStop(1, `rgba(${s},0)`)
    g.fillStyle = gr
    g.fillRect(0, 0, 64, 64)
    sprites[hex] = c
    return c
  }

  resize(canvas.clientWidth, canvas.clientHeight, pixelDensity)

  return {
    drawFrame(elapsedMs) {
      draw(elapsedMs)
    },
    drawStatic() {
      draw((T.wide + T.f1 + T.h1 / 2) * 1000)
    },
    resize,
  }
}
