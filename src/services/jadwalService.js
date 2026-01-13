import api from './api'

const jadwalService = {
    /**
     * Get all doctor schedules with optional filters
     */
    getJadwalDokter(params = {}) {
        return api.get('/jadwal-dokter', { params })
    },

    /**
     * Search doctor schedules
     */
    searchJadwal(query, params = {}) {
        return api.post('/public/jadwal/search', {
            scopes: [
                {
                    name: 'search',
                    parameters: [query]
                }
            ],
            ...params
        }, {
            params: {
                include: 'dokter,dokter.spesialis,dokter.pegawai,poliklinik'
            }
        })
    },

    /**
     * Create new doctor schedule
     */
    createJadwal(data) {
        return api.post('/jadwal-dokter', data)
    },

    /**
     * Update doctor schedule
     * Send composite keys in request body
     */
    updateJadwal(kd_dokter, hari_kerja, jam_mulai, data) {
        return api.put('/jadwal-dokter', {
            _kd_dokter: kd_dokter,
            _hari_kerja: hari_kerja,
            _jam_mulai: jam_mulai,
            ...data
        })
    },

    /**
     * Delete doctor schedule
     * Send composite keys in request body
     */
    deleteJadwal(kd_dokter, hari_kerja, jam_mulai) {
        return api.delete('/jadwal-dokter', {
            data: {
                kd_dokter,
                hari_kerja,
                jam_mulai
            }
        })
    }
}

export default jadwalService
