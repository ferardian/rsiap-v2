<template>
  <div class="dokumen-surat-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1><i class="fas fa-folder-open"></i> Dokumen & Surat</h1>
          <p>Manajemen dokumen dan surat</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        @click="activeTab = 'dokumen'" 
        :class="['tab-button', { active: activeTab === 'dokumen' }]"
      >
        <i class="fas fa-file-alt"></i>
        Dokumen & Surat
      </button>
      <button 
        @click="activeTab = 'staf'" 
        :class="['tab-button', { active: activeTab === 'staf' }]"
      >
        <i class="fas fa-user-md"></i>
        Staf Klinis
      </button>
      <button class="tab-button" disabled>
        <i class="fas fa-clipboard-list"></i>
        SPO
      </button>
      <button class="tab-button" disabled>
        <i class="fas fa-file-contract"></i>
        Perdir
      </button>
    </div>

    <!-- Tab 1: Dokumen & Surat -->
    <div v-if="activeTab === 'dokumen'">
      <!-- Actions -->
      <div class="actions-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            @input="handleSearch"
            type="text" 
            placeholder="Cari nama file..."
          >
        </div>
        <button v-if="canImport" @click="openUploadModal" class="btn-upload">
          <i class="fas fa-upload"></i>
          Upload File
        </button>
      </div>

      <!-- Table -->
      <div class="table-container">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Memuat data...</p>
        </div>

        <table v-else class="files-table">
          <thead>
            <tr>
              <th>Nama File</th>
              <th>File</th>
              <th>Tanggal Upload</th>
              <th class="actions-col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in filesList" :key="file.id">
              <td class="file-name">{{ file.nama_file }}</td>
              <td class="file-filename">{{ file.file }}</td>
              <td>{{ formatDateTime(file.created_at) }}</td>
              <td class="actions">
                <button @click="downloadFile(file)" class="btn-download" title="Download">
                  <i class="fas fa-download"></i>
                </button>
                <button v-if="canUpdate" @click="openEditModal(file)" class="btn-edit" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button v-if="canDelete" @click="deleteFile(file)" class="btn-delete" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filesList.length === 0">
              <td colspan="4" class="no-data">
                <i class="fas fa-inbox"></i>
                <p>Tidak ada data file</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


    <!-- Tab 2: Staf Klinis -->
    <div v-if="activeTab === 'staf'">
      <!-- Filters -->
      <div class="actions-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="stafSearch" 
            @input="handleStafSearch"
            type="text" 
            placeholder="Cari Nama / NIK..."
          >
        </div>
        
        <select v-model="stafFilter.kategori" @change="loadStafList" class="filter-select">
          <option value="">Semua Kategori</option>
          <option value="Staf Medis">Staf Medis</option>
          <option value="Staf Keperawatan">Staf Keperawatan</option>
          <option value="Staf Kebidanan">Staf Kebidanan</option>
          <option value="Staf Klinis Lainnya">Staf Klinis Lainnya</option>
        </select>

        <select v-model="stafFilter.status" @change="loadStafList" class="filter-select">
          <option value="">Semua Status</option>
          <option value="1">Sudah Ada Kualifikasi</option>
          <option value="0">Belum Ada Kualifikasi</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-container">
        <div v-if="stafLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Memuat data staf...</p>
        </div>

        <table v-else class="files-table">
          <thead>
            <tr>
              <th>Pegawai</th>
              <th>Jabatan</th>
              <th>Kualifikasi</th>
              <th>Masa Berlaku</th>
              <th class="actions-col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="staf in stafList" :key="staf.nik">
              <td>
                <div class="staf-info">
                  <span class="staf-nama">{{ staf.nama }}</span>
                  <span class="staf-nik">{{ staf.nik }}</span>
                </div>
              </td>
              <td>
                <div class="jabatan-info">
                  <span>{{ staf.jbtn }}</span>
                  <small class="text-muted">{{ staf.pendidikan }}</small>
                </div>
              </td>
              <td>
                <div v-if="staf.has_kualifikasi" class="kualifikasi-info">
                  <div class="badge-profesi">{{ staf.kategori_profesi }}</div>
                  <div class="detail-kualifikasi">
                    <small v-if="staf.nomor_str">STR: {{ staf.nomor_str }}</small>
                    <small v-if="staf.nomor_sip">SIP: {{ staf.nomor_sip }}</small>
                  </div>
                </div>
                <span v-else class="status-incomplete">Belum ada data</span>
              </td>
              <td>
                <div v-if="staf.has_kualifikasi" class="expiry-info">
                  <div v-if="staf.tanggal_akhir_str" :class="{'text-danger': new Date(staf.tanggal_akhir_str) < new Date(), 'text-success': new Date(staf.tanggal_akhir_str) >= new Date()}">
                    <i class="fas fa-calendar-alt"></i> STR: {{ formatDateTime(staf.tanggal_akhir_str).split(' ')[0] }} {{ formatDateTime(staf.tanggal_akhir_str).split(' ')[1] }} {{ formatDateTime(staf.tanggal_akhir_str).split(' ')[2] }}
                  </div>
                  <div v-if="staf.tanggal_izin_praktek">
                    <i class="fas fa-calendar-check"></i> SIP: {{ formatDateTime(staf.tanggal_izin_praktek).split(' ')[0] }} {{ formatDateTime(staf.tanggal_izin_praktek).split(' ')[1] }} {{ formatDateTime(staf.tanggal_izin_praktek).split(' ')[2] }}
                  </div>
                </div>
                <span v-else>-</span>
              </td>
              <td class="actions">
                <button 
                  v-if="staf.has_kualifikasi"
                  @click="openStafModal(staf, 'view')" 
                  class="btn-action btn-view"
                  title="Lihat Detail"
                >
                  <i class="fas fa-eye"></i> Detail
                </button>
                <button 
                  v-if="(staf.has_kualifikasi && canUpdate) || (!staf.has_kualifikasi && canCreate)"
                  @click="openStafModal(staf, 'edit')" 
                  :class="['btn-action', staf.has_kualifikasi ? 'btn-edit' : 'btn-add']"
                  :title="staf.has_kualifikasi ? 'Edit Data' : 'Tambah Data'"
                >
                  <i :class="['fas', staf.has_kualifikasi ? 'fa-edit' : 'fa-plus']"></i>
                  {{ staf.has_kualifikasi ? 'Edit' : 'Input' }}
                </button>
              </td>
            </tr>
            <tr v-if="stafList.length === 0">
              <td colspan="5" class="no-data">
                <i class="fas fa-users-slash"></i>
                <p>Tidak ada data staf ditemukan</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Staf Klinis -->
    <div v-if="showStafModal" class="modal-overlay" @click.self="closeStafModal">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h2>
            <i class="fas fa-user-md"></i>
            {{ isStafViewMode ? 'Detail Kualifikasi' : (stafFormData.has_kualifikasi ? 'Edit Kualifikasi' : 'Input Kualifikasi') }} 
            <small class="modal-subtitle">{{ stafFormData.nama }}</small>
          </h2>
          <button @click="closeStafModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveStaf" class="modal-form">
          <!-- Hidden NIK -->
          <input type="hidden" v-model="stafFormData.nik">
          
          <div class="form-row">
            <div class="form-group col-full">
              <label>Kategori Profesi <span class="required" v-if="!isStafViewMode">*</span></label>
              <select v-model="stafFormData.kategori_profesi" required :disabled="isStafViewMode">
                <option value="Staf Medis">Staf Medis</option>
                <option value="Staf Keperawatan">Staf Keperawatan</option>
                <option value="Staf Kebidanan">Staf Kebidanan</option>
                <option value="Staf Klinis Lainnya">Staf Klinis Lainnya</option>
              </select>
            </div>
          </div>

          <div class="form-section">
            <h3>Informasi STR</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Nomor STR <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.nomor_str" type="text" required :disabled="isStafViewMode">
              </div>
              <div class="form-group">
                <label>Tanggal Terbit STR <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.tanggal_str" type="date" required :disabled="isStafViewMode">
              </div>
              <div class="form-group">
                <label>Masa Berlaku STR <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.tanggal_akhir_str" type="date" required :disabled="isStafViewMode">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Informasi SIP</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Nomor SIP <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.nomor_sip" type="text" required :disabled="isStafViewMode">
              </div>
              <div class="form-group">
                <label>Masa Berlaku SIP <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.tanggal_izin_praktek" type="date" required :disabled="isStafViewMode">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Pendidikan</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Perguruan Tinggi <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.perguruan_tinggi" type="text" required :disabled="isStafViewMode">
              </div>
              <div class="form-group">
                <label>Program Studi <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.prodi" type="text" required :disabled="isStafViewMode">
              </div>
              <div class="form-group">
                <label>Tanggal Lulus <span class="required" v-if="!isStafViewMode">*</span></label>
                <input v-model="stafFormData.tanggal_lulus" type="date" required :disabled="isStafViewMode">
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeStafModal" class="btn-cancel">{{ isStafViewMode ? 'Tutup' : 'Batal' }}</button>
            <button v-if="!isStafViewMode" type="submit" class="btn-submit" :disabled="savingStaf">
              <i class="fas" :class="savingStaf ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ savingStaf ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Upload/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <i class="fas fa-upload"></i>
            {{ isEditMode ? 'Edit File' : 'Upload File' }}
          </h2>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveFile" class="modal-form">
          <div class="form-group">
            <label>Nama File <span class="required">*</span></label>
            <input 
              v-model="formData.nama_file" 
              type="text" 
              required
              placeholder="Masukkan nama file"
            >
          </div>

          <div class="form-group">
            <label>
              File <span class="required" v-if="!isEditMode">*</span>
              <span v-if="isEditMode" class="hint">(Kosongkan jika tidak ingin mengganti file)</span>
            </label>
            <input 
              ref="fileInput"
              type="file" 
              @change="handleFileChange"
              :required="!isEditMode"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            >
            <small v-if="selectedFile" class="file-info">
              File terpilih: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </small>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Batal
            </button>
            <button type="submit" class="btn-submit" :disabled="saving">
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import fileManagerService from '@/services/fileManagerService'
import kualifikasiStafService from '@/services/kualifikasiStafService'
import { useMenuStore } from '@/stores/menu'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const menuStore = useMenuStore()
const authStore = useAuthStore()

