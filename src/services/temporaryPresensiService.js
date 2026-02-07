import api from './api';

const temporaryPresensiService = {
    get(params) {
        return api.get('/sdi/temporary-presensi', { params });
    }
};

export default temporaryPresensiService;
