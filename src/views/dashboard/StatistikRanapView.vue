<template>
  <div class="statistik-ranap-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col-md-7">
          <div class="d-flex align-items-center mb-2">
            <div class="header-icon-bg me-3">
              <i class="fas fa-chart-line fa-2x"></i>
            </div>
            <div>
              <h3 class="page-title mb-0">Statistik Rawat Inap</h3>
              <p class="page-subtitle mb-0">Indikator Mutu Pelayanan Tempat Tidur</p>
            </div>
          </div>
        </div>
        
        <!-- Quick Mode Selector -->
        <div class="col-md-5 mt-3 mt-md-0 d-flex justify-content-md-end">
          <div class="mode-toggle-group rounded-pill p-1">
            <button 
              @click="setYearlyMode(false)" 
              :class="['mode-pill-btn', { active: !filters.isYearlyMode }]"
            >
              <i class="fas fa-calendar-day me-1"></i> Harian
            </button>
            <button 
              @click="setYearlyMode(true)" 
              :class="['mode-pill-btn', { active: filters.isYearlyMode }]"
            >
              <i class="fas fa-calendar-alt me-1"></i> Tahunan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Categories Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
      <div class="card-body p-0">
        <!-- Category Tabs -->
        <div class="category-tabs-wrapper border-bottom custom-scrollbar">
          <div class="category-tabs d-flex px-3">
            <button 
              v-for="cat in categories" 
              :key="cat.value"
              @click="setActiveCategory(cat.value)"
              :class="['category-tab', { active: filters.activeCategory === cat.value }]"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Date / Year Filter Row -->
        <div class="filter-row p-3 bg-light">
          <div class="row align-items-end g-3">
            <template v-if="!filters.isYearlyMode">
              <div class="col-md-3">
                <label class="filter-label">Tanggal Mulai</label>
                <input type="date" class="form-control form-control-sm rounded-3 border-0 shadow-sm" v-model="filters.tgl_awal" @change="fetchData">
              </div>
              <div class="col-md-3">
                <label class="filter-label">Tanggal Akhir</label>
                <input type="date" class="form-control form-control-sm rounded-3 border-0 shadow-sm" v-model="filters.tgl_akhir" @change="fetchData">
              </div>
            </template>
            <template v-else>
              <div class="col-md-2">
                <label class="filter-label">Tahun Analisis</label>
                <select class="form-select form-select-sm rounded-3 border-0 shadow-sm" v-model="filters.tahun" @change="fetchData">
                  <option v-for="y in yearRange" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>
            </template>
            <div class="col-md-auto ms-auto">
              <button class="btn btn-primary btn-sm rounded-3 px-4 shadow-sm" @click="fetchData" :disabled="loading">
                <i v-if="loading" class="spinner-border spinner-border-sm me-1"></i>
                <i v-else class="fas fa-sync-alt me-1"></i>
                REFRESH DATA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-if="loading && !dataLoaded" class="text-center py-5">
      <div class="spinner-grow text-primary" role="status"></div>
      <p class="mt-3 text-muted fw-bold">Menyiapkan dashboard statistik...</p>
    </div>

    <div v-else class="dashboard-content animate__animated animate__fadeIn">
      <!-- Indicators Grid -->
      <div class="row g-4 mb-4">
        <!-- BOR Gauge Card -->
        <div class="col-lg-4">
          <div class="indicator-card bor-card card border-0 shadow-sm rounded-4 h-100 p-4">
            <h5 class="card-title-sm mb-4">BOR <span class="text-muted">(Okupansi)</span></h5>
            <div class="d-flex flex-column align-items-center justify-content-center h-100 py-3">
              <div class="bor-gauge-wrapper">
                <svg viewBox="0 0 100 100" class="bor-gauge">
                  <circle cx="50" cy="50" r="45" class="bor-gauge-bg" />
                  <circle cx="50" cy="50" r="45" class="bor-gauge-progress" :style="borProgressStyle" />
                </svg>
                <div class="bor-gauge-value">
                  <span class="value">{{ currentData.indicators?.bor || 0 }}%</span>
                  <span class="label">Bed Occupancy</span>
                </div>
              </div>
              <div class="status-badge mt-4" :style="borStatusStyle">
                {{ borStatusText }}
              </div>
            </div>
          </div>
        </div>

        <!-- Metric Grid -->
        <div class="col-lg-8">
          <div class="row g-4">
            <div class="col-md-4">
              <div class="indicator-card metric-card card border-0 shadow-sm rounded-4 p-4 text-center">
                <div class="metric-icon bg-blue-subtle text-primary mb-3">
                  <i class="fas fa-calendar-day"></i>
                </div>
                <h6 class="text-muted small fw-bold text-uppercase">AVLOS</h6>
                <h3 class="fw-bold mb-1">{{ currentData.indicators?.avlos || 0 }}</h3>
                <p class="text-muted small mb-0">Rerata Lama Rawat</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="indicator-card metric-card card border-0 shadow-sm rounded-4 p-4 text-center">
                <div class="metric-icon bg-orange-subtle text-orange mb-3">
                  <i class="fas fa-hourglass-half"></i>
                </div>
                <h6 class="text-muted small fw-bold text-uppercase">TOI</h6>
                <h3 class="fw-bold mb-1">{{ currentData.indicators?.toi || 0 }}</h3>
                <p class="text-muted small mb-0">Tenggang Pakai Bed</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="indicator-card metric-card card border-0 shadow-sm rounded-4 p-4 text-center">
                <div class="metric-icon bg-green-subtle text-success mb-3">
                  <i class="fas fa-sync"></i>
                </div>
                <h6 class="text-muted small fw-bold text-uppercase">BTO</h6>
                <h3 class="fw-bold mb-1">{{ currentData.indicators?.bto || 0 }}</h3>
                <p class="text-muted small mb-0">Perputaran Bed</p>
              </div>
            </div>
            
            <!-- Raw Metrics Block -->
            <div class="col-12 mt-2">
              <div class="raw-metrics-card card border-0 bg-white shadow-sm rounded-4 p-3">
                <div class="row text-center g-0 mb-2">
                  <div class="col-4 border-end">
                    <span class="d-block text-muted text-xs fw-bold">A (Jml Bed)</span>
                    <span class="fw-bold fs-5 text-dark">{{ currentData.raw_metrics?.A || (currentData.metrics?.A || 0) }}</span>
                  </div>
                  <div class="col-4 border-end">
                    <span class="d-block text-muted text-xs fw-bold">HP (Hari Rawat)</span>
                    <span class="fw-bold fs-5 text-dark">{{ currentData.raw_metrics?.HP || (currentData.metrics?.HP || 0) }}</span>
                  </div>
                  <div class="col-4">
                    <span class="d-block text-muted text-xs fw-bold">D (Pasien Keluar)</span>
                    <span class="fw-bold fs-5 text-dark">{{ currentData.raw_metrics?.D || (currentData.metrics?.D || 0) }}</span>
                  </div>
                </div>
                <!-- Bed SK Disclaimer Note -->
                <div class="sk-bed-note p-2 rounded-3" style="background: #eff6ff; border-left: 3px solid #3b82f6; font-size: 0.72rem; color: #1e40af; line-height: 1.4;">
                  <i class="fas fa-info-circle me-1"></i>
                  <strong>Catatan Tempat Tidur:</strong> Total <strong>A (Jml Bed)</strong> pada statistik ini berbeda dengan SK Tempat Tidur RS, karena SK tidak mencantumkan tempat tidur Ruang VK (Kamar Bersalin).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOR Per Kelas Section (Only for Gabungan Category) -->
      <div v-if="currentData.bor_per_kelas && currentData.bor_per_kelas.length > 0" class="bor-kelas-section mb-4 animate__animated animate__fadeInUp">
        <h5 class="card-title-sm mb-3">BOR per Kelas Rawat <span v-if="filters.isYearlyMode" class="text-primary fw-normal small">(Rerata Tahunan)</span></h5>
        <div class="row g-3">
          <div v-for="cl in currentData.bor_per_kelas" :key="cl.kelas" class="col-md-2 col-6">
            <div class="bor-kelas-card card border-0 shadow-sm rounded-4 p-3 h-100">
              <h6 class="text-muted x-small fw-bold mb-2 text-uppercase">{{ cl.kelas }}</h6>
              <div class="d-flex align-items-center justify-content-between">
                <h4 class="fw-bold mb-0">{{ cl.bor }}%</h4>
              </div>
              <div class="bor-mini-progress mt-2">
                <div class="progress-bar" :style="{ width: cl.bor + '%', backgroundColor: getBorColor(cl.bor) }"></div>
              </div>
              <div class="mt-2 d-flex justify-content-between text-xs text-muted">
                <span>Bed: {{ cl.A }}</span>
                <span>HP: {{ cl.HP }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ward BOR Section (Filtered by Period & Category) -->
      <div v-if="currentData.ward_occupancy && currentData.ward_occupancy.length > 0" class="ward-occupancy-section mb-4 animate__animated animate__fadeInUp">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title-sm mb-0">BOR per Bangsal <span v-if="filters.isYearlyMode" class="text-primary fw-normal small">(Rerata Tahunan)</span></h5>
        </div>
        <div class="row g-3 custom-scrollbar" style="overflow-x: auto; flex-wrap: nowrap; padding-bottom: 1rem;">
          <div v-for="w in currentData.ward_occupancy" :key="w.label" class="col-lg-3 col-md-4 col-sm-6" style="flex: 0 0 auto; width: 280px;">
            <div class="ward-card card border-0 shadow-sm rounded-4 p-3 h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="text-dark small fw-bold mb-0 text-truncate me-2" :title="w.label">{{ w.label }}</h6>
                <span class="badge x-small fw-bold" :style="getBorBadgeStyle(w.bor)">{{ w.bor }}%</span>
              </div>
              <div class="bor-mini-progress mt-2 mb-3">
                <div class="progress-bar" :style="{ width: w.bor + '%', backgroundColor: getBorColor(w.bor) }"></div>
              </div>
              <div class="mt-2 d-flex justify-content-between text-xs text-muted">
                <span>Bed: {{ w.A }}</span>
                <span>HP: {{ w.HP }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Chart (Only for Yearly Mode) -->
      <div v-if="filters.isYearlyMode" class="row mb-4">
        <div class="col-12">
          <div class="trend-card card border-0 shadow-sm rounded-4 p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title-sm mb-0">Tren Indikator Tahunan <span class="text-primary fw-bold">({{ filters.activeMetric }})</span></h5>
              <div class="metric-selector">
                <button 
                  v-for="m in ['BOR', 'AVLOS', 'TOI', 'BTO']" 
                  :key="m"
                  @click="filters.activeMetric = m"
                  :class="['metric-btn', { active: filters.activeMetric === m }]"
                >
                  {{ m }}
                </button>
              </div>
            </div>
            
            <div class="chart-container" style="position: relative;">
               <svg class="trend-chart-svg" width="100%" height="100%" :viewBox="svgParams.viewBox" preserveAspectRatio="none">
                  <!-- Grid Lines -->
                  <line v-for="i in 5" :key="'grid'+i" x1="30" :y1="i*(svgParams.height/6) + 20" :x2="svgParams.width - 30" :y2="i*(svgParams.height/6) + 20" stroke="#f1f5f9" stroke-width="1" />
                  
                  <!-- Area -->
                  <path :d="chartPathData.area" fill="url(#chartGradient)" opacity="0.15" />
                  
                  <!-- Line -->
                  <path :d="chartPathData.line" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-line-anim" />
                  
                  <!-- Dots and Values -->
                  <g v-for="(p, i) in chartPoints" :key="'dot'+i">
                    <!-- Dots -->
                    <circle 
                      :cx="p.x" 
                      :cy="p.y" 
                      r="6" 
                      fill="white" 
                      stroke="#3b82f6" 
                      stroke-width="3" 
                      class="chart-dot"
                    />
                    <!-- Value Labels -->
                    <text 
                      :x="p.x" 
                      :y="p.y - 12" 
                      text-anchor="middle" 
                      :font-size="filters.activeMetric === 'BOR' ? '12' : '13'" 
                      font-weight="700" 
                      fill="#1e3a8a"
                      font-family="system-ui, -apple-system, sans-serif"
                    >{{ p.val }}</text>
                  </g>
                  
                  <!-- Month Labels -->
                  <g v-for="(p, i) in chartPoints" :key="'lbl'+i">
                    <text 
                      :x="p.x" 
                      :y="svgParams.height - 15" 
                      text-anchor="middle" 
                      font-size="12" 
                      fill="#94a3b8" 
                      font-weight="600"
                      font-family="system-ui, -apple-system, sans-serif"
                      :class="i % 2 === 0 ? 'month-label-even' : 'month-label-odd'"
                    >{{ p.month }}</text>
                  </g>

                  <!-- Definitions -->
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div v-if="filters.isYearlyMode" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div class="card-header bg-white py-3 px-4">
          <h6 class="mb-0 fw-bold"><i class="fas fa-table me-2 text-primary"></i>Rincian Data Bulanan - {{ getCategoryLabel(filters.activeCategory) }}</h6>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0 styled-table">
            <thead>
              <tr class="table-light">
                <th class="ps-4">Bulan</th>
                <th class="text-center">BOR (%)</th>
                <th class="text-center">AVLOS (Hari)</th>
                <th class="text-center">TOI (Hari)</th>
                <th class="text-center">BTO (Kali)</th>
                <th class="text-center bg-light">A (Bed)</th>
                <th class="text-center bg-light">HP (Hari Rawat)</th>
                <th class="text-center bg-light">D (Keluar)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in yearlyData.months" :key="m.month">
                <td class="ps-4 fw-medium">{{ m.month_name }}</td>
                <td class="text-center">
                  <span class="badge border fw-bold px-3 py-2" :style="getBorBadgeStyle(m.bor)">{{ m.bor }}%</span>
                </td>
                <td class="text-center">{{ m.avlos }}</td>
                <td class="text-center">{{ m.toi }}</td>
                <td class="text-center">{{ m.bto }}</td>
                <td class="text-center bg-light fw-bold text-primary">{{ m.A || 0 }}</td>
                <td class="text-center bg-light fw-bold text-success">{{ m.HP || 0 }}</td>
                <td class="text-center bg-light fw-bold text-orange">{{ m.D || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ranapStatistikService from '@/services/ranapStatistikService'

const loading = ref(false)
const dataLoaded = ref(false)
const categories = [
  { label: "Gabungan", value: "Gabungan" },
  { label: "Umum (Non-Intensif)", value: "Umum" },
  { label: "Anak", value: "Anak" },
  { label: "Kandungan", value: "Kandungan" },
  { label: "Bayi", value: "BYC" },
  { label: "ICU", value: "ICU" },
  { label: "Isolasi", value: "Isolasi" }
]
const monthNamesLong = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

const filters = reactive({
  isYearlyMode: false,
  activeCategory: 'Gabungan',
  activeMetric: 'BOR',
  tgl_awal: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substr(0, 10),
  tgl_akhir: new Date().toISOString().substr(0, 10),
  tahun: new Date().getFullYear()
})

const overallData = ref({})
const breakdownData = ref([])
const yearlyData = ref({ months: [] })

const currentData = computed(() => {
  if (filters.isYearlyMode) {
      if (overallData.value && overallData.value.indicators) {
          return overallData.value
      }
      
      // Fallback for non-Gabungan categories in yearly mode if aggregate failed (averaging months)
      if (!yearlyData.value.months || yearlyData.value.months.length === 0) return {}
      
      const count = yearlyData.value.months.filter(m => m.bor > 0).length || 1
      const sum = yearlyData.value.months.reduce((acc, m) => {
          acc.bor += m.bor
          acc.avlos += m.avlos
          acc.toi += m.toi
          acc.bto += m.bto
          return acc
      }, { bor: 0, avlos: 0, toi: 0, bto: 0 })

      return {
          indicators: {
              bor: (sum.bor / count).toFixed(2),
              avlos: (sum.avlos / count).toFixed(2),
              toi: (sum.toi / count).toFixed(2),
              bto: (sum.bto).toFixed(2) // BTO is usually cumulative for the year
          }
      }
  }

  if (filters.activeCategory === 'Gabungan') {
    return overallData.value || {}
  }
  return breakdownData.value.find(d => d.category === filters.activeCategory) || {}
})

const yearRange = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

// BOR Gauge Logic
const borProgressStyle = computed(() => {
  const bor = parseFloat(currentData.value.indicators?.bor || 0)
  const offset = 283 - (283 * (bor / 100).clamp(0, 1))
  
  let color = '#10b981' // Ideal
  if (bor < 60) color = '#f59e0b' // Lo
  if (bor > 85) color = '#ef4444' // High
  
  return {
    strokeDashoffset: offset,
    stroke: color
  }
})

const borStatusText = computed(() => {
  const bor = parseFloat(currentData.value.indicators?.bor || 0)
  if (bor >= 60 && bor <= 85) return "Status: Ideal (60-85%)"
  if (bor < 60) return "Status: Terlalu Rendah"
  return "Status: Over Capacity"
})

const borStatusStyle = computed(() => {
  const bor = parseFloat(currentData.value.indicators?.bor || 0)
  let bg = '#ecfdf5', text = '#10b981'
  if (bor < 60) { bg = '#fffbeb'; text = '#f59e0b' }
  if (bor > 85) { bg = '#fef2f2'; text = '#ef4444' }
  return { backgroundColor: bg, color: text }
})

const svgParams = reactive({
  width: 1000,
  height: 300,
  viewBox: '0 0 1000 300'
})

const updateDimensions = () => {
  const width = window.innerWidth
  if (width < 768) {
    // Mobile dimensions: narrower coordinate system to prevent excessive shrinking
    // Height taller to utilize vertical space
    svgParams.width = 600
    svgParams.height = 350
    svgParams.viewBox = '0 0 600 350'
  } else {
    // Desktop dimensions
    svgParams.width = 1000
    svgParams.height = 300
    svgParams.viewBox = '0 0 1000 300'
  }
}

// Chart Logic
const chartPoints = computed(() => {
  if (!yearlyData.value.months) return []
  const metric = filters.activeMetric.toLowerCase()
  
  // Find max value for scaling
  const vals = yearlyData.value.months.map(m => parseFloat(m[metric]) || 0)
  const max = Math.max(...vals, metric === 'bor' ? 100 : 10) * 1.2

  const chartWidth = svgParams.width - 60 // margins
  const chartHeight = svgParams.height - 60
  const marginLeft = 30
  const marginTop = 30

  // Check if we need to hide labels collision (if needed in logic)
  return yearlyData.value.months.map((m, i) => {
    const val = parseFloat(m[metric]) || 0
    const x = marginLeft + (i * (chartWidth / 11))
    const y = marginTop + (chartHeight - (val / max * chartHeight))
    
    return {
      x: x,
      y: y,
      val: val,
      month: m.month_name.substr(0, 3)
    }
  })
})

const chartPathData = computed(() => {
  if (chartPoints.value.length === 0) return { line: '', area: '' }
  
  let d = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  for (let i = 1; i < chartPoints.value.length; i++) {
    const prev = chartPoints.value[i-1]
    const curr = chartPoints.value[i]
    
    // Adjust curve tension based on width to avoid loops in tight spaces
    const midX = (prev.x + curr.x) / 2
    d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
  }
  
  const bottomY = svgParams.height - 20 // Near bottom
  const lastPoint = chartPoints.value[chartPoints.value.length-1]
  const firstPoint = chartPoints.value[0]
  const area = `${d} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`
  
  return { line: d, area: area }
})

const getBorBadgeStyle = (bor) => {
    let bg = '#ecfdf5', text = '#10b981', border = '#10b98122'
    if (bor < 60) { bg = '#fffbeb'; text = '#f59e0b'; border = '#f59e0b22' }
    if (bor > 85) { bg = '#fef2f2'; text = '#ef4444'; border = '#ef444422' }
    return { backgroundColor: bg, color: text, borderColor: border }
}

const getBorColor = (bor) => {
    if (bor >= 60 && bor <= 85) return '#10b981'
    if (bor < 60) return '#f59e0b'
    return '#ef4444'
}

// Methods
const fetchData = async () => {
  loading.value = true
  try {
    if (filters.isYearlyMode) {
      const res = await ranapStatistikService.getYearlyIndicators({
        tahun: filters.tahun,
        kategori: filters.activeCategory
      })
      yearlyData.value = res.data.data
      // In yearly mode, our backend now returns the specific category aggregate in data.overall
      overallData.value = res.data.data.overall || {}
    } else {
      const res = await ranapStatistikService.getIndicators({
        tgl_awal: filters.tgl_awal,
        tgl_akhir: filters.tgl_akhir
      })
      overallData.value = res.data.data.overall
      breakdownData.value = res.data.data.breakdown
    }
    dataLoaded.value = true
  } catch (error) {
    console.error('Error fetching statistik ranap:', error)
  } finally {
    loading.value = false
  }
}

const setYearlyMode = (mode) => {
  filters.isYearlyMode = mode
  fetchData()
}

const getCategoryLabel = (val) => {
  const cat = categories.find(c => c.value === val)
  return cat ? cat.label : val
}

const setActiveCategory = (cat) => {
  filters.activeCategory = cat
  if (filters.isYearlyMode) {
    fetchData()
  }
}

// Utils
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
  fetchData()
})
</script>

<style scoped>
.statistik-ranap-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.card {
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02) !important;
}

.card-header {
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding: 1rem 1.5rem !important;
  text-align: left !important;
}

.card-title-sm {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.header-icon-bg {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
}

.tracking-tight { letter-spacing: -0.025em; }

/* Mode Toggle */
.mode-toggle-group {
  display: flex;
  width: fit-content;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
}

.mode-pill-btn {
  border: none;
  background: transparent;
  color: #64748b;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.mode-pill-btn.active {
  background: white;
  color: #1e40af;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  border: 1px solid #bfdbfe;
}

.category-tabs-wrapper {
  border-bottom: 1px solid #e2e8f0 !important;
  background-color: #ffffff;
}

/* Category Tabs */
.category-tabs {
  gap: 2rem;
}

.category-tab {
  background: transparent;
  border: none;
  padding: 1.25rem 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #64748b;
  position: relative;
  transition: all 0.3s;
  white-space: nowrap;
}

.category-tab:hover {
  color: #3b82f6;
}

.category-tab.active {
  color: #1e3a8a;
}

.category-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #3b82f6;
  border-radius: 3px 3px 0 0;
}

.filter-row {
  background-color: #f8fafc !important;
  border-top: 1px solid #e2e8f0;
}

.filter-row .form-control,
.filter-row .form-select {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  color: #334155;
  transition: all 0.2s ease;
}

.filter-row .form-control:focus,
.filter-row .form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.4rem;
  display: block;
}

