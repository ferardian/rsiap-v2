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
     * Sync all tasks (3-7 or 3-5) from local SIMRS to BPJS in bulk
     * @param {string} kodebooking 
     */
    syncTaskQueue: (kodebooking) => api.post('/bpjs/antrol/antrean/sync-queue', { kodebooking }),

    /**
     * Get Outpatient SEP count (excluding IGD) for a given date
     */
    getSepCount: (tanggal) => api.get(`/bpjs/antrol/sep/count/${tanggal}`),

    /**
     * Get queue registration by date range
     * @param {string} tglAwal - YYYY-MM-DD
     * @param {string} tglAkhir - YYYY-MM-DD
     */
    getPendaftaranByRange: (tglAwal, tglAkhir) => api.get(`/bpjs/antrol/pendaftaran/range/${tglAwal}/${tglAkhir}`),

    /**
     * Get Outpatient SEP list (excluding IGD) for a given date range
     * @param {string} tglAwal - YYYY-MM-DD
     * @param {string} tglAkhir - YYYY-MM-DD
     */
    getSepCountByRange: (tglAwal, tglAkhir) => api.get(`/bpjs/antrol/sep/range/${tglAwal}/${tglAkhir}`),
};

export default bpjsAntrolService;
