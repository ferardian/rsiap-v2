import api from './api';

const cutiService = {
    // Get summary of leave usage per semester for all active staff
    getRekapCuti(params = {}) {
        return api.get('/sdi/rekap-cuti', { params });
    },

    // Get department list for filters
    getDepartemen() {
        return api.post('/sdi/departemen/search', {
            scopes: [],
            filters: []
        });
    }
};

export default cutiService;
