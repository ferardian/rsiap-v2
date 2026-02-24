import api from './api';

const hfisScheduleService = {
    getCertificates(params) {
        return api.get('/sdi/hfis/sk-jadwal', { params });
    },

    getCertificate(id) {
        return api.get(`/sdi/hfis/sk-jadwal/${id}`);
    },

    storeCertificate(data) {
        return api.post('/sdi/hfis/sk-jadwal', data);
    },

    updateCertificate(id, data) {
        return api.put(`/sdi/hfis/sk-jadwal/${id}`, data);
    },

    deleteCertificate(id) {
        return api.delete(`/sdi/hfis/sk-jadwal/${id}`);
    },

    downloadPdf(id) {
        return api.get(`/sdi/hfis/sk-jadwal/${id}/pdf`, {
            responseType: 'blob'
        });
    },

    downloadPdfBulk(ids) {
        return api.post('/sdi/hfis/sk-jadwal/pdf/bulk', { ids }, {
            responseType: 'blob'
        });
    },

    getPdfUrl(id) {
        // Return the absolute URL for the PDF stream
        const baseUrl = api.defaults.baseURL;
        return `${baseUrl}/sdi/hfis/sk-jadwal/${id}/pdf`;
    },

    getDokter() {
        return api.get('/sdi/dokter');
    },

    getPoliMappings() {
        return api.get('/sdi/hfis/sk-jadwal/resource/poli-mappings');
    },

    updateHfis(payload) {
        return api.post('/sdi/hfis/sk-jadwal/update-jadwal', payload);
    },

    getJadwalDokter(poli, tanggal) {
        return api.get(`/sdi/hfis/sk-jadwal/jadwal-dokter/${poli}/tanggal/${tanggal}`);
    }
};

export default hfisScheduleService;
