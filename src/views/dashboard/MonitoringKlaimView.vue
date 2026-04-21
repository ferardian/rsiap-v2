<template>
  <div class="monitoring-klaim-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="dashboard-header brand-gradient shadow-sm rounded-4 p-4 mb-4 text-white">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3 glass-effect">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 class="mb-0 fw-bold tracking-tight">Monitoring Klaim BPJS</h3>
            <p class="mb-0 opacity-75 small">Statistik Pengajuan dan Status Klaim (Data Internal tersinkronisasi)</p>
          </div>
        </div>

        <div class="action-buttons d-flex gap-3 align-items-center">
          <div class="mode-toggle-group glass-effect rounded-pill p-1 shadow-sm">
            <button @click="setYearlyMode(true)" :class="['mode-pill-btn', { active: filters.isYearlyMode }]">
              <i class="fas fa-calendar-alt me-2"></i> Tahunan
            </button>
            <button @click="setYearlyMode(false)" :class="['mode-pill-btn', { active: !filters.isYearlyMode }]">
              <i class="fas fa-calendar-day me-2"></i> Bulanan
            </button>
          </div>
          
          <button v-if="!filters.isYearlyMode" class="btn btn-glass-success rounded-pill px-4" @click="syncData" :disabled="syncing">
            <i :class="['fas', syncing ? 'fa-spinner fa-spin' : 'fa-sync-alt', 'me-2']"></i> Sync Data
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4 overflow-visible">
      <div class="card-body p-4">
        <div class="row g-4 align-items-end">
          <!-- Periode Filters (Balanced to prevent wrapping) -->
          <div class="col-md-3">
            <label class="filter-label"><i class="fas fa-calendar-check me-1 text-primary"></i> Periode {{ filters.isYearlyMode ? 'Tahunan' : 'Bulanan' }}</label>
            <div class="d-flex gap-2">
              <select v-if="!filters.isYearlyMode" class="form-select modern-select shadow-sm" v-bind:class="{ 'w-60': !filters.isYearlyMode }" v-model="filters.bulan">
                <option v-for="(m, idx) in months" :key="idx" :value="idx+1">{{ m }}</option>
              </select>
              <select class="form-select modern-select shadow-sm" v-bind:class="{ 'w-100': filters.isYearlyMode, 'w-40': !filters.isYearlyMode }" v-model="filters.tahun">
                <option v-for="y in yearRange" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>

          <!-- Segmented Service Type -->
          <div class="col-md-3">
            <label class="filter-label"><i class="fas fa-hospital-alt me-1 text-primary"></i> Jenis Pelayanan</label>
            <div class="segmented-control p-1 bg-light rounded-3 d-flex w-100 border">
              <button @click="filters.jenis_pelayanan = '1'" :class="['seg-btn flex-fill', { active: filters.jenis_pelayanan === '1' }]">Inap</button>
              <button @click="filters.jenis_pelayanan = '2'" :class="['seg-btn flex-fill', { active: filters.jenis_pelayanan === '2' }]">Jalan</button>
            </div>
          </div>

          <!-- Status Selection -->
          <div class="col-md-2">
            <label class="filter-label"><i class="fas fa-tasks me-1 text-primary"></i> Status Klaim</label>
            <select class="form-select modern-select shadow-sm" v-model="filters.status_klaim">
              <option value="all">Semua Status</option>
              <option value="1">Verifikasi</option>
              <option value="2">Pending</option>
              <option value="3">Lolos</option>
            </select>
          </div>

          <!-- Doctor Selection with Corrected Display -->
          <div class="col-md-4">
            <label class="filter-label"><i class="fas fa-user-md me-1 text-primary"></i> Dokter DPJP</label>
            <v-select 
              :options="doctors" 
              label="nm_dokter" 
              v-model="filters.kd_dokter"
              :reduce="d => d.kd_dokter"
              placeholder="Semua Dokter (Cari...)"
              class="modern-v-select-alt shadow-sm"
            />
          </div>

          <!-- Search & Action Area -->
          <div class="col-md-12 mt-4 pt-4 border-top d-flex flex-wrap align-items-center justify-content-between gap-4">
            <div class="search-input-wrapper flex-grow-1" style="max-width: 500px;">
              <div class="input-group modern-input-group-premium shadow-sm overflow-hidden rounded-pill">
                <span class="input-group-text border-0 bg-white ps-3"><i class="fas fa-search text-primary opacity-50"></i></span>
                <input type="text" class="form-control border-0 py-2" placeholder="Cari SEP, Pasien, Dokter, atau Kode INACBG..." v-model="searchQuery">
              </div>
            </div>

            <div class="d-flex gap-3 align-items-center">
              <button v-if="dataLoaded" class="btn btn-soft-success rounded-pill px-4" @click="exportToExcel">
                <i class="fas fa-file-excel me-2"></i> Export Excel
              </button>
              <button class="btn btn-premium-action rounded-pill px-5 shadow-lg animate-pulse-gentle" @click="fetchData" :disabled="loading || syncing">
                <i v-if="loading" class="spinner-border spinner-border-sm me-2"></i>
                <i v-else class="fas fa-filter me-2 fs-6"></i> <span>TAMPILKAN DATA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="(loading || syncing) && !dataLoaded" class="text-center py-5">
      <div class="spinner-grow text-primary" role="status"></div>
      <p class="mt-3 text-muted fw-bold">{{ syncing ? 'Mensinkronkan data langsung dari server BPJS...' : 'Memuat data klaim internal...' }}</p>
    </div>

    <div v-else-if="error" class="alert alert-danger shadow-sm border-0 d-flex align-items-center gap-3 animate__animated animate__fadeIn">
      <i class="fas fa-exclamation-circle fa-2x"></i>
      <div>
        <strong>Terjadi Kesalahan / Data Kosong</strong>
        <p class="mb-0">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="dataLoaded" class="dashboard-content animate__animated animate__fadeIn">
      <!-- Summary Cards -->
      <div class="row g-4 mb-4">
        <div class="col-lg-3 col-md-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 h-100 p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="text-muted small fw-bold text-uppercase mb-1">Total Data SEP</h6>
                <h3 class="fw-bold mb-0 text-dark">{{ statistics.totalData }}<span class="fs-6 text-muted fw-normal ms-1">Berkas</span></h3>
              </div>
              <div class="stat-icon bg-blue-subtle text-primary">
                <i class="fas fa-file-medical"></i>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar bg-primary" :style="{width: '100%'}"></div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 h-100 p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="text-muted small fw-bold text-uppercase mb-1">Biaya Pengajuan</h6>
                <h3 class="fw-bold mb-0 text-dark" style="font-size: 1.3rem;">{{ formatRupiah(statistics.totalPengajuan) }}</h3>
              </div>
              <div class="stat-icon bg-orange-subtle text-orange">
                <i class="fas fa-file-invoice-dollar"></i>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar bg-orange" :style="{width: '100%'}"></div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 h-100 p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="text-muted small fw-bold text-uppercase mb-1">Tarif RS Real</h6>
                <h3 class="fw-bold mb-0 text-dark" style="font-size: 1.3rem;">{{ formatRupiah(statistics.totalTarifRs) }}</h3>
              </div>
              <div class="stat-icon bg-indigo-subtle text-indigo">
                <i class="fas fa-hospital"></i>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar bg-indigo" :style="{width: '100%'}"></div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="stat-card card border-0 shadow-sm rounded-4 h-100 p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="text-muted small fw-bold text-uppercase mb-1">Biaya Disetujui</h6>
                <h3 class="fw-bold mb-0 text-dark" style="font-size: 1.3rem;">{{ formatRupiah(statistics.totalDisetujui) }}</h3>
              </div>
              <div class="stat-icon bg-green-subtle text-success">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar bg-success" :style="{width: '100%'}"></div>
            </div>
            <span class="d-block mt-3 text-xs fw-bold text-success">
              <i class="fas fa-arrow-up me-1"></i> {{ statistics.approvalRate }}% dari Pengajuan
            </span>
          </div>
        </div>
      </div>

      <!-- Donut Chart & Overview Row -->
      <div v-if="filteredClaims.length > 0" class="row mb-4">
        <!-- Monthly Trend Line Chart (Only in Yearly mode) -->
        <div v-if="filters.isYearlyMode && chartSeries.length > 0" class="col-lg-12 mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 class="card-title-sm mb-4">Tren Biaya Klaim {{ filters.tahun }}</h5>
            <div style="height: 300px;">
              <apexchart type="area" height="100%" :options="areaChartOptions" :series="chartSeries"></apexchart>
            </div>
          </div>
        </div>

        <div v-if="filters.isYearlyMode" class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 class="card-title-sm mb-4">Tren Status Klaim Bulanan {{ filters.tahun }}</h5>
            <div v-if="statusTimelineSeries.length > 0" style="height: 300px;">
              <apexchart type="line" height="100%" :options="statusLineChartOptions" :series="statusTimelineSeries"></apexchart>
            </div>
            <div v-else class="text-center text-muted mt-5">Tidak cukup data</div>
          </div>
        </div>

        <div :class="[filters.isYearlyMode ? 'col-lg-4' : 'col-lg-12']" class="mb-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 class="card-title-sm mb-4">Distribusi INA-CBG Teratas</h5>
            <div v-if="donutSeries.length > 0" style="height: 300px; display: flex; align-items: center; justify-content: center;">
              <apexchart type="donut" width="100%" :options="donutChartOptions" :series="donutSeries"></apexchart>
            </div>
            <div v-else class="text-center text-muted mt-5">Tidak cukup data</div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div class="card-header bg-primary py-3 px-4 d-flex justify-content-between align-items-center border-0">
          <div class="d-flex align-items-center">
            <div class="header-accent-line me-3 bg-white opacity-50"></div>
            <h6 class="mb-0 fw-bold text-white"><i class="fas fa-list me-2 text-white"></i>Rincian Berkas SEP</h6>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="badge premium-count-badge rounded-pill px-3 py-2 fw-bold">
              <i class="fas fa-database me-1"></i> {{ filteredClaims.length }} Data Tersedia
            </span>
          </div>
        </div>
        
        <div v-show="false" class="p-3 bg-light border-bottom d-flex gap-3 align-items-center">
          <!-- Hidden redundant search -->
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0 styled-table align-middle">
            <thead class="premium-thead">
              <tr>
                <th class="ps-4">No SEP & Tgl Pulang</th>
                <th>Pasien</th>
                <th>Poli / Kelas</th>
                <th>INA-CBG</th>
                <th class="text-end">Tarif RS</th>
                <th class="text-end">Pengajuan</th>
                <th class="text-end">Disetujui</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredClaims.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-25"></i>
                  <p class="mb-0">Tidak ada data klaim yang sesuai dengan pencarian Anda.</p>
                </td>
              </tr>
              <tr v-for="(claim, idx) in paginatedClaims" :key="idx">
                <td class="ps-4">
                  <div class="fw-bold text-primary">{{ claim.noSEP }}</div>
                  <div class="text-xs text-muted">Pulang: {{ claim.tglPulang }}</div>
                </td>
                <td>
                  <div class="fw-bold">{{ claim.peserta?.nama || '-' }}</div>
                  <div class="text-xs text-muted">RM: {{ claim.peserta?.noMR || '-' }}</div>
                </td>
                <td>
                  <div class="fw-medium">{{ claim.poli || '-' }}</div>
                  <div class="text-xs text-muted">Kelas: {{ claim.kelasRawat || '-' }}</div>
                  <div v-if="claim.dokter?.nama" class="text-xs mt-1">
                    <span class="badge bg-light text-primary border border-primary-subtle fw-medium">
                      <i class="fas fa-user-md me-1 text-xs"></i> {{ claim.dokter.nama }}
                    </span>
                  </div>
                </td>
                <td>
                  <div v-if="claim.Inacbg?.kode" class="inacbg-wrapper">
                    <div class="fw-bold text-dark">{{ claim.Inacbg.kode }}</div>
                    <div class="text-xs text-muted text-truncate" style="max-width:150px;">
                      {{ claim.Inacbg.nama || '-' }}
                    </div>
                    <div class="inacbg-tooltip">{{ claim.Inacbg.nama }}</div>
                  </div>
                  <div v-else class="text-muted">—</div>
                </td>
                <td class="text-end fw-medium">{{ formatRupiah(claim.biaya?.byTarifRS || 0) }}</td>
                <td class="text-end fw-bold text-orange">{{ formatRupiah(claim.biaya?.byPengajuan || 0) }}</td>
                <td class="text-end fw-bold text-success">{{ formatRupiah(claim.biaya?.bySetujui || 0) }}</td>
                <td class="text-center">
                  <span class="badge" :class="getStatusBadge(claim.status)">{{ claim.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Modern Pagination -->
        <div v-if="filteredClaims.length > itemsPerPage" class="card-footer bg-white border-0 d-flex justify-content-between align-items-center py-4 px-4">
          <div class="text-muted small fw-medium">
            Menampilkan <span class="text-dark fw-bold">{{ paginationStart + 1 }}</span> - <span class="text-dark fw-bold">{{ Math.min(paginationEnd, filteredClaims.length) }}</span> dari <span class="text-dark fw-bold">{{ filteredClaims.length }}</span> data
          </div>
          
          <nav aria-label="Page navigation">
            <ul class="pagination-premium mb-0 d-flex gap-2">
              <li :class="{ disabled: currentPage === 1 }">
                <button class="pag-btn" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              
              <li class="curr-page-indicator">
                <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
              </li>

              <li :class="{ disabled: currentPage === totalPages }">
                <button class="pag-btn" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import bpjsVclaimService from '@/services/bpjsVclaimService'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'

const apexchart = VueApexCharts

// State
const loading = ref(false)
const syncing = ref(false)
const dataLoaded = ref(false)
const error = ref(null)
const syncSuccessMessage = ref('')
const claimsData = ref([])
const monthlyAggregates = ref([]) // For yearly mode chart
const doctors = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 15

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const yearRange = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

const filters = reactive({
  isYearlyMode: true,
  bulan: new Date().getMonth() + 1,
  tahun: new Date().getFullYear(),
  jenis_pelayanan: "1", // 1=Inap
  status_klaim: "all", // all=Semua Status
  kd_dokter: null
})

// Computed Formats
const formatRupiah = (angka) => {
  if (!angka) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

const getStatusBadge = (status) => {
  if (status.includes('Tidak Layak')) return 'bg-danger'
  if (status.includes('Proses')) return 'bg-warning text-dark'
  if (status.includes('Pending')) return 'bg-indigo text-white'
  if (status.includes('Klaim') || status.includes('Selesai')) return 'bg-success'
  return 'bg-secondary'
}

// Computed Data & Logic
const filteredClaims = computed(() => {
  if (!searchQuery.value) return claimsData.value
  const q = searchQuery.value.toLowerCase()
  return claimsData.value.filter(c => {
    return (c.noSEP || '').toLowerCase().includes(q) ||
           (c.peserta?.nama || '').toLowerCase().includes(q) ||
           (c.Inacbg?.kode || '').toLowerCase().includes(q) ||
           (c.dokter?.nama || '').toLowerCase().includes(q)
  })
})

const totalPages = computed(() => Math.ceil(filteredClaims.value.length / itemsPerPage) || 1)
const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage)
const paginationEnd = computed(() => paginationStart.value + itemsPerPage)
const paginatedClaims = computed(() => filteredClaims.value.slice(paginationStart.value, paginationEnd.value))

const statistics = computed(() => {
  let pengajuan = 0
  let disetujui = 0
  let tarifRs = 0

  claimsData.value.forEach(c => {
    pengajuan += parseFloat(c.biaya?.byPengajuan || 0)
    disetujui += parseFloat(c.biaya?.bySetujui || 0)
    tarifRs += parseFloat(c.biaya?.byTarifRS || 0)
  })

  let rate = 0;
  if (pengajuan > 0) {
    rate = ((disetujui / pengajuan) * 100).toFixed(1)
  }

  return {
    totalData: claimsData.value.length,
    totalPengajuan: pengajuan,
    totalDisetujui: disetujui,
    totalTarifRs: tarifRs,
    approvalRate: rate
  }
})

// Chart Logic
const chartSeries = computed(() => {
  if (!filters.isYearlyMode || monthlyAggregates.value.length === 0) return []
  return [
    { name: 'Pengajuan (Rp)', data: monthlyAggregates.value.map(m => m.pengajuan) },
    { name: 'Tarif RS (Rp)', data: monthlyAggregates.value.map(m => m.tarifRs) }
  ]
})

const areaChartOptions = {
  chart: { type: 'area', fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
  colors: ['#f97316', '#3b82f6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { 
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
    labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
  },
  yaxis: { 
    labels: { formatter: (val) => formatRupiah(val) }
  },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
  },
  tooltip: {
    y: { formatter: (val) => formatRupiah(val) }
  }
}

const topInacbg = computed(() => {
  const counts = {}
  claimsData.value.forEach(c => {
    const code = c.Inacbg?.kode || 'Unknown'
    counts[code] = (counts[code] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5
})

const donutSeries = computed(() => topInacbg.value.map(i => i[1]))

const donutChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
  labels: topInacbg.value.map(i => i[0]),
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom' },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: { show: true, name: { show: true }, value: { show: true, formatter: (val) => val + " Berkas" }, total: { show: true, label: 'Kasus' } }
      }
    }
  }
}))

