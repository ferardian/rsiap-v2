import api from '@/services/api'

export const kunjunganRl35Service = {
    getData(params) {
        return api.get('/laporan/kunjungan-rl35', { params })
    },
    getDetail(params) {
        return api.get('/laporan/kunjungan-rl35/detail', { params })
    }
}