// MENU_ID for Dokumen & Surat
const MENU_ID = 65

// State
const loading = ref(false)
const filesList = ref([])
const searchQuery = ref('')
const activeTab = ref('dokumen')

// Staf Klinis State
const stafLoading = ref(false)
const stafList = ref([])
const stafSearch = ref('')
const stafFilter = ref({
  kategori: '',
  status: ''
})
const showStafModal = ref(false)
const stafFormData = ref({
  nik: '',
  nama: '',
  kategori_profesi: '',
  nomor_str: '',
  tanggal_str: '',
  tanggal_akhir_str: '',
  nomor_sip: '',
  tanggal_izin_praktek: '',
  perguruan_tinggi: '',
  prodi: '',
  tanggal_lulus: '',
  status: 1
})
const savingStaf = ref(false)
const isStafViewMode = ref(false)




// Check permission
onMounted(async () => {
  if (menuStore.userMenus.length === 0) {
    await menuStore.fetchUserMenus()
  }
})

// Modal state
const showModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)
const formData = ref({
  id: null,
  nama_file: ''
})

// Check if user is admin
const isAdmin = computed(() => {
  return authStore.user?.data?.detail?.jbtn?.toLowerCase().includes('admin')
})

// Permissions
const canImport = computed(() => {
  if (isAdmin.value) return true
  return menuStore.hasMenuPermission(MENU_ID, 'can_import')
})

