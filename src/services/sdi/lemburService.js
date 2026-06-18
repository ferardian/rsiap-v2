import api from '../api';

export const lemburService = {
  getApprovalList(params) {
    return api.get('/sdi/lembur/approval', { params });
  },
  approveLembur(payload) {
    return api.post('/sdi/lembur/approve', payload);
  },
  rejectLembur(payload) {
    return api.post('/sdi/lembur/reject', payload);
  },
  getSplList(params) {
    return api.get('/sdi/lembur/spl', { params });
  },
  getLastSplNumber() {
    return api.get('/sdi/lembur/spl/last');
  },
  storeSpl(payload) {
    return api.post('/sdi/lembur/spl', payload);
  },
  destroySpl(payload) {
    return api.delete('/sdi/lembur/spl', { data: payload });
  }
};

