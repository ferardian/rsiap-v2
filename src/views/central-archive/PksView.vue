<template>
  <div class="pks-view-wrapper">
    <div class="pks-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-file-signature"></i>
          </div>
          <div>
            <h1 class="hero-title">
              Perjanjian Kerja Sama 
              <span v-if="pagination.total > 0" class="desktop-total-count">{{ pagination.total }} Dokumen</span>
            </h1>
            <div class="d-flex align-items-center gap-3 desktop-stats">
              <p class="hero-subtitle mb-0">Daftar Dokumen PKS RSIA Aisyiyah Pekajangan</p>
              <span v-if="pagination.total > 0" class="badge-count">
                <i class="fas fa-file-alt mr-1"></i> {{ pagination.total }} Dokumen
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Action Bar -->
      <div class="action-bar d-flex flex-column gap-3">
        <!-- Row 1: Search & Date -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="search-box flex-grow-1">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari PKS (Judul/Nomor)..."
              @keyup.enter="handleSearch"
            >
          </div>
          
          <div class="date-filter d-flex align-items-center">
            <label class="small-label mr-2 mb-0">TGL AWAL:</label>
            <input type="date" v-model="filters.tanggal_awal" class="filter-input" @change="handleSearch">
          </div>
        </div>

        <!-- Row 2: Category, Status, Action Buttons -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="filter-group-alt d-flex align-items-center gap-3">
            <div class="filter-item-horizontal d-flex align-items-center">
              <label class="small-label mr-2 mb-0">KATEGORI:</label>
              <select v-model="filters.kategori" class="filter-input status-select" @change="handleSearch">
                <option value="">Semua</option>
                <option value="A">Internal (A)</option>
                <option value="B">Eksternal (B)</option>
              </select>
            </div>

            <div class="filter-item-horizontal d-flex align-items-center">
              <label class="small-label mr-2 mb-0">STATUS:</label>
              <select v-model="filters.status" class="filter-input status-select" @change="handleSearch">
                <option value="">Semua Status</option>
                <option value="pengajuan">Pengajuan</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
                <option value="1">Aktif (1)</option>
                <option value="0">Non-Aktif (0)</option>
              </select>
            </div>

            <button class="btn-filter" @click="handleSearch" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Segarkan
            </button>
          </div>

          <div class="action-buttons">
            <button @click="$router.push('/central-archive/pks/create')" class="btn btn-primary d-flex align-items-center gap-2 rounded-lg px-4 fw-bold shadow-sm py-2">
              <i class="fas fa-plus-circle"></i> Tambah PKS
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Unified Loading State -->
        <div v-if="loading" class="loading-state-unified">
          <div class="spinner-container">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Memuat Data PKS...</p>
        </div>

        <!-- Unified Empty State -->
        <div v-else-if="responseList.length === 0" class="empty-state-unified">
          <div class="empty-icon-container">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3>Data Kosong</h3>
          <p>Tidak ada Perjanjian Kerja Sama (PKS) yang cocok dengan filter pencarian.</p>
          <button class="btn-refresh-empty" @click="resetFilters">
            <i class="fas fa-undo"></i> Reset Filter
          </button>
        </div>
        
        <!-- Desktop Table View -->
        <div v-else class="table-responsive desktop-view">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="180">No. Internal</th>
                <th>Judul PKS</th>
                <th width="200">Penanggung Jawab</th>
                <th width="150">Masa Berlaku</th>
                <th width="100">Status</th>
                <th width="100" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in responseList" :key="item.id" @click="viewDetail(item)">
                <td>
                    <div class="fw-bold">{{ item.no_pks_internal || '-' }}</div>
                    <div class="small text-muted">{{ item.no_pks_eksternal || '-' }}</div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <button 
                      v-if="item.berkas" 
                      class="btn-file-icon" 
                      title="Lihat Berkas" 
                      @click.stop="handleOpenFile(item.berkas)"
                    >
                      <i class="far fa-file-pdf text-danger"></i>
                    </button>
                    <span v-else class="btn-file-icon disabled" title="Berkas Kosong">
                      <i class="fas fa-file-excel text-muted"></i>
                    </span>
                    <div class="fw-bold">{{ item.judul }}</div>
                  </div>
                </td>
                <td>
                   <div class="small fw-bold text-primary">{{ item.penanggung_jawab?.nama || item.pj || '-' }}</div>
                </td>
                <td>
                    <div class="small">{{ formatDate(item.tanggal_awal) }}</div>
                    <div class="small text-muted text-center py-0">s.d</div>
                    <div class="small">{{ item.tanggal_akhir && item.tanggal_akhir !== '0000-00-00' ? formatDate(item.tanggal_akhir) : '-' }}</div>
                </td>
                <td>
                  <span class="badge" :class="getStatusClass(item)">
                    {{ getStatusLabel(item) }}
                  </span>
                </td>
                <td class="text-center" @click.stop>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn-icon view-btn" title="Detail" @click="viewDetail(item)">
                            <i class="fas fa-eye text-primary"></i>
                        </button>
                        <button class="btn-icon edit-btn" title="Ubah" @click.stop="handleEdit(item.id)">
                            <i class="fas fa-edit text-warning"></i>
                        </button>
                        <button v-if="item.berkas" class="btn-icon download-btn" title="Buka Dokumen" @click.stop="handleOpenFile(item.berkas)">
                            <i class="fas fa-external-link-alt text-info"></i>
                        </button>
                        <button class="btn-icon delete-btn" title="Hapus" @click.stop="handleDelete(item.id)">
                            <i class="fas fa-trash-alt text-danger"></i>
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
              <span class="badge bg-light text-dark fw-bold border">{{ item.no_pks_internal || '-' }}</span>
              <span class="badge" :class="getStatusClass(item)">{{ getStatusLabel(item) }}</span>
            </div>
            <div class="mobile-card-body">
              <h3 class="mobile-card-perihal">{{ item.judul }}</h3>
              <div class="mobile-card-meta">
                <div class="meta-item">
                  <i class="fas fa-user-tie"></i>
                  {{ item.penanggung_jawab?.nama || item.pj || '-' }}
                </div>
                <div class="meta-item">
                  <i class="far fa-calendar-alt"></i>
                  {{ formatDate(item.tanggal_awal) }} s.d {{ item.tanggal_akhir && item.tanggal_akhir !== '0000-00-00' ? formatDate(item.tanggal_akhir) : '-' }}
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
            <span class="drawer-subtitle">Detail PKS</span>
            <h2 class="drawer-title">{{ selectedItem?.no_pks_internal || '-' }}</h2>
          </div>
          <button class="btn-close-drawer" @click="closeDetail">&times;</button>
        </div>
        
        <div class="drawer-body">
          <div class="card-section">
            <div class="pks-detail-header text-center mb-4">
                <i class="fas fa-file-contract fa-3x text-primary mb-3"></i>
                <h3 class="font-weight-bold text-primary">{{ selectedItem?.judul }}</h3>
                <span class="badge px-3 py-2 mt-2" :class="getStatusClass(selectedItem)">
                    {{ getStatusLabel(selectedItem) }}
                </span>
            </div>
            
            <div class="info-grid mt-4">
              <div class="info-item">
                <label>No. PKS Internal</label>
                <div class="info-value font-monospace fw-bold">{{ selectedItem?.no_pks_internal || '-' }}</div>
              </div>
              <div class="info-item">
                <label>No. PKS Eksternal</label>
                <div class="info-value font-monospace">{{ selectedItem?.no_pks_eksternal || '-' }}</div>
              </div>
            </div>

            <div class="info-grid mt-3">
              <div class="info-item">
                <label>Penanggung Jawab</label>
                <div class="info-value fw-bold text-indigo">
                    {{ selectedItem?.penanggung_jawab?.nama || selectedItem?.pj || '-' }}
                </div>
              </div>
              <div class="info-item">
                <label>Tanggal Terbit</label>
                <div class="info-value">{{ formatDate(selectedItem?.tgl_terbit) }}</div>
              </div>
            </div>

            <div class="info-grid mt-3">
              <div class="info-item">
                <label>Tanggal Awal</label>
                <div class="info-value fw-bold">{{ formatDate(selectedItem?.tanggal_awal) }}</div>
              </div>
              <div class="info-item">
                <label>Tanggal Akhir</label>
                <div class="info-value fw-bold text-danger">
                    {{ selectedItem?.tanggal_akhir && selectedItem?.tanggal_akhir !== '0000-00-00' ? formatDate(selectedItem?.tanggal_akhir) : '-' }}
                </div>
              </div>
            </div>

            <div v-if="selectedItem?.berkas" class="mt-4 pt-4 border-top">
                <button class="btn btn-outline-primary w-100 py-3 fw-bold rounded-xl shadow-sm d-flex align-items-center justify-content-center gap-2" @click="handleOpenFile(selectedItem.berkas)">
                    <i class="fas fa-file-pdf"></i> Lihat Dokumen PKS
                </button>
            </div>
            <div v-else class="mt-4 pt-4 border-top text-center text-muted small italic">
                <i class="fas fa-info-circle mr-1"></i> Data soft-copy berkas tidak tersedia.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import pksService from '@/services/pksService'
