<template>
  <div class="dashboard-inmut">

    <!-- ===== HERO HEADER ===== -->
    <div class="hero-header mb-4">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div class="hero-badge mb-2">
              <i class="fas fa-shield-alt me-1"></i> PMKP – Peningkatan Mutu & Keselamatan Pasien
            </div>
            <h2 class="hero-title mb-1">Dashboard Indikator Mutu</h2>
            <p class="hero-subtitle mb-0">
              Pantau capaian mutu rumah sakit secara real-time berdasarkan kategori indikator
            </p>
          </div>
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <!-- Period Filter -->
            <div class="filter-glass">
              <label class="filter-label"><i class="fas fa-calendar me-1"></i> Periode</label>
              <input
                type="month"
                class="filter-input"
                v-model="filters.bulan"
                @change="fetchAll"
              />
            </div>
            <button class="btn-refresh" @click="fetchAll" :disabled="loading.any">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading.any }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== LOADING STATE ===== -->
    <div v-if="loading.any && !hasSomeData" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <p class="mt-3 text-muted">Memuat data dashboard...</p>
      </div>
    </div>

    <template v-else>
      <!-- ===== GLOBAL SUMMARY CARDS ===== -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="summary-card summary-total">
            <div class="summary-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ globalStats.total }}</div>
              <div class="summary-label">Total Indikator</div>
            </div>
            <div class="summary-pulse"></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="summary-card summary-achieved">
            <div class="summary-icon">
              <i class="fas fa-check-double"></i>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ globalStats.tercapai }}</div>
              <div class="summary-label">Tercapai</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="summary-card summary-failed">
            <div class="summary-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ globalStats.tidakTercapai }}</div>
              <div class="summary-label">Tidak Tercapai</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="summary-card summary-rate">
            <div class="summary-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="summary-info">
              <div class="summary-value">{{ globalStats.ratePercent }}%</div>
              <div class="summary-label">Tingkat Keberhasilan</div>
            </div>
            <div class="summary-trend" :class="globalStats.ratePercent >= 80 ? 'trend-up' : 'trend-down'">
              <i :class="globalStats.ratePercent >= 80 ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down'"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== KATEGORI SECTIONS ===== -->
      <div v-for="(kategori, ki) in kategoris" :key="ki" class="kategori-section mb-5">

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
              <small class="text-white opacity-75">Keberhasilan Keseluruhan</small>
              <small class="text-white fw-bold">{{ kategorisData[ki]?.tercapai ?? 0 }} / {{ kategorisData[ki]?.total ?? 0 }}</small>
            </div>
            <div class="section-progress-bar">
              <div
                class="section-progress-fill"
                :style="{ width: (kategorisData[ki]?.ratePercent ?? 0) + '%' }"
              ></div>
            </div>
          </div>
        </div>

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
                  <span class="score-label">Capaian Bulan Ini</span>
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

    </template>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'

const toast = useToast()

const filters = reactive({
  bulan: new Date().toISOString().slice(0, 7) // YYYY-MM
})

// Define the 3 categories
const kategoris = [
  {
    key: 'nasional',
    nama: 'Indikator Mutu Nasional',
    desc: 'Indikator yang ditetapkan secara nasional oleh Kemenkes RI',
    icon: 'fas fa-flag',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
  },
  {
    key: 'prioritas_rs',
    nama: 'Indikator Mutu Prioritas Rumah Sakit',
    desc: 'Indikator prioritas yang ditetapkan oleh manajemen rumah sakit',
    icon: 'fas fa-hospital',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)'
  },
  {
    key: 'prioritas_unit',
    nama: 'Indikator Mutu Prioritas Unit',
    desc: 'Indikator mutu yang dikelola oleh masing-masing unit pelayanan',
    icon: 'fas fa-door-open',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10b981)'
  }
]

// Data keyed by kategori index
const kategorisData = reactive({
  0: { items: [], total: 0, tercapai: 0, tidakTercapai: 0, ratePercent: 0 },
  1: { items: [], total: 0, tercapai: 0, tidakTercapai: 0, ratePercent: 0 },
  2: { items: [], total: 0, tercapai: 0, tidakTercapai: 0, ratePercent: 0 }
})

const loading = reactive({
  0: false,
  1: false,
  2: false,
  any: false
})

