import api from './api';

const ENDPOINT = '/sdi/jnj-jabatan';

const jabatanService = {
    search(params) {
        return api.post(`${ENDPOINT}/search`, params);
    },

    index(params) {
        return api.get(ENDPOINT, { params });
    },

    store(data) {
        return api.post(ENDPOINT, data);
    },

    update(kode, data) {
        return api.patch(`${ENDPOINT}/${kode}`, data);
    },

    destroy(kode) {
        return api.delete(`${ENDPOINT}/${kode}`);
    },
};

export default jabatanService;
