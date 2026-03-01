const router = require('express').Router()
const multer = require('multer')
const XLSX   = require('xlsx')
const { auth, db } = require('../config/firebase')
const { verifyToken, requireRole } = require('../middleware/verifyToken')

// Multer — memory storage, Excel + CSV files, 5MB max
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'application/octet-stream', // some OS sends this for .csv
    ]
    const ext = file.originalname.split('.').pop().toLowerCase()
    if (allowed.includes(file.mimetype) || ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      cb(null, true)
    } else {
      cb(new Error('Only Excel (.xlsx / .xls) or CSV files are allowed.'))
    }
  },
})

// All routes require a valid Firebase token with role = ADMIN
router.use(verifyToken, requireRole('ADMIN'))


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/departments
// ─────────────────────────────────────────────────────────────────────────────
router.get('/departments', async (req, res) => {
  try {
    const snapshot = await db.collection('departments').get()

    const departments = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(d => d.is_active === true)
      .sort((a, b) => a.name.localeCompare(b.name))

    res.json({ departments })

  } catch (err) {
    console.error('[GET /admin/departments]', err)
    res.status(500).json({ message: 'Server error.' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/department/create
// Body: { name, code, city, state }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/department/create', async (req, res) => {
  try {
    const { name, code, city, state } = req.body

    if (!name || !code || !city || !state) {
      return res.status(400).json({ message: 'name, code, city and state are all required.' })
    }

    // Check if department code already exists
    const existing = await db.collection('departments').get()
    const duplicate = existing.docs.find(doc =>
      doc.data().code === code.toUpperCase().trim()
    )

    if (duplicate) {
      return res.status(409).json({ message: `Department with code "${code}" already exists.` })
    }

    const deptRef = await db.collection('departments').add({
      name:       name.trim(),
      code:       code.toUpperCase().trim(),
      city:       city.trim(),
      state:      state.trim(),
      is_active:  true,
      created_by: req.user.uid,
      created_at: new Date().toISOString(),
    })

    console.log(`[DEPT CREATED] ${name} (${code}) by ${req.user.uid}`)

    res.status(201).json({
      message: `Department "${name}" created successfully.`,
      department: { id: deptRef.id, name, code: code.toUpperCase(), city, state },
    })

  } catch (err) {
    console.error('[POST /admin/department/create]', err)
    res.status(500).json({ message: 'Server error.' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/staff/upload
// Body: multipart/form-data { file: <Excel or CSV>, department_id }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/staff/upload', upload.single('file'), async (req, res) => {
  try {
    const { department_id } = req.body

    if (!department_id) {
      return res.status(400).json({ message: 'department_id is required.' })
    }

    // Verify department exists
    const deptDoc = await db.collection('departments').doc(department_id).get()
    if (!deptDoc.exists) {
      return res.status(404).json({ message: 'Department not found.' })
    }
    const department = { id: deptDoc.id, ...deptDoc.data() }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' })
    }

    // Parse Excel or CSV
    const ext = req.file.originalname.split('.').pop().toLowerCase()
    let rows = []

    if (ext === 'csv') {
      // Parse CSV using XLSX (it handles CSV too)
      const workbook = XLSX.read(req.file.buffer.toString('utf8'), { type: 'string' })
      const sheet    = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet)
    } else {
      // Parse Excel
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
      const sheet    = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet)
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: 'File is empty or has no valid rows.' })
    }

    console.log(`[STAFF UPLOAD] ${rows.length} rows from file for dept: ${department.name}`)

    const created = []
    const skipped = []

    for (const [index, row] of rows.entries()) {
      const rowNum = index + 2

      // Normalize all keys to lowercase
      const r = {}
      for (const key of Object.keys(row)) {
        r[key.toLowerCase().trim()] = typeof row[key] === 'string'
          ? row[key].trim()
          : String(row[key]).trim()
      }

      const { name, email, phone = null, designation = null } = r

      if (!name || !email) {
        skipped.push({ row: rowNum, reason: 'Missing name or email', data: r })
        continue
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        skipped.push({ row: rowNum, reason: 'Invalid email format', email })
        continue
      }

      // Check if email already registered
      try {
        await auth.getUserByEmail(email.toLowerCase())
        skipped.push({ row: rowNum, reason: 'Email already registered', email })
        continue
      } catch (e) {
        if (e.code !== 'auth/user-not-found') {
          skipped.push({ row: rowNum, reason: 'Error checking email', email })
          continue
        }
      }

      // Create Firebase Auth user
      const tempPassword = `Staff@${Math.floor(1000 + Math.random() * 9000)}`

      const userRecord = await auth.createUser({
        email:         email.toLowerCase(),
        password:      tempPassword,
        displayName:   name,
        emailVerified: false,
      })

      // Set custom claims — role + department_id
      // This is what enforces department isolation on login
      await auth.setCustomUserClaims(userRecord.uid, {
        role:          'DEPARTMENT_STAFF',
        department_id: department_id,
      })

      // Save to Firestore users collection
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email:                email.toLowerCase(),
        phone:                phone !== 'null' ? phone : null,
        designation:          designation !== 'null' ? designation : null,
        role:                 'DEPARTMENT_STAFF',
        department_id,
        department_name:      department.name,
        department_code:      department.code,
        is_active:            true,
        must_change_password: true,
        created_by:           req.user.uid,
        created_at:           new Date().toISOString(),
      })

      console.log(`[STAFF CREATED] ${email} → dept: ${department.name}`)

      created.push({
        uid:         userRecord.uid,
        name,
        email:       email.toLowerCase(),
        phone,
        designation,
        tempPassword,
      })
    }

    res.status(201).json({
      message:    `Upload complete. ${created.length} accounts created, ${skipped.length} skipped.`,
      department: { id: department.id, name: department.name },
      summary:    { total: rows.length, created: created.length, skipped: skipped.length },
      created,
      skipped,
    })

  } catch (err) {
    console.error('[POST /admin/staff/upload]', err)
    res.status(500).json({ message: err.message ?? 'Server error during upload.' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/staff?department_id=xxx
// ─────────────────────────────────────────────────────────────────────────────
router.get('/staff', async (req, res) => {
  try {
    const { department_id } = req.query

    const snapshot = await db.collection('users').get()

    const staff = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(d =>
        d.role === 'DEPARTMENT_STAFF' &&
        (!department_id || d.department_id === department_id)
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    res.json({ count: staff.length, staff })

  } catch (err) {
    console.error('[GET /admin/staff]', err)
    res.status(500).json({ message: 'Server error.' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/staff/:uid/deactivate
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/staff/:uid/deactivate', async (req, res) => {
  try {
    const { uid } = req.params

    await auth.updateUser(uid, { disabled: true })
    await db.collection('users').doc(uid).update({ is_active: false })

    res.json({ message: 'Staff account deactivated successfully.' })

  } catch (err) {
    console.error('[PATCH /admin/staff/deactivate]', err)
    res.status(500).json({ message: 'Server error.' })
  }
})

module.exports = router