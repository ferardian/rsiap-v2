<template>
  <div class="penyakit-report-container p-4">
    <!-- Header Section -->
    <div class="report-header mb-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 class="page-title mb-1">Laporan 10 Besar Penyakit</h2>
          <p class="text-muted small mb-0">Statistik diagnosa penyakit terbanyak berdasarkan periode</p>
        </div>
        
        <div class="filter-actions d-flex gap-3 align-items-center">
          <!-- Date Range -->
          <div class="input-group-custom">
            <span class="label">Periode</span>
            <div class="d-flex align-items-center gap-2">
              <input type="date" v-model="filters.tgl_awal" class="form-control-custom" />
              <span class="text-muted">s/d</span>
              <input type="date" v-model="filters.tgl_akhir" class="form-control-custom" />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="input-group-custom">
            <span class="label">Status</span>
            <select v-model="filters.status" class="form-select-custom">
              <option value="all">Semua</option>
              <option value="Ralan">Rawat Jalan</option>
              <option value="Ranap">Rawat Inap</option>
            </select>
          </div>

          <!-- Pasien Filter -->
          <div class="input-group-custom">
            <span class="label">Pasien</span>
            <select v-model="filters.stts_daftar" class="form-select-custom">
              <option value="all">Semua</option>
              <option value="Baru">Baru</option>
              <option value="Lama">Lama</option>
            </select>
          </div>

          <!-- Gender Filter -->
          <div class="input-group-custom">
            <span class="label">Gender</span>
            <select v-model="filters.jk" class="form-select-custom">
              <option value="all">Semua</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <button @click="loadData" class="btn-refresh" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card blue">
          <div class="stat-icon">
            <i class="fas fa-notes-medical"></i>
          </div>
          <div class="stat-info">
            <h3>{{ summary.total_diagnosa || 0 }}</h3>
            <p>Total Diagnosa</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card green">
          <div class="stat-icon">
            <i class="fas fa-virus"></i>
          </div>
          <div class="stat-info">
            <h3>{{ summary.unique_penyakit || 0 }}</h3>
            <p>Penyakit Unik</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card amber">
          <div class="stat-icon">
            <i class="fas fa-filter"></i>
          </div>
          <div class="stat-info">
            <h3>{{ summary.total_filtered || 0 }}</h3>
            <p>Filtered (Excl. Z,R,O)</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card red">
          <div class="stat-icon">
            <i class="fas fa-user-slash"></i>
          </div>
          <div class="stat-info">
            <h3>{{ summary.total_mati || 0 }}</h3>
            <p>Ps. Meninggal</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row g-4">
      <!-- Chart Column -->
      <div class="col-lg-7">
        <div class="content-card chart-card h-100">
          <div class="card-header-modern">
            <h5 class="mb-0">Visualisasi Distribusi Penyakit</h5>
          </div>
          <div class="card-body-modern">
            <div v-if="loading" class="loading-overlay">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else-if="top10.length === 0" class="empty-state">
              <i class="fas fa-chart-bar mb-3"></i>
              <p>Tidak ada data untuk periode ini</p>
            </div>
            <div v-else class="chart-container">
              <div v-for="(item, index) in top10" :key="item.kd_penyakit" class="chart-row mb-3">
                <div class="row align-items-center">
                  <div class="col-4 text-truncate" :title="item.nm_penyakit">
                    <span class="icd-code me-2">{{ item.kd_penyakit }}</span>
                    <span class="penyakit-name">{{ item.nm_penyakit }}</span>
                  </div>
                  <div class="col-6">
                    <div class="progress-bar-container">
                      <div 
                        class="progress-bar-fill" 
                        :style="{ width: calculatePercentage(item.total) + '%', backgroundColor: getBarColor(index) }"
                      ></div>
                    </div>
                  </div>
                  <div class="col-2 text-end">
                    <span class="percentage-badge">{{ calculatePercentage(item.total) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Column -->
      <div class="col-lg-5">
        <div class="content-card table-card h-100">
          <div class="card-header-modern d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Tabel 10 Besar Penyakit</h5>
            <span class="badge-total">{{ top10.length }} Item</span>
          </div>
          <div class="card-body-modern p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th width="50">#</th>
                    <th width="100">Kode</th>
                    <th>Nama Penyakit</th>
                    <th class="text-end">Jumlah</th>
                    <th class="text-end">Mati</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in top10" :key="item.kd_penyakit">
                    <td><span class="rank-circle">{{ index + 1 }}</span></td>
                    <td><span class="badge-icd">{{ item.kd_penyakit }}</span></td>
                    <td><div class="text-wrap font-500">{{ item.nm_penyakit }}</div></td>
                    <td class="text-end fw-bold">{{ item.total }}</td>
                    <td class="text-end">
                      <span :class="['badge', item.total_mati > 0 ? 'bg-danger-soft text-danger' : 'text-muted']">
                        {{ item.total_mati || 0 }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="top10.length === 0">
                    <td colspan="5" class="text-center py-5 text-muted">Belum ada data tersedia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { penyakitReportService } from '@/services/laporan/penyakitReportService'

const loading = ref(false)
const top10 = ref([])
const summary = ref({
  total_diagnosa: 0,
  unique_penyakit: 0,
  total_filtered: 0,
  total_mati: 0
})

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

const filters = reactive({
  tgl_awal: formatDate(firstDay),
  tgl_akhir: formatDate(now),
  status: 'all',
  stts_daftar: 'all',
  jk: 'all'
})

const loadData = async () => {
  loading.value = true
  try {
    const [resTop10, resSummary] = await Promise.all([
      penyakitReportService.getTop10(filters),
      penyakitReportService.getSummary(filters)
    ])
    
    top10.value = resTop10.data.data
    summary.value = resSummary.data.data
  } catch (error) {
    console.error('Error loading report:', error)
  } finally {
    loading.value = false
  }
}

const calculatePercentage = (value) => {
  if (top10.value.length === 0) return 0
  const maxTotal = top10.value[0].total
  return Math.round((value / maxTotal) * 100)
}

const getBarColor = (index) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
    '#06b6d4', '#ef4444', '#14b8a6', '#f97316', '#6366f1'
  ]
  return colors[index % colors.length]
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.penyakit-report-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-title {
  color: #1e293b;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Filters */
.input-group-custom {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin-left: 4px;
}

.form-control-custom, .form-select-custom {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #334155;
  background-color: white;
  transition: all 0.2s;
}

.form-control-custom:focus, .form-select-custom:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-refresh {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1.25rem;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Stats Cards */
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card.blue .stat-icon { background: #eff6ff; color: #3b82f6; }
.stat-card.green .stat-icon { background: #ecfdf5; color: #10b981; }
.stat-card.amber .stat-icon { background: #fffbeb; color: #f59e0b; }
.stat-card.red .stat-icon { background: #fef2f2; color: #ef4444; }

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* Content Cards */
.content-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.card-header-modern {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
}

.card-header-modern h5 {
  color: #1e293b;
  font-weight: 700;
  font-size: 1rem;
}

.card-body-modern {
  padding: 1.25rem;
  position: relative;
}

/* Chart Rows */
.chart-row:hover .penyakit-name {
  color: #3b82f6;
}

.icd-code {
  font-weight: 700;
  font-size: 0.75rem;
  padding: 2px 6px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 4px;
}

.penyakit-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  transition: color 0.2s;
}

.progress-bar-container {
  height: 8px;
  background-color: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease-out;
}

.percentage-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 12px;
}

/* Table */
.rank-circle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  font-size: 0.75rem;
  border-radius: 50%;
}

.badge-icd {
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 700;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 6px;
}

.bg-danger-soft {
  background-color: #fef2f2;
}

.font-500 {
  font-weight: 500;
  font-size: 0.875rem;
  color: #334155;
}

thead th {
  background: #f8fafc;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-top: none;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
}

.badge-total {
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}
</style>
