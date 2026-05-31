<template>
  <div class="sdi-view pks-view">
    <!-- Hero Header -->
    <div class="hero-header" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);">
      <div class="hero-content">
        <div class="title-section">
          <div class="icon-box">
            <i class="fas fa-radiation"></i>
          </div>
          <div class="title-text">
            <h1>Berkas Radiologi</h1>
            <p>Data Berkas Radiologi Terdaftar RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-folder-open"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pagination.total || 0 }}</span>
              <span class="stat-label">Total Berkas</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar-modern">
      <div class="action-bar-row">
        <!-- Search & Filter Left -->
        <div class="search-filter-group">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari berdasarkan Perihal atau PJ..." 
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
        </div>

        <!-- Add Button Right -->
        <div class="action-buttons">
          <button class="btn-primary" @click="openCreateModal">
            <i class="fas fa-plus"></i>
            <span>Tambah Berkas</span>
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
          <p>Memuat data berkas...</p>
        </div>

        <table v-else-if="berkasList.length > 0" class="modern-table">
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="20%">Nomor Surat</th>
              <th width="30%">Perihal</th>
              <th width="15%">Tanggal Terbit</th>
              <th width="20%">Penanggung Jawab</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(berkas, index) in berkasList" :key="index" class="table-row-hover">
              <td class="text-muted">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              <td>
                <div class="badge-nomor">
                  {{ formatNomorSurat(berkas) }}
                </div>
              </td>
              <td>
                <div class="fw-medium text-dark">{{ berkas.perihal }}</div>
              </td>
              <td>
                <div class="date-calendar-card">
                  <div class="card-header">{{ formatMonthBadge(berkas.tgl_terbit) }}</div>
                  <div class="card-body">
                    <span class="day">{{ formatDayBadge(berkas.tgl_terbit) }}</span>
                    <span class="year">{{ formatYearBadge(berkas.tgl_terbit) }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="pj-cell" :title="berkas.penanggung_jawab?.nama || berkas.pj">
                  <div class="pj-avatar">{{ getInitials(berkas.penanggung_jawab?.nama || berkas.pj) }}</div>
                  <span class="pj-name text-truncate">{{ berkas.penanggung_jawab?.nama || berkas.pj }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons-cell justify-content-center">
                  <button class="btn-action btn-view" @click="openDetailModal(berkas)" title="Detail">
                    <i class="fas fa-eye"></i>
                  </button>
                  <div class="dropdown-more">
                    <button class="btn-action btn-more" @click="toggleMenu(index)" title="Lainnya">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <!-- Dropdown Menu -->
                    <div v-if="activeMenu === index" class="dropdown-menu-custom">
                      <button class="dropdown-item" @click="openEditModal(berkas); activeMenu = null">
                        <i class="fas fa-edit text-primary"></i> Edit Berkas
                      </button>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item text-danger" @click="confirmDelete(berkas); activeMenu = null">
                        <i class="fas fa-trash"></i> Hapus Berkas
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
          <p>Belum ada data Berkas Radiologi yang terdaftar atau sesuai kriteria pencarian.</p>
          <button v-if="searchQuery || filterDate" class="btn-outline-primary mt-3" @click="resetFilters">
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

    <!-- Modals -->
    <RadiologiFormModal 
      :show="showFormModal"
      :is-edit="isEditMode"
      :data="selectedBerkas"
      @close="showFormModal = false"
      @saved="loadData"
    />

    <RadiologiDetailModal 
      :show="showDetailModal"
      :data="selectedBerkas"
      @close="showDetailModal = false"
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
          <h3 class="mb-2">Hapus Berkas?</h3>
          <p class="text-muted">
            Anda yakin ingin menghapus berkas nomor <br>
            <strong>{{ formatNomorSurat(selectedBerkas) }}</strong>?<br>
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
import { berkasRadiologiService } from '@/services/berkasRadiologiService'
import debounce from 'lodash/debounce'
import { format } from 'date-fns'

// Import Modals
import RadiologiFormModal from './components/RadiologiFormModal.vue'
import RadiologiDetailModal from './components/RadiologiDetailModal.vue'

const toast = useToast()

// State
const berkasList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterDate = ref('')
const activeMenu = ref(null)

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

// Modal States
const showFormModal = ref(false)
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const selectedBerkas = ref(null)
const deleting = ref(false)

// Close dropdowns when clicking outside
const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-more')) {
    activeMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
  loadData()
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
  
  if (filterDate.value) {
    const dateObj = new Date(filterDate.value)
    dateObj.setDate(dateObj.getDate() + 1)
    const formattedDate = dateObj.toISOString().split('T')[0]
    filters.push({ field: 'tgl_terbit', operator: '=', value: formattedDate })
  }
  
  return filters
}

const loadData = async (page = 1) => {
  loading.value = true
  try {
    const filters = buildFilters()
    const response = await berkasRadiologiService.search(searchQuery.value, pagination.value.per_page, page, filters)
    
    if (response.data) {
      berkasList.value = response.data.data || []
      pagination.value = response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: berkasList.value.length
      }
    }
  } catch (error) {
    console.error('Error loading Berkas:', error)
    toast.error('Gagal memuat data Berkas Radiologi')
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  pagination.value.current_page = 1
  loadData(1)
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
  handleSearch()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadData(page)
  }
}

