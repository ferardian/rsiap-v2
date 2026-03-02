import api from './api';

const bpjsVclaimService = {
    /**
     * Get all mapped doctors
     */
    getMappingDokter: () => api.get('/bpjs/vclaim/mapping/dokter'),

    /**
     * Get reference doctors from VClaim
     * @param {Object} params - { pelayanan, tgl, spesialis }
     */
    getRefDokter: (params) => api.get('/bpjs/vclaim/referensi/dokter', { params }),

    /**
     * Store mapping
     * @param {Object} data - { kd_dokter, kd_dokter_bpjs, nm_dokter_bpjs }
     */
    storeMapping: (data) => api.post('/bpjs/vclaim/mapping/dokter', data),

    /**
     * Delete mapping
     * @param {string} kd_dokter
     */
    deleteMapping: (kd_dokter) => api.delete(`/bpjs/vclaim/mapping/dokter/${kd_dokter}`),

    /**
     * Check participant data by Card Number
     */
    getPesertaByNoKartu: (no_kartu, tgl_sep) => api.get(`/bpjs/vclaim/peserta/nokartu/${no_kartu}/${tgl_sep}`),

    /**
     * Check participant data by NIK
     */
    getPesertaByNik: (nik, tgl_sep) => api.get(`/bpjs/vclaim/peserta/nik/${nik}/${tgl_sep}`),

    /**
     * Get Monitoring Klaim VClaim
     * @param {Object} params - { tanggal, jenis_pelayanan, status_klaim }
     */
    getMonitoringKlaim: (params) => api.get('/bpjs/vclaim/monitoring/klaim', { params }),

    /**
     * Sync Monitoring Klaim VClaim
     * @param {Object} data - { tahun, bulan, tanggal, jenis_pelayanan, status_klaim }
     */
    syncMonitoringKlaim: (data) => api.post('/bpjs/vclaim/monitoring/sync', data),
};

export default bpjsVclaimService;
