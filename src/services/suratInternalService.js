import api from './api'

export const suratInternalService = {
    /**
     * Search and get list of internal letters (Surat Internal)
     * Using Orion search endpoint
     */
    getSuratInternal(payload = {}) {
        // Ensure relations are included for detail view
        const relations = ['undangan', 'penanggungJawab', 'diajukanOleh']

        let params = {
            include: relations.join(',')
        }

        // Pass department filter as URL param to avoid Orion whitelist error
        if (payload.departemen) {
            params.departemen = payload.departemen
            delete payload.departemen
        }

        return api.post('/surat/internal/search', payload, { params })
    },

    /**
     * Get single internal letter by ID
     */
    getSuratInternalById(id) {
        return api.get(`/surat/internal/${id}`, {
            params: {
                include: 'undangan,penanggungJawab,diajukanOleh'
            }
        })
    },

    /**
     * Create new internal letter
     */
    storeSuratInternal(data) {
        return api.post('/surat/internal', data)
    },

    /**
     * Update existing internal letter
     */
    updateSuratInternal(id, data) {
        return api.put(`/surat/internal/${id}`, data)
    },

    /**
     * Delete internal letter
     */
    deleteSuratInternal(id) {
        return api.delete(`/surat/internal/${id}`)
    },

    /**
     * Save recipients for an invitation (undangan)
     */
    storePenerima(payload) {
        return api.post('/undangan/penerima', payload)
    },

    /**
     * Get recipients for an invitation
     */
    getPenerima(undanganId) {
        return api.get(`/undangan/penerima/${undanganId}`)
    },

    /**
     * Get statistics for internal letters
     */
    getStats(params = {}) {
        return api.get('/surat/internal/stats', { params })
    }
}
