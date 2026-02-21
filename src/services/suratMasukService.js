import api from './api'

export const suratMasukService = {
    getSuratMasuk(payload = {}) {
        return api.post('/surat/masuk/search', payload)
    },

    getStats(params = {}) {
        return api.get('/surat/masuk/stats', { params })
    },

    storeSuratMasuk(data) {
        // When using FormData for file uploads, we need to let the browser set the Content-Type to multipart/form-data
        return api.post('/surat/masuk', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    updateSuratMasuk(id, data) {
        return api.post(`/surat/masuk/${id}?_method=PUT`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    deleteSuratMasuk(id) {
        return api.delete(`/surat/masuk/${id}`)
    }
}
