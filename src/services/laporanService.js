import api from './api';

const service = {
    // Get Diagnosa (ICD-10) Report
    getDiagnosaReport: (params) => api.get('/laporan/diagnosa-procedure/diagnosa', { params }),

    // Get Prosedur (ICD-9) Report
    getProsedurReport(params) {
        return api.get('/laporan/diagnosa-procedure/procedure', { params });
    },
    getDiagnosaPatients(params) {
        return api.get('/laporan/diagnosa-procedure/diagnosa/patients', { params });
    },
    getProsedurPatients(params) {
        return api.get('/laporan/diagnosa-procedure/procedure/patients', { params });
    }
};

export default service;
