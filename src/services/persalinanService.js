import api from './api'

export default {
    getLaporanList(params) {
        return api.get('/laporan/statistik/ranap/persalinan', { params })
    },
    getNonPartusList(params) {
        return api.get('/laporan/statistik/ranap/non-partus', { params })
    },
    getOperasiList(params) {
        return api.get('/operasi/laporan/list', { params })
    },
    getOperasiDetail(params) {
        return api.get('/operasi/laporan', { params })
    },
    getDokter() {
        return api.get('/operasi/dokter')
    },
    getPenjab() {
        return api.get('/operasi/penjab')
    }
}
