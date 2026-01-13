import api from './api';

const dashboardService = {
    // Get dashboard statistics
    getStats(params) {
        return api.get('/dashboard/stats', { params });
    },

    // Get code blue schedule for today
    getCodeBlueSchedule() {
        return api.get('/dashboard/codeblue');
    },

    // Get code blue schedule by date
    getCodeBlueScheduleByDate(date) {
        return api.get(`/codeblue/schedule/${date}`);
    },

    // Save/Update code blue schedule
    saveCodeBlueSchedule(data) {
        return api.post('/codeblue/schedule', data);
    },

    // Delete code blue schedule
    deleteCodeBlueSchedule(date) {
        return api.delete(`/codeblue/schedule/${date}`);
    }
};

export default dashboardService;
