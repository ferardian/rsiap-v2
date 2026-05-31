<template>
  <div class="sdi-view pks-view">
    <!-- Header Hero Section -->
    <div class="hero-header">
      <div class="hero-content">
        <div class="title-section">
          <div class="icon-box">
            <i class="fas fa-file-contract"></i>
          </div>
          <div class="title-text">
            <h1>Berkas Surat Keputusan (SK)</h1>
            <p>Manajemen data berkas Surat Keputusan elektronik</p>
          </div>
        </div>
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-folder-open"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pagination.total || 0 }}</span>
              <span class="stat-label">Total SK</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar-modern">
      <div class="action-bar-row">
        <!-- Search and Filter Left -->
        <div class="search-filter-group">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari berdasarkan No, Judul, atau PJ..." 
              @input="handleSearch"
            >
            <button v-if="searchQuery" class="clear-search" @click="clearSearch">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="filter-box">
            <i class="fas fa-calendar-alt filter-icon"></i>
            <input 
              v-model="filterDate" 
              type="date" 
              class="date-input"
              @change="handleSearch"
            >
            <button v-if="filterDate" class="clear-filter" @click="clearDateFilter" title="Reset Tanggal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="filter-box select-wrapper">
            <i class="fas fa-filter filter-icon"></i>
            <select v-model="filterJenis" @change="handleSearch" class="select-input">
              <option value="">Semua Jenis SK</option>
              <option value="A">SK Dokumen</option>
              <option value="B">SK Pengangkatan Jabatan</option>
            </select>
          </div>
        </div>

        <!-- Add Button Right -->
        <div class="action-buttons">
          <button class="btn-primary" @click="openCreateModal">
            <i class="fas fa-plus"></i>
            <span>Tambah SK</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card-modern">
      <div class="table-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data SK...</p>
        </div>

        <table v-else-if="skList.length > 0" class="modern-table">
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="20%">Nomor SK</th>
              <th width="35%">Judul SK</th>
              <th width="15%">Tanggal Terbit</th>
              <th width="15%">Penanggung Jawab</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sk, index) in skList" :key="index" class="table-row-hover">
              <td class="text-muted">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              <td>
                <div class="badge-nomor">
                  {{ formatNomorSk(sk) }}
                </div>
              </td>
              <td>
                <div class="fw-medium text-dark">{{ sk.judul }}</div>
                <div class="jenis-badge mt-1" :class="sk.jenis === 'A' ? 'badge-a' : 'badge-b'">
                  {{ sk.jenis === 'A' ? 'SK Dokumen' : sk.jenis === 'B' ? 'SK Pengangkatan Jabatan' : sk.jenis }}
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <i class="fas fa-calendar-day text-muted mr-1"></i>
                  {{ formatDate(sk.tgl_terbit) }}
                </div>
              </td>
              <td>
                <div class="pj-cell" :title="sk.penanggung_jawab?.nama || sk.pj">
                  <div class="pj-avatar">{{ getInitials(sk.penanggung_jawab?.nama || sk.pj) }}</div>
                  <span class="pj-name text-truncate">{{ sk.penanggung_jawab?.nama || sk.pj }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons-cell justify-content-center">
                  <button class="btn-action btn-view" @click="openDetailModal(sk)" title="Detail">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button v-if="sk.berkas" class="btn-action btn-file" @click="openFile(sk.berkas)" title="Lihat Berkas">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button v-else disabled class="btn-action btn-file-disabled" title="Berkas Belum Diupload">
                     <i class="fas fa-file-excel"></i>
                  </button>
                  <div class="dropdown-more">
                    <button class="btn-action btn-more" @click="toggleMenu(index)" title="Lainnya">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <!-- Dropdown Menu -->
                    <div v-if="activeMenu === index" class="dropdown-menu-custom">
                      <button class="dropdown-item" @click="openEditModal(sk); activeMenu = null">
                        <i class="fas fa-edit text-primary"></i> Edit SK
                      </button>
                      <button class="dropdown-item" @click="openUploadModal(sk); activeMenu = null">
                        <i class="fas fa-upload text-success"></i> Upload Berkas
                      </button>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item text-danger" @click="confirmDelete(sk); activeMenu = null">
                        <i class="fas fa-trash"></i> Hapus SK
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-file-contract"></i>
          </div>
          <h3>Pencarian Tidak Ditemukan</h3>
          <p>Belum ada data Surat Keputusan yang terdaftar atau sesuai kriteria pencarian.</p>
          <button v-if="searchQuery || filterDate || filterJenis" class="btn-outline-primary mt-3" @click="resetFilters">
            <i class="fas fa-sync-alt mr-2"></i>Reset Pencarian
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="pagination-container">
        <div class="pagination-info">
          Menampilkan {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
          {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
          dari {{ pagination.total }} data
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-page" 
            :disabled="pagination.current_page === 1"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page"
              class="btn-page-number"
              :class="{ active: page === pagination.current_page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button 
            class="btn-page" 
            :disabled="pagination.current_page === pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals go here -->
    <SkFormModal 
      :show="showFormModal"
      :is-edit="isEditMode"
      :sk-data="selectedSk"
      @close="showFormModal = false"
      @saved="loadSk"
    />

    <SkDetailModal 
      :show="showDetailModal"
      :sk-data="selectedSk"
      @close="showDetailModal = false"
    />

    <SkUploadModal 
      :show="showUploadModal"
      :sk="selectedSk"
      @close="showUploadModal = false"
      @uploaded="loadSk"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-sm" @click.stop>
        <div class="modal-icon-header text-danger">
          <div class="icon-circle bg-danger-light">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="modal-body text-center mt-3">
          <h3 class="mb-2">Hapus SK?</h3>
          <p class="text-muted">
            Anda yakin ingin menghapus SK nomor <br>
            <strong>{{ formatNomorSk(selectedSk) }}</strong>?<br>
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div class="modal-footer-flex">
          <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
          <button class="btn-danger" @click="executeDelete" :disabled="deleting">
            <i class="fas fa-trash" v-if="!deleting"></i>
            <span class="spinner-border spinner-border-sm" v-else></span>
            {{ deleting ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { skService } from '@/services/skService'
import debounce from 'lodash/debounce'
import { format } from 'date-fns'

// Import Modals (we will create these next)
import SkFormModal from './components/SkFormModal.vue'
import SkDetailModal from './components/SkDetailModal.vue'
import SkUploadModal from './components/SkUploadModal.vue'

const toast = useToast()

// State
const skList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterDate = ref('')
const filterJenis = ref('')
const activeMenu = ref(null)

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0
})

// Modal States
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showUploadModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const selectedSk = ref(null)
const deleting = ref(false)

// Close dropdowns when clicking outside
const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-more')) {
    activeMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
  loadSk()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const toggleMenu = (index) => {
  if (activeMenu.value === index) {
    activeMenu.value = null
  } else {
    activeMenu.value = index
  }
}

const buildFilters = () => {
  const filters = [
    { field: 'status', operator: '=', value: '1' }
  ]
  
  if (filterJenis.value) {
    filters.push({ field: 'jenis', operator: '=', value: filterJenis.value })
  }
  
  if (filterDate.value) {
    // Add 1 day to match backend logic based on Filetrack
    const dateObj = new Date(filterDate.value)
    dateObj.setDate(dateObj.getDate() + 1)
    const formattedDate = dateObj.toISOString().split('T')[0]
    filters.push({ field: 'tgl_terbit', operator: '=', value: formattedDate })
  }
  
  return filters
}

const loadSk = async (page = 1) => {
  loading.value = true
  try {
    const filters = buildFilters()
    const response = await skService.searchSk(searchQuery.value, pagination.value.per_page, page, filters)
    
    if (response.data) {
      skList.value = response.data.data || []
      pagination.value = response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: skList.value.length
      }
    }
  } catch (error) {
    console.error('Error loading SK:', error)
    toast.error('Gagal memuat data SK')
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  pagination.value.current_page = 1
  loadSk(1)
}, 500)

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

const clearDateFilter = () => {
  filterDate.value = ''
  handleSearch()
}

const resetFilters = () => {
  searchQuery.value = ''
  filterDate.value = ''
  filterJenis.value = ''
  handleSearch()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadSk(page)
  }
}

// Formatters
const parseDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr.replace(' ', 'T'))
}

