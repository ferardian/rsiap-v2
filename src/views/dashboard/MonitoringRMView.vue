<template>
  <div class="monitoring-rm-page">
    <div class="main-wrapper">
      <!-- Header Section -->
      <div class="page-header shadow-sm">
        <div class="header-overlay"></div>
        <div class="header-content">
          <div class="title-section">
            <div class="status-indicator">
              <div class="pulse-dot"></div>
              <span class="system-label">SISTEM MONITORING</span>
            </div>
            <h1 class="page-title">Monitoring Migrasi RM</h1>
            <p class="page-subtitle">Tracking Progress Digitalisasi Rekam Medis Manual &rarr; ERM</p>
          </div>
          <div class="completion-card">
            <div class="completion-info">
              <div class="percentage">{{ completionRate }}%</div>
              <div class="label">MIGRASI SELESAI</div>
            </div>
            <div class="completion-track">
              <div class="completion-fill" :style="{ width: `${completionRate}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
      <!-- Stats Summary Cards -->
      <div class="stats-grid">
        <div v-for="stat in statCards" :key="stat.label" class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <div class="stat-icon" :style="{ color: `${stat.color}22` }">{{ stat.icon }}</div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Distribution Chart (Simplified Radial concept with CSS) -->
        <div class="chart-container distribution-chart">
          <h3 class="chart-title">▸ Distribusi Status</h3>
          <div class="radial-group">
            <div v-for="s in radialStats" :key="s.label" class="radial-item">
              <div class="radial-progress" :style="getRadialStyle(s.value, stats.total, s.color)">
                <div class="radial-inner">
                  <span class="radial-value" :style="{ color: s.color }">{{ s.value }}</span>
                </div>
              </div>
              <span class="radial-label">{{ s.label }}</span>
            </div>
          </div>
        </div>

        <!-- Progress per Unit -->
        <div class="chart-container unit-progress">
          <h3 class="chart-title">▸ Progress per Unit</h3>
          <div v-if="loading" class="loading-mini">
            <div class="spinner"></div>
          </div>
          <div v-else class="bar-grid">
            <div v-for="(v, unit) in stats.unit_map" :key="unit" class="bar-item">
              <div class="bar-header">
                <span class="unit-name">{{ unit }}</span>
                <span class="unit-count" :style="{ color: '#10b981' }">{{ v.ERM }}/{{ v.total }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: `${stats.total > 0 ? (v.ERM/v.total)*100 : 0}%`, backgroundColor: '#10b981' }"></div>
              </div>
            </div>
            <div v-if="Object.keys(stats.unit_map).length === 0" class="empty-mini">
              Belum ada data unit
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-bar card shadow-sm">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="Cari kode, nama berkas, atau departemen..." 
            class="search-input"
          >
        </div>
        <div class="filter-controls">
          <select v-model="filters.unit" class="select-input">
            <option value="Semua Unit">Semua Unit</option>
            <option v-for="dept in departemenList" :key="dept.dep_id" :value="dept.dep_id">{{ dept.nama }}</option>
          </select>
          <div class="status-tabs">
            <button 
              v-for="s in statusOptions" 
              :key="s" 
              @click="filters.status = s"
              :class="['tab-btn', { active: filters.status === s }, s.toLowerCase().replace(' ', '-')] "
            >
              {{ s }}
            </button>
          </div>
          <button @click="openModal()" class="btn-add">
            <i class="fas fa-plus"></i> Tambah Berkas
          </button>
          <div class="result-count">
            {{ filteredData.length }} berkas
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-card shadow-sm">
        <div class="table-container" :class="{ 'is-loading': loading }">
          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
            <span>Memuat data...</span>
          </div>
          <table class="monitoring-table">
            <thead>
              <tr>
                <th @click="handleSort('kode')" class="sortable">Kode RM <i :class="getSortIcon('kode')"></i></th>
                <th @click="handleSort('nama')" class="sortable">Nama Berkas <i :class="getSortIcon('nama')"></i></th>
                <th @click="handleSort('unit')" class="sortable">Departemen <i :class="getSortIcon('unit')"></i></th>
                <th @click="handleSort('status')" class="sortable">Status <i :class="getSortIcon('status')"></i></th>
                <th @click="handleSort('tabel')" class="sortable">Tabel DB <i :class="getSortIcon('tabel')"></i></th>
                <th @click="handleSort('catatan')" class="sortable">Catatan <i :class="getSortIcon('catatan')"></i></th>
                <th @click="handleSort('updated_at')" class="sortable">Diperbarui <i :class="getSortIcon('updated_at')"></i></th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredData" :key="row.id">
                <td class="cell-kode">{{ row.kode }}</td>
                <td class="cell-nama">{{ row.nama }}</td>
                <td class="cell-unit">
                  <div class="dept-badges">
                    <span v-for="dept in row.departemen" :key="dept.dep_id" class="badge-unit">
                      {{ dept.nama }}
                    </span>
                    <span v-if="!row.departemen?.length" class="badge-unit empty">N/A</span>
                  </div>
                </td>
                <td class="cell-status">
                  <span :class="['badge-status', row.status.toLowerCase().replace(' ', '-')]">
                    <span class="status-dot"></span> {{ row.status }}
                  </span>
                </td>
                <td class="cell-tabel">
                  <code v-if="row.tabel && row.tabel !== '-'" class="tabel-code">{{ row.tabel }}</code>
                  <span v-else class="empty-dash">—</span>
                </td>
                <td class="cell-catatan">
                  <div v-if="row.catatan && row.catatan !== '-'" class="catatan-wrapper">
                    <span class="catatan-text">{{ row.catatan }}</span>
                    <div class="catatan-tooltip">{{ row.catatan }}</div>
                  </div>
                  <span v-else class="empty-dash">—</span>
                </td>
                <td class="cell-updated">{{ formatDate(row.updated_at) }}</td>
                <td class="cell-actions">
                  <div class="action-btns">
                    <button @click="openModal(row)" class="btn-icon" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete(row)" class="btn-icon delete" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredData.length === 0 && !loading">
                <td colspan="6" class="empty-state">
                  <div class="empty-content">
                    <i class="fas fa-folder-open mb-2"></i>
                    <p>Tidak ada data yang sesuai filter</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="page-footer-info">
        <div class="copyright">&copy; Monitoring Migrasi RM v2.0</div>
        <div class="legend">
          <div class="legend-item"><span class="dot erm"></span> ERM</div>
          <div class="legend-item"><span class="dot progress"></span> On Progress</div>
          <div class="legend-item"><span class="dot manual"></span> Manual</div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card shadow-lg">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit Berkas RM' : 'Tambah Berkas RM' }}</h3>
          <button @click="showModal = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="saveData" class="modal-form-wrapper">
          <div class="modal-body">
            <div class="form-group">
              <label>Kode RM</label>
              <input v-model="formData.kode" type="text" placeholder="Contoh: RM001" required>
            </div>
            <div class="form-group">
              <label>Nama Berkas</label>
              <input v-model="formData.nama" type="text" placeholder="Contoh: Ringkasan Pulang" required>
            </div>
            <div class="form-group">
              <label>Departemen (Bisa pilih lebih dari satu)</label>
              <div class="dept-search-wrapper mb-2">
                <i class="fas fa-search search-icon-mini"></i>
                <input 
                  v-model="deptSearch" 
                  type="text" 
                  placeholder="Cari departemen..." 
                  class="search-input-mini"
                >
              </div>
              <div class="dept-selection-container">
                <div v-for="dept in filteredDepts" :key="dept.dep_id" class="dept-checkbox">
                  <label>
                    <input type="checkbox" v-model="formData.dep_ids" :value="dept.dep_id">
                    <span>{{ dept.nama }}</span>
                  </label>
                </div>
                <div v-if="filteredDepts.length === 0" class="empty-mini">
                  Tidak ada departemen ditemukan
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Status Migrasi</label>
              <div class="status-selection">
                <label v-for="s in ['ERM', 'On Progress', 'Manual']" :key="s" class="radio-label">
                  <input type="radio" v-model="formData.status" :value="s"> 
                  <span>{{ s }}</span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>Tabel Database (Opsional)</label>
              <input v-model="formData.tabel" type="text" placeholder="Nama tabel di Khanza">
            </div>
            <div class="form-group">
              <label>Catatan / Kendala</label>
              <textarea v-model="formData.catatan" rows="3" placeholder="Contoh: Masih proses mapping, berkas belum ditemukan, dll"></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="formLoading">
              <span v-if="formLoading" class="spinner-small"></span>
              {{ isEdit ? 'Simpan Perubahan' : 'Tambah Berkas' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { monitoringRMService } from '../../services/monitoringRMService'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

// State
const rawData = ref([])
const departemenList = ref([])
const loading = ref(false)
const formLoading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const deptSearch = ref('')

const statsData = ref({
  total: 0,
  erm: 0,
  on_progress: 0,
  manual: 0,
  unit_map: {}
})

const formData = reactive({
  id: null,
  kode: '',
  nama: '',
  dep_ids: [],
  status: 'Manual',
  catatan: '',
  tabel: ''
})

const filters = reactive({
  search: '',
  unit: 'Semua Unit',
  status: 'Semua'
})

const sort = reactive({
  column: 'id',
  direction: 'desc'
})

// Computed values
const stats = computed(() => statsData.value)

const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.erm / stats.value.total) * 100)
})

