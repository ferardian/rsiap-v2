import api from './api'

export default {
    // Get Rawat Inap data with filters
    getRawatInap(params) {
        return api.get('/rawat-inap', { params })
    },

    // Alias for consistency with other services
    getAll(params) {
        return this.getRawatInap(params)
    },

    // Get Spesialis list for filter
    getSpesialis() {
        return api.get('/rawat-inap/spesialis')
    },

    // Get Dokter list (can reuse if needed, or fetch specific for ranap)
    // For now we might use the general dokter endpoint if RawatInapController doesn't have one specific
    // But RawatJalanService uses /rawat-jalan/dokter. 
    // Let's assume we can use the same endpoint or a new one. 
    // Usually dokter data is shared. But let's check if we need a specific one.
    // RawatJalanController has 'dokter' method. RawatInapController doesn't yet.
    // For now, let's use the one from Rawat Jalan or general if available. 
    // Actually, let's use RawatJalanService.getDokter() in the view for now, or add a general one.
    // Wait, better to keep services independent. I'll add a 'dokter' method to RawatInapController later if needed.
    // NOTE: For now, I'll reuse the rawat-jalan/dokter endpoint in the View or add it here pointing to that?
    // Let's point to rawat-jalan/dokter for now as it returns all doctors.
    getDokter() {
        return api.get('/rawat-jalan/dokter')
    },

    // Get Pemeriksaan Ranap (RME)
    getPemeriksaanRanap(no_rkm_medis, no_rawat) {
        const encodedNoRawat = btoa(no_rawat);
        return api.get(`/pasien/${no_rkm_medis}/riwayat/${encodedNoRawat}/ranap`);
    },

    // Get Billing Data
    getBilling(no_rawat) {
        const encodedNoRawat = btoa(no_rawat);
        return api.get(`/rawat-inap/billing`, {
            params: {
                no_rawat: encodedNoRawat
            }
        });
    },

    // Get Penunjang Data (Lab & Rad)
    getPenunjang(no_rawat) {
        const encodedNoRawat = btoa(no_rawat);
        return api.get(`/rawat-inap/penunjang`, {
            params: {
                no_rawat: encodedNoRawat
            }
        });
    }
}
