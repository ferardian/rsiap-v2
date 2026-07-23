import api from './api'

export const ebookService = {
  // Get Ebooks / Journals list with pagination and filters
  getEbooks(params = {}) {
    return api.get('/sdi/ebook', { params })
  },

  // Get single ebook by ID
  getEbookById(id) {
    return api.get(`/sdi/ebook/${id}`)
  },

  // Get statistics summary
  getStats() {
    return api.get('/sdi/ebook/stats')
  },

  // Create new ebook (FormData for file upload)
  createEbook(formData) {
    return api.post('/sdi/ebook', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Update ebook (FormData for file upload)
  updateEbook(id, formData) {
    // Append _method PUT for Laravel multipart/form-data update handling
    formData.append('_method', 'PUT')
    return api.post(`/sdi/ebook/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Delete ebook
  deleteEbook(id) {
    return api.delete(`/sdi/ebook/${id}`)
  },

  // Increment view counter
  incrementView(id) {
    return api.post(`/sdi/ebook/${id}/view`)
  },

  // Get categories
  getCategories() {
    return api.get('/sdi/ebook/categories')
  },

  // Create category
  createCategory(data) {
    return api.post('/sdi/ebook/categories', data)
  },

  // Delete category
  deleteCategory(id) {
    return api.delete(`/sdi/ebook/categories/${id}`)
  }
}
