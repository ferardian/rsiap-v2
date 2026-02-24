<template>
  <div class="user-management">
    <div class="page-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="page-title">👤 Kelola User</h1>
          <p class="page-subtitle">Manajemen pengguna dan hak akses sistem</p>
        </div>
        <div class="header-right">
          <button class="btn btn-primary btn-bulk-assign" @click="showBulkAssignModal = true">
            <i class="fas fa-users"></i>
            <span>{{ isMobile ? 'Bulk' : 'Bulk Assign Role' }}</span>
          </button>
        </div>
      </div>
    </div>


    <!-- Filter dan Search -->
    <div class="card mb-3 filter-card flex-shrink-0">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Search User</label>
            <div class="input-group search-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Cari nama atau NIP..."
                @input="debounceSearch"
              />
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Filter Role</label>
            <v-select
              v-model="filterRole"
              :options="roleOptions"
              label="nama_role"
              :reduce="role => role.id_role"
              placeholder="Semua Role"
              class="modern-v-select"
              teleport="body"
              @update:modelValue="fetchUsers"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Filter Status</label>
            <v-select
              v-model="filterActive"
              :options="[
                { label: 'Semua Status', value: '' },
                { label: 'Aktif', value: 'active' },
                { label: 'Tidak Aktif', value: 'inactive' }
              ]"
              label="label"
              :reduce="status => status.value"
              placeholder="Pilih Status"
              class="modern-v-select"
              teleport="body"
              @update:modelValue="fetchUsers"
            />
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary btn-reset w-100" @click="resetFilters">
              <i class="fas fa-redo"></i>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-3 flex-shrink-0">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ totalUsers }}</h4>
                <p class="card-text">Total Users</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-users fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ activeUsers }}</h4>
                <p class="card-text">Users Aktif</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-user-check fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ usersWithoutRole }}</h4>
                <p class="card-text">Tanpa Role</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-user-slash fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">{{ roleStore.roles.length }}</h4>
                <p class="card-text">Total Role</p>
              </div>
              <div class="align-self-center">
                <i class="fas fa-shield-alt fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
      <div class="card-body d-flex flex-column" style="overflow: hidden;">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data user...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-else class="table-responsive-wrapper flex-grow-1" style="min-height: 0;">
          <div class="table-responsive h-100">
            <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th @click="sortBy('nama')" style="cursor: pointer;">
                  Nama <i class="fas fa-sort"></i>
                </th>
                <th @click="sortBy('nip')" style="cursor: pointer;">
                  NIP <i class="fas fa-sort"></i>
                </th>
                <th>Jabatan</th>
                <th>Role</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.nip">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-3">
                      <i class="fas fa-user-circle fa-2x text-primary"></i>
                    </div>
                    <div>
                      <div class="fw-semibold">{{ user.nama }}</div>
                      <small class="text-muted">{{ user.email || 'No email' }}</small>
                    </div>
                  </div>
                </td>
                <td><code>{{ user.nip }}</code></td>
                <td>{{ user.jbtn || '-' }}</td>
                <td>
                  <div v-if="userRoles(user.nip).length > 0" class="d-flex flex-wrap gap-1">
                    <span
                      v-for="userRole in userRoles(user.nip)"
                      :key="userRole.id_role"
                      class="badge bg-primary"
                    >
                      {{ getRoleName(userRole.id_role) }}
                    </span>
                  </div>
                  <span v-else class="badge bg-secondary">No Role</span>
                </td>
                <td>
                  <span :class="['badge', user.status === 'active' ? 'bg-success' : 'bg-danger']">
                    {{ user.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="action-buttons">
                    <button
                      class="action-btn action-btn-primary"
                      @click="manageUserRoles(user)"
                      title="Manage Roles"
                    >
                      <i class="fas fa-user-shield"></i>
                    </button>
                    <button
                      class="action-btn action-btn-warning"
                      @click="openSetPasswordModal(user)"
                      title="Set Password"
                    >
                      <i class="fas fa-key"></i>
                    </button>
                    <button
                      class="action-btn action-btn-info"
                      @click="viewUserDetail(user)"
                      title="Detail"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container d-flex justify-content-between align-items-center mt-3 flex-shrink-0">
          <div class="text-muted pagination-info">
            Menampilkan {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredUsers.length) }}
            dari {{ filteredUsers.length }} user
          </div>
          <nav class="pagination-nav">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage = 1" :title="isMobile ? 'First' : ''">
                  <i v-if="isMobile" class="fas fa-angle-double-left"></i>
                  <span v-else>First</span>
                </a>
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
                <a class="page-link" href="#" @click.prevent="currentPage = totalPages" :title="isMobile ? 'Last' : ''">
                  <i v-if="isMobile" class="fas fa-angle-double-right"></i>
                  <span v-else>Last</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- User Roles Modal -->
    <div
      class="modal fade"
      :class="{ show: showUserRolesModal }"
      :style="{ display: showUserRolesModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-shield"></i> Manage Roles: {{ selectedUser?.nama }}
            </h5>
            <button type="button" class="btn-close" @click="showUserRolesModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Current Roles</h6>
                <div v-if="currentUserRoles.length === 0" class="text-muted mb-3">
                  User tidak memiliki role
                </div>
                <div v-else class="mb-3">
                  <div
                    v-for="userRole in currentUserRoles"
                    :key="userRole.id_role"
                    class="badge bg-primary me-2 mb-2 p-2"
                  >
                    {{ getRoleName(userRole.id_role) }}
                    <button
                      class="btn btn-sm btn-light ms-1"
                      @click="removeRoleFromUser(userRole.id_role)"
                      title="Remove role"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="mb-0">Available Roles</h6>
                  <div class="input-group input-group-sm w-50">
                    <span class="input-group-text bg-white border-end-0">
                      <i class="fas fa-search text-muted"></i>
                    </span>
                    <input
                      v-model="availableRoleSearchQuery"
                      type="text"
                      class="form-control border-start-0 ps-0"
                      placeholder="Cari role..."
                    />
                  </div>
                </div>
                <div v-if="filteredAvailableRoles.length === 0" class="text-muted mb-3">
                  {{ availableRoleSearchQuery ? 'Tidak ada role yang cocok' : 'Semua role sudah ditugaskan' }}
                </div>
                <div v-else class="available-roles-list">
                  <div
                    v-for="role in filteredAvailableRoles"
                    :key="role.id_role"
                    class="form-check mb-2"
                  >
                    <input
                      :id="`role-${role.id_role}`"
                      v-model="selectedRoles"
                      :value="role.id_role"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label :for="`role-${role.id_role}`" class="form-check-label">
                      <strong>{{ role.nama_role }}</strong>
                      <br>
                      <small class="text-muted">{{ role.deskripsi || 'No description' }}</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showUserRolesModal = false">Tutup</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveUserRoles"
              :disabled="roleStore.loading"
            >
              <span v-if="roleStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Assign Modal -->
    <div
      class="modal fade"
      :class="{ show: showBulkAssignModal }"
      :style="{ display: showBulkAssignModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-users"></i> Bulk Assign Role
            </h5>
            <button type="button" class="btn-close" @click="closeBulkAssignModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Pilih Role *</label>
              <v-select
                v-model="bulkAssign.role_id"
                :options="roleStore.roles"
                label="nama_role"
                :reduce="role => role.id_role"
                placeholder="-- Pilih Role --"
                class="modern-v-select"
                :class="{ 'is-invalid': errors.role_id }"
                teleport="body"
              />
              <div v-if="errors.role_id" class="error-feedback">
                {{ errors.role_id }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Filter Jabatan</label>
              <v-select
                v-model="bulkAssignJabatanFilter"
                :options="uniqueJabatanList"
                label="label"
                :reduce="item => item.value"
                placeholder="Semua Jabatan"
                class="modern-v-select"
                teleport="body"
              />
              <small class="text-muted">Filter pegawai berdasarkan jabatan</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Pilih User *</label>
              <div class="user-list-container border rounded p-3">
                <div class="form-check mb-2">
                  <input
                    id="selectAll"
                    v-model="selectAll"
                    class="form-check-input"
                    type="checkbox"
                    @change="toggleSelectAll"
                  />
                  <label class="form-check-label" for="selectAll">
                    <strong>Pilih Semua</strong>
                  </label>
                </div>
                <hr>
                <div
                  v-for="user in filteredUsersForBulkAssign"
                  :key="user.nip"
                  class="form-check mb-2"
                >
                  <input
                    :id="`user-${user.nip}`"
                    v-model="bulkAssign.users"
                    :value="user.nip"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label :for="`user-${user.nip}`" class="form-check-label">
                    <strong>{{ user.nama }}</strong>
                    <br>
                    <small class="text-muted">{{ user.nip }} - {{ user.jbtn || 'No jabatan' }}</small>
                  </label>
                </div>
              </div>
              <small class="text-muted">
                {{ bulkAssign.users.length }} user dipilih
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBulkAssignModal">Batal</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveBulkAssign"
              :disabled="roleStore.loading || bulkAssign.users.length === 0"
            >
              <span v-if="roleStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Assign Role ({{ bulkAssign.users.length }} users)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Set Password Modal -->
    <SetPasswordModal 
      :show="showSetPasswordModal"
      :user-id="selectedUserForPassword"
      @close="showSetPasswordModal = false"
      @saved="handlePasswordSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoleStore } from '../../stores/role'
import { useAuthStore } from '../../stores/auth'
import { showToast } from '../../utils/notification'
import SetPasswordModal from './components/SetPasswordModal.vue'

const roleStore = useRoleStore()
const authStore = useAuthStore()

// Responsiveness
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// State
const searchQuery = ref('')
const filterRole = ref('')
const filterActive = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('nama')
const sortDirection = ref('asc')

const showUserRolesModal = ref(false)
const showBulkAssignModal = ref(false)
const loading = ref(false)
const error = ref(null)
const availableRoleSearchQuery = ref('')

const selectedUser = ref(null)
const selectedRoles = ref([])
const bulkAssign = ref({
  role_id: '',
  users: []
})

const bulkAssignJabatanFilter = ref('')
const selectAll = ref(false)
const errors = ref({})

// Set Password Modal State
const showSetPasswordModal = ref(false)
const selectedUserForPassword = ref(null)

// Computed
const filteredUsers = computed(() => {
  let users = [...roleStore.pegawai]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(user =>
      user.nama.toLowerCase().includes(query) ||
      user.nip.includes(query)
    )
  }

  // Filter by role
  if (filterRole.value) {
    if (filterRole.value === 'none') {
      users = users.filter(user =>
        !roleStore.userRoles.some(ur => ur.nip === user.nip)
      )
    } else {
      users = users.filter(user =>
        roleStore.userRoles.some(ur =>
          ur.nip === user.nip && ur.id_role === filterRole.value
        )
      )
    }
  }

  // Filter by status
  if (filterActive.value) {
    users = users.filter(user =>
      filterActive.value === 'active' ? user.status === 'active' : user.status !== 'active'
    )
  }

  // Sort
  users.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return users
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)

const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value)
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

