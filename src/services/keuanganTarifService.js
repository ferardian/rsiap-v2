import api from './api'

const keuanganTarifService = {
  // 1. Tarif Rawat Jalan
  getTarifRalan: (params) => {
    return api.get('/keuangan/tarif/ralan', { params })
  },
  
  // 2. Tarif Rawat Inap
  getTarifRanap: (params) => {
    return api.get('/keuangan/tarif/ranap', { params })
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
