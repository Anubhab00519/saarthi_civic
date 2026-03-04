import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/authcontext'
import api from '../utils/api'

const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const paths = {
    menu:     'M3 6h18M3 12h18M3 18h18',
    close:    'M6 18L18 6M6 6l12 12',
    logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
    plus:     'M12 5v14M5 12h14',
    upload:   'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
    check:    'M5 13l4 4L19 7',
    alert:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    home:     'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    city:     'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
    search:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    back:     'M19 12H5M12 19l-7-7 7-7',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]?.split('M').filter(Boolean).map((d, i) => <path key={i} d={'M' + d} />)}
    </svg>
  )
}

// ── Corp Picker Screen ────────────────────────────────────────────────────────
function CorpPicker({ onSelect, user, logout }) {
  const [corporations, setCorporations] = useState([])
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.get('/admin/corporations/list')
      .then(r => setCorporations(r.data.corporations || []))
      .catch(() => setCorporations([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = corporations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.district || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', fontFamily: 'Outfit', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ background: '#1A1208', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
        <Icon name="city" size={18} color="#E8C76A" />
        <span style={{ fontFamily: 'Cormorant Garamond', fontSize: 17, fontWeight: 700, color: 'white' }}>Saarthi Civic</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: 20, marginLeft: 4 }}>Admin Portal</span>
        <button onClick={logout} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Outfit' }}>
          <Icon name="logout" size={13} color="rgba(255,255,255,0.5)" /> Sign Out
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {/* Welcome */}
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#B5451B,#C9952A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="city" size={26} color="white" />
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.9rem', fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>
              Welcome, {user?.email?.split('@')[0]}
            </h1>
            <p style={{ fontSize: 13, color: '#8B7355' }}>Select the corporation you want to manage</p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <Icon name="search" size={15} color="#B8A898" />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code or district…"
              style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onFocus={e => e.target.style.borderColor = '#C9952A'}
              onBlur={e => e.target.style.borderColor = '#E8DDD4'}
            />
          </div>

          {/* Corp cards */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2].map(i => <div key={i} style={{ height: 72, background: '#E8DDD4', borderRadius: 14, opacity: 0.6 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#B8A898', fontSize: 13 }}>
              No corporations found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(corp => (
                <button
                  key={corp.id}
                  onClick={() => onSelect(corp)}
                  style={{ width: '100%', padding: '16px 20px', borderRadius: 14, border: '1.5px solid #E8DDD4', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9952A'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(181,69,27,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8DDD4'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  {/* Badge */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#FAF0E6,#F5E6D3)', border: '1px solid #E8DDD4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#B5451B', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{corp.code}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1208', marginBottom: 2 }}>{corp.name}</div>
                    <div style={{ fontSize: 11, color: '#8B7355' }}>{corp.district} District</div>
                  </div>
                  <Icon name="back" size={16} color="#C4B5A5" />
                </button>
              ))}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 11, color: '#C4B5A5', marginTop: 24 }}>
            More corporations can be added from the database
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [selectedCorp, setSelectedCorp] = useState(null)  // { id, name, code, district }
  const [activeTab, setActiveTab]       = useState('overview')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [departments, setDepartments]   = useState([])
  const [staff, setStaff]               = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  // Create dept form
  const [deptName, setDeptName]   = useState('')
  const [deptCode, setDeptCode]   = useState('')
  const [deptDesc, setDeptDesc]   = useState('')
  const [creating, setCreating]   = useState(false)
  const [createMsg, setCreateMsg] = useState(null)

  // Upload staff form
  const [uploadDeptId, setUploadDeptId] = useState('')
  const [csvFile, setCsvFile]           = useState(null)
  const [uploading, setUploading]       = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!selectedCorp) return
    setLoading(true); setError('')
    try {
      const [deptsRes, staffRes] = await Promise.all([
        api.get(`/admin/departments?corpId=${selectedCorp.id}`),
        api.get(`/admin/staff?corpId=${selectedCorp.id}`),
      ])
      setDepartments(deptsRes.data.departments || [])
      setStaff(staffRes.data.staff || [])
    } catch {
      setError('Failed to load. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [selectedCorp])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSelectCorp = (corp) => {
    setSelectedCorp(corp)
    setActiveTab('overview')
    setDepartments([])
    setStaff([])
    setCreateMsg(null)
    setUploadResult(null)
  }

  const handleCreateDept = async () => {
    if (!deptName.trim() || !deptCode.trim()) return
    setCreating(true); setCreateMsg(null)
    try {
      const res = await api.post('/admin/department/create', {
        name: deptName.trim(),
        code: deptCode.trim(),
        description: deptDesc.trim(),
        corporation_id: selectedCorp.id,
      })
      setCreateMsg({ type: 'success', text: `"${res.data.department.name}" created successfully under ${selectedCorp.name}.` })
      setDeptName(''); setDeptCode(''); setDeptDesc('')
      fetchAll()
    } catch (err) {
      setCreateMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create department.' })
    } finally {
      setCreating(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadDeptId || !csvFile) return
    setUploading(true); setUploadResult(null)
    const formData = new FormData()
    formData.append('csv', csvFile)
    formData.append('departmentId', uploadDeptId)
    try {
      const res = await api.post('/admin/staff/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadResult({ type: 'success', ...res.data })
      fetchAll()
    } catch (err) {
      setUploadResult({ type: 'error', text: err.response?.data?.message || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  // Show corp picker if no corp selected yet
  if (!selectedCorp) {
    return <CorpPicker onSelect={handleSelectCorp} user={user} logout={logout} />
  }

  const nav = [
    { id: 'overview',    label: 'Overview',   icon: 'home'     },
    { id: 'departments', label: 'Departments', icon: 'building' },
    { id: 'staff',       label: 'Staff',       icon: 'users'    },
  ]

  const Label = ({ children }) => (
    <div style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{children}</div>
  )

  const Input = ({ value, onChange, placeholder }) => (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', background: 'white' }}
      onFocus={e => e.target.style.borderColor = '#C9952A'}
      onBlur={e => e.target.style.borderColor = '#E8DDD4'}
    />
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F3EE', fontFamily: 'Outfit' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E8DDD4; border-radius: 4px; }
      `}</style>

      {/* Top header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 54, background: '#1A1208', zIndex: 99, display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 20, gap: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
        <button onClick={() => setSidebarOpen(true)} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="menu" size={16} color="rgba(255,255,255,0.8)" />
        </button>
        <Icon name="city" size={17} color="#E8C76A" />
        <span style={{ fontFamily: 'Cormorant Garamond', fontSize: 16, fontWeight: 700, color: 'white' }}>Saarthi Civic</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize: 12, color: '#E8C76A', fontWeight: 600 }}>{selectedCorp.name}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 20 }}>{selectedCorp.code}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12, background: activeTab === item.id ? 'rgba(181,69,27,0.35)' : 'transparent', color: activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.45)', fontWeight: activeTab === item.id ? 600 : 400 }}>
              <Icon name={item.icon} size={13} color={activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.45)'} />
              {item.label}
            </button>
          ))}
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 6px' }} />
          {/* Switch corporation */}
          <button onClick={() => setSelectedCorp(null)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, background: 'transparent', color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>
            <Icon name="back" size={13} color="rgba(255,255,255,0.45)" /> Switch Corp
          </button>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, background: 'transparent', color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
            <Icon name="logout" size={13} color="rgba(255,255,255,0.35)" /> Sign Out
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: 240, background: '#1A1208', zIndex: 201, display: 'flex', flexDirection: 'column', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '8px 0 40px rgba(0,0,0,0.3)' }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,#B5451B,#C9952A,#E8C76A)' }} />
        <div style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: 15, color: 'white' }}>Navigation</span>
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="close" size={14} color="rgba(255,255,255,0.4)" />
          </button>
        </div>
        <div style={{ margin: '10px 8px 0', padding: '10px 12px', background: 'rgba(201,149,42,0.12)', borderRadius: 8, border: '1px solid rgba(201,149,42,0.2)' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Managing</div>
          <div style={{ fontSize: 13, color: '#E8C76A', fontWeight: 600 }}>{selectedCorp.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{selectedCorp.code} · {departments.length} dept{departments.length !== 1 ? 's' : ''}</div>
        </div>
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', background: activeTab === item.id ? 'rgba(181,69,27,0.25)' : 'transparent', color: activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.55)', fontFamily: 'Outfit', fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400 }}>
              <Icon name={item.icon} size={16} color={activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.55)'} />
              {item.label}
            </button>
          ))}
          <button onClick={() => { setSelectedCorp(null); setSidebarOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit', fontSize: 13, marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Icon name="back" size={16} color="rgba(255,255,255,0.4)" /> Switch Corporation
          </button>
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '10px 14px', marginBottom: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{user?.email?.split('@')[0] ?? 'Admin'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>ADMIN</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ paddingTop: 54 }}>
        <div style={{ padding: '28px 32px', animation: 'fadeIn 0.4s ease', maxWidth: 960, margin: '0 auto' }}>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 60, background: '#E8DDD4', borderRadius: 12, animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
            </div>
          )}

          {!loading && error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', color: '#DC2626', fontSize: 13 }}>{error}</div>
          )}

          {!loading && !error && (
            <>
              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>{selectedCorp.name}</h1>
                    <p style={{ fontSize: 13, color: '#8B7355' }}>Admin Dashboard · {selectedCorp.code} · {selectedCorp.district} District</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                      ['Departments', departments.length, '#B5451B'],
                      ['Total Staff',  staff.length,       '#7C3AED'],
                      ['Active Depts', departments.filter(d => d.is_active).length, '#16A34A'],
                    ].map(([label, value, color]) => (
                      <div key={label} style={{ background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #F0EBE3', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
                        <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 40, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: 13, color: '#8B7355', marginTop: 4, fontWeight: 500 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.2rem', fontWeight: 700, color: '#1A1208' }}>Departments in {selectedCorp.code}</h3>
                      <button onClick={() => setActiveTab('departments')} style={{ fontSize: 12, color: '#B5451B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Manage →</button>
                    </div>
                    {departments.length === 0
                      ? <div style={{ fontSize: 13, color: '#B8A898', textAlign: 'center', padding: '20px 0' }}>No departments yet. Go to Departments tab to create one.</div>
                      : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {departments.map(d => (
                            <div key={d.id} style={{ padding: '8px 14px', borderRadius: 20, background: '#FAF7F2', border: '1px solid #E8DDD4', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Icon name="building" size={12} color="#C9952A" />
                              <span style={{ fontSize: 12, color: '#1A1208', fontWeight: 500 }}>{d.name}</span>
                              <span style={{ fontSize: 10, color: '#B8A898' }}>{d.staffCount} staff</span>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                </div>
              )}

              {/* ── DEPARTMENTS ── */}
              {activeTab === 'departments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>Departments</h1>
                    <p style={{ fontSize: 13, color: '#8B7355' }}>{selectedCorp.name} · {departments.length} department{departments.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Create form */}
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.1rem', fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>Create New Department</h3>
                    <p style={{ fontSize: 12, color: '#8B7355', marginBottom: 18 }}>
                      This department will be created under <strong style={{ color: '#1A1208' }}>{selectedCorp.name}</strong>. Only staff assigned to this department will see its complaints.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div><Label>Department Name *</Label><Input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Health Department" /></div>
                      <div><Label>Short Code *</Label><Input value={deptCode} onChange={e => setDeptCode(e.target.value.toUpperCase())} placeholder="e.g. HEALTH" /></div>
                    </div>
                    <div style={{ marginBottom: 16 }}><Label>Description</Label><Input value={deptDesc} onChange={e => setDeptDesc(e.target.value)} placeholder="Optional description" /></div>
                    {createMsg && (
                      <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: createMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${createMsg.type === 'success' ? '#BBF7D0' : '#FECACA'}`, fontSize: 13, color: createMsg.type === 'success' ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name={createMsg.type === 'success' ? 'check' : 'alert'} size={13} color={createMsg.type === 'success' ? '#16A34A' : '#DC2626'} />
                        {createMsg.text}
                      </div>
                    )}
                    <button onClick={handleCreateDept} disabled={!deptName.trim() || !deptCode.trim() || creating} style={{ padding: '11px 24px', borderRadius: 10, background: (!deptName.trim() || !deptCode.trim() || creating) ? '#F0EBE3' : 'linear-gradient(135deg,#B5451B,#C9952A)', color: (!deptName.trim() || !deptCode.trim() || creating) ? '#C4B5A5' : 'white', border: 'none', cursor: (!deptName.trim() || !deptCode.trim() || creating) ? 'not-allowed' : 'pointer', fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="plus" size={14} color={(!deptName.trim() || !deptCode.trim() || creating) ? '#C4B5A5' : 'white'} />
                      {creating ? 'Creating…' : 'Create Department'}
                    </button>
                  </div>

                  {/* Departments table */}
                  {departments.length > 0 && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0EBE3', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', padding: '10px 20px', background: '#FAF7F2', borderBottom: '1px solid #F0EBE3' }}>
                        {['Department', 'Code', 'Staff', 'Status'].map(h => (
                          <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B8A898', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                        ))}
                      </div>
                      {departments.map(d => (
                        <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', padding: '14px 20px', borderBottom: '1px solid #F8F4EE', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1208' }}>{d.name}</div>
                            {d.description && <div style={{ fontSize: 11, color: '#B8A898', marginTop: 2 }}>{d.description}</div>}
                          </div>
                          <span style={{ fontSize: 11, color: '#8B7355', fontFamily: 'monospace', fontWeight: 700 }}>{d.code}</span>
                          <span style={{ fontSize: 13, color: '#1A1208', fontWeight: 600 }}>{d.staffCount}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: d.is_active ? '#F0FDF4' : '#F9FAFB', color: d.is_active ? '#16A34A' : '#6B7280', fontWeight: 600, display: 'inline-block' }}>{d.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── STAFF ── */}
              {activeTab === 'staff' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 4 }}>Staff Management</h1>
                    <p style={{ fontSize: 13, color: '#8B7355' }}>{selectedCorp.name} · {staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Upload CSV */}
                  <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.1rem', fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>Upload Staff CSV</h3>
                    <p style={{ fontSize: 12, color: '#8B7355', marginBottom: 18 }}>
                      CSV must have columns: <code style={{ background: '#FAF7F2', padding: '1px 6px', borderRadius: 4 }}>name, email, password</code>
                      <br />Staff will automatically be assigned to <strong style={{ color: '#1A1208' }}>{selectedCorp.name}</strong> and the selected department.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <Label>Select Department *</Label>
                        <select value={uploadDeptId} onChange={e => setUploadDeptId(e.target.value)} style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: uploadDeptId ? '#1A1208' : '#B8A898', background: 'white', outline: 'none' }}>
                          <option value="">— Choose department —</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label>CSV File *</Label>
                        <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 12, color: '#8B7355', background: 'white', cursor: 'pointer' }} />
                      </div>
                    </div>
                    {uploadResult && (
                      <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: uploadResult.type === 'success' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${uploadResult.type === 'success' ? '#BBF7D0' : '#FECACA'}`, fontSize: 13, color: uploadResult.type === 'success' ? '#16A34A' : '#DC2626' }}>
                        {uploadResult.type === 'success'
                          ? `✓ ${uploadResult.created} created, ${uploadResult.skipped} skipped out of ${uploadResult.total}`
                          : uploadResult.text}
                        {uploadResult.errors?.length > 0 && (
                          <div style={{ marginTop: 8, fontSize: 11 }}>{uploadResult.errors.slice(0,3).map((e, i) => <div key={i}>• {e}</div>)}</div>
                        )}
                      </div>
                    )}
                    <button onClick={handleUpload} disabled={!uploadDeptId || !csvFile || uploading} style={{ padding: '11px 24px', borderRadius: 10, background: (!uploadDeptId || !csvFile || uploading) ? '#F0EBE3' : 'linear-gradient(135deg,#B5451B,#C9952A)', color: (!uploadDeptId || !csvFile || uploading) ? '#C4B5A5' : 'white', border: 'none', cursor: (!uploadDeptId || !csvFile || uploading) ? 'not-allowed' : 'pointer', fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="upload" size={14} color={(!uploadDeptId || !csvFile || uploading) ? '#C4B5A5' : 'white'} />
                      {uploading ? 'Uploading…' : 'Upload Staff'}
                    </button>
                  </div>

                  {/* Staff list */}
                  {staff.length > 0 && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F0EBE3', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 20px', background: '#FAF7F2', borderBottom: '1px solid #F0EBE3' }}>
                        {['Name', 'Email', 'Department'].map(h => (
                          <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B8A898', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                        ))}
                      </div>
                      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {staff.map(s => (
                          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid #F8F4EE', alignItems: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1208' }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: '#8B7355' }}>{s.email}</div>
                            <div style={{ fontSize: 12, color: '#5A4A3A' }}>{s.department_name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}