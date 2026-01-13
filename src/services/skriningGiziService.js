import api from './api'

export default {
    getAll(params) {
        return api.get('/rawat-inap/skrining-gizi', { params })
    },

    getByNoRawat(no_rawat) {
        return api.get(`/rawat-inap/skrining-gizi/${no_rawat}`)
    },

    save(data) {
        return api.post('/rawat-inap/skrining-gizi', data)
    },

    delete(no_rawat) {
        return api.delete(`/rawat-inap/skrining-gizi/${no_rawat}`)
    }
}
