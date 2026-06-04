<template>
  <div class="diklat-dashboard-page">
    <main class="dashboard-main">
      <!-- Welcome & Filter Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>Dashboard Diklat 📊</h2>
            <p>Monitoring Pendidikan, Pelatihan, & Kepatuhan Sertifikasi Karyawan</p>
          </div>
          <div class="filter-actions d-flex flex-nowrap align-items-center gap-3">
            <div class="filter-year-container">
              <i class="fas fa-calendar-alt text-muted me-2"></i>
              <select v-model="selectedYear" class="form-select year-select" @change="fetchStats">
                <option v-for="year in yearOptions" :key="year" :value="year">Tahun {{ year }}</option>
              </select>
            </div>
            <button 
              @click="fetchStats" 
              class="btn-refresh"
              :class="{ 'reloading': loading }"
              title="Refresh Data"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="dashboard-loading-state py-5 text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted fw-bold">Memuat statistik dashboard diklat...</p>
      </div>

      <template v-else>
        <!-- KPI Cards -->
        <section class="stats-section mb-4">
          <div class="stats-grid">
            <!-- 1. Total Kegiatan -->
            <div class="stat-card blue-gradient-hover">
              <div class="card-glass-overlay"></div>
              <div class="stat-icon-wrapper blue-gradient">
                <i class="fas fa-cubes"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.kpis?.total_kegiatan || 0 }}</h3>
                <p>Total Kegiatan Diklat</p>
                <span class="stat-trend neutral">Tahun {{ selectedYear }}</span>
              </div>
            </div>

            <!-- 2. Peserta Terlatih (Unique) -->
            <div class="stat-card emerald-gradient-hover">
              <div class="card-glass-overlay"></div>
              <div class="stat-icon-wrapper emerald-gradient">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.kpis?.total_peserta_unik || 0 }}</h3>
                <p>Karyawan Terlatih</p>
                <span class="stat-trend positive">{{ getTrainedPercentage }}% dari Total Karyawan</span>
              </div>
            </div>

            <!-- 3. Total Jam Pelajaran (JPL) -->
            <div class="stat-card amber-gradient-hover">
              <div class="card-glass-overlay"></div>
              <div class="stat-icon-wrapper amber-gradient">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.kpis?.total_jam_diklat_karyawan?.toLocaleString() || 0 }}</h3>
                <p>Total Jam Pelatihan (JPL)</p>
                <span class="stat-trend neutral">Akumulasi Jam Diklat</span>
              </div>
            </div>

            <!-- 4. Rata-rata Jam Karyawan -->
            <div class="stat-card rose-gradient-hover">
              <div class="card-glass-overlay"></div>
              <div class="stat-icon-wrapper rose-gradient">
                <i class="fas fa-graduation-cap"></i>
              </div>
              <div class="stat-content">
                <h3>{{ stats.kpis?.rata_jam_karyawan || 0 }} <small class="fs-6 fw-normal">Jam</small></h3>
                <p>Rata-rata JPL / Karyawan</p>
                <span class="stat-trend" :class="stats.kpis?.rata_jam_karyawan >= 20 ? 'positive' : 'negative'">
                  Target KARS: 20 Jam / Thn
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Starkes Compliance & Charts Grid -->
        <section class="compliance-charts-section mb-4">
          <div class="row g-4">
            <!-- Left: Starkes Radial Compliance Rings -->
            <div class="col-lg-5">
              <div class="dashboard-card h-100">
                <div class="card-header-premium">
                  <h4><i class="fas fa-award text-warning me-2"></i>Kepatuhan Sertifikasi Wajib Starkes</h4>
                  <p>Persentase staf aktif terlatih per topik wajib</p>
                </div>
                <div class="card-body-premium compliance-body">
                  <div class="compliance-grid">
                    <div v-for="item in stats.compliance_stats" :key="item.topic" class="compliance-ring-card">
                      <div class="radial-chart-wrapper">
                        <VueApexCharts 
                          type="radialBar" 
                          height="130" 
                          :options="getRadialOptions(item.topic, getTopicColor(item.topic))" 
                          :series="[item.percentage]"
                        />
                      </div>
                      <div class="compliance-text">
                        <span class="topic-title">{{ item.topic }}</span>
                        <span class="topic-count">{{ item.trained_staff }} / {{ stats.kpis?.total_pegawai_aktif }} Staf</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Mixed Trend & Category Chart -->
            <div class="col-lg-7">
              <div class="dashboard-card h-100">
                <div class="card-header-premium flex justify-between items-center">
                  <div>
                    <h4><i class="fas fa-chart-bar text-primary me-2"></i>Tren Bulanan Kegiatan & Peserta</h4>
                    <p>Jumlah kegiatan dan total partisipan bulanan tahun {{ selectedYear }}</p>
                  </div>
                </div>
                <div class="card-body-premium">
                  <div v-if="stats.monthly_trend?.length" class="trend-chart-wrapper">
                    <VueApexCharts 
                      type="line" 
                      height="260" 
                      :options="trendChartOptions" 
                      :series="trendChartSeries"
                    />
                  </div>
                  <div v-else class="text-center py-5 text-muted">Belum ada data bulanan</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Category Composition & Unit Stats Split Section -->
        <section class="mid-section mb-4">
          <div class="row g-4">
            <!-- Left: Kategori Pie/Donut Chart -->
            <div class="col-md-5">
              <div class="dashboard-card h-100">
                <div class="card-header-premium">
                  <h4><i class="fas fa-chart-pie text-success me-2"></i>Kategori Penyelenggaraan</h4>
                  <p>Distribusi pelatihan internal vs eksternal</p>
                </div>
                <div class="card-body-premium d-flex flex-column justify-center align-center">
                  <div v-if="stats.category_stats?.length" class="donut-chart-wrapper py-3">
                    <VueApexCharts 
                      type="donut" 
                      height="220" 
                      :options="categoryChartOptions" 
                      :series="categoryChartSeries"
                    />
                  </div>
                  <div v-else class="text-center py-5 text-muted w-100">Belum ada data kategori</div>
                </div>
              </div>
            </div>

            <!-- Right: Unit Teraktif (JPL) -->
            <div class="col-md-7">
              <div class="dashboard-card h-100">
                <div class="card-header-premium">
                  <h4><i class="fas fa-sitemap text-info me-2"></i>Peringkat Unit Teraktif (JPL Terbanyak)</h4>
                  <p>10 Unit dengan akumulasi jam pelatihan tertinggi</p>
                </div>
                <div class="card-body-premium">
                  <div v-if="stats.unit_stats?.length" class="unit-chart-wrapper">
                    <VueApexCharts 
                      type="bar" 
                      height="220" 
                      :options="unitChartOptions" 
                      :series="unitChartSeries"
                    />
                  </div>
                  <div v-else class="text-center py-5 text-muted">Belum ada data unit</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Bottom Split Section (Agenda & Top Learners) -->
        <section class="bottom-section">
          <div class="row g-4">
            <!-- Left: Upcoming Events -->
            <div class="col-md-6">
              <div class="dashboard-card h-100">
                <div class="card-header-premium flex justify-between items-center">
                  <div>
                    <h4><i class="fas fa-calendar-check text-indigo-500 me-2"></i>Agenda Kegiatan Terdekat</h4>
                    <p>Daftar pelatihan mendatang yang terdaftar</p>
                  </div>
                  <router-link to="/diklat/kegiatan" class="btn-manage-link">
                    Kelola Kegiatan <i class="fas fa-arrow-right ms-1"></i>
                  </router-link>
                </div>
                <div class="card-body-premium py-2">
                  <div v-if="stats.upcoming_events?.length" class="upcoming-list">
                    <div v-for="event in stats.upcoming_events" :key="event.id" class="upcoming-item">
                      <div class="event-date-pill" :class="event.kategori === 'Internal' ? 'internal' : 'external'">
                        <span class="day">{{ formatDay(event.tgl_mulai) }}</span>
                        <span class="month">{{ formatMonth(event.tgl_mulai) }}</span>
                      </div>
                      <div class="event-details">
                        <h5>{{ event.nama_kegiatan }}</h5>
                        <div class="event-meta">
                          <span><i class="fas fa-map-marker-alt me-1"></i>{{ event.tempat || '-' }}</span>
                          <span><i class="fas fa-clock me-1"></i>{{ event.jpl || 0 }} JPL</span>
                          <span class="badge" :class="event.kategori === 'Internal' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'">
                            {{ event.kategori }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-upcoming-state text-center py-5 text-muted">
                    <i class="far fa-calendar-times fs-2 mb-2 d-block"></i>
                    Belum ada agenda pelatihan dalam waktu dekat
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Top Active Learners -->
            <div class="col-md-6">
              <div class="dashboard-card h-100">
                <div class="card-header-premium">
                  <h4><i class="fas fa-fire text-danger me-2"></i>Karyawan Teraktif</h4>
                  <p>5 Karyawan dengan jam pelatihan (JPL) terbanyak</p>
                </div>
                <div class="card-body-premium">
                  <div v-if="stats.top_learners?.length" class="top-learners-list">
                    <div v-for="(learner, index) in stats.top_learners" :key="learner.nik" class="learner-item">
                      <div class="learner-rank" :class="'rank-' + (index + 1)">
                        {{ index + 1 }}
                      </div>
                      <div class="learner-avatar">
                        {{ getInitials(learner.nama) }}
                      </div>
                      <div class="learner-info">
                        <h5>{{ learner.nama }}</h5>
                        <p class="nik">{{ learner.nik }}</p>
                      </div>
                      <div class="learner-stats">
                        <span class="jpl">{{ learner.total_jpl }} <small>JPL</small></span>
                        <span class="badge bg-secondary-subtle text-secondary">{{ learner.total_kegiatan }} Kegiatan</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-5 text-muted">Belum ada data peringkat</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { diklatService } from '@/services/diklatService'
import VueApexCharts from 'vue3-apexcharts'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

const loading = ref(true)
const selectedYear = ref(new Date().getFullYear())
const stats = ref({
  kpis: {},
  monthly_trend: [],
  category_stats: [],
  unit_stats: [],
  compliance_stats: [],
  top_learners: [],
  upcoming_events: []
})

// Generate past 5 years selection options
const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 5; i++) {
    years.push(current - i)
  }
  return years
})

