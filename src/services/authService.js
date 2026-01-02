import api from './api'

export const authService = {
  // Login function
  async login(credentials) {
    try {
      const response = await api.post('/user/auth/login', {
        username: credentials.username,
        password: credentials.password
      })

      // Alternative: Using config endpoint directly
      // const response = await api.post(apiConfig.endpoints.auth.login, {
      //   username: credentials.username,
      //   password: credentials.password
      // })

      // Store token
      localStorage.setItem('access_token', response.data.access_token)

      // Get user detail
      const userDetail = await this.getUserDetail()
      localStorage.setItem('user', JSON.stringify(userDetail))

      return {
        success: true,
        data: response.data,
        user: userDetail
      }
    } catch (error) {
      let errorMessage = 'Login gagal. Silakan coba lagi.'

      if (error.response) {
        const errorData = error.response.data

        switch (error.response.status) {
          case 401:
            errorMessage = errorData.message || 'Username atau password salah'
            break
          case 422:
            errorMessage = 'Format input tidak valid'
            break
          case 429:
            errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit'
            break
          default:
            errorMessage = errorData.message || errorMessage
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  },

  // Get user detail
  async getUserDetail() {
    try {
      const response = await api.get('/user/auth/detail')
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Logout function
  async logout() {
    try {
      await api.get('/user/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Hapus data dari localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  },

  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('access_token')
    return !!token
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Get token
  getToken() {
    return localStorage.getItem('access_token')
  }
}