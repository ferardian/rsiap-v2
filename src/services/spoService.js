import api from './api';

const service = {
    // Get list of SPO with Orion Search Pagination
    searchSpo: (payload) => api.post('/berkas/spo/search', payload),

    // Get list of SPO with filters
    getSpo: (params) => api.get('/berkas/spo', { params }),

    // Get single SPO by ID
    getSpoById: (id, params = {}) => api.get(`/berkas/spo/${id}`, { params }),

    // Create new SPO
    createSpo: (data) => api.post('/berkas/spo', data),

    // Update existing SPO
    updateSpo: (id, data) => api.put(`/berkas/spo/${id}`, data),

    // Delete SPO (soft delete)
    deleteSpo: (id) => api.delete(`/berkas/spo/${id}`),

    // Get units related to SPO
    getSpoUnits: (id, params = {}) => api.get(`/berkas/spo/${id}/units`, { params }),

    // Get list of departments for unit selection
    getUnits: (params = { limit: 1000 }) => api.get('/sdi/departemen', { params }),

    // AI Generation for SPO
    generateAi: (data) => api.post('/berkas/spo/generate-ai', data),
};

export default service;
