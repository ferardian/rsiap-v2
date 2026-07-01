import api from './api'

const pegawaiFaceMasterService = {
    getFaceMasters(params) {
        return api.get('pegawai/face-master', { params })
    },

    storeFaceMaster(formData) {
        return api.post('pegawai/face-master', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    updateFaceMaster(id, formData) {
        return api.post(`pegawai/face-master/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    deleteFaceMaster(id) {
        return api.delete(`pegawai/face-master/${id}`)
    }
}

export default pegawaiFaceMasterService
