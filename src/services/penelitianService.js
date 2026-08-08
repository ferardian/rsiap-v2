import api from './api'

export const penelitianService = {
  // Staff / Diklit Internal API Methods
  getPermohonan(params) {
    return api.get('/penelitian', { params })
  },
  createPermohonan(formData) {
    return api.post('/penelitian', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  updatePermohonan(id, formData) {
    return api.post(`/penelitian/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadDisposisi(id, formData) {
    return api.post(`/penelitian/${id}/disposisi`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  generateAccess(id, data) {
    return api.post(`/penelitian/${id}/generate-access`, data)
  },
  deletePermohonan(id) {
    return api.delete(`/penelitian/${id}`)
  },
  getLaporanSla(params) {
    return api.get('/penelitian/laporan-sla', { params })
  },

  // Researcher Access Portal Methods
  loginPortal(data) {
    return api.post('/portal-peneliti/login', data)
  },
  getRmeMasked(params, headers = {}) {
    return api.get('/portal-peneliti/rme-masked', { params, headers })
  }
}

export default penelitianService
