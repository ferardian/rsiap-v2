import api from './api';

export const kesehatanPegawaiService = {
  getMonitoring(params) {
    return api.get('/sdi/health/monitoring', { params });
  },

  getLeaderboard(params) {
    return api.get('/sdi/health/leaderboard', { params });
  },

  getSummary(params) {
    return api.get('/sdi/health/summary', { params });
  },

  toggleSync(nik) {
    return api.post('/sdi/health/toggle-sync', { nik });
  }
};

export default kesehatanPegawaiService;
