import api from './api';

const service = {
    // Get list of PKS with Orion Search Pagination
    searchPks: (payload = {}) => {
        const params = {};
        if (payload.departemen) {
            params.departemen = payload.departemen;
            delete payload.departemen;
        }
        return api.post('/berkas/pks/search', payload, { params });
    },

    // Get list of PKS with filters
    getPks: (params) => api.get('/berkas/pks', { params }),

    // Get single PKS by ID
    getPksById: (id, params = {}) => api.get(`/berkas/pks/${id}`, { params }),

    // Create new PKS
    createPks: (data) => {
        if (data instanceof FormData) {
            return api.post('/berkas/pks', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/berkas/pks', data);
    },

    // Update existing PKS
    updatePks: (id, data) => {
        if (data instanceof FormData) {
            // Use POST with _method=PUT to handle multipart/form-data in Laravel
            data.append('_method', 'PUT');
            return api.post(`/berkas/pks/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.put(`/berkas/pks/${id}`, data);
    },

    // Delete PKS (soft delete)
    deletePks: (id) => api.delete(`/berkas/pks/${id}`),
};

export default service;
