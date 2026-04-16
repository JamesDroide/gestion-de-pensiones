import { apiClient } from '@/shared/services/api'
import type { LoginCredentials, AuthUser } from '../types'

// El endpoint usa form-data (OAuth2PasswordRequestForm de FastAPI)
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const formData = new FormData()
  formData.append('username', credentials.email)
  formData.append('password', credentials.password)

  const { data } = await apiClient.post('/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return {
    name: data.name,
    role: data.role,
    access_token: data.access_token,
  }
}
