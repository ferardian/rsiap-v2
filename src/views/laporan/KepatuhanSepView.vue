<template>
  <div class="kepatuhan-sep-view animate__animated animate__fadeIn p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Kepatuhan Penerbitan SEP</h3>
            <p class="page-subtitle mb-0 small">Laporan monitoring waktu cetak SEP Rawat Jalan dibandingkan jadwal praktek dokter</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Card (Top) -->
    <div class="card border-0 shadow-sm panel-card mb-4">
      <div class="card-body p-3">
        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary-light text-primary p-2 rounded-3">
              <i class="fas fa-filter"></i>
            </span>
            <h6 class="m-0 fw-bold text-dark">Filter Laporan</h6>
          </div>
          
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <!-- Start Date -->
            <input 
              v-model="filters.start_date" 
              type="date" 
              class="form-control form-control-sm premium-input-date" 
              @change="handleFilterChange"
            />
            
            <!-- End Date -->
            <input 
              v-model="filters.end_date" 
              type="date" 
              class="form-control form-control-sm premium-input-date" 
              @change="handleFilterChange"
            />

            <!-- Poliklinik -->
            <select v-model="filters.kd_poli" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="">Semua Poliklinik</option>
              <option v-for="poli in poliklinikList" :key="poli.kd_poli" :value="poli.kd_poli">
                {{ poli.nm_poli }}
              </option>
            </select>

            <!-- Dokter -->
            <select v-model="filters.kd_dokter" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="">Semua Dokter</option>
              <option v-for="dr in dokterList" :key="dr.kd_dokter" :value="dr.kd_dokter">
                {{ dr.nm_dokter }}
              </option>
            </select>

            <!-- Status Kepatuhan -->
            <select v-model="filters.status" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="all">Semua Status</option>
              <option value="patuh">Sesuai Jadwal</option>
              <option value="tidak_patuh">Tidak Sesuai</option>
            </select>

            <!-- Search -->
            <input 
              v-model="filters.search" 
              type="text" 
              class="form-control form-control-sm premium-input-search" 
              placeholder="Cari RM / Nama / SEP..." 
              @input="handleSearch"
            />

            <!-- Export Buttons -->
            <button class="btn-export-excel" @click="exportToExcel" :disabled="loading">
              <i class="fas fa-file-excel me-1"></i> Excel
            </button>
            <button class="btn-export-pdf" @click="exportToPDF" :disabled="loading">
              <i class="fas fa-file-pdf me-1"></i> PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview Stats Block -->
    <div class="row g-4 mb-4">
      <!-- Total SEP Rawat Jalan -->
      <div class="col-xl-3 col-md-6">
        <div class="kpi-card shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-primary-light">
              <i class="fas fa-file-invoice text-primary"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Total SEP Ralan</span>
              <h2 class="kpi-value fw-black text-dark m-0">{{ stats?.overall?.total || 0 }}</h2>
              <small class="text-muted">Total penerbitan SEP Ralan</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Sesuai / Patuh -->
      <div class="col-xl-3 col-md-6">
        <div class="kpi-card shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-success-light">
              <i class="fas fa-check-double text-success"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Sesuai Jadwal</span>
              <h2 class="kpi-value fw-black text-success m-0">{{ stats?.overall?.patuh || 0 }}</h2>
              <small class="text-muted">Dicetak dalam batas toleransi</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tidak Sesuai -->
      <div class="col-xl-3 col-md-6">
        <div class="kpi-card shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-danger-light">
              <i class="fas fa-exclamation-triangle text-danger"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Tidak Sesuai</span>
              <h2 class="kpi-value fw-black text-danger m-0">{{ stats?.overall?.tidak_patuh || 0 }}</h2>
              <small class="text-muted">Dicetak diluar batas toleransi</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Persentase Kepatuhan -->
      <div class="col-xl-3 col-md-6">
        <div class="kpi-card shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-info-light">
              <i class="fas fa-percent text-info"></i>
            </div>
            <div class="kpi-info w-100">
              <span class="kpi-title text-muted fw-bold">Persentase Kepatuhan</span>
              <h2 class="kpi-value fw-black text-info m-0">{{ compliancePercentage }}%</h2>
              <div class="progress mt-2" style="height: 6px;">
                <div 
                  class="progress-bar bg-info" 
                  role="progressbar" 
                  :style="{ width: compliancePercentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Visualization row -->
    <div class="row g-4 mb-4">
      <!-- Daily Trend Chart -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm panel-card">
          <div class="panel-header pt-4 px-4">
            <h5 class="m-0 fw-bold text-dark"><i class="fas fa-chart-line text-primary me-2"></i>Tren Kepatuhan Harian (%)</h5>
          </div>
          <div class="card-body px-4 pb-4">
            <div v-if="trendChartSeries[0]?.data.length > 0" class="chart-wrapper">
              <VueApexCharts 
                type="area" 
                height="280" 
                :options="trendChartOptions" 
                :series="trendChartSeries"
              />
            </div>
            <div v-else class="text-center py-5 text-muted">
              <i class="fas fa-chart-area fa-3x mb-3 text-light"></i>
              <p class="m-0">Belum ada data untuk grafik tren.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Donut & Breakdown Column -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm panel-card h-100">
          <div class="panel-header pt-4 px-4">
            <h5 class="m-0 fw-bold text-dark"><i class="fas fa-info-circle text-info me-2"></i>Status Kepatuhan</h5>
          </div>
          <div class="card-body p-4 d-flex flex-column align-items-center justify-content-center">
            <div v-if="(stats?.overall?.total || 0) > 0" class="w-100">
              <VueApexCharts 
                type="donut" 
                height="240" 
                :options="donutChartOptions" 
                :series="donutChartSeries"
              />
            </div>
            <div v-else class="text-center py-5 text-muted">
              <i class="fas fa-chart-pie fa-3x mb-3 text-light"></i>
              <p class="m-0">Belum ada data untuk diagram kepatuhan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Table Block -->
    <div class="card border-0 shadow-sm panel-card mb-4">
      <div class="card-body p-4">
        <!-- Table Title Row -->
        <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
          <h5 class="m-0 fw-bold text-dark"><i class="fas fa-list text-primary me-2"></i>Daftar Kepatuhan SEP</h5>
        </div>

        <!-- Clinic & Doctor Rankings Block -->
        <div class="row g-4 mb-4">
          <!-- Top Clinic Performance -->
          <div class="col-lg-6">
            <div class="card border border-light shadow-none bg-light-subtle h-100">
              <div class="card-header bg-transparent border-0 pt-3 px-3">
                <h6 class="m-0 fw-bold text-dark"><i class="fas fa-hospital text-primary me-2"></i>Kepatuhan per Poliklinik</h6>
              </div>
              <div class="card-body p-3 scrollable-ranking">
                <div v-if="stats?.poliklinik && stats.poliklinik.length > 0">
                  <div v-for="poli in stats.poliklinik" :key="poli.kd_poli" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small fw-semibold text-secondary">{{ poli.nm_poli }}</span>
                      <span class="small fw-bold text-dark">
                        {{ getPoliRate(poli) }}% 
                        <small class="text-muted">({{ poli.patuh }}/{{ poli.total }} SEP)</small>
                      </span>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div 
                        :class="['progress-bar', getRateColorClass(getPoliRate(poli))]" 
                        role="progressbar" 
                        :style="{ width: getPoliRate(poli) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-muted small">Belum ada data poliklinik.</div>
              </div>
            </div>
          </div>

          <!-- Top Doctor Performance -->
          <div class="col-lg-6">
            <div class="card border border-light shadow-none bg-light-subtle h-100">
              <div class="card-header bg-transparent border-0 pt-3 px-3">
                <h6 class="m-0 fw-bold text-dark"><i class="fas fa-user-md text-info me-2"></i>Kepatuhan per Dokter</h6>
              </div>
              <div class="card-body p-3 scrollable-ranking">
                <div v-if="stats?.dokter && stats.dokter.length > 0">
                  <div v-for="dr in stats.dokter.slice(0, 10)" :key="dr.kd_dokter" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small fw-semibold text-secondary">{{ dr.nm_dokter }}</span>
                      <span class="small fw-bold text-dark">
                        {{ getDokterRate(dr) }}% 
                        <small class="text-muted">({{ dr.patuh }}/{{ dr.total }} SEP)</small>
                      </span>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div 
                        :class="['progress-bar', getRateColorClass(getDokterRate(dr))]" 
                        role="progressbar" 
                        :style="{ width: getDokterRate(dr) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-muted small">Belum ada data dokter.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Table -->
        <div class="table-responsive premium-table">
          <table class="table table-hover align-middle">
            <thead>
              <tr class="table-light-header">
                <th width="45" class="text-center">No</th>
                <th style="min-width: 140px;">No. SEP</th>
                <th style="min-width: 180px;">Nama Pasien</th>
                <th>Poliklinik</th>
                <th>Dokter</th>
                <th style="min-width: 130px;">Jadwal Dokter</th>
                <th style="min-width: 150px;">Jam Cetak SEP</th>
                <th width="100" class="text-center">Selisih</th>
                <th width="120" class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm mb-2" role="status"></div>
                  <div class="text-muted small">Memuat rincian data kepatuhan SEP...</div>
                </td>
              </tr>
              <tr v-else-if="details.length === 0">
                <td colspan="9" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-2x mb-2 text-light"></i>
                  <div>Tidak ada data kepatuhan SEP yang ditemukan.</div>
                </td>
              </tr>
              <tr v-for="(item, index) in details" :key="item.no_sep" class="table-row">
                <td class="text-center text-muted small">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td>
                  <code class="text-dark fw-bold" style="font-size: 0.8rem;">{{ item.no_sep }}</code>
                </td>
                <td>
                  <div class="fw-bold text-indigo" style="font-size: 0.85rem;">{{ item.nm_pasien }}</div>
                  <small class="text-muted">{{ item.no_rkm_medis }}</small>
                </td>
                <td class="small">{{ item.nm_poli }}</td>
                <td class="small fw-semibold text-secondary">{{ item.nm_dokter }}</td>
                <td class="small">
                  <span class="badge bg-light text-dark border fw-normal" style="font-size: 0.75rem;">
                    {{ item.hari_kerja }}: {{ formatTimeRange(item.jam_mulai, item.jam_selesai) }}
                  </span>
                </td>
                <td class="small">
                  <div class="fw-bold text-dark">{{ formatDateOnly(item.tglpulang) }}</div>
                  <small class="text-muted"><i class="far fa-clock me-1"></i>{{ formatTimeOnly(item.tglpulang) }}</small>
                </td>
                <td class="text-center small">
                  <span :class="['selisih-label', getSelisihClass(item.selisih_menit, item.is_patuh)]">
                    {{ formatSelisih(item.selisih_menit) }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="['compliance-badge', item.is_patuh ? 'success' : 'danger']">
                    <i :class="item.is_patuh ? 'fas fa-check-circle me-1' : 'fas fa-times-circle me-1'"></i>
                    {{ item.is_patuh ? 'Sesuai' : 'Tidak Sesuai' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
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
import { kepatuhanSepService } from '@/services/kepatuhanSepService'
import poliklinikService from '@/services/poliklinikService'
import { dokterService } from '@/services/dokterService'
import VueApexCharts from 'vue3-apexcharts'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const toast = useToast()
const loading = ref(false)

// Dropdown lists
const poliklinikList = ref([])
const dokterList = ref([])

// Statistical summaries & details list
const stats = ref({
  overall: { total: 0, patuh: 0, tidak_patuh: 0 },
  daily_trend: [],
  poliklinik: [],
  dokter: []
})
const details = ref([])

// Pagination
const pagination = ref({
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1
})

// Date defaults (current month - timezone safe)
const today = new Date()
const formatDateToYYYYMMDD = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const defaultStartDate = formatDateToYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1))
const defaultEndDate = formatDateToYYYYMMDD(today)

// Filters state
const filters = reactive({
  start_date: defaultStartDate,
  end_date: defaultEndDate,
  kd_poli: '',
  kd_dokter: '',
  status: 'all',
  search: '',
  limit: 20
})

const compliancePercentage = computed(() => {
  if (!stats.value?.overall?.total) return 0
  return Math.round((stats.value.overall.patuh / stats.value.overall.total) * 100)
})

// Chart configurations: Donut
const donutChartSeries = computed(() => [
  Number(stats.value?.overall?.patuh || 0),
  Number(stats.value?.overall?.tidak_patuh || 0)
])

const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif'
  },
  labels: ['Sesuai Jadwal', 'Tidak Sesuai'],
  colors: ['#10b981', '#ef4444'],
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontWeight: 600,
    labels: { colors: '#475569' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Rata-rata Kepatuhan',
            fontSize: '13px',
            fontWeight: 600,
            color: '#64748b',
            formatter: () => `${compliancePercentage.value}%`
          }
        }
      }
    }
  },
  dataLabels: { enabled: false }
}))

