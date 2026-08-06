import api from './api'

const rsOnlineService = {
  getRefTempatTidur: () => api.get('/rs-online/ref-tempat-tidur'),
  getBedMappings: (params = {}) => api.get('/rs-online/ketersediaan-kamar', { params }),
  syncStructure: () => api.post('/rs-online/sync-structure'),
  updateMapping: (id, data) => api.put(`/rs-online/ketersediaan-kamar/${id}/mapping`, data),
  sendUpdate: (id = null, params = {}) => {
    const url = id ? `/rs-online/send-update/${id}` : '/rs-online/send-update'
    return api.post(url, {}, { params })
  }
}

export default rsOnlineService
