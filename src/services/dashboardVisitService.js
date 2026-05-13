import api from './api';

const dashboardVisitService = {
    getVisitStats(params = {}) {
        return api.get('/dashboard/visits', { params });
    },
    getVisitDetails(params = {}) {
        return api.get('/dashboard/visits/details', { params });
    }
};

export default dashboardVisitService;
