<template>
  <div class="menu-management-modal-overlay">
    <div class="menu-management-modal">
      <div class="modal-header">
        <h4>📋 Kelola Menu</h4>
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
              <!-- Search Field -->
              <div class="filter-item">
                <div class="filter-label">
                  <i class="fas fa-search"></i>
                  <span>Cari Menu</span>
                </div>
                <div class="search-input-wrapper">
                  <div class="search-icon">
                    <i class="fas fa-search"></i>
                  </div>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    placeholder="Ketik nama menu atau route..."
                    @input="debounceSearch"
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
                  <span>Status</span>
                </div>
                <div class="status-filter">
                  <button
                    v-for="option in statusOptions"
                    :key="option.value"
                    :class="['status-btn', { active: filterActive === option.value }]"
                    @click="filterActive = option.value; currentPage = 1"
                  >
                    <i :class="option.icon"></i>
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- Parent Filter -->
              <div class="filter-item">
                <div class="filter-label">
                  <i class="fas fa-sitemap"></i>
                  <span>Menu Parent</span>
                </div>
                <div class="parent-select-wrapper">
                  <select v-model="filterParent" class="parent-select" @change="currentPage = 1">
                    <option value="">📁 Semua Menu</option>
                    <option :value="null">⭐ Main Menu</option>
                    <option v-for="parent in parentMenus" :key="parent.id_menu" :value="parent.id_menu">
                      📂 {{ parent.nama_menu }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="filter-item">
                <div class="filter-label">
                  <i class="fas fa-cog"></i>
                  <span>Aksi</span>
                </div>
                <div class="action-buttons">
                  <button @click="resetFilters" class="btn-reset-modern">
                    <i class="fas fa-redo"></i>
                    <span>Reset</span>
                  </button>
                  <button @click="showCreateModal = true" class="btn-add-modern">
                    <i class="fas fa-plus"></i>
                    <span>Tambah Menu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-section">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th @click="sortBy('urutan')" style="cursor: pointer;">
                    Urutan {{ sortField === 'urutan' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                  </th>
                  <th @click="sortBy('nama_menu')" style="cursor: pointer;">
                    Nama Menu {{ sortField === 'nama_menu' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                  </th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="paginatedMenus.length === 0">
                  <td colspan="5" class="text-center py-4">
                    <i class="fas fa-inbox fa-2x text-muted"></i>
                    <p class="text-muted mt-2">Tidak ada data menu</p>
                  </td>
                </tr>
                <tr v-for="menu in paginatedMenus" :key="menu.id_menu">
                  <td>{{ menu.urutan }}</td>
                  <td>
                    <div class="menu-name-cell">
                      <span class="menu-icon">{{ menu.icon || '📁' }}</span>
                      <span class="menu-name">{{ menu.nama_menu }}</span>
                      <small v-if="menu.parent" class="text-muted d-block">- {{ menu.parent.nama_menu }}</small>
                    </div>
                  </td>
                  <td>
                    <code class="text-primary">{{ menu.route || '-' }}</code>
                  </td>
                  <td>
                    <span :class="['badge', menu.is_active ? 'bg-success' : 'bg-danger']">
                      {{ menu.is_active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button @click="editMenu(menu)" class="btn btn-outline-primary btn-sm" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="m18.5 2.5 5 5L12 19"></path>
                          <path d="M15 7l-3 3"></path>
                        </svg>
                      </button>
                      <button @click="confirmDelete(menu)" class="btn btn-outline-danger btn-sm" title="Hapus">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredMenus.length > 0" class="pagination-container">
            <!-- Pagination Info -->
            <div class="pagination-info">
              <p class="info-text">
                Menampilkan <strong>{{ paginatedMenus.length }}</strong> dari
                <strong>{{ filteredMenus.length }}</strong> data
                <span v-if="filteredMenus.length !== paginatedMenus.length">
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

      <!-- Create/Edit Modal -->
      <div
        v-if="showCreateModal"
        class="modal fade show"
        style="display: block;"
        tabindex="-1"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? '✏️ Edit Menu' : '➕ Tambah Menu Baru' }}
              </h5>
              <button type="button" class="btn-close" @click="closeCreateModal">×</button>
            </div>
            <div class="modal-body-modern">
              <form @submit.prevent="saveMenu" class="menu-form">
                <!-- Form Grid -->
                <div class="form-grid">
                  <!-- Nama Menu -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      <span class="label-icon">🏷️</span>
                      <span class="label-text">Nama Menu</span>
                      <span class="required-mark">*</span>
                    </label>
                    <div class="input-wrapper-modern">
                      <input
                        v-model="formData.nama_menu"
                        type="text"
                        class="form-input-modern"
                        :class="{ 'error': errors.nama_menu }"
                        placeholder="Contoh: Dashboard, Pasien, dll."
                        required
                      />
                      <div class="input-icon">📝</div>
                    </div>
                    <div v-if="errors.nama_menu" class="error-message-modern">
                      <span class="error-icon">⚠️</span>
                      {{ errors.nama_menu }}
                    </div>
                  </div>

                  <!-- Urutan -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      <span class="label-icon">🔢</span>
                      <span class="label-text">Urutan</span>
                      <span class="required-mark">*</span>
                    </label>
                    <div class="input-wrapper-modern">
                      <input
                        v-model.number="formData.urutan"
                        type="number"
                        class="form-input-modern"
                        :class="{ 'error': errors.urutan }"
                        placeholder="1"
                        min="1"
                        required
                      />
                      <div class="input-icon">📊</div>
                    </div>
                    <div v-if="errors.urutan" class="error-message-modern">
                      <span class="error-icon">⚠️</span>
                      {{ errors.urutan }}
                    </div>
                  </div>

                  <!-- Icon -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      <span class="label-icon">🎨</span>
                      <span class="label-text">Icon</span>
                    </label>
                    <div class="input-wrapper-modern">
                      <input
                        v-model="formData.icon"
                        type="text"
                        class="form-input-modern"
                        placeholder="📁 atau fas fa-home"
                      />
                      <div class="input-icon">🎯</div>
                    </div>
                    <div class="help-text-modern">
                      <span class="help-icon">💡</span>
                      Gunakan emoji (📁, 👤, 🏥) atau Font Awesome class
                    </div>
                  </div>

                  <!-- Route -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      <span class="label-icon">🛤️</span>
                      <span class="label-text">Route</span>
                    </label>
                    <div class="input-wrapper-modern">
                      <input
                        v-model="formData.route"
                        type="text"
                        class="form-input-modern"
                        placeholder="/dashboard"
                      />
                      <div class="input-icon">🔗</div>
                    </div>
                  </div>

                  <!-- Menu Parent -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      <span class="label-icon">🌳</span>
                      <span class="label-text">Menu Parent</span>
                    </label>
                    <div class="select-wrapper-modern">
                      <select
                        v-model="formData.parent_id"
                        class="form-select-modern"
                      >
                        <option :value="null">⭐ Main Menu</option>
                        <option
                          v-for="parent in availableParents"
                          :key="parent.id_menu"
                          :value="parent.id_menu"
                        >
                          📂 {{ parent.nama_menu }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Status -->
                  <div class="form-group-modern">
                    <label class="form-label-modern">
                      <span class="label-icon">⚡</span>
                      <span class="label-text">Status</span>
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
            <div class="modal-footer-modern">
              <button type="button" class="btn-cancel-modern" @click="closeCreateModal">
                <span class="btn-icon">❌</span>
                <span class="btn-text">Batal</span>
              </button>
              <button
                type="button"
                class="btn-save-modern"
                @click="saveMenu"
                :disabled="menuStore.loading"
              >
                <span class="btn-content">
                  <span v-if="!menuStore.loading" class="btn-icon">💾</span>
                  <span v-else class="btn-spinner">
                    <div class="spinner-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </span>
                  <span class="btn-text">{{ isEditing ? 'Update' : 'Simpan' }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Delete Confirmation Modal - Separate from main modal structure -->
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
            <p>Apakah Anda yakin ingin menghapus menu <strong>{{ menuToDelete?.nama_menu }}</strong>?</p>
          </div>
          <div v-if="menuToDelete?.children && menuToDelete.children.length > 0" class="delete-warning">
            <i class="fas fa-info-circle"></i>
            Menu ini memiliki {{ menuToDelete.children.length }} sub-menu. Sub-menu juga akan dihapus!
          </div>
        </div>
        <div class="delete-modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="deleteMenu"
            :disabled="menuStore.loading"
          >
            <span v-if="menuStore.loading" class="spinner-border spinner-border-sm me-2"></span>
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
import { useMenuStore } from '../stores/menu'
import { showToast } from '../utils/notification'

const menuStore = useMenuStore()

// Emits
defineEmits(['close'])

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

// Status options for filter
const statusOptions = ref([
  { value: '', label: 'Semua', icon: 'fas fa-list' },
  { value: true, label: 'Aktif', icon: 'fas fa-check-circle' },
  { value: false, label: 'Non-aktif', icon: 'fas fa-times-circle' }
])

// Computed
const filteredMenus = computed(() => {
  let menus = [...menuStore.flatMenuList]
  console.log('Computing filteredMenus. Original menus length:', menus.length)
  console.log('Original menus:', menus)

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
  if (filterParent.value !== '' && filterParent.value !== null) {
    menus = menus.filter(menu => menu.parent_id === filterParent.value)
  } else if (filterParent.value === null) {
    // Filter main menus only
    menus = menus.filter(menu => menu.parent_id === null)
  }
  // Default: show all menus (when filterParent.value === '')

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

  console.log('Final filtered menus length:', menus.length)
  console.log('Final filtered menus:', menus)
  console.log('Filter values:', {
    searchQuery: searchQuery.value,
    filterActive: filterActive.value,
    filterParent: filterParent.value
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
    console.log('Fetching menus...')
    const result = await menuStore.fetchAllMenus()
    console.log('Fetch result:', result)
    console.log('Menu store data:', menuStore.menus)
    console.log('Menu store flatMenuList:', menuStore.flatMenuList)
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

const closeCreateModal = () => {
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
      closeCreateModal()
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
/* Main Modal Container */
.menu-management-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.menu-management-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1400px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

/* Modal Header */
.menu-management-modal .modal-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  padding: 1.25rem 2rem;
  border-radius: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  border: none;
}

.menu-management-modal .modal-header h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-management-modal .modal-header .btn-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.menu-management-modal .modal-header .btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body {
  padding: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Filter Section - Modern Design */
.filter-section-modern {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  border-radius: 0;
}

.filter-header {
  padding: 1rem 1.5rem 0.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.filter-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-title i {
  color: #3b82f6;
  font-size: 1rem;
}

.filter-content {
  padding: 1.5rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.filter-label i {
  color: #3b82f6;
  font-size: 0.875rem;
}

.filter-label span {
  color: #1f2937;
}

/* Search Input */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-input-wrapper:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-input-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  padding: 0.75rem 0 0.75rem 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.75rem 1rem 0.75rem 0;
  font-size: 0.875rem;
  color: #1f2937;
  background: transparent;
}

.search-input::placeholder {
  color: #9ca3af;
  font-style: italic;
}

.search-clear {
  padding: 0.5rem;
  margin-right: 0.5rem;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Status Filter */
.status-filter {
  display: flex;
  gap: 0.5rem;
}

.status-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.status-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-1px);
}

.status-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.status-btn i {
  font-size: 0.875rem;
}

/* Parent Select */
.parent-select-wrapper {
  position: relative;
}

.parent-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em 1.25em;
  padding-right: 2.5rem;
}

.parent-select:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.parent-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.parent-select option {
  padding: 0.5rem;
  font-weight: 400;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-reset-modern,
.btn-add-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  justify-content: center;
}

.btn-reset-modern {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-reset-modern:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-add-modern {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
}

.btn-add-modern:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

/* Responsive Filter Grid */
@media (max-width: 1024px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .filter-content {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-reset-modern,
  .btn-add-modern {
    width: 100%;
  }

  .status-filter {
    flex-wrap: wrap;
  }

  .status-btn {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }
}

/* Table Section */
.table-section {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  background: white;
  width: 100%;
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.table {
  margin: 0;
  background: white;
  width: 100%;
  table-layout: fixed;
}

.table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #374151;
  font-weight: 600;
  border: none;
  padding: 1rem 0.75rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Column width settings */
.table th:nth-child(1) { width: 80px; text-align: center; } /* Urutan */
.table th:nth-child(2) { width: auto; min-width: 200px; } /* Nama Menu */
.table th:nth-child(3) { width: auto; min-width: 150px; } /* Route */
.table th:nth-child(4) { width: 100px; text-align: center; } /* Status */
.table th:nth-child(5) { width: 120px; text-align: center; } /* Actions */

.table td:nth-child(1) { text-align: center; }
.table td:nth-child(4) { text-align: center; }
.table td:nth-child(5) { text-align: center; }

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-color: #e5e7eb;
}

.table-hover tbody tr:hover {
  background-color: #f8fafc;
}

.menu-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.menu-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

/* Action Buttons Styling */
.btn-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.btn-group .btn {
  min-width: 36px;
  height: 36px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 2px solid;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-group .btn-outline-primary {
  background: white;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-group .btn-outline-primary:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-group .btn-outline-danger {
  background: white;
  border-color: #ef4444;
  color: #ef4444;
}

.btn-group .btn-outline-danger:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.btn-group .btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Inner Modal Styles (for Create/Edit/Delete) */
.modal.fade.show {
  display: block !important;
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10001;
  backdrop-filter: blur(4px);
}

.modal.fade.show .modal-dialog {
  animation: modalSlideIn 0.3s ease-out;
  margin: 1.75rem auto;
  max-width: 600px;
  position: relative;
  z-index: 10002;
}

.modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  position: relative;
  z-index: 10002;
  background: white;
}

.modal.fade.show .modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal.fade.show .modal-title {
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0;
}

.modal.fade.show .modal-body {
  padding: 2rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  border-radius: 0 0 16px 16px;
}

.modal.fade.show .modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 0 0 16px 16px;
}

/* Modern Footer Styles */
.modal-footer-modern {
  padding: 2rem;
  border-top: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-radius: 0 0 16px 16px;
}

/* Modern Buttons */
.btn-cancel-modern,
.btn-save-modern {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  position: relative;
  overflow: hidden;
  text-transform: none;
}

.btn-cancel-modern {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #6b7280;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-cancel-modern:hover:not(:disabled) {
  background: linear-gradient(135deg, #f1f5f9 0%, #e5e7eb 100%);
  color: #374151;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-cancel-modern:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-save-modern {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: 2px solid transparent;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-save-modern:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.btn-save-modern:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-save-modern:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Button Icon and Text */
.btn-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.btn-cancel-modern:hover .btn-icon {
  transform: scale(1.1);
}

.btn-save-modern:hover .btn-icon {
  transform: scale(1.1);
}

.btn-text {
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Modern Spinner */
.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-dots {
  display: flex;
  gap: 0.25rem;
}

.spinner-dots span {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: spinner-dots 1.4s ease-in-out infinite both;
}

.spinner-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes spinner-dots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Ripple Effect */
.btn-cancel-modern::before,
.btn-save-modern::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-cancel-modern:active::before,
.btn-save-modern:active::before {
  width: 300px;
  height: 300px;
}

/* Responsive Footer */
@media (max-width: 640px) {
  .modal-footer-modern {
    flex-direction: column;
    padding: 1.5rem;
    gap: 0.75rem;
  }

  .btn-cancel-modern,
  .btn-save-modern {
    width: 100%;
    min-width: auto;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .btn-cancel-modern,
  .btn-save-modern {
    font-size: 0.875rem;
    padding: 0.875rem 1.25rem;
  }

  .btn-icon {
    font-size: 1rem;
  }
}

/* Special override for delete confirmation modal */
.modal.fade.show:nth-of-type(3) {
  z-index: 10003;
}

.modal.fade.show:nth-of-type(3) .modal-dialog {
  z-index: 10004;
}

.modal.fade.show:nth-of-type(3) .modal-content {
  z-index: 10004;
}

/* Modern Form Styles */
.modal-body-modern {
  padding: 2rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.menu-form {
  max-width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group-modern {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin: 0;
}

.label-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.label-text {
  flex: 1;
  color: #1f2937;
}

.required-mark {
  color: #ef4444;
  font-weight: 700;
  margin-left: 0.25rem;
}

.input-wrapper-modern {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input-modern {
  flex: 1;
  padding: 0.75rem 1rem 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-input-modern::placeholder {
  color: #9ca3af;
  font-style: italic;
}

.form-input-modern:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-input-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.form-input-modern.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  position: absolute;
  right: 1rem;
  font-size: 1.125rem;
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.2s ease;
}

.form-input-modern:focus + .input-icon {
  color: #3b82f6;
}

.form-input-modern.error + .input-icon {
  color: #ef4444;
}

.error-message-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.error-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.help-text-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
  margin-top: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: #f0f9ff;
  border: 1px solid #dbeafe;
  border-radius: 6px;
}

.help-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* Modern Select */
.select-wrapper-modern {
  position: relative;
}

.form-select-modern {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em 1.25em;
}

.form-select-modern:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-select-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select-modern option {
  padding: 0.5rem;
  font-weight: 400;
}

/* Modern Toggle Switch */
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

/* Responsive Form Grid */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .modal-body-modern {
    padding: 1.5rem;
  }
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #6b7280;
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-outline-primary {
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outline-primary:hover {
  background: #3b82f6;
  color: white;
}

.btn-outline-secondary {
  color: #6b7280;
  border-color: #6b7280;
}

.btn-outline-secondary:hover {
  background: #6b7280;
  color: white;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .menu-management-modal {
    max-width: 95vw;
    max-height: 90vh;
  }
}

@media (max-width: 768px) {
  .menu-management-modal-overlay {
    padding: 0.5rem;
  }

  .menu-management-modal {
    margin: 0;
    max-height: calc(100vh - 1rem);
    border-radius: 12px;
  }

  .filter-section,
  .table-section {
    padding: 1rem;
  }

  .menu-management-modal .modal-header {
    padding: 1rem 1.5rem;
  }

  .menu-management-modal .modal-header h4 {
    font-size: 1.25rem;
  }

  .modal.fade.show .modal-dialog {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .modal.fade.show .modal-body {
    padding: 1.5rem;
  }

  .modal.fade.show .modal-footer {
    padding: 1rem 1.5rem;
  }

  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }

  .menu-name-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .menu-management-modal {
    border-radius: 8px;
  }

  .filter-section {
    padding: 0.75rem;
  }

  .table-section {
    padding: 0.75rem;
  }

  .menu-management-modal .modal-header {
    padding: 0.75rem 1rem;
  }

  .modal.fade.show .modal-body {
    padding: 1rem;
  }

  .modal.fade.show .modal-footer {
    padding: 0.75rem 1rem;
  }

  .table th,
  .table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
}

/* Animations */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Delete Modal Styles */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10010;
  padding: 1rem;
  backdrop-filter: blur(6px);
}

.delete-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

.delete-modal-header {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-modal-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.delete-modal-body {
  padding: 2rem;
  background: white;
}

.delete-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.delete-icon {
  font-size: 2rem;
  color: #ef4444;
  flex-shrink: 0;
}

.delete-message p {
  margin: 0;
  font-size: 1rem;
  color: #374151;
  line-height: 1.5;
}

.delete-message strong {
  color: #ef4444;
  font-weight: 600;
}

.delete-warning {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #92400e;
  font-size: 0.9rem;
}

.delete-warning i {
  color: #f59e0b;
  font-size: 1rem;
  flex-shrink: 0;
}

.delete-modal-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.delete-modal-footer .btn {
  min-width: 100px;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Fix backdrop blur for better visual */
.menu-management-modal-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.02);
  pointer-events: none;
}

/* Responsive Delete Modal */
@media (max-width: 768px) {
  .delete-modal-overlay {
    padding: 0.5rem;
  }

  .delete-modal {
    margin: 0;
    max-width: calc(100vw - 1rem);
    border-radius: 12px;
  }

  .delete-modal-header {
    padding: 1rem 1.5rem;
  }

  .delete-modal-title {
    font-size: 1.125rem;
  }

  .delete-modal-body {
    padding: 1.5rem;
  }

  .delete-message {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .delete-modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
  }

  .delete-modal-footer .btn {
    width: 100%;
  }
}
</style>