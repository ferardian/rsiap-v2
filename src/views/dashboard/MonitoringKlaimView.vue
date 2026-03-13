<template>
  <div class="monitoring-klaim-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="dashboard-header brand-gradient shadow-lg rounded-4 p-4 mb-4 text-white">
      <div class="row align-items-center">
        <div class="col-md-7">
          <div class="d-flex align-items-center mb-2">
            <div class="header-icon-bg me-3 glass-effect">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <h3 class="mb-0 fw-bold tracking-tight">Monitoring Klaim BPJS</h3>
              <p class="mb-0 opacity-75">Statistik Pengajuan dan Status Klaim (Data Internal tersinkronisasi)</p>
            </div>
          </div>
        </div>

        <!-- Mode Toggle -->
        <div class="col-md-5 mt-3 mt-md-0 d-flex justify-content-md-end">
          <div class="mode-toggle-group glass-effect rounded-pill p-1">
            <button 
              @click="setYearlyMode(true)" 
              :class="['mode-pill-btn', { active: filters.isYearlyMode }]"
            >
              <i class="fas fa-calendar-alt me-1"></i> Tahun
            </button>
            <button 
              @click="setYearlyMode(false)" 
              :class="['mode-pill-btn', { active: !filters.isYearlyMode }]"
            >
              <i class="fas fa-calendar-day me-1"></i> Bulan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
      <div class="card-body p-3 bg-light">
        <div class="row g-3 align-items-end">
          <template v-if="!filters.isYearlyMode">
            <div class="col-md-2">
              <label class="filter-label">Bulan</label>
              <select class="form-select form-select-sm rounded-3 border-0 shadow-sm" v-model="filters.bulan">
                <option v-for="(m, idx) in months" :key="idx" :value="idx+1">{{ m }}</option>
              </select>
            </div>
          </template>
          
          <div class="col-md-2" :class="{'col-md-3': filters.isYearlyMode}">
            <label class="filter-label">Tahun</label>
            <select class="form-select form-select-sm rounded-3 border-0 shadow-sm" v-model="filters.tahun">
              <option v-for="y in yearRange" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label class="filter-label">Jenis Pelayanan</label>
            <select class="form-select form-select-sm rounded-3 border-0 shadow-sm" v-model="filters.jenis_pelayanan">
              <option value="1">Rawat Inap</option>
              <option value="2">Rawat Jalan</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="filter-label">Status Klaim</label>
            <select class="form-select form-select-sm rounded-3 border-0 shadow-sm" v-model="filters.status_klaim">
              <option value="all">Semua Status</option>
              <option value="1">Proses Verifikasi</option>
              <option value="2">Pending Verifikasi</option>
              <option value="3">Klaim (Lolos)</option>
            </select>
          </div>

          <div class="col-md-3 ms-auto d-flex gap-2 justify-content-end">
            <button v-if="!filters.isYearlyMode" class="btn btn-outline-success btn-sm rounded-3 px-3 shadow-sm" @click="syncData" :disabled="syncing" title="Tarik Data Terbaru dari BPJS">
              <i v-if="syncing" class="spinner-border spinner-border-sm me-1"></i>
              <i v-else class="fas fa-sync-alt me-1"></i>
              Sync BPJS
            </button>
            <button class="btn btn-primary btn-sm rounded-3 px-4 shadow-sm" @click="fetchData" :disabled="loading || syncing">
              <i v-if="loading" class="spinner-border spinner-border-sm me-1"></i>
              <i v-else class="fas fa-search me-1"></i>
              TAMPILKAN
            </button>
          </div>
        </div>
        
        <div v-if="!filters.isYearlyMode" class="alert alert-info py-2 px-3 mt-3 mb-0 text-sm border-0 shadow-sm d-flex align-items-center gap-2">
          <i class="fas fa-info-circle"></i>
          <span>Data ditarik dari sinkronisasi internal yang dijalankan oleh IT, menampilkan riwayat lengkap klaim Anda tanpa batasan API BPJS. Jika butuh data terbaru, klik tombol <span class="badge bg-success ms-1"><i class="fas fa-sync-alt"></i> Sync BPJS</span></span>
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
        <div v-if="filters.isYearlyMode && chartSeries.length > 0" class="col-lg-8 mb-4 mb-lg-0">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 class="card-title-sm mb-4">Tren Biaya Klaim {{ filters.tahun }}</h5>
            <div style="height: 300px;">
              <apexchart type="area" height="100%" :options="areaChartOptions" :series="chartSeries"></apexchart>
            </div>
          </div>
        </div>

        <div :class="[filters.isYearlyMode ? 'col-lg-4' : 'col-lg-12']">
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
        <div class="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center">
          <h6 class="mb-0 fw-bold"><i class="fas fa-list me-2 text-primary"></i>Rincian Berkas SEP</h6>
          <div class="d-flex align-items-center gap-3">
            <div v-if="syncSuccessMessage" class="text-success small fw-bold animate__animated animate__fadeIn">
              <i class="fas fa-check-circle me-1"></i> {{ syncSuccessMessage }}
            </div>
            <span class="badge bg-primary rounded-pill">{{ filteredClaims.length }} Data Tersedia</span>
          </div>
        </div>
        
        <div class="p-3 bg-light border-bottom d-flex gap-3 align-items-center">
          <div class="input-group input-group-sm" style="max-width: 300px;">
            <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
            <input type="text" class="form-control border-start-0" placeholder="Cari SEP, Pasien, atau INACBG..." v-model="searchQuery">
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0 styled-table align-middle">
            <thead class="table-light">
              <tr>
                <th class="ps-4">No SEP & Rincian</th>
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
        
        <!-- Pagination -->
        <div v-if="filteredClaims.length > itemsPerPage" class="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span class="text-muted small">Menampilkan {{ paginationStart + 1 }} - {{ Math.min(paginationEnd, filteredClaims.length) }} dari {{ filteredClaims.length }}</span>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link shadow-sm border-0" @click="currentPage--"><i class="fas fa-chevron-left"></i></button>
            </li>
            <li class="page-item disabled">
              <span class="page-link border-0 text-dark fw-bold">{{ currentPage }} / {{ totalPages }}</span>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link shadow-sm border-0" @click="currentPage++"><i class="fas fa-chevron-right"></i></button>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import bpjsVclaimService from '@/services/bpjsVclaimService'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

