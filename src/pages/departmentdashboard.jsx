import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAuth } from '../context/authcontext'
import api from '../utils/api'

const SEV_COLOR = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
const SEV_BG    = { high: '#FEF2F2', medium: '#FFFBEB', low: '#F0FDF4' }
const ST_COLOR  = { pending: '#7C3AED', 'in-progress': '#D97706', resolved: '#16A34A' }
const ST_BG     = { pending: '#F5F3FF', 'in-progress': '#FFFBEB', resolved: '#F0FDF4' }

const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const paths = {
    home:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    list:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    map:     'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4',
    chart:   'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    logout:  'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    close:   'M6 18L18 6M6 6l12 12',
    check:   'M5 13l4 4L19 7',
    alert:   'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    clock:   'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    menu:    'M3 6h18M3 12h18M3 18h18',
    pin:     'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    trend:   'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]?.split('M').filter(Boolean).map((d, i) => <path key={i} d={'M' + d} />)}
    </svg>
  )
}

function StatCard({ label, value, sub, color = '#B5451B', icon }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '16px 16px 0 0' }} />
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 32, fontWeight: 700, color: '#1A1208', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', marginTop: 4, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontFamily: 'Outfit', fontSize: 11, color: '#B8A898', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function ComplaintModal({ complaint, officers, onClose, onUpdate }) {
  const [status, setStatus]     = useState(complaint.status)
  const [assignee, setAssignee] = useState(complaint.assignee || '')
  const [note, setNote]         = useState('')
  const [notes, setNotes]       = useState(complaint.notes || [])
  const [saving, setSaving]     = useState(false)

  const addNote = () => { if (note.trim()) { setNotes(p => [...p, note.trim()]); setNote('') } }

  const save = async () => {
    setSaving(true)
    try {
      await api.patch(`/complaints/${complaint.id}`, { status, assignee, notes })
    } catch { /* proceed anyway */ }
    onUpdate({ ...complaint, status, assignee, notes })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0EBE3', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 700, color: '#8B7355', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{(complaint.id || '').substring(0,8).toUpperCase()}</span>
              <span style={{ fontFamily: 'Outfit', fontSize: 11, padding: '2px 8px', borderRadius: 20, background: SEV_BG[complaint.severity], color: SEV_COLOR[complaint.severity], fontWeight: 600, textTransform: 'capitalize' }}>{complaint.severity}</span>
            </div>
            <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.4rem', color: '#1A1208', fontWeight: 700, lineHeight: 1.2 }}>{complaint.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: '#F8F4EE', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>
            <Icon name="close" size={14} color="#8B7355" />
          </button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Area', complaint.area], ['Filed', (complaint.created_at || '').substring(0,10)], ['Description', complaint.description], ['Current Status', complaint.status]].filter(([,v]) => v).map(([k,v]) => (
              <div key={k} style={{ background: '#FAF7F2', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 10, color: '#B8A898', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{k}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', fontWeight: 500, textTransform: 'capitalize' }}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Update Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['pending','in-progress','resolved'].map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `2px solid ${status===s ? ST_COLOR[s] : '#F0EBE3'}`, background: status===s ? ST_BG[s] : 'white', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: status===s ? ST_COLOR[s] : '#8B7355', textTransform: 'capitalize', transition: 'all 0.2s' }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assign Officer</label>
            <select value={assignee} onChange={e => setAssignee(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', background: 'white', outline: 'none' }}>
              <option value="">— Unassigned —</option>
              {officers.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Internal Notes</label>
            {notes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {notes.map((n,i) => <div key={i} style={{ background: '#FAF7F2', borderRadius: 8, padding: '8px 12px', fontFamily: 'Outfit', fontSize: 12, color: '#5A4A3A', borderLeft: '3px solid #C9952A' }}>{n}</div>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} placeholder="Add a note..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none' }} />
              <button onClick={addNote} style={{ padding: '10px 16px', borderRadius: 10, background: '#FAF7F2', border: '1.5px solid #E8DDD4', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12, color: '#8B7355', fontWeight: 600 }}>Add</button>
            </div>
          </div>
          <button onClick={save} disabled={saving} style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#B5451B,#C9952A)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 14, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DepartmentDashboard() {
  const { user, logout } = useAuth()

  const [activeTab, setActiveTab]       = useState('overview')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [complaints, setComplaints]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [deptInfo, setDeptInfo]         = useState(null)   // fetched from backend for this staff's department
  const [officers, setOfficers]         = useState([])     // other staff in same department
  const [selected, setSelected]         = useState(null)
  const [search, setSearch]             = useState('')
  const [filterArea, setFilterArea]     = useState('')
  const [filterSev, setFilterSev]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // All data scoped to the logged-in staff's department_id JWT claim
  // Works for ANY department — PWD, Health, Roads, Education, etc.
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [deptRes, complaintsRes, staffRes] = await Promise.all([
        api.get('/department/my-info'),
        api.get('/complaints/my-department'),
        api.get('/department/my-staff'),
      ])
      setDeptInfo(deptRes.data.department)
      setComplaints(complaintsRes.data.complaints || [])
      setOfficers((staffRes.data.staff || []).map(s => s.name).filter(Boolean))
    } catch {
      setError('Failed to load department data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const stats = useMemo(() => ({
    total:    complaints.length,
    pending:  complaints.filter(c => c.status === 'pending').length,
    progress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    high:     complaints.filter(c => c.severity === 'high').length,
  }), [complaints])

  const AREAS = useMemo(() => [...new Set(complaints.map(c => c.area).filter(Boolean))], [complaints])

  const filtered = useMemo(() => complaints.filter(c => {
    const s = search.toLowerCase()
    const matchSearch = !search || c.title?.toLowerCase().includes(s) || c.area?.toLowerCase().includes(s)
    return matchSearch
      && (!filterArea   || c.area     === filterArea)
      && (!filterSev    || c.severity === filterSev)
      && (!filterStatus || c.status   === filterStatus)
  }), [complaints, search, filterArea, filterSev, filterStatus])

  const updateComplaint = (updated) => setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))

  const deptName = deptInfo?.name || 'Department'
  const deptCode = deptInfo?.code || ''

  const nav = [
    { id: 'overview',   label: 'Overview',   icon: 'home'  },
    { id: 'complaints', label: 'Complaints',  icon: 'list'  },
    { id: 'map',        label: 'Map View',    icon: 'map'   },
    { id: 'analytics',  label: 'Analytics',   icon: 'chart' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Outfit' }}>
      <style>{`
        @keyframes pulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.8} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
        .crow:hover { background: #FAF7F2 !important; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E8DDD4; border-radius: 4px; }
      `}</style>

      <button onClick={() => setSidebarOpen(true)} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, width: 42, height: 42, borderRadius: 12, background: '#1A1208', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <Icon name="menu" size={18} color="rgba(255,255,255,0.8)" />
      </button>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }} />}

      {/* Sidebar */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: 240, background: '#1A1208', zIndex: 201, display: 'flex', flexDirection: 'column', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '8px 0 40px rgba(0,0,0,0.3)' }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,#B5451B,#C9952A,#E8C76A)', flexShrink: 0 }} />
        <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,149,42,0.2)', border: '1.5px solid rgba(201,149,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="#E8C76A" strokeWidth="1.2" />
              <circle cx="11" cy="11" r="2" fill="#E8C76A" />
              {[0,45,90,135,180,225,270,315].map(deg => { const a = deg * Math.PI / 180; return <line key={deg} x1={11+Math.cos(a)*2.5} y1={11+Math.sin(a)*2.5} x2={11+Math.cos(a)*9.5} y2={11+Math.sin(a)*9.5} stroke="#E8C76A" strokeWidth="0.9" /> })}
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: 15, color: 'white', lineHeight: 1.1 }}>Saarthi Civic</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{deptCode || 'Dept.'} Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <Icon name="close" size={15} color="rgba(255,255,255,0.4)" />
          </button>
        </div>

        {/* Dynamic department badge — shows actual department name from backend */}
        {deptInfo && (
          <div style={{ margin: '10px 8px 0', padding: '10px 12px', background: 'rgba(201,149,42,0.1)', borderRadius: 8, border: '1px solid rgba(201,149,42,0.2)' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Your Department</div>
            <div style={{ fontSize: 13, color: '#E8C76A', fontWeight: 600 }}>{deptName}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{deptCode}</div>
          </div>
        )}

        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', background: activeTab === item.id ? 'rgba(181,69,27,0.25)' : 'transparent', color: activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.55)', transition: 'all 0.2s', fontFamily: 'Outfit', fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400 }}>
              <Icon name={item.icon} size={17} color={activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.55)'} />
              {item.label}
              {activeTab === item.id && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#E8C76A' }} />}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ padding: '10px 14px', marginBottom: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{user?.email?.split('@')[0] ?? 'Staff'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>DEPARTMENT STAFF</div>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13 }}>
            <Icon name="logout" size={16} color="rgba(255,255,255,0.4)" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '28px 32px 28px 80px', animation: 'fadeIn 0.4s ease' }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ height: 36, background: '#F0EBE3', borderRadius: 8, width: '40%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height: 120, background: '#F0EBE3', borderRadius: 16, animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
            </div>
          </div>
        )}

        {!loading && error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '20px 24px', color: '#DC2626', fontFamily: 'Outfit', fontSize: 13, display: 'flex', gap: 10, alignItems: 'center' }}>
            <Icon name="alert" size={16} color="#DC2626" /> {error}
            <button onClick={fetchData} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #DC2626', borderRadius: 8, padding: '6px 12px', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>Retry</button>
          </div>
        )}

        {!loading && !error && (

          <>
            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  {/* deptName comes from backend — renders whatever department this staff belongs to */}
                  <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>{deptName}</h1>
                  <p style={{ fontSize: 13, color: '#8B7355' }}>Real-time complaint tracking and operational summary</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                  <StatCard label="Total"       value={stats.total}    icon="list"    color="#1A1208" />
                  <StatCard label="Pending"      value={stats.pending}  icon="clock"   color="#7C3AED" sub="Awaiting" />
                  <StatCard label="In Progress"  value={stats.progress} icon="refresh" color="#D97706" />
                  <StatCard label="Resolved"     value={stats.resolved} icon="check"   color="#16A34A" />
                  <StatCard label="High Severity" value={stats.high}    icon="alert"   color="#DC2626" sub="Priority" />
                </div>

                {/* Weekly trend — built from real complaint dates */}
                <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', fontWeight: 700, color: '#1A1208' }}>Weekly Trend</h3>
                      <p style={{ fontSize: 12, color: '#8B7355', marginTop: 2 }}>Complaints over the past 7 days</p>
                    </div>
                    <Icon name="trend" size={18} color="#C9952A" />
                  </div>
                  {(() => {
                    const days = Array.from({length:7},(_,i) => { const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().substring(0,10) })
                    const counts = days.map(day => complaints.filter(c => (c.created_at||'').substring(0,10) === day).length)
                    const max = Math.max(...counts, 1)
                    return (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                        {counts.map((v,i) => (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: '100%', background: i===6 ? 'linear-gradient(180deg,#B5451B,#E8C76A)' : '#F0EBE3', borderRadius: '4px 4px 0 0', height: `${(v/max)*80}px`, minHeight: v>0?6:2, transition: 'height 0.5s ease' }} />
                            <span style={{ fontSize: 9, color: '#B8A898' }}>{['M','T','W','T','F','S','S'][new Date(days[i]).getDay()]}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>

                {/* High priority */}
                <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', fontWeight: 700, color: '#1A1208' }}>High Priority</h3>
                    <button onClick={() => setActiveTab('complaints')} style={{ fontSize: 12, color: '#B5451B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600 }}>View all →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {complaints.filter(c => c.severity === 'high' && c.status !== 'resolved').slice(0,4).map(c => (
                      <div key={c.id} onClick={() => setSelected(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #F0EBE3', cursor: 'pointer', background: 'white', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAF7F2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1208' }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: '#8B7355', marginTop: 2 }}>{c.area} · {(c.created_at||'').substring(0,10)}</div>
                        </div>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: ST_BG[c.status]||'#F5F3FF', color: ST_COLOR[c.status]||'#7C3AED', fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{c.status}</span>
                      </div>
                    ))}
                    {complaints.filter(c => c.severity==='high' && c.status!=='resolved').length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', color: '#B8A898', fontSize: 13 }}>No high priority complaints 🎉</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── COMPLAINTS ── */}
            {activeTab === 'complaints' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>Complaint Management</h1>
                    <p style={{ fontSize: 13, color: '#8B7355' }}>{filtered.length} complaints · {deptName}</p>
                  </div>
                </div>

                {/* Filters */}
                <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #F0EBE3', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={14} color="#B8A898" /></div>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..." style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', background: '#FAF7F2' }} />
                  </div>
                  {[
                    [filterArea,   setFilterArea,   AREAS,                               'All Areas'],
                    [filterSev,    setFilterSev,    ['high','medium','low'],              'All Severities'],
                    [filterStatus, setFilterStatus, ['pending','in-progress','resolved'], 'All Statuses'],
                  ].map(([val, setter, opts, ph], idx) => (
                    <select key={idx} value={val} onChange={e => setter(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: val ? '#1A1208' : '#B8A898', background: 'white', outline: 'none', cursor: 'pointer' }}>
                      <option value="">{ph}</option>
                      {opts.map(o => <option key={o} value={o} style={{ textTransform: 'capitalize' }}>{o}</option>)}
                    </select>
                  ))}
                  {(search||filterArea||filterSev||filterStatus) && (
                    <button onClick={() => { setSearch(''); setFilterArea(''); setFilterSev(''); setFilterStatus('') }} style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E8DDD4', background: 'white', cursor: 'pointer', fontSize: 12, color: '#8B7355', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="close" size={12} color="#8B7355" /> Clear
                    </button>
                  )}
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: 14, border: '1px solid #F0EBE3', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 100px 110px 44px', padding: '10px 16px', background: '#FAF7F2', borderBottom: '1px solid #F0EBE3' }}>
                    {['Complaint','Area','Severity','Status','Assignee',''].map(h => (
                      <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B8A898', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                    ))}
                  </div>
                  <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                    {filtered.length === 0 ? (
                      <div style={{ padding: 40, textAlign: 'center', color: '#B8A898', fontSize: 13 }}>No complaints match your filters</div>
                    ) : filtered.map(c => (
                      <div key={c.id} className="crow" onClick={() => setSelected(c)} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 90px 100px 110px 44px', padding: '14px 16px', borderBottom: '1px solid #F8F4EE', cursor: 'pointer', transition: 'background 0.15s', background: 'white', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1208', lineHeight: 1.3 }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: '#B8A898', marginTop: 2 }}>{(c.created_at||'').substring(0,10)}</div>
                        </div>
                        <span style={{ fontSize: 12, color: '#5A4A3A' }}>{c.area || '—'}</span>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: SEV_BG[c.severity]||'#F9FAFB', color: SEV_COLOR[c.severity]||'#6B7280', fontWeight: 600, textTransform: 'capitalize', display: 'inline-block' }}>{c.severity || '—'}</span>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: ST_BG[c.status]||'#F5F3FF', color: ST_COLOR[c.status]||'#7C3AED', fontWeight: 600, textTransform: 'capitalize', display: 'inline-block' }}>{c.status}</span>
                        <span style={{ fontSize: 11, color: c.assignee ? '#5A4A3A' : '#D1C5B8' }}>{c.assignee || 'Unassigned'}</span>
                        <div style={{ background: '#FAF7F2', borderRadius: 6, padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="edit" size={13} color="#B8A898" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MAP ── */}
            {activeTab === 'map' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>Map View</h1>
                  <p style={{ fontSize: 13, color: '#8B7355' }}>Geographic distribution of complaints — {deptName}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
                  <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    {/* Heatmap — area dots sized by complaint count */}
                    <div style={{ position: 'relative', background: '#F8F4EE', borderRadius: 12, overflow: 'hidden', height: 320 }}>
                      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                        {[10,20,30,40,50,60,70,80,90].map(p => (<g key={p}><line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#E8DDD4" strokeWidth="1" strokeDasharray="4 4" /><line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#E8DDD4" strokeWidth="1" strokeDasharray="4 4" /></g>))}
                      </svg>
                      {(() => {
                        const areaList = [...new Set(complaints.map(c=>c.area).filter(Boolean))]
                        return areaList.map((area, i) => {
                          const angle = (i / Math.max(areaList.length,1)) * 2 * Math.PI
                          const x = 50 + 35 * Math.cos(angle)
                          const y = 50 + 30 * Math.sin(angle)
                          const count = complaints.filter(c=>c.area===area).length
                          const hasHigh = complaints.some(c=>c.area===area&&c.severity==='high')
                          const col = hasHigh ? '#DC2626' : count>1 ? '#D97706' : '#16A34A'
                          return (
                            <div key={area} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer' }}>
                              <div style={{ width: 28+count*4, height: 28+count*4, borderRadius: '50%', background: col+'22', border: `2px solid ${col}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: hasHigh?'pulse 2s ease-in-out infinite':'none' }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontFamily: 'Outfit', fontWeight: 700 }}>{count}</div>
                              </div>
                              <div style={{ marginTop: 4, fontSize: 9, color: '#8B7355', textAlign: 'center', maxWidth: 70, lineHeight: 1.2 }}>{area}</div>
                            </div>
                          )
                        })
                      })()}
                      {AREAS.length === 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8A898', fontSize: 13 }}>No location data yet</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: 'white', borderRadius: 14, padding: 18, border: '1px solid #F0EBE3' }}>
                      <h4 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1rem', fontWeight: 700, color: '#1A1208', marginBottom: 12 }}>Hotspot Areas</h4>
                      {AREAS.slice(0,8).map(area => {
                        const count = complaints.filter(c=>c.area===area).length
                        const highCount = complaints.filter(c=>c.area===area&&c.severity==='high').length
                        return (
                          <div key={area} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F8F4EE' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Icon name="pin" size={11} color={highCount>0?'#DC2626':'#C9952A'} />
                              <span style={{ fontSize: 12, color: '#1A1208', fontWeight: 500 }}>{area}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 5 }}>
                              {highCount>0 && <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 700, background: '#FEF2F2', padding: '1px 5px', borderRadius: 8 }}>{highCount}H</span>}
                              <span style={{ fontSize: 11, color: '#8B7355', fontWeight: 600 }}>{count}</span>
                            </div>
                          </div>
                        )
                      })}
                      {AREAS.length === 0 && <div style={{ fontSize: 12, color: '#B8A898', textAlign: 'center', padding: '10px 0' }}>No data</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>Analytics — {deptName}</h1>
                  <p style={{ fontSize: 13, color: '#8B7355' }}>Complaint pattern analysis and resolution performance</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0EBE3' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', fontWeight: 700, color: '#1A1208', marginBottom: 16 }}>Complaints by Area</h3>
                    {(() => {
                      const areaData = Object.entries(complaints.reduce((acc,c) => { if(c.area){acc[c.area]=(acc[c.area]||0)+1}; return acc }, {})).sort((a,b)=>b[1]-a[1]).slice(0,6)
                      const max = Math.max(...areaData.map(([,v])=>v), 1)
                      return areaData.length === 0
                        ? <div style={{ fontSize: 13, color: '#B8A898', textAlign: 'center', padding: '20px 0' }}>No data yet</div>
                        : areaData.map(([area, count]) => (
                          <div key={area} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontFamily: 'Outfit', fontSize: 12, color: '#1A1208', fontWeight: 500 }}>{area}</span>
                              <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8B7355' }}>{count}</span>
                            </div>
                            <div style={{ height: 8, background: '#F0EBE3', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(count/max)*100}%`, background: 'linear-gradient(90deg,#B5451B,#E8C76A)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        ))
                    })()}
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0EBE3' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', fontWeight: 700, color: '#1A1208', marginBottom: 16 }}>Resolution Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        ['Resolution Rate',        stats.total>0 ? Math.round((stats.resolved/stats.total)*100)+'%' : '—', '#16A34A'],
                        ['In Progress',            stats.progress, '#D97706'],
                        ['High Priority Pending',  complaints.filter(c=>c.severity==='high'&&c.status!=='resolved').length, '#DC2626'],
                        ['Assignment Rate',        stats.total>0 ? Math.round((complaints.filter(c=>c.assignee).length/stats.total)*100)+'%' : '—', '#7C3AED'],
                      ].map(([label, value, color]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#FAF7F2', borderRadius: 10 }}>
                          <span style={{ fontSize: 13, color: '#5A4A3A' }}>{label}</span>
                          <span style={{ fontSize: 20, fontFamily: 'Cormorant Garamond', fontWeight: 700, color }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && <ComplaintModal complaint={selected} officers={officers} onClose={() => setSelected(null)} onUpdate={updateComplaint} />}
    </div>
  )
}