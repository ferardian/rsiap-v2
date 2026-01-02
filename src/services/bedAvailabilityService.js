import api from './api'


const bedAvailabilityService = {
    /**
     * Get all bed availability with optional filters
     */
    async getAllBeds(params = {}) {
        const response = await api.get('/bed-availability', { params })
        return response.data
    },

    /**
     * Get bed availability summary
     */
    async getSummary(params = {}) {
        const response = await api.get('/bed-availability/summary', { params })
        return response.data
    },

    /**
     * Get all wards with bed counts
     */
    async getWards() {
        const response = await api.get('/bed-availability/wards')
        return response.data
    },

    /**
     * Get available bed classes
     */
    async getClasses() {
        const response = await api.get('/bed-availability/classes')
        return response.data
    },

    /**
     * Get beds by specific ward
     */
    async getBedsByWard(kd_bangsal) {
        const response = await api.get(`/bed-availability/ward/${kd_bangsal}`)
        return response.data
    }
}

export default bedAvailabilityService
