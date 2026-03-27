import api from './api'

const keuanganTarifService = {
  getNextKodeRalan: () => {
    return api.get('/keuangan/tarif/ralan/kode')
  },
  getNextKodeRanap: () => {
    return api.get('/keuangan/tarif/ranap/kode')
  },
  getKategoriPerawatan: (params) => {
    return api.get('/keuangan/kategori-perawatan', { params })
  },
  getPoli: (params) => {
    return api.get('/rawat-jalan/poli', { params })
  },
  getPenjab: (params) => {
    return api.get('/rawat-jalan/penjab', { params })
  },
  getBangsal: (params) => {
    return api.get('/rawat-inap/bangsal', { params })
  },
  
  // 1. Tarif Rawat Jalan
  getTarifRalan: (params) => {
    return api.get('/keuangan/tarif/ralan', { params })
  },
  postTarifRalan: (data) => {
    return api.post('/keuangan/tarif/ralan', data)
  },
  putTarifRalan: (id, data) => {
    return api.put(`/keuangan/tarif/ralan/${id}`, data)
  },
  deleteTarifRalan: (id) => {
    return api.delete(`/keuangan/tarif/ralan/${id}`)
  },
  
  // 2. Tarif Rawat Inap
  getTarifRanap: (params) => {
    return api.get('/keuangan/tarif/ranap', { params })
  },
  postTarifRanap: (data) => {
    return api.post('/keuangan/tarif/ranap', data)
  },
  putTarifRanap: (id, data) => {
    return api.put(`/keuangan/tarif/ranap/${id}`, data)
  },
  deleteTarifRanap: (id) => {
    return api.delete(`/keuangan/tarif/ranap/${id}`)
  },
  
  // 3. Tarif Operasi
  getTarifOperasi: (params) => {
    return api.get('/keuangan/tarif/operasi', { params })
  },
  
  // 4. Tarif Laboratorium
  getTarifLab: (params) => {
    return api.get('/keuangan/tarif/lab', { params })
  },
  
  // 5. Tarif Radiologi
  getTarifRadiologi: (params) => {
    return api.get('/keuangan/tarif/radiologi', { params })
  }
}

export default keuanganTarifService
