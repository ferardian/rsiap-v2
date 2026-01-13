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
    }
}
