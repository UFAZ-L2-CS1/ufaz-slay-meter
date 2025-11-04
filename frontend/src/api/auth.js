import { api, setAuthToken, clearAuthToken } from './client.js'

export async function loginApi(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password })
  if (data?.token) setAuthToken(data.token)
  return data
}

export async function registerApi(name, email, password) {
  const { data } = await api.post('/api/auth/register', { name, email, password })
  if (data?.token) setAuthToken(data.token)
  return data
}

export async function getMe() {
  const { data } = await api.get('/api/auth/me')
  return data.user
}

export async function logoutApi() {
  const { data } = await api.post('/api/auth/logout')
  clearAuthToken()
  return data
}

export { setAuthToken, clearAuthToken }
