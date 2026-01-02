import axios from 'axios'
import apiConfig from '../config/api'

// Create axios instance
const api = axios.create({
  baseURL: apiConfig.public.API_V2_URL,
  timeout: apiConfig.requestConfig.timeout,
  headers: apiConfig.requestConfig.headers
})

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add X-Role-ID header if active role is selected
    const activeRoleJson = localStorage.getItem('active_role')
    if (activeRoleJson) {
      try {
        const activeRole = JSON.parse(activeRoleJson)
        if (activeRole && activeRole.id_role) {
          config.headers['X-Role-ID'] = activeRole.id_role
        }
      } catch (e) {
        // Ignore parsing error
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor untuk handle error
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api