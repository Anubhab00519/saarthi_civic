const { auth } = require('../config/firebase')

// ── verifyToken ───────────────────────────────────────────────────────────────
// Verifies the Firebase ID token sent in Authorization header
// Attaches decoded token (uid, role, department_id etc.) to req.user
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Access denied.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = await auth.verifyIdToken(token)
    req.user = decoded  // { uid, role, department_id, email, ... }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

// ── requireRole ───────────────────────────────────────────────────────────────
// Role guard — use after verifyToken
// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'DEPARTMENT_STAFF')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
    }
    next()
  }
}

module.exports = { verifyToken, requireRole }