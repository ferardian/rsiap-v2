<template>
  <div class="kepatuhan-dokter-view animate__animated animate__fadeIn p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-user-md"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Kepatuhan Pelayanan Dokter</h3>
            <p class="page-subtitle mb-0 small">
              Monitoring ketepatan waktu mulai pelayanan dokter (Task ID 4 Antrean) terhadap jadwal praktek (Toleransi 60 Menit)
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Card (Top) -->
    <div class="card border-0 shadow-sm panel-card mb-4 filter-container-card">
      <div class="card-body p-4">
        <!-- Top Row: Title, Mode Pill & Export Actions -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <div class="filter-icon-badge">
              <i class="fas fa-sliders-h text-primary"></i>
            </div>
            <div>
              <h6 class="m-0 fw-bold text-dark">Filter & Parameter Laporan</h6>
              <small class="text-muted">Kustomisasi data untuk evaluasi ketepatan jadwal praktek dokter</small>
            </div>
          </div>
          
          <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- Mode Switcher Pill -->
            <div class="d-flex flex-column align-items-end">
              <div class="segmented-pill-wrapper">
                <button 
                  type="button" 
                  class="segmented-pill-btn" 
                  :class="{ active: filters.mode === 'first_patient' }"
                  @click="setMode('first_patient')"
                  title="Evaluasi jam mulai buka praktek dokter berdasarkan pasien yang dilayani paling awal di hari tersebut"
                >
                  <i class="fas fa-user-clock me-1"></i> Pasien Pertama Dilayani
                </button>
                <button 
                  type="button" 
                  class="segmented-pill-btn" 
                  :class="{ active: filters.mode === 'all' }"
                  @click="setMode('all')"
                  title="Evaluasi seluruh kunjungan pasien rawat jalan yang dilayani dokter"
                >
                  <i class="fas fa-users me-1"></i> Seluruh Pasien
                </button>
              </div>
              <small class="text-muted mt-1 d-none d-md-block" style="font-size: 0.72rem;">
                <i class="fas fa-info-circle text-primary me-1"></i>
                <span v-if="filters.mode === 'first_patient'">
                  Menilai jam buka praktek dari pasien yang diperiksa paling awal (Task ID 4 pertama).
                </span>
                <span v-else>
                  Menilai ketepatan waktu pelayanan terhadap seluruh antrean pasien yang dilayani.
                </span>
              </small>
            </div>

            <div class="vr mx-1 d-none d-md-block" style="height: 24px;"></div>

            <!-- Export Buttons -->
            <button class="btn-action-excel" @click="exportToExcel" :disabled="loading" title="Ekspor ke Excel">
              <i class="fas fa-file-excel me-1"></i> Excel
            </button>
            <button class="btn-action-pdf" @click="exportToPDF" :disabled="loading" title="Cetak ke PDF">
              <i class="fas fa-file-pdf me-1"></i> PDF
            </button>
          </div>
        </div>

        <!-- Filter Controls Grid -->
        <div class="row g-3 align-items-end">
          <!-- Periode Tanggal -->
          <div class="col-xl-3 col-lg-4 col-md-6">
            <label class="filter-label">
              <i class="far fa-calendar-alt text-primary me-1"></i> Periode Tanggal
            </label>
            <div class="input-group input-group-sm modern-date-group">
              <input 
                v-model="filters.start_date" 
                type="date" 
                class="form-control form-control-sm modern-input" 
                @change="handleFilterChange"
              />
              <span class="input-group-text bg-light text-muted px-2 border-start-0 border-end-0">s/d</span>
              <input 
                v-model="filters.end_date" 
                type="date" 
                class="form-control form-control-sm modern-input" 
                @change="handleFilterChange"
              />
            </div>
          </div>

          <!-- Poliklinik -->
          <div class="col-xl-2 col-lg-4 col-md-6">
            <label class="filter-label">
              <i class="fas fa-hospital text-primary me-1"></i> Poliklinik
            </label>
            <select v-model="filters.kd_poli" class="form-select form-select-sm modern-select" @change="handleFilterChange">
              <option value="">Semua Poliklinik</option>
              <option v-for="poli in poliklinikList" :key="poli.kd_poli" :value="poli.kd_poli">
                {{ poli.nm_poli }}
              </option>
            </select>
          </div>

          <!-- Dokter -->
          <div class="col-xl-3 col-lg-4 col-md-6">
            <label class="filter-label">
              <i class="fas fa-user-md text-primary me-1"></i> Dokter Spesialis
            </label>
            <select v-model="filters.kd_dokter" class="form-select form-select-sm modern-select" @change="handleFilterChange">
              <option value="">Semua Dokter</option>
              <option v-for="dr in dokterList" :key="dr.kd_dokter" :value="dr.kd_dokter">
                {{ dr.nm_dokter }}
              </option>
            </select>
          </div>

          <!-- Status Kepatuhan -->
          <div class="col-xl-2 col-lg-6 col-md-6">
            <label class="filter-label">
              <i class="fas fa-shield-alt text-primary me-1"></i> Status Kepatuhan
            </label>
            <select v-model="filters.status" class="form-select form-select-sm modern-select" @change="handleFilterChange">
              <option value="all">Semua Status</option>
              <option value="patuh">🟢 Patuh (≤ 60 Menit)</option>
              <option value="tidak_patuh">🔴 Tidak Patuh (> 60 Menit)</option>
            </select>
          </div>

          <!-- Search Input -->
          <div class="col-xl-2 col-lg-6 col-md-12">
            <label class="filter-label">
              <i class="fas fa-search text-primary me-1"></i> Pencarian
            </label>
            <div class="input-group input-group-sm">
              <input 
                v-model="filters.search" 
                type="text" 
                class="form-control form-control-sm modern-input" 
                placeholder="RM / Pasien / Dokter..." 
                @input="handleSearch"
              />
              <button 
                v-if="filters.search" 
                class="btn btn-outline-secondary btn-sm" 
                type="button" 
                @click="clearSearch"
                title="Hapus pencarian"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview Stats Block -->
    <div class="row g-4 mb-4">
      <!-- Total Pelayanan / Jadwal -->
      <div class="col-xl-3 col-md-6">
        <div class="kpi-card shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-primary-light">
              <i class="fas fa-calendar-check text-primary"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">
                {{ filters.mode === 'first_patient' ? 'Total Jadwal Praktek' : 'Total Pasien Dilayani' }}
              </span>
              <h2 class="kpi-value fw-black text-dark m-0">{{ stats?.overall?.total || 0 }}</h2>
              <small class="text-muted">
                {{ filters.mode === 'first_patient' ? 'Jadwal praktek dokter dievaluasi' : 'Kunjungan pasien dengan Task ID 4' }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Sesuai / Patuh (<= 60 Menit) -->
      <div class="col-xl-3 col-md-6">
        <div class="kpi-card shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-success-light">
              <i class="fas fa-check-double text-success"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Patuh (≤ 60 Menit)</span>
              <h2 class="kpi-value fw-black text-success m-0">{{ stats?.overall?.patuh || 0 }}</h2>
              <small class="text-muted">Mulai tepat waktu / toleransi ≤60 mnt</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tidak Sesuai (> 60 Menit) -->
      <div class="col-xl-3 col-md-6">
        <div class="kpi-card shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-danger-light">
              <i class="fas fa-exclamation-triangle text-danger"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Tidak Patuh (> 60 Menit)</span>
              <h2 class="kpi-value fw-black text-danger m-0">{{ stats?.overall?.tidak_patuh || 0 }}</h2>
              <small class="text-muted">Terlambat mulai melebihi 60 mnt</small>
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
              <div class="d-flex justify-content-between align-items-center">
                <span class="kpi-title text-muted fw-bold">Capaian Kepatuhan</span>
                <span class="badge bg-light text-secondary border small">
                  Rata-rata: {{ stats?.overall?.avg_selisih_menit || 0 }} mnt
                </span>
              </div>
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
          <div class="panel-header pt-4 px-4 d-flex justify-content-between align-items-center">
            <h5 class="m-0 fw-bold text-dark">
              <i class="fas fa-chart-line text-primary me-2"></i>Tren Kepatuhan Pelayanan Harian (%)
            </h5>
            <small class="text-muted">Standar Toleransi: ≤ 60 Menit</small>
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
            <h5 class="m-0 fw-bold text-dark">
              <i class="fas fa-chart-pie text-info me-2"></i>Distribusi Kepatuhan Pelayanan
            </h5>
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
          <div>
            <h5 class="m-0 fw-bold text-dark">
              <i class="fas fa-stethoscope text-primary me-2"></i>Daftar Kepatuhan Pelayanan Dokter
            </h5>
            <small class="text-muted">Perbandingan jam mulai praktek jadwal dokter dengan jam mulai pelayanan (Task ID 4)</small>
          </div>
        </div>

        <!-- Clinic & Doctor Rankings Block -->
        <div class="row g-4 mb-4">
          <!-- Top Clinic Performance -->
          <div class="col-lg-6">
            <div class="card border border-light shadow-none bg-light-subtle h-100">
              <div class="card-header bg-transparent border-0 pt-3 px-3">
                <h6 class="m-0 fw-bold text-dark">
                  <i class="fas fa-hospital text-primary me-2"></i>Kepatuhan per Poliklinik
                </h6>
              </div>
              <div class="card-body p-3 scrollable-ranking">
                <div v-if="stats?.poliklinik && stats.poliklinik.length > 0">
                  <div v-for="poli in stats.poliklinik" :key="poli.kd_poli" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small fw-semibold text-secondary">{{ poli.nm_poli }}</span>
                      <span class="small fw-bold text-dark">
                        {{ getPoliRate(poli) }}% 
                        <small class="text-muted">({{ poli.patuh }}/{{ poli.total }} {{ unitLabel }} | Rata-rata: {{ poli.avg_selisih_menit }} mnt)</small>
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
                <h6 class="m-0 fw-bold text-dark">
                  <i class="fas fa-user-md text-info me-2"></i>Kepatuhan per Dokter
                </h6>
              </div>
              <div class="card-body p-3 scrollable-ranking">
                <div v-if="stats?.dokter && stats.dokter.length > 0">
                  <div v-for="dr in stats.dokter.slice(0, 10)" :key="dr.kd_dokter" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="small fw-semibold text-secondary">{{ dr.nm_dokter }}</span>
                      <span class="small fw-bold text-dark">
                        {{ getDokterRate(dr) }}% 
                        <small class="text-muted">({{ dr.patuh }}/{{ dr.total }} {{ unitLabel }} | Rata-rata: {{ dr.avg_selisih_menit }} mnt)</small>
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
        <div class="table-responsive premium-table balanced-table">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr class="table-light-header">
                <th width="45" class="text-center">No</th>
                <th style="min-width: 125px;">No. Rawat & RM</th>
                <th style="min-width: 155px;">Pasien & Penjamin</th>
                <th style="min-width: 130px;">Poliklinik</th>
                <th style="min-width: 175px;">Dokter Spesialis</th>
                <th style="min-width: 110px;">Jadwal Dokter</th>
                <th style="min-width: 125px;">Mulai Layanan (Task 4)</th>
                <th style="min-width: 175px;" class="text-center">Kepatuhan & Selisih</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Memuat...</span>
                  </div>
                  <div class="mt-2 text-muted small">Memuat data kepatuhan pelayanan dokter...</div>
                </td>
              </tr>
              <tr v-else-if="details.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fas fa-calendar-times fa-3x mb-3 text-secondary opacity-50"></i>
                  <p class="m-0 fw-semibold">Tidak ada data ditemukan untuk kriteria filter ini.</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in details" :key="item.no_rawat" class="balanced-row">
                <td class="text-center text-muted fw-bold">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td>
                  <div class="fw-bold text-dark font-monospace row-title">{{ item.no_rawat }}</div>
                  <span class="text-muted row-sub">RM: {{ item.no_rkm_medis }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark row-title">{{ item.nm_pasien }}</div>
                  <span class="badge bg-light text-secondary border compact-tag mt-1">{{ item.jenis_bayar || '-' }}</span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border compact-badge">{{ item.nm_poli }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark row-title">{{ item.nm_dokter }}</div>
                  <span v-if="item.is_first_patient" class="badge bg-primary-subtle text-primary border border-primary-subtle compact-tag mt-1">
                    <i class="fas fa-star text-warning me-1"></i>Pasien Pertama Dilayani
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark row-title">{{ formatTimeRange(item.jam_mulai, item.jam_selesai) }}</div>
                  <span class="text-muted row-sub">{{ item.hari_kerja }}</span>
                </td>
                <td>
                  <div class="fw-bold text-primary row-title">{{ formatTimeOnly(item.task4_waktu) }}</div>
                  <span class="text-muted row-sub">{{ formatDateOnly(item.task4_waktu) }}</span>
                </td>
                <td class="text-center">
                  <div class="d-inline-flex flex-column align-items-center">
                    <span 
                      class="badge rounded-pill status-pill-badge"
                      :class="item.is_patuh ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'"
                    >
                      <i :class="item.is_patuh ? 'fas fa-check-circle me-1' : 'fas fa-times-circle me-1'"></i>
                      {{ item.is_patuh ? 'Patuh (≤ 60m)' : 'Terlambat (> 60m)' }}
                    </span>
                    <span class="selisih-note mt-1" :class="item.is_patuh ? 'text-success' : 'text-danger'">
                      {{ formatSelisih(item.selisih_menit) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Section -->
        <div v-if="pagination.total > 0" class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
          <div class="small text-muted">
            Menampilkan {{ pagination.from || 0 }} sampai {{ pagination.to || 0 }} dari {{ pagination.total }} data
          </div>
          <div class="pagination-wrapper d-flex gap-1 align-items-center">
            <button 
              class="btn-page" 
              :disabled="pagination.current_page === 1"
              @click="changePage(pagination.current_page - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <div class="d-flex gap-1">
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
import { kepatuhanPelayananDokterService } from '@/services/kepatuhanPelayananDokterService'
import poliklinikService from '@/services/poliklinikService'
import { dokterService } from '@/services/dokterService'
import VueApexCharts from 'vue3-apexcharts'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import pdfHeader from '@/assets/pdf-header.png'
import pdfFooter from '@/assets/pdf-footer.png'

const toast = useToast()
const loading = ref(false)

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// Dropdown lists
const poliklinikList = ref([])
const dokterList = ref([])

// Statistical summaries & details list
const stats = ref({
  overall: { total: 0, patuh: 0, tidak_patuh: 0, avg_selisih_menit: 0 },
  daily_trend: [],
  poliklinik: [],
  dokter: []
})
const details = ref([])

// Pagination
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
  from: 0,
  to: 0
})

// Current month defaults
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

const formatDateForInput = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const filters = reactive({
  start_date: formatDateForInput(firstDay),
  end_date: formatDateForInput(lastDay),
  kd_poli: '',
  kd_dokter: '',
  status: 'all',
  mode: 'first_patient', // 'first_patient' or 'all'
  search: ''
})

const setMode = (modeVal) => {
  filters.mode = modeVal
  handleFilterChange()
}

// Compliance Percentage Computed
const compliancePercentage = computed(() => {
  const total = Number(stats.value?.overall?.total) || 0
  const patuh = Number(stats.value?.overall?.patuh) || 0
  if (total === 0) return 0
  return Math.round((patuh / total) * 100)
})

const unitLabel = computed(() => filters.mode === 'first_patient' ? 'Jadwal Praktek' : 'Pasien')

// Chart configurations: Donut
const donutChartSeries = computed(() => {
  const patuh = Number(stats.value?.overall?.patuh) || 0
  const tidakPatuh = Number(stats.value?.overall?.tidak_patuh) || 0
  return [patuh, tidakPatuh]
})

const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif'
  },
  labels: ['Patuh (≤ 60 Menit)', 'Tidak Patuh (> 60 Menit)'],
  colors: ['#10b981', '#ef4444'],
  legend: {
    position: 'bottom',
    fontSize: '12px',
    markers: { radius: 12 }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: filters.mode === 'first_patient' ? 'Total Jadwal' : 'Total Pasien',
            formatter: () => stats.value?.overall?.total || 0
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
        return Math.round((Number(item.patuh) / Number(item.total)) * 100)
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
  colors: ['#0d6efd'],
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
    poliklinikList.value = poliklinikRes.data.data || poliklinikRes.data || []
    dokterList.value = dokterRes.data.data || dokterRes.data || []
  } catch (error) {
    console.error('Gagal mengambil referensi filter:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      status: filters.status,
      mode: filters.mode,
      search: filters.search.trim(),
      page: pagination.value.current_page,
      limit: pagination.value.per_page
    }

    const [statsRes, detailsRes] = await Promise.all([
      kepatuhanPelayananDokterService.getStats(params),
      kepatuhanPelayananDokterService.getDetails(params)
    ])

    if (statsRes?.data?.data) {
      stats.value = statsRes.data.data
    }

    if (detailsRes?.data?.data) {
      const resp = detailsRes.data.data
      details.value = resp.data || []
      pagination.value = {
        current_page: resp.current_page,
        last_page: resp.last_page,
        per_page: resp.per_page,
        total: resp.total,
        from: resp.from,
        to: resp.to
      }
    }
  } catch (error) {
    console.error('Gagal memuat data kepatuhan:', error)
    toast.error('Gagal memuat data kepatuhan pelayanan dokter')
  } finally {
    loading.value = false
  }
}

