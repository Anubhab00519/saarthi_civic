import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/authcontext'
import ProtectedRoute from './routes/protectedroute'

// Public pages
import Landing    from './pages/landing'
import Login      from './pages/login'
import AdminLogin from './pages/adminlogin'

// Dashboards
import AdminDashboard      from './pages/admindashboard'
import DepartmentDashboard from './pages/departmentdashboard'
import CitizenDashboard    from './pages/citizendashboard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Public */}
        <Route path="/"            element={<Landing />}    />
        <Route path="/login"       element={<Login />}      />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected dashboards */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department-dashboard"
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_STAFF']}>
              <DepartmentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen-dashboard"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  )
}