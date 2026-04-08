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

    // Get Google Reviews
    getReviews() {
        return api.get('/dashboard/reviews');
    },

    // Get all employee mood check-ins
    getMoodAll(params) {
        return api.get('/sdi/mood/all', { params });
    },

    // Get team mood statistics
    getMoodStats() {
        return api.get('/sdi/mood/team-stats');
    },

    // Delete code blue schedule
    deleteCodeBlueSchedule(date) {
        return api.delete(`/codeblue/schedule/${date}`);
    }
};

export default dashboardService;
