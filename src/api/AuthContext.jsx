import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getToken } from './config'
import { loadProfile, logout as apiLogout } from './auth'

const AuthContext = createContext(null)

function toUser(profile) {
  if (!profile) return null
  return { uid: profile.uid || profile.id, email: profile.email || '' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!getToken()) {
      setUser(null)
      setProfile(null)
      return null
    }
    const next = await loadProfile()
    setProfile(next)
    setUser(toUser(next))
    return next
  }

  useEffect(() => {
    function onChange() {
      refresh().catch(() => {
        setUser(null)
        setProfile(null)
      }).finally(() => setLoading(false))
    }
    onChange()
    window.addEventListener('matka-auth-changed', onChange)
    return () => window.removeEventListener('matka-auth-changed', onChange)
  }, [])

  useEffect(() => {
    if (!user?.uid) return undefined
    const timer = setInterval(() => {
      refresh().catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [user?.uid])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      ready: true,
      isAdmin: profile?.role === 'admin',
      refresh,
      logout: async () => {
        await apiLogout()
        setUser(null)
        setProfile(null)
      },
    }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
