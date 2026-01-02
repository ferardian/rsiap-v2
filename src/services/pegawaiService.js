import api from './api'

export const pegawaiService = {
    /**
     * Get paginated list of employees
     */
    getPegawai(page = 1, limit = 50) {
        return api.get('/sdi/pegawai', {
            params: { page, limit }
        })
    },

    /**
     * Get single employee by NIK
     */
    getPegawaiById(nik) {
        return api.get(`/sdi/pegawai/${nik}`)
    },

    /**
     * Create new employee
     */
    createPegawai(data) {
        return api.post('/sdi/pegawai', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    /**
     * Update employee
     */
    updatePegawai(nik, data) {
        return api.put(`/sdi/pegawai/${nik}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    /**
     * Delete employee
     */
    deletePegawai(nik) {
        return api.delete(`/sdi/pegawai/${nik}`)
    },

    /**
     * Search employees
     */
    searchPegawai(query, limit = 20) {
        return api.get('/sdi/pegawai/search', {
            params: { q: query, limit }
        })
    }
}
