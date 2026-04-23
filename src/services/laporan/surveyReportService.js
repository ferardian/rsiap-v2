import api from '../api'

export const surveyReportService = {
  getSummary(params) {
    return api.get('/laporan/survey/summary', { params })
  },
  getDetails(params) {
    return api.get('/laporan/survey/details', { params })
  }
}