const hasSomeData = computed(() =>
  kategorisData[0].items.length > 0 ||
  kategorisData[1].items.length > 0 ||
  kategorisData[2].items.length > 0
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

// Map kategori names for the API
const kategoriApiMap = [
  'Indikator Mutu Nasional',
  'Indikator Mutu Prioritas Rumah Sakit',
  'Indikator Mutu Prioritas Unit'
]

const fetchKategori = async (index) => {
  loading[index] = true
  loading.any = true
  try {
    // Fetch master indicators for this category
    const masterRes = await api.getUtama({
      limit: 100,
      page: 1,
      kategori: kategoriApiMap[index],
      status: '1'
    })
    const masterData = masterRes.data.data
    const masterItems = masterData.data || []

    // For each master indicator, try to fetch monitoring data
    const [bulanYear, bulanMonth] = filters.bulan.split('-')
    const monitoringRes = await api.getMonitoring({
      bulan: filters.bulan,
      limit: 100,
      page: 1
    })
    const monitoringItems = monitoringRes.data?.data?.data || []

    // Merge: for each master item, find monitoring data
    const mergedItems = masterItems.map(master => {
      const monitoring = monitoringItems.find(m =>
        m.id_master === master.id_master ||
        m.nama_inmut === master.nama_indikator
      )
      return {
        ...master,
        // monitoring API uses: score, total_num, total_denum, last_filled
        capaian: monitoring ? parseFloat(monitoring.score) : null,
        total_numerator: monitoring ? monitoring.total_num : null,
        total_denominator: monitoring ? monitoring.total_denum : null,
        last_filled: monitoring ? monitoring.last_filled : null,
        // rumus from monitoring (numeric codes)
        rumus_code: monitoring ? (monitoring.rumus || monitoring.rumus_utama) : (master.rumus || null)
      }
    })

    // Calculate stats
    const tercapai = mergedItems.filter(item => isTargetMet(item)).length
    const tidakTercapai = mergedItems.filter(item => item.capaian != null && !isTargetMet(item)).length
    const ratePercent = mergedItems.length > 0
      ? Math.round((tercapai / mergedItems.length) * 100)
      : 0

    kategorisData[index] = {
      items: mergedItems,
      total: mergedItems.length,
      tercapai,
      tidakTercapai,
      ratePercent
    }
  } catch (error) {
    console.error(`Error fetching kategori ${index}:`, error)
    // Silently fail - show empty state
  } finally {
    loading[index] = false
    loading.any = Object.keys(loading).filter(k => k !== 'any').some(k => loading[k])
  }
}

const fetchAll = async () => {
  loading.any = true
  await Promise.all([fetchKategori(0), fetchKategori(1), fetchKategori(2)])
  loading.any = false
}

// Helpers
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
  padding: 0;
  min-height: 100vh;
  background: #f0f2f5;
}

/* ===== HERO HEADER ===== */
.hero-header {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%);
  box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content { position: relative; z-index: 1; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.9);
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  color: rgba(255,255,255,0.75);
  font-size: 0.95rem;
}

.filter-glass {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 8px 14px;
  backdrop-filter: blur(8px);
}

.filter-label {
  display: block;
  color: rgba(255,255,255,0.7);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.filter-input {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
  width: 140px;
  cursor: pointer;
}
.filter-input::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.btn-refresh:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }
.btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

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
.summary-card {
  position: relative;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.summary-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important; }

.summary-total {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 4px 20px rgba(79,70,229,0.25);
}
.summary-achieved {
  background: linear-gradient(135deg, #059669, #10b981);
  box-shadow: 0 4px 20px rgba(5,150,105,0.25);
}
.summary-failed {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  box-shadow: 0 4px 20px rgba(220,38,38,0.25);
}
.summary-rate {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  box-shadow: 0 4px 20px rgba(217,119,6,0.25);
}

.summary-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; color: white; flex-shrink: 0;
}
.summary-value {
  font-size: 2rem; font-weight: 800; color: white; line-height: 1;
}
.summary-label { font-size: 0.78rem; color: rgba(255,255,255,0.8); font-weight: 500; margin-top: 2px; }
.summary-pulse {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.08);
}
.summary-trend {
  position: absolute; right: 12px; bottom: 12px;
  font-size: 1rem; opacity: 0.6;
}
.trend-up { color: #d1fae5; }
.trend-down { color: #fee2e2; }

/* ===== SECTION HEADER ===== */
.kategori-section {}

.section-header {
  background: var(--cat-gradient);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.section-header-inner {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
}

.section-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; color: white; flex-shrink: 0;
}

.section-title { font-size: 1.1rem; font-weight: 700; color: white; margin: 0; }
.section-desc { font-size: 0.8rem; color: rgba(255,255,255,0.75); }

.section-badge-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.section-badge {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 600;
}
.badge-total { background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); }
.badge-ok { background: rgba(209,250,229,0.25); color: #d1fae5; border: 1px solid rgba(209,250,229,0.4); }
.badge-warn { background: rgba(254,243,199,0.25); color: #fef3c7; border: 1px solid rgba(254,243,199,0.4); }

.section-progress-wrap {}
.section-progress-bar {
  height: 8px; border-radius: 4px; background: rgba(255,255,255,0.2); overflow: visible; position: relative;
}
.section-progress-fill {
  height: 100%; border-radius: 4px;
  background: rgba(255,255,255,0.9);
  transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
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
  .hero-header { padding: 1.25rem; border-radius: 14px; }
  .hero-title { font-size: 1.3rem; }
  .section-header { padding: 1rem 1.25rem; border-radius: 12px; }
  .section-header-inner { gap: 0.75rem; }
  .section-badge-group { gap: 0.35rem; }
  .filter-input { width: 110px; }
}
</style>
