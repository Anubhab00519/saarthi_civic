require('dotenv').config()
const { auth, db } = require('../config/firebase')

const admins = [
  {
    name: 'PWD Admin',
    email: 'pwd.admin@saarthi.in',
    password: 'Pwd@Admin2025',
  },
  {
    name: 'Water Admin',
    email: 'water.admin@saarthi.in',
    password: 'Water@Admin2025',
  },
  {
    name: 'Electricity Admin',
    email: 'elec.admin@saarthi.in',
    password: 'Elec@Admin2025',
  },
]

async function run() {
  console.log('── Creating ADMIN accounts ──\n')

  for (const adminUser of admins) {
    try {
      let userRecord

      // 🔍 Try to fetch existing user
      try {
        userRecord = await auth.getUserByEmail(adminUser.email)
        console.log(`  → ${adminUser.email} already exists`)
      } catch (error) {
        // Handle BOTH possible "not found" cases safely
        if (
          error.code === 'auth/user-not-found' ||
          error.message.includes('NOT_FOUND')
        ) {
          console.log(`  → ${adminUser.email} not found. Creating...`)

          userRecord = await auth.createUser({
            email: adminUser.email,
            password: adminUser.password,
            displayName: adminUser.name,
            emailVerified: true,
          })

          console.log(`  ✓ Created ${adminUser.email}`)
        } else {
          throw error
        }
      }

      // ✅ Always ensure role + Firestore profile is correct
      await auth.setCustomUserClaims(userRecord.uid, { role: 'ADMIN' })

      await db.collection('users').doc(userRecord.uid).set({
        name: adminUser.name,
        email: adminUser.email,
        role: 'ADMIN',
        is_active: true,
        created_at: new Date().toISOString(),
      })

      console.log(`  ✓ Profile synced for ${adminUser.email}`)
      console.log(`     UID: ${userRecord.uid}\n`)

    } catch (err) {
      console.error(`  ✗ Failed ${adminUser.email}`)
      console.error(`    Reason: ${err.message}\n`)
    }
  }

  console.log('── Done ──')
  console.log('Admin login URL: http://localhost:5173/admin-login\n')
  process.exit(0)
}

run()