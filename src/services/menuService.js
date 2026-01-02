import api from './api'

export const menuService = {
  // Get all menus (for admin)
  async getAllMenus(params = {}) {
    const response = await api.get('/menu-management/menus', { params })
    return response.data
  },

  // Get menu tree structure
  async getMenuTree(params = {}) {
    const response = await api.get('/menu-management/menus/tree', { params })
    return response.data
  },

  // Get user menus based on their access level
  async getUserMenus() {
    const response = await api.get('/menu-management/user-menus')
    return response.data
  },

  // Create new menu
  async createMenu(menuData) {
    const response = await api.post('/menu-management/menus', menuData)
    return response.data
  },

  // Get menu detail
  async getMenu(id) {
    const response = await api.get(`/menu-management/menus/${id}`)
    return response.data
  },

  // Update menu
  async updateMenu(id, menuData) {
    const response = await api.put(`/menu-management/menus/${id}`, menuData)
    return response.data
  },

  // Delete menu
  async deleteMenu(id) {
    const response = await api.delete(`/menu-management/menus/${id}`)
    return response.data
  },

  // Reorder menus
  async reorderMenus(menuOrder) {
    const response = await api.post('/menu-management/menus/reorder', { menu_order: menuOrder })
    return response.data
  },

  // Check if user has access to specific menu
  async checkAccess(menuId, permission = 'can_view') {
    const response = await api.post('/menu-management/role-permissions/check-access', {
      menu_id: menuId,
      permission: permission
    })
    return response.data
  },

  // Role-Menu Permission Management
  async getRoleMenuSummary() {
    const response = await api.get('/menu-management/role-permissions/summary')
    return response.data
  },

  async getRolePermissions(roleId) {
    const response = await api.get(`/menu-management/role-permissions/role/${roleId}`)
    return response.data
  },

  async getRoleMenuDetails(roleId) {
    const response = await api.get(`/menu-management/role-permissions/role/${roleId}/details`)
    return response.data
  },

  async updateRolePermissions(roleId, permissions) {
    const response = await api.post(`/menu-management/role-permissions/role/${roleId}`, {
      permissions: permissions
    })
    return response.data
  },

  async copyRolePermissions(sourceRoleId, targetRoleId) {
    const response = await api.post('/menu-management/role-permissions/copy', {
      source_role_id: sourceRoleId,
      target_role_id: targetRoleId
    })
    return response.data
  },

  async checkUserAccess(menuId, permission, userId = null) {
    const requestData = {
      menu_id: menuId,
      permission: permission
    }

    if (userId) {
      requestData.user_id = userId
    }

    const response = await api.post('/menu-management/role-permissions/check-access', requestData)
    return response.data
  }
}

export const accessLevelService = {
  // Get all access levels (roles)
  async getAllAccessLevels(params = {}) {
    const response = await api.get('/user-management/roles', { params })
    return response.data
  },

  // Get access level with pegawai data
  async getAccessLevelsWithPegawai() {
    const response = await api.get('/user-management/roles/with-petugas')
    return response.data
  },

  // Get all user-access assignments
  async getAllUserAccess() {
    const response = await api.get('/user-management/user-access')
    return response.data
  },

  // Create new access level
  async createAccessLevel(accessLevelData) {
    const response = await api.post('/user-management/roles', accessLevelData)
    return response.data
  },

  // Get access level detail
  async getAccessLevel(id) {
    const response = await api.get(`/user-management/roles/${id}`)
    return response.data
  },

  // Update access level
  async updateAccessLevel(id, accessLevelData) {
    const response = await api.put(`/user-management/roles/${id}`, accessLevelData)
    return response.data
  },

  // Delete access level
  async deleteAccessLevel(id) {
    const response = await api.delete(`/user-management/roles/${id}`)
    return response.data
  },

  // Get access level permissions
  async getAccessLevelPermissions(accessLevelId) {
    const response = await api.get(`/user-management/roles/${accessLevelId}/permissions`)
    return response.data
  },

  // Update access level permissions
  async updateAccessLevelPermissions(accessLevelId, permissions) {
    const response = await api.post(`/user-management/roles/${accessLevelId}/permissions`, { permissions })
    return response.data
  },

  // Assign role to user
  async assignRoleToUser(userData) {
    const response = await api.post('/user-management/user-access/assign', userData)
    return response.data
  },

  // Remove role from user
  async removeRoleFromUser(nip, roleId) {
    const response = await api.delete(`/user-management/user-access/${nip}/role/${roleId}`)
    return response.data
  }
}

export const pegawaiService = {
  // Get all pegawai
  async getAllPegawai(params = {}) {
    const response = await api.get('/user-management/pegawai', { params })
    return response.data
  },

  // Get pegawai detail
  async getPegawai(nip) {
    const response = await api.get(`/user-management/pegawai/${nip}`)
    return response.data
  },

  // Search pegawai
  async searchPegawai(query, params = {}) {
    const response = await api.get('/user-management/pegawai/search', {
      params: { q: query, ...params }
    })
    return response.data
  },

  // Get pegawai statistics
  async getPegawaiStatistics() {
    const response = await api.get('/user-management/pegawai/statistics')
    return response.data
  },

  // Assign access level to pegawai
  async assignAccessLevelToPegawai(nip, accessLevelId, userId) {
    const requestData = {
      nip: nip,
      access_level_id: parseInt(accessLevelId),
      user_id: parseInt(userId)
    }

    console.log('🔍 Sending role assignment request:', requestData)

    try {
      const response = await api.post(`/user-management/pegawai/${nip}/role/assign`, {
        access_level_id: parseInt(accessLevelId),
        user_id: userId // Do not parse INT, as valid NIP/USER_ID can be string
      })

      console.log('✅ Role assignment response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Role assignment error:', error)
      console.error('❌ Error response:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      throw error
    }
  },

  // Remove access level from pegawai
  async removeAccessLevelFromPegawai(nip, accessLevelId) {
    const response = await api.delete(`/user-management/pegawai/${nip}/role/${accessLevelId}`)
    return response.data
  },

  // Get pegawai access levels
  async getPegawaiAccessLevels(nip) {
    const response = await api.get(`/user-management/pegawai/${nip}/roles`)
    return response.data
  },

  // Create new pegawai
  async createPegawai(pegawaiData) {
    const response = await api.post('/user-management/pegawai', pegawaiData)
    return response.data
  },

  // Update pegawai
  async updatePegawai(nip, pegawaiData) {
    const response = await api.put(`/user-management/pegawai/${nip}`, pegawaiData)
    return response.data
  },

  // Delete pegawai
  async deletePegawai(nip) {
    const response = await api.delete(`/user-management/pegawai/${nip}`)
    return response.data
  },
}

export default {
  menu: menuService,
  accessLevel: accessLevelService,
  pegawai: pegawaiService
}