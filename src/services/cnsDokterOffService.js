import api from './api';

const cnsDokterOffService = {
    /**
     * Get pasien registrasi filtered by date, dokter, poli
     */
    getRegistrasi: (params) => api.get('/cns/dokter-off', { params }),

    /**
     * Get jadwal pengganti for a specific dokter on a date
     */
    getJadwalPengganti: (params) => api.get('/cns/dokter-off/jadwal-pengganti', { params }),

    /**
     * Send notification to selected patients
     */
    kirimNotifikasi: (payload) => api.post('/cns/dokter-off/kirim-notifikasi', payload),

    /**
     * Get list of dokter for dropdown (only those with jadwal)
     */
    getDokterList: () => api.get('/cns/dokter-off/dokter'),

    /**
     * Get list of poliklinik for dropdown (only those with jadwal)
     */
    getPoliklinikList: () => api.get('/cns/dokter-off/poliklinik'),

    // === Jam Poli ===
    getRegistrasiJamPoli: (params) => api.get('/cns/jam-poli', { params }),
    kirimNotifikasiJamPoli: (payload) => api.post('/cns/jam-poli/kirim-notifikasi', payload),

    // === Konfirmasi Hadir ===
    getRegistrasiKonfirmasiHadir: (params) => api.get('/cns/konfirmasi-hadir', { params }),
    kirimNotifikasiKonfirmasiHadir: (payload) => api.post('/cns/konfirmasi-hadir/kirim-notifikasi', payload),

    // === Kontrol ===
    getKontrolList: (params) => api.get('/cns/kontrol', { params }),
    kirimNotifikasiKontrol: (payload) => api.post('/cns/kontrol/kirim-notifikasi', payload),

    // === Broadcast Karyawan ===
    getBroadcastPegawai: (params) => api.get('/cns/broadcast/pegawai', { params }),
    getBroadcastDepartemen: () => api.get('/cns/broadcast/departemen'),
    kirimNotifikasiBroadcast: (payload) => api.post('/cns/broadcast/kirim-notifikasi', payload),
};

export default cnsDokterOffService;

