import api from './api'

export default {
    // Get all unit shift rules with optional filters
    getAll(params = {}) {
        return api.get('/sdi/unit-shift-rules', { params })
    },

    // Get single unit shift rule by ID
    getById(id) {
        return api.get(`/sdi/unit-shift-rules/${id}`)
    },

    // Create new unit shift rule
    create(data) {
        return api.post('/sdi/unit-shift-rules', data)
    },

    // Update existing unit shift rule
    update(id, data) {
        return api.patch(`/sdi/unit-shift-rules/${id}`, data)
    },

    // Delete unit shift rule
    delete(id) {
        return api.delete(`/sdi/unit-shift-rules/${id}`)
    },

    // Get shift rules for specific department
    getByDepartment(depId) {
        return api.get('/sdi/unit-shift-rules', {
            params: {
                'filter[dep_id]': depId,
                include: 'departemen',
                sort: 'priority'
            }
        })
    }
}
