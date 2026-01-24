import api from './api'

export const dokterService = {
    /**
     * Get paginated list of doctors
     */
    getDokter(page = 1, limit = 50, search = '') {
        return api.get('/sdi/dokter', {
            params: { page, limit, search }
        })
    },

    /**
     * Get single doctor by kd_dokter
     */
    getDokterById(kdDokter) {
        return api.get(`/sdi/dokter/${kdDokter}`)
    },

    /**
     * Create new doctor
     */
    createDokter(data) {
        return api.post('/sdi/dokter', data)
    },

    /**
     * Update doctor
     */
    updateDokter(kdDokter, data) {
        return api.put(`/sdi/dokter/${kdDokter}`, data)
    },

    /**
     * Delete doctor (soft delete)
     */
    deleteDokter(kdDokter) {
        return api.delete(`/sdi/dokter/${kdDokter}`)
    },

    /**
     * Search doctors
     */
    searchDokter(query, limit = 20) {
        return api.get('/sdi/dokter/search', {
            params: { q: query, limit }
        })
    },

    /**
     * Get all doctors (legacy method for compatibility)
     */
    getAllDokter(params = {}) {
        return api.get('/jadwal-dokter/dokter', { params })
    },

    /**
     * Get list of spesialisasi for dropdown
     */
    getSpesialisasi() {
        return api.get('/sdi/dokter/spesialisasi')
    }
}

export default dokterService
