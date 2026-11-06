import api from './api'

export const kepatuhanSepService = {
  getStats(params) {
    return api.get('/laporan/kepatuhan-pelayanan-dokter', { params })
  },

  getDetails(params) {
    return api.get('/laporan/kepatuhan-pelayanan-dokter/detail', { params })
  }
}

export default kepatuhanSepService
