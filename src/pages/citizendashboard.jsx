import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '../context/authcontext'
import api from '../utils/api'

const SEV_COLOR = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
const SEV_BG    = { high: '#FEF2F2', medium: '#FFFBEB', low: '#F0FDF4' }
const ST_COLOR  = { submitted: '#6B7280', assigned: '#7C3AED', 'in-progress': '#D97706', resolved: '#16A34A' }
const ST_BG     = { submitted: '#F9FAFB', assigned: '#F5F3FF', 'in-progress': '#FFFBEB', resolved: '#F0FDF4' }
const ST_LABEL  = { submitted: 'Submitted', assigned: 'Assigned', 'in-progress': 'In Progress', resolved: 'Resolved' }

const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const paths = {
    home:     'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    plus:     'M12 5v14M5 12h14',
    list:     'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    camera:   'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z',
    pin:      'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    close:    'M6 18L18 6M6 6l12 12',
    check:    'M5 13l4 4L19 7',
    search:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    menu:     'M3 6h18M3 12h18M3 18h18',
    ai:       'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    edit:     'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    back:     'M19 12H5M12 19l-7-7 7-7',
    info:     'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]?.split('M').filter(Boolean).map((d, i) => <path key={i} d={'M' + d} />)}
    </svg>
  )
}

