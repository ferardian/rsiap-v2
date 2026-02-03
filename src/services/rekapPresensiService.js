import api from './api';

const rekapPresensiService = {
    /**
     * Get rekap presensi report with filters
     * @param {Object} params - { tgl_awal, tgl_akhir, shift, status, search, limit, page }
     */
    getRekapPresensi: (params) => api.get('/laporan/rekap-presensi', { params }),

    /**
     * Get summary of status counts
     */
    getSummary: (params) => api.get('/laporan/rekap-presensi/summary', { params }),
};

export default rekapPresensiService;
