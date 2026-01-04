import apiClient from './api-client'

export type Coupon = {
  id: number
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_total?: number | null
  max_uses?: number | null
  starts_at?: string | null
  expires_at?: string | null
  is_active: boolean
  used_count?: number | null
}

export async function fetchAdminCoupons(): Promise<Coupon[]> {
  const res = await apiClient.get('/api/admin/coupons')
  const data = Array.isArray(res.data) ? res.data : res.data.data || []
  return data
}

type SaveCouponPayload = {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_total?: number | undefined
  max_uses?: number | undefined
  starts_at?: string | undefined
  expires_at?: string | undefined
  is_active: boolean
}

export async function createAdminCoupon(payload: SaveCouponPayload): Promise<Coupon> {
  const res = await apiClient.post('/api/admin/coupons', payload)
  return res.data
}

export async function updateAdminCoupon(id: number, payload: SaveCouponPayload): Promise<Coupon> {
  const res = await apiClient.put(`/api/admin/coupons/${id}`, payload)
  return res.data
}

export async function deleteAdminCoupon(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/coupons/${id}`)
}

