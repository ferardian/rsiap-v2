import api from './api'

export const skService = {
    /**
     * Search SK using Orion search endpoint
     * Accepts either a payload object OR positional parameters (query, limit, page, filters)
     */
    searchSk(queryOrPayload = '', limit = 20, page = 1, filters = []) {
        let payload = {}
        let params = {}

        if (typeof queryOrPayload === 'object' && queryOrPayload !== null) {
            payload = { ...queryOrPayload }
            if (payload.departemen) {
                params.departemen = payload.departemen
                delete payload.departemen
            }
        } else {
            payload = {
                search: { value: queryOrPayload },
                limit: limit,
                page: page,
                filters: filters,
                sort: [
                    { field: 'created_at', direction: 'desc' }
                ]
            }
        }

        return api.post('/berkas/sk/search', payload, { params })
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
