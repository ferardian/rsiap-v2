import api from './api'

const keuanganHutangService = {
  getHutangVendorFarmasi: (params) => {
    return api.get('/keuangan/hutang-vendor-farmasi', { params })
  },
  getHutangVendorFarmasiDetail: (params) => {
    return api.get('/keuangan/hutang-vendor-farmasi/detail', { params })
  }
}

export default keuanganHutangService
