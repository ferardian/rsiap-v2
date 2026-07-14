import api from './api'

export const kepatuhanSepService = {
    /**
     * Get statistical summaries, daily trends, clinic stats, and doctor stats
     */
    getStats(params) {
        return api.get('/laporan/kepatuhan-sep', { params })
    },

    /**
     * Get paginated detailed compliance data
     */
    getDetails(params) {
        return api.get('/laporan/kepatuhan-sep/detail', { params })
    }
}