// Chart configurations: Trend Area
const trendChartSeries = computed(() => {
  if (!stats.value?.daily_trend || !stats.value.daily_trend.length) return []
  return [
    {
      name: 'Kepatuhan (%)',
      data: stats.value.daily_trend.map(item => {
        if (!item.total) return 0
        return Math.round((item.patuh / item.total) * 100)
      })
    }
  ]
})

const trendChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Outfit, sans-serif'
  },
  colors: ['#3b82f6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    categories: (stats.value?.daily_trend || []).map(item => formatDateShort(item.tanggal)),
    labels: {
      style: { colors: '#64748b', fontSize: '10px' }
    }
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: {
      formatter: (val) => `${val}%`,
      style: { colors: '#64748b' }
    }
  },
  tooltip: {
    x: { show: true },
    y: { formatter: (val) => `${val}%` }
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

const loadFilterOptions = async () => {
  try {
    const [poliklinikRes, dokterRes] = await Promise.all([
      poliklinikService.getAllPoliklinik(),
      dokterService.getDokter(1, 100)
    ])
    poliklinikList.value = poliklinikRes.data || []
    dokterList.value = dokterRes.data.data || dokterRes.data || []
  } catch (error) {
    console.error('Failed to load filter dropdowns', error)
  }
}

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      status: filters.status
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }

    // Call stats API
    const statsRes = await kepatuhanSepService.getStats(params)
    if (statsRes.data.success) {
      stats.value = statsRes.data.data
    }

    // Call details list API
    params.page = page
    params.limit = filters.limit
    const detailRes = await kepatuhanSepService.getDetails(params)
    if (detailRes.data.success) {
      details.value = detailRes.data.data.data || []
      const meta = detailRes.data.data
      pagination.value = {
        current_page: meta.current_page || 1,
        per_page: meta.per_page || 20,
        total: meta.total || 0,
        last_page: meta.last_page || 1
      }
    }
  } catch (error) {
    toast.error('Gagal mengambil laporan kepatuhan SEP')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  fetchData(1)
}

