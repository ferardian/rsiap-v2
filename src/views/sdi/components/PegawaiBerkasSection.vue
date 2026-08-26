<template>
  <div class="berkas-section">
    <div class="section-header">
      <h4><i class="fas fa-file-alt"></i> Berkas Pegawai</h4>
      <button v-if="!readOnly" class="btn-add-berkas" @click="showUploadModal = true">
        <i class="fas fa-plus-circle"></i> Tambah Berkas
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-placeholder">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat berkas...</p>
    </div>

    <!-- Document List -->
    <div v-else-if="berkasList.length > 0" class="berkas-grid">
      <div v-for="berkas in berkasList" :key="berkas.berkas" class="berkas-card">
        <div class="berkas-info">
          <div class="berkas-icon">
            <i :class="getFileIcon(berkas.berkas)"></i>
          </div>
          <div class="berkas-details">
            <span class="berkas-name">{{ berkas.master_berkas_pegawai?.nama_berkas || 'Berkas' }}</span>
            <div class="berkas-meta">
              <span class="badge-kategori">{{ berkas.master_berkas_pegawai?.kategori || '-' }}</span>
              <span class="upload-date">{{ formatDate(berkas.tgl_uploud) }}</span>
            </div>
          </div>
        </div>
        <div class="berkas-actions">
          <button class="btn-action view" @click="viewBerkas(berkas)" title="Lihat">
            <i class="fas fa-eye"></i>
          </button>
          <button v-if="!readOnly" class="btn-action delete" @click="confirmDelete(berkas)" title="Hapus">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state-mini mt-3">
      <i class="fas fa-folder-open"></i>
      <p>Belum ada berkas yang diunggah</p>
    </div>

    <!-- Upload Modal -->
    <Transition name="modal">
      <div v-if="showUploadModal" class="modal-overlay premium-blur" @click="showUploadModal = false">
        <div class="modal-content premium-modal" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <h3><i class="fas fa-file-upload text-primary animate-bounce-slow"></i> Unggah Berkas Baru</h3>
              <p class="text-muted small">Lengkapi data berkas untuk disimpan ke sistem</p>
            </div>
            <button class="btn-close-minimal" @click="showUploadModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleUpload" class="premium-form">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label><i class="fas fa-tags"></i> Kategori Berkas</label>
                  <div class="select-wrapper">
                    <select 
                      v-model="uploadForm.kategori" 
                      class="premium-select" 
                      @change="fetchNamaBerkas"
                      required
                    >
                      <option value="" disabled selected>Pilih Kategori</option>
                      <option v-for="kat in kategoriList" :key="kat.kategori" :value="kat.kategori">
                        {{ kat.kategori }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>

                <div class="form-group flex-1">
                  <label><i class="fas fa-list-ul"></i> Jenis Berkas</label>
                  <div class="select-wrapper">
                    <select 
                      v-model="uploadForm.kode" 
                      class="premium-select" 
                      required
                      :disabled="!uploadForm.kategori || loadingNames"
                    >
                      <option value="" disabled selected>Pilih Jenis Berkas</option>
                      <option v-for="item in namaBerkasList" :key="item.kode" :value="item.kode">
                        {{ item.nama }}
                      </option>
                    </select>
                    <i class="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label><i class="fas fa-file-alt"></i> Pilih Berkas</label>
                <div 
                  class="premium-dropzone" 
                  @click="$refs.fileInput.click()"
                  :class="{ 'file-selected': selectedFile }"
                >
                  <input 
                    type="file" 
                    ref="fileInput" 
                    class="hidden-input" 
                    @change="onFileChange"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <div class="dropzone-content">
                    <div class="dropzone-icon">
                      <i v-if="!selectedFile" class="fas fa-cloud-upload-alt"></i>
                      <i v-else :class="getFileIcon(fileName) + ' animate-pulse'"></i>
                    </div>
                    <div class="dropzone-text">
                      <p class="main-text">{{ fileName || 'Klik untuk memilih file' }}</p>
                      <p class="sub-text">Format: PDF, JPG, PNG (Maks. 20MB)</p>
                    </div>
                  </div>
                  <div v-if="selectedFile" class="file-badge">
                    <i class="fas fa-check-circle"></i> Berkas Terpilih
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn-premium btn-cancel" @click="showUploadModal = false">
              Batal
            </button>
            <button 
              class="btn-premium btn-confirm" 
              @click="handleUpload" 
              :disabled="uploading || !uploadForm.kode || !selectedFile"
            >
              <i v-if="uploading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-cloud-upload-alt"></i>
              {{ uploading ? 'Sedang Mengunggah...' : 'Upload Berkas' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay premium-blur" @click="showDeleteModal = false">
        <div class="modal-content premium-modal mini" @click.stop>
          <div class="modal-body text-center py-5">
            <div class="delete-icon-animated mb-4">
              <div class="icon-circle">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
            </div>
            <h4 class="mb-2">Konfirmasi Hapus</h4>
            <p class="text-muted">Apakah Anda yakin ingin menghapus berkas <br><strong>{{ selectedBerkas?.master_berkas_pegawai?.nama_berkas }}</strong>?</p>
            <p class="text-danger small mt-2"><i class="fas fa-info-circle"></i> Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <div class="modal-footer justify-content-center">
            <button class="btn-premium btn-cancel" @click="showDeleteModal = false">Batal</button>
            <button class="btn-premium btn-danger" @click="handleDelete" :disabled="deleting">
              <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-trash-alt"></i>
              Hapus Sekarang
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { pegawaiService } from '../../../services/pegawaiService'
import config from '../../../config/api'
import { useToast } from 'vue-toastification'

const props = defineProps({
  nik: {
    type: String,
    required: true
  },
  autoOpenUpload: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const toast = useToast()
const loading = ref(false)
const berkasList = ref([])
const saveLocation = ref('')
const showUploadModal = ref(false)
const showDeleteModal = ref(false)

const kategoriList = ref([])
const namaBerkasList = ref([])
const loadingNames = ref(false)
const uploading = ref(false)
const deleting = ref(false)

const uploadForm = ref({
  kategori: '',
  kode: ''
})
const selectedFile = ref(null)
const fileName = ref('')
const fileInput = ref(null)
const selectedBerkas = ref(null)

const loadBerkas = async () => {
  if (!props.nik) return
  loading.value = true
  try {
    const response = await pegawaiService.getBerkas(props.nik)
    if (response.data.success) {
      const raw = response.data.data.berkas || []
      berkasList.value = [...raw].sort((a, b) => new Date(b.tgl_uploud) - new Date(a.tgl_uploud))
      saveLocation.value = response.data.data.save_location || ''
    }
  } catch (error) {
    console.error('Error loading berkas:', error)
  } finally {
    loading.value = false
  }
}

const fetchKategori = async () => {
  try {
    const response = await pegawaiService.getBerkasKategori()
    if (response.data.success) {
      kategoriList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading kategori:', error)
  }
}

const fetchNamaBerkas = async () => {
  if (!uploadForm.value.kategori) {
    namaBerkasList.value = []
    return
  }
  loadingNames.value = true
  try {
    const response = await pegawaiService.getNamaBerkas(uploadForm.value.kategori)
    if (response.data.success) {
      namaBerkasList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading nama berkas:', error)
  } finally {
    loadingNames.value = false
  }
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 20MB')
      selectedFile.value = null
      fileName.value = ''
      e.target.value = ''
      return
    }
    selectedFile.value = file
    fileName.value = file.name
  }
}

const handleUpload = async () => {
  if (!selectedFile.value || !uploadForm.value.kode) return

  uploading.value = true
  const formData = new FormData()
  formData.append('nik', props.nik)
  formData.append('berkas', uploadForm.value.kode)
  formData.append('kategori-berkas', uploadForm.value.kategori)
  formData.append('file_berkas', selectedFile.value)

  try {
    const response = await pegawaiService.uploadBerkas(formData)
    if (response.data.success) {
      toast.success('Berkas berhasil diunggah')
      showUploadModal.value = false
      resetForm()
      loadBerkas()
    } else {
      toast.error(response.data.message || 'Gagal mengunggah berkas')
    }
  } catch (error) {
    console.error('Error uploading berkas:', error)
    toast.error('Terjadi kesalahan saat mengunggah berkas')
  } finally {
    uploading.value = false
  }
}

const confirmDelete = (berkas) => {
  selectedBerkas.value = berkas
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!selectedBerkas.value) return
  deleting.value = true
  try {
    const response = await pegawaiService.deleteBerkas(
      props.nik,
      selectedBerkas.value.master_berkas_pegawai.kode,
      selectedBerkas.value.berkas
    )
    if (response.data.success) {
      toast.success('Berkas berhasil dihapus')
      showDeleteModal.value = false
      loadBerkas()
    } else {
      toast.error(response.data.message || 'Gagal menghapus berkas')
    }
  } catch (error) {
    console.error('Error deleting berkas:', error)
    toast.error('Terjadi kesalahan saat menghapus berkas')
  } finally {
    deleting.value = false
  }
}

const viewBerkas = (berkas) => {
  const baseUrl = config.public.BASE_BERKAS_URL // http://192.168.100.33/webapps
  const location = saveLocation.value || 'webapps/penggajian/pages/berkaspegawai/berkas/'
  
  // Clean up paths to avoid double slashes
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  
  // Extract only the filename from berkas.berkas (because it may contain path)
  const filename = berkas.berkas.split('/').pop()
  
  // To avoid doubling 'webapps', if cleanBase ends with /webapps and location starts with webapps/
  // we remove the redundant 'webapps/' from the location part
  let relativeLocation = location
  if (cleanBase.endsWith('/webapps') && location.startsWith('webapps/')) {
    relativeLocation = location.substring(8) // remove 'webapps/'
  }
  
  // Ensure relativeLocation starts with / if not empty, for proper joining
  const finalLocation = relativeLocation.startsWith('/') ? relativeLocation : `/${relativeLocation}`
  
  const url = `${cleanBase}${finalLocation}${filename}`
  window.open(url, '_blank')
}

const resetForm = () => {
  uploadForm.value = { kategori: '', kode: '' }
  selectedFile.value = null
  fileName.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'fas fa-file-pdf text-danger'
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'fas fa-file-image text-primary'
  return 'fas fa-file text-secondary'
}

watch(() => props.nik, (newNik) => {
  if (newNik) {
    loadBerkas()
  }
})

watch(() => props.autoOpenUpload, (newVal) => {
  if (newVal) {
    showUploadModal.value = true
  }
}, { immediate: true })

onMounted(() => {
  loadBerkas()
  fetchKategori()
})
</script>

<style scoped>
.berkas-section {
  margin-top: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h4 {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-add-berkas {
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-add-berkas:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.berkas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.berkas-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.berkas-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.berkas-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.berkas-icon {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.berkas-details {
  display: flex;
  flex-direction: column;
}

.berkas-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.berkas-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.badge-kategori {
  font-size: 0.75rem;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #64748b;
}

.upload-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.berkas-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-action.view {
  background: #f8fafc;
  color: #64748b;
}

.btn-action.view:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.btn-action.delete {
  background: #f8fafc;
  color: #64748b;
}

.btn-action.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Modal UI Premium */
.modal-overlay.premium-blur {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.premium-modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 550px;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.premium-modal.mini {
  max-width: 400px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.text-muted { color: #64748b; }
.text-primary { color: #3b82f6; }
.text-danger { color: #ef4444; }

.btn-close-minimal {
  background: #f8fafc;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-minimal:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-body {
  padding: 1.5rem;
}

.premium-form .form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.premium-select {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  appearance: none;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
}

.premium-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.select-icon {
  position: absolute;
  right: 1rem;
  pointer-events: none;
  color: #94a3b8;
  font-size: 0.75rem;
}

.premium-dropzone {
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
  position: relative;
}

.premium-dropzone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.premium-dropzone.file-selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.dropzone-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.premium-dropzone.file-selected .dropzone-icon {
  color: #10b981;
}

.main-text {
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  font-size: 0.875rem;
}

.sub-text {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.file-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #10b981;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-premium {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.btn-confirm:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-danger {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Delete Modal Specifics */
.delete-icon-animated {
  display: flex;
  justify-content: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #ef4444;
  animation: pulseDanger 2s infinite;
}

@keyframes pulseDanger {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

/* Vue Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .premium-modal {
  animation: slideUp 0.3s ease-out;
}

.modal-leave-active .premium-modal {
  animation: slideUp 0.2s ease-in reverse;
}

.flex-1 { flex: 1; }
.hidden-input { display: none; }
</style>
