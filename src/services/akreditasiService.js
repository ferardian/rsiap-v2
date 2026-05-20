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
};

export default service;
