<template>
  <div class="karyawan-container">
    <!-- Header -->
    <div class="page-header">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- Search and Add (only for Data Karyawan tab) -->
      <div v-if="activeTab === 'data-karyawan'" class="header-actions">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleSearch"
            placeholder="Cari nama, NIP, atau jabatan..."
          />
        </div>
        <button v-if="canCreate" class="btn-add" @click="openAddModal">
          <i class="fas fa-plus"></i>
          <span>Tambah Karyawan</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'data-karyawan'">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat data...</p>
      </div>

      <!-- Data Table (Desktop) -->
      <div v-else-if="!loading && pegawaiList.length > 0" class="table-container">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>NIP</th>
                <th>Jenis Kelamin</th>
                <th>TTL</th>
                <th>Alamat</th>
                <th>Pendidikan</th>
                <th>No. KTP</th>
                <th>No. Telp</th>
                <!-- Jabatan merged with Name -->
                <th>Departemen</th>
                <th>Mulai Kerja</th>
                <th>Masa Kerja</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pegawai in pegawaiList" :key="pegawai.nip">
                <td>
                  <div class="employee-profile">
                    <div class="avatar">
                      <!-- Photo disabled to prevent 404 errors -->
                      <span class="initials">{{ getInitials(pegawai.nama) }}</span>
                    </div>
                    <div class="employee-info">
                      <span class="emp-name">{{ pegawai.nama }}</span>
                      <span class="emp-role">{{ pegawai.jbtn || '-' }}</span>
                    </div>
                  </div>
                </td>
                <td><span class="nip-text">{{ pegawai.nip }}</span></td>
                <td>{{ pegawai.jk || '-' }}</td>
                <td>
                  <div class="ttl">
                    {{ pegawai.tmp_lahir || '-' }},<br>
                    {{ formatDate(pegawai.tgl_lahir) }}
                  </div>
                </td>
                <td>
                  <div class="alamat-cell">{{ pegawai.alamat || '-' }}</div>
                </td>
                <td>{{ pegawai.pendidikan || '-' }}</td>
                <td>{{ pegawai.no_ktp || '-' }}</td>
                <td>{{ pegawai.no_telp || '-' }}</td>
                <!-- Jabatan moved to name column subtitle -->
                <td>{{ pegawai.departemen || '-' }}</td>
                <td>{{ formatDate(pegawai.mulai_kerja) }}</td>
                <td>
                  <div class="tenure-badge">
                    <i class="fas fa-history"></i>
                    {{ calculateTenure(pegawai.mulai_kerja) }}
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button v-if="canUpdate" class="btn-edit" @click="openEditModal(pegawai)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button v-if="canDelete" class="btn-delete" @click="confirmDelete(pegawai)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-users"></i>
        <p>Tidak ada data karyawan</p>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="pagination">
        <button 
          class="btn-page" 
          :disabled="pagination.current_page === 1"
          @click="changePage(pagination.current_page - 1)"
        >
          <i class="fas fa-chevron-left"></i>
          Sebelumnya
        </button>
        <span class="page-info">
          Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
          ({{ pagination.total }} total)
        </span>
        <button 
          class="btn-page" 
          :disabled="pagination.current_page === pagination.last_page"
          @click="changePage(pagination.current_page + 1)"
        >
          Selanjutnya
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Pegawai Form Modal -->
      <PegawaiFormModal 
        :show="showFormModal"
        :is-edit="isEditMode"
        :pegawai-data="selectedPegawai"
        @close="showFormModal = false"
        @saved="loadPegawai"
      />

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Konfirmasi Hapus</h3>
            <button class="btn-close" @click="showDeleteModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin menghapus karyawan <strong>{{ selectedPegawai?.nama }}</strong>?</p>
            <p class="warning-text">Data yang dihapus tidak dapat dikembalikan.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
            <button class="btn-confirm-delete" @click="deletePegawai">
              <i class="fas fa-trash"></i>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Staf Klinis Tab -->
    <StafKlinisTab v-else-if="activeTab === 'staf-klinis'" />

    <!-- Statistik Tab -->
    <StatistikTab v-else-if="activeTab === 'statistik'" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '../../stores/menu'