const totalUsers = computed(() => roleStore.pegawai.length)

const activeUsers = computed(() => {
  return roleStore.pegawai.filter(user => user.status === 'active').length
})

const usersWithoutRole = computed(() => {
  return roleStore.pegawai.filter(user =>
    !roleStore.userRoles.some(ur => ur.nip === user.nip)
  ).length
})

const usersWithoutRoleList = computed(() => {
  return roleStore.pegawai.filter(user =>
    !roleStore.userRoles.some(ur => ur.nip === user.nip)
  )
})

const roleOptions = computed(() => {
  return [
    { id_role: 'none', nama_role: '🚫 Tanpa Role' },
    ...roleStore.roles
  ]
})

const currentUserRoles = computed(() => {
  if (!selectedUser.value) return []
  return roleStore.userRoles.filter(ur => ur.nip === selectedUser.value.nip)
})

const availableRoles = computed(() => {
  if (!selectedUser.value) return []
  const currentRoleIds = currentUserRoles.value.map(ur => ur.id_role)
  return roleStore.roles.filter(role => !currentRoleIds.includes(role.id_role))
})

const filteredAvailableRoles = computed(() => {
  const roles = availableRoles.value
  if (!availableRoleSearchQuery.value) return roles

  const query = availableRoleSearchQuery.value.toLowerCase()
  return roles.filter(role =>
    role.nama_role.toLowerCase().includes(query) ||
    (role.deskripsi && role.deskripsi.toLowerCase().includes(query))
  )
})

