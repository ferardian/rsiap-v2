import { defineStore } from 'pinia'
import { accessLevelService, pegawaiService } from '../services/menuService'

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
    userRoles: [],
    pegawai: [],
    loading: false,
    error: null,
    selectedRole: null
  }),

  getters: {
    // Get roles with user count
    rolesWithUserCount: (state) => {
      return state.roles.map(role => ({
        ...role,
        user_count: state.userRoles.filter(ur => ur.id_role === role.id_role).length,
        menu_count: role.menu_count || role.menus?.length || 0
      }))
    },

    // Get role by ID
    getRoleById: (state) => (id) => {
      return state.roles.find(role => role.id_role === id)
    },

    // Get users in specific role
    getUsersInRole: (state) => (roleId) => {
      const userRoleIds = state.userRoles
        .filter(ur => ur.id_role === roleId)
        .map(ur => ur.nip)

      return state.pegawai.filter(pegawai => userRoleIds.includes(pegawai.nip))
    },

    // Get pegawai not in role
    getPegawaiNotInRole: (state) => (roleId) => {
      const userRoleIds = state.userRoles
        .filter(ur => ur.id_role === roleId)
        .map(ur => ur.nip)

      return state.pegawai.filter(pegawai => !userRoleIds.includes(pegawai.nip))
    }
  },

  actions: {
    // Fetch all roles
    async fetchAllRoles(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.getAllAccessLevels(params)
        this.roles = response.data || []
        return { success: true, data: this.roles }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil data role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Fetch roles with pegawai data
    async fetchRolesWithPegawai() {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.getAccessLevelsWithPegawai()
        this.roles = response.data || []
        return { success: true, data: this.roles }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil data role dengan pegawai'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Create new role
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

    // Update role
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

    // Delete role
    async deleteRole(id) {
      this.loading = true
      this.error = null

      try {
        await accessLevelService.deleteAccessLevel(id)
        this.roles = this.roles.filter(r => r.id_role !== id)
        // Also remove user roles for this role
        this.userRoles = this.userRoles.filter(ur => ur.id_role !== id)
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal hapus role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Get role detail
    async getRole(id) {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.getAccessLevel(id)
        this.selectedRole = response.data
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil detail role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Get role permissions
    async getRolePermissions(roleId) {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.getAccessLevelPermissions(roleId)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil permissions role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Update role permissions
    async updateRolePermissions(roleId, permissions) {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.updateAccessLevelPermissions(roleId, permissions)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal update permissions role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Fetch all user roles
    async fetchAllUserRoles() {
      this.loading = true
      this.error = null

      try {
        const response = await accessLevelService.getAllUserAccess()
        this.userRoles = response.data || []
        return { success: true, data: this.userRoles }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil data user role'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Fetch all pegawai
    async fetchAllPegawai(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await pegawaiService.getAllPegawai(params)
        // Handle both direct array and paginated response (Laravel paginate wraps data in data)
        const responseData = response.data
        if (Array.isArray(responseData)) {
          this.pegawai = responseData
        } else if (responseData && Array.isArray(responseData.data)) {
          this.pegawai = responseData.data
        } else {
          this.pegawai = []
        }

        return { success: true, data: this.pegawai }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil data pegawai'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Assign role to pegawai
    async assignRoleToPegawai(nip, accessLevelId, userId) {
      this.loading = true
      this.error = null

      try {
        const response = await pegawaiService.assignAccessLevelToPegawai(nip, accessLevelId, userId)

        // Add to userRoles if not exists
        const exists = this.userRoles.find(ur => ur.nip === nip && ur.id_role === accessLevelId)
        if (!exists) {
          this.userRoles.push({
            nip: nip,
            id_role: accessLevelId,
            user_id: userId
          })
        }

        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal assign role ke pegawai'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Remove role from pegawai
    async removeRoleFromPegawai(nip, accessLevelId) {
      this.loading = true
      this.error = null

      try {
        await pegawaiService.removeAccessLevelFromPegawai(nip, accessLevelId)

        // Remove from userRoles
        this.userRoles = this.userRoles.filter(ur => !(ur.nip === nip && ur.id_role === accessLevelId))

        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal hapus role dari pegawai'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Get pegawai roles
    async getPegawaiRoles(nip) {
      this.loading = true
      this.error = null

      try {
        const response = await pegawaiService.getPegawaiAccessLevels(nip)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengambil role pegawai'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Search pegawai
    async searchPegawai(query, params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await pegawaiService.searchPegawai(query, params)
        return { success: true, data: response.data || [] }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mencari pegawai'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    // Set selected role
    setSelectedRole(role) {
      this.selectedRole = role
    },

    // Clear roles
    clearRoles() {
      this.roles = []
      this.userRoles = []
      this.pegawai = []
      this.selectedRole = null
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})