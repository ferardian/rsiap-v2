<template>
  <div class="sdi-view pks-view">
    <!-- Hero Header -->
    <div class="hero-header" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);">
      <div class="hero-content">
        <div class="title-section">
          <div class="icon-box">
            <i class="fas fa-envelope-open-text"></i>
          </div>
          <div class="title-text">
            <h1>Undangan</h1>
            <p>Data Undangan / Pertemuan Terdaftar RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pagination.total || 0 }}</span>
              <span class="stat-label">Total Undangan</span>
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
              placeholder="Cari berdasarkan Perihal atau Lokasi..." 
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

        <!-- Add Button Right (If needed, though current service is read-only) -->
        <div class="action-buttons">
          <!-- Button placeholder if crud is added later -->
          <div class="text-xs text-muted font-medium italic">
            <i class="fas fa-info-circle mr-1"></i> Terhubung dengan Manajemen Surat
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card-modern">
      <div class="table-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data undangan...</p>
        </div>

        <table v-else-if="undanganList.length > 0" class="modern-table">
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="15%">Tanggal</th>
              <th width="35%">Perihal</th>
              <th width="20%">Lokasi</th>
              <th width="15%">Tipe</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(undangan, index) in undanganList" :key="index" class="table-row-hover">
              <td class="text-muted">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              <td>
                <div class="date-calendar-card">
                  <div class="card-header">{{ formatMonth(undangan.tanggal) }}</div>
                  <div class="card-body">
                    <span class="day">{{ formatDayCell(undangan.tanggal) }}</span>
                    <span class="year">{{ formatYear(undangan.tanggal) }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="fw-bold text-dark mb-1">{{ undangan.perihal }}</div>
                <div class="text-xs text-muted" v-if="undangan.pj">
                  <i class="fas fa-user-tie mr-1"></i> PJ: {{ getPjName(undangan) }}
                </div>
              </td>
              <td>
                <div class="location-cell">
                  <i class="fas fa-map-marker-alt text-danger"></i>
                  <span>{{ undangan.lokasi || '-' }}</span>
                </div>
              </td>
              <td>
                <span class="badge-type" :class="getTypeClass(undangan.tipe)">
                  {{ undangan.tipe || 'Umum' }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-buttons-cell justify-content-center">
                  <button class="btn-action btn-view" @click="openDetailModal(undangan)" title="Detail">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <h3>Undangan Tidak Ditemukan</h3>
          <p>Belum ada data undangan yang terdaftar atau sesuai kriteria pencarian.</p>
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
          <button class="btn-page" :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button v-for="page in displayedPages" :key="page" class="btn-page-number" :class="{ active: page === pagination.current_page }" @click="changePage(page)">
              {{ page }}
            </button>
          </div>

          <button class="btn-page" :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <UndanganDetailModal 
      :show="showDetailModal"
      :data="selectedUndangan"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { undanganService } from '@/services/undanganService'
import debounce from 'lodash/debounce'

// Import Detail Modal
import UndanganDetailModal from './components/UndanganDetailModal.vue'

const toast = useToast()

// State
const undanganList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterDate = ref('')

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

// Modal States
const showDetailModal = ref(false)
const selectedUndangan = ref(null)

onMounted(() => {
  loadData()
})

const loadData = async (page = 1) => {
  loading.value = true
  try {
    const filters = []
    if (filterDate.value) {
      filters.push({ field: 'tanggal', operator: '>=', value: `${filterDate.value} 00:00:00` })
      filters.push({ field: 'tanggal', operator: '<=', value: `${filterDate.value} 23:59:59` })
    }
    
    const response = await undanganService.search(searchQuery.value, pagination.value.per_page, page, filters)
    
    if (response.data) {
      undanganList.value = response.data.data || []
      pagination.value = response.data.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: undanganList.value.length
      }
    }
  } catch (error) {
    console.error('Error loading Undangan:', error)
    toast.error('Gagal memuat data undangan')
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

const formatDayCell = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getDate().toString().padStart(2, '0') : '--'
}

const formatMonth = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase() : '---'
}

const formatYear = (dateString) => {
  const d = parseDate(dateString)
  return d ? d.getFullYear() : '----'
}

const getPjName = (undangan) => {
  const pj = undangan.penanggungJawab || undangan.penanggung_jawab
  return pj?.nama || undangan.pj || '-'
}

const getTypeClass = (type) => {
  if (!type) return 'badge-umum'
  const t = type.toLowerCase()
  if (t.includes('rapat')) return 'badge-rapat'
  if (t.includes('sosialisasi')) return 'badge-sosial'
  if (t.includes('bimtek')) return 'badge-bimtek'
  return 'badge-umum'
}

// Actions
const openDetailModal = (undangan) => {
  selectedUndangan.value = undangan
  showDetailModal.value = true
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
  padding: 2.5rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(30, 64, 175, 0.2);
  position: relative;
  overflow: hidden;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -20%; right: -10%;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-section { display: flex; align-items: center; gap: 1.5rem; }

.icon-box {
  width: 64px; height: 64px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title-text h1 { font-size: 1.75rem; font-weight: 800; margin: 0 0 0.35rem 0; letter-spacing: -0.02em; }
.title-text p { color: #dbeafe; margin: 0; font-size: 1rem; opacity: 0.9; }

.stats-section { display: flex; gap: 1.5rem; }

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.25rem 1.75rem;
  display: flex; align-items: center; gap: 1.25rem;
  min-width: 180px;
}

.stat-icon {
  width: 44px; height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1.5rem;
}

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 1.75rem; font-weight: 800; line-height: 1; margin-bottom: 0.25rem; }
.stat-label { font-size: 0.7rem; color: #dbeafe; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }

/* Action Bar */
.action-bar-modern { margin-bottom: 1.5rem; }
.action-bar-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.search-filter-group { display: flex; gap: 1rem; flex: 1; }

.search-box { position: relative; flex: 1; max-width: 400px; }
.search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #64748b; }
.search-box input {
  width: 100%; padding: 0.75rem 3rem 0.75rem 3rem;
  border: 1px solid #e2e8f0; border-radius: 12px;
  font-size: 0.9rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.search-box input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.clear-search, .clear-filter {
  position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: #94a3b8; cursor: pointer;
  width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.clear-search:hover, .clear-filter:hover { background: #fee2e2; color: #ef4444; }

.filter-box { position: relative; min-width: 200px; }
.filter-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #64748b; z-index: 1; }
.filter-box input {
  width: 100%; padding: 0.75rem 2.5rem 0.75rem 3rem;
  border: 1px solid #e2e8f0; border-radius: 12px;
  font-size: 0.9rem; background: white; color: #1e293b; cursor: pointer;
}

/* Card & Table */
.card-modern {
  background: white; border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden; border: 1px solid #f1f5f9;
}

.table-container { overflow-x: auto; position: relative; min-height: 400px; }

.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.modern-table th {
  background: #f8fafc; color: #475569; font-weight: 700; font-size: 0.75rem;
  text-transform: uppercase; letter-spacing: 0.08em; padding: 1.25rem 1.5rem;
  text-align: left; border-bottom: 2px solid #f1f5f9;
}

.modern-table td { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.table-row-hover:hover { background-color: #fbfcfe; cursor: pointer; }

/* Date Cell */
.date-cell .date-calendar-card {
  width: 70px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.25rem;
  text-align: center;
  letter-spacing: 0.05em;
}

.date-calendar-card .card-body {
  padding: 0.4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-calendar-card .day {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.date-calendar-card .year {
  font-size: 0.6rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 0.1rem;
}

.location-cell { display: flex; align-items: start; gap: 0.75rem; color: #475569; font-weight: 500; font-size: 0.9rem; line-height: 1.4; }

/* Badges */
.badge-type {
  display: inline-block; padding: 0.35rem 0.85rem; border-radius: 20px;
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
}
.badge-umum { background: #f1f5f9; color: #64748b; }
.badge-rapat { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.badge-sosial { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
.badge-bimtek { background: #fefce8; color: #ca8a04; border: 1px solid #fef9c3; }

/* Action Buttons */
.action-buttons-cell { display: flex; align-items: center; gap: 0.75rem; }
.btn-action {
  width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
  border-radius: 10px; border: none; background: #f8fafc; color: #64748b;
  cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
}
.btn-view:hover { background: #eff6ff; color: #2563eb; border-color: #dbeafe; transform: translateY(-2px); }

/* Pagination */
.pagination-container {
  padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-top: 2px solid #f8fafc;
}
.pagination-info { font-size: 0.875rem; color: #64748b; font-weight: 500; }
.pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
.btn-page {
  width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: #fff; color: #64748b; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.btn-page:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

.page-numbers { display: flex; gap: 0.5rem; }
.btn-page-number {
  min-width: 40px; height: 40px; border-radius: 12px; border: 1px solid transparent;
  background: transparent; color: #64748b; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-page-number:hover { background: #f1f5f9; }
.btn-page-number.active { background: #3b82f6; color: white; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); }

/* Loading & Empty state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  text-align: center;
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

@media (max-width: 1024px) {
  .hero-content { flex-direction: column; align-items: flex-start; gap: 2rem; }
  .stats-section { width: 100%; }
  .stat-card { flex: 1; }
  .action-bar-row { flex-direction: column; align-items: stretch; }
  .search-filter-group { flex-direction: column; }
}
</style>
