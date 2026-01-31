<template>
  <div class="statistik-ranap-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="dashboard-header brand-gradient shadow-lg rounded-4 p-4 mb-4 text-white">
      <div class="row align-items-center">
        <div class="col-md-7">
          <div class="d-flex align-items-center mb-2">
            <div class="header-icon-bg me-3 glass-effect">
              <i class="fas fa-chart-line fa-2x"></i>
            </div>
            <div>
              <h3 class="mb-0 fw-bold tracking-tight">Statistik Rawat Inap</h3>
              <p class="mb-0 opacity-75">Indikator Mutu Pelayanan Tempat Tidur</p>
            </div>
          </div>
        </div>
        
        <!-- Quick Mode Selector -->
        <div class="col-md-5 mt-3 mt-md-0 d-flex justify-content-md-end">
          <div class="mode-toggle-group glass-effect rounded-pill p-1">
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
              :key="cat"
              @click="setActiveCategory(cat)"
              :class="['category-tab', { active: filters.activeCategory === cat }]"
            >
              {{ cat }}
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
                <div class="metric-standard mt-2">Std: 6-9 hari</div>
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
                <div class="metric-standard mt-2">Std: 1-3 hari</div>
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
                <div class="metric-standard mt-2">Std: 40-50 kali</div>
              </div>
            </div>
            
            <!-- Raw Metrics Block -->
            <div class="col-12 mt-2">
              <div class="raw-metrics-card card border-0 bg-white shadow-sm rounded-4 p-3">
                <div class="row text-center g-0">
                  <div class="col-4 border-end">
                    <span class="d-block text-muted text-xs fw-bold">A (Jml Bed)</span>
                    <span class="fw-bold">{{ currentData.raw_metrics?.A || (currentData.metrics?.A || 0) }}</span>
                  </div>
                  <div class="col-4 border-end">
                    <span class="d-block text-muted text-xs fw-bold">HP (Hari Rawat)</span>
                    <span class="fw-bold">{{ currentData.raw_metrics?.HP || (currentData.metrics?.HP || 0) }}</span>
                  </div>
                  <div class="col-4">
                    <span class="d-block text-muted text-xs fw-bold">D (Pasien Keluar)</span>
                    <span class="fw-bold">{{ currentData.raw_metrics?.D || (currentData.metrics?.D || 0) }}</span>
                  </div>
                </div>
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
              <div class="metric-selector btn-group btn-group-sm rounded-3 shadow-sm overflow-hidden">
                <button 
                  v-for="m in ['BOR', 'AVLOS', 'TOI', 'BTO']" 
                  :key="m"
                  @click="filters.activeMetric = m"
                  :class="['btn', filters.activeMetric === m ? 'btn-primary' : 'btn-light']"
                >
                  {{ m }}
                </button>
              </div>
            </div>
            
            <div class="chart-container" style="height: 300px; position: relative;">
               <svg class="trend-chart-svg" width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet">
                  <!-- Grid Lines -->
                  <line v-for="i in 5" :key="'grid'+i" x1="50" :y1="i*50 + 20" x2="950" :y2="i*50 + 20" stroke="#f1f5f9" stroke-width="1" />
                  
                  <!-- Area -->
                  <path :d="chartPathData.area" fill="url(#chartGradient)" opacity="0.15" />
                  
                  <!-- Line -->
                  <path :d="chartPathData.line" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-line-anim" />
                  
                  <!-- Dots and Values -->
                  <g v-for="(p, i) in chartPoints" :key="'dot'+i">
                    <circle 
                      :cx="p.x" 
                      :cy="p.y" 
                      r="5" 
                      fill="white" 
                      stroke="#3b82f6" 
                      stroke-width="2.5" 
                      class="chart-dot"
                    />
                    <text 
                      :x="p.x" 
                      :y="p.y - 12" 
                      text-anchor="middle" 
                      font-size="13" 
                      font-weight="700" 
                      fill="#1e3a8a"
                      font-family="system-ui, -apple-system, sans-serif"
                    >{{ p.val }}</text>
                  </g>
                  
                  <!-- Month Labels -->
                  <g v-for="(p, i) in chartPoints" :key="'lbl'+i">
                    <text 
                      :x="p.x" 
                      y="285" 
                      text-anchor="middle" 
                      font-size="11" 
                      fill="#94a3b8" 
                      font-weight="600"
                      font-family="system-ui, -apple-system, sans-serif"
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
          <h6 class="mb-0 fw-bold"><i class="fas fa-table me-2 text-primary"></i>Rincian Data Bulanan - {{ filters.activeCategory }}</h6>
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
const categories = ["Gabungan", "Anak", "Kandungan", "BYC", "ICU", "Isolasi"]
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
      // For yearly mode, currentData could be a summary of all months or just empty-ish?
      // In mobile app, in yearly mode, the main cards are not shown as prominently or 
      // they might show the average of the months.
      // Let's calculate the average for yearly mode main cards.
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

// Chart Logic
const chartPoints = computed(() => {
  if (!yearlyData.value.months) return []
  const metric = filters.activeMetric.toLowerCase()
  
  // Find max value for scaling
  const vals = yearlyData.value.months.map(m => parseFloat(m[metric]) || 0)
  const max = Math.max(...vals, metric === 'bor' ? 100 : 10) * 1.2

  const chartWidth = 900  // 950 - 50 (margins)
  const chartHeight = 240 // 270 - 30 (top margin)
  const marginLeft = 50
  const marginTop = 30

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
    // Smooth bezier curve
    const prev = chartPoints.value[i-1]
    const curr = chartPoints.value[i]
    const midX = (prev.x + curr.x) / 2
    d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`
  }
  
  // Create area path by closing to bottom
  const lastPoint = chartPoints.value[chartPoints.value.length-1]
  const firstPoint = chartPoints.value[0]
  const area = `${d} L ${lastPoint.x} 270 L ${firstPoint.x} 270 Z`
  
  return { line: d, area: area }
})

const getBorBadgeStyle = (bor) => {
    let bg = '#ecfdf5', text = '#10b981', border = '#10b98122'
    if (bor < 60) { bg = '#fffbeb'; text = '#f59e0b'; border = '#f59e0b22' }
    if (bor > 85) { bg = '#fef2f2'; text = '#ef4444'; border = '#ef444422' }
    return { backgroundColor: bg, color: text, borderColor: border }
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

const setActiveCategory = (cat) => {
  filters.activeCategory = cat
  // For yearly mode, category change requires new fetch
  if (filters.isYearlyMode) {
    fetchData()
  }
}

// Utils
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.statistik-ranap-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.brand-gradient {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-icon-bg {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tracking-tight { letter-spacing: -0.025em; }

/* Mode Toggle */
.mode-toggle-group {
  display: flex;
  width: fit-content;
}

.mode-pill-btn {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.mode-pill-btn.active {
  background: white;
  color: #1e3a8a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  font-size: 2.25rem;
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

/* Chart SVG */
.trend-chart-svg {
  filter: drop-shadow(0 10px 15px rgba(59, 130, 246, 0.1));
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

@media (max-width: 768px) {
  .bor-gauge-wrapper {
    width: 140px;
    height: 140px;
  }
}
</style>
