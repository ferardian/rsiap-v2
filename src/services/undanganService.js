import api from './api'

export const undanganService = {
    search(keyword, limit = 10, page = 1, filters = []) {
        return api.post('/undangan/search?include=penanggungJawab', {
            search: { value: keyword },
            limit: limit,
            page: page,
            filters: filters,
            sort: [
                { field: 'tanggal', direction: 'desc' },
                { field: 'created_at', direction: 'desc' }
            ]
        })
    },

    show(identifier) {
        return api.get(`/undangan/${encodeURIComponent(identifier)}?include=penanggungJawab`)
    },

    getQr(id) {
        return api.get(`/undangan/${id}/qr`)
    },

    getProof(id) {
        return api.get(`/undangan/${id}/proof`, { responseType: 'blob' })
    },

    getNotulen(id) {
        return api.get(`/undangan/${id}/notulen`)
    },

    download(id) {
        return api.get(`/undangan/${id}/download`, { responseType: 'blob' })
    },

    getRecipients(id) {
        return api.get(`/undangan/penerima/${id}`)
    },

    updateRecipients(undanganId, recipients) {
        return api.post('/undangan/penerima', {
            undangan_id: undanganId,
            penerima: recipients
        })
    }
}
