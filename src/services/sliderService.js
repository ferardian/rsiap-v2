import api from './api'

const sliderService = {
    getSliders() {
        return api.get('slider/all')
    },

    getActiveSliders() {
        return api.get('slider')
    },

    storeSlider(formData) {
        return api.post('slider/store', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    updateSlider(id, formData) {
        // Laravel handled multipart/form-data only with POST for file uploads
        return api.post(`slider/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    deleteSlider(id) {
        return api.delete(`slider/delete/${id}`)
    },

    updateStatus(id, status) {
        return api.post(`slider/status/${id}`, { status })
    }
}

export default sliderService
