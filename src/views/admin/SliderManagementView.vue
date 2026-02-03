<template>
  <div class="slider-management">
    <div class="page-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="page-title">🖼️ Kelola Slider</h1>
          <p class="page-subtitle">Manajemen gambar banner slider aplikasi mobile</p>
        </div>
        <div class="header-right">
          <button class="btn btn-primary btn-add" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Tambah Slider</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Slider Table -->
    <div class="card flex-grow-1">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data slider...</p>
        </div>

        <div v-else-if="sliders.length === 0" class="text-center py-5">
          <i class="fas fa-images fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Belum ada data slider</h5>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Urutan</th>
                <th>Gambar</th>
                <th>Judul</th>
                <th>Link</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slider in sliders" :key="slider.id">
                <td>{{ slider.order }}</td>
                <td>
                  <div class="thumbnail-wrapper">
                    <img :src="slider.image" class="slider-thumbnail" alt="slider" @click="viewImage(slider.image)" />
                    <div class="thumbnail-overlay">
                      <i class="fas fa-expand"></i>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="slider-title-text">{{ slider.title || '-' }}</span>
                </td>
                <td><code class="text-muted">{{ slider.link || '-' }}</code></td>
                <td>
                  <div class="status-badge" :class="{ active: slider.status === 'active' }" @click="toggleSliderStatus(slider)">
                    <span class="status-dot"></span>
                    {{ slider.status === 'active' ? 'Aktif' : 'Non-aktif' }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="editSlider(slider)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDelete(slider)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Sidebar -->
    <div class="sidebar-form" :class="{ active: showModal }">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h5 class="sidebar-title">
            {{ isEditing ? '✏️ Edit Slider' : '➕ Tambah Slider Baru' }}
          </h5>
          <button type="button" class="btn-sidebar-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sidebar-body">
          <form @submit.prevent="saveSlider">
            <div class="form-group mb-4">
              <label class="form-label">Gambar Slider *</label>
              <div class="upload-area" :class="{ 'has-file': imagePreview }" @click="triggerFileInput">
                <input
                  type="file"
                  ref="fileInput"
                  class="d-none"
                  @change="handleFileUpload"
                  accept="image/*"
                />
                
                <div v-if="!imagePreview" class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt mb-2"></i>
                  <span>Klik untuk pilih gambar</span>
                  <small class="text-muted">JPG, PNG, GIF (Maks. 10MB)</small>
                </div>
                
                <div v-else class="preview-container">
                  <img :src="imagePreview" class="img-preview" alt="Preview" />
                  <div class="preview-overlay">
                    <span>Ganti Gambar</span>
                  </div>
                </div>
              </div>
              <div v-if="!isEditing && !selectedFile" class="error-text text-danger mt-1" style="font-size: 0.8rem;">
                Gambar wajib diunggah untuk slider baru
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Judul Banner</label>
              <div class="input-wrapper">
                <input v-model="formData.title" type="text" class="form-control" placeholder="Contoh: Promo Ramadhan" />
                <i class="fas fa-heading input-icon"></i>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Link Navigasi</label>
              <div class="input-wrapper">
                <input v-model="formData.link" type="text" class="form-control" placeholder="Contoh: /booking atau https://..." />
                <i class="fas fa-link input-icon"></i>
              </div>
            </div>

            <div class="row">
              <div class="col-6">
                <div class="form-group mb-4">
                  <label class="form-label">Urutan Tampil</label>
                  <div class="input-wrapper">
                    <input v-model.number="formData.order" type="number" class="form-control" min="0" />
                    <i class="fas fa-sort-numeric-up input-icon"></i>
                  </div>
                </div>
              </div>
              <div v-if="isEditing" class="col-6">
                <div class="form-group mb-4">
                  <label class="form-label">Status</label>
                  <div class="toggle-group mt-2">
                    <div class="toggle-switch" :class="{ active: formData.status === 'active' }" @click="formData.status = formData.status === 'active' ? 'inactive' : 'active'">
                      <div class="toggle-slider"></div>
                    </div>
                    <span class="toggle-label">{{ formData.status === 'active' ? 'Aktif' : 'Non-aktif' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="sidebar-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button type="button" class="btn btn-primary" @click="saveSlider" :disabled="submitting || (!isEditing && !selectedFile)">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-save me-2"></i>
            {{ isEditing ? 'Update Slider' : 'Simpan Slider' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal View -->
    <div class="modal fade" :class="{ show: showImageModal }" :style="{ display: showImageModal ? 'block' : 'none' }" tabindex="-1" @click="showImageModal = false">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 bg-transparent">
          <div class="modal-body p-0 text-center">
            <img :src="viewingImageUrl" class="img-fluid rounded shadow-lg" alt="Full Image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import sliderService from '../../services/sliderService'
import { showToast } from '../../utils/notification'

const sliders = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const imagePreview = ref(null)
const selectedFile = ref(null)
const fileInput = ref(null)

const showImageModal = ref(false)
const viewingImageUrl = ref('')

const formData = ref({
  id: null,
  title: '',
  link: '',
  order: 0,
  status: 'active'
})

const fetchSliders = async () => {
  loading.value = true
  try {
    const response = await sliderService.getSliders()
    sliders.value = response.data.data
  } catch (error) {
    showToast('Gagal memuat data slider', 'error')
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar (Maks. 10MB)', 'error')
      return
    }
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = { id: null, title: '', link: '', order: 0, status: 'active' }
  imagePreview.value = null
  selectedFile.value = null
  showModal.value = true
}

const editSlider = (slider) => {
  isEditing.value = true
  formData.value = { ...slider }
  imagePreview.value = slider.image
  selectedFile.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveSlider = async () => {
  submitting.value = true
  try {
    const data = new FormData()
    if (selectedFile.value) data.append('image', selectedFile.value)
    data.append('title', formData.value.title || '')
    data.append('link', formData.value.link || '')
    data.append('order', formData.value.order)
    if (isEditing.value) data.append('status', formData.value.status)

    if (isEditing.value) {
      await sliderService.updateSlider(formData.value.id, data)
      showToast('Slider berhasil diperbarui', 'success')
    } else {
      await sliderService.storeSlider(data)
      showToast('Slider berhasil ditambahkan', 'success')
    }
    closeModal()
    fetchSliders()
  } catch (error) {
    showToast('Gagal menyimpan slider', 'error')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const toggleSliderStatus = async (slider) => {
  const newStatus = slider.status === 'active' ? 'inactive' : 'active'
  try {
    await sliderService.updateStatus(slider.id, newStatus)
    slider.status = newStatus
    showToast(`Status slider diperbarui menjadi ${newStatus}`, 'success')
  } catch (error) {
    showToast('Gagal memperbarui status', 'error')
  }
}

const viewImage = (url) => {
  viewingImageUrl.value = url
  showImageModal.value = true
}

const confirmDelete = async (slider) => {
  if (confirm(`Hapus slider ${slider.title || 'ini'}? Tindakan ini tidak dapat dibatalkan.`)) {
    try {
      await sliderService.deleteSlider(slider.id)
      showToast('Slider berhasil dihapus', 'success')
      fetchSliders()
    } catch (error) {
      showToast('Gagal menghapus slider', 'error')
    }
  }
}

onMounted(fetchSliders)
</script>

<style scoped>
.slider-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.page-header {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.card {
  border: none;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.thumbnail-wrapper {
  position: relative;
  width: 100px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.slider-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail-wrapper:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-wrapper:hover .slider-thumbnail {
  transform: scale(1.1);
}

.slider-title-text {
  font-weight: 600;
  color: #334155;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.status-badge.active {
  background: #ecfdf5;
  color: #10b981;
  border-color: #a7f3d0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

.active .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* Sidebar Form */
.sidebar-form {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100vh;
  background: white;
  z-index: 1050;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  border-left: 1px solid #e2e8f0;
}

.sidebar-form.active {
  right: 0;
}

.sidebar-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-body {
  padding: 2rem;
  height: calc(100vh - 150px);
  overflow-y: auto;
  background: #f8fafc;
}

.sidebar-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  background: white;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.upload-area.has-file {
  border-style: solid;
  border-color: #3b82f6;
  padding: 0.5rem;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  color: #64748b;
}

.upload-placeholder i {
  font-size: 2rem;
}

.preview-container {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
}

.img-preview {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.form-control {
  padding-left: 2.75rem;
  border: 1px solid #cbd5e1;
  height: 45px;
  border-radius: 0.5rem;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 50px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: #10b981;
}

.toggle-slider {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.active .toggle-slider {
  transform: translateX(24px);
}

.btn-sidebar-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-sidebar-close:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}

.modal.show {
  background: rgba(0,0,0,0.8);
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .slider-management {
    gap: 1rem;
    padding-bottom: 2rem;
  }

  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
  }

  .header-right {
    width: 100%;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .sidebar-form {
    width: 100%;
    right: -100%;
    border-left: none;
  }
  
  .sidebar-form.active {
    right: 0;
  }

  .sidebar-body {
    padding: 1.5rem;
  }

  .sidebar-header {
    padding: 1.25rem 1.5rem;
  }

  .sidebar-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }

  .sidebar-footer .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .sidebar-footer .btn-secondary {
    margin-bottom: 0;
  }

  .upload-area {
    padding: 1rem;
  }

  .img-preview {
    height: 150px;
  }

  .btn-sidebar-close {
    width: 36px;
    height: 36px;
    flex-shrink: 0; /* Anti-gepeng */
  }
}
</style>
