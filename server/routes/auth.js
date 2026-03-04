const router = require('express').Router()
const { auth, db } = require('../config/firebase')

// POST /api/auth/citizen/login
// Body: { aadhaar, phone }
router.post('/citizen/login', async (req, res) => {
  try {
    const { aadhaar, phone } = req.body

    if (!aadhaar || !phone) {
      return res.status(400).json({ message: 'Aadhaar number and phone number are required.' })
    }

    // Clean inputs
    const cleanAadhaar = aadhaar.replace(/\s|-/g, '').trim()
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

    // 2. Verify phone matches
    const storedPhone = citizen.phone?.replace(/\s|-/g, '').trim()
    if (storedPhone !== cleanPhone) {
      return res.status(401).json({ message: 'Phone number does not match the registered Aadhaar details.' })
    }

    // 3. Create or retrieve Firebase Auth account
    const derivedEmail = `${cleanAadhaar}@citizen.saarthi.in`
    let userRecord

    try {
      userRecord = await auth.getUserByEmail(derivedEmail)
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email:         derivedEmail,
          emailVerified: true,
        })

        await db.collection('users').doc(userRecord.uid).set({
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

    // 4. Set custom claim
    await auth.setCustomUserClaims(userRecord.uid, { role: 'CITIZEN' })

    // 5. Create custom token
    const customToken = await auth.createCustomToken(userRecord.uid, { role: 'CITIZEN' })

    res.json({
      customToken,
      user: {
        aadhaar: cleanAadhaar,
      },
    })

  } catch (err) {
    console.error('[POST /auth/citizen/login]', err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

module.exports = router