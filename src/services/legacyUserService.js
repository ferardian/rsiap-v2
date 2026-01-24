import api from './api'

export const legacyUserService = {
    /**
     * Get paginated list of legacy users
     */
    getLegacyUsers(page = 1, limit = 50, search = '') {
        return api.get('/user-management/legacy-users', {
            params: { page, limit, search }
        })
    },

    /**
     * Set password for a legacy user
     */
    setPassword(id_user, password) {
        return api.post(`/user-management/legacy-users/${id_user}/set-password`, {
            password
        })
    },

    /**
     * Check if legacy user exists
     */
    checkUser(id_user) {
        return api.get(`/user-management/legacy-users/${id_user}/check`)
    },

    /**
     * Get existing password for a legacy user
     */
    getPassword(id_user) {
        return api.get(`/user-management/legacy-users/${id_user}/password`)
    }
}

export default legacyUserService
