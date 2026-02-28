import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/shared/icon'

/* ═══════════════════════════════════════════════════════════════════════════
   SVG DESIGN COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

// ── Mandala — pure SVG, detailed geometric art ──────────────────────────────
function Mandala({ size = 320, color = '#B5451B', opacity = 0.15, spinning = true, speed = 40, reverse = false, style = {} }) {
  const rings = [
    { r: 48,  petals: 8,  petalR: 8,  dash: '3 4',  rotate: 0   },
    { r: 80,  petals: 12, petalR: 6,  dash: '2 5',  rotate: 15  },
    { r: 112, petals: 16, petalR: 5,  dash: '1.5 6', rotate: 0  },
    { r: 140, petals: 24, petalR: 3.5,dash: '1 7',  rotate: 7.5 },
  ]
  const spokes = 24
  const animStyle = spinning ? {
    animation: `${reverse ? 'spinRev' : 'spin'} ${speed}s linear infinite`
  } : {}

  return (
    <svg width={size} height={size} viewBox="-160 -160 320 320" fill="none"
      style={{ opacity, ...animStyle, ...style, pointerEvents: 'none' }}>

      {/* Centre circle */}
      <circle cx="0" cy="0" r="16" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="0" r="8"  stroke={color} strokeWidth="1"   fill="none" />
      <circle cx="0" cy="0" r="3"  fill={color} opacity="0.6" />

      {/* Spokes */}
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2
        const x1 = Math.cos(a) * 18, y1 = Math.sin(a) * 18
        const x2 = Math.cos(a) * 147, y2 = Math.sin(a) * 147
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth={i % 4 === 0 ? 0.8 : 0.4} strokeOpacity={i % 4 === 0 ? 0.8 : 0.4} />
      })}

      {/* Petal rings */}
      {rings.map((ring, ri) => (
        <g key={ri} transform={`rotate(${ring.rotate})`}>
          {/* Ring circle */}
          <circle cx="0" cy="0" r={ring.r} stroke={color} strokeWidth="0.8" strokeDasharray={ring.dash} fill="none" />
          {/* Petal dots */}
          {Array.from({ length: ring.petals }).map((_, i) => {
            const a = (i / ring.petals) * Math.PI * 2
            const cx = Math.cos(a) * ring.r, cy = Math.sin(a) * ring.r
            return <circle key={i} cx={cx} cy={cy} r={ring.petalR}
              stroke={color} strokeWidth="0.8" fill="none" />
          })}
          {/* Diamond accents on major petals */}
          {Array.from({ length: ring.petals / 2 }).map((_, i) => {
            const a = (i / (ring.petals / 2)) * Math.PI * 2
            const cx = Math.cos(a) * ring.r, cy = Math.sin(a) * ring.r
            const s = ring.petalR * 0.5
            return (
              <polygon key={i}
                points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
                fill={color} opacity="0.35" />
            )
          })}
        </g>
      ))}

      {/* Outer decorative ring */}
      <circle cx="0" cy="0" r="154" stroke={color} strokeWidth="0.5" strokeDasharray="2 8" fill="none" />
      <circle cx="0" cy="0" r="158" stroke={color} strokeWidth="1"   fill="none" opacity="0.4" />

      {/* Outer petal dots */}
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2
        return <circle key={i} cx={Math.cos(a) * 154} cy={Math.sin(a) * 154}
          r={i % 4 === 0 ? 2.5 : 1.2} fill={color} opacity={i % 4 === 0 ? 0.7 : 0.35} />
      })}

      {/* Inner cross ornaments */}
      {[30, 75, 105].map((r, ri) => (
        <g key={ri}>
          {[0, 90, 180, 270].map((deg, di) => {
            const a = (deg * Math.PI) / 180
            const cx = Math.cos(a) * r, cy = Math.sin(a) * r
            return <circle key={di} cx={cx} cy={cy} r={1.5} fill={color} opacity="0.5" />
          })}
        </g>
      ))}
    </svg>
  )
}


