export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id?: number
  name: string
  role: 'administrator' | 'cashier'
  access_token: string
}
