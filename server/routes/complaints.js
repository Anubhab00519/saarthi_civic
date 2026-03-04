const router = require('express').Router()
const { auth, db } = require('../config/firebase')

async function requireAuth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'No token' })
    req.user = await auth.verifyIdToken(token)
    next()
  } catch { res.status(401).json({ message: 'Invalid token' }) }
}

// POST /api/complaints/submit
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { title, description, department_id, corporation_id, area, location, severity } = req.body
    if (!title || !department_id) return res.status(400).json({ message: 'title and department_id required' })
    if (!corporation_id) return res.status(400).json({ message: 'corporation_id required — citizen must select a corporation' })

    const deptDoc = await db.collection('departments').doc(department_id).get()
    if (!deptDoc.exists) return res.status(404).json({ message: 'Department not found' })
    const dept = deptDoc.data()

    // Safety check — department must belong to stated corporation
    if (dept.corporation_id && dept.corporation_id !== corporation_id) {
      return res.status(400).json({ message: 'Department does not belong to this corporation' })
    }

    // Get corporation name
    const corpDoc = await db.collection('corporations').doc(corporation_id).get()
    const corpName = corpDoc.exists ? corpDoc.data().name : ''

    const ref = db.collection('complaints').doc()
    const complaint = {
      title:            title.trim(),
      description:      description?.trim() || '',
      department_id,
      department_name:  dept.name,
      department_code:  dept.code,
      corporation_id,
      corporation_name: corpName,
      area:             area?.trim() || location?.trim() || '',
      location:         location?.trim() || '',
      severity:         severity || 'medium',
      status:           'pending',
      assignee:         null,
      notes:            [],
      citizen_uid:      req.user.uid,
      created_at:       new Date().toISOString(),
      updated_at:       new Date().toISOString(),
      timeline: [
        { status: 'submitted', date: new Date().toLocaleString('en-IN'), note: 'Complaint received and registered.' }
      ],
    }
    await ref.set(complaint)
    res.status(201).json({ message: 'Complaint submitted', complaint: { id: ref.id, ...complaint } })
  } catch (err) {
    console.error('[POST /complaints/submit]', err)
    res.status(500).json({ message: 'Failed to submit complaint' })
  }
})

// GET /api/complaints/my-department
// Staff sees ONLY complaints for their department (scoped by JWT claim)
router.get('/my-department', requireAuth, async (req, res) => {
  try {
    const deptId = req.user.department_id
    if (!deptId) return res.status(403).json({ message: 'No department assigned' })
    const snap = await db.collection('complaints').where('department_id', '==', deptId).get()
    const complaints = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ complaints })
  } catch (err) {
    console.error('[GET /complaints/my-department]', err)
    res.status(500).json({ message: 'Failed to fetch complaints' })
  }
})

// GET /api/complaints/citizen
router.get('/citizen', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('complaints').where('citizen_uid', '==', req.user.uid).get()
    const complaints = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ complaints })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// PATCH /api/complaints/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const ref = db.collection('complaints').doc(req.params.id)
    const doc = await ref.get()
    if (!doc.exists) return res.status(404).json({ message: 'Not found' })

    if (req.user.role === 'DEPARTMENT_STAFF' && doc.data().department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'This complaint belongs to a different department' })
    }

    const { status, assignee, notes } = req.body
    const update = { updated_at: new Date().toISOString() }
    if (status   !== undefined) update.status   = status
    if (assignee !== undefined) update.assignee = assignee
    if (notes    !== undefined) update.notes    = notes

    if (status && status !== doc.data().status) {
      const existing = doc.data().timeline || []
      update.timeline = [...existing, { status, date: new Date().toLocaleString('en-IN'), note: `Status updated to ${status}.` }]
    }

    await ref.update(update)
    res.json({ message: 'Updated', id: req.params.id })
  } catch (err) {
    console.error('[PATCH /complaints/:id]', err)
    res.status(500).json({ message: 'Failed to update' })
  }
})

// PATCH /api/complaints/bulk-resolve
router.patch('/bulk-resolve', requireAuth, async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids?.length) return res.status(400).json({ message: 'ids array required' })
    const batch = db.batch()
    ids.forEach(id => {
      batch.update(db.collection('complaints').doc(id), { status: 'resolved', updated_at: new Date().toISOString() })
    })
    await batch.commit()
    res.json({ message: `Resolved ${ids.length} complaints` })
  } catch (err) {
    res.status(500).json({ message: 'Bulk resolve failed' })
  }
})

module.exports = router