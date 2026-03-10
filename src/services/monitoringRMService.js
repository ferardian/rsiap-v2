import api from './api'

export const monitoringRMService = {
    getData(params) {
        return api({
            url: '/monitoring/rm',
            method: 'get',
            params
        })
    },

    getStats() {
        return api({
            url: '/monitoring/rm/stats',
            method: 'get'
        })
    },

    create(data) {
        return api({
            url: '/monitoring/rm',
            method: 'post',
            data
        })
    },

    update(kode, data) {
        return api({
            url: `/monitoring/rm/${kode}`,
            method: 'put',
            data
        })
    },

    delete(kode) {
        return api({
            url: `/monitoring/rm/${kode}`,
            method: 'delete'
        })
    },

    getDepartemen() {
        return api({
            url: '/monitoring/rm/departemen',
            method: 'get'
        })
    }
}
