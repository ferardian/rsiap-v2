import api from './api'

export const kepatuhanPelayananDokterService = {
  /**
   * Get statistical summaries, daily trends, clinic stats, and doctor stats
   * @param {Object} params { start_date, end_date, kd_poli, kd_dokter, mode }
   */
  getStats(params) {
    return api.get('/laporan/kepatuhan-pelayanan-dokter', { params })
  },

  /**
   * Get paginated detailed compliance data
   * @param {Object} params { start_date, end_date, kd_poli, kd_dokter, status, mode, search, page, limit }
   */
  getDetails(params) {
    return api.get('/laporan/kepatuhan-pelayanan-dokter/detail', { params })
  }
}

export default kepatuhanPelayananDokterService
