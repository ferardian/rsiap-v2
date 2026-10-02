import api from './api'

const costingTindakanService = {
  getCostingAnalysis: (params) => {
    return api.get('/keuangan/costing-tindakan', { params })
  },
  getDetailBilling: (params) => {
    return api.get('/keuangan/costing-tindakan/detail-billing', { params })
  },
  getMasterPaket: (params) => {
    return api.get('/keuangan/costing-tindakan/master-paket', { params })
  }
}

export default costingTindakanService
