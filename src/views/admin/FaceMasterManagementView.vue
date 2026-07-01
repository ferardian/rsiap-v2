<template>
  <div class="face-master-management">
    <div class="page-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="page-title">👤 Kelola Face Master</h1>
          <p class="page-subtitle">Manajemen master foto wajah pegawai untuk pencocokan E-Presensi</p>
        </div>
        <div class="header-right">
          <button class="btn btn-primary btn-add" @click="openAddModal">
            <i class="fas fa-plus me-2"></i>
            <span>Daftarkan Wajah</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="card search-filter-card mb-3">
      <div class="card-body py-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-6 col-lg-4">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control filter-input"
                placeholder="Cari NIK atau nama pegawai..."
                @input="debounceSearch"
              />
              <button v-if="searchQuery" class="btn-clear-search" @click="clearSearch">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="col-md-4 col-lg-3">
            <div class="select-wrapper">
              <select v-model="statusFilter" class="form-select filter-input" @change="fetchFaceMasters(1)">
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Non-aktif</option>
              </select>
              <i class="fas fa-filter select-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Face Master Table -->
    <div class="card flex-grow-1">
      <div class="card-body d-flex flex-column p-0">
        <div v-if="loading" class="text-center py-5 flex-grow-1 d-flex flex-column justify-content-center">
          <div class="spinner-border text-primary mx-auto" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data face master...</p>
        </div>

        <div v-else-if="faceMasters.length === 0" class="text-center py-5 flex-grow-1 d-flex flex-column justify-content-center">
          <i class="fas fa-user-shield fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Belum ada data face master</h5>
          <p class="text-muted small">Silakan daftarkan wajah pegawai baru menggunakan tombol di atas.</p>
        </div>

        <div v-else class="table-responsive flex-grow-1">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 100px;">Wajah</th>
                <th>Pegawai</th>
                <th>Departemen</th>
                <th>Jabatan</th>
                <th>Terdaftar Pada</th>
                <th style="width: 120px;">Status</th>
                <th class="text-center" style="width: 120px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in faceMasters" :key="item.id">
                <td>
                  <div v-if="item.photo_path" class="thumbnail-wrapper" @click="viewImage(item.photo_path, item.pegawai?.nama)">
                    <img
                      :src="getPhotoUrl(item.photo_path)"
                      class="face-thumbnail"
                      alt="Wajah"
                      @error="item.photo_path = null"
                    />
                    <div class="thumbnail-overlay">
                      <i class="fas fa-expand"></i>
                    </div>
                  </div>
                  <div v-else class="face-placeholder-avatar" title="Foto tidak tersedia">
                    <i class="fas fa-user-circle"></i>
                  </div>
                </td>
                <td>
                  <div class="pegawai-info">
                    <span class="pegawai-name d-block">{{ item.pegawai?.nama || 'Tidak Ditemukan' }}</span>
                    <small class="pegawai-nik text-muted"><code class="px-1 bg-light rounded text-dark">{{ item.nik }}</code></small>
                  </div>
                </td>
                <td>{{ item.pegawai?.departemen || '-' }}</td>
                <td><span class="badge bg-light text-secondary border">{{ item.pegawai?.jbtn || '-' }}</span></td>
                <td>
                  <div class="date-info text-muted">
                    <i class="far fa-calendar-alt me-1"></i>
                    {{ formatDate(item.registered_at) }}
                  </div>
                </td>
                <td>
                  <div class="status-badge" :class="{ active: item.is_active }" @click="toggleStatus(item)">
                    <span class="status-dot"></span>
                    {{ item.is_active ? 'Aktif' : 'Non-aktif' }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="editFaceMaster(item)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDelete(item)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="faceMasters.length > 0 && pagination.last_page > 1" class="card-footer bg-white border-top py-3 d-flex justify-content-between align-items-center">
          <div class="text-muted small">
            Menampilkan data {{ (pagination.current_page - 1) * pagination.per_page + 1 }} - 
            {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} dari {{ pagination.total }}
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <a class="page-link" href="#" @click.prevent="fetchFaceMasters(pagination.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </a>
              </li>
              <li
                v-for="page in pagination.last_page"
                :key="page"
                class="page-item"
                :class="{ active: pagination.current_page === page }"
              >
                <a class="page-link" href="#" @click.prevent="fetchFaceMasters(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <a class="page-link" href="#" @click.prevent="fetchFaceMasters(pagination.current_page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Sidebar Form -->
    <div class="sidebar-form" :class="{ active: showModal }">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h5 class="sidebar-title">
            {{ isEditing ? '✏️ Edit Face Master' : '➕ Daftarkan Wajah Baru' }}
          </h5>
          <button type="button" class="btn-sidebar-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sidebar-body">
          <!-- Employee Autocomplete Search (Only on Create) -->
          <div v-if="!isEditing" class="form-group mb-4 position-relative">
            <label class="form-label fw-bold">Pilih Pegawai *</label>
            <div class="input-wrapper">
              <input
                v-model="pegawaiSearchQuery"
                type="text"
                class="form-control"
                placeholder="Masukkan nama atau NIK pegawai..."
                @input="searchEmployees"
                :disabled="selectedPegawai !== null"
              />
              <i class="fas fa-user input-icon"></i>
              <button v-if="selectedPegawai" class="btn-clear-pegawai" @click="clearSelectedPegawai">
                <i class="fas fa-times-circle"></i>
              </button>
            </div>

            <!-- Autocomplete Dropdown List -->
            <ul v-if="employeeSuggestions.length > 0 && !selectedPegawai" class="suggestions-list shadow-lg">
              <li 
                v-for="emp in employeeSuggestions" 
                :key="emp.id" 
                @click="selectPegawai(emp)"
                class="suggestion-item d-flex align-items-center"
              >
                <div class="suggestion-avatar me-2">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="suggestion-info">
                  <span class="d-block fw-bold">{{ emp.nama }}</span>
                  <small class="text-muted">{{ emp.nik }} • {{ emp.departemen || '-' }}</small>
                </div>
              </li>
            </ul>
            <div v-if="searchingEmployees" class="suggestions-loader mt-1 text-muted small">
              <span class="spinner-border spinner-border-sm me-1"></span> Mencari pegawai...
            </div>
            
            <!-- Selected Pegawai Display Card -->
            <div v-if="selectedPegawai" class="selected-pegawai-card mt-2 animate__animated animate__fadeIn">
              <div class="card border border-primary-subtle bg-primary-subtle p-3 rounded">
                <div class="d-flex align-items-center">
                  <i class="fas fa-id-card fa-2x text-primary me-3"></i>
                  <div>
                    <span class="d-block fw-bold text-primary">{{ selectedPegawai.nama }}</span>
                    <span class="d-block text-muted small">NIK: <code>{{ selectedPegawai.nik }}</code></span>
                    <span class="d-block text-muted small">Unit: {{ selectedPegawai.departemen || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!selectedPegawai && submitAttempted" class="error-text text-danger mt-1">
              Pegawai harus dipilih
            </div>
          </div>

          <!-- Employee Info Display on Edit -->
          <div v-else class="form-group mb-4">
            <label class="form-label fw-bold">Pegawai</label>
            <div class="card border-0 bg-light p-3 rounded">
              <div class="d-flex align-items-center">
                <i class="fas fa-id-card fa-2x text-secondary me-3"></i>
                <div>
                  <span class="d-block fw-bold">{{ editingItem?.pegawai?.nama }}</span>
                  <span class="d-block text-muted small">NIK: <code>{{ editingItem?.nik }}</code></span>
                  <span class="d-block text-muted small">Unit: {{ editingItem?.pegawai?.departemen || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Photo Upload Area -->
          <div class="form-group mb-4">
            <label class="form-label fw-bold">Foto Wajah *</label>
            <div class="upload-area" :class="{ 'has-file': imagePreview }" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
              <input
                type="file"
                ref="fileInput"
                class="d-none"
                @change="handleFileUpload"
                accept="image/*"
              />
              
              <div v-if="!imagePreview" class="upload-placeholder">
                <i class="fas fa-camera mb-2 fa-2x"></i>
                <span class="d-block fw-bold">Klik atau Seret Foto Ke Sini</span>
                <small class="text-muted">Format JPG/PNG/JPEG. Maks 5MB.</small>
              </div>
              
              <div v-else class="preview-container">
                <img :src="imagePreview" class="img-preview" alt="Preview" />
                <div class="preview-overlay">
                  <span>Ganti Gambar</span>
                </div>
              </div>
            </div>
            <div v-if="!isEditing && !selectedFile && submitAttempted" class="error-text text-danger mt-1">
              Foto wajah wajib diunggah
            </div>
          </div>

          <!-- Toggle switch for Active status -->
          <div class="form-group mb-4">
            <label class="form-label fw-bold">Status Keaktifan</label>
            <div class="toggle-group mt-1">
              <div class="toggle-switch" :class="{ active: formData.is_active }" @click="formData.is_active = !formData.is_active">
                <div class="toggle-slider"></div>
              </div>
              <span class="toggle-label fw-semibold" :class="formData.is_active ? 'text-success' : 'text-danger'">
                {{ formData.is_active ? 'Aktif (Dapat Melakukan Absensi)' : 'Non-aktif' }}
              </span>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
          <button type="button" class="btn btn-secondary flex-grow-1" @click="closeModal">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button type="button" class="btn btn-primary flex-grow-1" @click="saveFaceMaster" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-save me-2"></i>
            {{ isEditing ? 'Update Data' : 'Simpan Data' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div class="modal fade" :class="{ show: showImageModal }" :style="{ display: showImageModal ? 'block' : 'none' }" tabindex="-1" @click="showImageModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 bg-transparent">
          <div class="modal-header border-0 bg-dark bg-opacity-75 text-white rounded-top py-2 px-3">
            <h6 class="modal-title m-0"><i class="fas fa-user-shield me-2"></i>Master Wajah: {{ viewingImageTitle }}</h6>
            <button type="button" class="btn-close btn-close-white" @click="showImageModal = false"></button>
          </div>
          <div class="modal-body p-0 text-center bg-dark">
            <img :src="viewingImageUrl" class="img-fluid lightbox-image shadow-lg" alt="Full Image" @click.stop />
          </div>
        </div>
      </div>
    </div>
    <div v-if="showImageModal" class="modal-backdrop fade show" @click="showImageModal = false"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import pegawaiFaceMasterService from '../../services/pegawaiFaceMasterService'
import { pegawaiService } from '../../services/pegawaiService'
import { showToast } from '../../utils/notification'
import config from '../../config/api'
import Swal from 'sweetalert2'

// State variables
const faceMasters = ref([])
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

// Sidebar & Modal states
const showModal = ref(false)
const isEditing = ref(false)
const imagePreview = ref(null)
const selectedFile = ref(null)
const fileInput = ref(null)
const submitAttempted = ref(false)

// Autocomplete State
const pegawaiSearchQuery = ref('')
const selectedPegawai = ref(null)
const employeeSuggestions = ref([])
const searchingEmployees = ref(false)

// Edit state
const editingItem = ref(null)

// Lightbox Modal State
const showImageModal = ref(false)
const viewingImageUrl = ref('')
const viewingImageTitle = ref('')

const formData = ref({
  id: null,
  pegawai_id: null,
  is_active: true
})

// Debounced search logic for list
let searchTimeout = null
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchFaceMasters(1)
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchFaceMasters(1)
}

// Fetch lists from backend
const fetchFaceMasters = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      limit: pagination.value.per_page,
      search: searchQuery.value || undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined
    }
    const response = await pegawaiFaceMasterService.getFaceMasters(params)
    faceMasters.value = response.data.data
    pagination.value = {
      current_page: response.data.pagination.current_page,
      last_page: response.data.pagination.last_page,
      per_page: response.data.pagination.per_page || 15,
      total: response.data.pagination.total
    }
  } catch (error) {
    showToast('Gagal memuat data face master', 'error')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Resolve photo URL based on local storage path
const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null
  const baseUrl = config.public.API_V2_URL.replace('/api/v2', '')
  return `${baseUrl}/storage/app/public/${photoPath}`
}

// Search employees for autocomplete
let searchEmpTimeout = null
const searchEmployees = () => {
  if (searchEmpTimeout) clearTimeout(searchEmpTimeout)
  if (!pegawaiSearchQuery.value.trim()) {
    employeeSuggestions.value = []
    return
  }
  
  searchingEmployees.value = true
  searchEmpTimeout = setTimeout(async () => {
    try {
      const response = await pegawaiService.searchPegawai(pegawaiSearchQuery.value, 8)
      employeeSuggestions.value = response.data.data
    } catch (e) {
      console.error(e)
    } finally {
      searchingEmployees.value = false
    }
  }, 400)
}

const selectPegawai = (emp) => {
  selectedPegawai.value = emp
  pegawaiSearchQuery.value = emp.nama
  formData.value.pegawai_id = emp.id
  employeeSuggestions.value = []
}

const clearSelectedPegawai = () => {
  selectedPegawai.value = null
  pegawaiSearchQuery.value = ''
  formData.value.pegawai_id = null
}

// File Upload Helpers
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  processSelectedFile(file)
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  processSelectedFile(file)
}

const processSelectedFile = (file) => {
  if (file) {
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar (Maks. 5MB)', 'error')
      return
    }
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// Open modals
const openAddModal = () => {
  isEditing.value = false
  submitAttempted.value = false
  formData.value = { id: null, pegawai_id: null, is_active: true }
  clearSelectedPegawai()
  imagePreview.value = null
  selectedFile.value = null
  showModal.value = true
}

const editFaceMaster = (item) => {
  isEditing.value = true
  submitAttempted.value = false
  editingItem.value = item
  formData.value = {
    id: item.id,
    pegawai_id: item.pegawai_id,
    is_active: item.is_active
  }
  imagePreview.value = getPhotoUrl(item.photo_path)
  selectedFile.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  employeeSuggestions.value = []
}

// Save data
const saveFaceMaster = async () => {
  submitAttempted.value = true
  
  if (!isEditing.value && !selectedPegawai.value) {
    showToast('Silakan pilih pegawai terlebih dahulu', 'error')
    return
  }
  if (!isEditing.value && !selectedFile.value) {
    showToast('Silakan unggah foto wajah terlebih dahulu', 'error')
    return
  }

  submitting.value = true
  try {
    const data = new FormData()
    if (selectedFile.value) {
      data.append('file', selectedFile.value)
    }
    data.append('is_active', formData.value.is_active ? '1' : '0')
    
    if (isEditing.value) {
      await pegawaiFaceMasterService.updateFaceMaster(formData.value.id, data)
      showToast('Face master berhasil diperbarui', 'success')
    } else {
      data.append('pegawai_id', formData.value.pegawai_id)
      await pegawaiFaceMasterService.storeFaceMaster(data)
      showToast('Pendaftaran wajah berhasil disimpan', 'success')
    }
    
    closeModal()
    fetchFaceMasters(pagination.value.current_page)
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan data face master'
    showToast(errorMsg, 'error')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

// Quick Status Toggle
const toggleStatus = async (item) => {
  const newStatus = !item.is_active
  try {
    const data = new FormData()
    data.append('is_active', newStatus ? '1' : '0')
    await pegawaiFaceMasterService.updateFaceMaster(item.id, data)
    item.is_active = newStatus
    showToast(`Status wajah pegawai ${item.pegawai?.nama || ''} diperbarui`, 'success')
  } catch (error) {
    showToast('Gagal memperbarui status keaktifan', 'error')
  }
}

// Lightbox Modal
const viewImage = (path, title) => {
  viewingImageUrl.value = getPhotoUrl(path)
  viewingImageTitle.value = title || 'Pegawai'
  showImageModal.value = true
}

// Confirm Delete
const confirmDelete = async (item) => {
  const result = await Swal.fire({
    title: 'Hapus Face Master?',
    text: `Tindakan ini akan menghapus data wajah pegawai "${item.pegawai?.nama || ''}" beserta file fisik fotonya secara permanen di server!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await pegawaiFaceMasterService.deleteFaceMaster(item.id)
      Swal.fire('Terhapus!', 'Master wajah dan berkas foto berhasil dihapus.', 'success')
      fetchFaceMasters(1)
    } catch (error) {
      showToast('Gagal menghapus face master', 'error')
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB'
}

onMounted(() => {
  fetchFaceMasters()
})
</script>

<style scoped>
.face-master-management {
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
  overflow: hidden;
}

.search-filter-card {
  background: #f8fafc;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.btn-clear-search {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem;
}

.btn-clear-search:hover {
  color: #ef4444;
}

.filter-input {
  padding-left: 2.75rem;
  height: 44px;
  border-radius: 0.5rem;
  border: 1px solid #cbd5e1;
  background: white;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  pointer-events: none;
}

.face-placeholder-avatar {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 2rem;
}

.thumbnail-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 2px solid #e2e8f0;
}

.face-thumbnail {
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
  background: rgba(0,0,0,0.4);
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

.thumbnail-wrapper:hover .face-thumbnail {
  transform: scale(1.1);
}

.pegawai-name {
  font-weight: 600;
  color: #334155;
}

.pegawai-nik code {
  font-size: 0.8rem;
  letter-spacing: 0.05em;
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

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  flex-grow: 1;
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

/* Upload Area */
.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 2rem 1.5rem;
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
  align-items: center;
  color: #64748b;
}

.upload-placeholder i {
  color: #3b82f6;
  opacity: 0.7;
}

.preview-container {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
}

.img-preview {
  width: 100%;
  height: 220px;
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

/* Form input styling */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.btn-clear-pegawai {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
}

.btn-clear-pegawai:hover {
  color: #ef4444;
}

.form-control {
  padding-left: 2.75rem;
  border: 1px solid #cbd5e1;
  height: 46px;
  border-radius: 0.5rem;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Autocomplete suggestions */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0;
  margin: 0;
  list-style: none;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1060;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:hover {
  background: #f0f7ff;
}

.suggestion-avatar {
  font-size: 1.5rem;
  color: #94a3b8;
}

.suggestion-info span {
  font-size: 0.9rem;
  color: #1e293b;
}

.suggestion-info small {
  font-size: 0.75rem;
}

/* Toggle Switch */
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

.toggle-label {
  font-size: 0.9rem;
}

/* Close button and other styles */
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

/* Lightbox Modal */
.modal.show {
  display: block;
}

.lightbox-image {
  max-height: 80vh;
  object-fit: contain;
}

.modal-backdrop.show {
  opacity: 0.7;
}

/* Responsive design */
@media (max-width: 768px) {
  .sidebar-form {
    width: 100%;
    right: -100%;
  }
  .sidebar-form.active {
    right: 0;
  }
  .sidebar-body {
    padding: 1.5rem;
  }
  .sidebar-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }
}
</style>
