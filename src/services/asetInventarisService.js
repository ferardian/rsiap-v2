import api from './api'

export const asetInventarisService = {
    // Master Barang
    getBarang(params) { return api.get('/aset/inventaris-barang', { params }) },
    createBarang(data) { return api.post('/aset/inventaris-barang', data) },
    updateBarang(id, data) { return api.put(`/aset/inventaris-barang/${id}`, data) },
    deleteBarang(id) { return api.delete(`/aset/inventaris-barang/${id}`) },

    // Item Inventaris
    getInventaris(params) { return api.get('/aset/inventaris', { params }) },
    createInventaris(data) { return api.post('/aset/inventaris', data) },
    updateInventaris(id, data) { return api.put(`/aset/inventaris/${id}`, data) },
    deleteInventaris(id) { return api.delete(`/aset/inventaris/${id}`) },

    // Sirkulasi (Peminjaman)
    getPeminjaman(params) { return api.get('/aset/sirkulasi', { params }) },
    createPeminjaman(data) { return api.post('/aset/sirkulasi', data) },
    // For update/delete sirkulasi, we might need custom logic due to composite keys, 
    // but for now relying on backend handling or specific params if needed.
    updatePeminjaman(data) { return api.put(`/aset/sirkulasi/update`, data) }, // Check backend route for update
    deletePeminjaman(data) { return api.delete(`/aset/sirkulasi`, { data }) }, // Delete with body

    // Hibah
    getHibah(params) { return api.get('/aset/hibah', { params }) },
    createHibah(data) { return api.post('/aset/hibah', data) },
    deleteHibah(id) { return api.delete(`/aset/hibah/${id}`) },
}