// Get unique jabatan list for filter
const uniqueJabatanList = computed(() => {
  const jabatanSet = new Set()
  roleStore.pegawai.forEach(user => {
    if (user.jbtn) {
      jabatanSet.add(JSON.stringify({ value: user.jbtn, label: user.jbtn }))
    } else if (user.kdjbtn) {
      // Fallback if jbtn is missing but kdjbtn exists (unlikely given current resource)
      jabatanSet.add(JSON.stringify({ value: user.kdjbtn, label: user.jbtn || user.kdjbtn }))
    }
  })
  return Array.from(jabatanSet).map(item => JSON.parse(item)).sort((a, b) => a.label.localeCompare(b.label))
})

// Filtered users for bulk assign based on jabatan filter
const filteredUsersForBulkAssign = computed(() => {
  let users = usersWithoutRoleList.value
  
  if (bulkAssignJabatanFilter.value) {
    // Check against both jbtn and kdjbtn to be safe
    users = users.filter(user => 
      user.jbtn === bulkAssignJabatanFilter.value || 
      user.kdjbtn === bulkAssignJabatanFilter.value
    )
  }
  
  return users
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null

    await Promise.all([
      roleStore.fetchAllPegawai({ limit: 1000 }),
      roleStore.fetchAllUserRoles()
    ])
  } catch (err) {
    error.value = 'Gagal memuat data user'
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    await roleStore.fetchAllRoles()
  } catch (err) {
    console.error('Error fetching roles:', err)
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
  filterRole.value = ''
  filterActive.value = ''
  currentPage.value = 1
}

const userRoles = (nip) => {
  return roleStore.userRoles.filter(ur => ur.nip === nip)
}

const getRoleName = (roleId) => {
  const role = roleStore.roles.find(r => r.id_role === roleId)
  return role ? role.nama_role : 'Unknown Role'
}

const manageUserRoles = (user) => {
  selectedUser.value = user
  selectedRoles.value = currentUserRoles.value.map(ur => ur.id_role)
  showUserRolesModal.value = true
}

const removeRoleFromUser = async (roleId) => {
  if (!selectedUser.value) return

  try {
    const result = await roleStore.removeRoleFromPegawai(selectedUser.value.nip, roleId)

    if (result.success) {
      showToast('Role berhasil dihapus dari user', 'success')
      await fetchUsers()
    } else {
      showToast(result.error || 'Gagal menghapus role dari user', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menghapus role', 'error')
    console.error('Error removing role from user:', err)
  }
}

const saveUserRoles = async () => {
  if (!selectedUser.value) return

  try {
    const userId = authStore.user?.id_user || 1
    const promises = []

    // Add new roles
    for (const roleId of selectedRoles.value) {
      if (!currentUserRoles.value.some(ur => ur.id_role === roleId)) {
        promises.push(
          roleStore.assignRoleToPegawai(selectedUser.value.nip, roleId, userId)
        )
      }
    }

    // Remove roles that are not selected anymore
    for (const userRole of currentUserRoles.value) {
      if (!selectedRoles.value.includes(userRole.id_role)) {
        promises.push(
          roleStore.removeRoleFromPegawai(selectedUser.value.nip, userRole.id_role)
        )
      }
    }

    await Promise.all(promises)

    showToast('Role user berhasil diperbarui', 'success')
    showUserRolesModal.value = false
    await fetchUsers()
  } catch (err) {
    showToast('Terjadi kesalahan saat memperbarui role user', 'error')
    console.error('Error updating user roles:', err)
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    bulkAssign.value.users = filteredUsersForBulkAssign.value.map(user => user.nip)
  } else {
    bulkAssign.value.users = []
  }
}

const validateBulkAssign = () => {
  errors.value = {}

  if (!bulkAssign.value.role_id) {
    errors.value.role_id = 'Role wajib dipilih'
  }

  if (bulkAssign.value.users.length === 0) {
    errors.value.users = 'Pilih minimal satu user'
  }

  return Object.keys(errors.value).length === 0
}

const saveBulkAssign = async () => {
  if (!validateBulkAssign()) return

  try {
    const userId = authStore.user?.id_user || 1
    const promises = []

    for (const nip of bulkAssign.value.users) {
      promises.push(
        roleStore.assignRoleToPegawai(nip, bulkAssign.value.role_id, userId)
      )
    }

    await Promise.all(promises)

    showToast(
      `Berhasil assign role ke ${bulkAssign.value.users.length} user`,
      'success'
    )

    closeBulkAssignModal()
    await fetchUsers()
  } catch (err) {
    showToast('Terjadi kesalahan saat bulk assign role', 'error')
    console.error('Error bulk assigning roles:', err)
  }
}

const closeBulkAssignModal = () => {
  showBulkAssignModal.value = false
  bulkAssign.value = {
    role_id: '',
    users: []
  }
  bulkAssignJabatanFilter.value = ''
  selectAll.value = false
  errors.value = {}
}

const viewUserDetail = (user) => {
  showToast(`Detail user: ${user.nama}`, 'info')
}

const openSetPasswordModal = (user) => {
  selectedUserForPassword.value = user.nip
  showSetPasswordModal.value = true
}

const handlePasswordSaved = () => {
  showToast('Password berhasil diubah', 'success')
}

// Watch for bulkAssign.users changes
watch(() => bulkAssign.value.users, (newUsers) => {
  selectAll.value = newUsers.length === filteredUsersForBulkAssign.value.length && filteredUsersForBulkAssign.value.length > 0
})

// Watch for jabatan filter changes to reset selection
watch(() => bulkAssignJabatanFilter.value, () => {
  bulkAssign.value.users = []
  selectAll.value = false
})

// Watch for filter changes to reset pagination
watch([filterRole, filterActive], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchRoles(),
    fetchUsers()
  ])
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.available-roles-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.available-roles-list::-webkit-scrollbar {
  width: 5px;
}
.available-roles-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.available-roles-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.user-management {
  /* Removed fixed positioning to fit in MainLayout */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.page-header {
  margin-bottom: 1.5rem;
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  margin-bottom: 0;
  font-size: 0.875rem;
}

.btn-bulk-assign {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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

.card-body {
  padding: 1.5rem;
}

/* Custom styles for full page layout */
.card-body .row {
  flex-shrink: 0;
}

/* Statistics cards row */
.row.mb-3.flex-shrink-0 .card {
  min-height: 80px;
}

.row.mb-3.flex-shrink-0 .card .card-body {
  padding: 1rem;
}

.row.mb-3.flex-shrink-0 .card-title {
  font-size: 1.5rem;
  margin-bottom: 0;
}

.row.mb-3.flex-shrink-0 .card-text {
  font-size: 0.8rem;
  margin-bottom: 0;
}

.card.bg-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

.card.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

.card.bg-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
}

.card.bg-info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%) !important;
}

.form-control, .form-select {
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus, .form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
  outline: none;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-group {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-group-text {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: none;
  color: #6b7280;
  font-weight: 600;
}

.btn-outline-secondary {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e2e8f0;
  color: #6b7280;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  background: #6b7280;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
  border-color: #6b7280;
}

.card-title {
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}

.card-text {
  font-size: 0.9rem;
  opacity: 0.9;
}

.table-responsive-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  min-width: 800px;
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 700;
  color: #475569;
  background: #f8fafc;
  padding: 1rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid #e2e8f0;
}

.table th:hover {
  background: #f1f5f9;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
  border-top: 1px solid #e5e7eb;
}

.table tbody tr:hover {
  background-color: #f8fafc;
}

.user-avatar {
  flex-shrink: 0;
}

.badge {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.badge.bg-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

.badge.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

.badge.bg-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
}

.badge.bg-secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
}

.btn-group-sm > .btn {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-primary {
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline-primary:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-outline-info {
  background: transparent;
  border: 2px solid #06b6d4;
  color: #06b6d4;
}

.btn-outline-info:hover {
  background: #06b6d4;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  border: none;
  background: transparent;
  color: #3b82f6;
  padding: 0.5rem 0.75rem;
  margin: 0 0.125rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.page-link:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.page-item.disabled .page-link {
  color: #94a3b8;
  background: transparent;
  opacity: 0.6;
}

.pagination .page-link {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
}

.modal.show {
  display: block !important;
}

.modal-dialog {
  margin: 2rem auto;
  animation: modalSlideIn 0.3s ease-out;
  overflow: visible;
}

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

.modal-content {
  border: none;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: visible;
}

.modal-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.5rem 2rem;
}

.modal-title {
  font-weight: 700;
  font-size: 1.3rem;
}

.modal-body {
  padding: 2rem;
  overflow: visible;
}

.modal-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
}

.user-list-container {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.border {
  border-color: #e2e8f0 !important;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 0.75rem;
}

.form-check {
  margin-bottom: 0.75rem;
}

.form-check-input {
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.form-check-label {
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-check-label:hover {
  color: #3b82f6;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.spinner-border {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-close {
  background: transparent;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.btn-close:hover {
  opacity: 1;
  transform: rotate(90deg);
}

.text-muted {
  color: #6b7280 !important;
}

code {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.fw-semibold {
  font-weight: 600;
  color: #1f2937;
}

.alert {
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  font-weight: 500;
}

.alert-danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: row;
    align-items: center;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.75rem;
  }

  .btn-bulk-assign, .btn-reset {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .card-body {
    padding: 1rem;
  }

  .table th, .table td {
    padding: 0.75rem 0.5rem;
  }

  .user-avatar {
    display: none;
  }
}

/* Modern V-Select Custom Styling */
.modern-v-select {
  --vs-border-color: #e2e8f0;
  --vs-border-width: 2px;
  --vs-border-radius: 0.75rem;
  --vs-font-size: 0.9rem;
  --vs-line-height: 1.5;
  --vs-dropdown-max-height: 250px;
  --vs-dropdown-bg: #ffffff;
  --vs-dropdown-option-color: #374151;
  --vs-dropdown-option--active-bg: #3b82f6;
  --vs-dropdown-option--active-color: #ffffff;
  --vs-search-input-color: #374151;
  --vs-controls-color: #64748b;
  --vs-selected-color: #1e293b;
}

.modern-v-select :deep(.vs__dropdown-toggle) {
  padding: 0.4rem 0.25rem;
  background: white;
  transition: all 0.3s ease;
}

.modern-v-select.is-invalid :deep(.vs__dropdown-toggle) {
  border-color: #ef4444;
}

.modern-v-select :deep(.vs__dropdown-menu) {
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  border-radius: 0.75rem;
  margin-top: 4px;
  z-index: 9999 !important;
  min-width: 100%; /* Minimal selebar input parent */
  width: max-content; /* Melebar sesuai konten jika teks panjang */
  max-width: 400px; /* Batasi lebar maksimal agar tidak terlalu lebar */
}

.modern-v-select :deep(.vs__dropdown-option) {
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2px;
}

.error-feedback {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.filter-card {
  overflow: visible !important;
  z-index: 10;
}

.filter-card .card-body {
  overflow: visible !important;
}

/* Pagination Responsive */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column !important;
    gap: 1rem !important;
    align-items: center !important;
    text-align: center;
  }

  .pagination-info {
    font-size: 0.8rem;
    order: 2;
  }

  .pagination-nav {
    order: 1;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .pagination {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
    justify-content: flex-start;
    padding: 0.5rem 1.5rem; /* Increased padding */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .pagination::-webkit-scrollbar {
    display: none;
  }

  .pagination .page-item {
    flex-shrink: 0;
  }

  .pagination .page-link {
    padding: 0.6rem 0.8rem; /* Slightly larger targets */
    font-size: 0.9rem;
    margin: 0 0.25rem;
    min-width: 46px;
    height: 42px;
    text-align: center;
  }
}

/* Action Buttons Styling */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  padding: 0;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.action-btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.action-btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.action-btn-warning:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.action-btn-info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
}

.action-btn-info:hover {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}

@media (max-width: 768px) {
  .action-buttons {
    gap: 0.375rem;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>