// ── Step Circles — replaces the 4 progress lines ─────────────────────────────
function StepCircles({ status, timeline = [] }) {
  const steps = ['submitted', 'assigned', 'in-progress', 'resolved']
  const stepIndex = steps.indexOf(status)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 12 }}>
      {steps.map((step, i) => {
        const done    = i <= stepIndex
        const current = i === stepIndex
        const color   = ST_COLOR[step]
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div style={{
                width: current ? 28 : 22, height: current ? 28 : 22,
                borderRadius: '50%',
                background: done ? color : '#F0EBE3',
                border: `2px solid ${done ? color : '#E8DDD4'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: current ? `0 0 0 3px ${color}22` : 'none',
                transition: 'all 0.3s ease',
                flexShrink: 0,
              }}>
                {done
                  ? <Icon name="check" size={current ? 13 : 11} color="white" />
                  : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1C5B8' }} />
                }
              </div>
              <span style={{ fontSize: 9, fontFamily: 'Outfit', fontWeight: current ? 700 : 400, color: done ? color : '#C4B5A5', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {ST_LABEL[step]}
              </span>
            </div>
            {/* Connector line between circles */}
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < stepIndex ? ST_COLOR[steps[i]] : '#F0EBE3', marginBottom: 20, transition: 'background 0.3s ease' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Timeline (inside modal) ───────────────────────────────────────────────────
function Timeline({ events = [] }) {
  const allSteps = ['submitted', 'assigned', 'in-progress', 'resolved']
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {allSteps.map((step, i) => {
        const event = events.find(e => e.status === step)
        const isDone = !!event
        const isLast = i === allSteps.length - 1
        return (
          <div key={step} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDone ? ST_COLOR[step] : '#F0EBE3', border: `2px solid ${isDone ? ST_COLOR[step] : '#E8DDD4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDone ? <Icon name="check" size={13} color="white" /> : <span style={{ fontSize: 10, color: '#C4B5A5' }}>{i + 1}</span>}
              </div>
              {!isLast && <div style={{ width: 2, flex: 1, minHeight: 28, background: isDone ? ST_COLOR[step] + '40' : '#F0EBE3', margin: '4px 0' }} />}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 4 }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 600, color: isDone ? '#1A1208' : '#C4B5A5', textTransform: 'capitalize' }}>{step.replace('-', ' ')}</div>
              {event && (
                <>
                  <div style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8B7355', marginTop: 2 }}>{event.date}</div>
                  <div style={{ fontFamily: 'Outfit', fontSize: 12, color: '#5A4A3A', marginTop: 4, background: '#FAF7F2', borderRadius: 8, padding: '6px 10px', borderLeft: `3px solid ${ST_COLOR[step]}` }}>{event.note}</div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Complaint Card ────────────────────────────────────────────────────────────
function ComplaintCard({ complaint, onClick }) {
  const status   = complaint.status   || 'submitted'
  const severity = complaint.severity || 'medium'
  const timeline = complaint.timeline || []
  return (
    <div onClick={onClick} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', marginBottom: 12 }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(181,69,27,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: SEV_COLOR[severity] }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#B8A898', fontWeight: 700 }}>{(complaint.id || '').substring(0,8).toUpperCase()}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontFamily: 'Outfit', fontSize: 11, padding: '2px 10px', borderRadius: 20, background: SEV_BG[severity], color: SEV_COLOR[severity], fontWeight: 600, textTransform: 'capitalize' }}>{severity}</span>
          <span style={{ fontFamily: 'Outfit', fontSize: 11, padding: '2px 10px', borderRadius: 20, background: ST_BG[status] || '#F9FAFB', color: ST_COLOR[status] || '#6B7280', fontWeight: 600 }}>{ST_LABEL[status] || status}</span>
        </div>
      </div>
      <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.1rem', fontWeight: 700, color: '#1A1208', marginBottom: 6, lineHeight: 1.3 }}>{complaint.title}</h3>
      <div style={{ fontSize: 12, color: '#8B7355', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="pin" size={12} color="#C9952A" />{complaint.area || complaint.location || '—'}
      </div>
      <div style={{ fontSize: 11, color: '#B8A898', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="building" size={11} color="#C4B5A5" />{complaint.department_name || '—'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #F8F4EE' }}>
        <span style={{ fontSize: 11, color: '#B8A898' }}>{(complaint.created_at || '').substring(0, 10)}</span>
        <span style={{ fontSize: 11, color: complaint.assignee ? '#5A4A3A' : '#C4B5A5' }}>{complaint.assignee ? `Assigned to ${complaint.assignee}` : 'Awaiting assignment'}</span>
      </div>
      {/* Step circles replacing the old flat lines */}
      <StepCircles status={status} timeline={timeline} />
    </div>
  )
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ complaint, onClose }) {
  const status   = complaint.status   || 'submitted'
  const severity = complaint.severity || 'medium'
  const timeline = complaint.timeline || [
    { status: 'submitted', date: (complaint.created_at || '').substring(0, 16).replace('T', ' '), note: 'Complaint received and registered.' }
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ height: 4, background: SEV_COLOR[severity], borderRadius: '20px 20px 0 0' }} />
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0EBE3', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#8B7355' }}>{(complaint.id || '').substring(0,8).toUpperCase()}</span>
              <span style={{ fontFamily: 'Outfit', fontSize: 11, padding: '2px 10px', borderRadius: 20, background: SEV_BG[severity], color: SEV_COLOR[severity], fontWeight: 600, textTransform: 'capitalize' }}>{severity}</span>
              <span style={{ fontFamily: 'Outfit', fontSize: 11, padding: '2px 10px', borderRadius: 20, background: ST_BG[status] || '#F9FAFB', color: ST_COLOR[status] || '#6B7280', fontWeight: 600 }}>{ST_LABEL[status] || status}</span>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.5rem', fontWeight: 700, color: '#1A1208', lineHeight: 1.2 }}>{complaint.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: '#F8F4EE', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>
            <Icon name="close" size={14} color="#8B7355" />
          </button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Department', complaint.department_name || '—'],
              ['Location',   complaint.area || complaint.location || '—'],
              ['Filed On',   (complaint.created_at || '').substring(0, 10)],
              ['Assigned To', complaint.assignee || 'Pending'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#FAF7F2', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 10, color: '#B8A898', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{k}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          {complaint.description && (
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Description</div>
              <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#5A4A3A', lineHeight: 1.7, background: '#FAF7F2', borderRadius: 10, padding: '12px 14px', margin: 0 }}>{complaint.description}</p>
            </div>
          )}
          <div>
            <div style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Complaint Timeline</div>
            <Timeline events={timeline} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Submit Form ───────────────────────────────────────────────────────────────

// ── Submit Form — with Corporation → Department flow ──────────────────────────
function SubmitForm({ onSubmit, onBack }) {
  const [title, setTitle]                   = useState('')
  const [desc, setDesc]                     = useState('')
  const [selectedCorp, setSelectedCorp]     = useState(null)
  const [corpSearch, setCorpSearch]         = useState('')
  const [showCorpDropdown, setShowCorpDropdown] = useState(false)
  const [corporations, setCorporations]     = useState([])
  const [corpsLoading, setCorpsLoading]     = useState(true)
  const [selectedDept, setSelectedDept]     = useState(null)
  const [departments, setDepartments]       = useState([])
  const [deptsLoading, setDeptsLoading]     = useState(false)
  const [location, setLocation]             = useState('')
  const [image, setImage]                   = useState(null)
  const [aiPredicting, setAiPredicting]     = useState(false)
  const [aiSuggestion, setAiSuggestion]     = useState(null)
  const [submitting, setSubmitting]         = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [newComplaint, setNewComplaint]     = useState(null)
  const [locLoading, setLocLoading]         = useState(false)
  const fileRef = useRef()

  // Load all corporations on mount
  useEffect(() => {
    api.get('/admin/corporations/list')
      .then(r => setCorporations(r.data.corporations || []))
      .catch(() => setCorporations([]))
      .finally(() => setCorpsLoading(false))
  }, [])

  // When corporation changes, load its departments
  useEffect(() => {
    if (!selectedCorp) { setDepartments([]); setSelectedDept(null); return }
    setDeptsLoading(true)
    setSelectedDept(null)
    setDepartments([])
    api.get(`/departments/public?corpId=${selectedCorp.id}`)
      .then(r => setDepartments(r.data.departments || []))
      .catch(() => setDepartments([]))
      .finally(() => setDeptsLoading(false))
  }, [selectedCorp])

  const filteredCorps = corporations.filter(c =>
    c.name.toLowerCase().includes(corpSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(corpSearch.toLowerCase()) ||
    c.district.toLowerCase().includes(corpSearch.toLowerCase())
  )

  const selectCorp = (corp) => {
    setSelectedCorp(corp)
    setCorpSearch(corp.name)
    setShowCorpDropdown(false)
  }

  const predictAI = () => {
    if (!title && !desc) return
    setAiPredicting(true); setAiSuggestion(null)
    setTimeout(() => {
      const text = (title + ' ' + desc).toLowerCase()
      let best = null
      for (const dept of departments) {
        const n = dept.name.toLowerCase()
        if (
          (text.includes('water') && (n.includes('water') || n.includes('works'))) ||
          (text.includes('pipe')  && (n.includes('water') || n.includes('works'))) ||
          (text.includes('road')  && (n.includes('road')  || n.includes('highway') || n.includes('works'))) ||
          (text.includes('pothole') && (n.includes('road') || n.includes('works'))) ||
          (text.includes('light') && (n.includes('electric') || n.includes('power'))) ||
          (text.includes('garbage') && (n.includes('sanit') || n.includes('waste') || n.includes('clean'))) ||
          (text.includes('sewer')   && (n.includes('sanit') || n.includes('drain'))) ||
          (text.includes('health')  && (n.includes('health') || n.includes('medical'))) ||
          (text.includes('school')  && (n.includes('education') || n.includes('school')))
        ) { best = dept; break }
      }
      setAiSuggestion(best)
      if (best) setSelectedDept(best)
      setAiPredicting(false)
    }, 1200)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) setImage(URL.createObjectURL(file))
  }

  const detectLocation = () => {
    setLocLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`); setLocLoading(false) },
        () => setLocLoading(false)
      )
    } else setLocLoading(false)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !selectedDept || !selectedCorp) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/complaints/submit', {
        title:          title.trim(),
        description:    desc.trim(),
        department_id:  selectedDept.id,
        corporation_id: selectedCorp.id,
        area:           location.trim(),
        location:       location.trim(),
        severity:       'medium',
      })
      setNewComplaint(data.complaint)
      setSubmitted(true)
      onSubmit(data.complaint)
    } catch {
      alert('Failed to submit complaint. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && newComplaint) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#16A34A,#4ADE80)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 32px rgba(22,163,74,0.3)' }}>
          <Icon name="check" size={36} color="white" />
        </div>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 8 }}>Complaint Filed!</h2>
        <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8B7355', marginBottom: 2 }}>
          Corporation: <strong style={{ color: '#1A1208' }}>{selectedCorp.name}</strong>
        </p>
        <p style={{ fontFamily: 'Outfit', fontSize: 14, color: '#8B7355', marginBottom: 24 }}>
          Sent to: <strong style={{ color: '#1A1208' }}>{selectedDept.name}</strong>
        </p>
        <div style={{ background: '#FAF7F2', border: '1px solid #E8DDD4', borderRadius: 12, padding: '14px 28px', marginBottom: 8 }}>
          <div style={{ fontFamily: 'Outfit', fontSize: 10, color: '#B8A898', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Reference ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#B5451B' }}>{(newComplaint.id || '').substring(0,8).toUpperCase()}</div>
        </div>
        <p style={{ fontFamily: 'Outfit', fontSize: 11, color: '#B8A898', maxWidth: 280 }}>Save this ID to track your complaint in "My Complaints".</p>
      </div>
    )
  }

  const canSubmit = title.trim() && selectedCorp && selectedDept && !submitting

  const Hint = ({ text }) => (
    <p style={{ fontFamily: 'Outfit', fontSize: 11, color: '#B8A898', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
      <Icon name="info" size={11} color="#C4B5A5" />{text}
    </p>
  )

  // Step indicator at top of form: Corp → Dept → Details
  const step = !selectedCorp ? 1 : !selectedDept ? 2 : 3
  const steps = ['Select Corporation', 'Select Department', 'Fill Details']

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', marginBottom: 20, padding: 0 }}>
        <Icon name="back" size={16} color="#8B7355" /> Back
      </button>
      <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>File a Complaint</h1>
      <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', marginBottom: 20 }}>Describe the civic issue and we'll route it to the right department.</p>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
        {steps.map((s, i) => {
          const done    = i + 1 < step
          const current = i + 1 === step
          const color   = done ? '#16A34A' : current ? '#B5451B' : '#D1C5B8'
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{ width: current ? 28 : 22, height: current ? 28 : 22, borderRadius: '50%', background: done ? '#16A34A' : current ? '#B5451B' : '#F0EBE3', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: current ? `0 0 0 3px ${color}22` : 'none', transition: 'all 0.3s' }}>
                  {done
                    ? <Icon name="check" size={11} color="white" />
                    : <span style={{ fontSize: 10, fontWeight: 700, color: current ? 'white' : '#C4B5A5' }}>{i + 1}</span>
                  }
                </div>
                <span style={{ fontSize: 9, color, fontWeight: current ? 700 : 400, whiteSpace: 'nowrap', fontFamily: 'Outfit' }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done ? '#16A34A' : '#F0EBE3', marginBottom: 16, transition: 'background 0.3s' }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ── STEP 1: Corporation ── */}
        <div>
          <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select Corporation *
            {selectedCorp && <span style={{ marginLeft: 8, fontSize: 10, color: '#16A34A', textTransform: 'none' }}>✓ {selectedCorp.code}</span>}
          </label>
          <Hint text="Choose the municipal corporation for your area. Type to search by name or district." />
          <div style={{ position: 'relative', marginTop: 8 }}>
            <input
              value={corpSearch}
              onChange={e => { setCorpSearch(e.target.value); setShowCorpDropdown(true); if (!e.target.value) { setSelectedCorp(null) } }}
              onFocus={() => setShowCorpDropdown(true)}
              placeholder={corpsLoading ? 'Loading corporations…' : 'Search corporation (e.g. Kolkata, Howrah)'}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${selectedCorp ? '#16A34A' : '#E8DDD4'}`, fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', background: 'white' }}
              onBlur={() => setTimeout(() => setShowCorpDropdown(false), 150)}
            />
            {showCorpDropdown && filteredCorps.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #E8DDD4', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, marginTop: 4, overflow: 'hidden' }}>
                {filteredCorps.map(corp => (
                  <div key={corp.id} onMouseDown={() => selectCorp(corp)}
                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F8F4EE', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAF7F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FAF7F2', border: '1px solid #E8DDD4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#B5451B', fontFamily: 'monospace' }}>{corp.code}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1208' }}>{corp.name}</div>
                      <div style={{ fontSize: 11, color: '#8B7355', marginTop: 1 }}>{corp.district} District</div>
                    </div>
                  </div>
                ))}
                {/* Future corporations appear here automatically */}
              </div>
            )}
            {showCorpDropdown && corpSearch && filteredCorps.length === 0 && !corpsLoading && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid #E8DDD4', borderRadius: 10, padding: '12px 14px', zIndex: 50, marginTop: 4, fontSize: 12, color: '#B8A898' }}>
                No corporation found for "{corpSearch}"
              </div>
            )}
          </div>
        </div>

        {/* ── STEP 2: Department (shown only after corp selected) ── */}
        {selectedCorp && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Department *</label>
            <Hint text={`Departments available under ${selectedCorp.code}. Use AI Predict if unsure.`} />
            <div style={{ marginTop: 8 }}>
              {deptsLoading
                ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{[1,2,3].map(i => <div key={i} style={{ height: 36, width: 120, borderRadius: 20, background: '#F0EBE3', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}</div>
                : departments.length === 0
                  ? <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626', fontFamily: 'Outfit' }}>No departments found for {selectedCorp.name}. Please contact the corporation.</div>
                  : (
                    <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {departments.map(dept => (
                          <button key={dept.id} onClick={() => setSelectedDept(dept)} style={{
                            padding: '8px 16px', borderRadius: 20,
                            border: `1.5px solid ${selectedDept?.id === dept.id ? '#B5451B' : '#E8DDD4'}`,
                            background: selectedDept?.id === dept.id ? '#FEF2F2' : 'white',
                            cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12,
                            fontWeight: selectedDept?.id === dept.id ? 600 : 400,
                            color: selectedDept?.id === dept.id ? '#B5451B' : '#8B7355',
                            transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
                          }}>
                            <Icon name="building" size={12} color={selectedDept?.id === dept.id ? '#B5451B' : '#C4B5A5'} />
                            {dept.name}
                          </button>
                        ))}
                      </div>
                      {selectedDept && (
                        <p style={{ fontFamily: 'Outfit', fontSize: 11, color: '#16A34A', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="check" size={11} color="#16A34A" />
                          Complaint will be sent to <strong>{selectedDept.name}</strong>, {selectedCorp.name}
                        </p>
                      )}
                    </>
                  )
              }
            </div>
          </div>
        )}

        {/* ── STEP 3: Details (shown after corp + dept selected) ── */}
        {selectedCorp && selectedDept && (
          <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* AI Predict + Description */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Issue Title *</label>
                  <Hint text="Keep it short and specific — e.g. 'Broken streetlight near Bus Stand'." />
                </div>
                <button onClick={predictAI} disabled={deptsLoading || departments.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: aiPredicting ? '#F0EBE3' : 'linear-gradient(135deg,#B5451B,#C9952A)', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 11, fontWeight: 600, color: aiPredicting ? '#8B7355' : 'white', flexShrink: 0, marginLeft: 10 }}>
                  <Icon name="ai" size={12} color={aiPredicting ? '#8B7355' : 'white'} />
                  {aiPredicting ? 'Analysing…' : 'AI Predict Dept'}
                </button>
              </div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the problem"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', background: 'white', marginTop: 8 }}
                onFocus={e => e.target.style.borderColor = '#C9952A'}
                onBlur={e => e.target.style.borderColor = '#E8DDD4'}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
              <Hint text="Mention since when the issue exists, how many people are affected, and any safety risk." />
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Describe the issue in detail..."
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', resize: 'vertical', background: 'white', marginTop: 8 }}
                onFocus={e => e.target.style.borderColor = '#C9952A'}
                onBlur={e => e.target.style.borderColor = '#E8DDD4'}
              />
              {aiSuggestion && (
                <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, background: '#FAF7F2', border: '1px solid rgba(232,199,106,0.5)', fontFamily: 'Outfit', fontSize: 12, color: '#8B7355', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="ai" size={13} color="#C9952A" />
                  AI suggests switching to: <strong style={{ color: '#1A1208' }}>{aiSuggestion.name}</strong>
                </div>
              )}
            </div>

            {/* Photo */}
            <div>
              <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Photo of Issue</label>
              <Hint text="Upload a clear, well-lit photo for faster review by department staff." />
              <div style={{ marginTop: 8 }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                {image ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 160 }}>
                    <img src={image} alt="issue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => setImage(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="close" size={12} color="white" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileRef.current.click()} style={{ border: '2px dashed #E8DDD4', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#FAF7F2', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#C9952A'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E8DDD4'}>
                    <Icon name="camera" size={28} color="#C4B5A5" />
                    <span style={{ fontFamily: 'Outfit', fontSize: 13, color: '#B8A898' }}>Click to upload image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: '#8B7355', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</label>
              <Hint text="Enter the nearest landmark or use Auto Detect for your current GPS coordinates." />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Street / Area / Landmark"
                  style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#C9952A'}
                  onBlur={e => e.target.style.borderColor = '#E8DDD4'}
                />
                <button onClick={detectLocation} style={{ padding: '11px 16px', borderRadius: 10, background: '#FAF7F2', border: '1.5px solid #E8DDD4', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12, color: '#8B7355', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                  <Icon name="pin" size={13} color="#C9952A" />
                  {locLoading ? 'Detecting…' : 'Auto Detect'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          width: '100%', padding: 14, borderRadius: 12,
          background: canSubmit ? 'linear-gradient(135deg,#B5451B,#C9952A)' : '#F0EBE3',
          color: canSubmit ? 'white' : '#C4B5A5',
          border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: 'Outfit', fontSize: 15, fontWeight: 600, transition: 'all 0.2s',
        }}>
          {submitting ? 'Submitting…' : !selectedCorp ? 'Select a corporation to continue' : !selectedDept ? 'Select a department to continue' : !title.trim() ? 'Add issue title to continue' : 'Submit Complaint'}
        </button>
      </div>
    </div>
  )
}

export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab]         = useState('home')
  const [complaints, setComplaints]       = useState([])
  const [complaintsLoading, setComplaintsLoading] = useState(true)
  const [selected, setSelected]           = useState(null)
  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [sidebarOpen, setSidebarOpen]     = useState(false)

  useEffect(() => {
    api.get('/complaints/citizen')
      .then(r => setComplaints(r.data.complaints || []))
      .catch(() => setComplaints([]))
      .finally(() => setComplaintsLoading(false))
  }, [])

  const filtered = useMemo(() => complaints.filter(c => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.id?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || c.status === filterStatus
    return matchSearch && matchStatus
  }), [complaints, search, filterStatus])

  const stats = useMemo(() => ({
    total:    complaints.length,
    active:   complaints.filter(c => c.status !== 'resolved').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }), [complaints])

  const addComplaint = (c) => {
    setComplaints(prev => [c, ...prev])
    setTimeout(() => setActiveTab('complaints'), 2400)
  }

  const switchTab = (tab) => { setActiveTab(tab); setSidebarOpen(false) }

  const nav = [
    { id: 'home',       label: 'Dashboard',     icon: 'home' },
    { id: 'submit',     label: 'File Complaint', icon: 'plus' },
    { id: 'complaints', label: 'My Complaints',  icon: 'list' },
    { id: 'profile',    label: 'Profile',        icon: 'user' },
  ]

  // Stat cards — each with a truly distinct shape/style
  const StatCard = ({ label, value, color, sub, variant }) => {
    // variant: 'arch' | 'skew' | 'pill'
    if (variant === 'arch') {
      // Tall card with a big arch cutout at the top
      return (
        <div style={{ background: 'white', borderRadius: '999px 999px 20px 20px', padding: '28px 20px 20px', border: `1.5px solid ${color}20`, boxShadow: `0 4px 20px ${color}12`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: color + '18', border: `2px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 22, fontWeight: 700, color }}>{value}</div>
          </div>
          <div style={{ fontFamily: 'Outfit', fontSize: 13, color: '#5A4A3A', fontWeight: 600 }}>{label}</div>
          <div style={{ fontFamily: 'Outfit', fontSize: 11, color: '#B8A898', marginTop: 2 }}>{sub}</div>
        </div>
      )
    }
    if (variant === 'skew') {
      // Parallelogram-like with a bold side slash
      return (
        <div style={{ background: `linear-gradient(135deg, white 60%, ${color}10 100%)`, borderRadius: 16, padding: '22px 20px', border: `1.5px solid ${color}25`, boxShadow: `0 4px 20px ${color}10`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 5, background: color, borderRadius: '16px 0 0 16px' }} />
          <div style={{ position: 'absolute', bottom: -14, right: -14, width: 60, height: 60, borderRadius: 12, background: color + '15', transform: 'rotate(20deg)' }} />
          <div style={{ paddingLeft: 10 }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 42, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 13, color: '#5A4A3A', marginTop: 4, fontWeight: 600 }}>{label}</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 11, color: '#B8A898', marginTop: 2 }}>{sub}</div>
          </div>
        </div>
      )
    }
    // pill — wide rounded pill shape
    return (
      <div style={{ background: color, borderRadius: 20, padding: '22px 24px', boxShadow: `0 6px 24px ${color}40`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={16} color="white" />
        </div>
        <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 42, fontWeight: 700, color: 'white', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'Outfit', fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: 'Outfit', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{sub}</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'Outfit' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E8DDD4; border-radius: 4px; }
      `}</style>

      {/* Hamburger */}
      <button onClick={() => setSidebarOpen(true)} style={{ position: 'fixed', top: 20, left: 20, zIndex: 100, width: 42, height: 42, borderRadius: 12, background: '#1A1208', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <Icon name="menu" size={18} color="rgba(255,255,255,0.8)" />
      </button>

      {/* Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }} />}

      {/* Sidebar */}
      <div style={{ width: 240, background: '#1A1208', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 201, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '8px 0 40px rgba(0,0,0,0.3)' }}>
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
            <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: 15, color: 'white' }}>Saarthi Civic</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Citizen Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <Icon name="close" size={16} color="rgba(255,255,255,0.5)" />
          </button>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => switchTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', background: activeTab === item.id ? 'rgba(181,69,27,0.25)' : 'transparent', color: activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.55)', transition: 'all 0.2s', fontFamily: 'Outfit', fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400 }}
              onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(181,69,27,0.1)' }}
              onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent' }}>
              <Icon name={item.icon} size={17} color={activeTab === item.id ? '#E8C76A' : 'rgba(255,255,255,0.55)'} />
              {item.label}
              {item.id === 'submit' && <span style={{ marginLeft: 'auto', background: '#B5451B', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20 }}>NEW</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ padding: '10px 14px', marginBottom: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{user?.email?.split('@')[0] ?? 'Citizen'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>CITIZEN</div>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13 }}>
            <Icon name="logout" size={16} color="rgba(255,255,255,0.4)" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ width: '100%', minHeight: '100vh', padding: '28px 32px 28px 80px' }}>

        {/* HOME */}
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208' }}>Welcome Back</h1>
                <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8B7355' }}>Track your complaints and report new civic issues</p>
              </div>
              <button onClick={() => switchTab('submit')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#B5451B,#C9952A)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13, fontWeight: 600 }}>
                <Icon name="plus" size={16} color="white" /> New Complaint
              </button>
            </div>

            {/* Stat cards — three distinct shapes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard label="Total Filed"  value={stats.total}    color="#1A1208" sub="All time"    variant="arch"  />
              <StatCard label="Active"       value={stats.active}   color="#D97706" sub="In progress" variant="skew"  />
              <StatCard label="Resolved"     value={stats.resolved} color="#16A34A" sub="Completed"   variant="pill"  />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.3rem', fontWeight: 700, color: '#1A1208' }}>Recent Complaints</h2>
              <button onClick={() => switchTab('complaints')} style={{ fontFamily: 'Outfit', fontSize: 12, color: '#B5451B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
            </div>
            {complaintsLoading
              ? [1,2,3].map(i => <div key={i} style={{ height: 140, background: '#F0EBE3', borderRadius: 16, marginBottom: 12, animation: 'shimmer 1.5s ease-in-out infinite' }} />)
              : complaints.length === 0
                ? <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid #F0EBE3' }}>
                    <div style={{ fontSize: 13, color: '#B8A898', marginBottom: 12 }}>No complaints filed yet</div>
                    <button onClick={() => switchTab('submit')} style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#B5451B,#C9952A)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600 }}>File your first complaint</button>
                  </div>
                : complaints.slice(0,3).map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => setSelected(c)} />)
            }
          </div>
        )}

        {/* SUBMIT */}
        {activeTab === 'submit' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <SubmitForm onSubmit={addComplaint} onBack={() => switchTab('home')} />
          </div>
        )}

        {/* MY COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Back button */}
            <button onClick={() => switchTab('home')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', marginBottom: 16, padding: 0 }}>
              <Icon name="back" size={16} color="#8B7355" /> Back
            </button>
            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208' }}>My Complaints</h1>
            <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', marginBottom: 20 }}>{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found</p>
            <div style={{ background: 'white', borderRadius: 14, padding: '14px 16px', border: '1px solid #F0EBE3', display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={14} color="#B8A898" /></div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or ID..." style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#1A1208', outline: 'none', background: '#FAF7F2' }} />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E8DDD4', fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', background: 'white', outline: 'none' }}>
                <option value="">All Statuses</option>
                {['submitted','assigned','in-progress','resolved'].map(s => <option key={s} value={s}>{ST_LABEL[s]}</option>)}
              </select>
            </div>
            {complaintsLoading
              ? [1,2,3].map(i => <div key={i} style={{ height: 140, background: '#F0EBE3', borderRadius: 16, marginBottom: 12, animation: 'shimmer 1.5s ease-in-out infinite' }} />)
              : filtered.length === 0
                ? <div style={{ textAlign: 'center', padding: 48, color: '#B8A898', fontFamily: 'Outfit', fontSize: 14 }}>No complaints found</div>
                : filtered.map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => setSelected(c)} />)
            }
          </div>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 500, animation: 'fadeIn 0.4s ease' }}>
            {/* Back button */}
            <button onClick={() => switchTab('home')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', marginBottom: 16, padding: 0 }}>
              <Icon name="back" size={16} color="#8B7355" /> Back
            </button>
            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', fontWeight: 700, color: '#1A1208', marginBottom: 6 }}>My Profile</h1>
            <p style={{ fontFamily: 'Outfit', fontSize: 13, color: '#8B7355', marginBottom: 28 }}>Your account information</p>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #F0EBE3', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid #F0EBE3' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#B5451B,#C9952A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={26} color="white" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.3rem', fontWeight: 700, color: '#1A1208' }}>Citizen</div>
                  <div style={{ fontFamily: 'Outfit', fontSize: 12, color: '#8B7355', marginTop: 2 }}>{user?.email ?? ''}</div>
                </div>
              </div>
              <div style={{ background: '#FAF7F2', borderRadius: 12, padding: '16px 18px' }}>
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1rem', fontWeight: 700, color: '#1A1208', marginBottom: 14 }}>Complaint Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {[['Filed', stats.total, '#1A1208'], ['Active', stats.active, '#D97706'], ['Resolved', stats.resolved, '#16A34A']].map(([l,v,c]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
                      <div style={{ fontFamily: 'Outfit', fontSize: 11, color: '#8B7355' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selected && <DetailModal complaint={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}