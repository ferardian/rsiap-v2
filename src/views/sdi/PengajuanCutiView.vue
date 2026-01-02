<template>
  <div class="pengajuan-cuti-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">📅 Pengajuan Cuti</h1>
          <p class="page-subtitle">Kelola pengajuan cuti pegawai</p>
        </div>
      </div>
    </div>

    <!-- Stats / Counter -->
    <div class="stats-grid">
      <div class="stat-card bg-gradient-to-br from-blue-50 to-white border border-blue-100">
        <div class="stat-icon bg-blue-500 text-white shadow-lg shadow-blue-500/30">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats?.jml1 || 0 }}</h3>
          <p class="text-blue-600 font-medium">Cuti Semester 1</p>
        </div>
      </div>
      <div class="stat-card bg-gradient-to-br from-green-50 to-white border border-green-100">
        <div class="stat-icon bg-green-500 text-white shadow-lg shadow-green-500/30">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats?.jml2 || 0 }}</h3>
          <p class="text-green-600 font-medium">Cuti Semester 2</p>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="content-card">
      <div class="history-header bg-gray-50 border-b border-gray-100">
        <div class="header-row-with-button">
          <h3>Riwayat Pengajuan</h3>
          <button class="btn-ajukan-cuti" @click="openRequestModal">
            <i class="fas fa-plus"></i>
            <span>Ajukan Cuti</span>
          </button>
        </div>
        <div class="flex items-center gap-3">
          <p class="text-sm text-gray-500">Daftar riwayat permohonan cuti Anda</p>
          <div class="year-filter-wrapper">
            <SearchableSelect 
              v-model="selectedYear" 
              :options="yearOptionsForSelect" 
              placeholder="Pilih Tahun"
              labelKey="label"
              valueKey="value"
            />
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-container">
          <table class="w-full">
            <thead>
              <tr>
                <th>Tanggal Pengajuan</th>
                <th>Jenis Cuti</th>
                <th>Tanggal Cuti</th>
                <th>Status</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr>
                <td colspan="5" class="py-8 text-center text-gray-500">
                  <i class="fas fa-spinner fa-spin mr-2"></i> Memuat data...
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="cutiList.length === 0">
              <tr>
                <td colspan="5" class="py-8 text-center text-gray-500">
                  Belum ada riwayat pengajuan cuti.
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="cuti in cutiList" :key="cuti.id_cuti">
                <td>
                  {{ formatDate(cuti.tanggal_pengajuan) }}
                </td>
                <td>
                  <span class="font-medium">{{ cuti.jenis }}</span>
                </td>
                <td>
                  {{ formatDate(cuti.tanggal_cuti) }}
                </td>
                <td>
                  <span :class="getStatusBadgeClass(cuti.status ?? cuti.status_cuti)" :style="getStatusBadgeStyle(cuti.status ?? cuti.status_cuti)">
                    <i :class="['fas', getStatusIcon(cuti.status ?? cuti.status_cuti)]"></i>
                    {{ getStatusLabel(cuti.status ?? cuti.status_cuti) }}
                  </span>
                </td>
                <td class="text-right pr-4">
                  <button 
                    v-if="(cuti.status ?? cuti.status_cuti) == 0"
                    class="btn-delete-cuti"
                    @click="deleteRequest(cuti.id_cuti)"
                  >
                    <i class="fas fa-times-circle"></i>
                    <span>BATAL</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Request Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Ajukan Cuti Baru</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitRequest" class="space-y-5">
            
            <!-- Jenis Cuti -->
            <div class="form-group">
              <label class="form-label">
                Jenis Cuti
              </label>
              <SearchableSelect 
                v-model="form.jenis" 
                :options="jenisCutiOptions" 
                placeholder="Pilih Jenis Cuti"
                labelKey="name"
                valueKey="id"
              />
            </div>

            <!-- Date Range Grid -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Tanggal Mulai -->
              <div class="form-group">
                <label class="form-label">
                  Tanggal Mulai
                </label>
                <input 
                  type="date" 
                  v-model="form.tanggal_cuti.start" 
                  class="form-input" 
                  required
                >
              </div>

              <!-- Tanggal Selesai -->
              <div class="form-group">
                <label class="form-label">
                  Tanggal Selesai
                </label>
                <input 
                  type="date" 
                  v-model="form.tanggal_cuti.end" 
                  class="form-input" 
                  required
                >
              </div>
            </div>

            <!-- Info Box for Maternity Leave -->
            <div v-if="form.jenis === 'Cuti Bersalin'" class="info-box">
              <div class="flex items-start gap-3">
                <i class="fas fa-info-circle text-blue-500 mt-0.5"></i>
                <div class="text-sm text-blue-700">
                  <p class="font-semibold mb-1">Info Cuti Bersalin</p>
                  <p>Pastikan tanggal mulai diperkirakan 1.5 bulan sebelum HPL atau sesuai rekomendasi dokter.</p>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeModal">
                Batal
              </button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                <i class="fas fa-paper-plane mr-2"></i>
                {{ submitting ? 'Mengirim...' : 'Ajukan Sekarang' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import cutiPegawaiService from '../../services/cutiPegawaiService'
import { showToast } from '../../utils/notification'
import SearchableSelect from '../../components/ui/SearchableSelect.vue'

// Props/Route
const authStore = useAuthStore()
// Retrieve NIK from auth store with multiple fallbacks
const nik = computed(() => {
  const user = authStore.user
  // Check paths based on user provided structure: user.data.detail.nik
  return user?.data?.detail?.nik || 
         user?.detail?.nik || 
         user?.data?.id_user || 
         user?.username || 
         user?.nik || 
         ''
})

// State
const loading = ref(false)
const submitting = ref(false)
const cutiList = ref([])
const stats = ref(null)
const showModal = ref(false)
const selectedYear = ref('all') // Default to 'all' to show all data

// Year options (current year and 5 years back)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 6; i++) {
    years.push(currentYear - i)
  }
  return years
})

