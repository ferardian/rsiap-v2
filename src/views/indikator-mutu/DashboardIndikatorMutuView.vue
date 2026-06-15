<template>
  <div class="dashboard-inmut p-3 p-md-4">

    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Dashboard Indikator Mutu</h3>
            <p class="page-subtitle mb-0 small">
              Pantau capaian mutu rumah sakit secara real-time berdasarkan kategori indikator (PMKP)
            </p>
          </div>
        </div>
        
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Tahun Filter -->
          <div class="filter-container-custom">
            <select class="filter-month-input" v-model="filters.tahun" @change="fetchAll" style="width: auto; min-width: 60px;">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          
          <!-- Jenis Laporan Filter -->
          <div class="filter-container-custom">
            <select class="filter-month-input" v-model="filters.tipe" @change="handleTipeChange" style="width: auto; min-width: 90px;">
              <option value="bulanan">Bulanan</option>
              <option value="triwulan">Triwulan</option>
              <option value="semester">Semester</option>
              <option value="tahunan">Tahunan</option>
            </select>
          </div>

          <!-- Periode Filter -->
          <div class="filter-container-custom" v-if="filters.tipe !== 'tahunan'">
            <select class="filter-month-input" v-model="filters.periode" @change="fetchAll" style="width: auto; min-width: 100px;">
              <template v-if="filters.tipe === 'bulanan'">
                <option :value="1">Januari</option>
                <option :value="2">Februari</option>
                <option :value="3">Maret</option>
                <option :value="4">April</option>
                <option :value="5">Mei</option>
                <option :value="6">Juni</option>
                <option :value="7">Juli</option>
                <option :value="8">Agustus</option>
                <option :value="9">September</option>
                <option :value="10">Oktober</option>
                <option :value="11">November</option>
                <option :value="12">Desember</option>
              </template>
              <template v-else-if="filters.tipe === 'triwulan'">
                <option :value="1">Triwulan I</option>
                <option :value="2">Triwulan II</option>
                <option :value="3">Triwulan III</option>
                <option :value="4">Triwulan IV</option>
              </template>
              <template v-else-if="filters.tipe === 'semester'">
                <option :value="1">Semester 1</option>
                <option :value="2">Semester 2</option>
              </template>
            </select>
          </div>

          <button class="btn-refresh-custom" @click="fetchAll" :disabled="loading.any">
            <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading.any }"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- ===== TOP LEVEL TAB SWITCHER ===== -->
    <div class="top-tab-switcher mb-4">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'mutu' }" 
        @click="activeTab = 'mutu'"
      >
        <i class="fas fa-chart-line me-2"></i>
        Mutu
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'ikp' }" 
        @click="activeTab = 'ikp'"
      >
        <i class="fas fa-exclamation-triangle me-2"></i>
        IKP
      </button>
    </div>

    <!-- ===== LOADING STATE ===== -->
    <div v-if="loading.any && !hasSomeData" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p class="mt-3 text-muted">Memuat data dashboard...</p>
      </div>
    </div>

    <template v-else>
      <div v-if="activeTab === 'mutu'">
        <!-- ===== GLOBAL SUMMARY CARDS ===== -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="premium-summary-card">
              <div class="summary-icon-bg total">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="summary-info">
                <div class="summary-value">{{ globalStats.total }}</div>
                <div class="summary-label">Total Indikator</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="premium-summary-card">
              <div class="summary-icon-bg achieved">
                <i class="fas fa-check-double"></i>
              </div>
              <div class="summary-info">
                <div class="summary-value">{{ globalStats.tercapai }}</div>
                <div class="summary-label">Tercapai</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="premium-summary-card">
              <div class="summary-icon-bg failed">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="summary-info">
                <div class="summary-value">{{ globalStats.tidakTercapai }}</div>
                <div class="summary-label">Tidak Tercapai</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="premium-summary-card">
              <div class="summary-icon-bg rate">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="summary-info">
                <div class="summary-value">{{ globalStats.ratePercent }}%</div>
                <div class="summary-label">Tingkat Keberhasilan</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== SUB TAB SWITCHER (INM, IMPRS, IMP) ===== -->
        <div class="sub-tab-switcher mb-4">
          <button 
            v-for="sub in kategoris.slice(0, 3)" 
            :key="sub.key"
            class="sub-tab-btn" 
            :class="[sub.key, { active: activeSubTab === sub.key }]"
            @click="activeSubTab = sub.key"
          >
            <i :class="[sub.icon, 'me-1']"></i>
            <span>{{ sub.alias }}</span>
          </button>
        </div>

        <!-- ===== KATEGORI SECTIONS (MUTU) ===== -->
        <div 
          v-for="(kategori, ki) in kategoris.slice(0, 3)" 
          :key="ki" 
          v-show="activeSubTab === kategori.key"
          class="kategori-section mb-5"
        >

          <!-- Section Header -->
          <div class="section-header" :style="{ '--cat-color': kategori.color, '--cat-gradient': kategori.gradient }">
            <div class="section-header-inner">
              <div class="section-icon-wrap">
                <i :class="kategori.icon"></i>
              </div>
              <div class="flex-grow-1">
                <h5 class="section-title mb-1">{{ kategori.nama }}</h5>
                <p class="section-desc mb-0">{{ kategori.desc }}</p>
              </div>
              <div class="section-badge-group">
                <span class="section-badge badge-total">
                  <i class="fas fa-list me-1"></i>
                  {{ kategorisData[ki]?.total ?? 0 }} Indikator
                </span>
                <span class="section-badge" :class="(kategorisData[ki]?.ratePercent ?? 0) >= 80 ? 'badge-ok' : 'badge-warn'">
                  <i class="fas fa-bullseye me-1"></i>
                  {{ kategorisData[ki]?.ratePercent ?? 0 }}% Tercapai
                </span>
              </div>
            </div>

            <!-- Overall Progress Bar -->
            <div class="section-progress-wrap mt-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted opacity-75">Keberhasilan Keseluruhan</small>
                <small class="text-slate-800 fw-bold">{{ kategorisData[ki]?.tercapai ?? 0 }} / {{ kategorisData[ki]?.total ?? 0 }}</small>
              </div>
              <div class="section-progress-bar">
                <div
                  class="section-progress-fill"
                  :style="{ width: (kategorisData[ki]?.ratePercent ?? 0) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Skeleton and Cards for Mutu Indicators -->
          <!-- Loading skeleton -->
          <div v-if="loading[ki]" class="row g-3 mt-1">
            <div v-for="s in 3" :key="s" class="col-md-6 col-lg-4">
              <div class="indicator-card skeleton-card">
                <div class="skeleton-line" style="width: 70%; height: 18px;"></div>
                <div class="skeleton-line mt-2" style="width: 50%; height: 12px;"></div>
                <div class="skeleton-line mt-3" style="width: 100%; height: 8px;"></div>
                <div class="skeleton-line mt-2" style="width: 90%; height: 8px;"></div>
              </div>
            </div>
          </div>

          <!-- Indicator Cards -->
          <div v-else-if="kategorisData[ki]?.items?.length" class="row g-3 mt-1">
            <div
              v-for="item in kategorisData[ki].items"
              :key="item.id_master"
              class="col-md-6 col-lg-4"
            >
              <div class="indicator-card" :class="getCardClass(item)">
                <!-- Status ribbon -->
                <div class="card-ribbon" :class="getRibbonClass(item)"></div>

                <!-- Card Header -->
                <div class="indicator-card-header">
                  <div class="indicator-meta">
                    <span class="indicator-unit" v-if="item.pj">
                      <i class="fas fa-user-tie me-1"></i>{{ item.pj }}
                    </span>
                    <span class="indicator-unit" v-else>
                      <i class="fas fa-hospital me-1"></i>{{ item.unit_name || 'RS' }}
                    </span>
                    <span class="status-dot" :class="getStatusDotClass(item)" :title="getStatusLabel(item)"></span>
                  </div>
                  <h6 class="indicator-name">{{ item.nama_indikator || item.nama_inmut }}</h6>
                </div>

                <!-- Stats Row -->
                <div class="indicator-stats">
                  <div class="stat-item">
                    <div class="stat-icon stat-icon-num">
                      <i class="fas fa-calculator"></i>
                    </div>
                    <div>
                      <div class="stat-label">Numerator</div>
                      <div class="stat-value">{{ item.total_numerator != null ? item.total_numerator : '–' }}</div>
                    </div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <div class="stat-icon stat-icon-den">
                      <i class="fas fa-divide"></i>
                    </div>
                    <div>
                      <div class="stat-label">Denominator</div>
                      <div class="stat-value">{{ item.total_denominator != null ? item.total_denominator : '–' }}</div>
                    </div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <div class="stat-icon stat-icon-target">
                      <i class="fas fa-bullseye"></i>
                    </div>
                    <div>
                      <div class="stat-label">Target</div>
                      <div class="stat-value">{{ getTargetDisplay(item) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Score Bar -->
                <div class="score-section">
                  <div class="d-flex justify-content-between align-items-end mb-1">
                    <span class="score-label">{{ getScoreLabel() }}</span>
                    <span class="score-value" :class="isTargetMet(item) ? 'score-good' : 'score-bad'">
                      {{ item.capaian != null ? item.capaian + '%' : 'Belum Ada Data' }}
                    </span>
                  </div>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      :class="isTargetMet(item) ? 'fill-good' : (item.capaian != null ? 'fill-bad' : 'fill-empty')"
                      :style="{ width: (item.capaian != null ? Math.min(item.capaian, 100) : 0) + '%' }"
                    ></div>
                    <!-- Target marker -->
                    <div
                      class="score-target-marker"
                      :style="{ left: Math.min(getNumericTarget(item), 100) + '%' }"
                      :title="'Target: ' + getTargetDisplay(item)"
                    ></div>
                  </div>
                  <div class="d-flex justify-content-between mt-1">
                    <small class="text-muted" style="font-size: 0.68rem;">0%</small>
                    <small class="text-muted" style="font-size: 0.68rem;">100%</small>
                  </div>
                </div>

                <!-- Footer Status -->
                <div class="indicator-footer">
                  <span class="status-badge" :class="getStatusBadgeClass(item)">
                    <i :class="getStatusIcon(item)" class="me-1"></i>
                    {{ getStatusLabel(item) }}
                  </span>
                  <span class="data-count" v-if="item.last_filled">
                    <i class="fas fa-calendar-check me-1"></i>{{ formatDate(item.last_filled) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i :class="kategori.icon"></i>
            </div>
            <p class="empty-text">Belum ada data indikator untuk kategori ini</p>
            <small class="text-muted">Tambah indikator melalui menu Master Indikator Mutu</small>
          </div>

        </div>
      </div>

      <div v-else-if="activeTab === 'ikp'">
        <div class="kategori-section mb-5">
          <!-- Section Header for IKP -->
          <div class="section-header" :style="{ '--cat-color': kategoris[3].color, '--cat-gradient': kategoris[3].gradient }">
            <div class="section-header-inner">
              <div class="section-icon-wrap">
                <i :class="kategoris[3].icon"></i>
              </div>
              <div class="flex-grow-1">
                <h5 class="section-title mb-1">{{ kategoris[3].nama }}</h5>
                <p class="section-desc mb-0">{{ kategoris[3].desc }}</p>
              </div>
              <div class="section-badge-group">
                <span class="section-badge badge-total">
                  <i class="fas fa-list me-1"></i>
                  {{ kategorisData[3]?.total ?? 0 }} Insiden
                </span>
              </div>
            </div>
          </div>

          <!-- Custom IKP Section -->
          <!-- Loading skeleton -->
          <div v-if="loading[3]" class="row g-3 mt-1">
            <div class="col-12">
              <div class="ikp-detail-card py-5 text-center">
                <div class="spinner-ring mx-auto mb-3"></div>
                <span class="text-muted">Memuat data insiden keselamatan pasien...</span>
              </div>
            </div>
          </div>

          <div v-else-if="kategorisData[3]?.data" class="mt-3 d-flex flex-column gap-4">
            <!-- Row 1: Charts -->
            <div class="row g-3">
              <!-- Tren Bulanan (Area Chart) -->
              <div class="col-lg-8 col-md-7">
                <div class="ikp-detail-card h-100">
                  <h6 class="ikp-card-header-title mb-3">
                    <i class="fas fa-chart-line me-2 text-danger"></i>
                    Tren Kejadian Bulanan (Tahun {{ filters.tahun }})
                  </h6>
                  <div style="height: 280px;">
                    <apexchart type="area" height="100%" :options="trendChartOptions" :series="trendSeries"></apexchart>
                  </div>
                </div>
              </div>
              
              <!-- Sebaran Jenis Kejadian (Donut Chart) -->
              <div class="col-lg-4 col-md-5">
                <div class="ikp-detail-card h-100">
                  <h6 class="ikp-card-header-title mb-3">
                    <i class="fas fa-chart-pie me-2 text-primary"></i>
                    Sebaran Jenis Kejadian
                  </h6>
                  <div style="height: 280px; display: flex; align-items: center; justify-content: center;">
                    <apexchart type="donut" width="100%" height="100%" :options="jenisChartOptions" :series="jenisChartData.series"></apexchart>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 2: Detailed Stats & Lists -->
            <div class="row g-3">
              <!-- Summary Card Total Insiden & Textual Sebaran -->
              <div class="col-md-4">
                <div class="d-flex flex-column gap-3 h-100">
                  <div class="ikp-summary-card py-4">
                    <div class="ikp-card-title">Total Kejadian</div>
                    <div class="ikp-card-value text-danger">{{ kategorisData[3].data.total_insiden }}</div>
                    <div class="ikp-card-desc">Laporan Insiden Keselamatan Pasien (IKP)</div>
                  </div>
                  
                  <div class="ikp-detail-card flex-grow-1">
                    <h6 class="ikp-card-header-title mb-2"><i class="fas fa-list-ol me-2 text-primary"></i>Detail Sebaran Jenis</h6>
                    <div class="jenis-grid" style="grid-template-columns: 1fr; gap: 0.5rem;">
                      <div v-for="j in kategorisData[3].data.jenis_overview" :key="j.alias" class="jenis-item" style="padding: 0.4rem 0.6rem;">
                        <div class="jenis-alias-badge" :class="j.alias.toLowerCase()" style="min-width: 42px; font-size: 0.7rem; padding: 2px 6px;">{{ j.alias }}</div>
                        <div class="flex-grow-1 d-flex justify-content-between align-items-center">
                          <span class="jenis-name fw-medium text-slate-700" style="font-size: 0.75rem;">{{ j.nama_jenis_insiden }}</span>
                          <span class="jenis-count badge bg-light text-dark fw-bold border" style="font-size: 0.7rem; padding: 2px 6px;">{{ j.jumlah }} Kejadian</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grading Risiko Overview -->
              <div class="col-md-4">
                <div class="ikp-detail-card h-100">
                  <h6 class="ikp-card-header-title mb-3"><i class="fas fa-shield-virus me-2 text-success"></i>Grading Risiko (Risk Matrix)</h6>
                  <div class="grading-list d-flex flex-column gap-2">
                    <div v-for="g in kategorisData[3].data.grading_overview" :key="g.grading_risiko" class="grading-item d-flex align-items-center p-2 rounded border-start border-4 bg-light shadow-sm" :style="{ borderLeftColor: getGradingHexColor(g.grading_risiko) }">
                      <span class="grading-label fw-bold text-slate-700 ms-2">{{ g.grading_risiko }}</span>
                      <span class="grading-value ms-auto badge fw-bold" :style="{ backgroundColor: getGradingHexColor(g.grading_risiko), color: g.grading_risiko === 'Kuning' ? '#000' : '#fff' }">{{ g.total }} Insiden</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Top Unit Terbanyak -->
              <div class="col-md-4">
                <div class="ikp-detail-card h-100">
                  <h6 class="ikp-card-header-title mb-3"><i class="fas fa-hospital-user me-2 text-warning"></i>Unit dengan Insiden Terbanyak</h6>
                  <div class="unit-list d-flex flex-column gap-2">
                    <div v-for="(u, idx) in kategorisData[3].data.top_units" :key="u.nama_unit" class="unit-item d-flex align-items-center p-2 bg-light rounded border border-light shadow-sm">
                      <span class="unit-rank badge bg-secondary text-white me-2">{{ idx + 1 }}</span>
                      <span class="unit-name text-slate-700 fw-medium">{{ u.nama_unit }}</span>
                      <span class="unit-value ms-auto badge bg-light text-dark border fw-bold">{{ u.jumlah }} Insiden</span>
                    </div>
                    <div v-if="!kategorisData[3].data.top_units?.length" class="text-muted text-center py-4">
                      Tidak ada laporan insiden pada periode ini
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <i :class="kategoris[3].icon"></i>
            </div>
            <p class="empty-text">Gagal memuat data IKP</p>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts
const toast = useToast()

const filters = reactive({
  tahun: new Date().getFullYear(),
  tipe: 'tahunan',
  periode: new Date().getMonth() + 1
})

const activeTab = ref('mutu')
const activeSubTab = ref('nasional')

const handleTipeChange = () => {
  const currentMonth = new Date().getMonth() + 1
  if (filters.tipe === 'bulanan') {
    filters.periode = currentMonth
  } else if (filters.tipe === 'triwulan') {
    filters.periode = Math.ceil(currentMonth / 3)
  } else if (filters.tipe === 'semester') {
    filters.periode = currentMonth <= 6 ? 1 : 2
  }
  fetchAll()
}

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const yrs = []
  for (let y = currentYear; y >= currentYear - 5; y--) yrs.push(y)
  return yrs
})

// Define the 4 categories
const kategoris = [
  {
    key: 'nasional',
    alias: 'INM',
    nama: 'Indikator Mutu Nasional',
    desc: 'Indikator yang ditetapkan secara nasional oleh Kemenkes RI',
    icon: 'fas fa-flag',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
  },
  {
    key: 'prioritas_rs',
    alias: 'IMPRS',
    nama: 'Indikator Mutu Prioritas Rumah Sakit',
    desc: 'Indikator prioritas yang ditetapkan oleh manajemen rumah sakit',
    icon: 'fas fa-hospital',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)'
  },
  {
    key: 'prioritas_unit',
    alias: 'IMP',
    nama: 'Indikator Mutu Prioritas Unit',
    desc: 'Indikator mutu yang dikelola oleh masing-masing unit pelayanan',
    icon: 'fas fa-door-open',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10b981)'
  },
  {
    key: 'ikp',
    nama: 'Insiden Keselamatan Pasien (IKP)',
    desc: 'Laporan insiden keselamatan pasien berdasarkan jenis dan grading risiko',
    icon: 'fas fa-exclamation-triangle',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #f87171)'
  }
]

