import api from './api';

const bpjsVclaimService = {
    /**
     * Get all mapped doctors
     */
    getMappingDokter: () => api.get('/bpjs/vclaim/mapping/dokter'),

    /**
     * Get setting info (kode_ppk, etc)
     */
    getSettingInfo: () => api.get('/bpjs/setting-info'),

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

    /**
     * Get reference poli
     */
    getRefPoli: (search) => api.get(`/bpjs/vclaim/referensi/poli/${search}`),

    /**
     * Get reference diagnosa (ICD-10)
     */
    getRefDiagnosa: (search) => api.get(`/bpjs/vclaim/referensi/diagnosa/${search}`),

    /**
     * Search Surat
     */
    searchSurat: (noKartu, tgl = '') => api.get(`/bpjs/vclaim/referensi/surat/${noKartu}${tgl ? '?tgl=' + tgl : ''}`),

    /**
     * Get reference faskes
     */
    getRefFaskes: (search, faskes) => api.get(`/bpjs/vclaim/referensi/faskes/${search}/${faskes}`),

    /**
     * Get reference propinsi
     */
    getRefPropinsi: () => api.get('/bpjs/vclaim/referensi/propinsi'),

    /**
     * Get reference kabupaten
     */
    getRefKabupaten: (kdPropinsi) => api.get(`/bpjs/vclaim/referensi/kabupaten/${kdPropinsi}`),

    /**
     * Get reference kecamatan
     */
    getRefKecamatan: (kdKabupaten) => api.get(`/bpjs/vclaim/referensi/kecamatan/${kdKabupaten}`),

    /**
     * Get rujukan by card number
     */
    getRujukanByNoKartu: (no_kartu) => api.get(`/bpjs/vclaim/rujukan/peserta/${no_kartu}`),

    /**
     * Insert SEP
     */
    insertSep: (payload) => api.post('/bpjs/vclaim/sep/insert', payload),

    /**
     * Get SEP Detail
     */
    getSep: (noSep) => api.get(`/bpjs/vclaim/sep/${noSep}`),

    /**
     * Update SEP
     */
    updateSep: (payload) => api.put('/bpjs/vclaim/sep/update', payload),
    
    /**
     * Delete SEP
     */
    deleteSep: (payload) => api.delete('/bpjs/vclaim/sep/delete', { data: payload }),
};

export default bpjsVclaimService;
