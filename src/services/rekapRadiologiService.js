import api from './api'

const rekapRadiologiService = {
  getRekap: (params) => {
    return api.get('/keuangan/radiologi/rekap', { params })
  },
  getRekapRadiologi: (params) => {
    return api.get('/keuangan/radiologi/rekap', { params })
  },
  getDokterRadiologi: () => {
    return api.get('/keuangan/radiologi/rekap/dokter')
  }
}

export default rekapRadiologiService
