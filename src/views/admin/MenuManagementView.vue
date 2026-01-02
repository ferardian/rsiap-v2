<template>
  <div class="menu-management">
    <div class="page-header">
      <div>
        <h1 class="page-title">📋 Kelola Menu</h1>
        <p class="page-subtitle">Manajemen menu dan hak akses sistem</p>
      </div>
    </div>

    <!-- Filter dan Search -->
    <div class="card mb-3 flex-shrink-0 filter-card">
      <div class="card-body">
        <div class="row g-4 align-items-end">
          <div class="col-12 col-lg-4">
            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-search"></i> Cari Menu
              </label>
              <div class="input-group modern-input">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Masukkan nama menu..."
                  @input="debounceSearch"
                />
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-2">
            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-toggle-on"></i> Status
              </label>
              <div class="select-wrapper">
                <select v-model="filterActive" class="form-select modern-select" @change="fetchMenus">
                  <option value="">Semua</option>
                  <option :value="true">Aktif</option>
                  <option :value="false">Non-aktif</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-layer-group"></i> Level
              </label>
              <div class="select-wrapper">
                <select v-model="filterParent" class="form-select modern-select" @change="fetchMenus">
                  <option value="">Semua</option>
                  <option value="">Utama</option>
                  <option v-for="parent in parentMenus" :key="parent.id_menu" :value="parent.id_menu">
                    {{ parent.nama_menu }}
                  </option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="filter-actions">
              <button class="btn-reset" @click="resetFilters">
                <i class="fas fa-sync-alt"></i> Reset
              </button>
              <button class="btn btn-primary" @click="showCreateModal = true">
                <i class="fas fa-plus"></i> Tambah Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Table -->
    <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
      <div class="card-body d-flex flex-column" style="overflow: hidden;">
        <div v-if="menuStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data menu...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-else-if="menuStore.flatMenuList.length === 0" class="text-center py-5">
          <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Belum ada data menu</h5>
          <p class="text-muted">Klik tombol "Tambah Menu" untuk membuat menu baru</p>
        </div>

        <div v-else class="table-responsive flex-grow-1" style="overflow-y: auto;">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th @click="sortBy('urutan')" style="cursor: pointer;">
                  Urutan <i class="fas fa-sort"></i>
                </th>
                <th @click="sortBy('nama_menu')" style="cursor: pointer;">
                  Nama Menu <i class="fas fa-sort"></i>
                </th>
                <th>Icon</th>
                <th>Route</th>
                <th>Parent</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in paginatedMenus" :key="menu.id_menu">
                <td>{{ menu.urutan }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <span class="menu-name">{{ menu.nama_menu }}</span>
                    <span v-if="menu.children && menu.children.length > 0" class="badge bg-info ms-2">
                      {{ menu.children.length }} sub
                    </span>
                  </div>
                </td>
                <td><span class="menu-icon">{{ menu.icon }}</span></td>
                <td><code class="text-muted">{{ menu.route || '-' }}</code></td>
                <td>{{ menu.parent?.nama_menu || '-' }}</td>
                <td>
                  <span :class="['badge', menu.is_active ? 'bg-success' : 'bg-danger']">
                    {{ menu.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="editMenu(menu)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-outline-info"
                      @click="viewMenuPermissions(menu)"
                      title="Permissions"
                    >
                      <i class="fas fa-key"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="confirmDelete(menu)"
                      title="Hapus"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3 flex-shrink-0">
          <div class="text-muted">
            Menampilkan {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredMenus.length) }}
            dari {{ filteredMenus.length }} menu
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage = 1">First</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
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

    <!-- Create/Edit Sidebar -->
    <div
      class="sidebar-form"
      :class="{ active: showCreateModal }"
    >
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h5 class="sidebar-title">
            {{ isEditing ? '✏️ Edit Menu' : '➕ Tambah Menu Baru' }}
          </h5>
          <button type="button" class="btn-sidebar-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sidebar-body">
          <form @submit.prevent="saveMenu">
            <div class="form-group">
              <label class="form-label">Nama Menu *</label>
              <div class="input-wrapper">
                <input
                  v-model="formData.nama_menu"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.nama_menu }"
                  placeholder="Masukkan nama menu"
                  required
                />
                <i class="fas fa-tag input-icon"></i>
              </div>
              <div v-if="errors.nama_menu" class="error-message">
                {{ errors.nama_menu }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Urutan *</label>
              <div class="input-wrapper">
                <input
                  v-model.number="formData.urutan"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.urutan }"
                  min="1"
                  required
                />
                <i class="fas fa-sort-numeric-up input-icon"></i>
              </div>
              <div v-if="errors.urutan" class="error-message">
                {{ errors.urutan }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Icon</label>
              <div class="input-wrapper">
                <input
                  v-model="formData.icon"
                  type="text"
                  class="form-control"
                  placeholder="📁 atau fas fa-home"
                />
                <i class="fas fa-icons input-icon"></i>
              </div>
              <div class="form-help">Gunakan emoji atau Font Awesome class</div>
            </div>

            <div class="form-group">
              <label class="form-label">Route</label>
              <div class="input-wrapper">
                <input
                  v-model="formData.route"
                  type="text"
                  class="form-control"
                  placeholder="/dashboard"
                />
                <i class="fas fa-route input-icon"></i>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Menu Parent</label>
              <div class="select-wrapper">
                <select v-model="formData.parent_id" class="form-select">
                  <option value="">Menu Utama</option>
                  <option
                    v-for="parent in availableParents"
                    :key="parent.id_menu"
                    :value="parent.id_menu"
                    :disabled="isEditing && parent.id_menu === formData.id_menu"
                  >
                    {{ parent.nama_menu }}
                  </option>
                </select>
                <i class="fas fa-sitemap select-icon"></i>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Status</label>
              <div class="toggle-group">
                <div class="toggle-switch" :class="{ active: formData.is_active }" @click="toggleStatus">
                  <div class="toggle-slider"></div>
                </div>
                <span class="toggle-label">{{ formData.is_active ? 'Aktif' : 'Tidak Aktif' }}</span>
              </div>
            </div>
          </form>
        </div>

        <div class="sidebar-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="saveMenu"
            :disabled="menuStore.loading"
          >
            <i class="fas fa-save me-2" v-if="!menuStore.loading"></i>
            <span v-if="menuStore.loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isEditing ? 'Update' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      :class="{ show: showDeleteModal }"
      :style="{ display: showDeleteModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">⚠️ Konfirmasi Hapus</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin menghapus menu <strong>{{ menuToDelete?.nama_menu }}</strong>?</p>
            <div v-if="menuToDelete?.children && menuToDelete.children.length > 0" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Menu ini memiliki {{ menuToDelete.children.length }} sub-menu. Sub-menu juga akan dihapus!
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Batal</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteMenu"
              :disabled="menuStore.loading"
            >
              <span v-if="menuStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMenuStore } from '../../stores/menu'
import { showToast } from '../../utils/notification'

const menuStore = useMenuStore()

// State
const searchQuery = ref('')
const filterActive = ref('')
const filterParent = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('urutan')
const sortDirection = ref('asc')

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const error = ref(null)

const formData = ref({
  id_menu: null,
  nama_menu: '',
  icon: '',
  route: '',
  parent_id: null,
  urutan: 1,
  is_active: true
})

const errors = ref({})
const menuToDelete = ref(null)

// Computed
const filteredMenus = computed(() => {
  let menus = [...menuStore.flatMenuList]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    menus = menus.filter(menu =>
      menu.nama_menu.toLowerCase().includes(query) ||
      menu.route?.toLowerCase().includes(query)
    )
  }

  // Filter by active status
  if (filterActive.value !== '') {
    menus = menus.filter(menu => menu.is_active === filterActive.value)
  }

  // Filter by parent
  if (filterParent.value !== '') {
    menus = menus.filter(menu => menu.parent_id === filterParent.value)
  } else if (filterParent.value === '') {
    // Filter main menus only
    menus = menus.filter(menu => menu.parent_id === null)
  }

  // Sort
  menus.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return menus
})

