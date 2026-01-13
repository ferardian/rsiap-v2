import { defineStore } from 'pinia'
import { menuService, accessLevelService, pegawaiService } from '../services/menuService'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [],
    userMenus: [],
    accessLevels: [],
    loading: false,
    error: null,
    selectedMenu: null
  }),

  getters: {
    // Get menu tree structure (nested)
    menuTree: (state) => {
      // API now returns already nested structure, so we just return it directly
      return state.userMenus || []
    },

    // Get flat menu list for management
    flatMenuList: (state) => {
      return state.menus.sort((a, b) => a.urutan - b.urutan)
    },

    // Get menu by ID
    getMenuById: (state) => (id) => {
      return state.menus.find(menu => menu.id_menu === id)
    },

    // Check if user has permission for specific menu
    hasMenuPermission: (state) => (menuId, permission = 'can_view') => {
      const findMenu = (menus, id) => {
        for (const menu of menus) {
          // Use loose equality to handle string/number mismatch
          if (menu.id_menu == id) return menu
          if (menu.children && menu.children.length > 0) {
            const found = findMenu(menu.children, id)
            if (found) return found
          }
        }
        return null
      }

      const menu = findMenu(state.userMenus, menuId)
      return menu ? Boolean(menu[permission]) : false
    }
  },

  actions: {
    // Fetch all menus (for admin)
    async fetchAllMenus() {
      this.loading = true
      this.error = null

      try {
        console.log('Menu store: Calling getAllMenus...')
        const response = await menuService.getAllMenus()
        console.log('Menu store: API response:', response)
        this.menus = response.data || []
        console.log('Menu store: Menus set to:', this.menus)
        return { success: true, data: this.menus }
      } catch (error) {
        console.error('Menu store: Error details:', error)
        console.error('Menu store: Error response:', error.response)
        console.error('Menu store: Error status:', error.response?.status)
        console.error('Menu store: Error data:', error.response?.data)
        this.error = error.response?.data?.message || 'Gagal mengambil data menu'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Fetch user menus based on their role
    async fetchUserMenus() {
      this.loading = true
      this.error = null

      try {
        const response = await menuService.getUserMenus()
        this.userMenus = response.data || []
        return { success: true, data: this.userMenus }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil data menu user'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Create new menu
    async createMenu(menuData) {
      this.loading = true
      this.error = null

      try {
        const response = await menuService.createMenu(menuData)
        this.menus.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat menu'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Update menu
    async updateMenu(id, menuData) {
      this.loading = true
      this.error = null

      try {
        const response = await menuService.updateMenu(id, menuData)
        const index = this.menus.findIndex(m => m.id_menu === id)
        if (index !== -1) {
          this.menus[index] = { ...this.menus[index], ...response.data }
        }
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal update menu'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Delete menu
    async deleteMenu(id) {
      this.loading = true
      this.error = null

      try {
        await menuService.deleteMenu(id)
        this.menus = this.menus.filter(m => m.id_menu !== id)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal hapus menu'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Reorder menus
    async reorderMenus(menuOrder) {
      this.loading = true
      this.error = null

      try {
        const response = await menuService.reorderMenus(menuOrder)
        await this.fetchAllMenus() // Refresh menus
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengurutkan menu'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Clear menus
    clearMenus() {
      this.menus = []
      this.userMenus = []
      this.accessLevels = []
    },

    // Check if user has access to specific menu
    async checkAccess(menuId, permission = 'can_view') {
      try {
        const response = await menuService.checkAccess(menuId, permission)
        return response.data?.has_access || false
      } catch (error) {
        console.error('Error checking access:', error)
        return false
      }
    },

    // Set selected menu
    setSelectedMenu(menu) {
      this.selectedMenu = menu
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    loading: false,
    error: null,
    selectedRole: null
  }),

  actions: {
    async fetchAllRoles() {
      this.loading = true
      this.error = null

      try {
        console.log('🌐 Calling API: accessLevelService.getAllAccessLevels()')
        const response = await accessLevelService.getAllAccessLevels()
        console.log('📦 API Response:', response)
        this.roles = response.data || []
        console.log('💾 Store roles set to:', this.roles)
        return { success: true, data: this.roles }
      } catch (error) {
        console.error('🚨 API Error:', error)
        console.error('🚨 Error response:', error.response)
        this.error = error.response?.data?.message || 'Gagal mengambil data role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createRole(roleData) {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.createAccessLevel(roleData)
        this.roles.push(response.data)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateRole(id, roleData) {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.updateAccessLevel(id, roleData)
        const index = this.roles.findIndex(r => r.id_role === id)
        if (index !== -1) {
          this.roles[index] = { ...this.roles[index], ...response.data }
        }
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal update role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteRole(id) {
      this.loading = true
      this.error = null

      try {
        await accessLevelService.deleteAccessLevel(id)
        this.roles = this.roles.filter(r => r.id_role !== id)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal hapus role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async assignRoleToPegawai(nip, roleId, userId) {
      this.loading = true
      this.error = null

      try {
        console.log('🎭 Assigning role:', { nip, roleId, userId })
        const response = await pegawaiService.assignAccessLevelToPegawai(nip, roleId, userId)
        console.log('✅ Role assignment successful:', response)
        return { success: true, data: response.data }
      } catch (error) {
        console.error('❌ Role assignment failed:', error)
        console.error('❌ Error response:', error.response)
        this.error = error.response?.data?.message || 'Gagal menugaskan role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})

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