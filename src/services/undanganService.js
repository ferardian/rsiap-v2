import api from './api'

export const undanganService = {
    search(keyword, limit = 10, page = 1, filters = [], scopes = [], extraParams = {}) {
        const payload = {
            search: { value: keyword },
            limit: limit,
            page: page,
            filters: filters,
            sort: [
                { field: 'tanggal', direction: 'desc' },
                { field: 'created_at', direction: 'desc' }
            ],
            ...extraParams
        }

        if (scopes && scopes.length > 0) {
            payload.scopes = scopes
        }

        return api.post('/undangan/search?include=penanggungJawab', payload)
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

    saveNotulen(id, data) {
        return api.post(`/undangan/${id}/notulen`, data)
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
    },

    getAttendance(id) {
        return api.get(`/undangan/kehadiran/${id}`)
    },

    markAttendance(undanganId, niks) {
        return api.post('/undangan/kehadiran', {
            undangan_id: undanganId,
            nik: Array.isArray(niks) ? niks : [niks]
        })
    },

    getTindakLanjut(undanganId) {
        return api.get(`/undangan/${undanganId}/tindak-lanjut`)
    },

    addTindakLanjut(undanganId, data) {
        return api.post(`/undangan/${undanganId}/tindak-lanjut`, data)
    },

    updateTindakLanjut(id, data) {
        return api.put(`/undangan/tindak-lanjut/${id}`, data)
    },

    deleteTindakLanjut(id) {
        return api.delete(`/undangan/tindak-lanjut/${id}`)
    }
}
