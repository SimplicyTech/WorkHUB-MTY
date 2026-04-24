import { apiRequest } from './api'

export const getDashboardRequest = async () => {
  return await apiRequest('/dashboard')
}