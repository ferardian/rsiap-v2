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
    },

    getPegawai() {
        return api({
            url: '/monitoring/rm/pegawai',
            method: 'get'
        })
    },

    uploadFile(id, formData) {
        return api({
            url: `/monitoring/rm/${id}/files`,
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: formData
        })
    },

    deleteFile(id, fileId) {
        return api({
            url: `/monitoring/rm/${id}/files/${fileId}`,
            method: 'delete'
        })
    },

    getLogs(id) {
        return api({
            url: `/monitoring/rm/${id}/logs`,
            method: 'get'
        })
    }
}
