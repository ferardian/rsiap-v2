import api from '@/services/api'

export const caraBayarRl319Service = {
    getData(params) {
        return api.get('/laporan/rl3-19-carabayar', { params })
    },
    getDetail(params) {
        return api.get('/laporan/rl3-19-carabayar/detail', { params })
    }
}
