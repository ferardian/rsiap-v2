import api from './api';

const cutiApprovalService = {
    // Get list of leave requests to approve
    getApprovalList(nik, params = {}) {
        return api.get(`/pegawai/${nik}/cuti/approval`, { params });
    },

    // Approve a leave request
    approveLeave(nik, id) {
        return api.put(`/pegawai/${nik}/cuti/${id}/approve`);
    },

    // Reject a leave request
    rejectLeave(nik, id, reason = null) {
        return api.put(`/pegawai/${nik}/cuti/${id}/reject`, { reason });
    }
};

export default cutiApprovalService;
