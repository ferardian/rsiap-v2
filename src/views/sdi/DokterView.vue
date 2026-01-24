<template>
  <div class="dokter-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-user-md mr-2"></i>
            Data Dokter
          </h1>
          <p class="page-subtitle">Manajemen data dokter dan tenaga medis</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="handleSearch"
              placeholder="Cari nama dokter atau kode..."
            />
          </div>
          <button v-if="canCreate" class="btn-add" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Tambah Dokter</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data...</p>
    </div>

    <!-- Data Table -->
    <div v-else-if="!loading && dokterList.length > 0" class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Dokter</th>
              <th>Kode</th>
              <th>Spesialisasi</th>
              <th>Alumni</th>
              <th>No. Ijin Praktek</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dokter in dokterList" :key="dokter.kd_dokter">
              <td>
                <div class="doctor-profile">
                  <div class="avatar">
                    <span class="initials">{{ getInitials(dokter.nm_dokter) }}</span>
                  </div>
                  <div class="doctor-info">
                    <span class="doc-name">{{ dokter.nm_dokter }}</span>
                    <span class="doc-code">{{ dokter.kd_dokter }}</span>
                  </div>
                </div>
              </td>
              <td><span class="code-text">{{ dokter.kd_dokter }}</span></td>
              <td>{{ dokter.spesialis_nama || '-' }}</td>
              <td>{{ dokter.alumni || '-' }}</td>
              <td>{{ dokter.no_ijn_praktek || '-' }}</td>
              <td>
                <span :class="['status-badge', dokter.status === '1' ? 'active' : 'inactive']">
                  {{ dokter.status === '1' ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button v-if="canUpdate" class="btn-edit" @click="openEditModal(dokter)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button v-if="canDelete" class="btn-delete" @click="confirmDelete(dokter)" title="Hapus">
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
      <i class="fas fa-user-md"></i>
      <p>Tidak ada data dokter</p>
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

    <!-- Loading Detail Overlay -->
    <div v-if="loadingDetail" class="detail-loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Dokter Form Modal -->
    <DokterFormModal 
      :show="showFormModal"
      :is-edit="isEditMode"
      :dokter-data="selectedDokter"
      @close="showFormModal = false"
      @saved="loadDokter"
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
          <p>Apakah Anda yakin ingin menghapus dokter <strong>{{ selectedDokter?.nm_dokter }}</strong>?</p>
          <p class="warning-text">Data yang dihapus tidak dapat dikembalikan.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Batal</button>
          <button class="btn-confirm-delete" @click="deleteDokter">
            <i class="fas fa-trash"></i>
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMenuStore } from '../../stores/menu'
import { dokterService } from '../../services/dokterService'
import DokterFormModal from './components/DokterFormModal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const menuStore = useMenuStore()

// State
const loading = ref(false)
const loadingDetail = ref(false)
const searchQuery = ref('')
const dokterList = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 50,
  total: 0
})
const showDeleteModal = ref(false)
const showFormModal = ref(false)
const isEditMode = ref(false)
const selectedDokter = ref(null)

// Permissions (assuming MENU_ID for Data Dokter)
const MENU_ID = 24 // Adjust based on your menu configuration

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
const loadDokter = async (page = 1) => {
  loading.value = true
  try {
    const response = await dokterService.getDokter(page, 50, searchQuery.value)
    if (response.data.success) {
      dokterList.value = response.data.data
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Error loading dokter:', error)
    toast.error('Gagal memuat data dokter')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  loadDokter(1)
}

const changePage = (page) => {
  loadDokter(page)
}

const openAddModal = () => {
  selectedDokter.value = null
  isEditMode.value = false
  showFormModal.value = true
}

const openEditModal = async (dokter) => {
  loadingDetail.value = true
  try {
    const response = await dokterService.getDokterById(dokter.kd_dokter)
    if (response.data.success) {
      selectedDokter.value = response.data.data
      isEditMode.value = true
      showFormModal.value = true
    }
  } catch (error) {
    console.error('Error fetching dokter detail:', error)
    toast.error('Gagal mengambil detail data dokter')
  } finally {
    loadingDetail.value = false
  }
}

const confirmDelete = (dokter) => {
  selectedDokter.value = dokter
  showDeleteModal.value = true
}

const deleteDokter = async () => {
  try {
    const response = await dokterService.deleteDokter(selectedDokter.value.kd_dokter)
    if (response.data.success) {
      toast.success('Dokter berhasil dihapus')
      showDeleteModal.value = false
      loadDokter(pagination.value.current_page)
    }
  } catch (error) {
    console.error('Error deleting dokter:', error)
    toast.error('Gagal menghapus dokter')
  }
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
  loadDokter()
})
</script>

<style scoped>
.dokter-container {
  padding: 2rem;
  max-width: 100%;
  margin: 0 auto;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  padding: 3rem 2rem;
  border-radius: 0 0 30px 30px;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  opacity: 0.9;
  font-size: 1rem;
  margin-top: 0.5rem;
  padding-left: 2.2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  min-width: 300px;
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
}

.search-box input:focus {
  outline: none;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.table-wrapper {
  overflow-x: auto;
  max-height: calc(100vh - 350px);
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
}

.data-table thead {
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
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

/* Doctor Profile */
.doctor-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar .initials {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.doctor-info {
  display: flex;
  flex-direction: column;
}

.doc-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.doc-code {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.code-text {
  font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
  font-size: 0.8rem;
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
  border-color: #3b82f6;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #64748b;
}

/* Detail Loading Overlay */
.detail-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-body {
  padding: 2rem;
}

.warning-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-confirm-delete:hover {
  background: #b91c1c;
}
</style>
