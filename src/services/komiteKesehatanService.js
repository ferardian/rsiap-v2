import api from './api'

export const komiteKesehatanService = {
    search(query = '', limit = 10, page = 1, filters = []) {
        return api.post('/berkas/komite/kesehatan/search', {
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
        return api.post('/berkas/komite/kesehatan', data)
    },

    show(identifier) {
        return api.get(`/berkas/komite/kesehatan/${encodeURIComponent(identifier)}`)
    },

    update(identifier, data) {
        // Backend requires PUT method but using post and _method for body content
        return api.post(`/berkas/komite/kesehatan/${encodeURIComponent(identifier)}?_method=PUT`, data)
    },

    delete(identifier) {
        return api.delete(`/berkas/komite/kesehatan/${encodeURIComponent(identifier)}`)
    }
}