const totalPages = computed(() => Math.ceil(filteredMenus.value.length / itemsPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)

const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedMenus = computed(() => {
  return filteredMenus.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const parentMenus = computed(() => {
  return menuStore.flatMenuList.filter(menu => menu.parent_id === null)
})

const availableParents = computed(() => {
  if (isEditing.value) {
    return menuStore.flatMenuList.filter(menu => menu.id_menu !== formData.value.id_menu)
  }
  return parentMenus.value
})

// Methods
const fetchMenus = async () => {
  try {
    error.value = null
    await menuStore.fetchAllMenus()
  } catch (err) {
    error.value = 'Gagal memuat data menu'
    console.error('Error fetching menus:', err)
  }
}

const debounceSearch = () => {
  clearTimeout(debounceSearch.timer)
  debounceSearch.timer = setTimeout(() => {
    currentPage.value = 1
  }, 300)
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterActive.value = ''
  filterParent.value = ''
  currentPage.value = 1
}

const editMenu = (menu) => {
  isEditing.value = true
  formData.value = { ...menu }
  showCreateModal.value = true
  errors.value = {}
}

const closeModal = () => {
  showCreateModal.value = false
  isEditing.value = false
  formData.value = {
    id_menu: null,
    nama_menu: '',
    icon: '',
    route: '',
    parent_id: null,
    urutan: 1,
    is_active: true
  }
  errors.value = {}
}

const validateForm = () => {
  errors.value = {}

  if (!formData.value.nama_menu.trim()) {
    errors.value.nama_menu = 'Nama menu wajib diisi'
  }

  if (!formData.value.urutan || formData.value.urutan < 1) {
    errors.value.urutan = 'Urutan harus diisi dengan angka minimal 1'
  }

  return Object.keys(errors.value).length === 0
}

const saveMenu = async () => {
  if (!validateForm()) return

  try {
    const menuData = { ...formData.value }
    delete menuData.id_menu
    delete menuData.children
    delete menuData.parent

    let result
    if (isEditing.value) {
      result = await menuStore.updateMenu(formData.value.id_menu, menuData)
    } else {
      result = await menuStore.createMenu(menuData)
    }

    if (result.success) {
      showToast(
        isEditing.value ? 'Menu berhasil diperbarui' : 'Menu berhasil ditambahkan',
        'success'
      )
      closeModal()
      await fetchMenus()
    } else {
      showToast(result.error || 'Gagal menyimpan menu', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menyimpan menu', 'error')
    console.error('Error saving menu:', err)
  }
}

const confirmDelete = (menu) => {
  menuToDelete.value = menu
  showDeleteModal.value = true
}

const deleteMenu = async () => {
  if (!menuToDelete.value) return

  try {
    const result = await menuStore.deleteMenu(menuToDelete.value.id_menu)

    if (result.success) {
      showToast('Menu berhasil dihapus', 'success')
      showDeleteModal.value = false
      menuToDelete.value = null
      await fetchMenus()
    } else {
      showToast(result.error || 'Gagal menghapus menu', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menghapus menu', 'error')
    console.error('Error deleting menu:', err)
  }
}

const toggleStatus = () => {
  formData.value.is_active = !formData.value.is_active
}

const viewMenuPermissions = (menu) => {
  // TODO: Implement permissions view
  showToast('Fitur permissions akan segera hadir', 'info')
}

// Watch for filter changes to reset pagination
watch([filterActive, filterParent], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  fetchMenus()
})
</script>

<style scoped>
.menu-management {
  /* Removed fixed positioning to fit in MainLayout */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.page-header {
  margin-bottom: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #64748b;
  margin-bottom: 0;
  font-size: 0.95rem;
}

.card {
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  border: none;
  padding: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label::before {
  content: '';
  width: 2px;
  height: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.form-control {
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-weight: 400;
  color: #1e293b;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.15);
  outline: none;
  background: white;
  transform: translateY(-1px);
}

.form-control:hover {
  border-color: #cbd5e1;
  background: white;
}

.form-control::placeholder {
  color: #94a3b8;
  font-style: normal;
  font-weight: 400;
}

.form-control.is-invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-control.is-invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.invalid-feedback {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 0.625rem 1.25rem;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-outline-primary {
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-outline-primary:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-outline-info {
  background: transparent;
  color: #06b6d4;
  border: 2px solid #06b6d4;
}

.btn-outline-info:hover {
  background: #06b6d4;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.btn-outline-danger {
  background: transparent;
  color: #ef4444;
  border: 2px solid #ef4444;
}

.btn-outline-danger:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-group-sm > .btn {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 6px;
}

.menu-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.menu-icon {
  font-size: 1.2rem;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block !important;
}

.modal-dialog {
  margin: 1rem auto;
  animation: modalSlideIn 0.3s ease-out;
  max-width: 600px;
}

.modal-content {
  border: none;
  border-radius: 1.25rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 2rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1.25rem 1.25rem 0 0;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.modal-header .btn-close {
  filter: brightness(0) invert(1);
  opacity: 0.9;
  transition: all 0.3s ease;
  z-index: 10;
  position: relative;
  font-size: 1.2rem;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.modal-header .btn-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-title {
  font-weight: 700;
  font-size: 1.25rem;
  position: relative;
  z-index: 10;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 2rem 1.5rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  border-radius: 0 0 1.25rem 1.25rem;
  flex-shrink: 0;
}

.table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #374151;
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-color: #e5e7eb;
}

.table-hover tbody tr:hover {
  background-color: #f1f5f9;
}

.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
}

.bg-success {
  background: #10b981 !important;
}

.bg-danger {
  background: #ef4444 !important;
}

.bg-info {
  background: #06b6d4 !important;
}

.text-muted {
  color: #6b7280 !important;
}

.pagination .page-link {
  border: none;
  color: #374151;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin: 0 0.125rem;
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.pagination .page-item.active .page-link {
  background: #3b82f6;
  color: white;
  border-radius: 6px;
}

.pagination .page-item.disabled .page-link {
  color: #d1d5db;
  background: transparent;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Additional enhancements */
.input-group-text {
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  border-radius: 8px 0 0 8px;
}

.input-group .form-control {
  border-radius: 0 8px 8px 0;
}

.input-group .form-control:focus {
  z-index: 1;
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23667eea' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-weight: 400;
  color: #1e293b;
  cursor: pointer;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.15);
  outline: none;
  background: white;
  transform: translateY(-1px);
}

.form-select:hover {
  border-color: #cbd5e1;
  background: white;
}

.form-check {
  padding-left: 0;
  margin-bottom: 0;
}

.form-check-input {
  width: 2rem;
  height: 1rem;
  background-color: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-check-input:checked {
  background-color: #667eea;
  border-color: #667eea;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-check-input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 0.15rem rgba(102, 126, 234, 0.2);
}

.form-check-input::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0.125rem;
  transform: translateY(-50%);
  width: 0.75rem;
  height: 0.75rem;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.form-check-input:checked::after {
  left: 1.125rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.form-check-label {
  margin-left: 1rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in {
  animation: slideIn 0.3s ease-out;
}

/* Custom Filter Styles */
.filter-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.filter-group {
  margin-bottom: 0;
  height: 100%;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  height: 100%;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.filter-label i {
  font-size: 0.75rem;
  opacity: 0.9;
}

.modern-input {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 42px;
  background: white;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
}

.modern-input:hover {
  border-color: #94a3b8;
}

.modern-input:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modern-input .input-group-text {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  padding: 0 1rem;
  transition: all 0.3s ease;
}

.modern-input:focus-within .input-group-text {
  color: #3b82f6;
}

.modern-input .form-control {
  border: none;
  background: transparent;
  color: #1e293b;
  font-weight: 400;
  transition: all 0.3s ease;
  height: 100%;
  font-size: 0.9rem;
  padding: 0.5rem 1rem 0.5rem 0;
  box-shadow: none;
  outline: none;
}

.modern-input .form-control::placeholder {
  color: #94a3b8;
  font-style: normal;
  font-weight: 400;
}

.modern-input .form-control:focus {
  background: transparent;
  color: #1e293b;
  box-shadow: none;
  outline: none;
}

.modern-input .form-control:hover {
  background: transparent;
}

.select-wrapper {
  position: relative;
}

.modern-select {
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: white;
  color: #1e293b;
  font-weight: 400;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  transition: all 0.3s ease;
  appearance: none;
  cursor: pointer;
  height: 42px;
  font-size: 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-select:hover {
  border-color: #94a3b8;
}

.modern-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modern-select option {
  background: white;
  color: #1e293b;
  font-weight: 400;
  padding: 0.5rem;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.7rem;
  pointer-events: none;
  transition: all 0.3s ease;
}

.modern-select:focus + .select-arrow {
  color: rgba(255, 255, 255, 0.7);
  transform: translateY(-50%) rotate(180deg);
}

.btn-reset {
  flex: 1;
  padding: 0.5rem 1.25rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  color: #64748b;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  height: 42px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-reset:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #475569;
}

.btn-reset:active {
  transform: translateY(0);
}

/* Custom styles for full page layout */
.card-body {
  padding: 1.5rem;
}

.card-body .row {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .menu-management {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1rem;
  }

  .modal-content {
    margin: 1rem;
  }

  .table-responsive {
    font-size: 0.8rem;
  }

  .btn-group-sm > .btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }

  /* Filter section for mobile */
  .filter-card .card-body {
    padding: 1rem;
  }

  .row.g-4 {
    gap: 1rem;
  }

  .filter-label {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
    letter-spacing: 0.2px;
  }

  .modern-input,
  .modern-select,
  .btn-reset {
    height: 42px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .modern-select {
    padding-right: 2rem;
  }

  .select-arrow {
    right: 0.75rem;
    font-size: 0.6rem;
  }

  .modern-input .input-group-text {
    width: 40px;
  }
}

@media (max-width: 576px) {
  .menu-management {
    padding: 0.5rem;
    border-radius: 0;
  }

  .page-header {
    padding: 1rem;
    border-radius: 0.75rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch !important;
  }

  .btn-primary {
    width: 100%;
  }

  .card-body {
    padding: 0.75rem;
  }

  .table th, .table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }

  .row.g-3 .col-md-4, .row.g-3 .col-md-3, .row.g-3 .col-md-2 {
    margin-bottom: 0.75rem;
  }
}
</style>