// Year options formatted for SearchableSelect
const yearOptionsForSelect = computed(() => {
  const options = [
    { value: 'all', label: 'Semua' }
  ]
  
  yearOptions.value.forEach(year => {
    options.push({
      value: year,
      label: year.toString()
    })
  })
  
  return options
})

const form = reactive({
  jenis: '',
  tanggal_cuti: {
    start: '',
    end: ''
  }
})

const jenisCutiOptions = [
  { id: '', name: 'Pilih Jenis Cuti' },
  { id: 'Cuti Tahunan', name: 'Cuti Tahunan' },
  { id: 'Cuti Bersalin', name: 'Cuti Bersalin' },
  { id: 'Cuti Diluar Tanggungan', name: 'Cuti Diluar Tanggungan' },
  { id: 'Cuti Besar', name: 'Cuti Besar' }
]

// Watch year change to reload data
watch(selectedYear, () => {
  loadData()
})

// Methods
const loadData = async () => {
  if (!nik.value) return
  loading.value = true
  try {
    // Only pass year param if a specific year is selected (not 'all')
    const params = (selectedYear.value && selectedYear.value !== 'all') ? { year: selectedYear.value } : {}
    const response = await cutiPegawaiService.getCuti(nik.value, params)
    cutiList.value = response.data.data
    
    // Load stats with year filter
    const statsResponse = await cutiPegawaiService.getCounter(nik.value, params)
    stats.value = statsResponse.data.data
  } catch (error) {
    console.error('Failed to load cuti data', error)
    showToast('Gagal memuat data cuti', 'error')
  } finally {
    loading.value = false
  }
}

