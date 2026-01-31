import api from './api'

export default {
    getAllFacilities() {
        return api.get('/facility/all')
    },

    getActiveFacilities() {
        return api.get('/facility')
    },

    createFacility(data) {
        return api.post('/facility', data)
    },

    updateFacility(id, data) {
        return api.post(`/facility/${id}`, data)
    },

    deleteFacility(id) {
        return api.delete(`/facility/${id}`)
    },

    updateStatus(id, status) {
        return api.post(`/facility/${id}/status`, { status })
    }
}