let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.current_page = 1
    fetchData()
  }, 400)
}

const clearSearch = () => {
  filters.search = ''
  pagination.value.current_page = 1
  fetchData()
}

const handleFilterChange = () => {
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  pagination.value.current_page = page
  fetchData()
}

const getPoliRate = (poli) => {
  if (!poli.total) return 0
  return Math.round((Number(poli.patuh) / Number(poli.total)) * 100)
}

const getDokterRate = (dr) => {
  if (!dr.total) return 0
  return Math.round((Number(dr.patuh) / Number(dr.total)) * 100)
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
  if (!dateStr || dateStr === '0000-00-00 00:00:00' || dateStr === '0000-00-00') return '-'
  const dStr = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr
  const parts = dStr.split('-')
  if (parts.length === 3) {
    const year = parts[0]
    const monthIdx = parseInt(parts[1], 10) - 1
    const day = parts[2]
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return `${day} ${months[monthIdx] || parts[1]} ${year}`
  }
  return dateStr
}

const formatTimeOnly = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return '-'
  if (dateStr.includes(' ')) {
    return dateStr.split(' ')[1].substring(0, 8)
  }
  return dateStr
}

const formatDateTime = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return '-'
  const parts = dateStr.split(' ')
  if (parts.length < 2) return dateStr
  
  const dateParts = parts[0].split('-')
  const timeParts = parts[1].split(':')
  if (dateParts.length < 3 || timeParts.length < 2) return dateStr
  
  const year = dateParts[0]
  const monthIdx = parseInt(dateParts[1], 10) - 1
  const day = dateParts[2]
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  const monthName = months[monthIdx] || dateParts[1]
  
  const hours = timeParts[0]
  const minutes = timeParts[1]
  const seconds = timeParts[2] ? timeParts[2].substring(0, 2) : '00'
  
  return `${day} ${monthName} ${year} ${hours}:${minutes}:${seconds}`
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  return `${dateObj.getDate()} ${dateObj.toLocaleDateString('id-ID', { month: 'short' })}`
}

