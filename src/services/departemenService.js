import api from './api';

const departemenService = {
    // Search and List (Orion pattern)
    search(params) {
        return api.post('/sdi/departemen/search', params);
    },

    index(params) {
        return api.get('/sdi/departemen', { params });
    },

    show(id) {
        return api.get(`/sdi/departemen/${id}`);
    },

    store(data) {
        return api.post('/sdi/departemen', data);
    },

    update(id, data) {
        return api.patch(`/sdi/departemen/${id}`, data);
    },

    destroy(id) {
        return api.delete(`/sdi/departemen/${id}`);
    },

    getNextId() {
        return api.get('/sdi/departemen/next-id');
    }
};

export default departemenService;
