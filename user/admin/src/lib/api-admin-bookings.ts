import apiClient from './api-client'

export type BookingRow = {
  id: number
  customerName: string
  customerEmail: string
  carName: string
  pickupDate: string
  returnDate: string
  totalPrice: number
  paymentMethod: string
  status: string
}

export async function fetchAdminBookings(): Promise<BookingRow[]> {
  const res = await apiClient.get('/api/admin/bookings')
  const raw = Array.isArray(res.data) ? res.data : res.data.data || []

  const mapped: BookingRow[] = raw.map((b: any) => ({
    id: b.id,
    customerName: b.user?.name || 'Unknown',
    customerEmail: b.user?.email || '',
    carName: b.car
      ? `${b.car.brand ?? ''} ${b.car.model ?? ''}`.trim() ||
        b.car.name ||
        'Unknown car'
      : 'Unknown car',
    pickupDate: b.pickup_date,
    returnDate: b.return_date,
    totalPrice: Number(b.total_price ?? 0),
    paymentMethod: b.payment_method,
    status: b.status,
  }))

  return mapped
}

export async function updateAdminBookingStatus(id: number, status: string) {
  const res = await apiClient.put(`/api/admin/bookings/${id}`, { status })
  return res.data
}

export async function cleanupOverdueBookings(): Promise<{ updated: number }> {
  const res = await apiClient.post('/api/admin/bookings/cleanup-overdue')
  return res.data
}
