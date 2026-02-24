import api from './api'

export const berkasIhtService = {
    search(query = '', limit = 10, page = 1, filters = []) {
        return api.post('/berkas/iht/search', {
            search: { value: query },
            limit: limit,
            page: page,
            filters: filters,
            sort: [
                { field: 'created_at', direction: 'desc' }
            ]
        })
    },

    store(data) {
        return api.post('/berkas/iht', data)
    },

    show(identifier) {
        return api.get(`/berkas/iht/${encodeURIComponent(identifier)}`)
    },

    update(identifier, data) {
        return api.post(`/berkas/iht/${encodeURIComponent(identifier)}?_method=PUT`, data)
    },

    delete(identifier) {
        return api.delete(`/berkas/iht/${encodeURIComponent(identifier)}`)
    }
}
