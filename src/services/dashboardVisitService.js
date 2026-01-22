import api from './api';

const dashboardVisitService = {
    getVisitStats(params = {}) {
        return api.get('/dashboard/visits', { params });
    }
};

export default dashboardVisitService;
