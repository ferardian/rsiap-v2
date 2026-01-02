import api from './api';

const cutiPegawaiService = {
    // Get list of leave requests for a specific employee
    getCuti(nik, params = {}) {
        return api.get(`/pegawai/${nik}/cuti`, { params });
    },

    // Get leave counter summary
    getCounter(nik, params = {}) {
        return api.get(`/pegawai/${nik}/cuti/counter`, { params });
    },

    // Submit a new leave request
    createCuti(nik, data) {
        return api.post(`/pegawai/${nik}/cuti`, data);
    },

    // Delete a leave request
    deleteCuti(nik, id) {
        return api.delete(`/pegawai/${nik}/cuti/${id}`);
    }
};

export default cutiPegawaiService;