// Data keyed by kategori index
const kategorisData = reactive({
  0: { items: [], total: 0, tercapai: 0, tidakTercapai: 0, ratePercent: 0 },
  1: { items: [], total: 0, tercapai: 0, tidakTercapai: 0, ratePercent: 0 },
  2: { items: [], total: 0, tercapai: 0, tidakTercapai: 0, ratePercent: 0 },
  3: { items: [], total: 0, data: null }
})

const loading = reactive({
  0: false,
  1: false,
  2: false,
  3: false,
  any: false
})

const hasSomeData = computed(() =>
  kategorisData[0].items.length > 0 ||
  kategorisData[1].items.length > 0 ||
  kategorisData[2].items.length > 0 ||
  kategorisData[3].data !== null
)

const globalStats = computed(() => {
  let total = 0, tercapai = 0, tidakTercapai = 0
  for (let i = 0; i < 3; i++) {
    total += kategorisData[i].total
    tercapai += kategorisData[i].tercapai
    tidakTercapai += kategorisData[i].tidakTercapai
  }
  const ratePercent = total > 0 ? Math.round((tercapai / total) * 100) : 0
  return { total, tercapai, tidakTercapai, ratePercent }
})

const fetchAll = async () => {
  loading.any = true
  loading[0] = true
  loading[1] = true
  loading[2] = true
  loading[3] = true
  try {
    const params = {
      tahun: filters.tahun,
      tipe: filters.tipe,
      limit: 1000,
      page: 1
    }
    if (filters.tipe !== 'tahunan') {
      params.periode = filters.periode
    }

    const [monitoringRes, ikpRes] = await Promise.all([
      api.getMonitoring(params),
      api.getIkpData(params)
    ])

    const monitoringItems = monitoringRes.data?.data?.data || []

    const items0 = []
    const items1 = []
    const items2 = []

    monitoringItems.forEach(item => {
      const processedItem = {
        ...item,
        id_master: item.id_master,
        nama_indikator: item.nama_inmut,
        standar: item.standar || item.standar_utama,
        satuan: item.satuan || item.satuan_utama,
        rumus: item.rumus || item.rumus_utama,
        capaian: item.has_data && item.total_denum > 0 ? parseFloat(item.score) : null,
        total_numerator: item.has_data ? item.total_num : null,
        total_denominator: item.has_data ? item.total_denum : null,
        last_filled: item.last_filled,
        rumus_code: item.rumus || item.rumus_utama,
        unit_name: item.nama_ruang
      }

      const katUtama = (item.kategori_utama || '').toLowerCase()
      const namaJenis = (item.nama_jenis || '').toLowerCase()

      if (katUtama.includes('nasional') || namaJenis.includes('nasional')) {
        items0.push(processedItem)
      } else if (
        katUtama.includes('rumah sakit') || 
        namaJenis.includes('rumah sakit') || 
        namaJenis === 'skp'
      ) {
        items1.push(processedItem)
      } else {
        items2.push(processedItem)
      }
    })

    const setKategoriData = (index, items) => {
      const tercapai = items.filter(item => isTargetMet(item)).length
      const tidakTercapai = items.filter(item => item.capaian != null && !isTargetMet(item)).length
      const ratePercent = items.length > 0
        ? Math.round((tercapai / items.length) * 100)
        : 0

      kategorisData[index] = {
        items,
        total: items.length,
        tercapai,
        tidakTercapai,
        ratePercent
      }
    }

    setKategoriData(0, items0)
    setKategoriData(1, items1)
    setKategoriData(2, items2)

    kategorisData[3] = {
      items: [],
      total: ikpRes.data?.data?.total_insiden || 0,
      data: ikpRes.data?.data || null
    }

  } catch (error) {
    console.error('Error fetching dashboard:', error)
    toast.error('Gagal memuat data dashboard')
  } finally {
    loading[0] = false
    loading[1] = false
    loading[2] = false
    loading[3] = false
    loading.any = false
  }
}

