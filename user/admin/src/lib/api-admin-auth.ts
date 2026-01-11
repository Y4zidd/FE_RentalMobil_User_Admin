import apiClient from './api-client'

type LoginPayload = {
  email: string
  password: string
}

export async function adminLogin(payload: LoginPayload) {
  const response = await apiClient.post('/api/admin/login', payload)
  return response.data
}

export async function adminLogout() {
  await apiClient.post('/api/admin/logout')
}

export async function fetchUserProfile() {
  const response = await apiClient.get('/api/user/data')
  return response.data
}

