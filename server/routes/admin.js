const router   = require('express').Router()
const multer   = require('multer')
const csvParse = require('csv-parse/sync')
const { auth, db } = require('../config/firebase')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.csv$/i)) return cb(new Error('Only .csv files allowed'))
    cb(null, true)
  },
})

async function requireAdmin(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'No token provided' })
    const decoded = await auth.verifyIdToken(token)
    if (decoded.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access only' })
    req.adminUid = decoded.uid
    req.user = decoded
    next()
  } catch { res.status(401).json({ message: 'Invalid or expired token' }) }
}

async function requireAuth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'No token' })
    req.user = await auth.verifyIdToken(token)
    next()
  } catch { res.status(401).json({ message: 'Invalid token' }) }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — no auth
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/corporations/list
// Returns all corporations — used by admin to pick their corporation on login
router.get('/corporations/list', async (req, res) => {
  try {
    const snap = await db.collection('corporations').get()   // no filter — avoids needing a Firestore index
    const corporations = snap.docs.map(doc => ({
      id:       doc.id,
      name:     doc.data().name,
      code:     doc.data().code,
      district: doc.data().district || '',
    }))
    corporations.sort((a, b) => a.name.localeCompare(b.name))
    res.json({ corporations })
  } catch (err) {
    console.error('[GET /admin/corporations/list]', err)
    res.status(500).json({ message: 'Failed to fetch corporations' })
  }
})