import { pegawaiService } from '../../services/pegawaiService'
import StafKlinisTab from './components/StafKlinisTab.vue'
import StatistikTab from './components/StatistikTab.vue'
import PegawaiFormModal from './components/PegawaiFormModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const router = useRouter()
const route = useRoute()

// Stores
const menuStore = useMenuStore()

// State
const tabs = [
  { id: 'data-karyawan', label: 'Data Karyawan', icon: 'fas fa-users' },
  { id: 'staf-klinis', label: 'Staf Klinis', icon: 'fas fa-user-md' },
  { id: 'statistik', label: 'Statistik', icon: 'fas fa-chart-pie' }
]
const activeTab = ref(route.query.tab || 'data-karyawan')
const loading = ref(false)
const searchQuery = ref('')
const pegawaiList = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 50,
  total: 0
})
const showDeleteModal = ref(false)
const showFormModal = ref(false)
const isEditMode = ref(false)
const selectedPegawai = ref(null)

// Computed - Permissions
// MENU_ID 23 is for 'Data Karyawan'
const MENU_ID = 23

const canCreate = computed(() => {
  return menuStore.hasMenuPermission(MENU_ID, 'can_create')
})

const canUpdate = computed(() => {
  return menuStore.hasMenuPermission(MENU_ID, 'can_update')
})

const canDelete = computed(() => {
  return menuStore.hasMenuPermission(MENU_ID, 'can_delete')
})

