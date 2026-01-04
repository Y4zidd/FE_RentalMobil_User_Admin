import apiClient from './api-client'

type AdminUserRole = 'Admin' | 'Staff' | 'Customer'
type AdminUserStatus = 'Active' | 'Inactive'

export type AdminUser = {
  id: number
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  avatarUrl?: string
}

type UsersQuery = {
  search?: string | null
  role?: string | null
  status?: string | null
}

export async function fetchAdminUsers(params: UsersQuery): Promise<AdminUser[]> {
  const response = await apiClient.get('/api/admin/users', {
    params: {
      search: params.search || undefined,
      role: params.role ? params.role.toLowerCase() : undefined,
      status: params.status ? params.status.toLowerCase() : undefined,
    },
  })

  const raw = Array.isArray(response.data) ? response.data : response.data.data || []

  const users: AdminUser[] = raw.map((u: any) => {
    let role: AdminUserRole
    if (u.role === 'admin') {
      role = 'Admin'
    } else if (u.role === 'staff') {
      role = 'Staff'
    } else {
      role = 'Customer'
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role,
      status: u.status === 'active' ? 'Active' : 'Inactive',
      avatarUrl: u.avatar_url || '',
    }
  })

  return users
}

export async function fetchAdminUserById(id: string | number): Promise<AdminUser> {
  const response = await apiClient.get(`/api/admin/users/${id}`)
  const u = response.data

  let role: AdminUserRole
  if (u.role === 'admin') {
    role = 'Admin'
  } else if (u.role === 'customer') {
    role = 'Customer'
  } else {
    role = 'Staff'
  }

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role,
    status: u.status === 'active' ? 'Active' : 'Inactive',
    avatarUrl: u.avatar_url || '',
  }
}

type SaveAdminUserPayload = {
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  password?: string
}

export async function createAdminUser(payload: {
  name: string
  email: string
  role: string
  status: string
  password: string
}) {
  const response = await apiClient.post('/api/admin/users', payload)
  return response.data
}

export async function updateAdminUser(
  id: number | undefined,
  payload: Record<string, unknown>,
  newPassword?: string
) {
  if (!id) {
    return
  }
  const data: Record<string, unknown> = {
    ...payload,
  }
  if (newPassword) {
    data.password = newPassword
  }
  await apiClient.put(`/api/admin/users/${id}`, data)
}

export async function uploadAdminUserAvatar(
  id: number,
  formData: FormData
) {
  await apiClient.post(`/api/admin/users/${id}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function deactivateAdminUser(id: number) {
  const res = await apiClient.patch(`/api/admin/users/${id}`, {
    status: 'inactive',
  })
  return res.data
}

export async function deleteAdminUser(id: number) {
  await apiClient.delete(`/api/admin/users/${id}`)
}

