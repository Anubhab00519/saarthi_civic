require('dotenv').config({ path: '/Users/sreyashdewanjee/Desktop/saarthi_civic/server/.env' })
const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = admin.auth()
const db   = admin.firestore()
db.settings({ preferRest: true, ignoreUndefinedProperties: true })

module.exports = { admin, auth, db }