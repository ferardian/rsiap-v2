import api from './api'

export default {
    getAll(params) {
        return api.get('/rawat-inap/diet', { params })
    },

    getByNoRawat(no_rawat, tanggal) {
        return api.get('/rawat-inap/diet/show', {
            params: { no_rawat, tanggal }
        })
    },

    create(data) {
        return api.post('/rawat-inap/diet', data)
    },

    bulkStore(data) {
        return api.post('/rawat-inap/diet/bulk', data)
    },

    delete(no_rawat, tanggal) {
        return api.delete('/rawat-inap/diet/delete', {
            params: { no_rawat, tanggal }
        })
    }
}
