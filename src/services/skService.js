import api from './api'

export const skService = {
    /**
     * Search SK
     */
    searchSk(query = '', limit = 20, page = 1, filters = []) {
        return api.post('/berkas/sk/search', {
            search: { value: query },
            limit: limit,
            page: page,
            filters: filters,
            sort: [
                { field: 'created_at', direction: 'desc' }
            ]
        })
    },

    /**
     * Create new SK
     */
    createSk(data) {
        return api.post('/berkas/sk', data)
    },

    /**
     * Update SK or Upload Berkas
     * We pass identifier as base64 of nomor.jenis.tgl_terbit
     */
    updateSk(identifier, data, isFormData = false) {
        const config = isFormData ? {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        } : {}
        return api.post(`/berkas/sk/${identifier}?_method=PUT`, data, config)
    },

    /**
     * Delete SK (set status to 0)
     */
    deleteSk(identifier) {
        // API requires DELETE method to hit destroy endpoint
        return api.delete(`/berkas/sk/${identifier}`)
    },

    /**
     * Approve SK Kredensial
     */
    approveKredensial(identifier) {
        return api.post(`/berkas/sk/${identifier}/approve-kredensial`)
    }
}
