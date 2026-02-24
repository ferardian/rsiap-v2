import api from './api'

export const komitePmkpService = {
    search(query = '', limit = 10, page = 1, filters = []) {
        return api.post('/berkas/komite/pmkp/search', {
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
        return api.post('/berkas/komite/pmkp', data)
    },

    show(identifier) {
        return api.get(`/berkas/komite/pmkp/${encodeURIComponent(identifier)}`)
    },

    update(identifier, data) {
        return api.post(`/berkas/komite/pmkp/${encodeURIComponent(identifier)}?_method=PUT`, data)
    },

    delete(identifier) {
        return api.delete(`/berkas/komite/pmkp/${encodeURIComponent(identifier)}`)
    }
}
