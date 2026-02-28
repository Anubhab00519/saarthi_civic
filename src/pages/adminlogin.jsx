import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authcontext'
import Icon from '../components/shared/icon'

function Mandala({ size = 280, color = '#B5451B', opacity = 0.1, reverse = false, speed = 40 }) {
  const rings = [
    { r: 48,  petals: 8,  petalR: 8,  dash: '3 4'  },
    { r: 80,  petals: 12, petalR: 6,  dash: '2 5'  },
    { r: 110, petals: 16, petalR: 5,  dash: '1.5 6' },
    { r: 134, petals: 24, petalR: 3.2,dash: '1 7'  },
  ]
  return (
    <svg width={size} height={size} viewBox="-150 -150 300 300" fill="none"
      style={{ opacity, animation: `${reverse ? 'spinRev' : 'spin'} ${speed}s linear infinite`, pointerEvents: 'none' }}>
      <circle cx="0" cy="0" r="14" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="0" r="6"  stroke={color} strokeWidth="1"   fill="none" />
      <circle cx="0" cy="0" r="2.5" fill={color} opacity="0.6" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2
        return <line key={i} x1={Math.cos(a)*16} y1={Math.sin(a)*16} x2={Math.cos(a)*140} y2={Math.sin(a)*140}
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
      <circle cx="0" cy="0" r="143" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2
        return <circle key={i} cx={Math.cos(a)*143} cy={Math.sin(a)*143} r={i%4===0?2:1} fill={color} opacity={i%4===0?0.6:0.3} />
      })}
    </svg>
  )
}

export default function AdminLogin() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) { setError('Please fill in both fields.'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Access denied. Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 40%, rgba(181,69,27,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(15,45,94,0.07) 0%, transparent 50%), var(--ivory)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>

      {/* Mandala top-right */}
      <div style={{ position: 'absolute', top: -80, right: -80, pointerEvents: 'none' }}>
        <Mandala size={380} color="#B5451B" opacity={0.08} speed={52} />
      </div>
      {/* Mandala bottom-left */}
      <div style={{ position: 'absolute', bottom: -70, left: -70, pointerEvents: 'none' }}>
        <Mandala size={300} color="#0F2D5E" opacity={0.07} reverse={true} speed={40} />
      </div>

      {/* Tricolor stripe top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: 'linear-gradient(90deg, #B5451B, #C9952A, #FAF7F2, #C9952A, #0D6B3F)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 58, height: 58, background: 'linear-gradient(135deg, #16100A, #2D1810)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }} />
            <Icon name="shield" size={28} stroke="#E8C76A" />
          </div>
          <span className="overline" style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}>Restricted Access</span>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            System Administrator
          </h1>
          <p style={{ fontFamily: 'Outfit', color: 'var(--ink-muted)', fontSize: 14 }}>Authorised personnel only. All access attempts are logged.</p>
        </div>

        <div className="slide-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 36, boxShadow: '0 8px 48px rgba(0,0,0,0.08)' }}>

          <div style={{ background: 'var(--ivory-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="lock" size={13} stroke="var(--ink-muted)" />
            <span style={{ fontFamily: 'Outfit', fontSize: 12, color: 'var(--ink-muted)', fontWeight: 500 }}>Secure session · Access is monitored and logged</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: 'var(--ink-warm)', marginBottom: 6 }}>Admin Email</label>
              <input className="input-field" type="email" autoComplete="email"
                placeholder="admin@saarthicivic.gov.in"
                value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: 'var(--ink-warm)', marginBottom: 6 }}>Password</label>
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

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: 'linear-gradient(135deg, #16100A 0%, #2D1810 50%, #0F1E3C 100%)',
                color: 'white', border: 'none', borderRadius: 12,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit', fontWeight: 600, fontSize: 15,
                opacity: loading ? 0.6 : 1,
                transition: 'transform 0.18s, box-shadow 0.18s',
                boxShadow: '0 4px 18px rgba(0,0,0,0.2)',
                position: 'relative', overflow: 'hidden',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.28)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.2)' }}
            >
              {loading ? 'Verifying…' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontFamily: 'Outfit', fontSize: 12.5, color: 'var(--ink-faint)', textDecoration: 'none', transition: 'color 0.18s' }}
            onMouseEnter={e => e.target.style.color = 'var(--ink-muted)'}
            onMouseLeave={e => e.target.style.color = 'var(--ink-faint)'}>
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  )
}