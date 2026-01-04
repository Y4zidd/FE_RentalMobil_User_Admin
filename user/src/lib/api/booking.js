import { apiClient } from './client'

export const createBookingRequest = (payload) =>
  apiClient.post('/api/bookings', payload)

export const checkoutPaymentRequest = (bookingId) =>
  apiClient.post('/api/payments/checkout', { booking_id: bookingId })

export const markBookingPaidRequest = (bookingId) =>
  apiClient.post(`/api/bookings/${bookingId}/mark-paid`)

export const fetchUserBookingsRequest = () =>
  apiClient.get('/api/bookings/user')

