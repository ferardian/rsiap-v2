<template>
  <div class="helpdesk-dashboard-container animate__animated animate__fadeIn">
    <!-- Header Section -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="page-title">📊 Helpdesk Analytics</h1>
        <p class="page-subtitle">Visualisasi performa bantuan IT, beban kerja teknisi, dan status penyelesaian tiket secara real-time</p>
      </div>
      <div class="d-flex gap-2">
        <router-link to="/helpdesk/tiket-masuk" class="btn btn-outline-premium">
          <i class="fas fa-ticket-alt me-2"></i> Tiket Masuk
        </router-link>
        <button class="btn btn-premium-refresh" @click="loadDashboardData" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          <span class="ms-2">Refresh</span>
        </button>
      </div>
    </div>

    <!-- Period Filters Section -->
    <div class="filter-bar glass-card p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div class="d-flex flex-wrap align-items-center gap-3">
        <span class="filter-label"><i class="fas fa-filter text-primary me-1"></i> Periode Analisis:</span>
        <div class="btn-group premium-btn-group" role="group">
          <button 
            type="button" 
            class="btn btn-sm btn-period" 
            :class="filters.period === 'monthly' ? 'btn-primary' : 'btn-outline-primary'"
            @click="setPeriod('monthly')"
          >
            Bulanan
          </button>
          <button 
            type="button" 
            class="btn btn-sm btn-period" 
            :class="filters.period === 'yearly' ? 'btn-primary' : 'btn-outline-primary'"
            @click="setPeriod('yearly')"
          >
            Tahunan
          </button>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <!-- Month Selector (only when Bulanan is active) -->
        <select 
          v-if="filters.period === 'monthly'" 
          v-model="filters.month" 
          class="form-select form-select-sm premium-select" 
          @change="loadDashboardData"
        >
          <option v-for="m in monthsList" :key="m.value" :value="m.value">
            {{ m.label }}
          </option>
        </select>

        <!-- Year Selector -->
        <select 
          v-model="filters.year" 
          class="form-select form-select-sm premium-select" 
          @change="loadDashboardData"
        >
          <option v-for="y in yearsList" :key="y" :value="y">
            {{ y }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading && !dashboardData" class="d-flex justify-content-center align-items-center py-5 min-vh-50">
      <div class="text-center">
        <div class="spinner-border text-primary spinner-lg mb-3"></div>
        <p class="text-muted fw-bold">Memuat analisis dashboard...</p>
      </div>
    </div>

    <div v-else-if="dashboardData" class="dashboard-content">
      
      <!-- Stats Cards Grid -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-4 col-lg-2">
          <div class="stat-card total">
            <div class="card-icon">
              <i class="fas fa-folder-open"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Total Tiket</span>
              <h3 class="card-value">{{ summary.total_tickets }}</h3>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-lg-2">
          <div class="stat-card open">
            <div class="card-icon">
              <i class="fas fa-envelope-open-text"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Open</span>
              <h3 class="card-value">{{ summary.open }}</h3>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-lg-2">
          <div class="stat-card proses">
            <div class="card-icon">
              <i class="fas fa-cog fa-spin-slow"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Proses</span>
              <h3 class="card-value">{{ summary.proses }}</h3>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-lg-2">
          <div class="stat-card selesai">
            <div class="card-icon">
              <i class="fas fa-check-double"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Selesai</span>
              <h3 class="card-value">{{ summary.selesai }}</h3>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-lg-2">
          <div class="stat-card batal">
            <div class="card-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Batal</span>
              <h3 class="card-value">{{ summary.batal }}</h3>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-4 col-lg-2">
          <div class="stat-card waiting">
            <div class="card-icon">
              <i class="fab fa-whatsapp"></i>
            </div>
            <div class="card-info">
              <span class="card-label">Waiting WA</span>
              <h3 class="card-value">{{ summary.waiting_logs }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- SLA & Completion Rates Row -->
      <div class="row g-3 mb-4 animate__animated animate__fadeIn">
        <!-- SLA: Response Time -->
        <div class="col-12 col-md-6 col-xl-3">
          <div class="kpi-card response-time">
            <div class="kpi-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="kpi-details">
              <span class="kpi-title">Avg. Waktu Respon</span>
              <h4 class="kpi-value">{{ formatDuration(summary.avg_response_time) }}</h4>
              <p class="kpi-desc">Durasi laporan masuk s.d mulai proses</p>
            </div>
          </div>
        </div>

        <!-- SLA: Completion Time -->
        <div class="col-12 col-md-6 col-xl-3">
          <div class="kpi-card completion-time">
            <div class="kpi-icon">
              <i class="fas fa-hourglass-end"></i>
            </div>
            <div class="kpi-details">
              <span class="kpi-title">Avg. Waktu Selesai</span>
              <h4 class="kpi-value">{{ formatDuration(summary.avg_resolution_time) }}</h4>
              <p class="kpi-desc">Durasi pengerjaan s.d selesai</p>
            </div>
          </div>
        </div>

        <!-- KPI: Response Rate -->
        <div class="col-12 col-md-6 col-xl-3">
          <div class="kpi-card response-rate">
            <div class="kpi-icon">
              <i class="fas fa-reply-all"></i>
            </div>
            <div class="kpi-details w-100">
              <span class="kpi-title">Tiket Direspon</span>
              <h4 class="kpi-value">{{ respondedCount }} <span class="kpi-total">/ {{ summary.total_tickets }} Tiket</span></h4>
              <div class="d-flex align-items-center gap-2 mt-1">
                <div class="progress flex-grow-1" style="height: 6px;">
                  <div class="progress-bar bg-primary" :style="{ width: respondedPercent + '%' }"></div>
                </div>
                <span class="kpi-percent">{{ respondedPercent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI: Completion Rate -->
        <div class="col-12 col-md-6 col-xl-3">
          <div class="kpi-card completion-rate">
            <div class="kpi-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="kpi-details w-100">
              <span class="kpi-title">Tiket Selesai</span>
              <h4 class="kpi-value">{{ summary.selesai }} <span class="kpi-total">/ {{ summary.total_tickets }} Tiket</span></h4>
              <div class="d-flex align-items-center gap-2 mt-1">
                <div class="progress flex-grow-1" style="height: 6px;">
                  <div class="progress-bar bg-success" :style="{ width: resolvedPercent + '%' }"></div>
                </div>
                <span class="kpi-percent">{{ resolvedPercent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend Chart Section (Full Width) -->
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="chart-card glass-card">
            <div class="card-header border-0 bg-transparent d-flex justify-content-between align-items-center">
              <h5 class="chart-title">
                <i class="fas fa-chart-area text-primary me-2"></i>
                {{ filters.period === 'monthly' ? 'Detail Jumlah Tiket Harian' : 'Tren Volume Tiket Bulanan' }}
              </h5>
              <span class="badge bg-soft-primary px-3 py-2 text-primary font-weight-bold">
                {{ filters.period === 'monthly' ? getSelectedMonthName() + ' ' + filters.year : 'Tahun ' + filters.year }}
              </span>
            </div>
            <div class="card-body p-4">
              <div v-if="trendChartSeries[0].data.length === 0" class="text-center py-5 text-muted">
                Tidak ada data tiket untuk periode ini.
              </div>
              <div v-else>
                <!-- Full-Width Area Chart -->
                <VueApexCharts 
                  type="area" 
                  height="340" 
                  :options="trendChartOptions" 
                  :series="trendChartSeries"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Chart: Categories Distribution (Donut Chart) -->
        <div class="col-lg-4">
          <div class="chart-card glass-card h-100">
            <div class="card-header border-0 bg-transparent">
              <h5 class="chart-title"><i class="fas fa-chart-pie text-success me-2"></i>Distribusi Kategori Kendala</h5>
            </div>
            <div class="card-body p-4">
              <div v-if="categoryChartSeries.length === 0" class="text-center py-5 text-muted">
                Belum ada data kategori tiket.
              </div>
              <VueApexCharts 
                v-else
                type="donut" 
                height="320" 
                :options="categoryChartOptions" 
                :series="categoryChartSeries"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Dataset Table below the Chart (Horizontal Layout) -->
      <div v-if="dashboardData.trend && dashboardData.trend.length > 0" class="chart-card glass-card p-4 mb-4 animate__animated animate__fadeIn">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="chart-title"><i class="fas fa-table text-primary me-2"></i>Data Rincian Aktivitas Tiket</h5>
          <span class="badge bg-soft-primary px-3 py-2 text-primary font-weight-bold">
            Total: {{ summary.total_tickets }} Tiket
          </span>
        </div>
        
        <div class="horizontal-table-wrapper">
          <table class="table horizontal-table">
            <thead>
              <tr class="bg-light text-secondary">
                <th class="sticky-col">{{ filters.period === 'monthly' ? 'Info / Hari' : 'Info / Bulan' }}</th>
                <th v-for="col in dashboardData.trend" :key="col.label" class="fw-bold">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Row 1: Total Tiket -->
              <tr>
                <td class="sticky-col fw-bold">Total Tiket</td>
                <td v-for="col in dashboardData.trend" :key="col.label">
                  <span class="badge" :class="col.count > 0 ? 'bg-primary text-white' : 'bg-light text-muted'">
                    {{ col.count }}
                  </span>
                </td>
              </tr>
              <!-- Row 2: Tiket Direspon -->
              <tr>
                <td class="sticky-col fw-bold">Direspon / Total</td>
                <td v-for="col in dashboardData.trend" :key="col.label">
                  <span v-if="col.count > 0" class="badge bg-soft-info text-info">
                    {{ col.responded }} / {{ col.count }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
              <!-- Row 3: Tiket Selesai -->
              <tr>
                <td class="sticky-col fw-bold">Selesai / Total</td>
                <td v-for="col in dashboardData.trend" :key="col.label">
                  <span v-if="col.count > 0" class="badge bg-soft-success text-success">
                    {{ col.selesai }} / {{ col.count }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Layout: Top Tech and Recent Activity -->
      <div class="row g-4">
        <!-- List: Top Technicians (Workload / Completion Rank) -->
        <div class="col-lg-5">
          <div class="data-card glass-card">
            <div class="card-header border-0 bg-transparent">
              <h5 class="chart-title"><i class="fas fa-user-shield text-info me-2"></i>Kinerja Teknisi</h5>
            </div>
            <div class="card-body p-4 pt-2">
              <div v-if="topTechnicians.length === 0" class="text-center py-5 text-muted">
                Belum ada data pengerjaan teknisi.
              </div>
              <div v-else class="tech-list d-flex flex-column gap-4">
                <div 
                  v-for="(tech, idx) in topTechnicians" 
                  :key="tech.nik_teknisi"
                  class="tech-item d-flex align-items-center gap-3"
                >
                  <div class="tech-rank" :class="'rank-' + (idx + 1)">
                    {{ idx + 1 }}
                  </div>
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="tech-name">{{ tech.teknisi?.nama || 'Teknisi Tanpa Nama' }}</span>
                      <span class="tech-count badge bg-soft-info">{{ tech.count }} Tiket Selesai</span>
                    </div>
                    <div class="progress progress-premium" style="height: 8px;">
                      <div 
                        class="progress-bar" 
                        role="progressbar" 
                        :style="{ width: getTechPercentage(tech.count) + '%' }"
                        :class="getTechBarClass(idx)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List: Recent Tickets Activity -->
        <div class="col-lg-7">
          <div class="data-card glass-card">
            <div class="card-header border-0 bg-transparent">
              <h5 class="chart-title"><i class="fas fa-history text-indigo me-2"></i>Tiket Terbaru Masuk</h5>
            </div>
            <div class="card-body p-4 pt-2">
              <div v-if="recentTickets.length === 0" class="text-center py-5 text-muted">
                Belum ada riwayat tiket terbaru.
              </div>
              <div v-else class="recent-list d-flex flex-column gap-3">
                <div 
                  v-for="ticket in recentTickets" 
                  :key="ticket.id" 
                  class="recent-item d-flex flex-wrap justify-content-between align-items-center gap-3 p-3"
                >
                  <div class="d-flex align-items-center gap-3">
                    <div class="ticket-status-indicator" :class="ticket.status.toLowerCase()">
                      <i :class="getStatusIcon(ticket.status)"></i>
                    </div>
                    <div>
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="ticket-no">{{ ticket.no_tiket }}</span>
                        <span class="prio-pill" :class="ticket.prioritas.toLowerCase()">
                          {{ ticket.prioritas }}
                        </span>
                      </div>
                      <div class="ticket-complaint">{{ ticket.keluhan }}</div>
                      <div class="ticket-meta">
                        <span><i class="fas fa-user me-1"></i>{{ ticket.pelapor?.nama || 'Non-Pegawai' }}</span>
                        <span class="mx-2">•</span>
                        <span><i class="fas fa-building me-1"></i>{{ ticket.departemen?.nama || '-' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="ticket-date">{{ formatDate(ticket.tanggal) }}</div>
                    <div class="ticket-time">{{ formatTime(ticket.tanggal) }}</div>
                    <span class="status-pill-small mt-2" :class="ticket.status.toLowerCase()">
                      {{ ticket.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import helpdeskService from '@/services/helpdeskService'
import VueApexCharts from 'vue3-apexcharts'

const toast = useToast()
const loading = ref(false)
const dashboardData = ref(null)

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1 // 1-12

// Filters reactive state
const filters = reactive({
  period: 'monthly',
  year: currentYear,
  month: currentMonth
})

const yearsList = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 3; y--) {
    years.push(y)
  }
  return years
})

const monthsList = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
]

const getSelectedMonthName = () => {
  const match = monthsList.find(m => m.value === filters.month)
  return match ? match.label : ''
}

const setPeriod = (p) => {
  filters.period = p
  loadDashboardData()
}

const summary = computed(() => {
  return dashboardData.value?.summary || {
    total_tickets: 0,
    open: 0,
    proses: 0,
    selesai: 0,
    batal: 0,
    waiting_logs: 0,
    avg_response_time: 0,
    avg_resolution_time: 0
  }
})

// KPI Calculations
const respondedCount = computed(() => {
  return summary.value.total_tickets - summary.value.open
})

const respondedPercent = computed(() => {
  if (summary.value.total_tickets <= 0) return 0
  return Math.round((respondedCount.value / summary.value.total_tickets) * 100)
})

const resolvedPercent = computed(() => {
  if (summary.value.total_tickets <= 0) return 0
  return Math.round((summary.value.selesai / summary.value.total_tickets) * 100)
})

const recentTickets = computed(() => {
  return dashboardData.value?.recent_tickets || []
})

const topTechnicians = computed(() => {
  return dashboardData.value?.top_technicians || []
})

const maxTechTickets = computed(() => {
  if (topTechnicians.value.length === 0) return 1
  return Math.max(...topTechnicians.value.map(t => t.count))
})

const getTechPercentage = (count) => {
  return (count / maxTechTickets.value) * 100
}

const getTechBarClass = (index) => {
  const classes = ['bg-gradient-blue', 'bg-gradient-green', 'bg-gradient-purple', 'bg-gradient-orange', 'bg-gradient-cyan']
  return classes[index] || 'bg-primary'
}

// Format duration from minutes to user-friendly text
const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0 Menit'
  if (minutes < 60) return `${minutes} Menit`
  const hrs = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hrs} Jam ${mins} Menit` : `${hrs} Jam`
}

// 1. Line/Area Chart Options & Series (Monthly / Daily Trend)
const trendChartSeries = computed(() => {
  const data = dashboardData.value?.trend || []
  return [{
    name: 'Jumlah Tiket',
    data: data.map(item => item.count)
  }]
})

const trendChartOptions = computed(() => {
  const data = dashboardData.value?.trend || []
  return {
    chart: {
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#3b82f6'],
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3
    },
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
      categories: data.map(item => item.label),
      labels: {
        style: { colors: '#94a3b8', fontWeight: 500 }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: filters.period === 'monthly' ? 'Tanggal' : 'Bulan',
        style: { color: '#94a3b8', fontWeight: 600 }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontWeight: 500 }
      },
      title: {
        text: 'Jumlah Tiket',
        style: { color: '#94a3b8', fontWeight: 600 }
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 5,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val} Tiket`
      }
    }
  }
})

// 2. Donut Chart Options & Series (Categories Distribution)
const categoryChartSeries = computed(() => {
  const data = dashboardData.value?.by_category || []
  return data.map(item => item.count)
})

const categoryChartOptions = computed(() => {
  const data = dashboardData.value?.by_category || []
  return {
    chart: {
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif'
    },
    labels: data.map(item => item.kategori || 'Belum Ditentukan'),
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'],
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontWeight: 500,
      labels: { colors: '#475569' },
      markers: { radius: 12, offsetX: -4 }
    },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Kendala',
              fontSize: '13px',
              fontWeight: 600,
              color: '#94a3b8',
              formatter: () => summary.value.total_tickets
            }
          }
        }
      }
    },
    tooltip: {
      theme: 'light'
    }
  }
})