import api from '@/services/api'
import Swal from 'sweetalert2'

const router = useRouter()

// State
const loading = ref(false)
const responseList = ref([])
const searchQuery = ref('')
const filters = ref({
  tanggal_awal: '',
  kategori: '',
  status: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

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
      sort: [{ field: 'tanggal_awal', direction: 'desc' }],
      filters: [],
      // Always include Penanggung Jawab
      include: ['penanggungJawab']
    }

    if (searchQuery.value) {
      payload.search = { value: searchQuery.value }
    }

    if (filters.value.status !== '') {
      payload.filters.push({ field: 'status', operator: '=', value: filters.value.status })
    }

    if (filters.value.kategori) {
      // Logic from filetrack: filter based on pattern in no_pks_internal
      payload.filters.push({ field: 'no_pks_internal', operator: 'like', value: `%/${filters.value.kategori}/%` })
    }

    if (filters.value.tanggal_awal) {
      payload.filters.push({ field: 'tanggal_awal', operator: '>=', value: filters.value.tanggal_awal })
    }

    const response = await pksService.searchPks(payload)
    const resData = response.data
    
    responseList.value = resData.data || []
    
    const meta = resData.meta || resData.pagination || resData
    pagination.value = {
      current_page: meta.current_page || 1,
      last_page: meta.last_page || Math.ceil((meta.total || 0) / (meta.per_page || 10)) || 1,
      total: meta.total || 0
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    Swal.fire('Error', 'Gagal memuat data PKS dari server.', 'error')
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
   filters.value.tanggal_awal = ''
   filters.value.status = ''
   filters.value.kategori = ''
   handleSearch()
}

const changePage = (page) => {
  pagination.value.current_page = page
  fetchData(page)
}

const viewDetail = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
}

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00') return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const handleOpenFile = (berkas) => {
    const url = `https://sim.rsiaaisyiyah.com/webapps/rsia_pks/${berkas}`
    window.open(url, '_blank')
}

