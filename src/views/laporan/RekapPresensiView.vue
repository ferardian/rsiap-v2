<template>
  <div class="rekap-presensi-wrapper p-3 px-lg-4">
    <div class="page-header mb-4">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 class="page-title mb-1">📅 Rekap Presensi Pegawai</h1>
          <p class="page-subtitle text-muted mb-0">Laporan kehadiran, keterlambatan, dan durasi kerja pegawai</p>
        </div>
        <div class="header-actions d-flex flex-wrap gap-2">
          <button 
            class="btn btn-light rounded-pill p-2 px-3 shadow-sm border d-md-none"
            @click="isFilterVisible = !isFilterVisible"
            :title="isFilterVisible ? 'Tutup Filter' : 'Filter'"
          >
            <i class="fas" :class="isFilterVisible ? 'fa-filter-circle-xmark' : 'fa-filter'"></i>
          </button>
          <button @click="downloadReport" class="btn btn-outline-primary rounded-pill px-4 shadow-sm" :disabled="loading">
            <i class="fas fa-file-excel me-2"></i>Export
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <transition name="slide-fade">
      <div v-if="isFilterVisible" class="card glass-card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
        <form @submit.prevent="fetchData" class="row g-3">
          <div class="col-md-3">
            <label class="small-label mb-2 text-primary">TANGGAL AWAL</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden border">
              <span class="input-group-text bg-white border-0"><i class="fas fa-calendar-alt text-muted"></i></span>
              <input v-model="filters.tgl_awal" type="date" class="form-control border-0 px-2 shadow-none">
            </div>
          </div>
          <div class="col-md-3">
            <label class="small-label mb-2 text-primary">TANGGAL AKHIR</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden border">
              <span class="input-group-text bg-white border-0"><i class="fas fa-calendar-alt text-muted"></i></span>
              <input v-model="filters.tgl_akhir" type="date" class="form-control border-0 px-2 shadow-none">
            </div>
          </div>
          <div class="col-md-3">
            <label class="small-label mb-2 text-primary">STATUS PRESENSI</label>
            <select v-model="filters.status" class="form-select form-select-sm border rounded-3 px-3 shadow-none">
              <option value="">Semua Status</option>
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="small-label mb-2 text-primary">CARI PEGAWAI</label>
            <div class="input-group input-group-sm rounded-3 overflow-hidden border">
              <span class="input-group-text bg-white border-0"><i class="fas fa-search text-muted"></i></span>
              <input v-model="filters.search" type="text" class="form-control border-0 px-2 shadow-none" placeholder="Nama / NIK...">
            </div>
          </div>
          <div class="col-12 d-flex justify-content-end mt-3">
            <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="loading">
              <i class="fas fa-filter me-2"></i> {{ loading ? 'Memproses...' : 'Terapkan Filter' }}
            </button>
            <button type="button" @click="resetFilters" class="btn btn-light rounded-pill px-4 ms-2">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
    </transition>

    <!-- Display Mode Switcher & Summary -->
    <div class="d-flex justify-content-center mb-4">
      <div class="bg-white rounded-pill p-1 shadow-sm border d-flex gap-1">
        <button 
          class="btn btn-sm px-4 py-2 rounded-pill transition-all" 
          :class="displayMode === 'detail' ? 'btn-primary shadow' : 'btn-light border-0'"
          @click="displayMode = 'detail'"
        >
          <i class="fas fa-list me-2"></i><span class="text-nowrap">Detail Data</span>
        </button>
        <button 
          class="btn btn-sm px-4 py-2 rounded-pill transition-all" 
          :class="displayMode === 'summary' ? 'btn-primary shadow' : 'btn-light border-0'"
          @click="displayMode = 'summary'"
        >
          <i class="fas fa-chart-pie me-2"></i><span class="text-nowrap">Ringkasan</span>
        </button>
      </div>
    </div>

    <!-- Data Table (Summary Mode) -->
    <div v-if="displayMode === 'summary'" class="card glass-card border-0 shadow-sm overflow-hidden">
      <div class="card-header border-0 p-4 d-flex justify-content-between align-items-center text-white" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
        <h6 class="fw-bold mb-0"><i class="fas fa-th-list me-2 text-white-50"></i>Rekapitulasi Per Pegawai</h6>
        <div class="small text-white-50 fw-bold">TOTAL: {{ summaryItems.length }} PEGAWAI</div>
      </div>
      <div class="card-body p-0 p-lg-4">
        <div class="table-responsive border-top border-lg rounded-lg-3">
          <table class="table table-hover align-middle mb-0 text-center" style="min-width: 1000px;">
            <thead class="bg-light-soft small-label text-dark">
              <tr>
                <th class="ps-4 py-3 text-start">PEGAWAI</th>
                <th class="py-3 bg-secondary-soft">JADWAL</th>
                <th class="py-3">HADIR</th>
                <th class="py-3 bg-primary-soft">PAGI</th>
                <th class="py-3 bg-primary-soft">SIANG</th>
                <th class="py-3 bg-primary-soft">MALAM</th>
                <th class="py-3 bg-success-soft">TEPAT</th>
                <th class="py-3 bg-danger-soft">LAMBAT</th>
                <th class="py-3 bg-warning-soft">PSW</th>
                <th class="py-3 bg-danger text-white">ABSEN</th>
                <th class="py-3 text-center pe-4">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && summaryItems.length === 0">
                <td colspan="11" class="text-center py-5">
                  <div class="spinner-border text-primary"></div>
                </td>
              </tr>
              <tr v-else-if="summaryItems.length === 0">
                <td colspan="11" class="text-center py-5 text-muted">Tidak ada data ringkasan</td>
              </tr>
              <tr v-for="s in summaryItems" :key="s.nik">
                <td class="ps-4 text-start">
                  <div class="fw-bold text-dark">{{ s.nama }}</div>
                  <div class="smallest text-muted">{{ s.nik }} • {{ s.jbtn }}</div>
                </td>
                <td class="fw-bold text-secondary">{{ s.total_jadwal || 0 }}</td>
                <td class="fw-bold">{{ s.total_hadir }}</td>
                <td class="text-primary">{{ s.pagi }}</td>
                <td class="text-primary">{{ s.siang }}</td>
                <td class="text-primary">{{ s.malam }}</td>
                <td class="text-success fw-bold">{{ s.tepat_waktu }}</td>
                <td class="text-danger fw-bold">{{ s.terlambat }}</td>
                <td class="text-warning fw-bold">{{ s.psw }}</td>
                <td>
                  <span :class="s.tidak_presensi > 0 ? 'text-danger fw-800' : 'text-muted'" style="font-size: 1.1rem;">
                    {{ s.tidak_presensi }}
                  </span>
                </td>
                <td class="pe-4 text-center">
                  <button class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" @click="viewEmployeeDetail(s)">
                    <i class="fas fa-search me-1"></i>Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Data Table (Detail Mode) -->
    <div v-if="displayMode === 'detail'" class="card glass-card border-0 shadow-sm overflow-hidden">
      <div class="card-header border-0 p-4 d-flex justify-content-between align-items-center text-white" style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%);">
        <h6 class="fw-bold mb-0 text-white"><i class="fas fa-history me-2 text-white-50"></i>Log Aktivitas Presensi</h6>
        <div class="small text-white-50 fw-bold">TOTAL: {{ pagination.total }} RECORDS</div>
      </div>
      
      <!-- Info Bar for Focused Employee -->
      <div v-if="focusedEmployee" class="bg-primary-soft p-3 px-4 border-bottom d-flex align-items-center justify-content-between animate__animated animate__fadeIn">
        <div class="d-flex align-items-center overflow-hidden">
          <div class="avatar-sm flex-shrink-0 bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm">
            <i class="fas fa-user"></i>
          </div>
          <div class="text-truncate">
            <div class="smallest text-primary fw-bold text-uppercase ls-1">Menampilkan Detail Untuk:</div>
            <div class="fw-bold text-dark text-truncate">{{ focusedEmployee.nama }}</div>
            <div class="text-muted small font-monospace">({{ focusedEmployee.nik }})</div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-primary rounded-pill px-3 ms-2 flex-shrink-0" @click="clearFocusedEmployee">
          <i class="fas fa-times me-1"></i> <span class="d-none d-sm-inline">Lihat Semua</span>
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light-soft small-label text-dark">
            <tr>
              <th class="ps-4 py-3">PEGAWAI</th>
              <th class="py-3">SHIFT</th>
              <th class="py-3">DATANG</th>
              <th class="py-3">PULANG</th>
              <th class="py-3">STATUS</th>
              <th class="py-3">LAMBAT</th>
              <th class="py-3">DURASI</th>
              <th class="py-3 text-center pe-4">PHOTO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && items.length === 0">
              <td colspan="8" class="text-center py-5">
                <div class="spinner-border text-primary mb-2"></div>
                <p class="text-muted small mb-0">Memuat data rekap presensi...</p>
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="8" class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-light-soft mb-3"></i>
                <h6 class="text-muted fw-bold">Tidak ada data ditemukan</h6>
                <p class="text-muted small">Coba sesuaikan filter pencarian Anda</p>
              </td>
            </tr>
            <tr v-for="(item, index) in items" :key="index" class="cursor-pointer" @click="showDetail(item)">
              <td class="ps-4">
                <div class="d-flex align-items-center">
                  <div class="avatar-sm bg-primary-soft text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold">
                    {{ item.pegawai?.nama?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="fw-bold text-dark">{{ item.pegawai?.nama || 'Unknown' }}</div>
                    <div class="small-label-txt text-muted">{{ item.pegawai?.nik || '-' }} • {{ item.pegawai?.jbtn || '-' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark fw-normal border">{{ item.shift }}</span>
              </td>
              <td>
                <div class="small fw-bold">{{ formatDateTime(item.jam_datang).time }}</div>
                <div class="smallest text-muted">{{ formatDateTime(item.jam_datang).date }}</div>
              </td>
              <td>
                <div v-if="item.jam_pulang">
                  <div class="small fw-bold">{{ formatDateTime(item.jam_pulang).time }}</div>
                  <div class="smallest text-muted">{{ formatDateTime(item.jam_pulang).date }}</div>
                </div>
                <span v-else class="badge bg-warning-soft text-warning fw-normal">Belum Absen</span>
              </td>
              <td>
                <span class="badge rounded-pill px-3" :class="getStatusBadge(item.status)">
                  {{ item.status }}
                </span>
              </td>
              <td class="text-danger small fw-bold">
                {{ item.keterlambatan !== '00:00:00' ? item.keterlambatan : '-' }}
              </td>
              <td class="small fw-bold">{{ item.durasi || '-' }}</td>
              <td class="text-center pe-4">
                <img :src="getPhotoUrl(item.photo)" class="rounded-3 shadow-xs border" style="width: 40px; height: 40px; object-fit: cover;" @error="handleImageError">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="card-footer bg-white border-0 p-4 d-flex justify-content-between align-items-center">
        <div class="small text-muted">
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} records
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0 custom-pagination">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page - 1)">Previous</a>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: pagination.current_page === page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.current_page + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Photo & Detail Lightbox -->
    <div v-if="selectedItem" class="detail-overlay d-flex align-items-center justify-content-center p-4" @click.self="selectedItem = null">
       <div class="card detail-card glass-card border-0 shadow-lg overflow-hidden animate__animated animate__zoomIn">
         <div class="position-relative">
           <img :src="getPhotoUrl(selectedItem.photo)" class="w-100" style="max-height: 400px; object-fit: contain; background: #000;">
           <button class="btn btn-close btn-close-white position-absolute top-0 end-0 m-3 shadow-none" @click="selectedItem = null"></button>
         </div>
         <div class="p-4 bg-white border-top">
           <h5 class="fw-bold mb-1">{{ selectedItem.pegawai?.nama }}</h5>
           <p class="text-muted small mb-3">{{ selectedItem.pegawai?.nik }} • {{ selectedItem.pegawai?.jbtn }}</p>
           
           <div class="row g-3">
             <div class="col-6">
                <div class="p-3 bg-light rounded-3">
                  <div class="smallest text-primary fw-bold mb-1">JAM DATANG</div>
                  <div class="small fw-bold">{{ formatDateTime(selectedItem.jam_datang).full }}</div>
                </div>
             </div>
             <div class="col-6">
                <div class="p-3 bg-light rounded-3">
                  <div class="smallest text-primary fw-bold mb-1">JAM PULANG</div>
                  <div class="small fw-bold">{{ selectedItem.jam_pulang ? formatDateTime(selectedItem.jam_pulang).full : 'Belum Absen' }}</div>
                </div>
             </div>
             <div class="col-12">
                <div class="p-3 bg-light rounded-3">
                  <div class="smallest text-primary fw-bold mb-1">KETERANGAN</div>
                  <div class="small">{{ selectedItem.keterangan || '-' }}</div>
                </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import rekapPresensiService from '../../services/rekapPresensiService'

const loading = ref(false)
const items = ref([])
const summaryItems = ref([])
const displayMode = ref('detail') // detail | summary
const selectedItem = ref(null)
const focusedEmployee = ref(null)
const isFilterVisible = ref(window.innerWidth >= 768)

// Native date helpers
const today = new Date()
const formatDateIso = (date) => {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

const filters = reactive({
  tgl_awal: formatDateIso(new Date(today.getFullYear(), today.getMonth(), 1)),
  tgl_akhir: formatDateIso(today),
  status: '',
  shift: '',
  search: '',
  page: 1,
  limit: 50
})

const pagination = reactive({
  total: 0,
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0
})

const statusOptions = [
  'Tepat Waktu',
  'Terlambat Toleransi',
  'Terlambat I',
  'Terlambat II',
  'Tepat Waktu & PSW',
  'Terlambat Toleransi & PSW',
  'Terlambat I & PSW',
  'Terlambat II & PSW'
]

const fetchData = async () => {
  loading.value = true
  try {
    if (displayMode.value === 'summary') {
      await fetchSummary()
    } else {
      await fetchDetail()
    }
  } catch (error) {
    console.error('Error in fetchData:', error)
  } finally {
    loading.value = false
  }
}

const fetchDetail = async () => {
  try {
    const finalFilters = { ...filters }
    if (focusedEmployee.value) {
      finalFilters.search = focusedEmployee.value.nik
    }
    
    const res = await rekapPresensiService.getRekapPresensi(finalFilters)
    items.value = res.data.data
    const meta = res.data.meta
    pagination.total = meta.total
    pagination.current_page = meta.current_page
    pagination.last_page = meta.last_page
    pagination.from = meta.from
    pagination.to = meta.to
  } catch (error) {
    throw error
  }
}

const fetchSummary = async () => {
  try {
    const res = await rekapPresensiService.getSummary(filters)
    summaryItems.value = res.data.response
  } catch (error) {
    throw error
  }
}

const resetFilters = () => {
  filters.tgl_awal = formatDateIso(new Date(today.getFullYear(), today.getMonth(), 1))
  filters.tgl_akhir = formatDateIso(today)
  filters.status = ''
  filters.search = ''
  filters.page = 1
  focusedEmployee.value = null
  fetchData()
}

const clearFocusedEmployee = () => {
  focusedEmployee.value = null
  fetchData()
}

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  filters.page = page
  fetchData()
}

const formatDateTime = (dt) => {
  if (!dt) return { full: '-', date: '-', time: '-' }
  const date = new Date(dt)
  
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  const h = date.getHours().toString().padStart(2, '0')
  const i = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  
  return {
    full: `${d}/${m}/${y} ${h}:${i}:${s}`,
    date: `${d} ${monthNames[date.getMonth()]} ${y}`,
    time: `${h}:${i}:${s}`
  }
}

const getStatusBadge = (status) => {
  if (status.includes('Tepat Waktu')) return 'bg-success-soft text-success border-success-soft'
  if (status.includes('Terlambat II')) return 'bg-danger-soft text-danger border-danger-soft'
  if (status.includes('Terlambat')) return 'bg-warning-soft text-warning border-warning-soft'
  return 'bg-light text-dark'
}

const getPhotoUrl = (photo) => {
  if (!photo) return 'https://via.placeholder.com/150?text=No+Photo'
  // Assuming the photo is a relative path or direct URL
  // If it's stored on a specific storage, adjust accordingly
  return `https://idrg-test.my.id/sipas-api/storage/presensi/${photo}`
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/150?text=No+Photo'
}

const showDetail = (item) => {
  selectedItem.value = item
}

const viewEmployeeDetail = (employee) => {
  focusedEmployee.value = employee
  filters.search = '' // Clear visible search box
  displayMode.value = 'detail'
  fetchData()
}

const downloadReport = () => {
  // Implementation for excel export if needed
  alert('Fitur Export Excel akan segera hadir!')
}

watch(displayMode, () => {
  fetchData()
})

const visiblePages = computed(() => {
  const range = []
  const current = pagination.current_page
  const last = pagination.last_page
  const delta = 2

  for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
    range.push(i)
  }
  return range
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 0.875rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.small-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.small-label-txt {
  font-size: 11px;
}

.smallest {
  font-size: 10px;
}

.bg-light-soft {
  background-color: #f8fafc;
}

.bg-primary-soft { background-color: #eff6ff; }
.bg-secondary-soft { background-color: #f1f5f9; }
.bg-success-soft { background-color: #f0fdf4; }
.bg-warning-soft { background-color: #fffbeb; }
.bg-danger-soft { background-color: #fef2f2; }

.text-primary { color: #2563eb !important; }
.text-success { color: #16a34a !important; }
.text-warning { color: #d97706 !important; }
.text-danger { color: #dc2626 !important; }

.border-success-soft { border: 1px solid #bbf7d0; }
.border-warning-soft { border: 1px solid #fef3c7; }
.border-danger-soft { border: 1px solid #fecaca; }

.avatar-sm {
  width: 36px;
  height: 36px;
  font-size: 14px;
}

.cursor-pointer {
  cursor: pointer;
}

.shadow-xs {
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.custom-pagination .page-link {
  border-radius: 8px;
  margin: 0 2px;
  border: none;
  color: #64748b;
  background: #f1f5f9;
}

.custom-pagination .page-item.active .page-link {
  background: #2563eb;
  color: white;
}

.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1050;
}

.detail-card {
  width: 100%;
  max-width: 500px;
}

.animate__animated {
  animation-duration: 0.3s;
}

.font-monospace {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@media (max-width: 767px) {
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
