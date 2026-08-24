import api from './api';

const kepatuhanHakAksesService = {
  /**
   * Get detail access logs with compliance evaluation
   * @param {Object} params - { tgl_awal, tgl_akhir, departemen, kategori_anomali, search, limit, page }
   */
  getLogs: (params) => api.get('/laporan/kepatuhan-hak-akses', { params }),

  /**
   * Get summary statistics of access compliance
   * @param {Object} params - { tgl_awal, tgl_akhir, departemen, search }
   */
  getSummary: (params) => api.get('/laporan/kepatuhan-hak-akses/summary', { params }),
};

export default kepatuhanHakAksesService;
