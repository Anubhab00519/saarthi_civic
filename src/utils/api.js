import axios from 'axios'

const api = axios.create({
  baseURL: '/api',                          // proxied to localhost:5000 via vite
  headers: { 'Content-Type': 'application/json' },
})

// ── Attach JWT on every request ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── On 401 → clear storage and send back to login ────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cp_token')
      localStorage.removeItem('cp_role')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api