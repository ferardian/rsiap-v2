import api from '@/services/api'

export const morbiditasRalanService = {
    getData(params) {
        return api.get('/laporan/statistik/ralan/morbiditas', { params })
    },
    getDetails(params) {
        return api.get('/laporan/statistik/ralan/morbiditas/detail', { params })
    }
}
