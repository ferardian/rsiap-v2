import api from './api'

export const tindakLanjutService = {
  /**
   * Get all action items with pagination, search, status, and role scope
   * @param {Object} params - { page, per_page, search, status, scope }
   */
  getAll(params = {}) {
    return api.get('/undangan/tindak-lanjut/semua', { params })
  },

  /**
   * Get action items assigned to authenticated user
   * @param {string} status - 'active', 'completed', or 'all'
   */
  getMine(status = 'active') {
    return api.get('/undangan/tindak-lanjut/saya', { params: { status } })
  },

  /**
   * Get detail of a specific action item with full feedbacks timeline
   * @param {number|string} id
   */
  getDetail(id) {
    return api.get(`/undangan/tindak-lanjut/${id}/detail`)
  },

  /**
   * Post feedback / progress update with optional file attachment
   * @param {number|string} id
   * @param {FormData|Object} data
   */
  reply(id, data) {
    const isFormData = data instanceof FormData
    return api.post(`/undangan/tindak-lanjut/${id}/reply`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    })
  },

  /**
   * Update task definition / status
   * @param {number|string} id
   * @param {Object} data
   */
  update(id, data) {
    return api.put(`/undangan/tindak-lanjut/${id}`, data)
  },

  /**
   * Download attachment file for a feedback entry
   * @param {number|string} feedbackId
   */
  downloadFile(feedbackId) {
    return api.get(`/undangan/tindak-lanjut/berkas/${feedbackId}`, { responseType: 'blob' })
  }
}

export default tindakLanjutService