const formatSelisih = (minutes) => {
  if (minutes === 0) return 'Tepat Waktu'
  if (minutes < 0) return `${Math.abs(minutes)} mnt lebih awal`
  return `+${minutes} mnt dari jadwal`
}

const getSelisihBadgeClass = (minutes, isPatuh) => {
  if (minutes <= 0) return 'bg-info-subtle text-info border border-info-subtle'
  if (isPatuh) return 'bg-success-subtle text-success border border-success-subtle'
  return 'bg-danger-subtle text-danger border border-danger-subtle'
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
      mode: filters.mode,
      limit: 2000
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    
    toast.info('Menyiapkan berkas Excel...')
    const res = await kepatuhanPelayananDokterService.getDetails(params)
    const exportData = res.data?.data?.data || []

    if (!exportData.length) {
      toast.warning('Tidak ada data yang dapat diekspor!')
      return
    }

    const rows = exportData.map((item, idx) => ({
      'No': idx + 1,
      'No. Rawat': item.no_rawat,
      'No. RM': item.no_rkm_medis,
      'Nama Pasien': item.nm_pasien,
      'Jenis Bayar': item.jenis_bayar || '-',
      'Poliklinik': item.nm_poli,
      'Dokter': item.nm_dokter,
      'Hari': item.hari_kerja,
      'Jadwal Mulai': item.jam_mulai,
      'Jadwal Selesai': item.jam_selesai,
      'Mulai Layanan (Task 4)': item.task4_waktu || '-',
      'Selisih (Menit)': item.selisih_menit,
      'Kategori Pasien': item.is_first_patient ? 'Pasien Pertama Dilayani (Buka Praktek)' : 'Pasien Kunjungan',
      'Status Kepatuhan': item.is_patuh ? 'Patuh (≤ 60 Menit)' : 'Tidak Patuh (> 60 Menit)'
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kepatuhan Pelayanan Dokter')

    const filename = `Kepatuhan_Pelayanan_Dokter_${filters.start_date}_sd_${filters.end_date}.xlsx`
    XLSX.writeFile(workbook, filename)
    toast.success('Laporan Excel berhasil diunduh')
  } catch (err) {
    console.error('Export Excel gagal:', err)
    toast.error('Gagal mengekspor laporan Excel')
  }
}

// Export PDF
const exportToPDF = async () => {
  try {
    toast.info('Menyiapkan dokumen PDF...')
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      status: filters.status,
      mode: filters.mode,
      limit: 1000
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }

    const res = await kepatuhanPelayananDokterService.getDetails(params)
    const exportData = res.data?.data?.data || []

    if (!exportData.length) {
      toast.warning('Tidak ada data untuk dicetak!')
      return
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const [headerImg, footerImg] = await Promise.all([
      loadImage(pdfHeader),
      loadImage(pdfFooter)
    ])

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Add Header Image
    if (headerImg) {
      const headerHeight = (headerImg.height * pageWidth) / headerImg.width
      doc.addImage(headerImg, 'PNG', 0, 0, pageWidth, headerHeight)
    }

    // Document Title
    let currentY = 38
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('LAPORAN KEPATUHAN PELAYANAN DOKTER RAWAT JALAN', pageWidth / 2, currentY, { align: 'center' })

    currentY += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const modeLabel = filters.mode === 'first_patient' ? 'Pasien Pertama Dilayani (Buka Praktek)' : 'Seluruh Pasien'
    doc.text(`Periode: ${formatDateOnly(filters.start_date)} s/d ${formatDateOnly(filters.end_date)} | Mode: ${modeLabel}`, pageWidth / 2, currentY, { align: 'center' })

    // Summary Box
    currentY += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    const summaryText = `Total: ${stats.value?.overall?.total || 0} ${unitLabel.value} | Patuh: ${stats.value?.overall?.patuh || 0} (${compliancePercentage.value}%) | Terlambat: ${stats.value?.overall?.tidak_patuh || 0} | Rata-rata Mulai: ${stats.value?.overall?.avg_selisih_menit || 0} menit`
    doc.text(summaryText, pageWidth / 2, currentY, { align: 'center' })

    const tableColumns = [
      { header: 'No', dataKey: 'no' },
      { header: 'No. Rawat', dataKey: 'no_rawat' },
      { header: 'Pasien & RM', dataKey: 'pasien' },
      { header: 'Poliklinik', dataKey: 'poli' },
      { header: 'Dokter Spesialis', dataKey: 'dokter' },
      { header: 'Jadwal Dokter', dataKey: 'jadwal' },
      { header: 'Task 4 (Mulai)', dataKey: 'task4' },
      { header: 'Kepatuhan & Selisih', dataKey: 'status' }
    ]

    const tableRows = exportData.map((item, idx) => ({
      no: idx + 1,
      no_rawat: item.no_rawat,
      pasien: `${item.nm_pasien} (${item.no_rkm_medis})`,
      poli: item.nm_poli,
      dokter: item.nm_dokter,
      jadwal: `${item.jam_mulai ? item.jam_mulai.substring(0, 5) : '-'} - ${item.jam_selesai ? item.jam_selesai.substring(0, 5) : '-'} (${item.hari_kerja || ''})`,
      task4: item.task4_waktu ? `${item.task4_waktu.substring(11, 16)}` : '-',
      status: `${item.is_patuh ? 'Patuh' : 'Terlambat'} (${formatSelisih(item.selisih_menit)})`
    }))

    autoTable(doc, {
      startY: currentY + 4,
      columns: tableColumns,
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [13, 110, 253],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        no: { halign: 'center', cellWidth: 10 },
        no_rawat: { cellWidth: 32 },
        jadwal: { halign: 'center', cellWidth: 25 },
        task4: { halign: 'center', cellWidth: 25 },
        selisih: { halign: 'center', cellWidth: 28 },
        status: { halign: 'center', cellWidth: 30 }
      },
      didDrawPage: (data) => {
        if (footerImg) {
          const footerHeight = (footerImg.height * pageWidth) / footerImg.width
          doc.addImage(footerImg, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight)
        }
      },
      margin: { top: 40, bottom: 25, left: 10, right: 10 }
    })

    const filename = `Kepatuhan_Pelayanan_Dokter_${filters.start_date}_sd_${filters.end_date}.pdf`
    doc.save(filename)
    toast.success('Laporan PDF berhasil diunduh')
  } catch (err) {
    console.error('Export PDF error:', err)
    toast.error('Gagal mencetak PDF')
  }
}

onMounted(() => {
  loadFilterOptions()
  fetchData()
})
</script>

<style scoped>
.kepatuhan-dokter-view {
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
}

.page-title {
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: #64748b;
}

.panel-card {
  border-radius: 14px;
  background: #ffffff;
}

.kpi-card {
  border-radius: 14px;
  background: #ffffff;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05) !important;
}

.kpi-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.bg-primary-light { background-color: #eff6ff; }
.bg-success-light { background-color: #ecfdf5; }
.bg-danger-light { background-color: #fef2f2; }
.bg-info-light { background-color: #f0fdf4; }

.kpi-value {
  font-size: 1.8rem;
  line-height: 1.1;
}

.filter-container-card {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
}

.filter-icon-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #0d6efd;
}

.filter-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 5px;
  letter-spacing: 0.01em;
}

.segmented-pill-wrapper {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 3px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
}

.segmented-pill-btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.segmented-pill-btn:hover {
  color: #1e293b;
}

.segmented-pill-btn.active {
  background-color: #0d6efd;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.28);
}

.modern-input,
.modern-select {
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  font-size: 0.82rem;
  color: #1e293b;
  background-color: #ffffff;
  padding: 0 10px;
  transition: all 0.2s ease;
}

.modern-input:focus,
.modern-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
  outline: none;
}

.modern-date-group .modern-input:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.modern-date-group .modern-input:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.btn-action-excel,
.btn-action-pdf {
  height: 34px;
  padding: 0 14px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-excel {
  background-color: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}

.btn-action-excel:hover:not(:disabled) {
  background-color: #059669;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.2);
}

.btn-action-pdf {
  background-color: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.btn-action-pdf:hover:not(:disabled) {
  background-color: #dc2626;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(220, 38, 38, 0.2);
}

.btn-action-excel:disabled,
.btn-action-pdf:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scrollable-ranking {
  max-height: 250px;
  overflow-y: auto;
}

.balanced-table {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  background-color: #ffffff;
}

.balanced-table .table-light-header th {
  background-color: #f8fafc !important;
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 0.76rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  border-bottom: 2px solid #e2e8f0 !important;
  padding: 10px 12px !important;
  white-space: nowrap;
}

.balanced-table .table-light-header th:first-child,
.balanced-row td:first-child {
  padding-left: 16px !important;
}

.balanced-table .table-light-header th:last-child,
.balanced-row td:last-child {
  padding-right: 20px !important;
}

.balanced-row td {
  padding: 10px 12px !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #f1f5f9;
}

.balanced-row:hover {
  background-color: #f8fafc !important;
}

.row-title {
  font-size: 0.82rem !important;
  line-height: 1.35;
}

.row-sub {
  font-size: 0.72rem !important;
  line-height: 1.25;
  display: block;
}

.compact-tag {
  font-size: 0.68rem !important;
  font-weight: 600;
  padding: 2px 6px !important;
  border-radius: 4px;
}

.compact-badge {
  font-size: 0.75rem !important;
  font-weight: 500;
  padding: 3px 8px !important;
  border-radius: 6px;
}

.status-pill-badge {
  font-size: 0.74rem !important;
  font-weight: 600;
  padding: 4px 10px !important;
  white-space: nowrap;
}

.selisih-note {
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.btn-page,
.btn-page-number {
  min-width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 0.82rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled),
.btn-page-number:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-page-number.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
  font-weight: bold;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
