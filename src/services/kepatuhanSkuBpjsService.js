import api from './api'

export const kepatuhanSkuBpjsService = {
    /**
     * Get statistical summaries, daily trends, clinic stats, and doctor stats
     */
    getStats(params) {
        return api.get('/laporan/kepatuhan-sku-bpjs', { params })
    },

    /**
     * Get paginated detailed compliance data
     */
    getDetails(params) {
        return api.get('/laporan/kepatuhan-sku-bpjs/detail', { params })
    }
}