// Helpers
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const romanQuarters = ['I', 'II', 'III', 'IV']

const getScoreLabel = () => {
  switch (filters.tipe) {
    case 'bulanan': {
      const mName = monthNames[filters.periode - 1] || 'Bulan Ini'
      return `Capaian ${mName}`
    }
    case 'triwulan': {
      const qName = romanQuarters[filters.periode - 1] || 'Ini'
      return `Capaian Triwulan ${qName}`
    }
    case 'semester': {
      return `Capaian Semester ${filters.periode}`
    }
    case 'tahunan': {
      return `Capaian Tahun ${filters.tahun}`
    }
    default: {
      return 'Capaian Periode Ini'
    }
  }
}

const getGradingHexColor = (colorName) => {
  const map = {
    'Biru': '#3b82f6',
    'Hijau': '#10b981',
    'Kuning': '#eab308',
    'Merah': '#ef4444'
  }
  return map[colorName] || '#94a3b8'
}

// IKP Charts computed data
const trendSeries = computed(() => {
  const data = Array(12).fill(0)
  const trend = kategorisData[3]?.data?.bulanan_trend || []
  trend.forEach(item => {
    const idx = parseInt(item.bulan, 10) - 1
    if (idx >= 0 && idx < 12) {
      data[idx] = parseInt(item.jumlah, 10)
    }
  })
  return [{
    name: 'Jumlah Kejadian',
    data: data
  }]
})

const trendChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  colors: ['#ef4444'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [50, 100, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    labels: {
      style: { colors: '#64748b', fontWeight: 600 }
    }
  },
  yaxis: {
    labels: {
      style: { colors: '#64748b', fontWeight: 600 }
    }
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (val) => `${val} Kejadian`
    }
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4
  }
}))

const jenisChartData = computed(() => {
  const overview = kategorisData[3]?.data?.jenis_overview || []
  const labels = overview.map(o => `${o.alias} (${o.nama_jenis_insiden})`)
  const series = overview.map(o => parseInt(o.jumlah, 10))
  return { labels, series }
})

const jenisChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Inter, sans-serif'
  },
  labels: jenisChartData.value.labels,
  colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#7c3aed', '#64748b'],
  legend: {
    position: 'bottom',
    fontSize: '11px',
    fontWeight: 600,
    labels: { colors: '#475569' }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '78%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            offsetY: -8
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 800,
            color: '#1e293b',
            offsetY: 6,
            formatter: (val) => val
          },
          total: {
            show: true,
            label: 'Total',
            color: '#64748b',
            fontSize: '12px',
            fontWeight: 600,
            formatter: () => kategorisData[3]?.data?.total_insiden || 0
          }
        }
      }
    }
  },
  dataLabels: { enabled: false }
}))
const getNumericTarget = (item) => {
  const standar = parseFloat(item.standar || item.standar_utama)
  return isNaN(standar) ? 80 : Math.min(standar, 100)
}

