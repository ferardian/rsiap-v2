import api from './api'
import apiConfig from '../config/api'

export const bpjsService = {
  // Rekam Medis BPJS
  rekamMedis: {
    // Insert rekam medis baru
    async insert(data) {
      const response = await api.post('/bpjs/rekammedis/insert', data)
      return response.data
    },

    // Update rekam medis
    async update(id, data) {
      const response = await api.put(`/bpjs/rekammedis/${id}/update`, data)
      return response.data
    },

    // Delete rekam medis
    async delete(id) {
      const response = await api.delete(`/bpjs/rekammedis/${id}/delete`)
      return response.data
    },

    // Get detail rekam medis
    async get(id) {
      const response = await api.get(`/bpjs/rekammedis/${id}`)
      return response.data
    },

    // Get list rekam medis
    async list(params = {}) {
      const response = await api.get('/bpjs/rekammedis', { params })
      return response.data
    }
  },

  // SEP (Surat Eligibility Peserta)
  sep: {
    // Create SEP baru
    async create(data) {
      const response = await api.post('/bpjs/sep/create', data)
      return response.data
    },

    // Update SEP
    async update(data) {
      const response = await api.put('/bpjs/sep/update', data)
      return response.data
    },

    // Delete SEP
    async delete(sepId) {
      const response = await api.delete('/bpjs/sep/delete', { data: { sep_id: sepId } })
      return response.data
    },

    // Approve SEP
    async approve(sepId) {
      const response = await api.post('/bpjs/sep/approve', { sep_id: sepId })
      return response.data
    },

    // Get SEP by no SEP
    async getByNoSep(noSep) {
      const response = await api.get(`/bpjs/sep/${noSep}`)
      return response.data
    }
  },

  // Rujukan BPJS
  rujukan: {
    // Create rujukan baru
    async create(data) {
      const response = await api.post('/bpjs/rujukan/create', data)
      return response.data
    },

    // Update rujukan
    async update(id, data) {
      const response = await api.put(`/bpjs/rujukan/${id}/update`, data)
      return response.data
    },

    // Get list rujukan
    async list(params = {}) {
      const response = await api.get('/bpjs/rujukan', { params })
      return response.data
    },

    // Get rujukan by nomor rujukan
    async getByNoRujukan(noRujukan) {
      const response = await api.get(`/bpjs/rujukan/${noRujukan}`)
      return response.data
    }
  },

  // Referensi BPJS
  referensi: {
    // Get data poli
    async getPoli() {
      const response = await api.get('/bpjs/referensi/poli')
      return response.data
    },

    // Get data faskes
    async getFaskes(params = {}) {
      const response = await api.get('/bpjs/referensi/faskes', { params })
      return response.data
    },

    // Get data diagnosa
    async getDiagnosa(params = {}) {
      const response = await api.get('/bpjs/referensi/diagnosa', { params })
      return response.data
    },

    // Get data dokter
    async getDokter(params = {}) {
      const response = await api.get('/bpjs/referensi/dokter', { params })
      return response.data
    },

    // Get data procedure
    async getProcedure(params = {}) {
      const response = await api.get('/bpjs/referensi/procedure', { params })
      return response.data
    }
  },

  // Monitoring BPJS
  monitoring: {
    // Get data kunjungan
    async getKunjungan(params = {}) {
      const response = await api.get('/bpjs/monitoring/kunjungan', { params })
      return response.data
    },

    // Get data klaim
    async getKlaim(params = {}) {
      const response = await api.get('/bpjs/monitoring/klaim', { params })
      return response.data
    },

    // Get data pelayanan
    async getPelayanan(params = {}) {
      const response = await api.get('/bpjs/monitoring/pelayanan', { params })
      return response.data
    }
  }
}

// Export config untuk reference URL
export const bpjsEndpoints = {
  rekamMedis: {
    insert: `${apiConfig.public.API_V2_URL}/bpjs/rekammedis/insert`,
    update: `${apiConfig.public.API_V2_URL}/bpjs/rekammedis/update`,
    delete: `${apiConfig.public.API_V2_URL}/bpjs/rekammedis/delete`,
    get: `${apiConfig.public.API_V2_URL}/bpjs/rekammedis`
  },
  sep: {
    create: `${apiConfig.public.API_V2_URL}/bpjs/sep/create`,
    update: `${apiConfig.public.API_V2_URL}/bpjs/sep/update`,
    delete: `${apiConfig.public.API_V2_URL}/bpjs/sep/delete`,
    approve: `${apiConfig.public.API_V2_URL}/bpjs/sep/approve`
  }
}

export default bpjsService