// ── Paisley (Boteh) — traditional Indian teardrop motif ───────────────────
// Used in HowItWorks section
function Paisley({ size = 200, color = '#B5451B', opacity = 0.12, style = {} }) {
  // Single paisley boteh: teardrop body with inner spiral and petal details
  const petals = 7
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none"
      style={{ opacity, pointerEvents: 'none', ...style }}>
      {/* Outer teardrop body */}
      <path d="M100 185 C60 185 30 155 30 110 C30 70 55 45 80 30 C90 24 100 20 100 20 C100 20 110 24 120 30 C145 45 170 70 170 110 C170 155 140 185 100 185 Z"
        stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.08"/>
      {/* Inner teardrop spiral */}
      <path d="M100 165 C72 165 50 143 50 112 C50 84 68 64 88 52 C93 49 100 46 100 46 C100 46 107 49 112 52 C132 64 150 84 150 112 C150 143 128 165 100 165 Z"
        stroke={color} strokeWidth="1.2" fill="none" strokeOpacity="0.7"/>
      {/* Inner spiral curl */}
      <path d="M100 145 C82 145 68 131 68 112 C68 96 80 82 95 76 C97 75 100 74 100 74 C100 74 103 75 105 76 C120 82 132 96 132 112 C132 131 118 145 100 145 Z"
        stroke={color} strokeWidth="1" fill="none" strokeOpacity="0.55"/>
      {/* Tight inner curl */}
      <path d="M100 128 C90 128 82 120 82 110 C82 101 88 94 96 92 C100 91 100 91 104 92 C112 94 118 101 118 110 C118 120 110 128 100 128 Z"
        stroke={color} strokeWidth="0.9" fill="none" strokeOpacity="0.45"/>
      {/* Centre dot */}
      <circle cx="100" cy="110" r="5" fill={color} fillOpacity="0.5"/>
      <circle cx="100" cy="110" r="2" fill={color} fillOpacity="0.8"/>

      {/* Petal fronds radiating from the tip */}
      {Array.from({length: petals}).map((_, i) => {
        const spread = 0.55
        const a = -Math.PI/2 + (i - (petals-1)/2) * spread / (petals-1)
        const r1 = 26, r2 = 42
        const x1 = 100 + Math.cos(a)*r1, y1 = 20 + Math.sin(a)*r1
        const x2 = 100 + Math.cos(a)*r2, y2 = 20 + Math.sin(a)*r2
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth={i === Math.floor(petals/2) ? 1.4 : 0.9}
          strokeOpacity={0.5} strokeLinecap="round"/>
      })}
      {/* Teardrop tip circle */}
      <circle cx="100" cy="20" r="7" stroke={color} strokeWidth="1.2" fill="none" strokeOpacity="0.6"/>
      <circle cx="100" cy="20" r="3" fill={color} fillOpacity="0.5"/>

      {/* Side leaf details */}
      {[[-1,1],[1,1]].map(([sx,sy], i) => (
        <g key={i}>
          <path d={`M${100 + sx*30} 90 C${100 + sx*50} 80 ${100 + sx*55} 100 ${100 + sx*35} 108 C${100 + sx*20} 112 ${100 + sx*15} 100 ${100 + sx*30} 90 Z`}
            stroke={color} strokeWidth="0.9" fill={color} fillOpacity="0.06" strokeOpacity="0.5"/>
          <path d={`M${100 + sx*30} 90 C${100 + sx*42} 92 ${100 + sx*44} 102 ${100 + sx*35} 108`}
            stroke={color} strokeWidth="0.6" fill="none" strokeOpacity="0.35"/>
        </g>
      ))}
    </svg>
  )
}

