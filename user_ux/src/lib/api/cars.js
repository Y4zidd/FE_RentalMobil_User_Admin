import { apiClient } from './client'

export const fetchCarsRequest = (params) =>
  apiClient.get('/api/user/cars', { params })

