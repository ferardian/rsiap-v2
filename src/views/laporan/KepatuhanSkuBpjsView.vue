<template>
  <div class="kepatuhan-sku-bpjs-view animate__animated animate__fadeIn p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-file-medical text-primary"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Kepatuhan Penerbitan SKU BPJS</h3>
            <p class="page-subtitle mb-0 small">Laporan monitoring kepatuhan surat kontrol ulang pasien BPJS baik Rawat Jalan dan Rawat Inap</p>
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
          
          <div class="d-flex flex-wrap gap-2 align-items-center w-100-mobile">
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

            <!-- Jenis Pelayanan -->
            <select v-model="filters.jnspelayanan" class="form-select form-select-sm premium-select-filter" @change="handleFilterChange">
              <option value="all">Semua Pelayanan</option>
              <option value="1">Rawat Inap</option>
              <option value="2">Rawat Jalan</option>
            </select>

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
              <option value="patuh">Terbit SKU</option>
              <option value="tidak_patuh">Belum Terbit SKU</option>
              <option value="rujukan">Rujukan / Rujuk Balik</option>
              <option value="belum_pulang">Belum Pulang (Ranap)</option>
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
    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-4">
      <!-- Total SEP BPJS -->
      <div class="col">
        <div class="kpi-card kpi-primary shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-primary-light">
              <i class="fas fa-file-medical text-primary"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Total SEP BPJS</span>
              <h2 class="kpi-value fw-black text-dark m-0">{{ stats?.overall?.total_sep || 0 }}</h2>
              <small class="text-muted">Total seluruh kunjungan BPJS</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Wajib SKU (Total Eligible) -->
      <div class="col">
        <div class="kpi-card kpi-warning shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-warning-light">
              <i class="fas fa-clipboard-list text-warning"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Wajib SKU</span>
              <h2 class="kpi-value fw-black text-warning m-0">{{ stats?.overall?.total_eligible || 0 }}</h2>
              <div class="mt-1">
                <span class="badge bg-warning-subtle text-warning border border-warning-subtle py-1 px-2" style="font-size: 0.7rem; font-weight: 600;">
                  <i class="fas fa-info-circle me-1"></i>Excl. {{ stats?.overall?.ranap_belum_pulang || 0 }} Ranap Aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patuh / Terbit SKU -->
      <div class="col">
        <div class="kpi-card kpi-success shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-success-light">
              <i class="fas fa-check-circle text-success"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Terbit SKU (Patuh)</span>
              <h2 class="kpi-value fw-black text-success m-0">{{ stats?.overall?.patuh || 0 }}</h2>
              <small class="text-muted">SKU diterbitkan tepat waktu</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tidak Patuh / Belum Terbit SKU -->
      <div class="col">
        <div class="kpi-card kpi-danger shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-danger-light">
              <i class="fas fa-times-circle text-danger"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Belum Terbit SKU</span>
              <h2 class="kpi-value fw-black text-danger m-0">{{ stats?.overall?.tidak_patuh || 0 }}</h2>
              <small class="text-muted d-block">Belum ada surat kontrol ulang</small>
              <div class="mt-1">
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1 px-2" style="font-size: 0.7rem; font-weight: 600; white-space: normal; text-align: left; display: inline-block; line-height: 1.35;">
                  <i class="fas fa-info-circle me-1"></i>Berdasarkan SEP yang tidak ada lanjutan rujuk balik / rujuk keluar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rujukan / Rujuk Balik -->
      <div class="col">
        <div class="kpi-card kpi-sky shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-info-light">
              <i class="fas fa-external-link-alt text-info"></i>
            </div>
            <div class="kpi-info">
              <span class="kpi-title text-muted fw-bold">Rujuk Keluar/Balik</span>
              <h2 class="kpi-value fw-black text-info m-0">{{ stats?.overall?.rujukan || 0 }}</h2>
              <small class="text-muted">Tidak membutuhkan SKU rumah sakit</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Persentase Kepatuhan -->
      <div class="col">
        <div class="kpi-card kpi-teal shadow-sm border-0 h-100">
          <div class="kpi-body p-4 d-flex align-items-center gap-3">
            <div class="kpi-icon-wrapper bg-teal-light">
              <i class="fas fa-percent text-teal"></i>
            </div>
            <div class="kpi-info w-100">
              <span class="kpi-title text-muted fw-bold">Tingkat Kepatuhan</span>
              <h2 class="kpi-value fw-black text-teal m-0">{{ compliancePercentage }}%</h2>
              <div class="progress mt-2" style="height: 8px; border-radius: 4px; background-color: #f1f5f9;">
                <div 
                  class="progress-bar bg-teal progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  :style="{ width: compliancePercentage + '%', boxShadow: '0 0 8px rgba(13, 148, 136, 0.4)' }"
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
            <h5 class="m-0 fw-bold text-dark"><i class="fas fa-chart-line text-primary me-2"></i>Tren Kepatuhan Penerbitan SKU (%)</h5>
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

      <!-- Donut Status Distribution -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm panel-card h-100">
          <div class="panel-header pt-4 px-4">
            <h5 class="m-0 fw-bold text-dark"><i class="fas fa-info-circle text-info me-2"></i>Distribusi Status Pasien</h5>
          </div>
          <div class="card-body p-4 d-flex flex-column align-items-center justify-content-center">
            <div v-if="(stats?.overall?.total_sep || 0) > 0" class="w-100">
              <VueApexCharts 
                type="donut" 
                height="240" 
                :options="donutChartOptions" 
                :series="donutChartSeries"
              />
            </div>
            <div v-else class="text-center py-5 text-muted">
              <i class="fas fa-chart-pie fa-3x mb-3 text-light"></i>
              <p class="m-0">Belum ada data untuk diagram status.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rankings and Detailed Table Block -->
    <div class="card border-0 shadow-sm panel-card mb-4">
      <div class="card-body p-4">
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
                        <small class="text-muted">({{ poli.patuh }}/{{ poli.total - poli.rujukan }} SKU)</small>
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
                        <small class="text-muted">({{ dr.patuh }}/{{ dr.total - dr.rujukan }} SKU)</small>
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

        <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
          <h5 class="m-0 fw-bold text-dark"><i class="fas fa-list text-primary me-2"></i>Rincian Monitoring Kepatuhan SKU</h5>
        </div>

        <!-- Detail Table -->
        <div class="table-responsive premium-table">
          <table class="table table-hover align-middle">
            <thead>
              <tr class="table-light-header">
                <th width="45" class="text-center">No</th>
                <th style="min-width: 140px;">No. SEP</th>
                <th style="min-width: 180px;">Nama Pasien</th>
                <th>Jenis Pelayanan</th>
                <th>Poliklinik</th>
                <th>Dokter</th>
                <th style="min-width: 150px;">Rencana Kontrol / Rujukan</th>
                <th style="min-width: 120px;">Tgl SEP</th>
                <th width="120" class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-5">
                  <div class="spinner-border text-primary spinner-sm mb-2" role="status"></div>
                  <div class="text-muted small">Memuat rincian data kepatuhan SKU BPJS...</div>
                </td>
              </tr>
              <tr v-else-if="details.length === 0">
                <td colspan="9" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-2x mb-2 text-light"></i>
                  <div>Tidak ada data kepatuhan SKU BPJS yang ditemukan.</div>
                </td>
              </tr>
              <tr v-for="(item, index) in details" :key="item.no_sep" class="table-row">
                <td class="text-center text-muted small">
                  {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
                </td>
                <td>
                  <code class="text-dark fw-bold" style="font-size: 0.8rem;">{{ item.no_sep }}</code>
                  <div class="text-muted small">{{ item.no_rawat }}</div>
                </td>
                <td>
                  <div class="fw-bold text-indigo" style="font-size: 0.85rem;">{{ item.nama_pasien }}</div>
                  <div class="small text-muted">{{ item.nomr }}</div>
                  <div v-if="item.nmdiagnosaawal" class="mt-1 text-secondary" style="font-size: 0.72rem; line-height: 1.35;">
                    <i class="fas fa-stethoscope text-muted me-1"></i>{{ item.nmdiagnosaawal }}
                  </div>
                </td>
                <td>
                  <span :class="['badge-pelayanan', item.jnspelayanan === '1' ? 'ranap' : 'ralan']">
                    {{ item.jnspelayanan === '1' ? 'Rawat Inap' : 'Rawat Jalan' }}
                  </span>
                  <div v-if="item.jnspelayanan === '1'" class="mt-1">
                    <span :class="['badge', item.status_compliance === 'BELUM_PULANG' ? 'bg-warning text-dark' : 'bg-success']" style="font-size: 0.65rem; padding: 2px 6px;">
                      {{ item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Sudah Pulang' }}
                    </span>
                  </div>
                </td>
                <td class="small">{{ item.nm_poli }}</td>
                <td class="small fw-semibold text-secondary">{{ item.nm_dokter }}</td>
                <td class="small">
                  <div v-if="item.status_compliance === 'PATUH'">
                    <div class="fw-bold text-dark"><i class="fas fa-file-signature text-success me-1"></i>{{ item.no_surat }}</div>
                    <span class="text-muted small">Rencana: {{ formatDateOnly(item.tgl_rencana) }}</span>
                  </div>
                  <div v-else-if="item.status_compliance === 'RUJUKAN'">
                    <div class="fw-bold text-info"><i class="fas fa-external-link-alt text-info me-1"></i>{{ item.no_rujukan }}</div>
                    <span class="text-muted small">{{ item.nm_ppkDirujuk }}</span>
                  </div>
                  <div v-else-if="item.status_compliance === 'BELUM_PULANG'" class="text-warning small fw-semibold">
                    <i class="fas fa-bed me-1"></i>Masih Dirawat
                  </div>
                  <div v-else class="text-danger small fw-semibold">
                    <i class="fas fa-exclamation-circle me-1"></i>Belum Terbit SKU
                  </div>
                </td>
                <td class="small text-muted">
                  {{ formatDateOnly(item.tglsep) }}
                </td>
                <td class="text-center">
                  <span :class="['compliance-badge', getComplianceBadgeClass(item.status_compliance)]">
                    <i :class="getComplianceBadgeIcon(item.status_compliance)"></i>
                    {{ getComplianceBadgeLabel(item.status_compliance) }}
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
import { kepatuhanSkuBpjsService } from '@/services/kepatuhanSkuBpjsService'
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

// Stats & Details State
const stats = ref({
  overall: { total_sep: 0, total_eligible: 0, patuh: 0, tidak_patuh: 0, rujukan: 0, ranap_belum_pulang: 0 },
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

// Date defaults
const today = new Date()
const formatDateToYYYYMMDD = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const defaultStartDate = formatDateToYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1))
const defaultEndDate = formatDateToYYYYMMDD(today)

// Filters State
const filters = reactive({
  start_date: defaultStartDate,
  end_date: defaultEndDate,
  jnspelayanan: 'all',
  kd_poli: '',
  kd_dokter: '',
  status: 'all',
  search: '',
  limit: 20
})

const compliancePercentage = computed(() => {
  if (!stats.value?.overall?.total_eligible) return 0
  return Math.round((stats.value.overall.patuh / stats.value.overall.total_eligible) * 100)
})

// Donut status config
const donutChartSeries = computed(() => [
  Number(stats.value?.overall?.patuh || 0),
  Number(stats.value?.overall?.tidak_patuh || 0),
  Number(stats.value?.overall?.rujukan || 0),
  Number(stats.value?.overall?.ranap_belum_pulang || 0)
])

const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif'
  },
  labels: ['Terbit SKU', 'Belum Terbit SKU', 'Rujukan / Rujuk Balik', 'Belum Pulang (Ranap)'],
  colors: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'],
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

// Trend Area Config
const trendChartSeries = computed(() => {
  if (!stats.value?.daily_trend || !stats.value.daily_trend.length) return []
  return [
    {
      name: 'Kepatuhan (%)',
      data: stats.value.daily_trend.map(item => {
        const eligible = item.total_sep - item.rujukan
        if (!eligible) return 0
        return Math.round((item.patuh / eligible) * 100)
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
  colors: ['#14b8a6'],
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
    console.error('Failed to load filter options', error)
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
      jnspelayanan: filters.jnspelayanan,
      status: filters.status
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }

    // Call stats
    const statsRes = await kepatuhanSkuBpjsService.getStats(params)
    stats.value = statsRes.data.response || statsRes.data.data

    // Call details list
    params.page = page
    params.limit = filters.limit
    const detailRes = await kepatuhanSkuBpjsService.getDetails(params)
    const resData = detailRes.data.response || detailRes.data.data
    details.value = resData.data || []
    pagination.value = {
      current_page: resData.current_page || 1,
      per_page: resData.per_page || 20,
      total: resData.total || 0,
      last_page: resData.last_page || 1
    }
  } catch (error) {
    toast.error('Gagal mengambil laporan kepatuhan SKU BPJS')
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

// Helpers
const getPoliRate = (poli) => {
  const eligible = poli.total - poli.rujukan
  if (!eligible) return 0
  return Math.round((poli.patuh / eligible) * 100)
}

const getDokterRate = (dr) => {
  const eligible = dr.total - dr.rujukan
  if (!eligible) return 0
  return Math.round((dr.patuh / eligible) * 100)
}

const getRateColorClass = (rate) => {
  if (rate >= 80) return 'bg-success'
  if (rate >= 50) return 'bg-warning'
  return 'bg-danger'
}

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const dateObj = new Date(dateStr)
  return `${dateObj.getDate()} ${dateObj.toLocaleDateString('id-ID', { month: 'short' })}`
}

const getComplianceBadgeClass = (status) => {
  if (status === 'PATUH') return 'success'
  if (status === 'RUJUKAN') return 'info'
  if (status === 'BELUM_PULANG') return 'warning'
  return 'danger'
}

const getComplianceBadgeIcon = (status) => {
  if (status === 'PATUH') return 'fas fa-check-circle me-1'
  if (status === 'RUJUKAN') return 'fas fa-external-link-alt me-1'
  if (status === 'BELUM_PULANG') return 'fas fa-bed me-1'
  return 'fas fa-times-circle me-1'
}

const getComplianceBadgeLabel = (status) => {
  if (status === 'PATUH') return 'Terbit SKU'
  if (status === 'RUJUKAN') return 'Rujukan'
  if (status === 'BELUM_PULANG') return 'Belum Pulang'
  return 'Belum Terbit'
}

// Export Excel
const exportToExcel = async () => {
  try {
    const params = {
      start_date: filters.start_date,
      end_date: filters.end_date,
      kd_poli: filters.kd_poli,
      kd_dokter: filters.kd_dokter,
      jnspelayanan: filters.jnspelayanan,
      status: filters.status,
      limit: 2000
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    
    toast.info('Menyiapkan berkas Excel...')
    const res = await kepatuhanSkuBpjsService.getDetails(params)
    const exportData = (res.data.response || res.data.data).data || []
    
    if (exportData.length === 0) {
      toast.warning('Tidak ada data untuk diexport')
      return
    }

    const wsData = exportData.map((item, index) => ({
      'No': index + 1,
      'No. SEP': item.no_sep,
      'No. Rawat': item.no_rawat,
      'No. RM': item.nomr,
      'Nama Pasien': item.nama_pasien,
      'Diagnosa SEP': item.nmdiagnosaawal || '-',
      'Jenis Pelayanan': item.jnspelayanan === '1' ? 'Rawat Inap' : 'Rawat Jalan',
      'Poliklinik': item.nm_poli,
      'Dokter': item.nm_dokter,
      'Tanggal SEP': item.tglsep,
      'No. SKU / Rujukan': item.no_surat || item.no_rujukan || '-',
      'Detail SKU / Rencana Kontrol / Rujukan': item.status_compliance === 'PATUH' 
        ? `Rencana: ${item.tgl_rencana}` 
        : (item.status_compliance === 'RUJUKAN' ? item.nm_ppkDirujuk : (item.status_compliance === 'BELUM_PULANG' ? 'Masih Dirawat' : 'Belum Terbit SKU')),
      'Status Kepatuhan': item.status_compliance === 'PATUH' 
        ? 'Terbit SKU (Patuh)' 
        : (item.status_compliance === 'RUJUKAN' ? 'Rujukan' : (item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Belum Terbit (Tidak Patuh)'))
    }))

    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Kepatuhan SKU BPJS")
    XLSX.writeFile(wb, `Laporan_Kepatuhan_SKU_BPJS_${filters.start_date}_sd_${filters.end_date}.xlsx`)
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
      jnspelayanan: filters.jnspelayanan,
      status: filters.status,
      limit: 500
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    
    toast.info('Menyiapkan berkas PDF...')
    const res = await kepatuhanSkuBpjsService.getDetails(params)
    const exportData = (res.data.response || res.data.data).data || []

    if (exportData.length === 0) {
      toast.warning('Tidak ada data untuk diexport')
      return
    }

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width || 210
    const pageHeight = doc.internal.pageSize.height || 297

    const kopHeaderImg = await loadImage(pdfHeader)
    const kopFooterImg = await loadImage(pdfFooter)

    const kopH = 28
    if (kopHeaderImg) {
      doc.addImage(kopHeaderImg, 'PNG', 0, 0, pageWidth, kopH)
    }

    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(33, 37, 41)
    doc.text('LAPORAN KEPATUHAN PENERBITAN SKU BPJS', pageWidth / 2, kopH + 10, { align: 'center' })

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(100, 116, 139)
    doc.text(`Periode Laporan: ${formatDateOnly(filters.start_date)} s.d. ${formatDateOnly(filters.end_date)}`, pageWidth / 2, kopH + 15, { align: 'center' })

    const tableData = exportData.map((item, index) => [
      index + 1,
      item.no_sep,
      item.nama_pasien + (item.nmdiagnosaawal ? `\n(Diag: ${item.nmdiagnosaawal})` : ''),
      item.jnspelayanan === '1' ? 'Inap' : 'Jalan',
      item.nm_poli,
      item.nm_dokter,
      item.status_compliance === 'PATUH' 
        ? `${item.no_surat} (${formatDateOnly(item.tgl_rencana)})` 
        : (item.status_compliance === 'RUJUKAN' ? `Rujukan: ${item.nm_ppkDirujuk}` : (item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Belum Terbit SKU')),
      item.status_compliance === 'PATUH' ? 'Terbit' : (item.status_compliance === 'RUJUKAN' ? 'Rujukan' : (item.status_compliance === 'BELUM_PULANG' ? 'Belum Pulang' : 'Belum Terbit'))
    ])

    autoTable(doc, {
      startY: kopH + 22,
      head: [['No', 'No. SEP', 'Nama Pasien', 'Layanan', 'Poli/Unit', 'Dokter', 'Keterangan SKU / Rujukan', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 32 },
        2: { cellWidth: 32 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20 },
        5: { cellWidth: 28 },
        6: { cellWidth: 40 },
        7: { cellWidth: 18 }
      },
      margin: { top: kopH + 22, bottom: 20 },
      didDrawPage: (data) => {
        if (kopFooterImg) {
          doc.addImage(kopFooterImg, 'PNG', 0, pageHeight - 16, pageWidth, 16)
        }
        
        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Halaman ${data.pageNumber} dari ${doc.internal.getNumberOfPages()}`, 
          pageWidth - 20, 
          pageHeight - 8, 
          { align: 'right' }
        )
      }
    })

    doc.save(`Kepatuhan_SKU_BPJS_${filters.start_date}_sd_${filters.end_date}.pdf`)
    toast.success('PDF berhasil di-download')
  } catch (error) {
    console.error(error)
    toast.error('Gagal mengekspor berkas PDF')
  }
}

onMounted(() => {
  loadFilterOptions()
  fetchData(1)
})
</script>

<style scoped>
.kepatuhan-sku-bpjs-view {
  font-family: 'Outfit', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  font-size: 1.4rem;
}

.page-title {
  font-weight: 800;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
}

.panel-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.premium-input-date, .premium-select-filter, .premium-input-search {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  background-color: #ffffff;
  color: #334155;
  outline: none;
  transition: all 0.2s ease;
  height: 34px;
}

.premium-input-date {
  width: 130px !important;
}

.premium-select-filter {
  width: 155px !important;
}

.premium-input-search {
  width: 185px !important;
}

.premium-input-date:focus, .premium-select-filter:focus, .premium-input-search:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.btn-export-excel, .btn-export-pdf {
  height: 34px;
  padding: 0 12px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-export-excel {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.btn-export-excel:hover {
  background-color: #059669;
  color: #ffffff;
}

.btn-export-pdf {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.btn-export-pdf:hover {
  background-color: #dc2626;
  color: #ffffff;
}

/* KPI Card */
.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
}

.kpi-card:hover {
  transform: translateY(-3px);
}

.kpi-primary { border-left: 5px solid #3b82f6 !important; }
.kpi-warning { border-left: 5px solid #f59e0b !important; }
.kpi-success { border-left: 5px solid #10b981 !important; }
.kpi-danger { border-left: 5px solid #ef4444 !important; }
.kpi-sky { border-left: 5px solid #0ea5e9 !important; }
.kpi-teal { border-left: 5px solid #0d9488 !important; }

.kpi-primary:hover { box-shadow: 0 12px 24px rgba(59, 130, 246, 0.1) !important; }
.kpi-warning:hover { box-shadow: 0 12px 24px rgba(245, 158, 11, 0.1) !important; }
.kpi-success:hover { box-shadow: 0 12px 24px rgba(16, 185, 129, 0.1) !important; }
.kpi-danger:hover { box-shadow: 0 12px 24px rgba(239, 68, 68, 0.1) !important; }
.kpi-sky:hover { box-shadow: 0 12px 24px rgba(14, 165, 233, 0.1) !important; }
.kpi-teal:hover { box-shadow: 0 12px 24px rgba(13, 148, 136, 0.1) !important; }

.kpi-icon-wrapper {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.bg-primary-light { background-color: #eff6ff; }
.bg-warning-light { background-color: #fffbeb; }
.bg-success-light { background-color: #ecfdf5; }
.bg-danger-light { background-color: #fef2f2; }
.bg-info-light { background-color: #f0f9ff; }
.bg-teal-light { background-color: #f0fdfa; }
.text-teal { color: #0d9488; }
.bg-teal { background-color: #0d9488; }

.kpi-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b !important;
  display: block;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Rankings list */
.scrollable-ranking {
  max-height: 240px;
  overflow-y: auto;
}

/* Table Style */
.table-light-header th {
  background-color: #f8fafc !important;
  color: #475569 !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 2px solid #e2e8f0 !important;
  padding: 12px 14px !important;
}

.table-row {
  transition: all 0.2s ease;
}
.table-row:hover {
  background-color: #f8fafc !important;
}

.badge-pelayanan {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}
.badge-pelayanan.ranap {
  background-color: #f5f3ff;
  color: #6d28d9;
}
.badge-pelayanan.ralan {
  background-color: #f0fdf4;
  color: #15803d;
}

.compliance-badge {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}
.compliance-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}
.compliance-badge.info {
  background-color: #dbeafe;
  color: #1e40af;
}
.compliance-badge.danger {
  background-color: #fee2e2;
  color: #991b1b;
}
.compliance-badge.warning {
  background-color: #fef3c7;
  color: #92400e;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 0.8rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-page {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #334155;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page:not(:disabled):hover {
  background-color: #f1f5f9;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.btn-page-number {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: transparent;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page-number.active {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-page-number:not(.active):hover {
  background-color: #f1f5f9;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .kepatuhan-sku-bpjs-view {
    padding: 16px 10px;
  }
  .w-100-mobile {
    width: 100% !important;
    flex-direction: column;
    align-items: stretch !important;
  }
  .premium-input-date, .premium-select-filter, .premium-input-search, .btn-export-excel, .btn-export-pdf {
    width: 100%;
  }
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