// Rumus code: 1=eq, 2=lte, 3=lt, 4=gte, 5=gt (from MonitoringTable)
const rumusSymbolMap = { '1': '=', '2': '≤', '3': '<', '4': '≥', '5': '>' }

const getTargetDisplay = (item) => {
  const std = item.standar || item.standar_utama
  if (!std) return '–'
  const rumusCode = String(item.rumus_code || item.rumus || '')
  const symbol = rumusSymbolMap[rumusCode] || ''
  let satuan = item.satuan || item.satuan_utama || ''
  if (satuan === 'Persentase') satuan = '%'
  return `${symbol}${std}${satuan ? ' ' + satuan : ''}`
}

const isTargetMet = (item) => {
  if (item.capaian == null || isNaN(item.capaian)) return false
  const capaian = parseFloat(item.capaian)
  const std = parseFloat(item.standar || item.standar_utama)
  if (isNaN(std)) return false
  const rumusCode = String(item.rumus_code || item.rumus || '')
  switch (rumusCode) {
    case '1': return capaian === std
    case '2': return capaian <= std
    case '3': return capaian < std
    case '4': return capaian >= std
    case '5': return capaian > std
    default: return capaian >= std // default: assume ≥
  }
}

const getCardClass = (item) => {
  if (item.capaian == null) return 'card-no-data'
  return isTargetMet(item) ? 'card-achieved' : 'card-not-achieved'
}

