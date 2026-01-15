import api from './api';

const service = {
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
    getSpoUnits: (id) => api.get(`/berkas/spo/${id}/units`),

    // Get list of departments for unit selection (using indikator-mutu endpoint)
    getUnits: () => api.get('/indikator-mutu/monitoring/units'),
};

export default service;
