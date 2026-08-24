<template>
  <div class="kepatuhan-akses-wrapper p-3 px-lg-4">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 class="page-title mb-1">🛡️ Laporan Pemantauan Kepatuhan Hak Akses</h1>
          <p class="page-subtitle text-muted mb-0">Audit kepatuhan jam log-in aplikasi terhadap presensi dan jadwal dinas pegawai</p>
        </div>
        <div class="header-actions d-flex flex-wrap gap-2">
          <button 
            class="btn btn-light rounded-pill p-2 px-3 shadow-sm border d-md-none"
            @click="isFilterVisible = !isFilterVisible"
            :title="isFilterVisible ? 'Tutup Filter' : 'Filter'"
          >
            <i class="fas" :class="isFilterVisible ? 'fa-filter-circle-xmark' : 'fa-filter'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card glass-card border-0 shadow-sm h-100 p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small-label text-muted">TOTAL AKSES</span>
            <div class="stat-icon bg-primary-soft text-primary"><i class="fas fa-fingerprint"></i></div>
          </div>
          <h3 class="fw-extrabold mb-0 text-dark">{{ summaryStats.total_akses || 0 }}</h3>
          <span class="smallest text-muted">Log Akses Terkumpul</span>
        </div>
      </div>
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card glass-card border-0 shadow-sm h-100 p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small-label text-success">RATE KEPATUHAN</span>
            <div class="stat-icon bg-success-soft text-success"><i class="fas fa-shield-check"></i></div>
          </div>
          <h3 class="fw-extrabold mb-0 text-success">{{ summaryStats.rate_kepatuhan || 100 }}%</h3>
          <span class="smallest text-muted">Sesuai Jam Dinas</span>
        </div>
      </div>
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card glass-card border-0 shadow-sm h-100 p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small-label text-danger">TOTAL ANOMALI</span>
            <div class="stat-icon bg-danger-soft text-danger"><i class="fas fa-exclamation-triangle"></i></div>
          </div>
          <h3 class="fw-extrabold mb-0 text-danger">{{ summaryStats.total_anomali || 0 }}</h3>
          <span class="smallest text-muted">Akses di luar dinas</span>
        </div>
      </div>
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card glass-card border-0 shadow-sm h-100 p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small-label text-warning">HARI LIBUR / OFF</span>
            <div class="stat-icon bg-warning-soft text-warning"><i class="fas fa-calendar-times"></i></div>
          </div>
          <h3 class="fw-extrabold mb-0 text-warning">{{ summaryStats.total_libur_off || 0 }}</h3>
          <span class="smallest text-muted">Log-in saat OFF / Cuti</span>
        </div>
      </div>
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card glass-card border-0 shadow-sm h-100 p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small-label text-danger">TANPA PRESENSI</span>
            <div class="stat-icon bg-danger-soft text-danger"><i class="fas fa-user-slash"></i></div>
          </div>
          <h3 class="fw-extrabold mb-0 text-danger">{{ summaryStats.total_tanpa_presensi || 0 }}</h3>
          <span class="smallest text-muted">TIDAK absen di RS</span>
        </div>
      </div>
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card glass-card border-0 shadow-sm h-100 p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small-label text-info">LUAR JAM KERJA</span>
            <div class="stat-icon bg-info-soft text-info"><i class="fas fa-clock"></i></div>
          </div>
          <h3 class="fw-extrabold mb-0 text-info">{{ summaryStats.total_luar_jam_kerja || 0 }}</h3>
          <span class="smallest text-muted">Sebelum/Sesudah presensi</span>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <transition name="slide-fade">
      <div v-if="isFilterVisible" class="card glass-card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <form @submit.prevent="fetchData">
            <div class="row g-3">
              <div class="col-12 col-md-4 col-lg-2">
                <label class="small-label mb-2 text-primary">TANGGAL AWAL</label>
                <div class="input-group input-group-sm rounded-3 overflow-hidden border">
                  <span class="input-group-text bg-white border-0"><i class="fas fa-calendar-alt text-muted"></i></span>
                  <input v-model="filters.tgl_awal" type="date" class="form-control border-0 px-2 shadow-none">
                </div>
              </div>
              <div class="col-12 col-md-4 col-lg-2">
                <label class="small-label mb-2 text-primary">TANGGAL AKHIR</label>
                <div class="input-group input-group-sm rounded-3 overflow-hidden border">
                  <span class="input-group-text bg-white border-0"><i class="fas fa-calendar-alt text-muted"></i></span>
                  <input v-model="filters.tgl_akhir" type="date" class="form-control border-0 px-2 shadow-none">
                </div>
              </div>
              <div class="col-12 col-md-4 col-lg-3">
                <label class="small-label mb-2 text-primary">UNIT / DEPARTEMEN</label>
                <v-select
                  :options="departemenList"
                  label="nama"
                  v-model="filters.departemen"
                  :reduce="d => d.dep_id"
                  placeholder="Semua Departemen..."
                  class="filter-vselect-custom"
                />
              </div>
              <div class="col-12 col-md-6 col-lg-2">
                <label class="small-label mb-2 text-primary">KATEGORI ANOMALI</label>
                <select v-model="filters.kategori_anomali" class="form-select form-select-sm border rounded-3 px-3 shadow-none" style="height: 31px;">
                  <option value="semua">Semua Akses</option>
                  <option value="anomali">⚠️ Hanya Anomali</option>
                  <option value="patuh">✅ Hanya Patuh</option>
                  <option value="HARI_LIBUR_OFF">🟡 Hari Libur / OFF</option>
                  <option value="TANPA_PRESENSI">🔴 Tanpa Presensi</option>
                  <option value="LUAR_JAM_KERJA">🔵 Di Luar Jam Kerja</option>
                </select>
              </div>
              <div class="col-12 col-md-6 col-lg-3">
                <label class="small-label mb-2 text-primary">CARI PEGAWAI</label>
                <div class="input-group input-group-sm rounded-3 overflow-hidden border">
                  <span class="input-group-text bg-white border-0"><i class="fas fa-search text-muted"></i></span>
                  <input v-model="filters.search" type="text" class="form-control border-0 px-2 shadow-none" placeholder="Nama / NIK...">
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end align-items-center gap-2 mt-3 pt-3 border-top">
              <button type="button" @click="resetFilters" class="btn btn-light btn-sm rounded-pill px-4">
                <i class="fas fa-undo me-1"></i> Reset
              </button>
              <button type="submit" class="btn btn-primary btn-sm rounded-pill px-4 shadow-sm" :disabled="loading">
                <i class="fas fa-filter me-1"></i> {{ loading ? 'Memproses...' : 'Terapkan Filter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Display Mode Switcher -->
    <div class="d-flex justify-content-center mb-4">
      <div class="bg-white rounded-pill p-1 shadow-sm border d-flex gap-1">
        <button 
          class="btn btn-sm px-4 py-2 rounded-pill transition-all" 
          :class="displayMode === 'detail' ? 'btn-primary shadow' : 'btn-light border-0'"
          @click="displayMode = 'detail'"
        >
          <i class="fas fa-list me-2"></i><span class="text-nowrap">Log Akses Detail</span>
        </button>
        <button 
          class="btn btn-sm px-4 py-2 rounded-pill transition-all" 
          :class="displayMode === 'summary' ? 'btn-primary shadow' : 'btn-light border-0'"
          @click="displayMode = 'summary'"
        >
          <i class="fas fa-chart-pie me-2"></i><span class="text-nowrap">Rekapitulasi Per Pegawai</span>
        </button>
      </div>
    </div>

    <!-- Data Table (Detail Log Mode) -->
    <div v-if="displayMode === 'detail'" class="card glass-card border-0 shadow-sm overflow-hidden">
      <div class="card-header border-0 p-4 d-flex justify-content-between align-items-center text-white" style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%);">
        <h6 class="fw-bold mb-0 text-white"><i class="fas fa-shield-alt me-2 text-white-50"></i>Log Riwayat Akses User</h6>
        <div class="small text-white-50 fw-bold">TOTAL: {{ pagination.total }} RECORDS</div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light-soft small-label text-dark">
            <tr>
              <th class="ps-4 py-3">PEGAWAI & UNIT</th>
              <th class="py-3">JAM LOG-IN</th>
              <th class="py-3">SHIFT JADWAL</th>
              <th class="py-3">JAM PRESENSI</th>
              <th class="py-3">STATUS KEPATUHAN</th>
              <th class="py-3 pe-4">KETERANGAN AUDIT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && items.length === 0">
              <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-primary mb-2"></div>
                <p class="text-muted small mb-0">Memuat log pemantauan hak akses...</p>
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-light-soft mb-3"></i>
                <h6 class="text-muted fw-bold">Tidak ada data ditemukan</h6>
                <p class="text-muted small">Coba sesuaikan filter pencarian Anda</p>
              </td>
            </tr>
            <tr v-for="(item, index) in items" :key="index" :class="{ 'bg-danger-soft-row': item.is_anomali }">
              <td class="ps-4">
                <div class="d-flex align-items-center">
                  <div class="avatar-sm bg-primary-soft text-primary rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold">
                    {{ item.nama?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="fw-bold text-dark">{{ item.nama || 'Unknown' }}</div>
                    <div class="small-label-txt text-muted">{{ item.nip }} • {{ item.jbtn }} ({{ item.nama_departemen || '-' }})</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="fw-bold text-dark">{{ item.jam_login }}</div>
                <div class="smallest text-muted">{{ formatDateIndo(item.tgl_login) }}</div>
              </td>
              <td>
                <span class="badge bg-light text-dark fw-bold border px-2.5 py-1">{{ item.shift_jadwal }}</span>
              </td>
              <td>
                <div v-if="item.presensi_datang" class="small">
                  <span class="text-success fw-bold"><i class="fas fa-sign-in-alt me-1"></i>{{ item.presensi_datang }}</span>
                  <span v-if="item.presensi_pulang" class="text-danger fw-bold ms-2"><i class="fas fa-sign-out-alt me-1"></i>{{ item.presensi_pulang }}</span>
                </div>
                <span v-else class="badge bg-danger-soft text-danger fw-normal">Tidak Presensi</span>
              </td>
              <td>
                <span :class="['badge rounded-pill px-3 py-1.5', getStatusBadgeClass(item.status_kepatuhan)]">
                  {{ getStatusText(item.status_kepatuhan) }}
                </span>
              </td>
              <td class="pe-4 small text-muted">
                {{ item.keterangan }}
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

    <!-- Summary Mode Table -->
    <div v-if="displayMode === 'summary'" class="card glass-card border-0 shadow-sm overflow-hidden">
      <div class="card-header border-0 p-4 d-flex justify-content-between align-items-center text-white" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
        <h6 class="fw-bold mb-0 text-white"><i class="fas fa-th-list me-2 text-white-50"></i>Rekapitulasi Kepatuhan Per Pegawai</h6>
        <div class="small text-white-50 fw-bold">TOTAL: {{ summaryEmployees.length }} PEGAWAI</div>
      </div>
      <div class="card-body p-0 p-lg-4">
        <div class="table-responsive border-top border-lg rounded-lg-3">
          <table class="table table-hover align-middle mb-0 text-center" style="min-width: 900px;">
            <thead class="bg-light-soft small-label text-dark">
              <tr>
                <th class="ps-4 py-3 text-start">PEGAWAI</th>
                <th class="py-3">TOTAL AKSES</th>
                <th class="py-3 bg-success-soft text-success">PATUH</th>
                <th class="py-3 bg-danger-soft text-danger">TOTAL ANOMALI</th>
                <th class="py-3 bg-warning-soft text-warning">LIBUR / OFF</th>
                <th class="py-3 bg-danger-soft text-danger">TANPA PRESENSI</th>
                <th class="py-3 bg-info-soft text-info pe-4">LUAR JAM KERJA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && summaryEmployees.length === 0">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary"></div>
                </td>
              </tr>
              <tr v-else-if="summaryEmployees.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">Tidak ada data ringkasan</td>
              </tr>
              <tr v-for="emp in summaryEmployees" :key="emp.nip">
                <td class="ps-4 text-start">
                  <div class="fw-bold text-dark">{{ emp.nama }}</div>
                  <div class="smallest text-muted">{{ emp.nip }} • {{ emp.jbtn }} ({{ emp.nama_departemen }})</div>
                </td>
                <td class="fw-bold text-secondary">{{ emp.total_akses }}</td>
                <td class="fw-bold text-success">{{ emp.total_patuh }}</td>
                <td class="fw-bold text-danger">
                  <span :class="emp.total_anomali > 0 ? 'badge bg-danger text-white rounded-pill px-2.5 py-1' : 'text-muted'">
                    {{ emp.total_anomali }}
                  </span>
                </td>
                <td class="text-warning fw-bold">{{ emp.libur_off }}</td>
                <td class="text-danger fw-bold">{{ emp.tanpa_presensi }}</td>
                <td class="text-info fw-bold pe-4">{{ emp.luar_jam_kerja }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import kepatuhanHakAksesService from '../../services/kepatuhanHakAksesService'
import departemenService from '../../services/departemenService'

const loading = ref(false)
const items = ref([])
const summaryStats = reactive({
  total_akses: 0,
  total_patuh: 0,
  total_anomali: 0,
  total_libur_off: 0,
  total_tanpa_presensi: 0,
  total_luar_jam_kerja: 0,
  rate_kepatuhan: 100,
})
const summaryEmployees = ref([])
const departemenList = ref([])
const displayMode = ref('detail') // detail | summary
const isFilterVisible = ref(window.innerWidth >= 768)

const today = new Date()
const formatDateIso = (date) => {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

const filters = reactive({
  tgl_awal: formatDateIso(today),
  tgl_akhir: formatDateIso(today),
  departemen: '',
  kategori_anomali: 'semua',
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

const fetchData = async () => {
  loading.value = true
  try {
    // Always fetch summary KPI stats
    fetchSummaryStats()
    if (displayMode.value === 'summary') {
      await fetchSummary()
    } else {
      await fetchDetail()
    }
  } catch (error) {
    console.error('Error fetching kepatuhan hak akses data:', error)
  } finally {
    loading.value = false
  }
}

const fetchDetail = async () => {
  try {
    const res = await kepatuhanHakAksesService.getLogs(filters)
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

const fetchSummaryStats = async () => {
  try {
    const res = await kepatuhanHakAksesService.getSummary(filters)
    const stats = res.data.data.stats
    Object.assign(summaryStats, stats)
  } catch (error) {
    console.error('Error fetching summary stats:', error)
  }
}

const fetchSummary = async () => {
  try {
    const res = await kepatuhanHakAksesService.getSummary(filters)
    summaryEmployees.value = res.data.data.employees
  } catch (error) {
    throw error
  }
}

const fetchDepartemen = async () => {
  try {
    const res = await departemenService.index({ limit: 200 })
    if (res.data && res.data.data) {
      departemenList.value = res.data.data.data || res.data.data || []
    }
  } catch (error) {
    console.error('Error fetching departemen:', error)
  }
}

const resetFilters = () => {
  filters.tgl_awal = formatDateIso(today)
  filters.tgl_akhir = formatDateIso(today)
  filters.departemen = ''
  filters.kategori_anomali = 'semua'
  filters.search = ''
  filters.page = 1
  fetchData()
}

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  filters.page = page
  fetchData()
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PATUH':
      return 'bg-success-soft text-success border border-success-soft'
    case 'HARI_LIBUR_OFF':
      return 'bg-warning-soft text-warning border border-warning-soft'
    case 'TANPA_PRESENSI':
      return 'bg-danger-soft text-danger border border-danger-soft'
    case 'LUAR_JAM_KERJA':
      return 'bg-info-soft text-info border border-info-soft'
    default:
      return 'bg-light text-dark'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'PATUH':
      return '✅ Patuh'
    case 'HARI_LIBUR_OFF':
      return '🟡 Libur / OFF'
    case 'TANPA_PRESENSI':
      return '🔴 Tanpa Presensi'
    case 'LUAR_JAM_KERJA':
      return '🔵 Di Luar Jam Kerja'
    default:
      return status
  }
}

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
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
  fetchDepartemen()
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

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.fw-extrabold {
  font-weight: 800;
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
.bg-success-soft { background-color: #f0fdf4; }
.bg-warning-soft { background-color: #fffbeb; }
.bg-danger-soft { background-color: #fef2f2; }
.bg-info-soft { background-color: #f0f9ff; }

.bg-danger-soft-row {
  background-color: rgba(254, 242, 242, 0.4);
}

.text-primary { color: #2563eb !important; }
.text-success { color: #16a34a !important; }
.text-warning { color: #d97706 !important; }
.text-danger { color: #dc2626 !important; }
.text-info { color: #0284c7 !important; }

.border-success-soft { border: 1px solid #bbf7d0; }
.border-warning-soft { border: 1px solid #fef3c7; }
.border-danger-soft { border: 1px solid #fecaca; }
.border-info-soft { border: 1px solid #bae6fd; }

.avatar-sm {
  width: 36px;
  height: 36px;
  font-size: 14px;
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

:deep(.filter-vselect-custom .vs__dropdown-toggle) {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  min-height: 31px;
  height: 31px;
  padding: 0 4px;
  background: #fff;
}
:deep(.filter-vselect-custom .vs__selected-options) {
  padding: 0 4px;
}
:deep(.filter-vselect-custom .vs__search) {
  font-size: 0.8rem;
  margin: 0;
  padding: 0;
}
:deep(.filter-vselect-custom .vs__selected) {
  font-size: 0.8rem;
  margin: 2px 0;
}

@media (max-width: 767px) {
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
