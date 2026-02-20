import api from './api'

export const suratEksternalService = {
    getSuratEksternal(payload) {
        return api.post('/surat/eksternal/search', payload)
    },

    updateSuratEksternal(id, data) {
        return api.patch(`/surat/eksternal/${id}`, data)
    },

    getStats() {
        return api.get('/surat/eksternal/stats')
    }
}
