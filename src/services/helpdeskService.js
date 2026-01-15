import api from './api';

const helpdeskService = {
    getTickets: (params) => api.get('/helpdesk/tiket', { params }),
    updateStatus: (id, status) => api.put(`/helpdesk/tiket/${id}/status`, { status }),
};

export default helpdeskService;
