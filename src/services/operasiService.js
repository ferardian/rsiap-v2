import api from './api'

export default {
    getPaket(params) {
        return api.get('/operasi/paket', { params })
    },

    getBooking(params) {
        return api.get('/operasi/booking', { params })
    },

    storeBooking(data) {
        return api.post('/operasi/booking', data)
    },
    updateStatus(no_rawat, tanggal, status) {
        return api.put(`/operasi/booking/${encodeURIComponent(no_rawat)}/${encodeURIComponent(tanggal)}`, { status })
    },
    deleteBooking(no_rawat, tanggal) {
        return api.delete('/operasi/booking', {
            params: { no_rawat, tanggal }
        })
    },

    // Laporan Operasi
    getLaporanList(params) {
        return api.get('/operasi/laporan/list', { params })
    },
    getLaporan(params) {
        return api.get('/operasi/laporan', { params })
    },
    storeLaporan(data) {
        return api.post('/operasi/laporan', data)
    },
    getDokter() {
        return api.get('/operasi/dokter')
    },
    getPegawai() {
        return api.get('/operasi/pegawai')
    }
}
