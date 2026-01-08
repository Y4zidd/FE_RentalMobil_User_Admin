import { apiClient } from './client'

export const fetchProvincesRequest = () =>
  apiClient.get('/api/regions/provinces')

export const fetchRegenciesByProvinceRequest = (provinceId) =>
  apiClient.get(`/api/regions/provinces/${provinceId}/regencies`)

