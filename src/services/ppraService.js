import api from '@/services/api';

const resource = '/ppra/tim';

export default {
    /**
     * Get all tim ppra data
     * @param {Object} params - Query params like keyword
     * @returns {Promise}
     */
    getTim(params) {
        return api.get(resource, { params });
    },

    /**
     * Add new member to tim ppra
     * @param {Object} data - Form data
     * @returns {Promise}
     */
    storeTim(data) {
        return api.post(resource, data);
    },

    /**
     * Update existing member
     * @param {Number|String} id - ID of tim ppra
     * @param {Object} data - data to update
     * @returns {Promise}
     */
    updateTim(id, data) {
        return api.put(`${resource}/${id}`, data);
    },

    /**
     * Delete member from team
     * @param {Number|String} id - ID of tim ppra
     * @returns {Promise}
     */
    deleteTim(id) {
        return api.delete(`${resource}/${id}`);
    },

    // ============================================
    // Mapping Obat Methods
    // ============================================

    getMapping(params) {
        return api.get('/ppra/mapping-obat', { params });
    },

    storeMapping(data) {
        return api.post('/ppra/mapping-obat', data);
    },

    updateMapping(id, data) {
        return api.put(`/ppra/mapping-obat/${id}`, data);
    },

    deleteMapping(id) {
        return api.delete(`/ppra/mapping-obat/${id}`);
    },

    searchObat(keyword) {
        return api.get('/ppra/mapping-obat/search-obat', {
            params: { keyword }
        });
    },

    getLaporan(params) {
        return api.get('/ppra/laporan', {
            params,
            timeout: 30000 // 30 seconds for yearly report
        });
    },

    getRekapBulanan(params) {
        return api.get('/ppra/rekap-bulanan', { params });
    },

    storeVerifikasi(data) {
        return api.post('/ppra/verifikasi', data);
    },

    getVerifikasi(params) {
        return api.get('/ppra/verifikasi', { params });
    },

    getSoapSuggestions(params) {
        return api.get('/ppra/laporan/soap-suggestions', { params })
    },

    getSpesialisasi() {
        return api.get('/sdi/dokter/spesialisasi')
    },

    getDokter(params) {
        return api.get('/sdi/dokter', { params })
    }
}
