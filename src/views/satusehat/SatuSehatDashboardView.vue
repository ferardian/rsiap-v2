<template>
  <div class="satusehat-dashboard-view">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1">SatuSehat Dashboard</h2>
        <p class="page-subtitle text-secondary mb-0">Ringkasan status sinkronisasi data sistem ke SatuSehat FHIR</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline-primary shadow-sm" @click="fetchStats" :disabled="loading">
          <i :class="['fas fa-sync-alt', { 'fa-spin': loading }]"></i> Refresh Stats
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-4 animate__animated animate__fadeIn">
      <!-- Encounter Stats -->
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100 overflow-hidden">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="icon-box bg-primary-soft text-primary">
                <i class="fas fa-hospital-user fa-lg"></i>
              </div>
              <span class="badge bg-light text-primary border fw-bold text-xs">7 Hari Terakhir</span>
            </div>
            <h6 class="text-muted text-uppercase text-xs fw-bold tracking-wider mb-1">Encounters</h6>
            <div class="d-flex align-items-baseline gap-2">
              <h2 class="mb-0 fw-bold">{{ stats.encounter.success }}</h2>
              <span class="text-muted text-xs">/ {{ stats.encounter.total }} terdaftar</span>
            </div>
            <div class="progress mt-3" style="height: 6px;">
              <div class="progress-bar bg-primary" :style="{ width: calculatePercent(stats.encounter.success, stats.encounter.total) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Observation Stats -->
      <div class="col-md-2">
        <div class="card border-0 shadow-sm h-100 overflow-hidden">
          <div class="card-body p-4 text-center text-md-start">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="icon-box bg-success-soft text-success mx-auto mx-md-0">
                <i class="fas fa-heartbeat fa-lg"></i>
              </div>
            </div>
            <h6 class="text-muted text-uppercase text-xs fw-bold tracking-wider mb-1">Observations</h6>
            <h2 class="mb-0 fw-bold">{{ stats.observation.success }}</h2>
          </div>
        </div>
      </div>

      <!-- Condition Stats -->
      <div class="col-md-2">
        <div class="card border-0 shadow-sm h-100 overflow-hidden">
          <div class="card-body p-4 text-center text-md-start">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="icon-box bg-info-soft text-info mx-auto mx-md-0">
                <i class="fas fa-diagnoses fa-lg"></i>
              </div>
            </div>
            <h6 class="text-muted text-uppercase text-xs fw-bold tracking-wider mb-1">Conditions</h6>
            <h2 class="mb-0 fw-bold">{{ stats.condition.success }}</h2>
          </div>
        </div>
      </div>

      <!-- Procedure Stats -->
      <div class="col-md-2">
        <div class="card border-0 shadow-sm h-100 overflow-hidden">
          <div class="card-body p-4 text-center text-md-start">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="icon-box bg-purple-soft text-purple mx-auto mx-md-0">
                <i class="fas fa-clipboard-list fa-lg"></i>
              </div>
            </div>
            <h6 class="text-muted text-uppercase text-xs fw-bold tracking-wider mb-1">Procedures</h6>
            <h2 class="mb-0 fw-bold">{{ stats.procedure.success }}</h2>
          </div>
        </div>
      </div>

      <!-- Medication Request Stats -->
      <div class="col-md-2">
        <div class="card border-0 shadow-sm h-100 overflow-hidden">
          <div class="card-body p-4 text-center text-md-start">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="icon-box bg-orange-soft text-orange mx-auto mx-md-0" style="background-color: rgba(253, 126, 20, 0.1); color: #fd7e14;">
                <i class="fas fa-pills fa-lg"></i>
              </div>
            </div>
            <h6 class="text-muted text-uppercase text-xs fw-bold tracking-wider mb-1">Medication</h6>
            <h2 class="mb-0 fw-bold">{{ stats.medicationRequest?.success || 0 }}</h2>
          </div>
        </div>
      </div>

      <!-- Error Stats -->
      <div class="col-md-1">
        <div class="card border-0 shadow-sm h-100 overflow-hidden">
          <div class="card-body p-4 text-center text-md-start">
            <div class="d-flex justify-content-center align-items-center mb-3">
              <div class="icon-box bg-danger-soft text-danger mx-auto">
                <i class="fas fa-exclamation-triangle fa-lg"></i>
              </div>
            </div>
            <h6 class="text-muted text-uppercase text-xs fw-bold tracking-wider mb-1 text-center">Errors</h6>
            <h2 class="mb-0 fw-bold text-center">{{ stats.errors.total }}</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links Grid -->
    <div class="row g-4 animate__animated animate__fadeIn animate__delay-1s">
      <div class="col-md-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 py-3">
            <h5 class="mb-0">Akses Cepat Monitoring</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div v-for="link in quickLinks" :key="link.path" class="col-md-3">
                <router-link :to="link.path" class="quick-link-card text-decoration-none">
                  <div class="d-flex align-items-center gap-3">
                    <div :class="['icon-box-sm', link.colorClass]">
                      <i :class="['fas', link.icon]"></i>
                    </div>
                    <div>
                      <h6 class="mb-0 text-dark">{{ link.title }}</h6>
                      <span class="text-xs text-muted">{{ link.subtitle }}</span>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-muted ms-auto"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import satuSehatService from '@/services/satuSehatService'

