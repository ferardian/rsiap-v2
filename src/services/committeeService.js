import api from './api';

const CommitteeService = {
    index() {
        return api.get('/sdi/committees');
    },

    getAllMembers() {
        return api.get('/sdi/committees/anggota');
    },

    getByNik(nik) {
        return api.get(`/sdi/committees/pegawai/${nik}`);
    },

    store(data) {
        return api.post('/sdi/committees/anggota', data);
    },

    update(id, data) {
        return api.put(`/sdi/committees/anggota/${id}`, data);
    },

    destroy(id) {
        return api.delete(`/sdi/committees/anggota/${id}`);
    }
};

export default CommitteeService;
