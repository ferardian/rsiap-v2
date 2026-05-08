import api from './api';

const pasienService = {
    /**
     * Search patients using Orion search
     * @param {Object} searchParams - { search: { value: 'query' }, limit: 20 }
     */
    searchPasien: (searchParams) => api.post('/pasien/search', searchParams),

    /**
     * Get single patient by No RM
     */
    getPasienByNoRm: (noRm) => api.get(`/pasien/${noRm}`),

    /**
     * Create a new patient
     */
    createPasien: (data) => api.post('/pasien', data),

    /**
     * Update an existing patient
     */
    updatePasien: (noRm, data) => api.put(`/pasien/${noRm}`, data),

    /**
     * Get list of companies/institutions
     */
    getPerusahaan: (params) => api.get('/pasien/perusahaan-pasien', { params }),

    /**
     * Master data for registration
     */
    getSuku: () => api.get('/pasien/suku-bangsa'),
    getBahasa: () => api.get('/pasien/bahasa-pasien'),
    getCacat: () => api.get('/pasien/cacat-fisik'),
    getNextNoRm: () => api.get('/pasien/next-rm'),
};

export default pasienService;
