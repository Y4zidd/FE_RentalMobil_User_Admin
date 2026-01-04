import { apiClient } from './client'

export const fetchUserRequest = () => apiClient.get('/api/user/data')

