import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/authcontext'
import ProtectedRoute from './routes/protectedroute'

// Pages — built
import Landing    from './pages/landing'
import Login      from './pages/login'
import AdminLogin from './pages/adminlogin'

// ── Placeholder stubs ─────────────────────────────────────────────────────────
// Replace each with the real dashboard component when built.
// The ProtectedRoute wrapper + allowedRoles are already wired correctly.
function PlaceholderDashboard({ title }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: 'var(--cream)' }}>{title}</div>
      <div style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--amber)', letterSpacing: '0.12em' }}>Dashboard coming soon</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Public routes ───────────────────────────────────────────── */}
        <Route path="/"            element={<Landing />}    />
        <Route path="/login"       element={<Login />}      />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ── Protected dashboards ────────────────────────────────────── */}
        {/* Swap PlaceholderDashboard for the real component when ready   */}

        <Route
          path="/citizen-dashboard"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <PlaceholderDashboard title="Citizen Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department-dashboard"
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <PlaceholderDashboard title="Department Dashboard" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PlaceholderDashboard title="Admin Dashboard" />
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all ───────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  )
}