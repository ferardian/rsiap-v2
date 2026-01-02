import api from './api'

export const jadwalTambahanService = {
    // Get monthly schedule matrix
    getSchedule(month, year, department, search) {
        const params = { bulan: month, tahun: year }
        if (department) params.departemen = department
        if (search) params.search = search

        return api.get('/sdi/jadwal-tambahan', { params })
    },

    // Get available shifts (reused from pegawai controller if same shifts apply, or new endpoint)
    // Using existing shifts endpoint as shifts are likely shared
    getShifts() {
        return api.get('/sdi/shifts')
    },

    // Save schedule data
    saveSchedule(month, year, data) {
        return api.post('/sdi/jadwal-tambahan', {
            bulan: month,
            tahun: year,
            data: data
        })
    },

    // Approve/Publish schedule
    approveSchedule(month, year, department) {
        return api.post('/sdi/jadwal-tambahan/approve', {
            bulan: month,
            tahun: year,
            departemen: department
        })
    }
}