const canCreate = computed(() => {
  if (isAdmin.value) return true
  return menuStore.hasMenuPermission(MENU_ID, 'can_create')
})

const canUpdate = computed(() => {
  if (isAdmin.value) return true
  return menuStore.hasMenuPermission(MENU_ID, 'can_update')
})

const canDelete = computed(() => {
  if (isAdmin.value) return true
  return menuStore.hasMenuPermission(MENU_ID, 'can_delete')
})

// Load files
const loadFiles = async () => {
  loading.value = true
  try {
    const params = {
      limit: 1000
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await fileManagerService.getFiles(params)
    filesList.value = response.data.data || []
  } catch (error) {
    console.error('Error loading files:', error)
  } finally {
    loading.value = false
  }
}

// Search handler with debounce
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadFiles()
  }, 500)
}

// Format datetime
const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Modal functions
const openUploadModal = () => {
  isEditMode.value = false
  formData.value = {
    id: null,
    nama_file: ''
  }
  selectedFile.value = null
  showModal.value = true
}

const openEditModal = (file) => {
  isEditMode.value = true
  formData.value = {
    id: file.id,
    nama_file: file.nama_file
  }
  selectedFile.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    id: null,
    nama_file: ''
  }
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

// Save file
const saveFile = async () => {
  saving.value = true
  try {
    const formDataToSend = new FormData()
    formDataToSend.append('nama_file', formData.value.nama_file)
    
    if (selectedFile.value) {
      formDataToSend.append('file', selectedFile.value)
    }

    if (isEditMode.value) {
      await fileManagerService.updateFile(formData.value.id, formDataToSend)
    } else {
      await fileManagerService.uploadFile(formDataToSend)
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `File berhasil ${isEditMode.value ? 'diupdate' : 'diupload'}`,
      timer: 2000,
      showConfirmButton: false
    })

    closeModal()
    loadFiles()
  } catch (error) {
    console.error('Error saving file:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan file'
    })
  } finally {
    saving.value = false
  }
}

