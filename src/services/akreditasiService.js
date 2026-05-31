import api from './api';

const service = {
    // Get list of Bab
    getBab: (params = {}) => api.get('/akred/bab', { params }),

    // Get list of Pokja
    getPokja: (params = {}) => api.get('/akred/pokja', { params }),

    // Get list of Standar
    getStandar: (params = {}) => api.get('/akred/standar', { params }),

    // Search Standar using POST
    searchStandar: (payload) => api.post('/akred/standar/search', payload),

    // Get list of Elemen Penilaian
    getElemenPenilaian: (params = {}) => api.get('/akred/elemen-penilaian', { params }),

    // Search Elemen Penilaian using POST
    searchElemenPenilaian: (payload) => api.post('/akred/elemen-penilaian/search', payload),

    // Get single Elemen Penilaian by ID
    getElemenPenilaianById: (id, params = {}) => api.get(`/akred/elemen-penilaian/${id}`, { params }),

    // Elemen Penilaian Todo CRUD
    getTodos: (params = {}) => api.get('/akred/elemen-penilaian-todo', { params }),
    createTodo: (payload) => api.post('/akred/elemen-penilaian-todo', payload),
    updateTodo: (id, payload) => api.patch(`/akred/elemen-penilaian-todo/${id}`, payload),
    deleteTodo: (id) => api.delete(`/akred/elemen-penilaian-todo/${id}`),

    // Elemen Penilaian Dokumen Bukti
    uploadDokumen: (payload) => api.post('/akred/elemen-penilaian-dokumen', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteDokumen: (id) => api.delete(`/akred/elemen-penilaian-dokumen/${id}`),

    // Tim Akreditasi CRUD
    getTim: (params = {}) => api.get('/akred/tim', { params }),
    getTimById: (id, params = {}) => api.get(`/akred/tim/${id}`, { params }),
    createTim: (payload) => api.post('/akred/tim', payload),
    updateTim: (id, payload) => api.patch(`/akred/tim/${id}`, payload),
    deleteTim: (id) => api.delete(`/akred/tim/${id}`),
};

export default service;