let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchData(1)
  }, 500)
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchData(page)
  }
}

// Helpers / Formatters
const getPoliRate = (poli) => {
  if (!poli.total) return 0
  return Math.round((poli.patuh / poli.total) * 100)
}

const getDokterRate = (dr) => {
  if (!dr.total) return 0
  return Math.round((dr.patuh / dr.total) * 100)
}

const getRateColorClass = (rate) => {
  if (rate >= 80) return 'bg-success'
  if (rate >= 50) return 'bg-warning'
  return 'bg-danger'
}

const formatTimeRange = (start, end) => {
  return `${(start || '').substring(0, 5)} - ${(end || '').substring(0, 5)}`
}

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  return `${dateObj.getDate()} ${dateObj.toLocaleDateString('id-ID', { month: 'short' })}`
}

const formatSelisih = (minutes) => {
  if (minutes === 0) return 'Tepat Waktu'
  const prefix = minutes > 0 ? '+' : ''
  return `${prefix}${minutes} mnt`
}

const getSelisihClass = (minutes, isPatuh) => {
  if (minutes === 0) return 'text-success fw-bold'
  return isPatuh ? 'text-primary' : 'text-danger fw-bold'
}

// Export excel
const exportToExcel = async () => {
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      status: filters.status,
      limit: 1000 // Get high amount of data for export
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    
    toast.info('Menyiapkan berkas Excel...')
    const res = await kepatuhanSepService.getDetails(params)
    const exportData = res.data.data.data || []
    
    if (exportData.length === 0) {
      toast.warning('Tidak ada data untuk diexport')
      return
    }

    const wsData = exportData.map((item, index) => ({
      'No': index + 1,
      'No. SEP': item.no_sep,
      'No. Rawat': item.no_rawat,
      'No. RM': item.no_rkm_medis,
      'Nama Pasien': item.nm_pasien,
      'Poliklinik': item.nm_poli,
      'Dokter': item.nm_dokter,
      'Jadwal Dokter': `${item.hari_kerja} (${item.jam_mulai.substring(0, 5)}-${item.jam_selesai.substring(0, 5)})`,
      'Jam Cetak SEP': item.tglpulang,
      'Selisih (Menit)': item.selisih_menit,
      'Status': item.is_patuh ? 'Sesuai' : 'Tidak Sesuai'
    }))

    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Kepatuhan SEP Ralan")
    XLSX.writeFile(wb, `Kepatuhan_Penerbitan_SEP_${filters.start_date}_s.d_${filters.end_date}.xlsx`)
    toast.success('Excel berhasil di-download')
  } catch (error) {
    toast.error('Gagal mengekspor berkas Excel')
  }
}