// ── Kolam dot-grid — South Indian rangoli floor art ───────────────────────
// Used in AISection background. Grid of dots connected by looping lines.
function KolamPattern({ size = 260, color = '#0F2D5E', opacity = 0.1, style = {} }) {
  const cols = 7, rows = 7
  const spacing = 34
  const ox = (260 - (cols-1)*spacing) / 2
  const oy = (260 - (rows-1)*spacing) / 2
  const dots = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      dots.push({ x: ox + c*spacing, y: oy + r*spacing })

  // Looping curves connecting dots — traditional kolam curves
  const loops = [
    // Outer diamond loop
    `M${ox+spacing*3} ${oy} C${ox+spacing*5} ${oy} ${ox+spacing*6} ${oy+spacing*2} ${ox+spacing*6} ${oy+spacing*3}
     C${ox+spacing*6} ${oy+spacing*4} ${ox+spacing*5} ${oy+spacing*6} ${ox+spacing*3} ${oy+spacing*6}
     C${ox+spacing} ${oy+spacing*6} ${ox} ${oy+spacing*4} ${ox} ${oy+spacing*3}
     C${ox} ${oy+spacing*2} ${ox+spacing} ${oy} ${ox+spacing*3} ${oy} Z`,
    // Inner loop
    `M${ox+spacing*3} ${oy+spacing} C${ox+spacing*4.5} ${oy+spacing} ${ox+spacing*5} ${oy+spacing*2} ${ox+spacing*5} ${oy+spacing*3}
     C${ox+spacing*5} ${oy+spacing*4} ${ox+spacing*4.5} ${oy+spacing*5} ${ox+spacing*3} ${oy+spacing*5}
     C${ox+spacing*1.5} ${oy+spacing*5} ${ox+spacing} ${oy+spacing*4} ${ox+spacing} ${oy+spacing*3}
     C${ox+spacing} ${oy+spacing*2} ${ox+spacing*1.5} ${oy+spacing} ${ox+spacing*3} ${oy+spacing} Z`,
    // Cross arms
    `M${ox} ${oy+spacing*3} C${ox+spacing} ${oy+spacing*1.5} ${ox+spacing*1.5} ${oy+spacing} ${ox+spacing*3} ${oy}`,
    `M${ox+spacing*6} ${oy+spacing*3} C${ox+spacing*5} ${oy+spacing*1.5} ${ox+spacing*4.5} ${oy+spacing} ${ox+spacing*3} ${oy}`,
    `M${ox} ${oy+spacing*3} C${ox+spacing} ${oy+spacing*4.5} ${ox+spacing*1.5} ${oy+spacing*5} ${ox+spacing*3} ${oy+spacing*6}`,
    `M${ox+spacing*6} ${oy+spacing*3} C${ox+spacing*5} ${oy+spacing*4.5} ${ox+spacing*4.5} ${oy+spacing*5} ${ox+spacing*3} ${oy+spacing*6}`,
  ]

  return (
    <svg width={size} height={size} viewBox="0 0 260 260" fill="none"
      style={{ opacity, pointerEvents: 'none', ...style }}>
      {/* Dot grid */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2.5}
          fill={color} fillOpacity="0.7"/>
      ))}
      {/* Kolam loops */}
      {loops.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth="1.4"
          fill="none" strokeOpacity="0.6" strokeLinecap="round"/>
      ))}
      {/* Accent dots at cardinal positions */}
      {[
        [ox+spacing*3, oy], [ox+spacing*3, oy+spacing*6],
        [ox, oy+spacing*3], [ox+spacing*6, oy+spacing*3],
      ].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill={color} fillOpacity="0.5"/>
      ))}
      {/* Centre lotus accent */}
      {Array.from({length:8}).map((_, i) => {
        const a = (i/8)*Math.PI*2
        const r = 14
        return <ellipse key={i}
          cx={ox+spacing*3 + Math.cos(a)*r} cy={oy+spacing*3 + Math.sin(a)*r}
          rx="7" ry="4" fill="none" stroke={color} strokeWidth="0.9" strokeOpacity="0.55"
          transform={`rotate(${i*45}, ${ox+spacing*3 + Math.cos(a)*r}, ${oy+spacing*3 + Math.sin(a)*r})`}/>
      })}
      <circle cx={ox+spacing*3} cy={oy+spacing*3} r="7" fill={color} fillOpacity="0.3"/>
    </svg>
  )
}

// ── Lotus — single stylised bloom, used in CTA and Footer ────────────────
// 8-petal lotus with layered petals and stamens
function Lotus({ size = 180, color = '#B5451B', opacity = 0.12, style = {} }) {
  const petals = 8
  const innerR = 22, outerR = 72

  return (
    <svg width={size} height={size} viewBox="0 0 180 180" fill="none"
      style={{ opacity, pointerEvents: 'none', ...style }}>
      {/* Outer petals */}
      {Array.from({length: petals}).map((_, i) => {
        const a = (i / petals) * Math.PI * 2
        const midA = a
        const tipX = 90 + Math.cos(midA) * outerR
        const tipY = 90 + Math.sin(midA) * outerR
        const lA = a - 0.38, rA = a + 0.38
        const lx = 90 + Math.cos(lA) * innerR, ly = 90 + Math.sin(lA) * innerR
        const rx = 90 + Math.cos(rA) * innerR, ry = 90 + Math.sin(rA) * innerR
        const c1x = 90 + Math.cos(lA - 0.1) * (innerR + 38)
        const c1y = 90 + Math.sin(lA - 0.1) * (innerR + 38)
        const c2x = 90 + Math.cos(rA + 0.1) * (innerR + 38)
        const c2y = 90 + Math.sin(rA + 0.1) * (innerR + 38)
        return (
          <g key={i}>
            <path d={`M${lx} ${ly} C${c1x} ${c1y} ${tipX} ${tipY} ${tipX} ${tipY} C${tipX} ${tipY} ${c2x} ${c2y} ${rx} ${ry} Z`}
              stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.07" strokeOpacity="0.65"/>
            {/* Petal vein */}
            <path d={`M${90 + Math.cos(midA)*innerR} ${90 + Math.sin(midA)*innerR} L${tipX} ${tipY}`}
              stroke={color} strokeWidth="0.7" strokeOpacity="0.4"/>
          </g>
        )
      })}
      {/* Inner petals — smaller, rotated 22.5° */}
      {Array.from({length: petals}).map((_, i) => {
        const a = (i / petals) * Math.PI * 2 + Math.PI / petals
        const tipX = 90 + Math.cos(a) * (outerR * 0.6)
        const tipY = 90 + Math.sin(a) * (outerR * 0.6)
        const lA = a - 0.28, rA = a + 0.28
        const lx = 90 + Math.cos(lA) * innerR, ly = 90 + Math.sin(lA) * innerR
        const rx = 90 + Math.cos(rA) * innerR, ry = 90 + Math.sin(rA) * innerR
        const c1x = 90 + Math.cos(lA - 0.08) * (innerR + 22)
        const c1y = 90 + Math.sin(lA - 0.08) * (innerR + 22)
        const c2x = 90 + Math.cos(rA + 0.08) * (innerR + 22)
        const c2y = 90 + Math.sin(rA + 0.08) * (innerR + 22)
        return (
          <path key={i}
            d={`M${lx} ${ly} C${c1x} ${c1y} ${tipX} ${tipY} ${tipX} ${tipY} C${tipX} ${tipY} ${c2x} ${c2y} ${rx} ${ry} Z`}
            stroke={color} strokeWidth="1.1" fill={color} fillOpacity="0.05" strokeOpacity="0.5"/>
        )
      })}
      {/* Stamen ring */}
      {Array.from({length: 16}).map((_, i) => {
        const a = (i/16)*Math.PI*2
        const x = 90 + Math.cos(a)*innerR, y = 90 + Math.sin(a)*innerR
        return <circle key={i} cx={x} cy={y} r="2.2" fill={color} fillOpacity="0.5"/>
      })}
      {/* Pericarp */}
      <circle cx="90" cy="90" r={innerR * 0.7} stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.08" strokeOpacity="0.5"/>
      <circle cx="90" cy="90" r="8" fill={color} fillOpacity="0.4"/>
      <circle cx="90" cy="90" r="3.5" fill={color} fillOpacity="0.7"/>
    </svg>
  )
}

