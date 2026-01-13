import api from './api'

const poliklinikService = {
    /**
     * Get all poliklinik
     */
    getAllPoliklinik(params = {}) {
        return api.get('/jadwal-dokter/poliklinik', { params })
    }
}

export default poliklinikService
