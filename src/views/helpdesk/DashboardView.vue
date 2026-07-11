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

    <!-- Loading Skeleton/Spinner -->
    <div v-if="loading && !dashboardData" class="d-flex justify-content-center align-items-center py-5 min-vh-50">
      <div class="text-center">
        <div class="spinner-border text-primary spinner-lg mb-3"></div>
        <p class="text-muted fw-bold">Memuat data analisis helpdesk...</p>
      </div>
    </div>

    <div v-else-if="dashboardData" class="dashboard-content">
      <!-- Stats Cards Grid -->
      <div class="row g-3 mb-4">
        <!-- Card: Total Tickets -->
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

        <!-- Card: Open -->
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

        <!-- Card: Proses -->
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

        <!-- Card: Selesai -->
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

        <!-- Card: Batal -->
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

        <!-- Card: Waiting Logs (WhatsApp) -->
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

      <!-- Charts Row -->
      <div class="row g-4 mb-4">
        <!-- Chart: Monthly Volume (Area Chart) -->
        <div class="col-lg-8">
          <div class="chart-card glass-card">
            <div class="card-header border-0 bg-transparent d-flex justify-content-between align-items-center">
              <h5 class="chart-title"><i class="fas fa-chart-area text-primary me-2"></i>Tren Volume Tiket Bulanan</h5>
              <span class="badge bg-light text-dark">Tahun Ini</span>
            </div>
            <div class="card-body p-4">
              <div v-if="trendChartSeries[0].data.length === 0" class="text-center py-5 text-muted">
                Tidak ada data bulanan untuk ditampilkan.
              </div>
              <VueApexCharts 
                v-else
                type="area" 
                height="320" 
                :options="trendChartOptions" 
                :series="trendChartSeries"
              />
            </div>
          </div>
        </div>

        <!-- Chart: Categories Distribution (Donut Chart) -->
        <div class="col-lg-4">
          <div class="chart-card glass-card">
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

      <!-- Bottom Layout: Top Tech and Recent Activity -->
      <div class="row g-4">
        <!-- List: Top Technicians (Workload / Completion Rank) -->
        <div class="col-lg-5">
          <div class="data-card glass-card h-100">
            <div class="card-header border-0 bg-transparent">
              <h5 class="chart-title"><i class="fas fa-user-shield text-info me-2"></i>Peringkat Penyelesaian Teknisi</h5>
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
          <div class="data-card glass-card h-100">
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

const summary = computed(() => {
  return dashboardData.value?.summary || {
    total_tickets: 0,
    open: 0,
    proses: 0,
    selesai: 0,
    batal: 0,
    waiting_logs: 0
  }
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

// 1. Line/Area Chart Options & Series (Monthly Trend)
const trendChartSeries = computed(() => {
  const data = dashboardData.value?.monthly_trend || []
  return [{
    name: 'Jumlah Tiket',
    data: data.map(item => item.count)
  }]
})

const trendChartOptions = computed(() => {
  const data = dashboardData.value?.monthly_trend || []
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
      categories: data.map(item => item.month),
      labels: {
        style: { colors: '#94a3b8', fontWeight: 500 }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontWeight: 500 }
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
    const response = await helpdeskService.getDashboardData()
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
}

.chart-title {
  font-weight: 750;
  font-size: 1.05rem;
  color: #1e293b;
  margin: 0;
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
.stat-card.selesahi .card-icon, .stat-card.selesai .card-icon { background: #f0fdf4; color: #22c55e; }
.stat-card.batal .card-icon { background: #f8fafc; color: #64748b; }
.stat-card.waiting .card-icon { background: #fdf2f8; color: #db2777; }

/* Micro spinning settings */
.fa-spin-slow {
  animation: fa-spin 4s infinite linear;
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
</style>
