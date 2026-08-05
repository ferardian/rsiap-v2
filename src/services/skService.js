import api from './api'

export const skService = {
    /**
     * Search SK using Orion search endpoint
     */
    searchSk(payload = {}) {
        let params = {}
        if (payload.departemen) {
            params.departemen = payload.departemen
            delete payload.departemen
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