// State
const loading = ref(false)
const syncing = ref(false)
const dataLoaded = ref(false)
const error = ref(null)
const syncSuccessMessage = ref('')
const claimsData = ref([])
const monthlyAggregates = ref([]) // For yearly mode chart
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
  status_klaim: "all" // all=Semua Status
})

// Computed Formats
const formatRupiah = (angka) => {
  if (!angka) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

const getStatusBadge = (status) => {
  if (status.includes('Proses')) return 'bg-warning text-dark'
  if (status.includes('Pending')) return 'bg-danger'
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
           (c.Inacbg?.kode || '').toLowerCase().includes(q)
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

// Actions
const setYearlyMode = (val) => {
  filters.isYearlyMode = val
  fetchData()
}

const syncData = async () => {
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.monitoring-klaim-container {
  max-width: 1400px;
  margin: 0 auto;
}

.brand-gradient {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.header-icon-bg {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  border-radius: 16px; /* Squircle look for more modern feel */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.header-icon-bg:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.3);
}

.header-icon-bg i {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
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
  padding: 0.4rem 1.2rem;
  border-radius: 50rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}
.mode-pill-btn.active {
  background: #ffffff;
  color: #1e3a8a;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}
.mode-pill-btn:hover:not(.active) { color: #ffffff; }

/* Filter Labels */
.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
  letter-spacing: 0.5px;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
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
.styled-table th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  font-weight: 600;
  border-bottom-width: 2px;
}

.styled-table td {
  padding: 1rem 0.75rem;
  color: #334155;
  font-size: 0.9rem;
}

.text-xs { font-size: 0.75rem; }
.fw-medium { font-weight: 500; }

.card-title-sm {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
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
