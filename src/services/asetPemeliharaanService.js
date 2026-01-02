import api from './api'

export const asetPemeliharaanService = {
    // Permintaan Perbaikan
    getPermintaanPerbaikan(params) { return api.get('/aset/permintaan-perbaikan', { params }) },
    createPermintaanPerbaikan(data) { return api.post('/aset/permintaan-perbaikan', data) },
    showPermintaanPerbaikan(id) { return api.get(`/aset/permintaan-perbaikan/${id}`) },
    updatePermintaanPerbaikan(id, data) { return api.put(`/aset/permintaan-perbaikan/${id}`, data) },
    deletePermintaanPerbaikan(id) { return api.delete(`/aset/permintaan-perbaikan/${id}`) },

    // Perbaikan Inventaris
    getPerbaikanInventaris(params) { return api.get('/aset/perbaikan-inventaris', { params }) },
    createPerbaikanInventaris(data) { return api.post('/aset/perbaikan-inventaris', data) },
    showPerbaikanInventaris(id) { return api.get(`/aset/perbaikan-inventaris/${id}`) },
    updatePerbaikanInventaris(id, data) { return api.put(`/aset/perbaikan-inventaris/${id}`, data) },
    deletePerbaikanInventaris(id) { return api.delete(`/aset/perbaikan-inventaris/${id}`) },

    // Pemeliharaan Inventaris
    getPemeliharaanInventaris(params) { return api.get('/aset/pemeliharaan-inventaris', { params }) },
    createPemeliharaanInventaris(data) { return api.post('/aset/pemeliharaan-inventaris', data) },
    updatePemeliharaanInventaris(data) { return api.put('/aset/pemeliharaan-inventaris/update', data) },
    deletePemeliharaanInventaris(data) { return api.delete('/aset/pemeliharaan-inventaris', { data }) },

    // Pemeliharaan Gedung
    getPemeliharaanGedung(params) { return api.get('/aset/pemeliharaan-gedung', { params }) },
    createPemeliharaanGedung(data) { return api.post('/aset/pemeliharaan-gedung', data) },
    showPemeliharaanGedung(id) { return api.get(`/aset/pemeliharaan-gedung/${id}`) },
    updatePemeliharaanGedung(id, data) { return api.put(`/aset/pemeliharaan-gedung/${id}`, data) },
    deletePemeliharaanGedung(id) { return api.delete(`/aset/pemeliharaan-gedung/${id}`) },
}