// Calculated unique trained percentage
const getTrainedPercentage = computed(() => {
  const unik = stats.value.kpis?.total_peserta_unik || 0
  const total = stats.value.kpis?.total_pegawai_aktif || 1
  return ((unik / total) * 100).toFixed(1)
})

const getTopicColor = (topic) => {
  const colors = {
    'BHD': '#3b82f6', // blue
    'PPI': '#10b981', // emerald
    'K3RS': '#f59e0b', // amber
    'Patient Safety': '#ef4444', // red
    'HPK': '#8b5cf6'  // violet
  }
  return colors[topic] || '#6366f1'
}

// Format upcoming event day
const formatDay = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd')
  } catch (e) {
    return dateStr.substring(8, 10) || '-'
  }
}

// Format upcoming event month
const formatMonth = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'MMM', { locale: id })
  } catch (e) {
    return 'Bln'
  }
}

// Get user initials for avatar
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ').filter(p => p)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Fetch stats from backend
const fetchStats = async () => {
  loading.value = true
  try {
    const response = await diklatService.getDashboardStats({ year: selectedYear.value })
    if (response.data && response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('[DiklatDashboard] Error loading stats:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})

// ApexCharts options & series
const getRadialOptions = (topicName, trackColor) => {
  return {
    chart: {
      type: 'radialBar',
      sparkline: { enabled: true },
      fontFamily: 'Outfit, sans-serif'
    },
    colors: [trackColor],
    plotOptions: {
      radialBar: {
        hollow: { size: '60%' },
        track: { background: '#f1f5f9' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 5,
            fontSize: '15px',
            fontWeight: 800,
            color: '#1e293b',
            formatter: (val) => val + '%'
          }
        }
      }
    },
    stroke: { lineCap: 'round' }
  }
}

const trendChartSeries = computed(() => {
  return [
    {
      name: 'Jumlah Kegiatan',
      type: 'column',
      data: stats.value.monthly_trend.map(item => item.total_kegiatan)
    },
    {
      name: 'Jumlah Partisipan',
      type: 'line',
      data: stats.value.monthly_trend.map(item => item.total_peserta)
    }
  ]
})

const trendChartOptions = computed(() => {
  return {
    chart: {
      height: 260,
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'Outfit, sans-serif'
    },
    stroke: {
      width: [0, 3],
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4
      }
    },
    colors: ['#3b82f6', '#10b981'],
    fill: {
      opacity: [0.85, 1],
      gradient: {
        inverseColors: false,
        shade: 'light',
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0.55
      }
    },
    labels: stats.value.monthly_trend.map(item => item.month_name),
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: { size: 6 }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontWeight: 600 } }
    },
    yaxis: [
      {
        title: {
          text: 'Kegiatan',
          style: { color: '#3b82f6', fontWeight: 700 }
        },
        labels: {
          style: { colors: '#64748b', fontWeight: 600 },
          formatter: (val) => Math.round(val)
        }
      },
      {
        opposite: true,
        title: {
          text: 'Partisipan',
          style: { color: '#10b981', fontWeight: 700 }
        },
        labels: {
          style: { colors: '#64748b', fontWeight: 600 },
          formatter: (val) => Math.round(val)
        }
      }
    ],
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontWeight: 700
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light'
    }
  }
})

