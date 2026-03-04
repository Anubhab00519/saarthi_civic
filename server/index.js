require('dotenv').config()
require('./config/firebase')   // initialise Firebase Admin SDK on startup

const express = require('express')
const cors    = require('cors')

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',    // Vite dev
    /^http:\/\/192\.168\./,     // local network (mobile testing)
  ],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/admin', require('./routes/admin'))
app.use('/api/auth',  require('./routes/auth'))
app.use('/api/complaints', require('./routes/complaints'))
app.use('/api/department', require('./routes/admin'))
app.use('/api/departments', require('./routes/admin'))
// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error.' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(process.env.PORT, () => {
  console.log(`✓ Saarthi server running on http://localhost:${process.env.PORT}`)
})
