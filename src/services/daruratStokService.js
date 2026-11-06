import api from './api'

export const daruratStokService = {
  /**
   * Mengambil daftar monitoring darurat & kekosongan stok obat
   * @param {Object} params - { page, limit, status, kd_bangsal, kdjns, kode_kategori, kode_golongan, q, sort_by, sort_dir }
   */
  async getDaruratStok(params = {}) {
    const response = await api.get('/farmasi/darurat-stok', { params })
    return response.data
  },

  /**
   * Mengambil atribut filter (lokasi bangsal, jenis, kategori, golongan)
   */
  async getAttributes() {
    const response = await api.get('/farmasi/darurat-stok/attributes')
    return response.data
  },

  /**
   * Mengambil data lengkap untuk keperluan export Excel / Print
   * @param {Object} params
   */
  async getExportData(params = {}) {
    const response = await api.get('/farmasi/darurat-stok/export', { params })
    return response.data
  }
}

export default daruratStokService