// Methods
const loadPegawai = async (page = 1) => {
  loading.value = true
  try {
    const response = await pegawaiService.getPegawai(page, 50)
    if (response.data.success) {
      pegawaiList.value = response.data.data
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Error loading pegawai:', error)
    alert('Gagal memuat data karyawan')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (searchQuery.value.trim().length < 2) {
    loadPegawai()
    return
  }
  
  loading.value = true
  try {
    const response = await pegawaiService.searchPegawai(searchQuery.value)
    if (response.data.success) {
      pegawaiList.value = response.data.data
      // Reset pagination for search results
      pagination.value = {
        current_page: 1,
        last_page: 1,
        per_page: response.data.data.length,
        total: response.data.data.length
      }
    }
  } catch (error) {
    console.error('Error searching pegawai:', error)
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  loadPegawai(page)
}

const openAddModal = () => {
  selectedPegawai.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = async (pegawai) => {
  loading.value = true
  try {
    // Get full employee data for editing
    const response = await pegawaiService.getPegawaiById(pegawai.nip)
    if (response.data.success) {
      selectedPegawai.value = response.data.data
      isEditMode.value = true
      showFormModal.value = true
    }
  } catch (error) {
    console.error('Error fetching employee detail:', error)
    toast.error('Gagal mengambil detail data karyawan')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (pegawai) => {
  selectedPegawai.value = pegawai
  showDeleteModal.value = true
}

const deletePegawai = async () => {
  try {
    const response = await pegawaiService.deletePegawai(selectedPegawai.value.nip)
    if (response.data.success) {
      alert('Karyawan berhasil dihapus')
      showDeleteModal.value = false
      loadPegawai(pagination.value.current_page)
    }
  } catch (error) {
    console.error('Error deleting pegawai:', error)
    alert('Gagal menghapus karyawan')
  }
}

const getPhotoUrl = (photo) => {
  // Adjust this based on your photo storage location
  return `/storage/pegawai/${photo}`
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const calculateTenure = (startDate) => {
  if (!startDate) return '-'
  
  const start = new Date(startDate)
  const now = new Date()
  
  if (isNaN(start.getTime())) return '-'

  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let days = now.getDate() - start.getDate()

  // Adjust for negative days (borrow from previous month)
  if (days < 0) {
    months--
    // Get days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }

  // Adjust for negative months (borrow from year)
  if (months < 0) {
    years--
    months += 12
  }

  // Formatting result
  const parts = []
  if (years > 0) parts.push(`${years} Tahun`)
  if (months > 0) parts.push(`${months} Bulan`)
  if (days > 0) parts.push(`${days} Hari`)
  
  // If exact match (today is start date) or very short
  if (parts.length === 0) return '0 Hari'
  
  return parts.join(' ')
}

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .match(/(^\S\S?|\s\S)?/g)
    .map(v => v.trim())
    .join('')
    .match(/(^\S|\S$)?/g)
    .join('')
    .toLocaleUpperCase()
    .substring(0, 2)
}

// Lifecycle
onMounted(() => {
  loadPegawai()
})
</script>

<style scoped>
.karyawan-container {
  padding: 2rem;
  max-width: 100%;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  bottom: -2px;
}

.tab-btn:hover {
  color: #3b82f6;
  background: #f8fafc;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.tab-btn i {
  font-size: 1rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}


/* Table */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 300px); /* Adjust based on header + pagination height */
}

.data-table {
  width: 100%;
  border-collapse: separate; /* Use separate for spacing/radius if needed, or collapse for standard grid */
  border-spacing: 0;
  min-width: 1400px; /* Ensure table doesn't squish on smaller screens */
}

.data-table thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 20;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.75rem; /* Smaller font */
  text-transform: uppercase; /* Modern look */
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  vertical-align: middle;
  color: #334155;
}

/* Sticky first column (Nama) */
.data-table th:first-child,
.data-table td:first-child {
  position: sticky;
  left: 0;
  background: white;
  z-index: 10;
  box-shadow: 4px 0 4px -2px rgba(0, 0, 0, 0.05); /* Softer shadow */
}

.data-table thead th:first-child {
  background: #f8fafc;
  z-index: 30; /* Higher than tbody sticky */
}

.data-table tbody tr:hover td:first-child {
  background: #f8fafc; /* Match hover */
}

/* Employee Profile */
.employee-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar .initials {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.emp-role {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.nip-text {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  font-size: 0.8rem;
}

.tenure-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 10px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #e0f2fe;
  white-space: nowrap;
}

.tenure-badge i {
  font-size: 0.7rem;
  opacity: 0.8;
}

.ttl {
  min-width: 150px;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #475569;
}

.alamat-cell {
  max-width: 250px;
  white-space: normal;
  line-height: 1.4;
  color: #475569;
}



.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}


/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.btn-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
}

/* Modal */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.warning-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .karyawan-container {
    padding: 1rem;
  }

  /* Tab Navigation - enable horizontal scroll */
  .tab-navigation {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: 0.75rem !important;
    gap: 0.25rem !important;
  }

  .tab-btn {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.75rem !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }

  /* Header actions - stack vertically */
  .header-actions {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }

  .search-box,
  .btn-add {
    width: 100% !important;
  }

  /* Table */
  .table-container {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  /* Disable sticky columns on mobile */
  .data-table th:first-child,
  .data-table td:first-child,
  .data-table th:last-child,
  .data-table td:last-child {
    position: static !important;
    left: auto !important;
    right: auto !important;
  }

  .karyawan-table {
    min-width: 800px !important;
    font-size: 0.875rem;
  }

  .karyawan-table th,
  .karyawan-table td {
    padding: 0.75rem 0.5rem;
    white-space: nowrap;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .page-info {
    order: -1;
  }
  
  /* Make table scrollable on mobile */
  .table-wrapper {
    max-height: calc(100vh - 350px);
  }
  
  .data-table {
    font-size: 0.75rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }
  
  .employee-name {
    max-width: 150px;
  }
}
</style>