const getRibbonClass = (item) => {
  if (item.capaian == null) return 'ribbon-gray'
  return isTargetMet(item) ? 'ribbon-green' : 'ribbon-red'
}

const getStatusDotClass = (item) => {
  if (item.capaian == null) return 'dot-gray'
  return isTargetMet(item) ? 'dot-green' : 'dot-red'
}

const getStatusBadgeClass = (item) => {
  if (item.capaian == null) return 'badge-nodata'
  return isTargetMet(item) ? 'badge-achieved' : 'badge-notachieved'
}

const getStatusIcon = (item) => {
  if (item.capaian == null) return 'fas fa-minus-circle'
  return isTargetMet(item) ? 'fas fa-check-circle' : 'fas fa-times-circle'
}

const getStatusLabel = (item) => {
  if (item.capaian == null) return 'Belum Ada Data'
  return isTargetMet(item) ? 'Tercapai' : 'Tidak Tercapai'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  fetchAll()
})
</script>

<style scoped>
/* ===== BASE ===== */
.dashboard-inmut {
  min-height: 100vh;
  background: #f8fafc;
}

/* ===== PAGE HEADER ===== */
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

.filter-container-custom {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  height: 38px;
  transition: all 0.2s ease;
}

.filter-container-custom:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-month-input {
  background: transparent;
  border: none;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  width: 140px;
}

