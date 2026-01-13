import api from './api'

const fileManagerService = {
    /**
     * Get all files
     */
    getFiles(params = {}) {
        return api.get('/file-manager', { params })
    },

    /**
     * Upload new file
     */
    uploadFile(formData) {
        return api.post('/file-manager', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    /**
     * Update file
     */
    updateFile(id, formData) {
        return api.post(`/file-manager/${id}?_method=PUT`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    /**
     * Delete file
     */
    deleteFile(id) {
        return api.delete(`/file-manager/${id}`)
    },

    /**
     * Download file
     */
    downloadFile(id) {
        return api.get(`/file-manager/download/${id}`, {
            responseType: 'blob'
        })
    }
}

export default fileManagerService
