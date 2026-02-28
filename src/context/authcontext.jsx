import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const AuthContext = createContext(null)

// Redirect map — extend when dashboards are added
const ROLE_REDIRECT = {
  CITIZEN:          '/citizen-dashboard',
  DEPARTMENT_ADMIN: '/department-dashboard',
  ADMIN:            '/admin-dashboard',
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [token, setToken] = useState(() => localStorage.getItem('cp_token') ?? null)
  const [role,  setRole]  = useState(() => localStorage.getItem('cp_role')  ?? null)
  const [user,  setUser]  = useState(null)

  // ── Called by Login.jsx and AdminLogin.jsx ───────────────────────────
  const login = useCallback(async (email, password) => {
    // POST /api/auth/login  →  { token, role, user }
    const { data } = await api.post('/auth/login', { email, password })

    localStorage.setItem('cp_token', data.token)
    localStorage.setItem('cp_role',  data.role)
    setToken(data.token)
    setRole(data.role)
    setUser(data.user ?? null)

    navigate(ROLE_REDIRECT[data.role] ?? '/')
  }, [navigate])

  const logout = useCallback(() => {
    localStorage.removeItem('cp_token')
    localStorage.removeItem('cp_role')
    setToken(null)
    setRole(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>')
  return ctx
}