import api from './api'

export const jadwalPegawaiService = {
    // Get monthly schedule matrix
    getSchedule(month, year, department, search, mode = null) {
        const params = { bulan: month, tahun: year }
        if (department) params.departemen = department
        if (search) params.search = search
        if (mode) params.mode = mode

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
    },

    // Get all departments
    getDepartments() {
        return api.get('/indikator-mutu/monitoring/units')
    },

    // AI Schedule Recommendation
    async getAiRecommendation(data) {
        // Fallback webhook URL if env is not set
        const webhookUrl = import.meta.env.VITE_N8N_SCHEDULE_WEBHOOK || 'https://n31.rsiap.my.id/webhook/schedule-ai-generation'

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AI-KEY': 'schedule-ai-123'
                },
                body: JSON.stringify({
                    ...data,
                    prompt: data.prompt || '' // Ensure prompt is sent
                })
            })

            const text = await response.text()

            if (!response.ok) {
                console.error('❌ AI Service Error Response:', text)
                throw new Error(`AI Service error (${response.status})`)
            }

            if (!text || text.trim() === '') {
                throw new Error('AI Service mengembalikan respon kosong.')
            }

            try {
                return JSON.parse(text)
            } catch (e) {
                console.error('❌ Failed to parse AI JSON. Raw output:', text)
                throw new Error('Format respon AI bukan JSON yang valid.')
            }
        } catch (error) {
            console.error('❌ AI Fetch Error:', error)
            throw error
        }
    },

    // Generate schedule using backend algorithm (replaces AI)
    generateSchedule(data) {
        return api.post('/sdi/jadwal-pegawai/generate', data)
    }
}
