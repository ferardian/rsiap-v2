import api from './api'

const rkaService = {
  getPeriode: () => {
    return api.get('/rka/periode')
  },
  getDashboard: (params) => {
    return api.get('/rka/dashboard', { params })
  },
  getUnits: (params) => {
    return api.get('/rka/units', { params })
  },
  getUnitDetail: (id) => {
    return api.get(`/rka/units/${id}`)
  },
  updateUnitApproval: (id, data) => {
    return api.put(`/rka/units/${id}/status`, data)
  },
  getDisposisi: (params) => {
    return api.get('/rka/disposisi', { params })
  },
  updateVerifikasi: (id, data) => {
    return api.put(`/rka/pengadaan/${id}/verifikasi`, data)
  },

  // Unit Head CRUD
  addPengadaan: (unitId, data) => {
    return api.post(`/rka/units/${unitId}/pengadaan`, data)
  },
  updatePengadaan: (id, data) => {
    return api.put(`/rka/pengadaan/${id}`, data)
  },
  deletePengadaan: (id) => {
    return api.delete(`/rka/pengadaan/${id}`)
  },

  addProgramKerja: (unitId, data) => {
    return api.post(`/rka/units/${unitId}/program-kerja`, data)
  },
  deleteProgramKerja: (id) => {
    return api.delete(`/rka/program-kerja/${id}`)
  },

  addPelatihan: (unitId, data) => {
    return api.post(`/rka/units/${unitId}/pelatihan`, data)
  },
  deletePelatihan: (id) => {
    return api.delete(`/rka/pelatihan/${id}`)
  },

  addSdm: (unitId, data) => {
    return api.post(`/rka/units/${unitId}/sdm`, data)
  },
  deleteSdm: (id) => {
    return api.delete(`/rka/sdm/${id}`)
  },

  addRapat: (unitId, data) => {
    return api.post(`/rka/units/${unitId}/rapat`, data)
  },
  deleteRapat: (id) => {
    return api.delete(`/rka/rapat/${id}`)
  },

  submitUnitProposal: (unitId, data) => {
    return api.post(`/rka/units/${unitId}/submit`, data)
  }
}

export default rkaService
