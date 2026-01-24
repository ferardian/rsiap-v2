import api from './api'

export default {
    /**
     * Get HAIS records with filters
     * @param {Object} params - { no_rawat, tanggal_awal, tanggal_akhir }
     */
    getHais(params) {
        return api.get('/rawat-inap/hais', { params })
    },

    /**
     * Store or update HAIS record
     * @param {Object} data 
     */
    store(data) {
        return api.post('/rawat-inap/hais', data)
    },

    /**
     * Update HAIS record by ID
     * @param {number|string} id 
     * @param {Object} data 
     */
    update(id, data) {
        return api.put(`/rawat-inap/hais/${id}`, data)
    },

    /**
     * Delete HAIS record by ID
     * @param {number|string} id 
     */
    delete(id) {
        return api.delete(`/rawat-inap/hais/${id}`)
    },

    /**
     * Get HAIS aggregated report
     * @param {Object} params - { bulan, tahun }
     */
    getReport(params) {
        return api.get('/rawat-inap/hais/report', { params })
    }
}