const openRequestModal = () => {
  form.jenis = ''
  form.tanggal_cuti.start = ''
  form.tanggal_cuti.end = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitRequest = async () => {
  if (!nik.value) {
    showToast('User tidak valid', 'error')
    return
  }
  
  submitting.value = true
  try {
    const payload = {
      jenis: form.jenis,
      tanggal_cuti: {
        start: form.tanggal_cuti.start,
        end: form.tanggal_cuti.end
      }
    }
    
    // Add tanggal_selesai for Cuti Bersalin
    if (form.jenis === 'Cuti Bersalin') {
      payload.tanggal_selesai = form.tanggal_cuti.end
    }
    
    await cutiPegawaiService.createCuti(nik.value, payload)
    showToast('Pengajuan cuti berhasil dikirim', 'success')
    closeModal()
    loadData()
  } catch (error) {
    console.error('Failed to submit cuti', error)
    showToast(error.response?.data?.message || 'Gagal mengajukan cuti', 'error')
  } finally {
    submitting.value = false
  }
}

const deleteRequest = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) return
  
  try {
    await cutiPegawaiService.deleteCuti(nik.value, id)
    showToast('Pengajuan berhasil dihapus', 'success')
    loadData()
  } catch (error) {
    console.error('Failed to delete cuti', error)
    showToast('Gagal menghapus pengajuan', 'error')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getStatusLabel = (status) => {
  switch (Number(status)) {
    case 0: return 'Menunggu Persetujuan'
    case 1: return 'Dibatalkan' 
    case 2: return 'Disetujui'
    case 3: return 'Ditolak'
    default: return 'Unknown'
  }
}

const getStatusIcon = (status) => {
  switch (Number(status)) {
    case 0: return 'fa-clock'
    case 1: return 'fa-ban'
    case 2: return 'fa-check-circle'
    case 3: return 'fa-times-circle'
    default: return 'fa-question-circle'
  }
}

const getStatusBadgeClass = (status) => {
  const base = "status-badge"
  
  switch (Number(status)) {
    case 0: return `${base} status-pending`
    case 1: return `${base} status-cancelled`
    case 2: return `${base} status-approved`
    case 3: return `${base} status-rejected`
    default: return `${base} status-unknown`
  }
}

// Inline styles not needed if using standard bg classes or if HEX works better in classes
const getStatusBadgeStyle = (status) => {
  return {} // Reset inline styles
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Page Layout */
.pengajuan-cuti-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
  background: linear-gradient(to right, #1e293b, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.25rem;
  color: #0f172a;
}

/* Content Card & Table */
.content-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  overflow: hidden;
}

.history-header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.history-header h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
  margin: 0;
}

.header-row-with-button {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  width: 100%;
}

.header-row-with-button .btn-ajukan-cuti {
  margin-left: auto;
}

.table-container {
  overflow-x: auto;
  padding: 0 0.5rem; /* Space for row shadows */
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 1rem; /* Big spacing between floating rows */
}

thead th {
  background-color: transparent;
  color: #94a3b8;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1.5rem;
  text-align: left;
  border: none;
}

tbody tr {
  background-color: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); /* Soft diffuse shadow */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 1rem;
}

tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  z-index: 10;
  position: relative;
}

tbody td {
  padding: 1.25rem 1.5rem;
  color: #334155;
  font-size: 0.95rem;
  border: none; /* No borders at all */
  white-space: nowrap;
}

tbody td:first-child {
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
}

tbody td:last-child {
  border-top-right-radius: 1rem;
  border-bottom-right-radius: 1rem;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4); /* Lighter backdrop */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 1.5rem;
  width: 95%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 24px;
  background: #60a5fa;
  border-radius: 4px;
}

.modal-body {
  padding: 2rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* Form Styles Override */
input[type="date"], select {
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

input[type="date"]:focus, select:focus {
  background-color: #fff;
  transform: translateY(-1px);
}

/* Custom Scrollbar */
.modal-content::-webkit-scrollbar {
  width: 8px;
}
.modal-content::-webkit-scrollbar-track {
  background: transparent;
}
.modal-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
  border: 2px solid #fff;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

/* Form Styles */
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:hover {
  border-color: #9ca3af;
}

.info-box {
  background: linear-gradient(to right, #eff6ff, #f0f9ff);
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 0.5rem;
  animation: fadeIn 0.3s ease-out;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.625rem 1.5rem;
  color: #4b5563;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-submit {
  padding: 0.625rem 1.5rem;
  color: white;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Delete Button in Table */
.btn-delete-cuti {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background-color: #fee2e2;
  color: #dc2626;
  border: 2px solid #fca5a5;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-delete-cuti:hover {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);
  transform: translateY(-1px);
}

.btn-delete-cuti i {
  font-size: 0.875rem;
}

/* Ajukan Cuti Button */
.btn-ajukan-cuti {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
}

.btn-ajukan-cuti:hover {
  background: linear-gradient(to right, #1d4ed8, #4338ca);
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn-ajukan-cuti i {
  font-size: 0.75rem;
}

/* Year Filter Wrapper */
.year-filter-wrapper {
  min-width: 120px;
  max-width: 140px;
}

/* Status Badge Styles */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
  border: 2px solid #fbbf24;
}

.status-cancelled {
  background-color: #f1f5f9;
  color: #475569;
  border: 2px solid #cbd5e1;
}

.status-approved {
  background-color: #d1fae5;
  color: #065f46;
  border: 2px solid #34d399;
}

.status-rejected {
  background-color: #ffe4e6;
  color: #9f1239;
  border: 2px solid #fb7185;
}

.status-unknown {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 2px solid #d1d5db;
}
</style>
