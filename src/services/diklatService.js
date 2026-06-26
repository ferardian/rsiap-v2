import api from './api'

export const diklatService = {
  /**
   * Get training records for an employee by NIK
   */
  getDiklatByNik(nik) {
    return api.get(`/diklat/pegawai/${nik}`)
  },

  /**
   * Get dashboard statistics (KPIs, trends, KARS compliance)
   */
  getDashboardStats(params = {}) {
    return api.get('/diklat/dashboard-stats', { params })
  },

  /**
   * Search activities (kegiatan) for autocomplete
   */
  getKegiatan(searchQuery = '') {
    return api.get('/diklat/kegiatan', {
      params: { q: searchQuery }
    })
  },

  /**
   * Get detail of a specific activity with its participants
   */
  getKegiatanDetail(id) {
    return api.get(`/diklat/kegiatan/${id}`)
  },

  /**
   * Store a new training record (uses multipart/form-data)
   */
  storeDiklat(formData) {
    return api.post('/diklat/store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * Update an existing training record (uses multipart/form-data via POST)
   */
  updateDiklat(id, formData) {
    return api.post(`/diklat/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * Update details of an activity (kegiatan) directly
   */
  updateKegiatan(id, data) {
    return api.post(`/diklat/kegiatan/update/${id}`, data)
  },

  /**
   * Delete a training record by ID
   */
  deleteDiklat(id) {
    return api.delete(`/diklat/destroy/${id}`)
  },

  /**
   * Get all employee external certificate submissions
   */
  getPengajuanList(params = {}) {
    return api.get('/diklat/pengajuan/list', { params })
  },

  /**
   * Approve an external certificate submission
   */
  approvePengajuan(id) {
    return api.post(`/diklat/pengajuan/approve/${id}`)
  },

  /**
   * Reject an external certificate submission
   */
  rejectPengajuan(id, catatanReject) {
    return api.post(`/diklat/pengajuan/reject/${id}`, {
      catatan_reject: catatanReject
    })
  }
}

export default diklatService