const categoryChartSeries = computed(() => {
  return stats.value.category_stats.map(item => item.total)
})

const categoryChartOptions = computed(() => {
  const labels = stats.value.category_stats.map(item => item.kategori)
  return {
    chart: {
      type: 'donut',
      fontFamily: 'Outfit, sans-serif'
    },
    labels: labels,
    colors: ['#3b82f6', '#10b981'],
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: {
      position: 'bottom',
      fontWeight: 600,
      labels: { colors: '#64748b' }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, fontSize: '13px', fontWeight: 600, color: '#64748b', offsetY: -5 },
            value: { 
              show: true, 
              fontSize: '20px', 
              fontWeight: 800, 
              color: '#1e293b', 
              offsetY: 5,
              formatter: (val) => val
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748b',
              formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    },
    tooltip: { theme: 'light' }
  }
})

const unitChartSeries = computed(() => {
  return [
    {
      name: 'Total JPL',
      data: stats.value.unit_stats.map(item => item.total_jpl)
    }
  ]
})

const unitChartOptions = computed(() => {
  const categories = stats.value.unit_stats.map(item => item.nama_unit)
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Outfit, sans-serif'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
        barHeight: '70%',
        dataLabels: { position: 'top' }
      }
    },
    colors: categories.map((_, i) => {
      const palettes = ['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81']
      return palettes[i % palettes.length]
    }),
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { colors: ['#1e293b'], fontWeight: 800, fontSize: '10px' },
      formatter: (val) => val + ' JPL',
      offsetX: 8
    },
    xaxis: {
      categories: categories,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontWeight: 600, fontSize: '10px' },
        maxWidth: 160
      }
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: { theme: 'light' }
  }
})
</script>

