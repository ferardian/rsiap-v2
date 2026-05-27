import api from './api'

export const kepatuhanErmService = {
    getData(params) {
        return api({
            url: '/monitoring/kepatuhan-erm',
            method: 'get',
            params
        })
    },

    getStats(params) {
        return api({
            url: '/monitoring/kepatuhan-erm/stats',
            method: 'get',
            params
        })
    },

    getDokterStats(params) {
        return api({
            url: '/monitoring/kepatuhan-erm/dokter',
            method: 'get',
            params
        })
    },

    getDokter() {
        return api({
            url: '/monitoring/rm/pegawai', // Reuse existing pegawai/dokter endpoint
            method: 'get'
        })
    }
}
