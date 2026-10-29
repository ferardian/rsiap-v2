import api from './api';

const ENDPOINT = '/sdi/pendidikan';

const pendidikanService = {
    search(params) {
        return api.post(`${ENDPOINT}/search`, params);
    },

    index(params) {
        return api.get(ENDPOINT, { params });
    },

    show(tingkat) {
        return api.get(`${ENDPOINT}/${encodeURIComponent(tingkat)}`);
    },

    store(data) {
        return api.post(ENDPOINT, data);
    },

    update(tingkat, data) {
        return api.patch(`${ENDPOINT}/${encodeURIComponent(tingkat)}`, data);
    },

    destroy(tingkat) {
        return api.delete(`${ENDPOINT}/${encodeURIComponent(tingkat)}`);
    },
};

export default pendidikanService;