<style scoped>
.diklat-dashboard-page {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.dashboard-main {
  max-width: 1600px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
}

.welcome-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.welcome-text p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.filter-year-container {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 0.25rem 0.75rem;
  border: 1px solid #e2e8f0;
}

.year-select {
  border: none;
  background: transparent;
  font-weight: 600;
  color: #334155;
  outline: none;
  font-size: 0.9rem;
  padding-right: 1.5rem;
  cursor: pointer;
}

.btn-refresh {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.btn-refresh.reloading {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
}

/* Stats Section & Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 1;
  pointer-events: none;
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  z-index: 2;
}

.stat-content {
  flex: 1;
  z-index: 2;
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.125rem 0;
  line-height: 1.2;
}

.stat-content p {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.375rem 0;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  border-radius: 50px;
  padding: 0.125rem 0.5rem;
}

.stat-trend.positive {
  background-color: #d1fae5;
  color: #065f46;
}

.stat-trend.negative {
  background-color: #fee2e2;
  color: #991b1b;
}

.stat-trend.neutral {
  background-color: #f1f5f9;
  color: #475569;
}

/* Color Gradients */
.blue-gradient { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
.emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #047857 100%); }
.amber-gradient { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.rose-gradient { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }

.stat-card.blue-gradient-hover:hover { border-color: #93c5fd; }
.stat-card.emerald-gradient-hover:hover { border-color: #6ee7b7; }
.stat-card.amber-gradient-hover:hover { border-color: #fcd34d; }
.stat-card.rose-gradient-hover:hover { border-color: #fca5a5; }

/* Dashboard Cards */
.dashboard-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header-premium {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header-premium h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.125rem 0;
  display: flex;
  align-items: center;
}

.card-header-premium p {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
}

.card-body-premium {
  padding: 1.5rem;
  flex: 1;
}

/* Compliance Ring Styling */
.compliance-body {
  padding: 1rem;
}

.compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1rem;
}

.compliance-ring-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}

.compliance-ring-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.radial-chart-wrapper {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compliance-text {
  margin-top: -5px;
}

.compliance-text .topic-title {
  display: block;
  font-size: 0.85rem;
  font-weight: 800;
  color: #334155;
  margin-bottom: 0.125rem;
}

.compliance-text .topic-count {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

/* Upcoming Events Agenda */
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.upcoming-item:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  transform: translateX(4px);
}

.event-date-pill {
  width: 50px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.event-date-pill.internal {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.event-date-pill.external {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.event-date-pill .day {
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.1;
}

.event-date-pill .month {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.event-details {
  flex: 1;
}

.event-details h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
  flex-wrap: wrap;
}

.event-meta span {
  display: flex;
  align-items: center;
}

.btn-manage-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.btn-manage-link:hover {
  color: #1d4ed8;
}

/* Top Learners List */
.top-learners-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.learner-item {
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  gap: 1rem;
  transition: all 0.2s ease;
}

.learner-item:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  transform: translateY(-2px);
}

.learner-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
  background: #e2e8f0;
}

.learner-rank.rank-1 { background: #fef3c7; color: #d97706; }
.learner-rank.rank-2 { background: #f1f5f9; color: #64748b; }
.learner-rank.rank-3 { background: #ffedd5; color: #ea580c; }

.learner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #bae6fd;
}

.learner-info {
  flex: 1;
}

.learner-info h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.125rem 0;
}

.learner-info .nik {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.learner-stats {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.learner-stats .jpl {
  font-size: 1rem;
  font-weight: 800;
  color: #059669;
}

.learner-stats .jpl small {
  font-size: 0.7rem;
  font-weight: 600;
}

.learner-stats .badge {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
}

@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* Disable focus ring border on click for all ApexCharts elements */
:deep(.apexcharts-canvas),
:deep(.apexcharts-canvas *),
:deep(svg),
:deep(svg *) {
  outline: none !important;
  box-shadow: none !important;
}
</style>