const loadDashboardData = async () => {
  loading.value = true
  try {
    const params = {
      period: filters.period,
      year: filters.year,
      month: filters.period === 'monthly' ? filters.month : null
    }
    const response = await helpdeskService.getDashboardData(params)
    if (response.data.success) {
      dashboardData.value = response.data.data
    }
  } catch (error) {
    toast.error('Gagal mengambil data statistik dashboard')
  } finally {
    loading.value = false
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Open': return 'fas fa-envelope-open-text'
    case 'Proses': return 'fas fa-spinner fa-spin'
    case 'Selesai': return 'fas fa-check'
    case 'Batal': return 'fas fa-times-circle'
    default: return 'fas fa-ticket-alt'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.helpdesk-dashboard-container {
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

.page-title {
  font-weight: 800;
  font-size: 1.85rem;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* Filter Bar styles */
.filter-bar {
  border-radius: 16px;
  background: white;
}

.filter-label {
  font-weight: 700;
  font-size: 0.9rem;
  color: #475569;
}

.premium-btn-group {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
}

.btn-period {
  padding: 0.4rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
}

.btn-period:hover {
  background: #e2e8f0;
  color: #1e3a8a;
}

.btn-period.btn-primary {
  background-color: #3b82f6;
  color: white;
}

/* Button Styling */
.btn-outline-premium {
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 12px;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-outline-premium:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
  transform: translateY(-1px);
}

.btn-premium-refresh {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.btn-premium-refresh:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
}

/* Glass Cards */
.glass-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  overflow: hidden;
}

.chart-title {
  font-weight: 750;
  font-size: 1.05rem;
  color: #1e293b;
  margin: 0;
}

.bg-soft-primary {
  background: #eff6ff;
  color: #2563eb;
}

/* Stat Cards */
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.card-value {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}

/* Stat Card Colors */
.stat-card.total .card-icon { background: #eff6ff; color: #3b82f6; }
.stat-card.open .card-icon { background: #f0f9ff; color: #0284c7; }
.stat-card.proses .card-icon { background: #fefce8; color: #ca8a04; }
.stat-card.selesai .card-icon { background: #f0fdf4; color: #22c55e; }
.stat-card.batal .card-icon { background: #f8fafc; color: #64748b; }
.stat-card.waiting .card-icon { background: #fdf2f8; color: #db2777; }

/* Micro spinning settings */
.fa-spin-slow {
  animation: fa-spin 4s infinite linear;
}

/* KPI Card Styles */
.kpi-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  transition: all 0.25s ease;
  min-height: 105px;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
}

.kpi-card.response-time { border-left: 5px solid #3b82f6; }
.kpi-card.completion-time { border-left: 5px solid #8b5cf6; }
.kpi-card.response-rate { border-left: 5px solid #06b6d4; }
.kpi-card.completion-rate { border-left: 5px solid #10b981; }

.kpi-card.response-time .kpi-icon { background: #eff6ff; color: #3b82f6; }
.kpi-card.completion-time .kpi-icon { background: #f5f3ff; color: #8b5cf6; }
.kpi-card.response-rate .kpi-icon { background: #ecfeff; color: #0891b2; }
.kpi-card.completion-rate .kpi-icon { background: #ecfdf5; color: #047857; }

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.kpi-details {
  display: flex;
  flex-direction: column;
}

.kpi-title {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.15rem;
}

.kpi-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.kpi-total {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.kpi-percent {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.kpi-desc {
  font-size: 0.7rem;
  color: #94a3b8;
  margin: 0;
}

/* Trend Table Styles (Horizontal Scrollable Layout) */
.horizontal-table-wrapper {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
}

/* Scrollbar Customization */
.horizontal-table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.horizontal-table-wrapper::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 8px;
}

.horizontal-table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}

.horizontal-table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.horizontal-table {
  margin-bottom: 0;
  border-collapse: collapse;
  width: 100%;
  min-width: 1200px; /* Ensure wide space to represent up to 31 columns */
}

.horizontal-table th, .horizontal-table td {
  padding: 0.75rem 0.5rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  vertical-align: middle;
}

/* Sticky First Column for labels */
.horizontal-table th.sticky-col,
.horizontal-table td.sticky-col {
  position: sticky;
  left: 0;
  background: #f8fafc;
  font-weight: 750;
  text-align: left;
  color: #475569;
  z-index: 5;
  box-shadow: 3px 0 6px rgba(0,0,0,0.06);
  min-width: 140px;
  max-width: 140px;
}

/* Top Tech list styling */
.tech-list {
  padding-top: 1rem;
}

.tech-item {
  position: relative;
}

.tech-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.tech-rank.rank-1 { background: #fef3c7; color: #d97706; }
.tech-rank.rank-2 { background: #e2e8f0; color: #475569; }
.tech-rank.rank-3 { background: #ffedd5; color: #ea580c; }

.tech-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
}

.bg-soft-info {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 700;
}

.progress-premium {
  background-color: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.bg-gradient-blue { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
.bg-gradient-green { background: linear-gradient(90deg, #10b981, #047857); }
.bg-gradient-purple { background: linear-gradient(90deg, #8b5cf6, #6d28d9); }
.bg-gradient-orange { background: linear-gradient(90deg, #f59e0b, #d97706); }
.bg-gradient-cyan { background: linear-gradient(90deg, #06b6d4, #0891b2); }

/* Recent activity list styling */
.recent-list {
  padding-top: 0.5rem;
}

.recent-item {
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.recent-item:hover {
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border-color: #e2e8f0;
}

.ticket-status-indicator {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.ticket-status-indicator.open { background: #dbeafe; color: #1e40af; }
.ticket-status-indicator.proses { background: #fef9c3; color: #a16207; }
.ticket-status-indicator.selesai { background: #dcfce7; color: #15803d; }
.ticket-status-indicator.batal { background: #fee2e2; color: #b91c1c; }

.ticket-no {
  font-weight: 800;
  font-size: 0.85rem;
  color: #1e293b;
  font-family: monospace;
}

.prio-pill {
  font-size: 0.65rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-weight: 700;
  text-transform: uppercase;
}

.prio-pill.low { background: #e2e8f0; color: #475569; }
.prio-pill.medium { background: #dbeafe; color: #1d4ed8; }
.prio-pill.high { background: #fee2e2; color: #b91c1c; }

.ticket-complaint {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 550;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-meta {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.ticket-date {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.ticket-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.status-pill-small {
  font-size: 0.65rem;
  font-weight: 750;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  display: inline-block;
}

.status-pill-small.open { background: #eff6ff; color: #2563eb; }
.status-pill-small.proses { background: #fefce8; color: #a16207; }
.status-pill-small.selesai { background: #f0fdf4; color: #166534; }
.status-pill-small.batal { background: #fef2f2; color: #991b1b; }

.premium-select {
  min-width: 140px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

.bg-soft-info {
  background: #ecfeff;
  color: #0891b2;
}

.bg-soft-success {
  background: #ecfdf5;
  color: #047857;
}
</style>
