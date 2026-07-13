<template>
  <div class="pengkinian-tab animate__animated animate__fadeIn">
    <!-- Summary KPI Cards -->
    <div class="row g-4 mb-5">
      <!-- Total Pegawai -->
      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card glass-card">
          <div class="kpi-body">
            <div class="kpi-icon bg-soft-primary">
              <i class="fas fa-users text-primary"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Total Pegawai Aktif</span>
              <h3 class="kpi-value">{{ stats.total_pegawai || 0 }}</h3>
              <span class="kpi-subtext">Mengikuti pengkinian data</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sudah Update -->
      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card glass-card">
          <div class="kpi-body">
            <div class="kpi-icon bg-soft-success">
              <i class="fas fa-user-check text-success"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Sudah Verifikasi</span>
              <h3 class="kpi-value text-success">{{ stats.total_sudah || 0 }}</h3>
              <span class="kpi-subtext">Telah memperbarui data</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Belum Update -->
      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card glass-card">
          <div class="kpi-body">
            <div class="kpi-icon bg-soft-warning">
              <i class="fas fa-user-clock text-warning"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Belum Verifikasi</span>
              <h3 class="kpi-value text-warning">{{ stats.total_belum || 0 }}</h3>
              <span class="kpi-subtext">Belum memperbarui data</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Persentase Penyelesaian -->
      <div class="col-xl-3 col-sm-6">
        <div class="kpi-card glass-card">
          <div class="kpi-body">
            <div class="kpi-icon bg-soft-info">
              <i class="fas fa-percent text-info"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Penyelesaian</span>
              <h3 class="kpi-value text-info">{{ completionRate }}%</h3>
              <div class="progress mt-2" style="height: 6px;">
                <div 
                  class="progress-bar bg-info progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  :style="{ width: completionRate + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts & Visualizations -->
    <div class="row g-4 mb-5">
      <!-- Completion Status Chart -->
      <div class="col-lg-6">
        <div class="category-card h-100">
          <div class="category-body p-4 d-flex flex-column align-items-center justify-content-center">
            <h5 class="section-title mb-4 text-start w-100">
              <i class="fas fa-chart-pie me-2 text-primary"></i>Status Penyelesaian Semester Ini
            </h5>
            <div class="chart-wrapper">
              <VueApexCharts 
                type="donut" 
                height="230" 
                :options="completionChartOptions" 
                :series="completionChartSeries"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Device Distribution Chart -->
      <div class="col-lg-6">
        <div class="category-card h-100">
          <div class="category-body p-4 d-flex flex-column align-items-center justify-content-center">
            <h5 class="section-title mb-4 text-start w-100">
              <i class="fas fa-laptop-house me-2 text-indigo"></i>Distribusi Device Pengkinian
            </h5>
            <div class="chart-wrapper">
              <div v-if="stats.device_web || stats.device_mobile" class="w-100 text-center">
                <VueApexCharts 
                  type="pie" 
                  height="230" 
                  :options="deviceChartOptions" 
                  :series="deviceChartSeries"
                />
              </div>
              <div v-else class="empty-chart-state py-5 text-center text-muted">
                <i class="fas fa-mobile-alt fa-3x mb-3 text-light"></i>
                <p>Belum ada data update untuk semester dan tahun terpilih.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Table Section -->
    <div class="card border-0 shadow-sm glass-card">
      <div class="card-body p-4">
        <!-- Filter Header -->
        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
          <h5 class="m-0 fw-bold text-dark">
            <i class="fas fa-list text-primary me-2"></i>Daftar Pengkinian Data Pegawai
          </h5>
          
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <!-- Year Filter -->
            <select v-model="filters.year" class="form-select premium-select" @change="handleFilterChange">
              <option v-for="y in yearOptions" :key="y" :value="y">Tahun: {{ y }}</option>
            </select>

            <!-- Semester Filter -->
            <select v-model="filters.semester" class="form-select premium-select" @change="handleFilterChange">
              <option :value="1">Semester 1 (Jan-Jun)</option>
              <option :value="2">Semester 2 (Jul-Des)</option>
            </select>

            <!-- Status Filter -->
            <select v-model="filters.status" class="form-select premium-select" @change="handleFilterChange">
              <option value="all">Semua Status</option>
              <option value="sudah">Sudah Update</option>
              <option value="belum">Belum Update</option>
            </select>

            <!-- Search -->
            <input 
              v-model="filters.search" 
              type="text" 
              class="form-control premium-input" 
              placeholder="Cari NIK / Nama..." 
              @input="handleSearch"
            >
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive premium-table">
          <table class="table align-middle table-hover">
            <thead>
              <tr class="table-light-header">
                <th style="width: 50px;" class="text-center">No</th>
                <th style="width: 120px;">NIK</th>
                <th>Nama Pegawai</th>
                <th>Departemen</th>
                <th>Jabatan</th>
                <th class="text-center" style="width: 130px;">Status</th>
                <th style="width: 160px;">Waktu Verifikasi</th>
                <th class="text-center" style="width: 120px;">Device</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm mb-2"></div>
                  <div class="text-muted small">Memuat data monitoring pengkinian...</div>
                </td>
              </tr>
              <tr v-else-if="employees.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-2x mb-2 text-light"></i>
                  <div>Tidak ada data yang cocok dengan kriteria pencarian.</div>
                </td>
              </tr>
              <tr v-for="(emp, index) in employees" :key="emp.nik">
                <td class="text-center text-muted small">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td><code class="text-dark fw-bold">{{ emp.nik }}</code></td>
                <td>
                  <span class="fw-bold text-indigo" style="font-size: 0.875rem;">{{ emp.nama }}</span>
                </td>
                <td class="text-muted small">{{ emp.nama_departemen || '-' }}</td>
                <td class="text-muted small">{{ emp.jbtn || '-' }}</td>
                <td class="text-center">
                  <span 
                    :class="['status-badge', emp.sudah_update ? 'success' : 'warning']"
                  >
                    <i :class="emp.sudah_update ? 'fas fa-check-circle me-1' : 'fas fa-exclamation-circle me-1'"></i>
                    {{ emp.sudah_update ? 'Sudah' : 'Belum' }}
                  </span>
                </td>
                <td class="small">
                  <div v-if="emp.tanggal_update">
                    <div class="fw-bold text-dark">{{ formatDateOnly(emp.tanggal_update) }}</div>
                    <small class="text-muted">{{ formatTimeOnly(emp.tanggal_update) }}</small>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-center">
                  <span v-if="emp.device" :class="['device-badge', emp.device === 'web' ? 'web' : 'mobile']">
                    <i :class="emp.device === 'web' ? 'fas fa-desktop me-1' : 'fas fa-mobile-alt me-1'"></i>
                    {{ emp.device.toUpperCase() }}
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="pagination-container mt-4">
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { pegawaiService } from '@/services/pegawaiService'
import VueApexCharts from 'vue3-apexcharts'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const employees = ref([])
const stats = ref({
  total_pegawai: 0,
  total_sudah: 0,
  total_belum: 0,
  device_web: 0,
  device_mobile: 0
})

const pagination = ref({
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1
})

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i)
  }
  return years
})

