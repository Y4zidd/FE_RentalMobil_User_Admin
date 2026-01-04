import { apiClient } from './client'

export const loginRequest = (email, password) =>
  apiClient.post('/api/user/login', { email, password })

export const registerRequest = (name, email, password) =>
  apiClient.post('/api/user/register-with-verification', { name, email, password })

export const requestVerificationCode = (email) =>
  apiClient.post('/api/user/forgot-password', { email })

export const verifyEmailCode = (email, code) =>
  apiClient.post('/api/user/verify-email-code', { email, code })

export const resetPasswordWithCode = (payload) =>
  apiClient.post('/api/user/reset-password-with-code', payload)

