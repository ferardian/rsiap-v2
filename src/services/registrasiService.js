import api from './api'

const registrasiService = {
    /**
     * Get predicted next no_reg and no_rawat
     * @param {Object} params - { tanggal, kd_poli, kd_dokter }
     */
    getNextNumbers(params) {
        return api.get('/registrasi/booking/next-numbers', { params })
    },

    /**
     * Create new registration (booking)
     * @param {Object} data
     */
    register(data) {
        return api.post('/registrasi/booking/registrasi', data)
    },

    /**
     * Get payment methods (penjab)
     */
    getPenjab() {
        return api.get('/operasi/penjab')
    },

    /**
     * Search bookings/registrations (Orion)
     * @param {Object} payload 
     */
    searchBookings(payload) {
        // Fix Orion includes format to match project expectation (array of objects with relation)
        if (payload.includes && Array.isArray(payload.includes)) {
            payload.includes = payload.includes.map(rel => typeof rel === 'string' ? { relation: rel } : rel);
        }
        return api.post('/registrasi/booking/registrasi/search', payload)
    },

    /**
     * Search actual registrations (reg_periksa) (Orion)
     * @param {Object} payload 
     */
    searchRegistrations(payload) {
        if (payload.includes && Array.isArray(payload.includes)) {
            payload.includes = payload.includes.map(rel => typeof rel === 'string' ? { relation: rel } : rel);
        }
        return api.post('/registrasi/periksa/search', payload)
    }
}

export default registrasiService
