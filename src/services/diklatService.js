import api from './api'

export const diklatService = {
  /**
   * Get training records for an employee by NIK
   */
  getDiklatByNik(nik) {
    return api.get(`/diklat/pegawai/${nik}`)
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
   * Delete a training record by ID
   */
  deleteDiklat(id) {
    return api.delete(`/diklat/destroy/${id}`)
  }
}

export default diklatService
