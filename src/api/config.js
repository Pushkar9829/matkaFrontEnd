export const API_URL = import.meta.env.VITE_API_URL || ''
export const apiReady = true

const TOKEN_KEY = 'matka_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (
      response.status === 401 &&
      !path.startsWith('/api/auth/login') &&
      !path.startsWith('/api/auth/admin-login') &&
      !path.startsWith('/api/auth/register')
    ) {
      setToken('')
      window.dispatchEvent(new Event('matka-auth-changed'))
    }
    throw new Error(data.message || 'Request failed.')
  }
  return data
}