// Formatters
const parseDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr.replace(' ', 'T'))
}

const formatDayBadge = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getDate().toString().padStart(2, '0') : '--'
}

const formatMonthBadge = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : '---'
}

const formatYearBadge = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getFullYear() : '----'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const d = parseDate(dateString)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

const formatNomorSurat = (berkas) => {
  if (!berkas) return '-'
  try {
    const tglPattern = berkas.tgl_terbit ? format(new Date(berkas.tgl_terbit.replace(' ', 'T').split('.')[0]), 'ddMMyy') : ''
    const no = String(berkas.nomor).padStart(3, '0')
    const prefix = berkas.prefix || 'RAD'
    return `${no}/${prefix}/${tglPattern}`
  } catch (e) {
    return `${berkas.nomor}/${berkas.prefix || 'RAD'}`
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.includes(' ') 
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : name.substring(0, 2).toUpperCase()
}

// Actions
const openCreateModal = () => {
  selectedBerkas.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openDetailModal = (berkas) => {
  selectedBerkas.value = berkas
  showDetailModal.value = true
}

const openEditModal = (berkas) => {
  selectedBerkas.value = berkas
  isEditMode.value = true
  showFormModal.value = true
}

const confirmDelete = (berkas) => {
  selectedBerkas.value = berkas
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!selectedBerkas.value) return
  
  deleting.value = true
  try {
    const identifier = btoa(`${selectedBerkas.value.nomor}.${selectedBerkas.value.tgl_terbit}`)
    await berkasRadiologiService.delete(identifier)
    
    toast.success('Berkas berhasil dihapus')
    showDeleteModal.value = false
    loadData(pagination.value.current_page)
  } catch (error) {
    console.error('Error deleting Berkas:', error)
    toast.error('Gagal menghapus berkas')
  } finally {
    deleting.value = false
  }
}

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
  
  return pages
})
</script>

<style scoped>
.sdi-view {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1.5rem;
}

/* Hero Header */
.hero-header {
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
  color: #e2e8f0;
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
  color: #e2e8f0;
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

.filter-box input {
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
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
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
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

/* Loading & Empty state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #3b82f6;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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

.pj-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 250px;
}

.pj-avatar {
  width: 32px;
  height: 32px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.pj-name {
  font-weight: 500;
  color: #1e293b;
}

.date-calendar-card {
  width: 65px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.table-row-hover:hover .date-calendar-card {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
  border-color: #bfdbfe;
}

.date-calendar-card .card-header {
  background: #3b82f6;
  color: white;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.2rem;
  text-align: center;
  letter-spacing: 0.05em;
}

.date-calendar-card .card-body {
  padding: 0.35rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-calendar-card .day {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.date-calendar-card .year {
  font-size: 0.55rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 0.1rem;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
}

/* Pagination Styles */
.pagination-container {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page-number {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-number:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-page-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Modal and Dropdown Styles */
.action-buttons-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #e0f2fe;
  color: #0369a1;
}

.btn-more:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.dropdown-more {
  position: relative;
}

.dropdown-menu-custom {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  width: 180px;
  z-index: 100;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: none;
  background: transparent;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
}

/* Modal General */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content.modal-sm {
  max-width: 400px;
  padding: 2rem;
  border-radius: 16px;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-icon-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.bg-danger-light { background-color: #fee2e2; }

.modal-footer-flex {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-footer-flex button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
}

.btn-cancel:hover { background: #f8fafc; }

.btn-danger {
  border: none;
  background: #ef4444;
  color: white;
}

.btn-danger:hover { background: #dc2626; }

@media (max-width: 768px) {
  .hero-content { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .stats-section { width: 100%; }
  .stat-card { flex: 1; }
  .action-bar-row { flex-direction: column; align-items: stretch; }
  .search-filter-group { flex-direction: column; }
  .action-buttons { margin-top: 0.5rem; }
}
</style>
