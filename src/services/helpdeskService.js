import api from './api';

const helpdeskService = {
    // Ambil data laporan sementara (WA)
    getTempLogs: (params) => api.get('/helpdesk/tiket', { params }),
    getTickets: (params) => api.get('/helpdesk/tiket', { params }), // Alias for backward compatibility

    // Update status laporan sementara
    updateTempLogStatus: (id, status) => api.put(`/helpdesk/tiket/${id}/status`, { status }),
    updateStatus: (id, status) => api.put(`/helpdesk/tiket/${id}/status`, { status }), // Alias for backward compatibility

    // Ambil data tiket resmi
    getActiveTickets: (params) => api.get('/helpdesk/tiket/active', { params }),

    // Terbitkan tiket dari laporan sementara
    createTicketFromLog: (payload) => api.post('/helpdesk/tiket/create', payload),

    // Update detail tiket resmi (teknisi, solusi, status, dll)
    updateTicket: (id, payload) => api.put(`/helpdesk/tiket/${id}/update`, payload),

    // Ambil data statistik dashboard helpdesk
    getDashboardData: (params) => api.get('/helpdesk/tiket/dashboard-data', { params }),
};

export default helpdeskService;