const statCards = computed(() => [
  { label: 'Total Berkas', value: stats.value.total, color: '#3b82f6', icon: '▣' },
  { label: 'ERM', value: stats.value.erm, color: '#10b981', icon: '✦' },
  { label: 'On Progress', value: stats.value.on_progress, color: '#f59e0b', icon: '◎' },
  { label: 'Manual', value: stats.value.manual, color: '#ef4444', icon: '✕' },
])

const radialStats = computed(() => [
  { label: 'ERM', value: stats.value.erm, color: '#10b981' },
  { label: 'Progress', value: stats.value.on_progress, color: '#f59e0b' },
  { label: 'Manual', value: stats.value.manual, color: '#ef4444' },
])

const statusOptions = ['Semua', 'ERM', 'On Progress', 'Manual']
const departemenOptions = computed(() => departemenList.value)

const filteredDepts = computed(() => {
  if (!deptSearch.value) return departemenList.value
  const q = deptSearch.value.toLowerCase()
  return departemenList.value.filter(d => d.nama.toLowerCase().includes(q))
})

const filteredData = computed(() => {
  let result = [...rawData.value]
  
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(d => 
      d.kode.toLowerCase().includes(q) || 
      d.nama.toLowerCase().includes(q) || 
      (d.tabel && d.tabel.toLowerCase().includes(q)) ||
      (d.catatan && d.catatan.toLowerCase().includes(q)) ||
      d.departemen?.some(dept => dept.nama.toLowerCase().includes(q))
    )
  }

  if (filters.unit !== 'Semua Unit') {
    result = result.filter(d => d.departemen?.some(dept => dept.dep_id === filters.unit))
  }
  
  if (filters.status !== 'Semua') {
    result = result.filter(d => d.status === filters.status)
  }
  
  return result.sort((a, b) => {
    let va = a[sort.column], vb = b[sort.column]
    if (va < vb) return sort.direction === 'asc' ? -1 : 1
    if (va > vb) return sort.direction === 'asc' ? 1 : -1
    return 0
  })
})

