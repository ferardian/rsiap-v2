import api from './api';

const service = {
    // Get Diagnosa (ICD-10) Report
    getDiagnosaReport: (params) => api.get('/laporan/diagnosa-procedure/diagnosa', { params }),

    // Get Prosedur (ICD-9) Report
    getProsedurReport: (params) => api.get('/laporan/diagnosa-procedure/procedure', { params }),
};

export default service;