// ── Stepped geometric border — temple gopuram / rangoli inspired ──────────
// Used as a horizontal decorative divider
function GeometricBorder({ width = 400, color = '#C9952A', opacity = 0.18 }) {
  const unit = 16
  const cols = Math.floor(width / unit)
  const h = unit * 3

  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} fill="none"
      style={{ opacity, pointerEvents: 'none', display: 'block' }}>
      {Array.from({length: cols}).map((_, i) => {
        const x = i * unit
        const isEven = i % 2 === 0
        return (
          <g key={i}>
            {/* Stepped pyramid motif repeating */}
            <rect x={x+1} y={0} width={unit-2} height={4} fill={color} fillOpacity={isEven ? 0.8 : 0.4}/>
            <rect x={x+3} y={4} width={unit-6} height={4} fill={color} fillOpacity={isEven ? 0.7 : 0.3}/>
            <rect x={x+5} y={8} width={unit-10} height={4} fill={color} fillOpacity={isEven ? 0.9 : 0.5}/>
            {/* Diamond between pyramids */}
            {isEven && <polygon
              points={`${x+unit/2},${h-1} ${x+unit-1},${h/2} ${x+unit/2},${1} ${x+1},${h/2}`}
              stroke={color} strokeWidth="0.6" fill="none" strokeOpacity="0.3"/>}
          </g>
        )
      })}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════════════════ */
