import api from './api';

const service = {
    // Master Utama
    getUtama: (params) => api.get('/indikator-mutu/master/utama', { params }),
    createUtama: (data) => api.post('/indikator-mutu/master/utama', data),
    updateUtama: (id, data) => api.put(`/indikator-mutu/master/utama/${id}`, data),
    deleteUtama: (id) => api.delete(`/indikator-mutu/master/utama/${id}`),

    // Master Ruang
    getRuang: (params) => api.get('/indikator-mutu/master/ruang', { params }),
    createRuang: (data) => api.post('/indikator-mutu/master/ruang', data),
    updateRuang: (id, data) => api.put(`/indikator-mutu/master/ruang/${id}`, data),
    deleteRuang: (id) => api.delete(`/indikator-mutu/master/ruang/${id}`),
    // Monitoring
    getMonitoring: (params) => api.get('/indikator-mutu/monitoring', { params }),
    getUnits: () => api.get('/indikator-mutu/monitoring/units'),
    getLaporan: (params) => api.get('/indikator-mutu/laporan', { params }),

    // Analisa
    getAnalisa: (params) => api.get('/indikator-mutu/analisa', { params }),
    storeAnalisa: (data) => api.post('/indikator-mutu/analisa', data),
    createAnalisa: (data) => api.post('/indikator-mutu/analisa', data),
    updateAnalisa: (id, data) => api.put(`/indikator-mutu/analisa/${id}`, data),
    deleteAnalisa: (id) => api.delete(`/indikator-mutu/analisa/${id}`),

    // Input Data / Realisasi
    saveRealisasi: (data) => api.post('/indikator-mutu/realisasi', data),
    getRealisasi: (params) => api.get('/indikator-mutu/realisasi', { params }),
    saveRealisasiBulk: (data) => api.post('/indikator-mutu/realisasi/bulk', data),
};

// Export service for Indikator Mutu operations
export default service;