// Export PDF
const exportToPDF = async () => {
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      status: filters.status,
      limit: 500
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    
    toast.info('Menyiapkan berkas PDF...')
    const res = await kepatuhanSepService.getDetails(params)
    const exportData = res.data.data.data || []

    if (exportData.length === 0) {
      toast.warning('Tidak ada data untuk diexport')
      return
    }

    const doc = new jsPDF('l', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width || 297
    const pageHeight = doc.internal.pageSize.height || 210

    // Header Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("LAPORAN KEPATUHAN PENERBITAN SEP RAWAT JALAN", 14, 15)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Periode: ${formatDateOnly(filters.start_date)} s.d ${formatDateOnly(filters.end_date)}`, 14, 21)
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 26)

    const tableRows = exportData.map((item, index) => [
      index + 1,
      item.no_sep,
      `${item.nm_pasien}\n(${item.no_rkm_medis})`,
      item.nm_poli,
      item.nm_dokter,
      `${item.hari_kerja}\n${item.jam_mulai.substring(0, 5)}-${item.jam_selesai.substring(0, 5)}`,
      item.tglpulang,
      formatSelisih(item.selisih_menit),
      item.is_patuh ? 'Sesuai' : 'Tidak Sesuai'
    ])

    autoTable(doc, {
      startY: 32,
      head: [['No', 'No. SEP', 'Pasien (RM)', 'Poliklinik', 'Dokter', 'Jadwal Dokter', 'Jam Cetak SEP', 'Selisih', 'Status']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3, font: 'helvetica' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 42 },
        2: { cellWidth: 45 },
        3: { cellWidth: 35 },
        4: { cellWidth: 45 },
        5: { cellWidth: 30 },
        6: { cellWidth: 35 },
        7: { cellWidth: 20, halign: 'center' },
        8: { cellWidth: 25, halign: 'center' }
      },
      margin: { left: 14, right: 14 }
    })

    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }

    doc.save(`Laporan_Kepatuhan_SEP_${filters.start_date}_s.d_${filters.end_date}.pdf`)
    toast.success('PDF berhasil di-download')
  } catch (error) {
    toast.error('Gagal mengekspor berkas PDF')
  }
}

