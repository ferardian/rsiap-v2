import api from './api'

export const manajemenRisikoService = {
  getMeta() {
    return api.get('/manajemen-risiko/meta')
  },

  getDashboard(params = {}) {
    return api.get('/manajemen-risiko/dashboard', { params })
  },

  getAll(params = {}) {
    return api.get('/manajemen-risiko', { params })
  },

  getById(id) {
    return api.get(`/manajemen-risiko/${id}`)
  },

  create(data) {
    return api.post('/manajemen-risiko', data)
  },

  update(id, data) {
    return api.put(`/manajemen-risiko/${id}`, data)
  },

  delete(id) {
    return api.delete(`/manajemen-risiko/${id}`)
  },

  updateTreatment(id, data) {
    return api.patch(`/manajemen-risiko/${id}/treatment`, data)
  }
}

export default manajemenRisikoService
