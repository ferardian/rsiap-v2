<template>
  <div class="approval-cuti-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">✅ Approval Cuti</h1>
          <p class="page-subtitle">Setujui atau tolak pengajuan cuti pegawai</p>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="content-card">
      <div class="history-header bg-gray-50 border-b border-gray-100">
        <div class="header-row-with-button">
          <h3>Daftar Pengajuan Cuti</h3>
        </div>
        <div class="flex items-center gap-3">
          <p class="text-sm text-gray-500">Pengajuan cuti yang menunggu persetujuan Anda</p>
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
      
      <!-- Tabs -->
      <div class="tabs-container">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="['tab-button', { 'active': activeTab === tab.value }]"
        >
          <i :class="['fas', tab.icon]"></i>
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-container">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin mr-2"></i> Memuat data...
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredCutiList.length === 0" class="empty-state">
            <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">Tidak ada pengajuan cuti {{ getTabLabel() }}.</p>
          </div>
          
          <!-- Data Table -->
          <table v-else class="w-full">
            <thead>
              <tr>
                <th>TANGGAL PENGAJUAN</th>
                <th>NIK & NAMA</th>
                <th>JENIS CUTI</th>
                <th>TANGGAL CUTI</th>
                <th>STATUS</th>
                <th class="text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cuti in filteredCutiList" :key="cuti.id_cuti">
                <td>
                  <div class="date-with-icon">
                    <i class="fas fa-calendar"></i>
                    <span>{{ formatDate(cuti.tanggal_pengajuan) }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex flex-col">
                    <span class="font-semibold text-gray-900">{{ cuti.nama }}</span>
                    <span class="nik-text">{{ cuti.nik }}</span>
                  </div>
                </td>
                <td>
                  <span class="font-medium text-gray-700">{{ cuti.jenis }}</span>
                </td>
                <td>
                  <div class="date-with-icon">
                    <i class="fas fa-clock"></i>
                    <span>{{ formatDate(cuti.tanggal_cuti) }}</span>
                  </div>
                </td>
                <td>
                  <span :class="getStatusBadgeClass(cuti.status ?? cuti.status_cuti)">
                    <i :class="['fas', getStatusIcon(cuti.status ?? cuti.status_cuti)]"></i>
                    {{ getStatusLabel(cuti.status ?? cuti.status_cuti) }}
                  </span>
                </td>
                <td>
                  <div v-if="activeTab === 'pending'" class="flex justify-center gap-2">
                    <button 
                      @click="handleApprove(cuti.id_cuti)" 
                      class="btn-approve"
                      title="Setujui"
                    >
                      <i class="fas fa-check"></i>
                      Setujui
                    </button>
                    <button 
                      @click="handleReject(cuti.id_cuti)" 
                      class="btn-reject"
                      title="Tolak"
                    >
                      <i class="fas fa-times"></i>
                      Tolak
                    </button>
                  </div>
                  <div v-else class="text-center text-gray-400 text-sm">
                    -
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import cutiApprovalService from '../../services/cutiApprovalService'
import SearchableSelect from '../../components/ui/SearchableSelect.vue'
import { showToast } from '../../utils/notification'

const authStore = useAuthStore()

// Get NIK from auth store
const nik = computed(() => {
  // NIK is in user.data.detail.nik based on auth store structure
  return authStore.user?.data?.detail?.nik || 
         authStore.user?.detail?.nik || 
         authStore.user?.nik
})

// State
const loading = ref(false)
const cutiList = ref([])
const selectedYear = ref(new Date().getFullYear())
const activeTab = ref('pending')

// Tabs configuration
const tabs = computed(() => [
  { 
    value: 'pending', 
    label: 'Menunggu', 
    icon: 'fa-clock',
    count: cutiList.value.filter(c => (c.status ?? c.status_cuti) == '0').length
  },
  { 
    value: 'approved', 
    label: 'Disetujui', 
    icon: 'fa-check-circle',
    count: cutiList.value.filter(c => (c.status ?? c.status_cuti) == '2').length
  },
  { 
    value: 'rejected', 
    label: 'Ditolak', 
    icon: 'fa-times-circle',
    count: cutiList.value.filter(c => (c.status ?? c.status_cuti) == '3').length
  }
])

// Filtered list based on active tab
const filteredCutiList = computed(() => {
  const statusMap = {
    'pending': '0',
    'approved': '2',
    'rejected': '3'
  }
  const targetStatus = statusMap[activeTab.value]
  return cutiList.value.filter(cuti => (cuti.status ?? cuti.status_cuti) == targetStatus)
})

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

// Watch year change to reload data
watch(selectedYear, () => {
  loadData()
})

// Methods
const loadData = async () => {
  console.log('loadData called, NIK:', nik.value)
  
  if (!nik.value) {
    console.error('NIK is not available')
    return
  }
  
  loading.value = true
  try {
    const params = selectedYear.value ? { year: selectedYear.value } : {}
    console.log('Calling API with params:', params)
    
    // Fetch all statuses, filter will be done on frontend via tabs
    const response = await cutiApprovalService.getApprovalList(nik.value, params)
    console.log('API Response:', response.data)
    
    cutiList.value = response.data.data
    console.log('cutiList updated:', cutiList.value)
  } catch (error) {
    console.error('Failed to load approval list', error)
    console.error('Error response:', error.response)
    showToast('Gagal memuat data approval', 'error')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menyetujui pengajuan cuti ini?')) return
  
  try {
    await cutiApprovalService.approveLeave(nik.value, id)
    showToast('Pengajuan cuti berhasil disetujui', 'success')
    loadData()
  } catch (error) {
    console.error('Failed to approve leave', error)
    showToast(error.response?.data?.message || 'Gagal menyetujui cuti', 'error')
  }
}

const handleReject = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menolak pengajuan cuti ini?')) return
  
  try {
    await cutiApprovalService.rejectLeave(nik.value, id)
    showToast('Pengajuan cuti berhasil ditolak', 'success')
    loadData()
  } catch (error) {
    console.error('Failed to reject leave', error)
    showToast(error.response?.data?.message || 'Gagal menolak cuti', 'error')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getTabLabel = () => {
  const labels = {
    'pending': 'yang menunggu persetujuan',
    'approved': 'yang sudah disetujui',
    'rejected': 'yang ditolak'
  }
  return labels[activeTab.value] || ''
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

// Initialize
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.approval-cuti-page {
  padding: 0;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  padding: 2.5rem 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.history-header {
  padding: 2rem;
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

/* Tabs Container */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 2px solid #f1f5f9;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  position: relative;
}

.tab-button:hover {
  background: #f8fafc;
  color: #334155;
}

.tab-button.active {
  background: #f8fafc;
  color: #3b82f6;
  border-bottom: 3px solid #3b82f6;
}

.tab-button i {
  font-size: 0.875rem;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
}

.tab-button.active .tab-count {
  background: #dbeafe;
  color: #1e40af;
}

/* Table Container */
.table-container {
  width: 100%;
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
  position: relative;
}

/* Sticky Table Header */
.table-container thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
}

/* Table Styles */
table {
  border-collapse: collapse;
  width: 100%;
}

thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

thead th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

tbody tr:nth-child(even) {
  background: #fafbfc;
}

tbody tr:hover {
  background: #f1f5f9;
}

tbody td {
  padding: 1.25rem 1.5rem;
  font-size: 0.95rem;
  color: #334155;
  vertical-align: middle;
}

/* NIK Text Spacing */
.nik-text {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.375rem;
  display: block;
}

/* Date with Icon */
.date-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-with-icon i {
  color: #9ca3af;
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* Action Buttons */
.btn-approve,
.btn-reject {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-approve {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-approve:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-reject:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
