<template>
  <div class="spo-view-wrapper">
    <div class="spo-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div>
            <h1 class="hero-title">
              Berkas SPO
              <span class="mobile-stats-badge">{{ pagination.total }} SPO</span>
            </h1>
            <p class="hero-subtitle">Standar Prosedur Operasional RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>
      </div>

      <!-- Filter & Action Bar -->
      <div class="action-bar d-flex justify-content-between align-items-center">
        <div class="filter-group">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari SPO..."
              @keyup.enter="handleSearch"
            >
          </div>
          
          <div class="date-filter">
            <label class="small-label mr-2 mb-0">TGL TERBIT:</label>
            <input type="date" v-model="filters.tgl_terbit" class="filter-input" @change="handleSearch">
            <button v-if="filters.tgl_terbit" @click="clearDate" class="btn-clear text-danger" title="Clear Date">
               <i class="fas fa-times"></i>
            </button>
          </div>

          <label class="small-label ml-2 mr-1 mb-0">JENIS:</label>
          <select v-model="filters.jenis" class="filter-input status-select" @change="handleSearch">
            <option value="">Semua Jenis</option>
            <option value="penunjang">Penunjang</option>
            <option value="medis">Medis</option>
            <option value="umum">Umum</option>
          </select>

          <button class="btn-filter ml-2" @click="handleSearch" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Segarkan
          </button>
        </div>

        <div class="action-buttons ms-auto">
          <router-link to="/central-archive/spo/create" class="btn btn-primary d-flex align-items-center gap-2 rounded-lg px-4 fw-bold">
            <i class="fas fa-plus"></i> Tambah SPO
          </router-link>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Unified Loading State -->
        <div v-if="loading" class="loading-state-unified">
          <div class="spinner-container">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Memuat Data SPO...</p>
        </div>

        <!-- Unified Empty State -->
        <div v-else-if="responseList.length === 0" class="empty-state-unified">
          <div class="empty-icon-container">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3>Data Kosong</h3>
          <p>Tidak ada Standar Prosedur Operasional (SPO) yang cocok dengan filter pencarian.</p>
          <button class="btn-refresh-empty" @click="resetFilters">
            <i class="fas fa-undo"></i> Reset Filter
          </button>
        </div>
        
        <!-- Desktop Table View -->
        <div v-else class="table-responsive desktop-view">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="150">Nomor</th>
                <th>Judul</th>
                <th width="180">Unit</th>
                <th width="180">Tgl Terbit</th>
                <th width="120">Jenis</th>
                <th width="80" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in responseList" :key="item.id" @click="viewDetail(item)">
                <td>
                    <span class="badge bg-light text-dark fw-bold border">{{ item.nomor || '-' }}</span>
                </td>
                <td>
                  <div class="fw-bold">{{ item.judul }}</div>
                </td>
                <td>
                   <span class="badge" :class="item.unit ? 'bg-primary' : 'bg-danger'">
                      {{ item.unit ? item.unit.nama : (item.unit_id || '-') }}
                   </span>
                </td>
                <td>{{ formatDate(item.tgl_terbit) }}</td>
                <td>
                  <span class="badge" :class="getJenisClass(item.jenis)">
                    {{ item.jenis ? String(item.jenis).toUpperCase() : '-' }}
                  </span>
                </td>
                <td class="text-center" @click.stop>
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn-icon view-btn" title="Detail" @click="viewDetail(item)">
                       <i class="fas fa-eye text-primary"></i>
                    </button>
                    <button class="btn-icon edit-btn" title="Edit" @click="$router.push(`/central-archive/spo/edit/${item.id}`)">
                       <i class="fas fa-edit text-warning"></i>
                    </button>
                    <button v-if="canDelete" class="btn-icon delete-btn" title="Hapus" @click="handleDelete(item)">
                       <i class="fas fa-trash text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div v-if="!loading && responseList.length > 0" class="mobile-view">
          <div v-for="item in responseList" :key="item.id" class="mobile-card" @click="viewDetail(item)">
            <div class="mobile-card-header">
              <span class="badge bg-light text-dark fw-bold border">{{ item.nomor || '-' }}</span>
              <div class="d-flex gap-2 align-items-center">
                <span class="badge" :class="getJenisClass(item.jenis)">{{ item.jenis ? String(item.jenis).toUpperCase() : '-' }}</span>
                <i class="fas fa-edit text-warning cursor-pointer p-1" @click.stop="$router.push(`/central-archive/spo/edit/${item.id}`)"></i>
                <i v-if="canDelete" class="fas fa-trash text-danger cursor-pointer p-1" @click.stop="handleDelete(item)"></i>
              </div>
            </div>
            <div class="mobile-card-body">
              <h3 class="mobile-card-perihal">{{ item.judul }}</h3>
              <div class="mobile-card-meta">
                <div class="meta-item">
                  <i class="far fa-calendar-alt"></i>
                  {{ formatDate(item.tgl_terbit) }}
                </div>
                <div class="meta-item">
                   <i class="fas fa-building"></i>
                  {{ item.unit ? item.unit.nama : (item.unit_id || '-') }}
                </div>
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

    <!-- Detail Drawer -->
    <div v-if="showDetail" class="drawer-overlay" @click.self="closeDetail">
      <div class="drawer-container animate-slide-left">
        <div class="drawer-header">
          <div class="drawer-header-content">
            <span class="drawer-subtitle">Detail SPO</span>
            <h2 class="drawer-title">{{ selectedItem?.nomor || '-' }}</h2>
          </div>
          <button class="btn-close-drawer" @click="closeDetail">&times;</button>
        </div>
        
        <div class="drawer-body">
          <div class="card-section">
            <div class="text-center mb-4">
                <h4 class="fw-bold m-0 p-0 text-dark">RSIA Aisyiyah Pekajangan</h4>
                <p class="text-muted small">Standar Prosedur Operasional</p>
                <h3 class="mt-3 font-weight-bold text-primary">{{ selectedItem?.judul }}</h3>
            </div>
            
            <div class="info-grid mt-4">
              <div class="info-item">
                <label>Nomor Dokumen</label>
                <div class="info-value font-monospace fw-bold">{{ selectedItem?.nomor || '-' }}</div>
              </div>
              <div class="info-item">
                <label>Tanggal Ditetapkan</label>
                <div class="info-value">{{ formatDate(selectedItem?.tgl_terbit) }}</div>
              </div>
            </div>

            <div class="info-grid mt-3">
              <div class="info-item">
                <label>Direktur Ditetapkan Oleh</label>
                <div class="info-value fw-bold">
                    {{ selectedItem?.direktur?.nama || '...........................................' }}
                </div>
              </div>
              <div class="info-item">
                 <label>Halaman</label>
                 <div class="info-value">1/1</div>
              </div>
            </div>

            <!-- Content HTML -->
            <hr class="my-4"/>

            <div class="detail-block">
                <h6 class="fw-bold mb-2">Pengertian</h6>
                <div class="html-content" v-html="unescapeHtml(selectedItem?.pengertian)"></div>
            </div>

            <div class="detail-block mt-3">
                <h6 class="fw-bold mb-2">Tujuan</h6>
                <div class="html-content" v-html="unescapeHtml(selectedItem?.tujuan)"></div>
            </div>

            <div class="detail-block mt-3">
                <h6 class="fw-bold mb-2">Kebijakan</h6>
                <div class="html-content" v-html="unescapeHtml(selectedItem?.kebijakan)"></div>
            </div>

            <div class="detail-block mt-3">
                <h6 class="fw-bold mb-2">Prosedur</h6>
                <div class="html-content" v-html="unescapeHtml(selectedItem?.prosedur)"></div>
            </div>

            <div class="detail-block mt-3 mb-3">
                <h6 class="fw-bold mb-2">Unit Terkait</h6>
                <div v-if="spoUnits && spoUnits.length > 0">
                    <ol class="m-0 pl-3 html-content">
                        <li v-for="(uObj, idx) in spoUnits" :key="idx">
                            {{ uObj.unit ? uObj.unit.nama : uObj.unit_id }}
                        </li>
                    </ol>
                </div>
                <div v-else class="text-muted small font-italic">
                    Tidak ada unit terkait yang dimuat.
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import spoService from '@/services/spoService'
import Swal from 'sweetalert2'
import { useMenuStore } from '@/stores/menu'
import { computed } from 'vue'

