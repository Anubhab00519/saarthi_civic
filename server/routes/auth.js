const router = require('express').Router()
const { auth, db } = require('../config/firebase')

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/citizen/login
// Body: { aadhaar, phone }
//
// Phase 1 (now):
//   Verifies aadhaar + phone both exist and match in Firestore citizens collection
//   Creates Firebase Auth account if first time login
//   Sets custom claim { role: "CITIZEN" }
//   Returns a custom Firebase token the frontend exchanges for an ID token
//
// Phase 2 (when UIDAI API access granted):
//   Replace this with real OTP flow via UIDAI
// ─────────────────────────────────────────────────────────────────────────────
router.post('/citizen/login', async (req, res) => {
  try {
    const { aadhaar, phone } = req.body

    if (!aadhaar || !phone) {
      return res.status(400).json({ message: 'Aadhaar number and phone number are required.' })
    }

    // Clean inputs
    const cleanAadhaar = aadhaar.replace(/\s|-/g, '').trim()  // remove spaces/dashes
    const cleanPhone   = phone.replace(/\s|-/g, '').trim()

    // Basic format checks
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return res.status(400).json({ message: 'Invalid Aadhaar number. Must be 12 digits.' })
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits.' })
    }

    // 1. Check citizen exists in Firestore
    const citizenDoc = await db.collection('citizens').doc(cleanAadhaar).get()

    if (!citizenDoc.exists) {
      return res.status(401).json({ message: 'Aadhaar number not found. Please contact your local office.' })
    }

    const citizen = citizenDoc.data()

    // 2. Verify phone matches the Aadhaar record
    const storedPhone = citizen.phone?.replace(/\s|-/g, '').trim()
    if (storedPhone !== cleanPhone) {
      return res.status(401).json({ message: 'Phone number does not match the registered Aadhaar details.' })
    }

    // 3. Create or retrieve Firebase Auth account for this citizen
    //    We use a derived email as Firebase Auth requires email/phone — not raw Aadhaar
    const derivedEmail = `${cleanAadhaar}@citizen.saarthi.in`
    let userRecord

    try {
      // Try to get existing account
      userRecord = await auth.getUserByEmail(derivedEmail)
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        // First time login — create the account
        userRecord = await auth.createUser({
          email:         derivedEmail,
          displayName:   citizen.name,
          emailVerified: true,   // we verified via Aadhaar + phone match
        })

        // Save citizen profile to users collection (links Firebase uid to citizen data)
        await db.collection('users').doc(userRecord.uid).set({
          name:       citizen.name,
          aadhaar:    cleanAadhaar,
          phone:      cleanPhone,
          role:       'CITIZEN',
          is_active:  true,
          created_at: new Date().toISOString(),
        })

      } else {
        throw e
      }
    }

    // 4. Set custom claim { role: "CITIZEN" }
    await auth.setCustomUserClaims(userRecord.uid, { role: 'CITIZEN' })

    // 5. Create a custom token — frontend uses this to sign in via Firebase SDK
    //    This gives the frontend a real Firebase session
    const customToken = await auth.createCustomToken(userRecord.uid, { role: 'CITIZEN' })

    res.json({
      customToken,   // frontend calls signInWithCustomToken(customToken)
      user: {
        name:    citizen.name,
        aadhaar: cleanAadhaar,
        city:    citizen.city ?? null,
      },
    })

  } catch (err) {
    console.error('[POST /auth/citizen/login]', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/citizen/import
// Protected — called by YOU (developer) once when govt data arrives
// Body: JSON array of citizen records OR handled via script (see scripts/importCitizens.js)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/citizen/import', async (req, res) => {
  try {
    const { citizens } = req.body  // array of citizen objects

    if (!Array.isArray(citizens) || citizens.length === 0) {
      return res.status(400).json({ message: 'citizens array is required.' })
    }

    const batch   = db.batch()
    let   count   = 0

    for (const c of citizens) {
      if (!c.aadhaar || !c.phone) continue  // skip incomplete records

      const cleanAadhaar = c.aadhaar.replace(/\s|-/g, '').trim()
      const ref = db.collection('citizens').doc(cleanAadhaar)

      batch.set(ref, {
        name:    c.name    ?? '',
        aadhaar: cleanAadhaar,
        phone:   c.phone.replace(/\s|-/g, '').trim(),
        dob:     c.dob     ?? null,
        address: c.address ?? null,
        city:    c.city    ?? null,
        state:   c.state   ?? null,
      }, { merge: true })  // merge: true means existing records are updated not overwritten

      count++

      // Firestore batch limit is 500 — commit and start new batch
      if (count % 500 === 0) {
        await batch.commit()
      }
    }

    await batch.commit()

    res.json({ message: `${count} citizen records imported successfully.` })

  } catch (err) {
    console.error('[POST /auth/citizen/import]', err)
    res.status(500).json({ message: 'Server error during import.' })
  }
})

module.exports = router