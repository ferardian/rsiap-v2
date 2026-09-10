import api from './api'

const timelineService = {
  getPrograms: (params) => {
    return api.get('/timeline/programs', { params })
  },
  getProgramDetail: (id) => {
    return api.get(`/timeline/programs/${id}`)
  },
  createProgram: (data) => {
    return api.post('/timeline/programs', data)
  },
  updateProgram: (id, data) => {
    return api.put(`/timeline/programs/${id}`, data)
  },
  deleteProgram: (id) => {
    return api.delete(`/timeline/programs/${id}`)
  },
  addMilestone: (programId, data) => {
    return api.post(`/timeline/programs/${programId}/milestones`, data)
  },
  updateMilestone: (milestoneId, data) => {
    return api.put(`/timeline/milestones/${milestoneId}`, data)
  },
  deleteMilestone: (milestoneId) => {
    return api.delete(`/timeline/milestones/${milestoneId}`)
  },
  updateMilestoneProgress: (milestoneId, data) => {
    return api.post(`/timeline/milestones/${milestoneId}/progress`, data)
  },
  sendNotification: (milestoneId) => {
    return api.post(`/timeline/milestones/${milestoneId}/notify`)
  },
  searchPegawai: (q) => {
    return api.get('/timeline/pegawai/search', { params: { q } })
  },
  getTeams: () => {
    return api.get('/timeline/teams')
  }
}

export default timelineService
