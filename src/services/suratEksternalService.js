import api from './api'

export const suratEksternalService = {
    /**
     * Search and get list of external letters (Surat Eksternal)
     * Using Orion search endpoint
     */
    getSuratEksternal(payload = {}) {
        // Ensure relations are included for detail view
        const relations = ['penanggungJawab']

        let params = {
            include: relations.join(',')
        }

        // Pass department filter as URL param to avoid Orion whitelist error
        if (payload.departemen) {
            params.departemen = payload.departemen
            delete payload.departemen
        }

        return api.post('/surat/eksternal/search', payload, { params })
    },

    /**
     * Get single external letter by ID
     */
    getSuratEksternalById(id) {
        return api.get(`/surat/eksternal/${id}`, {
            params: {
                include: 'penanggungJawab'
            }
        })
    },

    /**
     * Create new external letter
     */
    storeSuratEksternal(data) {
        return api.post('/surat/eksternal', data)
    },

    /**
     * Update existing external letter
     */
    updateSuratEksternal(id, data) {
        return api.put(`/surat/eksternal/${id}`, data)
    },

    /**
     * Delete external letter
     */
    deleteSuratEksternal(id) {
        return api.delete(`/surat/eksternal/${id}`)
    },

    /**
     * Get statistics for external letters
     */
    getStats(params = {}) {
        return api.get('/surat/eksternal/stats', { params })
    }
}
