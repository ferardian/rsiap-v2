import api from './api'

export default {
    // Get Rawat Jalan data with filters
    getRawatJalan(params) {
        return api.get('/rawat-jalan', { params })
    },

    // Get Poliklinik list
    getPoliklinik() {
        return api.get('/rawat-jalan/poli')
    },

    // Get Dokter list
    getDokter() {
        return api.get('/rawat-jalan/dokter')
    },

    // Get Pemeriksaan Ralan (RME)
    getPemeriksaanRalan(no_rkm_medis, no_rawat) {
        const encodedNoRawat = btoa(no_rawat);
        return api.get(`/pasien/${no_rkm_medis}/riwayat/${encodedNoRawat}/ralan`);
    },

    // Get Billing Data
    getBilling(no_rawat) {
        const encodedNoRawat = btoa(no_rawat);
        return api.get(`/rawat-jalan/billing`, {
            params: {
                no_rawat: encodedNoRawat
            }
        });
    },

    // Get Penunjang Data (Lab & Rad)
    getPenunjang(no_rawat) {
        const encodedNoRawat = btoa(no_rawat);
        return api.get(`/rawat-jalan/penunjang`, {
            params: {
                no_rawat: encodedNoRawat
            }
        });
    },

    // Get Surat Layak Terbang
    getSuratTerbang(no_rawat) {
        return api.get('/rawat-jalan/surat-terbang', {
            params: { no_rawat }
        });
    },

    // Save/Update Surat Layak Terbang
    saveSuratTerbang(data) {
        return api.post('/rawat-jalan/surat-terbang', data);
    },

    // Get Next Auto Number for Surat Terbang
    getNextSuratTerbangNumber() {
        return api.get('/rawat-jalan/surat-terbang/next-number');
    },

    // Delete Surat Layak Terbang
    deleteSuratTerbang(no_surat) {
        return api.delete('/rawat-jalan/surat-terbang', {
            params: { no_surat }
        });
    },

    // Get Surat Sakit
    getSuratSakit(no_rawat) {
        return api.get('/rawat-jalan/surat-sakit', {
            params: { no_rawat }
        });
    },

    // Save/Update Surat Sakit
    saveSuratSakit(data) {
        return api.post('/rawat-jalan/surat-sakit', data);
    },

    // Get Next Auto Number for Surat Sakit
    getNextSuratSakitNumber(tanggalawal) {
        return api.get('/rawat-jalan/surat-sakit/next-number', {
            params: { tanggalawal }
        });
    },

    // Delete Surat Sakit
    deleteSuratSakit(no_surat) {
        return api.delete('/rawat-jalan/surat-sakit', {
            params: { no_surat }
        });
    },

    // Get Surat Sehat
    getSuratSehat(no_rawat) {
        return api.get('/rawat-jalan/surat-sehat', {
            params: { no_rawat }
        });
    },

    // Save/Update Surat Sehat
    saveSuratSehat(data) {
        return api.post('/rawat-jalan/surat-sehat', data);
    },

    // Get Next Auto Number for Surat Sehat
    getNextSuratSehatNumber(tanggalsurat) {
        return api.get('/rawat-jalan/surat-sehat/next-number', {
            params: { tanggalsurat }
        });
    },

    // Delete Surat Sehat
    deleteSuratSehat(no_surat) {
        return api.delete('/rawat-jalan/surat-sehat', {
            params: { no_surat }
        });
    }
}
