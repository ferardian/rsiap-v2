import api from './api'

export const sepService = {
  /**
   * Search bridging_sep data using Orion search endpoint
   * @param {Object} searchPayload - Orion search payload
   * @returns {Promise}
   */
  async search(params) {
    const response = await api.get('/v2/sep', { params })
    return response.data
  },

  /**
   * Get single SEP detail
   * @param {string} noSep
   * @returns {Promise}
   */
  async get(noSep) {
    const response = await api.get(`/sep/${noSep}`)
    return response.data
  },

  /**
   * Sync claim status for specific SEP
   * @param {string} noSep
   * @returns {Promise}
   */
  async syncClaim(noSep) {
    const response = await api.get(`/sep/${noSep}/klaim/sync`)
    return response.data
  }
}

export default sepService