const handleSort = (col) => {
  if (sort.column === col) {
    sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sort.column = col
    sort.direction = 'asc'
  }
}

const getSortIcon = (col) => {
  if (sort.column !== col) return 'fas fa-sort text-muted op-3'
  return sort.direction === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary'
}

const getRadialStyle = (val, total, color) => {
  if (total === 0) return { background: '#f1f5f9' }
  const pct = (val / total) * 360
  return {
    background: `conic-gradient(${color} ${pct}deg, #f1f5f9 0deg)`
  }
}

const formatDate = (date) => date ? dayjs(date).format('DD MMM YYYY') : '—'

const fetchData = async () => {
  loading.value = true
  try {
    const [resData, resStats] = await Promise.all([
      monitoringRMService.getData(),
      monitoringRMService.getStats()
    ])
    
    if (resData.data.success) {
      rawData.value = resData.data.data
    }
    
    if (resStats.data.success) {
      statsData.value = resStats.data.data
    }
  } catch (err) {
    console.error('Failed to fetch monitoring RM data', err)
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Gagal mengambil data monitoring RM!'
    })
  } finally {
    loading.value = false
  }
}

const fetchDepartemen = async () => {
  try {
    const res = await monitoringRMService.getDepartemen()
    if (res.data.success) {
      departemenList.value = res.data.data
    }
  } catch (err) {
    console.error('Err Dept:', err)
  }
}