const filters = reactive({
  year: new Date().getFullYear(),
  semester: new Date().getMonth() <= 5 ? 1 : 2,
  status: 'all',
  search: '',
  limit: 20
})

const completionRate = computed(() => {
  if (!stats.value.total_pegawai) return 0
  return Math.round((stats.value.total_sudah / stats.value.total_pegawai) * 100)
})

// Charts Configurations
const completionChartSeries = computed(() => [
  stats.value.total_sudah || 0,
  stats.value.total_belum || 0
])

const completionChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif'
  },
  labels: ['Sudah Verifikasi', 'Belum Verifikasi'],
  colors: ['#10b981', '#f59e0b'],
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontWeight: 600,
    labels: { colors: '#475569' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Penyelesaian',
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748b',
            formatter: () => `${completionRate.value}%`
          }
        }
      }
    }
  },
  dataLabels: { enabled: false }
}))

const deviceChartSeries = computed(() => [
  stats.value.device_web || 0,
  stats.value.device_mobile || 0
])

const deviceChartOptions = computed(() => ({
  chart: {
    type: 'pie',
    fontFamily: 'Outfit, sans-serif'
  },
  labels: ['Melalui Website', 'Melalui Mobile App'],
  colors: ['#4f46e5', '#f97316'],
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontWeight: 600,
    labels: { colors: '#475569' }
  },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => `${opts.w.globals.series[opts.seriesIndex]} orang`
  }
}))

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

const fetchMonitoring = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      limit: filters.limit,
      year: filters.year,
      semester: filters.semester,
      status: filters.status
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }

    const response = await pegawaiService.getMonitoringPengkinian(params)
    if (response.data.success) {
      employees.value = response.data.data.data || []
      stats.value = response.data.stats || {
        total_pegawai: 0,
        total_sudah: 0,
        total_belum: 0,
        device_web: 0,
        device_mobile: 0
      }
      
      const meta = response.data.data
      pagination.value = {
        current_page: meta.current_page || 1,
        per_page: meta.per_page || 20,
        total: meta.total || 0,
        last_page: meta.last_page || 1
      }
    }
  } catch (error) {
    toast.error('Gagal mengambil data monitoring pengkinian')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  fetchMonitoring(1)
}

let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchMonitoring(1)
  }, 500)
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchMonitoring(page)
  }
}

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchMonitoring(1)
})
</script>

<style scoped>
.pengkinian-tab {
  padding: 1.5rem 0;
}

/* KPI Cards */
.kpi-card {
  border-radius: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.kpi-body {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.kpi-info {
  flex-grow: 1;
}

.kpi-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  display: block;
  margin-bottom: 0.25rem;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  color: #1e293b;
}

.kpi-subtext {
  font-size: 0.75rem;
  color: #94a3b8;
  display: block;
  margin-top: 0.15rem;
}

/* Background Color Helpers */
.bg-soft-primary { background-color: #eff6ff; }
.bg-soft-success { background-color: #ecfdf5; }
.bg-soft-warning { background-color: #fffbeb; }
.bg-soft-info { background-color: #f0f9ff; }

/* Category Cards */
.category-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 750;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.chart-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Custom Table Badges */
.status-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.warning {
  background: #fee2e2;
  color: #991b1b;
}

.device-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
}

.device-badge.web {
  background: #e0f2fe;
  color: #0369a1;
}

.device-badge.mobile {
  background: #ffedd5;
  color: #c2410c;
}

/* Premium Styling */
.glass-card {
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.premium-input, .premium-select {
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  height: 40px;
  background-color: white;
}

.premium-select {
  width: auto;
  min-width: 160px;
}

.premium-input {
  width: 200px;
}

.premium-input:focus, .premium-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table-light-header th {
  background: #f8fafc !important;
  border: none;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 1rem;
  border-bottom: 2px solid #e2e8f0 !important;
}

.premium-table tbody td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-page {
  width: 32px;
  height: 32px;
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

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page-number {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-number.active {
  background: #3b82f6;
  color: white;
}

.btn-page-number:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}

@media (max-width: 768px) {
  .premium-input {
    width: 100%;
  }
}
</style>
