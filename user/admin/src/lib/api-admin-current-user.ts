import apiClient from './api-client'

export type CurrentUser = {
  name?: string | null
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  role?: string | null
}

export async function fetchCurrentAdminUser(): Promise<CurrentUser> {
  const response = await apiClient.get('/api/user/data')
  const user = response.data

  return {
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    avatarUrl: user.avatar_url ?? '',
    role: user.role ?? null,
  }
}
