import api from '../api'

export const penyakitReportService = {
    getTop10(params = {}) {
        return api.get('/laporan/penyakit/top10', { params })
    },
    getSummary(params = {}) {
        return api.get('/laporan/penyakit/summary', { params })
    }
}