function Navbar({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  const navLinks = [
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'For Citizens',  id: 'roles'        },
    { label: 'For Officials', id: 'roles'         },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? 'rgba(250,247,242,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(181,69,27,0.12)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {/* Tricolor stripe */}
      <div style={{ height: 2.5, background: 'linear-gradient(90deg, #B5451B 0%, #C9952A 33%, #FAF7F2 50%, #C9952A 67%, #0D6B3F 100%)', opacity: 0.7 }} />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>

        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #B5451B 0%, #C9952A 60%, #E8C76A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 14px rgba(181,69,27,0.3)',
            flexShrink: 0,
          }}>
            {/* Chariot wheel icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.2" />
              <circle cx="11" cy="11" r="6"  stroke="white" strokeWidth="0.8" strokeDasharray="2 2" />
              <circle cx="11" cy="11" r="2"  fill="white" />
              {[0,45,90,135,180,225,270,315].map(deg => {
                const a = deg * Math.PI / 180
                return <line key={deg} x1={11 + Math.cos(a)*2.5} y1={11 + Math.sin(a)*2.5} x2={11 + Math.cos(a)*9.5} y2={11 + Math.sin(a)*9.5} stroke="white" strokeWidth="0.9" />
              })}
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1 }}>Saarthi Civic</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 9, color: 'var(--ink-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, marginTop: 1 }}>Civic Infrastructure · India</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div style={{ display: 'none', gap: 36, alignItems: 'center' }} className="md:flex">
          {navLinks.map(l => (
            <button key={l.label}
              onClick={() => scrollTo(l.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 14, fontWeight: 500, color: 'var(--ink-warm)', transition: 'color 0.18s', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--saffron-deep)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-warm)'}
            >{l.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost hidden md:inline-flex" onClick={onLoginClick} style={{ padding: '9px 22px', fontSize: 13 }}>Sign In</button>
          <button className="btn-primary" onClick={onLoginClick} style={{ padding: '10px 22px', fontSize: 13 }}>File a Complaint</button>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--ink-warm)', padding: '6px 9px', display: 'flex', alignItems: 'center' }}>
            <Icon name={menuOpen ? 'x' : 'menu'} size={18} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'var(--ivory)', borderTop: '1px solid var(--border)', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {navLinks.map(l => (
            <button key={l.label} onClick={() => scrollTo(l.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 15, color: 'var(--ink-warm)', fontWeight: 500, textAlign: 'left', padding: 0 }}>
              {l.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setMenuOpen(false); onLoginClick() }}>Sign In</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setMenuOpen(false); onLoginClick() }}>Get Started</button>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════════════════ */
function Hero({ onLoginClick }) {
  return (
    <section style={{
      minHeight: '100vh',
      background: 'var(--grad-hero)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '140px 24px 80px',
      textAlign: 'center',
    }}>

      {/* Mandala — top right, slow spin */}
      <div style={{ position: 'absolute', top: -100, right: -100, pointerEvents: 'none' }}>
        <Mandala size={520} color="#B5451B" opacity={0.16} spinning={true} speed={50} />
      </div>

      {/* Mandala — bottom left, reverse spin */}
      <div style={{ position: 'absolute', bottom: -120, left: -120, pointerEvents: 'none' }}>
        <Mandala size={440} color="#0F2D5E" opacity={0.13} spinning={true} speed={38} reverse={true} />
      </div>

      {/* Small mandala — top left accent */}
      <div style={{ position: 'absolute', top: 120, left: 60, pointerEvents: 'none' }}>
        <Mandala size={160} color="#C9952A" opacity={0.2} spinning={true} speed={28} />
      </div>

      {/* Warm glow blobs */}
      <div style={{ position: 'absolute', top: '5%', right: '10%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,144,60,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,45,94,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(255,255,255,0.88) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>

        <div className="fade-up" style={{ marginBottom: 22 }}>
          <span className="pill">
            <span className="live-dot" />
            AI-Powered Civic Infrastructure · India
          </span>
        </div>

        {/* Saarthi — the charioteer metaphor */}
        <div className="fade-up-2" style={{ marginBottom: 10 }}>
          <span style={{ fontFamily: 'Outfit', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--saffron-mid)', fontWeight: 600 }}>
            सारथी — The Charioteer
          </span>
        </div>

        <h1 className="fade-up-2" style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 'clamp(3rem, 7.5vw, 6rem)',
          fontWeight: 700,
          lineHeight: 1.06,
          color: 'var(--ink)',
          letterSpacing: '-0.025em',
          marginBottom: 26,
        }}>
          Every Complaint.<br />The Right Department.<br />
          <span style={{ background: 'linear-gradient(135deg, #B5451B 0%, #C9952A 50%, #0F2D5E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Resolved.
          </span>
        </h1>

        <p className="fade-up-3" style={{
          fontFamily: 'Outfit', fontWeight: 400,
          color: 'var(--ink-muted)', fontSize: 'clamp(15px, 2vw, 18px)',
          lineHeight: 1.8, maxWidth: 560, margin: '0 auto 48px',
        }}>
          Like a charioteer who knows exactly which path to take, Saarthi routes your civic complaints to the right government authority — instantly, accurately, with full accountability.
        </p>

        <div className="fade-up-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 72 }}>
          <button className="btn-primary" onClick={onLoginClick} style={{ fontSize: 16, padding: '15px 38px' }}>
            File a Complaint
            <Icon name="arrowR" size={17} stroke="white" />
          </button>
          <button className="btn-ghost" onClick={onLoginClick} style={{ fontSize: 16, padding: '14px 34px' }}>
            Official Login
          </button>
        </div>

        {/* Stats bar */}
        <div className="fade-up-4" style={{
          display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: '0 6px 32px rgba(0,0,0,0.08)',
        }}>
          {[
            { num: '3',    sub: 'Access Roles'  },
            { num: 'AI',   sub: 'Smart Routing'  },
            { num: '100%', sub: 'Tracked Live'   },
          ].map(({ num, sub }, i) => (
            <div key={num} style={{
              padding: '18px clamp(20px, 4vw, 48px)',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, background: 'var(--grad-tricolor)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, marginTop: 5 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, background: 'linear-gradient(to top, var(--ivory), transparent)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Scroll cue */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.3, zIndex: 3 }}>
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, var(--saffron-mid), transparent)' }} />
        <span style={{ fontFamily: 'Outfit', fontSize: 9, color: 'var(--ink-faint)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Scroll</span>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRUST MARQUEE
═══════════════════════════════════════════════════════════════════════════ */
function TrustBanner() {
  const depts = ['Municipal Corporation', 'Public Works Dept.', 'Water Authority', 'Electricity Board', 'Health Dept.', 'Education Dept.', 'Transport Authority', 'Revenue Office', 'Forest Department', 'Urban Development']
  return (
    <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 0', overflow: 'hidden' }}>
      <div style={{ fontFamily: 'Outfit', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-faint)', textAlign: 'center', marginBottom: 12, fontWeight: 600 }}>
        Departments Connected
      </div>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div className="marquee" style={{ display: 'flex', gap: 52, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {[...depts, ...depts].map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-warm)', fontWeight: 500, fontSize: 14, fontFamily: 'Outfit' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polygon points="7,1 8.8,5.2 13,5.4 9.8,8.2 10.9,12.5 7,10 3.1,12.5 4.2,8.2 1,5.4 5.2,5.2" fill="#C9952A" opacity="0.7" />
              </svg>
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { n: '01', icon: 'mapPin',    title: 'Citizen Files a Report',   desc: 'Submit from any device with description, photo evidence, and live GPS location.',    grad: 'linear-gradient(135deg, #B5451B, #C9952A)' },
    { n: '02', icon: 'cpu',       title: 'AI Classifies & Routes',    desc: 'NLP model reads the complaint, identifies the correct department, assigns severity.', grad: 'linear-gradient(135deg, #0F2D5E, #2E6DB4)' },
    { n: '03', icon: 'building',  title: 'Department Is Notified',    desc: 'The right officials receive an instant alert with full context and location map.',     grad: 'linear-gradient(135deg, #0D6B3F, #1A8C55)' },
    { n: '04', icon: 'checkCirc', title: 'Tracked to Resolution',     desc: 'Live status updates flow back: Pending → In Progress → Resolved → Closed.',          grad: 'linear-gradient(135deg, #B5451B, #0F2D5E)' },
  ]

  return (
    <section id="how-it-works" style={{ padding: 'clamp(80px,10vw,128px) 24px', background: 'var(--ivory)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="overline">The Process</span>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            From Complaint to Resolution
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
          {steps.map((s, i) => (
            <div key={i} className="card" style={{ padding: '32px 26px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, opacity: 0.88 }}>
                <Icon name={s.icon} size={20} stroke="white" />
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 600, fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 10, lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: 13.5, color: 'var(--ink-muted)', lineHeight: 1.72 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE CARDS
═══════════════════════════════════════════════════════════════════════════ */
function RoleCards({ onLoginClick }) {
  const roles = [
    {
      num: '01',
      label: 'Citizen',
      title: 'File. Track. Hold Accountable.',
      desc: 'Submit a geo-tagged complaint in minutes. Watch it move through the system — live status, full transparency.',
      perks: ['Submit from any device', 'GPS + photo evidence', 'Pending → Resolved tracking', 'Private complaint history'],
      accent: '#B5451B',
      accentLight: 'rgba(181,69,27,0.08)',
      cta: 'Report an Issue',
      icon: 'mapPin',
    },
    {
      num: '02',
      label: 'Department Official',
      title: 'Manage. Prioritise. Respond.',
      desc: "Your isolated queue, severity-sorted and location-mapped. Only your department's complaints, ready to act on.",
      perks: ['Dept-isolated dashboard', 'Severity: Low → Critical', 'Location heatmap', 'Status push to citizens'],
      accent: '#0F2D5E',
      accentLight: 'rgba(15,45,94,0.08)',
      cta: 'Department Login',
      icon: 'building',
    },
    {
      num: '03',
      label: 'Administrator',
      title: 'Oversee. Configure. Audit.',
      desc: 'Full system-wide visibility across all departments. Configure routing, monitor AI accuracy, close performance gaps.',
      perks: ['System-wide visibility', 'Configure departments', 'AI routing audit log', 'Live analytics'],
      accent: '#0D6B3F',
      accentLight: 'rgba(13,107,63,0.08)',
      cta: null,
      icon: 'shield',
    },
  ]

  return (
    <section id="roles" style={{ padding: 'clamp(80px,10vw,128px) 24px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Mandala watermarks — more visible */}
      <div style={{ position: 'absolute', left: -80, bottom: -80, pointerEvents: 'none' }}>
        <Mandala size={400} color="#B5451B" opacity={0.1} spinning={true} speed={55} reverse />
      </div>
      <div style={{ position: 'absolute', right: -60, top: 20, pointerEvents: 'none' }}>
        <Mandala size={280} color="#0F2D5E" opacity={0.1} spinning={true} speed={44} />
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="overline">Access Roles</span>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Built for Citizens and Government
          </h2>
        </div>

        {/* 3-column cards — no tabs, all visible */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {roles.map((r, i) => (
            <div key={i} style={{
              background: 'var(--ivory)',
              border: `1px solid var(--border)`,
              borderRadius: 20,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.24s, box-shadow 0.24s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 56px rgba(0,0,0,0.1)` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Card top — parchment band with mandala + number */}
              <div style={{
                background: r.accentLight,
                borderBottom: `1px solid ${r.accent}22`,
                padding: '32px 28px 24px',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                {/* Mandala watermark in card top */}
                <div style={{ position: 'absolute', right: -30, bottom: -30, pointerEvents: 'none' }}>
                  <Mandala size={160} color={r.accent} opacity={0.2} spinning={true} speed={30 + i * 8} reverse={i % 2 === 0} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Number + icon row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'Outfit', fontSize: 11, color: r.accent, letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}>{r.num}</span>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: r.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.88 }}>
                      <Icon name={r.icon} size={17} stroke="white" />
                    </div>
                  </div>
                  {/* Role label */}
                  <div style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: r.accent, marginBottom: 6 }}>{r.label}</div>
                  <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{r.title}</h3>
                </div>
              </div>

              {/* Card body — content */}
              <div style={{ padding: '24px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontFamily: 'Outfit', fontSize: 13.5, color: 'var(--ink-muted)', lineHeight: 1.78, marginBottom: 22 }}>{r.desc}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'auto', paddingBottom: r.cta ? 24 : 0 }}>
                  {r.perks.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: r.accent, flexShrink: 0, opacity: 0.7 }} />
                      <span style={{ fontFamily: 'Outfit', fontSize: 13, color: 'var(--ink-warm)', lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>

                {r.cta && (
                  <button
                    onClick={onLoginClick}
                    style={{
                      marginTop: 24,
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 22px', borderRadius: 10,
                      background: 'transparent',
                      border: `1.5px solid ${r.accent}`,
                      color: r.accent,
                      fontFamily: 'Outfit', fontWeight: 600, fontSize: 13.5,
                      cursor: 'pointer',
                      transition: 'background 0.18s, color 0.18s',
                      width: 'fit-content',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = r.accent; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = r.accent }}
                  >
                    {r.cta}
                    <Icon name="arrowR" size={14} stroke="currentColor" />
                  </button>
                )}
              </div>

              {/* Bottom accent line — role color */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${r.accent}, transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI SECTION
═══════════════════════════════════════════════════════════════════════════ */
function AISection() {
  const features = [
    { icon: 'cpu',      title: 'NLP Classification',  desc: 'Text mapped to department using an India-context trained model.',             grad: 'linear-gradient(135deg,#B5451B,#C9952A)' },
    { icon: 'zap',      title: 'Severity Scoring',    desc: 'Low / Medium / High / Critical — auto-tagged for queue prioritisation.',     grad: 'linear-gradient(135deg,#0F2D5E,#2E6DB4)' },
    { icon: 'shield',   title: 'Confidence Review',   desc: 'Low-confidence predictions auto-escalate to human review — no case missed.', grad: 'linear-gradient(135deg,#0D6B3F,#1A8C55)' },
    { icon: 'chartBar', title: 'Live Analytics',      desc: 'Real-time dashboards with complaint heatmaps and dept. SLA tracking.',       grad: 'linear-gradient(135deg,#B5451B,#0F2D5E)' },
  ]

  return (
    <section style={{ padding: 'clamp(80px,10vw,128px) 24px', background: 'var(--ivory-2)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 64, alignItems: 'center' }}>

          <div>
            <span className="overline">Intelligence Layer</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: 18, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              AI Routes It.<br />Humans Resolve It.
            </h2>
            <p style={{ fontFamily: 'Outfit', color: 'var(--ink-muted)', lineHeight: 1.82, fontSize: 15, marginBottom: 32 }}>
              The classification model handles routing instantly. When uncertain, the complaint escalates to a human reviewer. No complaint falls through the cracks.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', background: 'rgba(13,107,63,0.08)', border: '1px solid rgba(13,107,63,0.18)', borderRadius: 10, width: 'fit-content' }}>
              <span className="live-dot" />
              <span style={{ fontFamily: 'Outfit', fontSize: 12, color: 'var(--india-green)', fontWeight: 600, letterSpacing: '0.06em' }}>AI routing · Active</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ padding: '22px 18px', background: 'var(--surface)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: f.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, opacity: 0.88 }}>
                  <Icon name={f.icon} size={17} stroke="white" />
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 600, fontSize: '1rem', color: 'var(--ink)', marginBottom: 6, lineHeight: 1.3 }}>{f.title}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   CTA BANNER
═══════════════════════════════════════════════════════════════════════════ */
function CTABanner({ onLoginClick }) {
  return (
    <section style={{ padding: 'clamp(64px,8vw,96px) 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #16100A 0%, #2D1A0A 40%, #0F1E3C 100%)',
          borderRadius: 28, padding: 'clamp(52px,6vw,88px) 48px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* Lotus — left corner */}
          <div style={{ position: 'absolute', left: -30, bottom: -30, pointerEvents: 'none' }}>
            <Lotus size={220} color="#E8C76A" opacity={0.14} />
          </div>
          {/* Lotus — right corner */}
          <div style={{ position: 'absolute', right: -30, top: -30, pointerEvents: 'none' }}>
            <Lotus size={180} color="#C9952A" opacity={0.12} />
          </div>
          {/* Geometric border — top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}>
            <GeometricBorder width={1240} color="#C9952A" opacity={0.22} />
          </div>
          {/* Left saffron glow */}
          <div style={{ position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,69,27,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Right blue glow */}
          <div style={{ position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,45,94,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Small lotus accent */}
            <div className="breathe" style={{ margin: '0 auto 20px', width: 'fit-content', opacity: 0.65 }}>
              <Lotus size={52} color="#C9952A" opacity={1} />
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 700, color: 'white', marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Your city works better<br />when government listens.
            </h2>
            <p style={{ fontFamily: 'Outfit', color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 44, maxWidth: 440, margin: '0 auto 44px', lineHeight: 1.75 }}>
              Start filing complaints that are tracked, routed, and actually resolved.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={onLoginClick} style={{ fontSize: 15, padding: '14px 42px' }}>
                Get Started Now
                <Icon name="arrowR" size={16} stroke="white" />
              </button>
              <button className="btn-ghost" onClick={onLoginClick} style={{ fontSize: 15, padding: '13px 32px', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                Official Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ background: 'var(--ivory)', borderTop: '1px solid var(--border)', padding: '56px 24px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -40, bottom: -40, pointerEvents: 'none' }}>
        <Lotus size={240} color="#B5451B" opacity={0.1} />
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 48, marginBottom: 48 }}>

          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #B5451B, #C9952A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.2" />
                  <circle cx="11" cy="11" r="2"  fill="white" />
                  {[0,45,90,135,180,225,270,315].map(deg => {
                    const a = deg * Math.PI / 180
                    return <line key={deg} x1={11+Math.cos(a)*2.5} y1={11+Math.sin(a)*2.5} x2={11+Math.cos(a)*9.5} y2={11+Math.sin(a)*9.5} stroke="white" strokeWidth="0.9" />
                  })}
                </svg>
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>Saarthi Civic</div>
            </div>
            <p style={{ fontFamily: 'Outfit', color: 'var(--ink-faint)', fontSize: 13, lineHeight: 1.78 }}>
              AI-assisted civic complaint management for India. Every complaint reaches the right office.
            </p>
            {/* Tricolor flag strip */}
            <div style={{ display: 'flex', height: 3, width: 72, borderRadius: 2, overflow: 'hidden', marginTop: 20 }}>
              <div style={{ flex: 1, background: '#B5451B' }} />
              <div style={{ flex: 1, background: 'var(--border)' }} />
              <div style={{ flex: 1, background: '#0D6B3F' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {[
              { title: 'Platform', links: ['How It Works', 'For Citizens', 'For Officials', 'AI Routing'] },
              { title: 'Legal',    links: ['Privacy Policy', 'Terms of Use', 'Data Governance'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: 'Outfit', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontFamily: 'Outfit', color: 'var(--ink-muted)', fontSize: 13.5, textDecoration: 'none', transition: 'color 0.18s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--saffron-mid)'}
                      onMouseLeave={e => e.target.style.color = 'var(--ink-muted)'}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Outfit', color: 'var(--ink-faint)', fontSize: 12, fontWeight: 400 }}>© 2025 Saarthi Civic. Civic Infrastructure for India.</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {['#B5451B', 'var(--border-2)', '#0D6B3F'].map((c, i) => (
              <div key={i} style={{ width: 20, height: 5, background: c, borderRadius: 3 }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate()
  const goToLogin = () => navigate('/login')

  return (
    <>
      <Navbar      onLoginClick={goToLogin} />
      <Hero        onLoginClick={goToLogin} />
      <TrustBanner />
      <HowItWorks />
      <RoleCards   onLoginClick={goToLogin} />
      <AISection />
      <CTABanner   onLoginClick={goToLogin} />
      <Footer />
    </>
  )
}