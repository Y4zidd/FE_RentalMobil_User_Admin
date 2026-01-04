import apiClient from './api-client'

export type AdminProfile = {
  name: string
  email: string
  phone: string
  avatar_url?: string | null
}

export async function updateAdminProfile(payload: {
  name: string
  email: string
  phone: string
}): Promise<AdminProfile> {
  const response = await apiClient.put('/api/user/profile', payload)
  return response.data
}

export async function updateAdminPassword(payload: {
  current_password: string
  new_password: string
  new_password_confirmation: string
}): Promise<void> {
  await apiClient.put('/api/user/password', payload)
}

export async function updateAdminAvatar(formData: FormData): Promise<AdminProfile> {
  const response = await apiClient.post('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

