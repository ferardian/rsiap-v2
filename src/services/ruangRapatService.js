import api from './api'

export const ruangRapatService = {
  /**
   * Get all meeting rooms
   * @param {Object} params - { status: 'all'|'aktif'|'maintenance', search: string }
   */
  getRooms(params = {}) {
    return api.get('/ruang-rapat', { params })
  },

  /**
   * Get room detail with recent meetings
   * @param {number|string} id
   */
  getRoom(id) {
    return api.get(`/ruang-rapat/${id}`)
  },

  /**
   * Create new meeting room
   * @param {Object} data
   */
  createRoom(data) {
    return api.post('/ruang-rapat', data)
  },

  /**
   * Update meeting room
   * @param {number|string} id
   * @param {Object} data
   */
  updateRoom(id, data) {
    return api.put(`/ruang-rapat/${id}`, data)
  },

  /**
   * Delete meeting room (soft delete)
   * @param {number|string} id
   */
  deleteRoom(id) {
    return api.delete(`/ruang-rapat/${id}`)
  },

  /**
   * Get room schedule timeline
   * @param {Object} params - { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', ruang_id: number|'all' }
   */
  getJadwal(params = {}) {
    return api.get('/ruang-rapat/jadwal', { params })
  },

  /**
   * Check room availability and detect schedule conflicts
   * @param {Object} data - { ruang_id, tanggal, jam_selesai, undangan_id }
   */
  checkAvailability(data) {
    return api.post('/ruang-rapat/check-availability', data)
  }
}

export default ruangRapatService
