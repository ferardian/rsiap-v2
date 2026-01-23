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
                    <th class="text-end">Total</th>
                    <th class="text-end">L</th>
                    <th class="text-end">P</th>
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
                      <span class="badge bg-info-soft text-info">{{ item.total_l || 0 }}</span>
                    </td>
                    <td class="text-end">
                      <span class="badge bg-pink-soft text-pink">{{ item.total_p || 0 }}</span>
                    </td>
                    <td class="text-end">
                      <span 
                        :class="['badge', item.total_mati > 0 ? 'bg-danger-soft text-danger clickable' : 'text-muted']"
                        @click="item.total_mati > 0 ? showDeathDetails(item) : null"
                        :style="item.total_mati > 0 ? 'cursor: pointer;' : ''"
                      >
                        {{ item.total_mati || 0 }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="top10.length === 0">
                    <td colspan="7" class="text-center py-5 text-muted">Belum ada data tersedia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Deadliest Diseases Section -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="content-card">
          <div class="card-header-modern d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0">
                <i class="fas fa-skull-crossbones me-2 text-danger"></i>
                10 Penyakit dengan Kematian Terbanyak
              </h5>
              <small class="text-muted">Penyakit yang paling sering menyebabkan kematian</small>
            </div>
            <span class="badge bg-danger">{{ deadliestDiseases.length }} Item</span>
          </div>
          <div class="card-body-modern">
            <div v-if="loading" class="loading-overlay">
              <div class="spinner-border text-danger" role="status"></div>
            </div>
            <div v-else-if="deadliestDiseases.length === 0" class="empty-state">
              <i class="fas fa-info-circle mb-3"></i>
              <p>Tidak ada data kematian untuk periode ini</p>
            </div>
            <div v-else class="row g-3">
              <div v-for="(item, index) in deadliestDiseases" :key="item.kd_penyakit" class="col-md-6">
                <div class="deadliest-card" @click="showDeathDetails(item)">
                  <div class="deadliest-rank">
                    <span class="rank-number">{{ index + 1 }}</span>
                  </div>
                  <div class="deadliest-content">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div class="flex-grow-1">
                        <span class="badge-icd mb-1">{{ item.kd_penyakit }}</span>
                        <h6 class="deadliest-name mb-1">{{ item.nm_penyakit }}</h6>
                      </div>
                      <div class="text-end">
                        <div class="death-count">
                          <i class="fas fa-skull me-1"></i>
                          {{ item.total_mati }}
                        </div>
                        <small class="text-muted">kematian</small>
                      </div>
                    </div>
                    <div class="deadliest-stats">
                      <div class="stat-item">
                        <i class="fas fa-notes-medical me-1"></i>
                        <small>{{ item.total_kasus }} kasus</small>
                      </div>
                      <div class="stat-item">
                        <i class="fas fa-percentage me-1"></i>
                        <small>{{ calculateMortalityRate(item) }}% mortalitas</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Death Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-user-slash me-2"></i>
            Detail Pasien Meninggal - {{ selectedDisease?.nm_penyakit }}
          </h5>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="loadingModal" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Memuat data...</p>
          </div>
          <div v-else-if="deathDetails.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-inbox fa-3x mb-3"></i>
            <p>Tidak ada data pasien meninggal</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th width="50">#</th>
                  <th>Kode ICD</th>
                  <th>No. Rawat</th>
                  <th>No. RM</th>
                  <th>Nama Pasien</th>
                  <th>JK</th>
                  <th>Tgl Registrasi</th>
                  <th>Tgl Meninggal</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in deathDetails" :key="item.no_rawat">
                  <td>{{ index + 1 }}</td>
                  <td><span class="badge-icd">{{ selectedDisease?.kd_penyakit }}</span></td>
                  <td><span class="badge bg-secondary">{{ item.no_rawat }}</span></td>
                  <td>{{ item.no_rkm_medis }}</td>
                  <td>{{ item.nm_pasien }}</td>
                  <td>
                    <span :class="['badge', item.jk === 'L' ? 'bg-info-soft text-info' : 'bg-pink-soft text-pink']">
                      {{ item.jk === 'L' ? 'L' : 'P' }}
                    </span>
                  </td>
                  <td>{{ formatDate(item.tgl_registrasi) }}</td>
                  <td>
                    <span class="text-danger fw-bold">
                      {{ formatDate(item.tgl_meninggal) }}
                      <small v-if="item.jam_meninggal" class="text-muted">{{ item.jam_meninggal }}</small>
                    </span>
                  </td>
                  <td><small class="text-muted">{{ item.keterangan || '-' }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <span class="text-muted">Total: {{ deathDetails.length }} pasien</span>
          <button class="btn-close-modal" @click="closeModal">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { penyakitReportService } from '@/services/laporan/penyakitReportService'

const loading = ref(false)
const loadingModal = ref(false)
const showModal = ref(false)
const selectedDisease = ref(null)
const deathDetails = ref([])
const deadliestDiseases = ref([])
const top10 = ref([])
const summary = ref({
  total_diagnosa: 0,
  unique_penyakit: 0,
  total_filtered: 0,
  total_mati: 0
})

const formatInputDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

const filters = reactive({
  tgl_awal: formatInputDate(firstDay),
  tgl_akhir: formatInputDate(now),
  status: 'all',
  stts_daftar: 'all',
  jk: 'all'
})

const loadData = async () => {
  loading.value = true
  try {
    const [resTop10, resSummary, resDeadliest] = await Promise.all([
      penyakitReportService.getTop10(filters),
      penyakitReportService.getSummary(filters),
      penyakitReportService.getDeadliestDiseases(filters)
    ])
    
    top10.value = resTop10.data.data
    summary.value = resSummary.data.data
    deadliestDiseases.value = resDeadliest.data.data
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

const showDeathDetails = async (disease) => {
  selectedDisease.value = disease
  showModal.value = true
  loadingModal.value = true
  deathDetails.value = []
  
  try {
    const params = {
      kd_penyakit: disease.kd_penyakit,
      ...filters
    }
    const response = await penyakitReportService.getDeathDetails(params)
    deathDetails.value = response.data.data
  } catch (error) {
    console.error('Error loading death details:', error)
  } finally {
    loadingModal.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedDisease.value = null
  deathDetails.value = []
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const calculateMortalityRate = (item) => {
  if (!item.total_kasus || item.total_kasus === 0) return 0
  return ((item.total_mati / item.total_kasus) * 100).toFixed(1)
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

.bg-info-soft {
  background-color: #e0f2fe;
}

.text-info {
  color: #0284c7;
}

.bg-pink-soft {
  background-color: #fce7f3;
}

.text-pink {
  color: #db2777;
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

.clickable:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close-modal {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #2563eb;
}

/* Deadliest Diseases Card */
.deadliest-card {
  background: white;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  transition: all 0.2s;
  cursor: pointer;
}

.deadliest-card:hover {
  border-color: #fecaca;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
  transform: translateY(-2px);
}

.deadliest-rank {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.deadliest-content {
  flex: 1;
}

.deadliest-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.death-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
}

.deadliest-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.stat-item {
  color: #64748b;
  font-size: 0.8rem;
}

.stat-item i {
  color: #94a3b8;
}
</style>
