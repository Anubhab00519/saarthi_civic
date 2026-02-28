import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authcontext'
import Icon from '../components/shared/icon'

// Mandala (same as Landing, self-contained)
function Mandala({ size = 280, color = '#B5451B', opacity = 0.14, reverse = false, speed = 40 }) {
  const rings = [
    { r: 48,  petals: 8,  petalR: 8,  dash: '3 4'  },
    { r: 80,  petals: 12, petalR: 6,  dash: '2 5'  },
    { r: 112, petals: 16, petalR: 5,  dash: '1.5 6' },
    { r: 136, petals: 24, petalR: 3.5,dash: '1 7'  },
  ]
  return (
    <svg width={size} height={size} viewBox="-155 -155 310 310" fill="none"
      style={{ opacity, animation: `${reverse ? 'spinRev' : 'spin'} ${speed}s linear infinite`, pointerEvents: 'none' }}>
      <circle cx="0" cy="0" r="14" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="0" r="6"  stroke={color} strokeWidth="1"   fill="none" />
      <circle cx="0" cy="0" r="2.5" fill={color} opacity="0.6" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2
        return <line key={i} x1={Math.cos(a)*16} y1={Math.sin(a)*16} x2={Math.cos(a)*143} y2={Math.sin(a)*143}
          stroke={color} strokeWidth={i%4===0?0.8:0.4} strokeOpacity={i%4===0?0.8:0.35} />
      })}
      {rings.map((ring, ri) => (
        <g key={ri}>
          <circle cx="0" cy="0" r={ring.r} stroke={color} strokeWidth="0.8" strokeDasharray={ring.dash} fill="none" />
          {Array.from({ length: ring.petals }).map((_, i) => {
            const a = (i / ring.petals) * Math.PI * 2
            return <circle key={i} cx={Math.cos(a)*ring.r} cy={Math.sin(a)*ring.r} r={ring.petalR}
              stroke={color} strokeWidth="0.8" fill="none" />
          })}
        </g>
      ))}
      <circle cx="0" cy="0" r="148" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      {Array.from({ length: 40 }).map((_, i) => {
        const a = (i / 40) * Math.PI * 2
        return <circle key={i} cx={Math.cos(a)*148} cy={Math.sin(a)*148} r={i%4===0?2.2:1} fill={color} opacity={i%4===0?0.6:0.3} />
      })}
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const [role,     setRole]     = useState('citizen')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const isCitizen = role === 'citizen'

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setError('Please enter both email and password.'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--ivory)' }}>

      {/* ── Left panel — hidden on mobile via CSS ── */}
      <div className="login-left-panel" style={{
        width: '46%', flexShrink: 0,
        background: 'linear-gradient(150deg, #16100A 0%, #2D1810 30%, #0F1E3C 100%)',
        padding: '52px 56px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Mandala top-right */}
        <div style={{ position: 'absolute', top: -80, right: -80, pointerEvents: 'none' }}>
          <Mandala size={360} color="#C9952A" opacity={0.12} speed={48} />
        </div>
        {/* Mandala bottom-left */}
        <div style={{ position: 'absolute', bottom: -60, left: -60, pointerEvents: 'none' }}>
          <Mandala size={280} color="#2E6DB4" opacity={0.1} reverse={true} speed={36} />
        </div>

        {/* Tricolor stripe top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #B5451B, #C9952A, #FAF7F2, #C9952A, #0D6B3F)', opacity: 0.6 }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(201,149,42,0.2)', border: '1.5px solid rgba(201,149,42,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" stroke="#E8C76A" strokeWidth="1.2" />
                <circle cx="11" cy="11" r="2"  fill="#E8C76A" />
                {[0,45,90,135,180,225,270,315].map(deg => {
                  const a = deg * Math.PI / 180
                  return <line key={deg} x1={11+Math.cos(a)*2.5} y1={11+Math.sin(a)*2.5} x2={11+Math.cos(a)*9.5} y2={11+Math.sin(a)*9.5} stroke="#E8C76A" strokeWidth="0.9" />
                })}
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: 18, color: 'white', lineHeight: 1.1 }}>Saarthi Civic</div>
              <div style={{ fontFamily: 'Outfit', fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>Civic Infrastructure</div>
            </div>
          </Link>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem, 2.8vw, 3rem)', lineHeight: 1.14, color: 'white', marginBottom: 18, letterSpacing: '-0.02em', fontWeight: 700 }}>
            Government<br />That Responds.
          </h2>
          <p style={{ fontFamily: 'Outfit', color: 'rgba(255,255,255,0.5)', fontSize: 14.5, lineHeight: 1.82, maxWidth: 300 }}>
            Every complaint filed becomes structured data — routed instantly to the right department, tracked in real time, resolved with accountability.
          </p>
        </div>

        {/* Trust list */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: 'lock',      text: 'JWT secured · Role-based access'           },
            { icon: 'shield',    text: 'Department-isolated · No cross-visibility'  },
            { icon: 'checkCirc', text: 'Real-time tracking for every complaint'     },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(201,149,42,0.15)', border: '1px solid rgba(201,149,42,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={icon} size={13} stroke="#E8C76A" />
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,5vw,64px)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <div className="login-mobile-back" style={{ marginBottom: 28 }}>
            <Link to="/" style={{ fontFamily: 'Outfit', fontSize: 13, color: 'var(--ink-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="arrowL" size={14} stroke="var(--ink-muted)" />
              Back to home
            </Link>
          </div>

          <div className="slide-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 'clamp(28px,4vw,44px)', boxShadow: '0 8px 48px rgba(0,0,0,0.08)' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <span className="overline">Secure Login</span>
              <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2.1rem', color: 'var(--ink)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>
                {isCitizen ? 'Citizen Portal' : 'Department Portal'}
              </h1>
              <p style={{ fontFamily: 'Outfit', color: 'var(--ink-muted)', fontSize: 14 }}>
                {isCitizen ? 'Log in to file and track your complaints.' : 'Access your department management dashboard.'}
              </p>
            </div>

            {/* Role toggle */}
            <div className="role-toggle" style={{ marginBottom: 24 }}>
              <button className={`role-btn ${isCitizen ? 'active' : 'inactive'}`} onClick={() => { setRole('citizen'); setError('') }}>Citizen</button>
              <button className={`role-btn ${!isCitizen ? 'active' : 'inactive'}`} onClick={() => { setRole('department'); setError('') }}>Department Official</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: 'var(--ink-warm)', marginBottom: 6, letterSpacing: '0.02em' }}>Email Address</label>
                <input className="input-field" type="email" autoComplete="email"
                  placeholder={isCitizen ? 'you@example.com' : 'official@dept.gov.in'}
                  value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: 'var(--ink-warm)', marginBottom: 6, letterSpacing: '0.02em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-field" type={showPass ? 'text' : 'password'}
                    autoComplete="current-password" placeholder="Enter your password"
                    value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                    style={{ paddingRight: 46 }} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-faint)', display: 'flex' }}>
                    <Icon name={showPass ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <Icon name="alert" size={14} stroke="#DC2626" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 2, borderRadius: 12 }}>
                {loading ? 'Signing in…' : `Sign in as ${isCitizen ? 'Citizen' : 'Official'}`}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <Icon name="lock" size={12} stroke="var(--ink-faint)" />
              <span style={{ fontFamily: 'Outfit', fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.04em' }}>Secured · Role-based access control</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/" style={{ fontFamily: 'Outfit', fontSize: 12.5, color: 'var(--ink-faint)', textDecoration: 'none', transition: 'color 0.18s' }}
              onMouseEnter={e => e.target.style.color = 'var(--ink-muted)'}
              onMouseLeave={e => e.target.style.color = 'var(--ink-faint)'}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}