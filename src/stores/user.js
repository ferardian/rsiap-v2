import { defineStore } from 'pinia'
import { pegawaiService } from '../services/menuService'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
    selectedUser: null
  }),

  actions: {
    async fetchAllUsers() {
      this.loading = true
      this.error = null

      try {
        console.log('🌐 Calling API: pegawaiService.getAllPegawai()')
        // Fetch with high limit to support client-side filtering
        const response = await pegawaiService.getAllPegawai({ limit: 1000 })
        console.log('📦 API Response:', response)
        this.users = response.data || []
        console.log('💾 Store users set to:', this.users)

        // Handle pagination structure if present
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          this.users = response.data.data
        }

        console.log('🔍 About to call enrichUsersWithRoles...')

        // Fetch roles for each user
        console.log('🚀 Calling enrichUsersWithRoles...')
        await this.enrichUsersWithRoles()
        console.log('✅ enrichUsersWithRoles completed')

        return { success: true, data: this.users }
      } catch (error) {
        console.error('🚨 API Error:', error)
        console.error('🚨 Error response:', error.response)
        this.error = error.response?.data?.message || 'Gagal mengambil data user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async enrichUsersWithRoles() {
      try {
        console.log('🎭 Using backend LEFT JOIN role data')
        console.log('ℹ️  Backend PegawaiController now provides complete role data via LEFT JOIN')

        // The backend PegawaiController now uses LEFT JOIN to include role data
        // No need for individual API calls - role data is included in main response
        // This eliminates rate limiting issues and provides instant results

        console.log('✅ Role data already included in backend response')
      } catch (error) {
        console.error('❌ Error in enrichUsersWithRoles:', error)
      }
    },

    async createUser(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await pegawaiService.createPegawai(userData)
        this.users.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateUser(id, userData) {
      this.loading = true
      this.error = null

      try {
        const response = await pegawaiService.updatePegawai(id, userData)
        const index = this.users.findIndex(u => u.id_user === id)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...response.data }
        }
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal update user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id) {
      this.loading = true
      this.error = null

      try {
        await pegawaiService.deletePegawai(id)
        this.users = this.users.filter(u => u.id_user !== id)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal hapus user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})
