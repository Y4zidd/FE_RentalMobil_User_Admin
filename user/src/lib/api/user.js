import { apiClient } from './client'

export const fetchUserRequest = () => apiClient.get('/api/user/data')

export const updateProfileRequest = (payload) =>
  apiClient.put('/api/user/profile', payload)

export const requestEmailChangeCodeRequest = (newEmail) =>
  apiClient.post('/api/user/profile/request-email-change-code', {
    new_email: newEmail,
  })

export const confirmEmailChangeRequest = (payload) =>
  apiClient.post('/api/user/profile/confirm-email-change', payload)

export const updateRentalDetailsRequest = (payload) =>
  apiClient.put('/api/user/rental-details', payload)

export const updatePasswordRequest = (payload) =>
  apiClient.put('/api/user/password', payload)

export const uploadAvatarRequest = (formData) =>
  apiClient.post('/api/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const validateCouponRequest = (payload) =>
  apiClient.post('/api/user/coupons/validate', payload)