export default {
  name: 'SatuSehatDashboardView',
  data() {
    return {
      loading: false,
      stats: {
        encounter: { total: 0, success: 0 },
        observation: { success: 0 },
        condition: { success: 0 },
        procedure: { success: 0 },
        medicationRequest: { success: 0 },
        errors: { total: 0 },
        last_update: '-'
      },
      quickLinks: [
        { title: 'Encounter', subtitle: 'Monitoring Kunjungan', path: '/satusehat/encounter', icon: 'fa-hospital-user', colorClass: 'bg-primary-soft text-primary' },
        { title: 'Observation', subtitle: 'Monitoring Vital Signs', path: '/satusehat/observation', icon: 'fa-heartbeat', colorClass: 'bg-success-soft text-success' },
        { title: 'Condition', subtitle: 'Monitoring Diagnosa', path: '/satusehat/condition', icon: 'fa-diagnoses', colorClass: 'bg-info-soft text-info' },
        { title: 'Procedure', subtitle: 'Monitoring Tindakan', path: '/satusehat/procedure', icon: 'fa-clipboard-list', colorClass: 'bg-purple-soft text-purple' },
        { title: 'Medication', subtitle: 'Monitoring Resep Obat', path: '/satusehat/medication-request', icon: 'fa-pills', colorClass: 'bg-orange-soft text-orange', style: 'background-color: rgba(253, 126, 20, 0.1); color: #fd7e14;' },
        { title: 'Patient', subtitle: 'Registrasi Pasien', path: '/satusehat/patient', icon: 'fa-user-injured', colorClass: 'bg-warning-soft text-warning' }
      ]
    }
  },
  mounted() {
    this.fetchStats()
  },
  methods: {
    async fetchStats() {
      this.loading = true
      try {
        const response = await satuSehatService.getDashboard()
        if (response.data && response.data.success) {
          this.stats = response.data.data
        }
      } catch (error) {
        console.error('Error fetching satusehat stats:', error)
      } finally {
        this.loading = false
      }
    },
    calculatePercent(success, total) {
      if (!total || total === 0) return 0
      return Math.round((success / total) * 100)
    }
  }
}
</script>

<style scoped>
.bg-primary-soft { background-color: rgba(13, 110, 253, 0.1); }
.bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
.bg-info-soft { background-color: rgba(13, 202, 240, 0.1); }
.bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); }
.bg-warning-soft { background-color: rgba(255, 193, 7, 0.1); }

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box-sm {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tracking-wider { letter-spacing: 0.05em; }

.quick-link-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #edf2f9;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
}

.quick-link-card:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  border-color: #d2ddec;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}
</style>