const formatDate = (dateString) => {
  const d = parseDate(dateString)
  if (!d) return '-'
  try {
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatNomorSk = (sk) => {
  if (!sk) return '-'
  try {
    const tglPattern = sk.tgl_terbit ? format(parseDate(sk.tgl_terbit), 'ddMMyy') : ''
    const no = String(sk.nomor).padStart(3, '0')
    return `${no}/${sk.jenis}/${sk.prefix}/${tglPattern}`
  } catch (e) {
    return `${sk.nomor}/${sk.jenis}/${sk.prefix}`
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

// Actions
const openFile = (berkas) => {
  if (!berkas) return
  const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') || window.location.hostname.includes('127.0.0.1')
  const baseUrl = isLocal ? 'http://192.168.100.33' : 'https://sim.rsiaaisyiyah.com'
  const url = `${baseUrl}/webapps/rsia_sk/${berkas}`
  window.open(url, '_blank')
}

const openCreateModal = () => {
  selectedSk.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openDetailModal = (sk) => {
  selectedSk.value = sk
  showDetailModal.value = true
}

const openEditModal = (sk) => {
  selectedSk.value = sk
  isEditMode.value = true
  showFormModal.value = true
}

const openUploadModal = (sk) => {
  selectedSk.value = sk
  showUploadModal.value = true
}

const confirmDelete = (sk) => {
  selectedSk.value = sk
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!selectedSk.value) return
  
  deleting.value = true
  try {
    const data = { ...selectedSk.value, status: '0' }
    if (data.penanggung_jawab) delete data.penanggung_jawab
    
    const identifier = btoa(`${data.nomor}.${data.jenis}.${data.tgl_terbit}`)
    await skService.deleteSk(identifier, data)
    
    toast.success('Berkas SK berhasil dihapus')
    showDeleteModal.value = false
    loadSk(pagination.value.current_page)
  } catch (error) {
    console.error('Error deleting SK:', error)
    toast.error('Gagal menghapus berkas SK')
  } finally {
    deleting.value = false
  }
}

// Computed for pagination styling
const displayedPages = computed(() => {
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const pages = []
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      pages.push(i)
    }
  }
  
  return pages.filter((page, index, array) => {
    if (index > 0 && page - array[index - 1] > 1) {
      // Add ellipsis if gap
      // Since we just want simple numbers for now, return true
    }
    return true
  })
})
</script>

<style scoped>
/* Reuse and extend styles from PksView / modern layout */
.sdi-view {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.hero-header::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgoJPC9zdmc+') repeat;
  opacity: 0.5;
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-box {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.title-text p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.95rem;
}

.stats-section {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 160px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  font-size: 1.25rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* Action Bar */
.action-bar-modern {
  margin-bottom: 1.5rem;
}

.action-bar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-filter-group {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search, .clear-filter {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover, .clear-filter:hover {
  color: #ef4444;
  background: #fee2e2;
}

.filter-box {
  position: relative;
  min-width: 180px;
}

.filter-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 1;
}

.filter-box input, .filter-box select {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #334155;
  cursor: pointer;
  appearance: none;
}

.select-wrapper::after {
  content: '\f107';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f59e0b;
  color: white;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-primary:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);
}

/* Card & Table modern */
.card-modern {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-container {
  overflow-x: auto;
  position: relative;
  min-height: 300px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.875rem;
}

.table-row-hover:hover {
  background-color: #f8fafc;
}

.badge-nomor {
  display: inline-flex;
  font-family: monospace;
  background: #f1f5f9;
  color: #475569;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
}

.jenis-badge {
  display: inline-flex;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-a {
  background: #e0e7ff;
  color: #4f46e5;
}

.badge-b {
  background: #fce7f3;
  color: #db2777;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #334155;
  font-weight: 500;
}

.pj-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pj-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}

.pj-name {
  font-weight: 500;
  color: #1e293b;
  max-width: 150px;
}

/* Action Buttons Grid */
.action-buttons-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #64748b;
}

.btn-view:hover {
  background: #dbeafe;
  color: #2563eb;
}

.btn-file {
  background: #e0e7ff;
  color: #4f46e5;
}

.btn-file:hover {
  background: #4f46e5;
  color: white;
}

.btn-file-disabled {
  background: #fee2e2;
  color: #ef4444;
  opacity: 0.5;
  cursor: not-allowed;
  border: none;
}

.btn-more:hover, .dropdown-more.show .btn-more {
  background: #e2e8f0;
  color: #0f172a;
}

.dropdown-more {
  position: relative;
}

.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: calc(100% + 5px);
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 160px;
  z-index: 50;
  padding: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

/* Empty & Loading States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  background: radial-gradient(circle at center, rgba(248, 250, 252, 0.5) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 16px;
}

.empty-icon {
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

.empty-icon::after {
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

.empty-state h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0.5rem 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.empty-state p {
  color: #64748b;
  font-size: 0.925rem;
  margin-bottom: 2rem;
  max-width: 320px;
  line-height: 1.5;
}

.loading-state {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pagination */
.pagination-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page, .btn-page-number {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  color: #475569;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:not(:disabled):hover, .btn-page-number:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
}

.btn-page-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Modals Overlay Base */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content.modal-sm {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-icon-header {
  display: flex;
  justify-content: center;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.bg-danger-light {
  background: #fee2e2;
  color: #ef4444;
}

.modal-footer-flex {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-footer-flex button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

/* Utilities */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-outline-primary {
  padding: 0.75rem 1.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 700;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
}

.btn-outline-primary:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  transform: translateY(-1px);
}

.btn-outline-primary:active {
  transform: translateY(0);
}

.btn-outline-primary i {
  font-size: 0.85rem;
  transition: transform 0.4s ease;
}

.btn-outline-primary:hover i {
  transform: rotate(180deg);
}

/* Responsive */
@media (max-width: 1024px) {
  .action-bar-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .search-filter-group {
    flex-direction: column;
  }
  
  .action-buttons {
    width: 100%;
  }
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
