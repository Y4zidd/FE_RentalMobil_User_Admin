import apiClient from './api-client'

export type AdminCarPreview = {
  id: number
  name: string
  licensePlate: string
  photoUrl: string
  pricePerDay: number
  status: string
}

export async function fetchAdminCarsPreview(
  limit?: number
): Promise<AdminCarPreview[]> {
  const res = await apiClient.get('/api/admin/cars')
  const raw = Array.isArray(res.data) ? res.data : res.data.data || []

  const cars: AdminCarPreview[] = raw.map((c: any) => ({
    id: c.id,
    name: c.name,
    licensePlate: c.license_plate,
    photoUrl: c.photo_url || '',
    pricePerDay: Number(c.price_per_day ?? 0),
    status: c.status || '',
  }))

  if (typeof limit === 'number') {
    return cars.slice(0, limit)
  }

  return cars
}

export async function createAdminCar(formData: FormData) {
  const res = await apiClient.post('/api/admin/cars', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export async function updateAdminCar(id: number, formData: FormData) {
  formData.append('_method', 'PUT')
  const res = await apiClient.post(`/api/admin/cars/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}

export async function deleteAdminCar(id: number) {
  await apiClient.delete(`/api/admin/cars/${id}`)
}

