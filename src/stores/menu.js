import { defineStore } from 'pinia'
import { menuService } from '../services/menuService'

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
    },

    // Check if user has permission for specific route
    hasMenuPermissionByRoute: (state) => (routePath, permission = 'can_view') => {
      const findMenuByRoute = (menus, path) => {
        for (const menu of menus) {
          // Check if current menu route matches
          if (menu.route === path) return menu
          
          // Check children recursively
          if (menu.children && menu.children.length > 0) {
            const found = findMenuByRoute(menu.children, path)
            if (found) return found
          }
        }
        return null
      }

      const menu = findMenuByRoute(state.userMenus, routePath)
      
      // If super admin (determined by role name or other logic), grant all permissions
      // But here we strictly follow menu permission data from API
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
        const response = await menuService.getUserMenus({ platform: 'web' })
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