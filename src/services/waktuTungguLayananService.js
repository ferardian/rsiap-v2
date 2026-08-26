import api from './api'

const waktuTungguLayananService = {
    getAnalytics(params) {
        return api.get('/laporan/waktu-tunggu-waktu-layanan', { params })
    }
}

export default waktuTungguLayananService