/* Gauge */
.bor-gauge-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
}

.bor-gauge {
  transform: rotate(-90deg);
}

.bor-gauge-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 8;
}

.bor-gauge-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s ease, stroke 1s ease;
}

.bor-gauge-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.bor-gauge-value .value {
  display: block;
  font-size: 1.85rem;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}

.bor-gauge-value .label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 800;
}

/* Metric Cards */
.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.25rem;
}

.bg-blue-subtle { background-color: #eff6ff; }
.bg-green-subtle { background-color: #f0fdf4; }
.bg-orange-subtle { background-color: #fff7ed; }
.text-orange { color: #f97316; }

.metric-standard {
  font-size: 0.7rem;
  color: #94a3b8;
  background: #f8fafc;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
}

.text-xs { font-size: 0.65rem; }
.x-small { font-size: 0.6rem; }

/* BOR Kelas Cards */
.bor-kelas-card {
  transition: transform 0.2s;
}

.bor-kelas-card:hover {
  transform: translateY(-3px);
}

.bor-mini-progress {
  height: 4px;
  background-color: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.bor-mini-progress .progress-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 1s ease;
}

/* Chart SVG */
.trend-chart-svg {
  filter: drop-shadow(0 10px 15px rgba(59, 130, 246, 0.1));
}

/* Trend Metric Selector */
.metric-selector {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.metric-btn {
  border: none;
  background: transparent;
  color: #64748b;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
}

.metric-btn.active {
  background: white;
  color: #1e40af;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #bfdbfe;
}

.chart-line-anim {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: drawLine 1.5s ease forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

.chart-dot {
  cursor: pointer;
  transition: r 0.2s;
}

.chart-dot:hover {
  r: 8;
}

/* Table */
.styled-table thead th {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 0;
}

.styled-table tbody td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

/* Custom scrollbar for tabs */
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .statistik-ranap-container {
    padding: 0.75rem !important;
  }

  .page-header {
    padding: 1.25rem 1rem !important;
    border-radius: 16px !important;
  }

  .header-icon-bg {
    width: 44px;
    height: 44px;
  }

  .page-title {
    font-size: 1.25rem !important;
  }

  .page-subtitle {
    font-size: 0.8rem !important;
  }

  .mode-toggle-group {
    width: 100%;
    justify-content: stretch;
  }

  .mode-pill-btn {
    flex: 1;
    padding: 10px 16px;
    font-size: 0.8rem;
  }

  /* Category Tabs - Horizontal Scroll */
  .category-tabs-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .category-tabs {
    gap: 1rem;
    padding-bottom: 0.5rem;
  }

  .category-tab {
    padding: 1rem 0.25rem;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* Filter Row */
  .filter-row {
    padding: 1rem !important;
  }

  .filter-label {
    font-size: 0.65rem;
  }

  /* BOR Gauge - Smaller on Mobile */
  .bor-gauge-wrapper {
    width: 130px !important;
    height: 130px !important;
  }

  .bor-gauge-value .value {
    font-size: 1.75rem !important;
  }

  .bor-gauge-value .label {
    font-size: 0.65rem !important;
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 5px 12px;
  }

  /* Metric Cards - Stack on Mobile */
  .row.g-4 {
    gap: 1rem !important;
  }

  .metric-card h6 {
    font-size: 0.7rem;
  }

  .metric-card h3 {
    font-size: 1.5rem;
  }

  .metric-card p {
    font-size: 0.75rem;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .metric-standard {
    font-size: 0.65rem;
  }

  /* Raw Metrics */
  .raw-metrics-card {
    font-size: 0.8rem;
  }

  .raw-metrics-card .text-xs {
    font-size: 0.6rem !important;
  }

  /* Trend Card */
  .trend-card {
    padding: 1rem !important;
  }

  .trend-card h5 {
    font-size: 0.9rem !important;
  }

  .metric-selector {
    width: 100%;
  }

  .metric-selector .btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }

  .metric-selector {
    width: 100%;
  }

  .metric-selector .btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.6rem;
  }

  /* Chart Container - Logic handled by dynamic viewBox now */
  .chart-container {
    margin-top: 1rem;
  }

  /* Hide odd month labels on mobile to reduce clutter */
  .month-label-odd {
    display: none;
  }

  /* Table Responsive */
  .styled-table {
    font-size: 0.8rem;
  }

  .styled-table thead th {
    font-size: 0.65rem;
    padding: 0.75rem 0.5rem;
  }

  .styled-table tbody td {
    padding: 0.75rem 0.5rem;
  }

  .styled-table .badge {
    font-size: 0.7rem;
    padding: 4px 8px;
  }

  /* Cards General */
  .card {
    border-radius: 16px !important;
  }

  .filters-card .card-body {
    padding: 0 !important;
  }

  /* Adjust spacing for mobile */
  .mb-4 {
    margin-bottom: 1rem !important;
  }

  /* Form Controls */
  .form-control-sm,
  .form-select-sm {
    font-size: 0.8rem;
  }

  /* Button */
  .btn-sm {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }
}

/* Extra Small Devices */
@media (max-width: 480px) {
  .page-title {
    font-size: 1.1rem !important;
  }

  .bor-gauge-wrapper {
    width: 110px !important;
    height: 110px !important;
  }

  .bor-gauge-value .value {
    font-size: 1.5rem !important;
  }

  .metric-card h3 {
    font-size: 1.25rem;
  }

  /* Chart Container */
  .chart-container {
    /* No override needed */
  }

  /* Extra emphasis on chart elements for very small screens */
  .chart-dot {
    r: 8 !important;
    stroke-width: 4 !important;
  }

  .category-tab {
    font-size: 0.75rem;
  }
}
</style>
