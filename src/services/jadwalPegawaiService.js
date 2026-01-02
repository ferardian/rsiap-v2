import api from './api'

export const jadwalPegawaiService = {
    // Get monthly schedule matrix
    getSchedule(month, year, department, search) {
        const params = { bulan: month, tahun: year }
        if (department) params.departemen = department
        if (search) params.search = search

        return api.get('/sdi/jadwal-pegawai', { params })
    },

    // Get available shifts
    getShifts() {
        return api.get('/sdi/shifts')
    },

    // Save schedule data
    saveSchedule(month, year, data) {
        return api.post('/sdi/jadwal-pegawai', {
            bulan: month,
            tahun: year,
            data: data
        })
    },

    // Save schedule data (Admin - saves to both draft & final)
    saveScheduleAdmin(month, year, data) {
        return api.post('/sdi/jadwal-pegawai/admin', {
            bulan: month,
            tahun: year,
            data: data
        })
    },

    // Approve/Publish schedule
    approveSchedule(month, year, department) {
        return api.post('/sdi/jadwal-pegawai/approve', {
            bulan: month,
            tahun: year,
            departemen: department
        })
    }
}
