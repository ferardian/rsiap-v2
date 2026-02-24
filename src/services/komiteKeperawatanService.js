import api from './api'

export const komiteKeperawatanService = {
    search(query = '', limit = 10, page = 1, filters = []) {
        return api.post('/berkas/komite/keperawatan/search', {
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
        return api.post('/berkas/komite/keperawatan', data)
    },

    show(identifier) {
        return api.get(`/berkas/komite/keperawatan/${encodeURIComponent(identifier)}`)
    },

    update(identifier, data) {
        // API backend menggunakan apiResource (termasuk PUT/PATCH) dan parameter expect URL segment yang aman.
        return api.post(`/berkas/komite/keperawatan/${encodeURIComponent(identifier)}?_method=PUT`, data)
    },

    delete(identifier) {
        return api.delete(`/berkas/komite/keperawatan/${encodeURIComponent(identifier)}`)
    }
}
