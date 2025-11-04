import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, loginApi, registerApi, logoutApi, setAuthToken, clearAuthToken } from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (saved) setAuthToken(saved)
    getMe().then(u => {
      setUser(u)
    }).catch(() => {
      setUser(null)
      clearAuthToken()
    }).finally(() => setLoading(false))
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    handleLogin: async (email, password) => {
      const { token, user } = await loginApi(email, password)
      setUser(user)
      setAuthToken(token)
      localStorage.setItem('token', token)
      return user
    },
    handleRegister: async (name, email, password) => {
      const { token, user } = await registerApi(name, email, password)
      setUser(user)
      setAuthToken(token)
      localStorage.setItem('token', token)
      return user
    },
    handleLogout: async () => {
      try { await logoutApi() } catch {}
      clearAuthToken()
      localStorage.removeItem('token')
      setUser(null)
    }
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
