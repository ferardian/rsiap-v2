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
    getDashboardKumulatif: (params) => api.get('/indikator-mutu/monitoring/dashboard', { params }),
    getIkpData: (params) => api.get('/indikator-mutu/monitoring/ikp', { params }),
    getIkpLookup: (params) => api.get('/indikator-mutu/monitoring/ikp/lookup', { params }),
    getRekapTahunan: (params) => api.get('/indikator-mutu/monitoring/rekap-tahunan', { params }),
    getUnits: () => api.get('/indikator-mutu/monitoring/units'),
    getLaporan: (params) => api.get('/indikator-mutu/laporan', { params }),
    getLaporanDetail: (params) => api.get('/indikator-mutu/laporan/detail', { params }),

    // Analisa
    getAnalisa: (params) => api.get('/indikator-mutu/analisa', { params }),
    storeAnalisa: (data) => api.post('/indikator-mutu/analisa', data),
    createAnalisa: (data) => api.post('/indikator-mutu/analisa', data),
    updateAnalisa: (id, data) => api.put(`/indikator-mutu/analisa/${id}`, data),
    deleteAnalisa: (id) => api.delete(`/indikator-mutu/analisa/${id}`),

    // PDSA
    getPdsa: (params) => api.get('/indikator-mutu/pdsa', { params }),
    storePdsa: (data) => api.post('/indikator-mutu/pdsa', data),

    // Input Data / Realisasi
    saveRealisasi: (data) => api.post('/indikator-mutu/realisasi', data),
    getRealisasi: (params) => api.get('/indikator-mutu/realisasi', { params }),
    saveRealisasiBulk: (data) => api.post('/indikator-mutu/realisasi/bulk', data),
    verifyRealisasi: (data) => api.post('/indikator-mutu/realisasi/verifikasi', data),
    verifyPdsa: (data) => api.post('/indikator-mutu/pdsa/verifikasi', data),

    // Feedback Analisa
    getFeedback: (id_analisa) => api.get(`/indikator-mutu/analisa/feedback/${id_analisa}`),
    storeFeedback: (data) => api.put('/indikator-mutu/analisa/feedback', data),
    
    // Notifications
    sendAnalisaNotification: (data) => api.post('/indikator-mutu/analisa/notif', data),

    // Supervisi Implikasi
    getSupervisiImplikasiTemplate: () => api.get('/indikator-mutu/supervisi-implikasi/template'),
    storeSupervisiImplikasiTemplate: (data) => api.post('/indikator-mutu/supervisi-implikasi/template', data),
    updateSupervisiImplikasiTemplate: (no_unsur, data) => api.put(`/indikator-mutu/supervisi-implikasi/template/${no_unsur}`, data),
    deleteSupervisiImplikasiTemplate: (no_unsur) => api.delete(`/indikator-mutu/supervisi-implikasi/template/${no_unsur}`),
    getSupervisiImplikasi: (params) => api.get('/indikator-mutu/supervisi-implikasi', { params }),
    getSupervisiImplikasiDetail: (id) => api.get(`/indikator-mutu/supervisi-implikasi/${id}`),
    createSupervisiImplikasi: (data) => api.post('/indikator-mutu/supervisi-implikasi', data),
    updateSupervisiImplikasi: (id, data) => api.put(`/indikator-mutu/supervisi-implikasi/${id}`, data),
    deleteSupervisiImplikasi: (id) => api.delete(`/indikator-mutu/supervisi-implikasi/${id}`),

    // PIC & Validator Mappings
    getPicValidators: () => api.get('/indikator-mutu/pic-validators'),
    createPicValidator: (data) => api.post('/indikator-mutu/pic-validators', data),
    updatePicValidator: (dep_id, data) => api.put(`/indikator-mutu/pic-validators/${dep_id}`, data),
    deletePicValidator: (dep_id) => api.delete(`/indikator-mutu/pic-validators/${dep_id}`),

    // Validasi Bulanan
    getValidasiBulanan: (params) => api.get('/indikator-mutu/validasi', { params }),
    storeValidasiBulanan: (data) => api.post('/indikator-mutu/validasi', data),
};

// Export service for Indikator Mutu operations
export default service;