const openModal = (item = null) => {
  deptSearch.value = ''
  if (item) {
    isEdit.value = true
    formData.id = item.id
    formData.kode = item.kode
    formData.nama = item.nama
    formData.dep_ids = item.departemen?.map(d => d.dep_id) || []
    formData.status = item.status
    formData.catatan = item.catatan === '-' ? '' : item.catatan
    formData.tabel = item.tabel === '-' ? '' : item.tabel
  } else {
    isEdit.value = false
    formData.id = null
    formData.kode = ''
    formData.nama = ''
    formData.dep_ids = []
    formData.status = 'Manual'
    formData.catatan = ''
    formData.tabel = ''
  }
  showModal.value = true
}

const saveData = async () => {
  formLoading.value = true
  try {
    const payload = { ...formData }
    if (payload.tabel === '') payload.tabel = '-'
    
    let res
    if (isEdit.value) {
      res = await monitoringRMService.update(payload.id, payload)
    } else {
      res = await monitoringRMService.create(payload)
    }

    if (res.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: res.data.message,
        timer: 1500,
        showConfirmButton: false
      })
      showModal.value = false
      fetchData()
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.response?.data?.message || 'Terjadi kesalahan sistem'
    })
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Hapus berkas RM "${item.nama}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await monitoringRMService.delete(item.id)
        if (res.data.success) {
          Swal.fire('Terhapus!', res.data.message, 'success')
          fetchData()
        }
      } catch (err) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error')
      }
    }
  })
}

onMounted(() => {
  fetchData()
  fetchDepartemen()
})
</script>

<style scoped>
.monitoring-rm-page {
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  padding: 0.5rem;
}

.main-wrapper {
  max-width: 100%;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 1.5rem 2rem;
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 2s infinite;
}

.system-label {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  font-weight: 700;
  opacity: 0.8;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0.25rem 0 0 0;
}

.completion-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.completion-info {
  margin-bottom: 0.75rem;
}

.completion-card .percentage {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
  font-family: 'JetBrains Mono', monospace;
}

.completion-card .label {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  font-weight: 700;
  margin-top: 0.25rem;
  opacity: 0.9;
}

.completion-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  background: #10b981;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  transition: width 1s ease-out;
}

.content-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 0.25rem 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  position: absolute;
  right: -0.25rem;
  bottom: -0.25rem;
  font-size: 3.5rem;
  font-weight: 900;
  opacity: 0.3;
  transform: rotate(-10deg);
}