// GET /api/departments/public?corpId=kmc
// Citizen complaint form — returns departments for a specific corporation
router.get('/public', async (req, res) => {
  try {
    const { corpId } = req.query
    // Filter by corpId only — avoids needing a composite Firestore index
    let query = corpId
      ? db.collection('departments').where('corporation_id', '==', corpId)
      : db.collection('departments')
    const snap = await query.get()
    const departments = snap.docs.map(doc => ({
      id:   doc.id,
      name: doc.data().name,
      code: doc.data().code,
    }))
    departments.sort((a, b) => a.name.localeCompare(b.name))
    res.json({ departments })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch departments' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/departments?corpId=kmc
// List departments — filtered by corporation if corpId provided
router.get('/departments', requireAdmin, async (req, res) => {
  try {
    const { corpId } = req.query
    const query = corpId
      ? db.collection('departments').where('corporation_id', '==', corpId)
      : db.collection('departments')
    const snap = await query.get()
    const departments = []
    for (const doc of snap.docs) {
      const data = doc.data()
      const staffSnap = await db.collection('users')
        .where('department_id', '==', doc.id)
        .where('role', '==', 'DEPARTMENT_STAFF')
        .get()
      departments.push({
        id:              doc.id,
        name:            data.name,
        code:            data.code,
        description:     data.description || '',
        corporation_id:  data.corporation_id || '',
        corporation_name: data.corporation_name || '',
        staffCount:      staffSnap.size,
        createdAt:       data.created_at,
        is_active:       data.is_active,
      })
    }
    departments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json({ departments })
  } catch (err) {
    console.error('[GET /admin/departments]', err)
    res.status(500).json({ message: 'Failed to fetch departments' })
  }
})

// POST /api/admin/department/create
// Admin creates a department — must pass corporation_id
router.post('/department/create', requireAdmin, async (req, res) => {
  try {
    const { name, code, description, corporation_id } = req.body
    if (!name || !code) return res.status(400).json({ message: 'name and code are required' })
    if (!corporation_id) return res.status(400).json({ message: 'corporation_id is required' })

    const cleanCode = code.trim().toUpperCase()

    // Check code unique within this corporation
    const existing = await db.collection('departments')
      .where('corporation_id', '==', corporation_id)
      .where('code', '==', cleanCode)
      .get()
    if (!existing.empty) return res.status(409).json({ message: `Code "${cleanCode}" already exists in this corporation` })

    // Get corporation name to store alongside
    const corpDoc = await db.collection('corporations').doc(corporation_id).get()
    if (!corpDoc.exists) return res.status(404).json({ message: 'Corporation not found' })
    const corpName = corpDoc.data().name

    const ref = db.collection('departments').doc()
    const data = {
      name:             name.trim(),
      code:             cleanCode,
      description:      description?.trim() || '',
      corporation_id,
      corporation_name: corpName,
      created_at:       new Date().toISOString(),
      created_by:       req.adminUid,
      is_active:        true,
    }
    await ref.set(data)
    res.status(201).json({ message: 'Department created', department: { id: ref.id, ...data, staffCount: 0 } })
  } catch (err) {
    console.error('[POST /admin/department/create]', err)
    res.status(500).json({ message: 'Failed to create department' })
  }
})

// POST /api/admin/staff/upload
// Uploads staff CSV — assigns corporation_id + department_id to each staff member
router.post('/staff/upload', requireAdmin, upload.single('csv'), async (req, res) => {
  try {
    const { departmentId } = req.body
    if (!departmentId) return res.status(400).json({ message: 'departmentId is required' })
    if (!req.file)    return res.status(400).json({ message: 'CSV file is required' })

    const deptDoc = await db.collection('departments').doc(departmentId).get()
    if (!deptDoc.exists) return res.status(404).json({ message: 'Department not found' })
    const deptData = deptDoc.data()
    const corporation_id   = deptData.corporation_id   || ''
    const corporation_name = deptData.corporation_name || ''

    let rows
    try {
      rows = csvParse.parse(req.file.buffer.toString('utf-8'), { columns: true, skip_empty_lines: true, trim: true })
    } catch (e) {
      return res.status(400).json({ message: 'Invalid CSV: ' + e.message })
    }

    if (rows.length === 0) return res.status(400).json({ message: 'CSV is empty' })

    const normalizedRows = rows.map(row => {
      const out = {}
      for (const [k, v] of Object.entries(row)) out[k.trim().toLowerCase()] = (v || '').trim()
      return out
    })

    for (const col of ['name', 'email', 'password']) {
      if (!(col in normalizedRows[0])) {
        return res.status(400).json({ message: `CSV missing required column: "${col}"` })
      }
    }

    const results = { created: 0, skipped: 0, errors: [] }

    for (const row of normalizedRows) {
      const { name, email, password } = row
      if (!email || !password) { results.errors.push(`Missing email/password for: ${name||'unknown'}`); results.skipped++; continue }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { results.errors.push(`Invalid email: ${email}`); results.skipped++; continue }
      try {
        try {
          await auth.getUserByEmail(email)
          results.skipped++
          continue
        } catch (e) {
          if (e.code !== 'auth/user-not-found') throw e
        }
        const userRecord = await auth.createUser({ email, password, displayName: name || '', emailVerified: true })
        // JWT claims — both corporation_id AND department_id so staff is fully scoped
        await auth.setCustomUserClaims(userRecord.uid, {
          role:           'DEPARTMENT_STAFF',
          corporation_id,
          department_id:  departmentId,
        })
        await db.collection('users').doc(userRecord.uid).set({
          name:             name || '',
          email,
          role:             'DEPARTMENT_STAFF',
          corporation_id,
          corporation_name,
          department_id:    departmentId,
          department_name:  deptData.name,
          department_code:  deptData.code,
          is_active:        true,
          created_at:       new Date().toISOString(),
          created_by:       req.adminUid,
        })
        results.created++
        console.log(`[staff/upload] Created ${email} → ${deptData.name} (${corporation_id})`)
      } catch (e) {
        results.errors.push(`Failed for ${email}: ${e.message}`)
        results.skipped++
      }
    }

    res.json({ message: 'Upload complete', created: results.created, skipped: results.skipped, errors: results.errors, total: normalizedRows.length })
  } catch (err) {
    console.error('[POST /admin/staff/upload]', err)
    res.status(500).json({ message: 'Upload failed: ' + err.message })
  }
})

// GET /api/admin/staff?corpId=kmc
router.get('/staff', requireAdmin, async (req, res) => {
  try {
    const { corpId } = req.query
    let query = db.collection('users').where('role', '==', 'DEPARTMENT_STAFF')
    if (corpId) query = query.where('corporation_id', '==', corpId)
    const snap = await query.get()
    const staff = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    staff.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ staff })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch staff' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT STAFF ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/department/my-info
router.get('/my-info', requireAuth, async (req, res) => {
  try {
    const deptId = req.user.department_id
    if (!deptId) return res.status(403).json({ message: 'No department assigned to this account' })
    const deptDoc = await db.collection('departments').doc(deptId).get()
    if (!deptDoc.exists) return res.status(404).json({ message: 'Department not found' })
    res.json({ department: { id: deptDoc.id, ...deptDoc.data() } })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

// GET /api/department/my-staff
router.get('/my-staff', requireAuth, async (req, res) => {
  try {
    const deptId = req.user.department_id
    if (!deptId) return res.status(403).json({ message: 'No department' })
    const snap = await db.collection('users')
      .where('department_id', '==', deptId)
      .where('role', '==', 'DEPARTMENT_STAFF')
      .get()
    const staff = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name, email: doc.data().email }))
    res.json({ staff })
  } catch (err) {
    res.status(500).json({ message: 'Failed' })
  }
})

module.exports = router