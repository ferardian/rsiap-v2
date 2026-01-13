import api from './api';

const service = {
    // Kode Satuan
    getSatuan: (params) => api.get('/logistik/satuan', { params }),
    getSatuanById: (id) => api.get(`/logistik/satuan/${id}`),
    createSatuan: (data) => api.post('/logistik/satuan', data),
    updateSatuan: (id, data) => api.put(`/logistik/satuan/${id}`, data),
    deleteSatuan: (id) => api.delete(`/logistik/satuan/${id}`),

    // Jenis Barang
    getNextJenisCode: () => api.get('/logistik/jenis-barang/next-code'),
    getJenisBarang: (params) => api.get('/logistik/jenis-barang', { params }),
    getJenisBarangById: (id) => api.get(`/logistik/jenis-barang/${id}`),
    createJenisBarang: (data) => api.post('/logistik/jenis-barang', data),
    updateJenisBarang: (id, data) => api.put(`/logistik/jenis-barang/${id}`, data),
    deleteJenisBarang: (id) => api.delete(`/logistik/jenis-barang/${id}`),

    // Supplier
    getNextSupplierCode: () => api.get('/logistik/supplier/next-code'),
    getSuppliers: (params) => api.get('/logistik/supplier', { params }),
    createSupplier: (data) => api.post('/logistik/supplier', data),
    updateSupplier: (id, data) => api.put(`/logistik/supplier/${id}`, data),
    deleteSupplier: (id) => api.delete(`/logistik/supplier/${id}`),

    // Barang
    getNextBarangCode: () => api.get('/logistik/barang/next-code'),
    getBarang: (params) => api.get('/logistik/barang', { params }),
    getBarangById: (id) => api.get(`/logistik/barang/${id}`),
    createBarang: (data) => api.post('/logistik/barang', data),
    updateBarang: (id, data) => api.put(`/logistik/barang/${id}`, data),
    deleteBarang: (id) => api.delete(`/logistik/barang/${id}`)
};

export default service;
