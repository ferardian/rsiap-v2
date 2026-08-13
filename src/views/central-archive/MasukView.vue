<template>
  <div class="masuk-view-wrapper">
    <div class="masuk-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-inbox"></i>
          </div>
          <div>
            <h1 class="hero-title">
              Surat Masuk
              <span class="mobile-stats-badge">{{ pagination.total }} Surat</span>
            </h1>
            <p class="hero-subtitle">Manajemen arsip surat masuk dari instansi luar RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <span class="stat-label">Total Surat</span>
            <span class="stat-value">{{ pagination.total }}</span>
          </div>
        </div>
      </div>

      <!-- Filter & Action Bar -->
      <div class="action-bar flex-wrap">
        <div class="filter-group">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari perihal, nomor surat, atau pengirim..."
              @keyup.enter="handleSearch"
            >
          </div>
          <div class="date-filter">
            <span class="filter-label">Tanggal :</span>
            <input type="date" v-model="filters.tgl_start" class="filter-input">
            <span>s/d</span>
            <input type="date" v-model="filters.tgl_end" class="filter-input">
          </div>
          <select v-model="filters.ket" class="filter-input status-select">
            <option value="">Semua Via</option>
            <option value="email">Email</option>
            <option value="fisik">Fisik</option>
            <option value="wa">WhatsApp</option>
          </select>
          <button class="btn-filter" @click="handleSearch" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Terapkan
          </button>
        </div>
        <button class="btn-add" @click="openAddModal">
          <i class="fas fa-plus"></i>
          Buat Surat Baru
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Unified Loading State -->
        <div v-if="loading" class="loading-state-unified">
          <div class="spinner-container">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Memuat Surat Masuk...</p>
        </div>

        <!-- Unified Empty State -->
        <div v-else-if="suratList.length === 0" class="empty-state-unified">
          <div class="empty-icon-container">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3>Arsip Kosong</h3>
          <p>Tidak ada data surat masuk ditemukan untuk kriteria ini.</p>
          <button class="btn-refresh-empty" @click="handleSearch">
            <i class="fas fa-sync-alt"></i> Segarkan Halaman
          </button>
        </div>
        
        <!-- Desktop Table View -->
        <div v-else class="table-responsive desktop-view">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="150">No. SIMRS</th>
                <th>Perihal</th>
                <th width="250">Pengirim</th>
                <th width="150">Tanggal Surat</th>
                <th width="120">Berkas</th>
                <th width="80">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in suratList" :key="item.no" @click="viewDetail(item)">
                <td>
                   <span class="badge-gray">{{ formatDateSIMRS(item.no_simrs) }}</span>
                </td>
                <td>
                  <div class="flex-align-center gap-2">
                    <span :class="['via-icon', item.ket]">
                      <i :class="getViaIcon(item.ket)"></i>
                    </span>
                    <span class="fw-bold perihal-text">{{ item.perihal }}</span>
                  </div>
                </td>
                <td>
                  <span class="pengirim-text text-muted">{{ item.pengirim || '-' }}</span>
                </td>
                <td>{{ formatDateFull(item.tgl_surat) }}</td>
                <td @click.stop>
                  <button 
                    v-if="item.berkas" 
                    class="btn-berkas" 
                    title="Lihat Berkas" 
                    @click="openBerkas(item.berkas)"
                  >
                    <i class="fas fa-file-alt"></i> Lihat
                  </button>
                  <button v-else class="btn-berkas disabled" disabled>
                    <i class="fas fa-file-excel"></i> Kosong
                  </button>
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button class="btn-icon edit" title="Edit" @click="openEditModal(item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon upload" title="Upload Berkas Baru" @click="openUploadModal(item)">
                      <i class="fas fa-file-upload"></i>
                    </button>
                    <button class="btn-icon delete" title="Hapus" @click="confirmDelete(item)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div v-if="!loading && suratList.length > 0" class="mobile-view">
          <div v-for="item in suratList" :key="item.no" class="mobile-card" @click="viewDetail(item)">
            <div class="mobile-card-header">
              <span class="mobile-card-no text-mono">SIMRS: {{ formatDateSIMRS(item.no_simrs) }}</span>
              <span :class="['via-icon-mini', item.ket]">
                 <i :class="getViaIcon(item.ket)"></i>
              </span>
            </div>
            <div class="mobile-card-body">
              <h3 class="mobile-card-perihal">{{ item.perihal }}</h3>
              <div class="mobile-card-meta">
                <div class="meta-item">
                  <i class="far fa-user"></i>
                  {{ item.pengirim || '-' }}
                </div>
                <div class="meta-item">
                  <i class="far fa-calendar-alt"></i>
                  {{ formatDateFull(item.tgl_surat) }}
                </div>
              </div>
            </div>
            <div class="mobile-card-footer" @click.stop>
              <div class="mobile-actions-left">
                <button v-if="item.berkas" class="btn-mobile-edit" @click="openBerkas(item.berkas)">
                  <i class="fas fa-file-alt"></i> Berkas
                </button>
              </div>
              <div class="mobile-actions-right">
                <button class="btn-mobile-action edit" @click="openEditModal(item)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-mobile-action upload" @click="openUploadModal(item)" title="Upload">
                  <i class="fas fa-file-upload"></i>
                </button>
                <button class="btn-mobile-action mr-0 delete" @click="confirmDelete(item)" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination-footer">
          <button 
            :disabled="pagination.current_page === 1" 
            @click="changePage(pagination.current_page - 1)"
            class="btn-page"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>
          <button 
            :disabled="pagination.current_page === pagination.last_page" 
            @click="changePage(pagination.current_page + 1)"
            class="btn-page"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create/Edit) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container main-modal">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit Surat Masuk' : 'Tambah Surat Masuk' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSurat" id="suratForm">
            <div class="form-row flex-row">
              <div class="form-group flex-1">
                <label>No. SIMRS <span class="required">*</span></label>
                <input v-model="formData.no_simrs" type="date" required>
              </div>
              <div class="form-group flex-1">
                <label>No. Surat <span class="required">*</span></label>
                <input v-model="formData.no_surat" type="text" placeholder="Gunakan '-' jika tidak ada" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group col-full">
                <label>Perihal <span class="required">*</span></label>
                <input v-model="formData.perihal" type="text" placeholder="Masukkan perihal surat" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-full">
                <label>Pengirim <span class="required">*</span></label>
                <input v-model="formData.pengirim" type="text" placeholder="Masukkan pengirim surat" required>
              </div>
            </div>

            <div class="form-row flex-row">
              <div class="form-group flex-1">
                <label>Tanggal Surat <span class="required">*</span></label>
                <input v-model="formData.tgl_surat" type="date" required>
              </div>
              <div class="form-group flex-1">
                <label>Via</label>
                <select v-model="formData.ket">
                  <option value="-">Tidak Diketahui</option>
                  <option value="wa">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="fisik">Fisik</option>
                </select>
              </div>
            </div>
            
            <div class="form-row flex-row">
              <div class="form-group flex-1">
                <label>Tanggal Pelaksanaan</label>
                <input v-model="formData.pelaksanaan" type="date">
              </div>
              <div class="form-group flex-1">
                <label>Sampai Tanggal</label>
                <input v-model="formData.pelaksanaan_end" type="date">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-full">
                <label>Tempat Pelaksanaan</label>
                <input v-model="formData.tempat" type="text" placeholder="Tempat pelaksanaan...">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-full">
                <label>File Berkas Surat <small class="text-muted">(Opsional)</small></label>
                <input type="file" ref="fileInput" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="file-input">
                <small class="text-muted d-block mt-1">Maksimal ukuran file 10MB. Kosongkan jika berkas belum tersedia.</small>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Batal</button>
          <button type="submit" form="suratForm" class="btn-save-modal" :disabled="submitting">
            <span v-if="submitting"><i class="fas fa-spinner fa-spin mr-1"></i> Menyimpan...</span>
            <span v-else><i class="fas fa-save mr-1"></i> {{ isEdit ? 'Simpan Perubahan' : 'Simpan Surat' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-container detail-modal">
        <div class="modal-header">
          <h2>Detail Surat Masuk</h2>
          <button class="btn-close" @click="closeDetail">&times;</button>
        </div>
        <div class="modal-body p-0">
          <div class="detail-header-card">
            <div class="detail-icon" :class="selectedItem?.ket">
              <i :class="getViaIcon(selectedItem?.ket)"></i>
            </div>
            <div class="detail-title-wrapper">
              <h3 class="detail-title">{{ selectedItem?.perihal }}</h3>
              <div class="detail-subtitle">
                <span><i class="fas fa-building mr-1"></i> {{ selectedItem?.pengirim || '-' }}</span>
                <span class="bullet">•</span>
                <span><i class="fas fa-calendar-alt mr-1"></i> {{ formatDateFull(selectedItem?.tgl_surat) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-content p-4">
             <div class="info-grid">
               <div class="info-item">
                <label>No. SIMRS</label>
                <div class="info-value text-mono">{{ formatDateSIMRS(selectedItem?.no_simrs) }}</div>
              </div>
              <div class="info-item">
                <label>No. Surat</label>
                <div class="info-value">{{ selectedItem?.no_surat }}</div>
              </div>
              <div class="info-item">
                <label>Diterima Via</label>
                <div class="info-value uppercase">{{ selectedItem?.ket || '-' }}</div>
              </div>
            </div>
            
            <div class="card-section mt-4 warning-light" v-if="selectedItem?.pelaksanaan || selectedItem?.pelaksanaan_end || selectedItem?.tempat">
              <div class="card-section-header">
                <i class="fas fa-calendar-check"></i>
                <span>Informasi Pelaksanaan</span>
              </div>
              <div class="info-grid mt-2">
                <div class="info-item">
                  <label>Tanggal Pelaksanaan</label>
                  <div class="info-value">
                    {{ formatDateFull(selectedItem?.pelaksanaan) }}
                    <span v-if="selectedItem?.pelaksanaan_end && selectedItem?.pelaksanaan !== selectedItem?.pelaksanaan_end"> 
                       s/d {{ formatDateFull(selectedItem?.pelaksanaan_end) }}
                    </span>
                  </div>
                </div>
                <div class="info-item" v-if="selectedItem?.tempat">
                  <label>Lokasi</label>
                  <div class="info-value">{{ selectedItem?.tempat }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="selectedItem?.berkas" class="btn-berkas mr-auto block" @click="openBerkas(selectedItem.berkas)">
            <i class="fas fa-file-alt"></i> Lihat Berkas Asli
          </button>
          <button class="btn-cancel" @click="closeDetail">Tutup</button>
        </div>
      </div>
    </div>
    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-container main-modal" style="max-width: 500px;">
        <div class="modal-header">
          <h2>
            <i class="fas fa-file-upload text-primary mr-2"></i>
            Upload Berkas
          </h2>
          <button class="btn-close" @click="closeUploadModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="warning-box mb-4">
            <div class="warning-icon"><i class="fas fa-info-circle"></i></div>
            <div class="warning-text">
              Upload berkas ini akan menimpa berkas lama jika sebelumnya sudah ada berkas yang ter-upload untuk surat <strong>{{ uploadItem?.perihal }}</strong>.
            </div>
          </div>
          
          <form @submit.prevent="submitUpload" id="uploadForm">
            <div class="form-group">
              <label>Pilih File PDF/Gambar <span class="required">*</span></label>
              <input type="file" ref="uploadInput" accept=".pdf,.jpg,.jpeg,.png" class="file-input" required>
              <small class="text-muted mt-1 d-block">Maksimal ukuran file: 10MB.</small>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeUploadModal">Batal</button>
          <button type="submit" form="uploadForm" class="btn-save-modal bg-primary" :disabled="uploadingFile">
            <span v-if="uploadingFile"><i class="fas fa-spinner fa-spin mr-1"></i> Mengupload...</span>
            <span v-else><i class="fas fa-cloud-upload-alt mr-1"></i> Upload Berkas</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { suratMasukService } from '@/services/suratMasukService'
import Swal from 'sweetalert2'

// Formatters & Helpers (moved up to prevent ReferenceError during setup initialization)
const parseDateLocal = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00') return null
  if (dateStr instanceof Date) return dateStr
  if (typeof dateStr === 'string') {
    // If it's a date-only string like YYYY-MM-DD
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
    if (dateOnlyPattern.test(dateStr)) {
      const parts = dateStr.split('-')
      return new Date(parts[0], parts[1] - 1, parts[2])
    }
    // If it's a date-only string with slashes YYYY/MM/DD
    const slashPattern = /^\d{4}\/\d{2}\/\d{2}$/
    if (slashPattern.test(dateStr)) {
      const parts = dateStr.split('/')
      return new Date(parts[0], parts[1] - 1, parts[2])
    }
    // If it's an ISO format with 'T' but has no timezone suffix (Z or +), replace '-' to force local parsing.
    if (dateStr.includes('T') && !dateStr.includes('Z') && !dateStr.includes('+')) {
      const cleanStr = dateStr.split('.')[0]
      const parts = cleanStr.split('T')
      const datePart = parts[0].replace(/-/g, '/')
      const timePart = parts[1]
      return new Date(`${datePart} ${timePart}`)
    }
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

const formatDateFull = (dateStr) => {
  const d = parseDateLocal(dateStr)
  if (!d) return '-'
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateSIMRS = (dateStr) => {
  const d = parseDateLocal(dateStr)
  if (!d) return '-'
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

const formatDateISO = (dateStr) => {
  const d = parseDateLocal(dateStr)
  if (!d) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


// State
const loading = ref(false)
const submitting = ref(false)
const suratList = ref([])
const searchQuery = ref('')
const filters = ref({
  tgl_start: '',
  tgl_end: '',
  ket: ''
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

// Modal & Form State
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const formData = ref({
  no_simrs: formatDateISO(new Date()),
  no_surat: '-',
  perihal: '',
  pengirim: '',
  tgl_surat: formatDateISO(new Date()),
  pelaksanaan: '',
  pelaksanaan_end: '',
  tempat: '',
  ket: '-',
  berkas: ''
})
const fileInput = ref(null)

// Upload Modal State
const showUploadModal = ref(false)
const uploadItem = ref(null)
const uploadInput = ref(null)
const uploadingFile = ref(false)

// Detail State
const showDetail = ref(false)
const selectedItem = ref(null)

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const payload = {
      page: page,
      limit: 10,
      sort: [{ field: 'no_simrs', direction: 'desc' }],
      filters: []
    }

    if (searchQuery.value) {
      payload.search = { value: searchQuery.value }
    }

    if (filters.value.ket) {
      payload.filters.push({ field: 'ket', operator: '=', value: filters.value.ket })
    }

    if (filters.value.tgl_start) {
      payload.filters.push({ field: 'tgl_surat', operator: '>=', value: filters.value.tgl_start })
    }
    if (filters.value.tgl_end) {
      payload.filters.push({ field: 'tgl_surat', operator: '<=', value: filters.value.tgl_end })
    }

    const response = await suratMasukService.getSuratMasuk(payload)
    suratList.value = response.data.data || []
    
    const meta = response.data.meta || response.data.pagination || response.data
    pagination.value = {
      current_page: meta.current_page || 1,
      last_page: meta.last_page || 1,
      total: meta.total || 0,
      per_page: meta.per_page || 10
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    if (error.response?.status !== 401) {
      Swal.fire('Error', 'Gagal memuat data surat masuk', 'error')
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current_page = 1
  fetchData(1)
}

const changePage = (page) => {
  pagination.value.current_page = page
  fetchData(page)
}

const openAddModal = () => {
  isEdit.value = false
  editId.value = null
  formData.value = {
    no_simrs: formatDateISO(new Date()),
    no_surat: '-',
    perihal: '',
    pengirim: '',
    tgl_surat: formatDateISO(new Date()),
    pelaksanaan: '',
    pelaksanaan_end: '',
    tempat: '',
    ket: '-',
    berkas: ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  editId.value = item.no
  
  formData.value = {
    no_simrs: formatDateISO(item.no_simrs),
    no_surat: item.no_surat || '-',
    perihal: item.perihal || '',
    pengirim: item.pengirim || '',
    tgl_surat: formatDateISO(item.tgl_surat),
    pelaksanaan: formatDateISO(item.pelaksanaan),
    pelaksanaan_end: formatDateISO(item.pelaksanaan_end),
    tempat: item.tempat || '',
    ket: item.ket || '-',
    berkas: item.berkas || ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveSurat = async () => {
  submitting.value = true
  try {
    const data = new FormData()
    
    // Append standard fields
    Object.keys(formData.value).forEach(key => {
      // Don't append empty berkas string as it's not a real file field
      if (key === 'berkas') return
      
      const val = formData.value[key]
      if (val) {
        data.append(key, val)
      }
    })

    // Append file if exists
    if (fileInput.value && fileInput.value.files[0]) {
      data.append('file', fileInput.value.files[0])
    }
    
    // Send request
    let actionTxt = ''
    if (isEdit.value && editId.value) {
      await suratMasukService.updateSuratMasuk(editId.value, data)
      actionTxt = 'diperbarui'
    } else {
      await suratMasukService.storeSuratMasuk(data)
      actionTxt = 'disimpan'
    }

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    Toast.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Surat Masuk berhasil ${actionTxt}`,
      background: '#f0fdf4',
      color: '#166534',
      iconColor: '#22c55e'
    })
    closeModal()
    fetchData(1)
  } catch (error) {
    console.error('Error saving surat:', error)
    Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (item) => {
  // Use `item.no` or `item.no_surat` base64 decoded depending on what backend requires.
  // Using item.no as fallback, assumed primary key/ID.
  const idValue = item.no
  
  Swal.fire({
    title: 'Hapus Surat?',
    text: "Tindakan ini tidak dapat dibatalkan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await suratMasukService.deleteSuratMasuk(idValue)
        Swal.fire('Terhapus!', 'Surat berhasil dihapus.', 'success')
        fetchData(pagination.value.current_page)
      } catch (error) {
        Swal.fire('Gagal', 'Gagal menghapus surat.', 'error')
      }
    }
  })
}

const viewDetail = async (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
}

// Upload File
const openUploadModal = (item) => {
  uploadItem.value = item
  if (uploadInput.value) {
    uploadInput.value.value = ''
  }
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadItem.value = null
}

const submitUpload = async () => {
  if (!uploadInput.value || !uploadInput.value.files[0]) {
    Swal.fire({ toast: true, position: 'top', icon: 'warning', title: 'Silakan pilih file!', showConfirmButton: false, timer: 3000 })
    return
  }

  uploadingFile.value = true
  try {
    const data = new FormData()
    data.append('file', uploadInput.value.files[0])
    
    // To satisfy validation / backend requirement we may need to append the required basic fields
    data.append('no_simrs', formatDateISO(uploadItem.value.no_simrs))
    data.append('no_surat', uploadItem.value.no_surat || '-')
    data.append('perihal', uploadItem.value.perihal)
    data.append('pengirim', uploadItem.value.pengirim)
    data.append('tgl_surat', formatDateISO(uploadItem.value.tgl_surat))
    data.append('ket', uploadItem.value.ket || '-')

    await suratMasukService.updateSuratMasuk(uploadItem.value.no, data)

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Berkas berhasil diupload', showConfirmButton: false, timer: 3000 })
    closeUploadModal()
    fetchData(pagination.value.current_page)
  } catch (error) {
    console.error('Upload error:', error)
    Swal.fire('Gagal', error.response?.data?.message || 'Gagal mengupload berkas', 'error')
  } finally {
    uploadingFile.value = false
  }
}


const getViaIcon = (ket) => {
  if (ket === 'wa') return 'fab fa-whatsapp'
  if (ket === 'email') return 'fas fa-envelope'
  if (ket === 'fisik') return 'fas fa-print'
  return 'fas fa-file-alt'
}

const openBerkas = (filename) => {
  if (!filename) return
  const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') || window.location.hostname.includes('127.0.0.1')
  const baseUrl = isLocal ? 'http://192.168.100.33' : 'https://sim.rsiaaisyiyah.com'
  const url = `${baseUrl}/webapps/rsia_surat_masuk/${encodeURI(filename)}`
  window.open(url, '_blank')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.masuk-view-wrapper {
  background: #f8fafc;
  min-height: calc(100vh - 64px);
  padding: 1.5rem;
}

.masuk-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Hero Header styles adapted from EksternalView but with its own color */
.hero-header {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.2);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.hero-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  max-width: 500px;
}

.hero-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.filter-input {
  padding: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #334155;
}

.status-select {
  min-width: 140px;
}

.btn-filter, .btn-add {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
}

.btn-filter {
  background: #f1f5f9;
  color: #475569;
}

.btn-filter:hover {
  background: #e2e8f0;
}

.btn-add {
  background: #0ea5e9;
  color: white;
  box-shadow: 0 4px 6px rgba(14, 165, 233, 0.2);
}

.btn-add:hover {
  background: #0284c7;
  transform: translateY(-1px);
}

/* Content Area */
.content-area {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

/* Loading & Empty States */
.loading-state-unified {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  color: #3b82f6;
  flex: 1;
}

.empty-state-unified {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  background: radial-gradient(circle at center, rgba(248, 250, 252, 0.5) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 16px;
  flex: 1;
}

.empty-icon-container {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.75rem;
  color: #3b82f6;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.8);
  position: relative;
  animation: floatEmptyIcon 4s ease-in-out infinite;
}

.empty-icon-container::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 6px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  filter: blur(2px);
  animation: shadowScale 4s ease-in-out infinite;
}

@keyframes floatEmptyIcon {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}

@keyframes shadowScale {
  0% { transform: translateX(-50%) scale(1); opacity: 0.6; }
  50% { transform: translateX(-50%) scale(0.8); opacity: 0.3; }
  100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
}

.empty-state-unified h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0.5rem 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.empty-state-unified p {
  color: #64748b;
  font-size: 0.925rem;
  margin-bottom: 2rem;
  max-width: 320px;
  line-height: 1.5;
}

.btn-refresh-empty {
  padding: 0.75rem 1.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
}

.btn-refresh-empty:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.btn-refresh-empty:active {
  transform: translateY(0);
}

.btn-refresh-empty i {
  font-size: 0.85rem;
  transition: transform 0.4s ease;
}

.btn-refresh-empty:hover i {
  transform: rotate(180deg);
}

/* Table */
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  background: #f8fafc;
  padding: 1rem;
  font-weight: 600;
  color: #475569;
  text-align: left;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  transition: background-color 0.2s;
}

.modern-table tbody tr {
  cursor: pointer;
}

.modern-table tbody tr:hover td {
  background-color: #f8fafc;
}

.text-mono {
  font-family: inherit; /* remove monospace generally keeping it clean */
}

.badge-gray {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

.perihal-text {
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.4;
  display: block;
}

.pengirim-text {
  font-size: 0.9rem;
}

/* Via Icons */
.via-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;
}

.via-icon.wa { background: #dcfce7; color: #16a34a; }
.via-icon.email { background: #fce7f3; color: #db2777; }
.via-icon.fisik { background: #e0e7ff; color: #4f46e5; }

.via-icon-mini {
  font-size: 1rem;
  color: #64748b;
}
.via-icon-mini.wa { color: #16a34a; }
.via-icon-mini.email { color: #db2777; }
.via-icon-mini.fisik { color: #4f46e5; }

/* Buttons */
.btn-berkas {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: #e0f2fe;
  color: #0284c7;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-berkas:hover {
  background: #bae6fd;
}

.btn-berkas.disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover { background: #e2e8f0; color: #334155; }
.btn-icon.edit { color: #0ea5e9; background: #e0f2fe; }
.btn-icon.edit:hover { background: #0ea5e9; color: white; }

.btn-icon.upload { color: #eab308; background: #fef9c3; }
.btn-icon.upload:hover { background: #eab308; color: white; }

.btn-icon.delete { color: #ef4444; background: #fee2e2; }
.btn-icon.delete:hover { background: #ef4444; color: white; }

/* Mobile View Elements */
.desktop-view { display: block; }
.mobile-view { display: none; padding: 1rem; }

@media (max-width: 1024px) {
  .masuk-view-wrapper {
    padding: 0.75rem 0.6rem 2rem 0.6rem;
    min-height: calc(100vh - 80px);
    background: #f8fafc;
  }
  
  .hero-header { 
    padding: 1rem 1.25rem; 
    border-radius: 12px; 
    margin-bottom: 1rem; 
    margin-top: 0; 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 0.5rem; 
    box-shadow: 0 10px 25px rgba(14, 165, 233, 0.2);
  }
  .hero-stats { display: none; }
  .hero-content { gap: 0.75rem; width: 100%; }
  .hero-icon { width: 44px; height: 44px; font-size: 1.2rem; border-radius: 12px; flex-shrink: 0; }
  
  .hero-title { 
    font-size: 1.25rem; 
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  
  .mobile-stats-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.65rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 800;
    color: white;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .hero-subtitle { font-size: 0.8rem; max-width: 100%; opacity: 0.9; }

  .action-bar { 
    margin: -1.25rem 0.5rem 1.5rem 0.5rem; 
    padding: 0.85rem 0.65rem; 
    flex-direction: column; 
    align-items: stretch;
    gap: 0.85rem;
    background: white;
    border-radius: 12px;
    z-index: 25;
    box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(226, 232, 240, 0.5);
  }
  
  .filter-group { 
    flex-direction: column; 
    width: 100%; 
    gap: 0.75rem; 
  }
  
  .search-box { 
    width: 100%; 
    position: relative;
    height: 36px;
    display: flex;
    align-items: center;
    flex: none !important;
    max-width: 100%;
  }
  .search-box i {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    z-index: 10;
    pointer-events: none;
    font-size: 0.8rem;
    margin: 0;
  }
  .search-box input { 
    width: 100%; 
    height: 100%;
    padding: 0 0.75rem 0 2rem !important;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.85rem;
  }
  
  .date-filter { 
    width: 100%; 
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
    background: transparent; 
    padding: 0; 
    border: none;
  }
  .filter-label { display: none; }
  .date-filter span { font-weight: 600; font-size: 0.7rem; color: #94a3b8; text-align: center; flex-shrink: 0; }
  .date-filter .filter-input { 
    flex: 1;
    min-width: 0;
    height: 36px;
    background: white; 
    border: 1px solid #e2e8f0; 
    padding: 0 0.25rem; 
    border-radius: 8px; 
    font-size: 0.8rem;
  }
  
  .status-select { 
    width: 100%;
    background: #f8fafc; 
    border: 1px solid #e2e8f0; 
    padding: 0 0.75rem; 
    border-radius: 8px;
    height: 36px;
    font-weight: 700;
    font-size: 0.85rem;
    color: #475569;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    min-width: 0;
  }
  
  .btn-filter { 
    width: 100%; 
    justify-content: center; 
    padding: 0.75rem; 
    border-radius: 8px; 
    background: #f1f5f9;
    color: #475569;
    font-weight: 700;
    height: 36px;
    font-size: 0.85rem;
  }
  
  .btn-add { 
    width: 100%; 
    justify-content: center; 
    padding: 0.65rem; 
    order: -1; 
    border-radius: 10px; 
    margin-bottom: 0.15rem;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
    font-weight: 700;
  }

  .content-area {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    overflow: visible;
  }

  .desktop-view { display: none !important; }
  .mobile-view { display: block !important; padding: 0.25rem 0; }
  
  .pagination-footer { 
    border-top: none; 
    margin-top: 1rem;
    padding: 1.25rem 0 3rem 0;
    background: transparent;
    justify-content: center;
  }

  .mobile-card {
    background: white;
    border-radius: 16px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
  }

  .mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px dashed #e2e8f0;
  }

  .mobile-card-perihal {
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0.5rem 0 1rem 0;
    color: #1e293b;
    line-height: 1.3;
  }

  .mobile-card-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.85rem;
    color: #64748b;
  }

  .meta-item i {
    width: 16px;
    color: #0ea5e9;
  }

  .mobile-card-footer {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #f8fafc;
  }

  .btn-mobile-edit, .btn-mobile-delete {
    flex: 1;
    padding: 0.65rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .btn-mobile-edit { background: #f1f5f9; color: #475569; border: none; }
  .btn-mobile-delete { background: #fffafa; color: #ef4444; border: 1px solid #fee2e2; }
}

/* Pagination */
.pagination-footer {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-page {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-page:not(:disabled):hover {
  background: #f8fafc;
  color: #0ea5e9;
  border-color: #0ea5e9;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  opacity: 1;
  visibility: visible;
  transition: all 0.3s;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-row {
  margin-bottom: 1rem;
}

.flex-row {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.file-input {
  padding: 0.4rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: #f8fafc;
  border-radius: 0 0 16px 16px;
}

.btn-cancel, .btn-save-modal {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-save-modal {
  background: #0ea5e9;
  color: white;
  box-shadow: 0 2px 4px rgba(14, 165, 233, 0.2);
}

.btn-save-modal:hover:not(:disabled) {
  background: #0284c7;
}

.btn-save-modal:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Detail Modal Exclusives */
.detail-modal {
  max-width: 650px;
}

.detail-header-card {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.detail-icon.wa { color: #16a34a; border-color: #bbf7d0; }
.detail-icon.email { color: #db2777; border-color: #fbcfe8; }
.detail-icon.fisik { color: #4f46e5; border-color: #c7d2fe; }

.detail-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #0f172a;
  line-height: 1.4;
}

.detail-subtitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.bullet { color: #cbd5e1; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-item label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
}

.card-section {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  background: white;
}

.card-section.warning-light {
  background: #fffbeb;
  border-color: #fde68a;
}

.card-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d97706;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #fcd34d;
}

</style>
