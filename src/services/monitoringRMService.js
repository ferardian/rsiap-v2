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

    update(id, data) {
        return api({
            url: `/monitoring/rm/${id}`,
            method: 'put',
            data
        })
    },

    delete(id) {
        return api({
            url: `/monitoring/rm/${id}`,
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
