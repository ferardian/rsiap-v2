import api from './api';

const bpjsAntrolService = {
    /**
     * Get queue registration by date
     * @param {string} tanggal - YYYY-MM-DD
     */
    getPendaftaranByTanggal: (tanggal) => api.get(`/bpjs/antrol/pendaftaran/tanggal/${tanggal}`),

    /**
     * Get dashboard data by date
     * @param {string} tanggal - YYYY-MM-DD
     * @param {string} waktu - rs|sys
     */
    getDashboard: (tanggal, waktu = 'rs') => api.get('/bpjs/antrol/dashboard', {
        params: { tanggal, waktu }
    }),

    /**
     * Get task list for a specific booking code
     * @param {string} kodebooking 
     */
    getTaskQueue: (kodebooking) => api.post('/bpjs/antrol/antrean/getlisttask', { kodebooking }),

    /**
     * Get local SIMRS task data for adjustment
     */
    getLocalAdjustmentData: (kodebooking) => api.post('/bpjs/antrol/antrean/local-data', { kodebooking }),

    /**
     * Update local SIMRS task data and sync to BPJS
     */
    updateLocalTaskQueue: (payload) => api.post('/bpjs/antrol/antrean/update-local', payload),

    /**
     * Sync task times from local SIMRS to BPJS
     * @param {string} kodebooking 
     */
    syncTaskQueue: (kodebooking) => api.post('/bpjs/antrol/antrean/sync', { kodebooking }),

    /**
     * Get Outpatient SEP count (excluding IGD) for a given date
     */
    getSepCount: (tanggal) => api.get(`/bpjs/antrol/sep/count/${tanggal}`),
};

export default bpjsAntrolService;