.stat-info {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.075em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-container {
  background: white;
  padding: 1.75rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.chart-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
  margin-bottom: 1.75rem;
  letter-spacing: 0.075em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 12px;
  background: #3b82f6;
  border-radius: 2px;
}

.radial-group {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.radial-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.radial-progress {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.radial-inner {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radial-value {
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
}

.radial-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
}

.bar-item {
  margin-bottom: 0.5rem;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.unit-name {
  color: #475569;
}

.bar-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.filter-bar {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 1.25rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.search-wrapper {
  flex: 2;
  position: relative;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  flex: 3;
  justify-content: flex-end;
}

.select-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background-color: #f8fafc;
  min-width: 180px;
  cursor: pointer;
  color: #475569;
  font-weight: 600;
  transition: all 0.2s;
}

.select-input:hover {
  border-color: #cbd5e1;
  background-color: white;
}

.select-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
}

.status-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 0.35rem;
  border-radius: 0.875rem;
  gap: 0.25rem;
}

.tab-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  background: transparent;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  white-space: nowrap;
}

.tab-btn.active {
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

.tab-btn.active.erm { color: #10b981; }
.tab-btn.active.on-progress { color: #f59e0b; }
.tab-btn.active.manual { color: #ef4444; }

.result-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
}

.table-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.table-container {
  overflow: auto;
  max-height: 60vh;
  position: relative;
  border-radius: inherit;
}

.monitoring-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th {
  background: #f8fafc;
  padding: 1.25rem 1.75rem;
  text-align: left;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.7rem;
  border-bottom: 2px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background: #f1f5f9;
  color: #1e293b;
}

td {
  padding: 1.15rem 1.75rem;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}

tr:hover td {
  background-color: #f8fafc;
}

.cell-kode {
  font-weight: 700;
  color: #3b82f6;
  font-family: 'JetBrains Mono', monospace;
}

.cell-nama {
  font-weight: 500;
  color: #334155;
}

.badge-unit {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.7rem;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-status.erm { background: #dcfce7; color: #15803d; }
.badge-status.erm .status-dot { background: #15803d; }

.badge-status.on-progress { background: #fef3c7; color: #b45309; }
.badge-status.on-progress .status-dot { background: #b45309; }

.badge-status.manual { background: #fee2e2; color: #b91c1c; }
.badge-status.manual .status-dot { background: #b91c1c; }

.tabel-code {
  background: #f1f5f9;
  color: #6366f1;
  padding: 0.2rem 0.4rem;
  border-radius: 0.375rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.cell-updated {
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
}

.empty-state {
  text-align: center;
  padding: 4rem !important;
  color: #94a3b8;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-content i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.page-footer-info {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
}

.legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.erm { background: #10b981; }
.dot.progress { background: #f59e0b; }
.dot.manual { background: #ef4444; }

.btn-add {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.btn-add:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.3);
}

.cell-actions {
  width: 100px;
}

.action-btns {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-icon.delete:hover {
  color: #ef4444;
  border-color: #ef4444;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  background: white;
  border-radius: 1.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  line-height: 1;
  padding: 0;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-form-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
}

.form-group input, 
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus, 
.form-group select:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.status-selection {
  display: flex;
  gap: 1rem;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 0.75rem;
}

.radio-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.5rem;
  cursor: pointer;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
  text-align: center;
  line-height: 1.2;
}

.radio-label input {
  display: none;
}

.radio-label:has(input:checked) {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: #3b82f6;
}

.modal-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  background: white;
  z-index: 10;
}

.btn-primary, 
.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.spinner-small {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

.dept-selection-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dept-checkbox label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.dept-checkbox label:hover {
  background: #f1f5f9;
}

.dept-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.dept-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.badge-unit.empty {
  background: #f1f5f9;
  color: #94a3b8;
}

.dept-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-mini {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.75rem;
}

.search-input-mini {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.25rem !important;
  font-size: 0.75rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
}

.search-input-mini:focus {
  background: white !important;
  border-color: #3b82f6 !important;
}

.cell-catatan {
  font-size: 0.75rem;
  color: #64748b;
  max-width: 200px;
  line-height: 1.4;
}

.catatan-wrapper {
  position: relative;
  cursor: pointer;
}

.catatan-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.catatan-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: #f8fafc;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 320px;
  min-width: 180px;
  z-index: 50;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.catatan-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1e293b;
}

.catatan-wrapper:hover .catatan-tooltip {
  display: block;
  animation: tooltipFadeIn 0.2s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.mb-2 {
  margin-bottom: 0.5rem;
}
@media (max-width: 768px) {
  .monitoring-rm-page {
    padding: 0.25rem;
  }

  .page-header {
    padding: 1.25rem 1rem;
    margin-bottom: 1.25rem;
    border-radius: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.75rem;
    max-width: 100%;
  }

  .completion-card {
    width: 100%;
    min-width: auto;
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .charts-row {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .chart-container {
    padding: 1.25rem;
  }

  .radial-group {
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .radial-progress {
    width: 70px;
    height: 70px;
  }

  .radial-inner {
    width: 54px;
    height: 54px;
  }

  .radial-value {
    font-size: 1.1rem;
  }

  .bar-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    padding: 1.25rem;
    flex-direction: column;
    gap: 1.25rem;
    align-items: stretch;
    margin-bottom: 1.25rem;
  }

  .search-wrapper {
    min-width: auto;
    width: 100%;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 1rem;
  }

  .select-input {
    width: 100%;
    min-width: auto;
    font-size: 0.8rem;
  }

  .status-tabs {
    width: 100%;
    overflow-x: auto;
    padding: 0.25rem;
    justify-content: flex-start;
  }

  .tab-btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: 0.7rem;
    text-align: center;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
    order: -1; /* Keep "Tambah" button on top in mobile */
  }

  .monitoring-table {
    font-size: 0.75rem;
  }

  th, td {
    padding: 0.75rem 1rem;
  }

  .cell-catatan {
    max-width: 150px;
  }

  .page-footer-info {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .legend {
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
