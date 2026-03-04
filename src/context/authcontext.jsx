import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithCustomToken, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import api from '../utils/api'

const AuthContext = createContext(null)

const ROLE_REDIRECT = {
  ADMIN:            '/admin-dashboard',
  DEPARTMENT_STAFF: '/department-dashboard',
  CITIZEN:          '/citizen-dashboard',
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user,    setUser]    = useState(null)
  const [role,    setRole]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult(true)
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email })
        setRole(idTokenResult.claims.role ?? null)
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const loginWithEmail = useCallback(async (email, password) => {
    const credential    = await signInWithEmailAndPassword(auth, email, password)
    const idTokenResult = await credential.user.getIdTokenResult(true)
    navigate(ROLE_REDIRECT[idTokenResult.claims.role] ?? '/')
  }, [navigate])

  const loginCitizen = useCallback(async (aadhaar, phone) => {
    const { data }      = await api.post('/auth/citizen/login', { aadhaar, phone })
    const credential    = await signInWithCustomToken(auth, data.customToken)
    const idTokenResult = await credential.user.getIdTokenResult(true)
    navigate(ROLE_REDIRECT[idTokenResult.claims.role] ?? '/')
  }, [navigate])

  const logout = useCallback(async () => {
    await signOut(auth)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      isAuthenticated: !!user,
      loginWithEmail,
      loginCitizen,
      logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>')
  return ctx
}