// Delete file
const deleteFile = async (file) => {
  const result = await Swal.fire({
    title: 'Hapus File?',
    text: `Apakah Anda yakin ingin menghapus "${file.nama_file}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await fileManagerService.deleteFile(file.id)
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'File berhasil dihapus',
        timer: 2000,
        showConfirmButton: false
      })

      loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menghapus file'
      })
    }
  }
}

// Download file
const downloadFile = async (file) => {
  try {
    const response = await fileManagerService.downloadFile(file.id)
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.file)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading file:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: 'Terjadi kesalahan saat mengunduh file'
    })
  }
}


// Watch tab change
watch(activeTab, (val) => {
  if (val === 'staf') {
    loadStafList()
  }
})

// Staf Klinis Methods
const loadStafList = async () => {
  stafLoading.value = true
  try {
    const params = {
      search: stafSearch.value,
      kategori_profesi: stafFilter.value.kategori,
      has_kualifikasi: stafFilter.value.status,
      filter_user_dep: 1
    }
    const response = await kualifikasiStafService.getKualifikasi(params)
    stafList.value = response.data.data || []
  } catch (error) {
    console.error('Error loading staf:', error)
  } finally {
    stafLoading.value = false
  }
}

let stafSearchTimeout
const handleStafSearch = () => {
  clearTimeout(stafSearchTimeout)
  stafSearchTimeout = setTimeout(() => {
    loadStafList()
  }, 500)
}

const openStafModal = (data, mode = 'edit') => {
  isStafViewMode.value = mode === 'view'
  
  if (data.has_kualifikasi) {
    // Edit existing or View
    stafFormData.value = {
      nik: data.nik,
      nama: data.nama,
      kategori_profesi: data.kategori_profesi,
      nomor_str: data.nomor_str,
      tanggal_str: data.tanggal_str,
      tanggal_akhir_str: data.tanggal_akhir_str,
      nomor_sip: data.nomor_sip,
      tanggal_izin_praktek: data.tanggal_izin_praktek,
      perguruan_tinggi: data.perguruan_tinggi,
      prodi: data.prodi,
      tanggal_lulus: data.tanggal_lulus,
      status: data.status
    }
  } else {
    // New
    stafFormData.value = {
      nik: data.nik,
      nama: data.nama,
      kategori_profesi: 'Staf Medis',
      nomor_str: '',
      tanggal_str: '',
      tanggal_akhir_str: '',
      nomor_sip: '',
      tanggal_izin_praktek: '',
      perguruan_tinggi: '',
      prodi: '',
      tanggal_lulus: '',
      status: 1
    }
  }
  showStafModal.value = true
}

const closeStafModal = () => {
  showStafModal.value = false
  isStafViewMode.value = false
  stafFormData.value = { nik: '', nama: '' }
}


const saveStaf = async () => {
  savingStaf.value = true
  try {
    const isUpdate = stafList.value.find(s => s.nik === stafFormData.value.nik)?.has_kualifikasi
    
    if (isUpdate) {
      await kualifikasiStafService.updateKualifikasi(stafFormData.value.nik, stafFormData.value)
    } else {
      await kualifikasiStafService.createKualifikasi(stafFormData.value)
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Data kualifikasi berhasil disimpan',
      timer: 1500,
      showConfirmButton: false
    })

    closeStafModal()
    loadStafList()
  } catch (error) {
    console.error('Error saving staf:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
    })
  } finally {
    savingStaf.value = false
  }
}

// Initialize
onMounted(() => {
  loadFiles()
})
</script>

<style scoped>
.dokumen-surat-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content h1 i {
  color: #3b82f6;
}

.header-content p {
  color: #6b7280;
  margin: 0;
}

/* Tabs */
.tabs-container {
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-button:not(:disabled):hover {
  background: #f3f4f6;
  color: #1f2937;
}

.tab-button.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.tab-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Actions Bar */
.actions-bar {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-upload {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.files-table {
  width: 100%;
  border-collapse: collapse;
}

.files-table thead {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.files-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.files-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.files-table tbody tr:hover {
  background: #f9fafb;
}

.files-table td {
  padding: 1rem;
  color: #374151;
}

.file-name {
  font-weight: 600;
  color: #1f2937;
}

.file-filename {
  font-family: 'Courier New', monospace;
  color: #6b7280;
  font-size: 0.875rem;
}

.actions-col {
  text-align: center;
  width: 150px;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-download,
.btn-edit,
.btn-delete {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: white;
}

.btn-download {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.loading-state {
  padding: 4rem;
  text-align: center;
  color: #6b7280;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.no-data {
  text-align: center;
  padding: 4rem !important;
  color: #9ca3af;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.no-data p {
  margin: 0;
  font-size: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header h2 i {
  color: #3b82f6;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

/* Staf Klinis Select Styles */
.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
  cursor: pointer;
  outline: none;
  min-width: 150px;
}

.filter-select:focus {
  border-color: #3b82f6;
}

/* Staf Info */
.staf-info, .jabatan-info {
  display: flex;
  flex-direction: column;
}

.staf-nama {
  font-weight: 600;
  color: #1f2937;
}

.staf-nik {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.text-muted {
  color: #6b7280;
  font-size: 0.75rem;
}

/* Badge & Status */
.badge-profesi {
  display: inline-block;
  background: #eff6ff;
  color: #3b82f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.status-incomplete {
  display: inline-block;
  background: #f3f4f6;
  color: #9ca3af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-style: italic;
}

.detail-kualifikasi {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-size: 0.75rem;
}

.expiry-info {
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.text-danger { color: #ef4444; font-weight: 500; }
.text-success { color: #10b981; }

.btn-action {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-add {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn-view {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  margin-right: 0.5rem;
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

/* Modal Staf Extensions */
.modal-lg {
  max-width: 800px;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: normal;
  margin-left: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.col-full {
  grid-column: 1 / -1;
}

.form-section {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}

.form-section h3 {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.form-group input[type="date"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
}

.form-group input[type="date"]:focus {
  border-color: #3b82f6;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  background: white;
}

.hint {
  font-weight: normal;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-group input[type="text"],
.form-group input[type="file"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.form-group input[type="text"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.file-info {
  display: block;
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .dokumen-surat-page {
    padding: 1rem;
  }

  .tabs-container {
    grid-template-columns: 1fr 1fr;
  }

  .actions-bar {
    flex-direction: column;
  }

  .files-table {
    font-size: 0.875rem;
  }

  .files-table th,
  .files-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
