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
    },

    // ========== Clinical Staff Qualification (Kualifikasi Staf Klinis) ==========

    /**
     * Get list of clinical staff qualifications
     */
    getKualifikasiStaf(params = {}) {
        return api.get('/sdi/kualifikasi-staf', { params })
    },

    /**
     * Get clinical staff qualification by NIK
     */
    getKualifikasiByNik(nik) {
        return api.get(`/sdi/kualifikasi-staf/${nik}`)
    },

    /**
     * Create new clinical staff qualification
     */
    createKualifikasi(data) {
        return api.post('/sdi/kualifikasi-staf', data)
    },

    /**
     * Update clinical staff qualification
     */
    updateKualifikasi(nik, data) {
        return api.put(`/sdi/kualifikasi-staf/${nik}`, data)
    },

    /**
     * Delete clinical staff qualification
     */
    deleteKualifikasi(nik) {
        return api.delete(`/sdi/kualifikasi-staf/${nik}`)
    },

    /**
     * Get list of employees for dropdown (simplified data)
     */
    getKaryawanList(params = {}) {
        return api.get('/sdi/pegawai/list', { params })
    },

    /**
     * Get employee statistics
     */
    getStatistik() {
        return api.get('/sdi/pegawai/statistik')
    }
}
