<template>
  <div class="role-management-modal-overlay">
    <div class="role-management-modal">
      <div class="modal-header">
        <h4>👥 Kelola Role</h4>
        <button type="button" class="btn-close" @click="$emit('close')">
          ×
        </button>
      </div>

      <div class="modal-body">
        <!-- Filter Section - Modern Design -->
        <div class="filter-section-modern">
          <div class="filter-header">
            <h5 class="filter-title">
              <i class="fas fa-filter"></i>
              Filter & Pencarian
            </h5>
          </div>
          <div class="filter-content">
            <div class="filter-grid">
              <!-- Search Input -->
              <div class="filter-item">
                <div class="filter-label">
                  <i class="fas fa-search"></i>
                  Cari Role
                </div>
                <div class="search-input-wrapper">
                  <div class="search-icon">
                    <i class="fas fa-search"></i>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    placeholder="Masukkan nama role..."
                    @input="currentPage = 1"
                  />
                  <div v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                    <i class="fas fa-times"></i>
                  </div>
                </div>
              </div>

              <!-- Status Filter -->
              <div class="filter-item">
                <div class="filter-label">
                  <i class="fas fa-toggle-on"></i>
                  Status
                </div>
                <div class="status-filter">
                  <select v-model="filterStatus" class="form-select-modern" @change="currentPage = 1">
                    <option value="">🔍 Semua Status</option>
                    <option value="1">✅ Aktif</option>
                    <option value="0">❌ Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="filter-item">
                <div class="filter-label">
                  <i class="fas fa-tools"></i>
                  Aksi
                </div>
                <div class="action-buttons">
                  <button
                    type="button"
                    class="btn btn-primary-modern"
                    @click="showCreateModal = true"
                  >
                    <i class="fas fa-plus"></i>
                    Tambah Role
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary-modern"
                    @click="resetFilters"
                  >
                    <i class="fas fa-redo"></i>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="table-section">
          <div class="table-responsive">
            <table class="table table-modern">
              <thead>
                <tr>
                  <th width="50">#</th>
                  <th width="200">Nama Role</th>
                  <th width="100">Status</th>
                  <th width="150">Dibuat</th>
                  <th width="120">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredRoles.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>Tidak ada role yang ditemukan</p>
                  </td>
                </tr>
                <tr v-for="(role, index) in paginatedRoles" :key="role.id_role">
                  <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td>
                    <div class="role-name-cell">
                      <strong>{{ role.nama_role }}</strong>
                    </div>
                  </td>
                  <td>
                    <span :class="['status-badge', role.is_active ? 'status-active' : 'status-inactive']">
                      <i :class="['fas', role.is_active ? 'fa-check-circle' : 'fa-times-circle']"></i>
                      {{ role.is_active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(role.created_at) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button @click="editRole(role)" class="btn btn-outline-primary btn-sm" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="m18.5 2.5 5 5L12 19"></path>
                          <path d="M15 7l-3 3"></path>
                        </svg>
                      </button>
                      <button @click="deleteRole(role)" class="btn btn-outline-danger btn-sm" title="Hapus">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredRoles.length > 0" class="pagination-container">
            <!-- Pagination Info -->
            <div class="pagination-info">
              <p class="info-text">
                Menampilkan <strong>{{ paginatedRoles.length }}</strong> dari
                <strong>{{ filteredRoles.length }}</strong> data
                <span v-if="filteredRoles.length !== paginatedRoles.length">
                  (Halaman {{ currentPage }} dari {{ totalPages }})
                </span>
              </p>
            </div>

            <!-- Pagination Controls -->
            <nav v-if="totalPages > 1">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="currentPage = 1">First</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="currentPage--">Prev</a>
                </li>
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="currentPage = totalPages">Last</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal"
      class="role-create-modal-overlay"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="['fas', isEditing ? 'fa-edit' : 'fa-plus']"></i>
              {{ isEditing ? 'Edit Role' : 'Tambah Role Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeCreateModal">
              ×
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRole" class="modern-form">
              <div class="form-grid">
                <!-- Nama Role -->
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="label-icon">👤</span>
                    <span class="label-text">Nama Role</span>
                  </label>
                  <div class="input-wrapper-modern">
                    <input
                      v-model="formData.nama_role"
                      type="text"
                      class="form-input-modern"
                      placeholder="Contoh: Administrator"
                      :class="{ 'is-invalid': errors.nama_role }"
                    />
                    <div class="input-icon">🏷️</div>
                  </div>
                  <div v-if="errors.nama_role" class="error-feedback">
                    {{ errors.nama_role }}
                  </div>
                </div>

                <!-- Deskripsi -->
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="label-icon">📝</span>
                    <span class="label-text">Deskripsi</span>
                  </label>
                  <div class="input-wrapper-modern">
                    <textarea
                      v-model="formData.deskripsi"
                      class="form-input-modern"
                      placeholder="Deskripsi role..."
                      rows="3"
                    ></textarea>
                    <div class="input-icon">📄</div>
                  </div>
                </div>

                <!-- Status Toggle -->
                <div class="form-group-modern">
                  <label class="form-label-modern">
                    <span class="label-icon">⚡</span>
                    <span class="label-text">Status Role</span>
                  </label>
                  <div class="toggle-wrapper-modern">
                    <label class="toggle-switch">
                      <input
                        v-model="formData.is_active"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider">
                        <span class="toggle-thumb"></span>
                      </span>
                      <span class="toggle-label">
                        <span class="toggle-text">{{ formData.is_active ? 'Aktif' : 'Tidak Aktif' }}</span>
                        <span class="toggle-icon">{{ formData.is_active ? '✅' : '❌' }}</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateModal">
              <i class="fas fa-times me-2"></i>Batal
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveRole"
              :disabled="roleStore.loading"
            >
              <span v-if="roleStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              <i class="fas fa-save me-2" v-else></i>
              {{ isEditing ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="delete-modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="delete-modal">
        <div class="delete-modal-header">
          <h5 class="delete-modal-title">⚠️ Konfirmasi Hapus</h5>
          <button type="button" class="delete-modal-close" @click="showDeleteModal = false">
            ×
          </button>
        </div>
        <div class="delete-modal-body">
          <div class="delete-message">
            <i class="fas fa-exclamation-triangle delete-icon"></i>
            <p>Apakah Anda yakin ingin menghapus role <strong>{{ roleToDelete?.nama_role }}</strong>?</p>
          </div>
        </div>
        <div class="delete-modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="confirmDelete"
            :disabled="roleStore.loading"
          >
            <span v-if="roleStore.loading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="fas fa-trash me-2" v-else></i>
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoleStore } from '../stores/menu'
import { showToast } from '../utils/notification'

// Emits
const emit = defineEmits(['close'])

// Store
const roleStore = useRoleStore()

// Reactive data
const roles = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const roleToDelete = ref(null)
const errors = ref({})

const formData = ref({
  id_role: null,
  nama_role: '',
  deskripsi: '',
  is_active: true
})

// Computed properties
const filteredRoles = computed(() => {
  let filtered = roles.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(role =>
      role.nama_role.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by status
  if (filterStatus.value !== '') {
    filtered = filtered.filter(role => role.is_active == filterStatus.value)
  }

  return filtered
})

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRoles.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredRoles.value.length / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const fetchRoles = async () => {
  loading.value = true
  try {
    console.log('🔍 Starting fetchRoles...')
    const result = await roleStore.fetchAllRoles()
    console.log('📊 Result from store:', result)
    if (result.success) {
      roles.value = result.data || []
      console.log('✅ Roles loaded:', roles.value)
    } else {
      console.error('❌ Store returned error:', result.error)
    }
  } catch (error) {
    console.error('❌ Error fetching roles:', error)
    showToast('Gagal mengambil data role', 'error')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

const editRole = (role) => {
  isEditing.value = true
  formData.value = { ...role }
  showCreateModal.value = true
  errors.value = {}
}

const deleteRole = (role) => {
  roleToDelete.value = role
  showDeleteModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  isEditing.value = false
  formData.value = {
    id_role: null,
    nama_role: '',
    deskripsi: '',
    is_active: true
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}

  if (!formData.value.nama_role.trim()) {
    errors.value.nama_role = 'Nama role wajib diisi'
  }

  return Object.keys(errors.value).length === 0
}

const saveRole = async () => {
  if (!validateForm()) return

  try {
    const roleData = { ...formData.value }
    let result

    if (isEditing.value) {
      result = await roleStore.updateRole(roleData.id_role, roleData)
      if (result.success) {
        showToast('Role berhasil diperbarui', 'success')
      }
    } else {
      result = await roleStore.createRole(roleData)
      if (result.success) {
        showToast('Role berhasil ditambahkan', 'success')
      }
    }

    if (result.success) {
      await fetchRoles()
      closeCreateModal()
    }
  } catch (error) {
    console.error('Error saving role:', error)
    showToast(error.response?.data?.message || 'Gagal menyimpan role', 'error')
  }
}

const confirmDelete = async () => {
  if (!roleToDelete.value) return

  try {
    const result = await roleStore.deleteRole(roleToDelete.value.id_role)
    if (result.success) {
      showToast('Role berhasil dihapus', 'success')
      await fetchRoles()
      showDeleteModal.value = false
      roleToDelete.value = null
    }
  } catch (error) {
    console.error('Error deleting role:', error)
    showToast(error.response?.data?.message || 'Gagal menghapus role', 'error')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  fetchRoles()
})

// Watch for changes
watch(currentPage, () => {
  // Reset to top when page changes
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* Role Management Modal Styles - Consistent with Menu Management */
.role-management-modal-overlay {
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
  backdrop-filter: blur(5px);
}

.role-management-modal {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.role-management-modal .modal-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-management-modal .modal-header h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-management-modal .modal-header .btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.role-management-modal .modal-header .btn-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.role-management-modal .modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Filter Section - Modern Design */
.filter-section-modern {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.filter-header {
  margin-bottom: 1.25rem;
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-content {
  margin: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 1rem;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 2;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  cursor: pointer;
  z-index: 2;
  font-size: 0.75rem;
  transition: color 0.2s ease;
}

.search-clear:hover {
  color: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-primary-modern {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary-modern:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-secondary-modern {
  background: #6b7280;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary-modern:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.table-modern {
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table-modern th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #374151;
  font-weight: 600;
  padding: 1rem 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

.table-modern td {
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-modern tbody tr:hover {
  background: rgba(59, 130, 246, 0.02);
}

.role-name-cell strong {
  color: #1f2937;
  font-size: 0.9rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-active {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #d1fae5;
}

.status-inactive {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.btn-group {
  display: flex;
  gap: 0.25rem;
}

.btn-outline-primary {
  color: #3b82f6;
  border-color: #3b82f6;
  background: white;
}

.btn-outline-primary:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.btn-outline-danger {
  color: #ef4444;
  border-color: #ef4444;
  background: white;
}

.btn-outline-danger:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 6px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

/* Pagination */
.pagination-container {
  margin-top: 1.5rem;
  padding: 0 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.pagination .page-item {
  list-style: none;
  margin: 0;
}

.pagination .page-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.pagination .page-link:hover:not(.active):not(.disabled) {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination .page-item.active .page-link {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
}

.pagination .page-item.disabled .page-link {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.pagination-info {
  text-align: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.pagination-info .info-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.pagination-info .info-text strong {
  color: #374151;
  font-weight: 600;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group-modern {
  display: flex;
  flex-direction: column;
}

.form-label-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.label-icon {
  font-size: 1rem;
}

.input-wrapper-modern {
  position: relative;
}

.form-input-modern {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input-modern.is-invalid {
  border-color: #ef4444;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
  pointer-events: none;
}

.error-feedback {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.form-select-modern {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
}

.form-select-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Toggle Switch */
.toggle-wrapper-modern {
  display: flex;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  width: 56px;
  height: 28px;
  background: #d1d5db;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.toggle-input:checked + .toggle-slider .toggle-thumb {
  transform: translateX(28px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-input:checked + .toggle-slider + .toggle-label {
  border-color: #10b981;
  background: #ecfdf5;
}

.toggle-text {
  font-size: 0.875rem;
  color: #374151;
}

.toggle-input:checked + .toggle-slider + .toggle-label .toggle-text {
  color: #065f46;
}

.toggle-icon {
  font-size: 1rem;
  transition: all 0.3s ease;
}

/* Delete Modal */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.delete-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.delete-modal-header {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.delete-modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-modal-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.delete-modal-body {
  padding: 2rem;
}

.delete-message {
  text-align: center;
}

.delete-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.delete-message p {
  margin: 0;
  font-size: 1.1rem;
  color: #374151;
}

.delete-modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-radius: 0 0 16px 16px;
}

.delete-modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
}

.delete-modal-footer .btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.delete-modal-footer .btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.delete-modal-footer .btn-secondary {
  background: #6b7280;
  color: white;
}

.delete-modal-footer .btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-1px);
}

.delete-modal-footer .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .role-management-modal {
    width: 98%;
    max-height: 95vh;
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .role-management-modal .modal-body {
    padding: 1rem;
  }

  .filter-section-modern {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .role-management-modal {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .table-modern {
    font-size: 0.8rem;
  }

  .table-modern th,
  .table-modern td {
    padding: 0.5rem;
  }

  .status-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }

  .btn-group {
    flex-direction: column;
  }
}

/* Role Create Modal Overlay */
.role-create-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 999999 !important;
  backdrop-filter: blur(5px) !important;
}

/* Fix modal content transparency */
.role-create-modal-overlay .modal-dialog {
  background: white !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.role-create-modal-overlay .modal-content {
  background: white !important;
  border: none !important;
  border-radius: 12px !important;
}

.role-create-modal-overlay .modal-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  color: white !important;
  padding: 1.5rem !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-radius: 12px 12px 0 0 !important;
}

.role-create-modal-overlay .modal-title {
  color: white !important;
  font-weight: 600 !important;
  margin: 0 !important;
  font-size: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.role-create-modal-overlay .btn-close {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-size: 1.8rem !important;
  font-weight: bold !important;
  opacity: 1 !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  line-height: 1 !important;
  padding: 0 !important;
  margin: 0 !important;
}

.role-create-modal-overlay .btn-close:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  transform: scale(1.05) !important;
}

.role-create-modal-overlay .modal-body {
  background: white !important;
  padding: 1.5rem !important;
}

.role-create-modal-overlay .modern-form {
  background: white !important;
}

.role-create-modal-overlay .form-group {
  background: white !important;
}

.role-create-modal-overlay .form-control {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
}

/* Modal fade styles for create/edit modal */
.modal.fade.show {
  display: block !important;
}

.modal-dialog {
  margin: 1.75rem auto;
  max-width: 800px;
}

.modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
  border: none;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-header .btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.modal-header .btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-radius: 0 0 16px 16px;
}

.modal-footer .btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
}

.modal-footer .btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.modal-footer .btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.modal-footer .btn-secondary {
  background: #6b7280;
  color: white;
}

.modal-footer .btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-1px);
}

.modal-footer .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Spinner animation */
.spinner-border {
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>