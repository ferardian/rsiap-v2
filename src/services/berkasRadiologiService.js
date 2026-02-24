import api from './api'

export const berkasRadiologiService = {
    search(query = '', limit = 10, page = 1, filters = []) {
        return api.post('/berkas/radiologi/search', {
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
        return api.post('/berkas/radiologi', data)
    },

    show(identifier) {
        return api.get(`/berkas/radiologi/${encodeURIComponent(identifier)}`)
    },

    update(identifier, data) {
        return api.post(`/berkas/radiologi/${encodeURIComponent(identifier)}?_method=PUT`, data)
    },

    delete(identifier) {
        return api.delete(`/berkas/radiologi/${encodeURIComponent(identifier)}`)
    }
}
