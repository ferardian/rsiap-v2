import api from './api'

export default {
    /**
     * Get laboratory indicators data
     * @param {Object} params - { tgl }
     */
    getIndicators(params) {
        return api.get('/laboratorium/indikator', { params })
    },

    /**
     * Store laboratory indicators data
     * @param {Object} data 
     */
    storeIndicator(data) {
        return api.post('/laboratorium/indikator', data)
    }
}
