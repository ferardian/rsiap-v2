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
};

export default pasienService;