.btn-refresh-custom {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  height: 38px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-refresh-custom:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-refresh-custom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== LOADING ===== */
.loading-state { display: flex; justify-content: center; align-items: center; min-height: 300px; }
.loading-spinner { text-align: center; }
.spinner-ring {
  width: 56px; height: 56px; margin: 0 auto;
  border: 4px solid #e9ecef;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== SUMMARY CARDS ===== */
.premium-summary-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}

.premium-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
}

.summary-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.summary-icon-bg.total {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.summary-icon-bg.achieved {
  background: #ecfdf5;
  color: #10b981;
  border: 1px solid #d1fae5;
}

.summary-icon-bg.failed {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

.summary-icon-bg.rate {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.summary-value {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.summary-label {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
}

/* ===== SECTION HEADER ===== */
.kategori-section {}

.section-header {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  position: relative;
  overflow: hidden;
}

.section-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--cat-color);
}

.section-header-inner {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
}

.section-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; color: var(--cat-color); flex-shrink: 0;
}

.section-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }
.section-desc { font-size: 0.8rem; color: #64748b; }

.section-badge-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.section-badge {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 600;
}
.badge-total { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.badge-ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
.badge-warn { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }

.section-progress-wrap {}
.section-progress-bar {
  height: 8px; border-radius: 4px; background: #f1f5f9; overflow: visible; position: relative;
}
.section-progress-fill {
  height: 100%; border-radius: 4px;
  background: var(--cat-color);
  transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

/* ===== SKELETON ===== */
.skeleton-card { background: white; border-radius: 14px; padding: 1.25rem; }
.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* ===== INDICATOR CARDS ===== */
.indicator-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  height: 100%;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.05);
}
.indicator-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
}