const statusTimelineSeries = computed(() => {
  if (!filters.isYearlyMode || claimsData.value.length === 0) return []

  // Get all unique statuses
  const statuses = [...new Set(claimsData.value.map(c => c.status || 'Tidak Diketahui'))]
  
  return statuses.map(statusName => {
    const monthlyData = Array(12).fill(0)
    claimsData.value.forEach(c => {
      if (c.status === statusName && c.tglPulang) {
        const month = parseInt(c.tglPulang.split('-')[1], 10) - 1
        monthlyData[month]++
      }
    })
    return {
      name: statusName,
      data: monthlyData
    }
  })
})

const statusLineChartOptions = computed(() => ({
  chart: { 
    type: 'line', 
    fontFamily: 'Inter, sans-serif', 
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  colors: statusTimelineSeries.value.map(s => {
    const status = s.name;
    if (status.includes('Tidak Layak')) return '#ef4444'
    if (status.includes('Proses')) return '#f59e0b'
    if (status.includes('Pending')) return '#4f46e5'
    if (status.includes('Klaim') || status.includes('Selesai')) return '#10b981'
    return '#64748b'
  }),
  stroke: { curve: 'smooth', width: 3 },
  markers: { size: 4 },
  dataLabels: { 
    enabled: true,
    style: { fontSize: '10px', fontWeight: 600 },
    background: { enabled: true, padding: 4, borderRadius: 2, borderWidth: 0, opacity: 0.8 },
    dropShadow: { enabled: false },
    formatter: (val) => val > 0 ? val : '' // Hide zero values for cleaner look
  },
  xaxis: { 
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
    labels: { style: { colors: '#94a3b8', fontWeight: 600 } }
  },
  yaxis: { 
    title: { text: 'Jumlah Berkas', style: { color: '#64748b', fontWeight: 600 } },
    labels: { formatter: (val) => Math.round(val) }
  },
  tooltip: {
    y: { formatter: (val) => val + " Berkas" }
  },
  legend: { position: 'top', horizontalAlign: 'right' }
}))

// Actions
const setYearlyMode = (val) => {
  filters.isYearlyMode = val
  fetchData()
}

const fetchDoctors = async () => {
  try {
    const response = await bpjsVclaimService.getMappingDokter()
    if (response.data?.metadata?.code === 200) {
      // Map to consistent format
      doctors.value = response.data.response.map(m => ({
        kd_dokter: m.kd_dokter,
        nm_dokter: m.dokter?.nm_dokter || m.nm_dokter_bpjs
      }))
    }
  } catch (err) {
    console.error("Failed to fetch doctors:", err)
  }
}

const syncData = async () => {
  const result = await Swal.fire({
    title: 'Konfirmasi Sinkronisasi',
    text: `Sistem akan mengambil data klaim terbaru dari BPJS untuk periode ${months[filters.bulan - 1]} ${filters.tahun}. Lanjutkan?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Teruskan!',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-4 border-0 shadow-lg',
      confirmButton: 'rounded-pill px-4 fw-bold',
      cancelButton: 'rounded-pill px-4'
    }
  })

  if (!result.isConfirmed) return

  syncing.value = true
  error.value = null
  dataLoaded.value = false
  syncSuccessMessage.value = ''
  
  try {
    const params = {
      jenis_pelayanan: filters.jenis_pelayanan,
      status_klaim: filters.status_klaim,
      tahun: filters.tahun
    }

    if (!filters.isYearlyMode) {
      params.bulan = filters.bulan
    }

    const response = await bpjsVclaimService.syncMonitoringKlaim(params)
    
    if (response.data?.metaData?.code === '200') {
      syncSuccessMessage.value = "Sinkronisasi selesai!"
      setTimeout(() => syncSuccessMessage.value = '', 5000)
    } else {
      error.value = "Gagal memproses sinkronisasi: " + (response.data?.metaData?.message || "Unknown Error")
    }
  } catch (err) {
    error.value = "Terjadi kesalahan saat menghubungi API untuk sinkronisasi."
  } finally {
    syncing.value = false
    // Selalu fetch ulang data setelah sync (terlepas berhasil atau tidak) untuk me-refresh
    fetchData()
  }
}

const fetchData = async () => {
  if (syncing.value) return; // Prevent double fetching if already syncing
  
  loading.value = true
  dataLoaded.value = false
  error.value = null
  currentPage.value = 1
  claimsData.value = []
  monthlyAggregates.value = []

  try {
    const params = {
      jenis_pelayanan: filters.jenis_pelayanan,
      status_klaim: filters.status_klaim,
      tahun: filters.tahun
    }

    if (!filters.isYearlyMode) {
      params.bulan = filters.bulan
    }

    if (filters.kd_dokter) {
      params.kd_dokter = filters.kd_dokter
    }

    const response = await bpjsVclaimService.getMonitoringKlaim(params)

    if (response.data?.metaData?.code === '200') {
      const claims = response.data.response?.klaim || []
      if (claims.length === 0) {
        error.value = "Data tidak ditemukan di database internal pada periode tersebut."
      } else {
        claimsData.value = claims

        if (filters.isYearlyMode) {
          // Group by month for chart
          const aggregates = Array(12).fill({}).map(() => ({ pengajuan: 0, tarifRs: 0 }))
          claims.forEach(c => {
            if (c.tglPulang) {
              const month = parseInt(c.tglPulang.split('-')[1], 10) - 1
              aggregates[month].pengajuan += parseFloat(c.biaya?.byPengajuan || 0)
              aggregates[month].tarifRs += parseFloat(c.biaya?.byTarifRS || 0)
            }
          })
          monthlyAggregates.value = aggregates
        }
      }
    } else {
      error.value = response.data?.metaData?.message || "Gagal mengambil data."
    }

    if (!error.value) {
      dataLoaded.value = true
    }
  } catch (err) {
    error.value = "Gagal menghubungi server API Internal RSIA."
  } finally {
    loading.value = false
  }
}

const exportToExcel = () => {
  if (filteredClaims.value.length === 0) return

  const dataToExport = filteredClaims.value.map(c => ({
    'No SEP': c.noSEP,
    'Tgl Pulang': c.tglPulang,
    'Nama Pasien': c.peserta?.nama || '-',
    'No MR': c.peserta?.noMR || '-',
    'Poli': c.poli || '-',
    'Kelas': c.kelasRawat || '-',
    'Dokter DPJP': c.dokter?.nama || '-',
    'Kode INACBG': c.Inacbg?.kode || '-',
    'Nama INACBG': c.Inacbg?.nama || '-',
    'Tarif RS': parseFloat(c.biaya?.byTarifRS || 0),
    'Biaya Pengajuan': parseFloat(c.biaya?.byPengajuan || 0),
    'Biaya Disetujui': parseFloat(c.biaya?.bySetujui || 0),
    'Status': c.status
  }))

  const worksheet = XLSX.utils.json_to_sheet(dataToExport)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Monitoring Klaim')

  // Filename formatting
  const period = filters.isYearlyMode 
    ? filters.tahun 
    : `${months[filters.bulan-1]}_${filters.tahun}`
  const service = filters.jenis_pelayanan === '1' ? 'Ranap' : 'Rajal'
  const filename = `Monitoring_Klaim_${service}_${period}.xlsx`

  XLSX.writeFile(workbook, filename)
}

onMounted(() => {
  fetchDoctors()
  fetchData()
})
</script>

<style scoped>
.monitoring-klaim-container {
  max-width: 1400px;
  margin: 0 auto;
}

.filters-card {
  position: relative;
  z-index: 100; /* Ensure dropdowns are above following sections */
}

.brand-gradient {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.btn-glass-success {
  background: rgba(16, 185, 129, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0 1.25rem;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-glass-success:hover {
  background: rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

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
}

.header-icon-bg i {
  font-size: 1.5rem;
}

.tracking-tight { letter-spacing: -0.025em; }

/* Mode Pill Button */
.mode-toggle-group {
  display: inline-flex;
}
.mode-pill-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  padding: 0 1.5rem;
  height: 38px;
  border-radius: 50rem;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.mode-pill-btn.active {
  background: #ffffff;
  color: #1e3a8a;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* Modern Select Styles */
.modern-select {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.2s;
  cursor: pointer;
}

.modern-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.w-40 { width: 40%; }
.w-60 { width: 60%; }

/* Segmented Control */
.segmented-control {
  height: 40px;
}
.seg-btn {
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}
.seg-btn.active {
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

/* Modern V-Select Alt */
.modern-v-select-alt {
  border-radius: 10px !important;
  background-color: #fff;
  transition: all 0.3s;
}

.modern-v-select-alt :deep(.vs__dropdown-toggle) {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  height: 40px;
  padding: 0 4px;
  background: transparent;
  transition: all 0.2s;
}

.modern-v-select-alt:focus-within {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.modern-v-select-alt:focus-within :deep(.vs__dropdown-toggle) {
  border-color: #3b82f6;
}

.modern-v-select-alt :deep(.vs__selected) {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e3a8a;
}
.modern-v-select-alt :deep(.vs__search::placeholder) {
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Action Area */
.btn-premium-action {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border: none;
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 0.78rem;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.btn-premium-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.4);
  filter: brightness(1.05);
}

.btn-soft-success {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  font-weight: 800;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  transition: all 0.3s;
}

.btn-soft-success:hover {
  background-color: #dcfce7;
  color: #15803d;
  transform: translateY(-1px);
}

.modern-input-group-premium {
  border: 1px solid #e2e8f0;
  background: #fff;
  transition: all 0.3s;
}
.modern-input-group-premium:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}

@keyframes pulseGentle {
  0% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3); }
  50% { transform: scale(1.01); box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.4); }
  100% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3); }
}
.animate-pulse-gentle:hover:not(:disabled) {
  animation: pulseGentle 2s infinite ease-in-out;
}

.filter-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
}

/* Stat Cards */
.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  z-index: 1;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-progress {
  height: 4px;
  background-color: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
}

.bg-blue-subtle { background-color: #eff6ff; }
.bg-orange-subtle { background-color: #fff7ed; color: #f97316; }
.text-orange { color: #f97316; }
.bg-orange { background-color: #f97316; }
.bg-indigo-subtle { background-color: #eef2ff; }
.text-indigo { color: #4f46e5; }
.bg-indigo { background-color: #4f46e5; }
.bg-green-subtle { background-color: #f0fdf4; }

/* Table Styles */
.premium-thead th {
  background-color: #f8fafc;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #475569;
  font-weight: 800;
  padding: 1.25rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.premium-count-badge {
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
}

.header-accent-line {
  width: 4px;
  height: 24px;
  background: #3b82f6;
  border-radius: 2px;
}

/* Modern Pagination Premium */
.pagination-premium {
  list-style: none;
  padding: 0;
  display: flex;
  align-items: center;
}

.pag-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.pag-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.pag-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.curr-page-indicator {
  background: #f1f5f9;
  padding: 0 1.25rem;
  height: 36px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.styled-table td {
  padding: 1.25rem 0.75rem;
  color: #334155;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
}

.text-xs { font-size: 0.75rem; }
.fw-medium { font-weight: 500; }

.card-title-sm {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.02em;
}

/* Animation utilities */
.animate__animated {
  animation-duration: 0.5s;
}

/* Scrollbar styling for table container */
.table-responsive::-webkit-scrollbar {
  height: 6px;
}
.table-responsive::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.table-responsive::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Custom Tooltip for INA-CBG */
.inacbg-wrapper {
  position: relative;
  cursor: pointer;
}

.inacbg-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: #1e293b;
  color: #f8fafc;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 320px;
  min-width: 180px;
  z-index: 50;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.inacbg-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 20px;
  border: 6px solid transparent;
  border-top-color: #1e293b;
}

.inacbg-wrapper:hover .inacbg-tooltip {
  display: block;
  animation: tooltipFadeIn 0.2s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .dashboard-header h3 { font-size: 1.5rem; }
  .stat-card { padding: 1.25rem !important; }
}
</style>