const handleEdit = (id) => {
    router.push(`/central-archive/pks/edit/${id}`)
}

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data PKS yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
        try {
            await pksService.deletePks(id)
            Swal.fire(
                'Terhapus!',
                'Data PKS telah berhasil dihapus.',
                'success'
            )
            fetchData(pagination.value.current_page)
        } catch (error) {
            console.error('Error deleting data:', error)
            Swal.fire('Error', 'Gagal menghapus data PKS.', 'error')
        }
    }
}

const getStatusLabel = (item) => {
    if (!item) return '-'
    const today = new Date()
    const end = (item.tanggal_akhir && item.tanggal_akhir !== '0000-00-00') ? new Date(item.tanggal_akhir) : null
    
    if (end && end < today) return 'KADALUARSA'
    
    // Check string statuses from filetrack context
    if (typeof item.status === 'string') {
        return item.status.toUpperCase()
    }
    
    return item.status == 1 ? 'AKTIF' : 'NON-AKTIF'
}

const getStatusClass = (item) => {
    if (!item) return 'bg-dark'
    const today = new Date()
    const end = (item.tanggal_akhir && item.tanggal_akhir !== '0000-00-00') ? new Date(item.tanggal_akhir) : null
    
    if (end && end < today) return 'bg-danger'
    
    if (typeof item.status === 'string') {
        const s = item.status.toLowerCase()
        if (s === 'pengajuan') return 'bg-warning text-dark'
        if (s === 'disetujui') return 'bg-teal'
        if (s === 'ditolak') return 'bg-danger'
        return 'bg-secondary'
    }
    
    return item.status == 1 ? 'bg-success' : 'bg-secondary'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* adopted from SpoView style */
.pks-view-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 0.5rem 1rem;
  color: #1e293b;
}

.pks-container {
  max-width: 100%;
  margin: 0 auto;
}

.bg-teal {
    background-color: #14b8a6;
    color: white;
}

.desktop-total-count {
  font-weight: 800;
  opacity: 0.95;
  margin-left: 0.5rem;
}

.mobile-stats-badge {
  display: none;
}

.text-indigo {
    color: #4f46e5;
}

.badge-count {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    padding: 0.35rem 0.85rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
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
  box-shadow: 0 20px 25px -5px rgba(14, 165, 233, 0.3);
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
  align-items: stretch;
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
  flex: 1 1 500px;
  min-width: 300px;
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
    white-space: nowrap;
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
  height: 38px;
}

.filter-row {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.filter-row .filter-item {
  flex: 1;
  min-width: 0;
}

.filter-item-horizontal {
  display: flex;
  align-items: center;
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

.modern-table tr:hover td {
    background-color: #f8fafc;
}

.btn-file-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #fff1f2;
    border: 1px solid #fecaca;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-file-icon.disabled {
    background: #f1f5f9;
    border-color: #e2e8f0;
    cursor: not-allowed;
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

.drawer-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.drawer-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.btn-close-drawer {
  background: #f1f5f9;
  border: none;
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
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
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.875rem;
  color: #1e293b;
}

/* Animations */
.animate-slide-left {
  animation: slideLeft 0.3s ease-out;
}

@keyframes slideLeft {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.loading-state-unified, .empty-state-unified {
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.spinner-container i {
  font-size: 2.5rem;
  color: #0ea5e9;
  margin-bottom: 1.5rem;
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .pks-view-wrapper {
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
  .desktop-stats { display: none !important; }
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
    padding: 1rem 0.75rem; 
    flex-direction: column; 
    align-items: stretch;
    gap: 1rem;
    background: white;
    border-radius: 12px;
    z-index: 25;
    box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(226, 232, 240, 0.5);
    backdrop-filter: none;
  }
  
  .filter-group-alt { 
    flex-direction: column; 
    width: 100%; 
    gap: 0.85rem; 
  }

  .filter-row {
     display: flex;
     flex-direction: row;
     gap: 0.75rem;
     width: 100%;
  }

  .filter-item-horizontal {
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
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
    color: #0ea5e9;
  }
}

.mobile-view { display: none; }
</style>
