import { useState, useCallback } from 'react'
import type { AuthUser } from '../types'

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  const saveUser = useCallback((authUser: AuthUser) => {
    localStorage.setItem('access_token', authUser.access_token)
    localStorage.setItem('auth_user', JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'administrator'

  return { user, saveUser, logout, isAdmin, isAuthenticated: !!user }
}