onMounted(() => {
  loadFilterOptions()
  fetchData(1)
})
</script>

<style scoped>
.kepatuhan-sep-view {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Header Section */
.header-icon-bg {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  font-size: 1.5rem;
}

.panel-header {
  background: transparent !important;
  border-bottom: none !important;
  padding: 1.25rem 1.5rem 0.5rem 1.5rem;
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

.kpi-icon-wrapper {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.bg-primary-light { background-color: #eff6ff; }
.bg-success-light { background-color: #ecfdf5; }
.bg-danger-light { background-color: #fef2f2; }
.bg-info-light { background-color: #ecfeff; }

.kpi-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.15rem;
}

.kpi-value {
  font-size: 1.85rem;
}

/* Ranking panels */
.scrollable-ranking {
  max-height: 230px;
  overflow-y: auto;
}

/* Panel Card */
.panel-card {
  border-radius: 16px;
  background: white;
  border: 1px solid #e2e8f0;
}

/* Form controls */
.premium-input-date, .premium-select-filter, .premium-input-search {
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  height: 34px;
  padding: 0.25rem 0.5rem;
}

.premium-input-date {
  width: 130px;
}

.premium-select-filter {
  width: 150px;
}

.premium-input-search {
  width: 180px;
}

.btn-export-excel, .btn-export-pdf {
  height: 34px;
  padding: 0 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background-color: #ffffff;
  width: auto;
}

.btn-export-excel {
  color: #10b981;
  border: 1px solid #10b981;
}

.btn-export-excel:hover {
  background-color: #f1f5f9;
  color: #10b981;
}

.btn-export-pdf {
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-export-pdf:hover {
  background-color: #f1f5f9;
  color: #ef4444;
}

/* Table Style */
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

/* Badges */
.compliance-badge {
  font-size: 0.725rem;
  font-weight: 800;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}

.compliance-badge.success {
  background: #dcfce7;
  color: #15803d;
}

.compliance-badge.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.selisih-label {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.775rem;
}

/* Pagination styling */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 0.825rem;
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

@media (max-width: 1200px) {
  .filter-wrapper {
    width: 100%;
    margin-top: 1rem;
  }
}
</style>