.card-ribbon {
  position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 16px 16px 0 0;
}
.ribbon-green { background: linear-gradient(90deg, #059669, #34d399); }
.ribbon-red { background: linear-gradient(90deg, #dc2626, #f87171); }
.ribbon-gray { background: linear-gradient(90deg, #9ca3af, #d1d5db); }

.card-achieved { border-left: 3px solid transparent; }
.card-not-achieved { border-left: 3px solid transparent; }
.card-no-data { border-left: 3px solid transparent; opacity: 0.9; }

.indicator-card-header { margin-bottom: 0.75rem; }

.indicator-meta {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.4rem;
}

.indicator-unit {
  font-size: 0.7rem; color: #6b7280; font-weight: 500;
  background: #f3f4f6; padding: 2px 8px; border-radius: 20px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;
}

.status-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.dot-green { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); animation: pulse-green 2s infinite; }
.dot-red { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
.dot-gray { background: #9ca3af; }

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
  50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.1); }
}

.indicator-name {
  font-size: 0.88rem; font-weight: 700; color: #111827;
  line-height: 1.4; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; min-height: 2.4em;
}

/* Stats Row */
.indicator-stats {
  display: flex; align-items: center; gap: 0; margin-bottom: 1rem;
  background: #f8fafc; border-radius: 10px; padding: 0.6rem 0.5rem;
}
.stat-item { display: flex; align-items: center; gap: 0.5rem; flex: 1; padding: 0 0.5rem; }
.stat-divider { width: 1px; height: 30px; background: #e5e7eb; flex-shrink: 0; }

.stat-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; flex-shrink: 0;
}
.stat-icon-num { background: #ede9fe; color: #7c3aed; }
.stat-icon-den { background: #dbeafe; color: #2563eb; }
.stat-icon-target { background: #fef3c7; color: #d97706; }

.stat-label { font-size: 0.62rem; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
.stat-value { font-size: 0.88rem; font-weight: 700; color: #1f2937; }

/* Score Bar */
.score-section { margin-bottom: 0.75rem; }
.score-label { font-size: 0.7rem; color: #6b7280; font-weight: 500; }
.score-value { font-size: 0.95rem; font-weight: 800; }
.score-good { color: #059669; }
.score-bad { color: #dc2626; }

.score-bar {
  height: 10px; background: #f3f4f6; border-radius: 5px; overflow: visible;
  position: relative;
}
.score-fill {
  height: 100%; border-radius: 5px;
  transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
}
.fill-good { background: linear-gradient(90deg, #059669, #34d399); }
.fill-bad { background: linear-gradient(90deg, #dc2626, #f87171); }
.fill-empty { width: 0 !important; }

.score-target-marker {
  position: absolute; top: -3px; width: 3px; height: 16px;
  background: #f59e0b; border-radius: 2px; transform: translateX(-50%);
  box-shadow: 0 0 4px rgba(245,158,11,0.5);
  cursor: help;
}

/* Footer */
.indicator-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 0.75rem; border-top: 1px solid #f3f4f6;
}
.status-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: 0.7rem; font-weight: 600;
}
.badge-achieved { background: #d1fae5; color: #059669; }
.badge-notachieved { background: #fee2e2; color: #dc2626; }
.badge-nodata { background: #f3f4f6; color: #9ca3af; }

.data-count { font-size: 0.7rem; color: #9ca3af; }

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center; padding: 3rem 2rem;
  background: white; border-radius: 16px; margin-top: 0.75rem;
  border: 2px dashed #e5e7eb;
}
.empty-icon { font-size: 2.5rem; color: #d1d5db; margin-bottom: 1rem; }
.empty-text { color: #6b7280; font-weight: 500; margin: 0; }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .section-header { padding: 1rem 1.25rem; border-radius: 12px; }
  .section-header-inner { gap: 0.75rem; }
  .section-badge-group { gap: 0.35rem; }
  .filter-month-input { width: 110px; }
}

/* ===== IKP CUSTOM SECTION ===== */
.ikp-summary-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.ikp-card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}
.ikp-card-value {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.ikp-card-desc {
  font-size: 0.75rem;
  color: #94a3b8;
}
.ikp-detail-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.ikp-card-header-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.75rem;
}
.jenis-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 576px) {
  .jenis-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.jenis-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}
.jenis-alias-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  text-align: center;
  min-width: 48px;
  color: white;
}
.jenis-alias-badge.knc { background-color: #3b82f6; }
.jenis-alias-badge.ktc { background-color: #10b981; }
.jenis-alias-badge.kpc { background-color: #f59e0b; }
.jenis-alias-badge.ktd { background-color: #ef4444; }
.jenis-alias-badge.sentinel { background-color: #7c3aed; }
.jenis-alias-badge.ksd { background-color: #64748b; }

.jenis-info {
  display: flex;
  flex-direction: column;
}
.jenis-name {
  font-size: 0.8rem;
  color: #334155;
}
.jenis-count {
  font-size: 0.75rem;
  color: #64748b;
}

.grading-list, .unit-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.grading-item, .unit-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}
.grading-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.75rem;
}
.unit-rank {
  font-weight: 700;
  font-size: 0.8rem;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #cbd5e1;
  color: #334155;
  border-radius: 50%;
  margin-right: 0.75rem;
}

/* ===== TOP LEVEL TAB SWITCHER ===== */
.top-tab-switcher {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}
.tab-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  color: #64748b;
  padding: 0.5rem 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
}
.tab-btn:hover {
  color: #334155;
}
.tab-btn.active {
  color: #3b82f6;
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #3b82f6;
  border-radius: 2px;
}

/* ===== SUB TAB SWITCHER ===== */
.sub-tab-switcher {
  display: flex;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  width: fit-content;
  border: 1px solid #e2e8f0;
}

.sub-tab-btn {
  padding: 8px 16px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sub-tab-btn:hover {
  color: #334155;
}

/* Active styles based on active key */
.sub-tab-btn.active.nasional {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.sub-tab-btn.active.prioritas_rs {
  background: #0891b2;
  color: white;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.25);
}

.sub-tab-btn.active.prioritas_unit {
  background: #059669;
  color: white;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}
</style>
