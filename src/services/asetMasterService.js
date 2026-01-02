import api from './api'

export const asetMasterService = {
    // Jenis Inventaris
    getJenis(params) { return api.get('/aset/jenis', { params }) },
    createJenis(data) { return api.post('/aset/jenis', data) },
    updateJenis(id, data) { return api.put(`/aset/jenis/${id}`, data) },
    deleteJenis(id) { return api.delete(`/aset/jenis/${id}`) },

    // Kategori Inventaris
    getKategori(params) { return api.get('/aset/kategori', { params }) },
    createKategori(data) { return api.post('/aset/kategori', data) },
    updateKategori(id, data) { return api.put(`/aset/kategori/${id}`, data) },
    deleteKategori(id) { return api.delete(`/aset/kategori/${id}`) },

    // Merk Inventaris
    getMerk(params) { return api.get('/aset/merk', { params }) },
    createMerk(data) { return api.post('/aset/merk', data) },
    updateMerk(id, data) { return api.put(`/aset/merk/${id}`, data) },
    deleteMerk(id) { return api.delete(`/aset/merk/${id}`) },

    // Produsen Inventaris
    getProdusen(params) { return api.get('/aset/produsen', { params }) },
    createProdusen(data) { return api.post('/aset/produsen', data) },
    updateProdusen(id, data) { return api.put(`/aset/produsen/${id}`, data) },
    deleteProdusen(id) { return api.delete(`/aset/produsen/${id}`) },

    // Ruang Inventaris
    getRuang(params) { return api.get('/aset/ruang', { params }) },
    createRuang(data) { return api.post('/aset/ruang', data) },
    updateRuang(id, data) { return api.put(`/aset/ruang/${id}`, data) },
    deleteRuang(id) { return api.delete(`/aset/ruang/${id}`) },

    // Suplier Inventaris
    getSuplier(params) { return api.get('/aset/suplier', { params }) },
    createSuplier(data) { return api.post('/aset/suplier', data) },
    updateSuplier(id, data) { return api.put(`/aset/suplier/${id}`, data) },
    deleteSuplier(id) { return api.delete(`/aset/suplier/${id}`) },
}
