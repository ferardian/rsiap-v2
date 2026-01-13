import api from './api'

const kualifikasiStafService = {
    /**
     * Get list of kualifikasi staf
     * @param {Object} params
     */
    getKualifikasi(params = {}) {
        return api.get('/sdi/kualifikasi-staf', { params })
    },

    /**
     * Get kualifikasi by NIK
     * @param {string} nik
     */
    getKualifikasiByNik(nik) {
        return api.get(`/sdi/kualifikasi-staf/${nik}`)
    },

    /**
     * Create new kualifikasi
     * @param {Object} data
     */
    createKualifikasi(data) {
        return api.post('/sdi/kualifikasi-staf', data)
    },

    /**
     * Update kualifikasi
     * @param {string} nik
     * @param {Object} data
     */
    updateKualifikasi(nik, data) {
        return api.put(`/sdi/kualifikasi-staf/${nik}`, data)
    },

    /**
     * Delete kualifikasi
     * @param {string} nik
     */
    deleteKualifikasi(nik) {
        return api.delete(`/sdi/kualifikasi-staf/${nik}`)
    }
}

export default kualifikasiStafService
