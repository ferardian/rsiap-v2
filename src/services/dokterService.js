import api from './api'

const dokterService = {
    /**
     * Get all doctors
     */
    getAllDokter(params = {}) {
        return api.get('/jadwal-dokter/dokter', { params })
    },

    /**
     * Search doctors
     */
    searchDokter(query) {
        return api.post('/public/dokter/search', {
            scopes: [
                {
                    name: 'search',
                    parameters: [query]
                }
            ]
        })
    }
}

export default dokterService
