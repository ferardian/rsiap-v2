import { defineStore } from 'pinia'
import { authService } from '../services/authService'
import { pegawaiService } from '../services/menuService'
import { useMenuStore } from './menu'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    activeRole: null, // Currently selected role
    userRoles: [], // All available roles for the user
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    hasRoleSelected: (state) => !!state.activeRole,
    userName: (state) => {
      // Check multiple possible paths for user name
      return state.user?.detail?.nama ||
        state.user?.data?.detail?.nama ||
        state.user?.nama ||
        state.user?.name ||
        'User'
    },
    userRole: (state) => state.activeRole?.nama_role || state.user?.detail?.role || 'guest',
    userPosition: (state) => state.user?.detail?.jbtn || '-',
    userDepartment: (state) => {
      return state.user?.detail?.departemen ||
        state.user?.data?.detail?.departemen ||
        state.user?.departemen ||
        '-'
    }
  },

  actions: {
    // Initialize auth state from localStorage
    initAuth() {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      const activeRole = localStorage.getItem('active_role')
      const userRoles = localStorage.getItem('user_roles')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        if (activeRole) this.activeRole = JSON.parse(activeRole)
        if (userRoles) this.userRoles = JSON.parse(userRoles)
      }
    },

    // Login action
    async login(credentials) {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.login(credentials)

        if (result.success) {
          this.token = result.data.access_token
          this.user = result.user

          // Fetch user roles
          try {
            // Fix: Gunakan akses yang lebih robust (handle wrapping .data dan key .nik/.nip)
            const userObj = result.user?.data || result.user
            const detail = userObj?.detail
            const userNip = detail?.nik || detail?.nip || userObj?.id_user

            if (!userNip) {
              console.error('Cannot find NIK/NIP in user object:', result.user)
            }

            const rolesResponse = await pegawaiService.getPegawaiAccessLevels(userNip)
            this.userRoles = rolesResponse.data || []
            localStorage.setItem('user_roles', JSON.stringify(this.userRoles))
          } catch (roleError) {
            console.error('Failed to fetch user roles:', roleError)
            this.userRoles = []
          }

          // Role selection logic
          if (this.userRoles.length === 1) {
            // If only one role, select it automatically
            await this.selectRole(this.userRoles[0])
            return { success: true, requireRoleSelection: false }
          } else if (this.userRoles.length > 1) {
            // If multiple roles, require selection
            return { success: true, requireRoleSelection: true }
          } else {
            // Jika tidak ada role ditemukan
            this.user = null
            this.token = null
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')

            return {
              success: false,
              error: 'Akun Anda tidak memiliki Role Akses yang aktif. Silakan hubungi IT.'
            }
          }
        } else {
          this.error = result.error
          return { success: false, error: result.error }
        }
      } catch (error) {
        this.error = 'Terjadi kesalahan yang tidak terduga'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Select active role
    async selectRole(role) {
      this.activeRole = role
      localStorage.setItem('active_role', JSON.stringify(role))

      // Fetch menus for the selected role
      const menuStore = useMenuStore()
      // We might need to pass the role ID to fetchUserMenus if the backend supports it
      // For now, assuming backend uses the active role context or we pass it
      // If backend logic isn't updated yet, it might still return default menus
      await menuStore.fetchUserMenus()
    },

    // Logout action
    async logout() {
      this.isLoading = true

      try {
        await authService.logout()
      } finally {
        this.user = null
        this.token = null
        this.activeRole = null
        this.userRoles = []
        this.error = null
        this.isLoading = false

        localStorage.removeItem('active_role')
        localStorage.removeItem('user_roles')

        // Clear menu data
        const menuStore = useMenuStore()
        menuStore.clearMenus()
      }
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})