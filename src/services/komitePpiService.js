import api from './api'

export const komitePpiService = {
    search(query = '', limit = 10, page = 1, filters = []) {
        return api.post('/berkas/komite/ppi/search', {
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
        return api.post('/berkas/komite/ppi', data)
    },

    show(identifier) {
        return api.get(`/berkas/komite/ppi/${encodeURIComponent(identifier)}`)
    },

    update(identifier, data) {
        return api.post(`/berkas/komite/ppi/${encodeURIComponent(identifier)}?_method=PUT`, data)
    },

    delete(identifier) {
        return api.delete(`/berkas/komite/ppi/${encodeURIComponent(identifier)}`)
    }
}
