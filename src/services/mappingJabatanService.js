import api from './api';

const ENDPOINT = '/sdi/mapping-jabatan';

export default {
    // Get all mappings with optional pagination and search
    getMappings(params) {
        return api.get(ENDPOINT, { params });
    },

    // Create new mapping
    createMapping(data) {
        return api.post(ENDPOINT, data);
    },

    // Update existing mapping
    updateMapping(id, data) {
        return api.put(`${ENDPOINT}/${id}`, data);
    },

    // Delete mapping
    deleteMapping(id) {
        return api.delete(`${ENDPOINT}/${id}`);
    },

    // Get jabatan list for dropdown
    getJabatanList(keyword = '') {
        return api.get(`${ENDPOINT}/jabatan-list`, { params: { keyword } });
    }
};
