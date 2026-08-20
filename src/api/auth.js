import { apiReady, apiRequest, setToken } from './config'

export function authErrorMessage(error) {
  return error?.message || 'Something went wrong.'
}

function saveSession(data) {
  setToken(data.token)
  window.dispatchEvent(new Event('matka-auth-changed'))
  return data.user
}

export async function registerUser(mobile, mpin) {
  const digits = String(mobile).replace(/\D/g, '')
  if (digits.length < 10) throw new Error('Enter a valid 10-digit mobile number.')
  if (String(mpin).length < 6) throw new Error('MPIN must be at least 6 characters.')
  return saveSession(await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ mobile: digits, mpin }),
  }))
}

export async function loginUser(mobile, mpin) {
  return saveSession(await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, mpin }),
  }))
}

export async function loginAdmin(mobile, password) {
  return saveSession(await apiRequest('/api/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  }))
}

export async function logout() {
  setToken('')
  window.dispatchEvent(new Event('matka-auth-changed'))
}

export async function loadProfile() {
  return apiRequest('/api/auth/me')
}

export { apiReady }