const menuStore = useMenuStore()
const canDelete = computed(() => menuStore.hasMenuPermissionByRoute('/central-archive/spo', 'can_delete'))

// State
const loading = ref(false)
const responseList = ref([])
const searchQuery = ref('')
const filters = ref({
  tgl_terbit: '',
  jenis: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

// Detail State
const showDetail = ref(false)
const selectedItem = ref(null)
const spoUnits = ref([])

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const payload = {
      page: page,
      limit: 10,
      sort: [{ field: 'tgl_terbit', direction: 'desc' }],
      filters: []
    }

    if (searchQuery.value) {
      payload.search = { value: searchQuery.value }
    }

    if (filters.value.jenis) {
      payload.filters.push({ field: 'jenis', operator: '=', value: filters.value.jenis })
    }

    if (filters.value.tgl_terbit) {
      payload.filters.push({ field: 'tgl_terbit', operator: '=', value: filters.value.tgl_terbit })
    }

    const response = await spoService.searchSpo(payload)
    const resData = response.data
    
    responseList.value = resData.data || []
    
    // Process meta pagination if exists
    const meta = resData.meta || resData.pagination || resData
    pagination.value = {
      current_page: meta.current_page || 1,
      last_page: meta.last_page || Math.ceil((meta.total || 0) / (meta.per_page || 10)) || 1,
      total: meta.total || 0
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    Swal.fire('Error', 'Gagal memuat data SPO dari server.', 'error')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current_page = 1
  fetchData(1)
}

const resetFilters = () => {
   searchQuery.value = ''
   filters.value.tgl_terbit = ''
   filters.value.jenis = ''
   handleSearch()
}

const clearDate = () => {
    filters.value.tgl_terbit = ''
    handleSearch()
}

const changePage = (page) => {
  pagination.value.current_page = page
  fetchData(page)
}

const viewDetail = async (item) => {
  selectedItem.value = item
  showDetail.value = true
  spoUnits.value = []
  
  // Load Unit Data for Detail
  try {
    const response = await spoService.getSpoUnits(item.id)
    spoUnits.value = response.data?.data || []
  } catch(error) {
    console.error('Failed to stringify unit:', error)
  }
}

const closeDetail = () => {
  showDetail.value = false
}

const handleDelete = async (item) => {
  const result = await Swal.fire({
    title: 'Apakah anda yakin?',
    text: `Anda akan menghapus SPO "${item.judul}"`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    loading.value = true
    try {
      await spoService.deleteSpo(item.id)
      Swal.fire('Terhapus!', 'Data SPO berhasil dihapus.', 'success')
      fetchData(pagination.value.current_page)
    } catch (error) {
      console.error('Error deleting data:', error)
      Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus data.', 'error')
    } finally {
      loading.value = false
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}



const unescapeHtml = (htmlStr) => {
  if (!htmlStr) return '-'
  
  let result = htmlStr
  const span = document.createElement('span')
  
  for (let i = 0; i < 3; i++) {
    if (!result.includes('&')) break
    
    const next = result.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
      span.innerHTML = match
      return span.textContent || span.innerText || match
    })
    
    if (next === result) break
    result = next
  }
  
  return result
}

const getJenisClass = (jenis) => {
    switch (jenis) {
        case 'medis': return 'bg-indigo'
        case 'penunjang': return 'bg-warning text-dark'
        case 'umum': return 'bg-secondary'
        default: return 'bg-dark'
    }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Inherited from Eksternal View style */
.spo-view-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 0.5rem 1rem;
  color: #1e293b;
}

.spo-container {
  max-width: 100%;
  margin: 0 auto;
}

.bg-indigo {
    background-color: #4f46e5;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -1.5rem;
  z-index: 10;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3);
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.hero-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  margin: 0.25rem 0 0 0;
  opacity: 0.95;
  font-size: 0.9rem;
  max-width: 400px;
  line-height: 1.4;
}

/* Action Bar */
.action-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  padding: 1.25rem 1.5rem;
  border-radius: 20px;
  border: 1px solid white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin: 0 1rem 1.5rem 1rem;
  position: relative;
  z-index: 20;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  flex: 1 1 auto;
}

.search-box {
  position: relative;
  flex: 1 1 250px;
  min-width: 200px;
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
  box-sizing: border-box;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.date-filter {
  display: flex;
  align-items: center;
  position: relative;
}

.filter-input {
  box-sizing: border-box;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
}

.small-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: #64748b;
}

.btn-clear {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    font-size: 0.85rem;
}

.btn-filter {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  color: #475569;
  transition: all 0.2s;
  white-space: nowrap;
}

/* Table */
.content-area {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 2px solid #f1f5f9;
}

.modern-table td {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Pagination */
.pagination-footer {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  background: white;
}

.btn-page {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f1f5f9;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
}

.page-info {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

/* Detail Drawer */
.drawer-overlay {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
}

.drawer-container {
  width: 100%;
  max-width: 650px;
  background: #f8fafc;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close-drawer {
  background: #f1f5f9;
  border: none;
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #64748b;
}

.drawer-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.card-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.info-item label {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-value {
  font-size: 0.875rem;
  color: #1e293b;
}

.detail-block h6 {
    color: #475569;
}
.html-content {
    font-size: 0.9rem;
    color: #334155;
    line-height: 1.5;
}

/* Mobile */
@media (max-width: 1024px) {
  .spo-view-wrapper {
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
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
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
    backdrop-filter: none;
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
  .small-label { display: none; }
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

  .btn-clear {
      right: 5px;
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
    margin: 0 !important;
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
    margin: 0 !important;
  }
  
  .action-buttons {
    width: 100%;
    order: -1;
    margin-bottom: 0.15rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 0.65rem !important;
    border-radius: 10px !important;
    font-size: 0.9rem !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    font-weight: 700 !important;
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
    padding: 1.25rem 0 3rem 0 !important;
    background: transparent !important;
    justify-content: center !important;
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
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0 !important;
  }

  .meta-item i {
    width: 16px;
    color: #3b82f6;
  }
}

.mobile-view { display: none; }

.loading-state-unified {
  padding: 5rem 2rem;
  text-align: center;
  color: #3b82f6;
}

.spinner-container i {
  font-size: 2.5rem;
  color: #3b82f6;
  margin-bottom: 1.5rem;
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
</style>
