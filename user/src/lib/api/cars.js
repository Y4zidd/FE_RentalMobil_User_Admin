import { apiClient } from './client'

export const fetchCarsRequest = () => apiClient.get('/api/user/cars')

export const fetchAvailableCarsRequest = (params) =>
  apiClient.get('/api/user/cars', { params })

