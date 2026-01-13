import api from './api'

const kamarService = {
    /**
     * Get all kamar with filters
     */
    getKamar(params = {}) {
        return api.get('/kamar/master', { params })
    },

    /**
     * Get bangsal list for filter
     */
    getBangsal() {
        return api.get('/kamar/master/bangsal')
    },

    /**
     * Create new kamar
     */
    createKamar(data) {
        return api.post('/kamar/master', data)
    },

    /**
     * Update kamar
     */
    updateKamar(kd_kamar, data) {
        return api.put(`/kamar/master/${kd_kamar}`, data)
    },

    /**
     * Delete kamar
     */
    deleteKamar(kd_kamar) {
        return api.delete(`/kamar/master/${kd_kamar}`)
    },

    /**
     * Get indent kamar list
     */
    getIndent(params = {}) {
        return api.get('/kamar/master/indent', { params })
    },

    /**
     * Update indent
     */
    updateIndent(kd_indent, data) {
        return api.put(`/kamar/master/indent/${kd_indent}`, data)
    },

    /**
     * Delete indent
     */
    deleteIndent(kd_indent) {
        return api.delete(`/kamar/master/indent/${kd_indent}`)
    }
}

export default kamarService
