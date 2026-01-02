<template>
  <div class="user-management-modal-overlay">
    <div class="user-management-modal">
      <div class="modal-header">
        <h4>👥 Kelola User</h4>
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
            <div class="filter-actions">
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
                <i class="fas fa-undo"></i>
                Reset
              </button>
              <button type="button" class="btn btn-primary btn-sm" @click="showCreateModal = true">
                <i class="fas fa-plus"></i>
                Tambah User Baru
              </button>
            </div>
          </div>
          <div class="filter-content">
            <div class="filter-row">
              <div class="filter-group">
                <div class="input-with-icon">
                  <i class="fas fa-search"></i>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Cari berdasarkan nama, username, atau NIP..."
                    v-model="searchQuery"
                  >
                </div>
              </div>
              <div class="filter-group">
                <div class="input-with-icon">
                  <i class="fas fa-user-tag"></i>
                  <select class="form-control" v-model="filterRole">
                    <option value="">Semua Role</option>
                    <option v-for="role in roles" :key="role.id_role" :value="role.id_role">
                      {{ role.nama_role }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="filter-group">
                <div class="input-with-icon">
                  <i class="fas fa-toggle-on"></i>
                  <select class="form-control" v-model="filterStatus">
                    <option value="">Semua Status</option>
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="table-responsive-modern">
          <table class="table-modern">
            <thead>
              <tr>
                <th>
                  <div class="table-header-content">
                    <span>Informasi User</span>
                    <i class="fas fa-sort sort-icon"></i>
                  </div>
                </th>
                <th>
                  <div class="table-header-content">
                    <span>Username</span>
                    <i class="fas fa-sort sort-icon"></i>
                  </div>
                </th>
                <th>
                  <div class="table-header-content">
                    <span>Role</span>
                    <i class="fas fa-sort sort-icon"></i>
                  </div>
                </th>
                <th>
                  <div class="table-header-content">
                    <span>Status</span>
                    <i class="fas fa-sort sort-icon"></i>
                  </div>
                </th>
                <th>
                  <div class="table-header-content">
                    <span>Aksi</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center">
                  <div class="loading-container">
                    <div class="loading-spinner">
                      <div class="spinner"></div>
                      <div class="loading-text">
                        <div class="loading-title">Memuat Data User Management</div>
                        <div class="loading-subtitle">Sedang menyiapkan data pengguna dan role...</div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!loading && paginatedUsers.length === 0">
                <td colspan="5" class="text-center">
                  <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <span>Tidak ada data user</span>
                  </div>
                </td>
              </tr>
              <tr v-for="user in displayUsers" :key="user.id_user" class="table-row-hover" @click="console.log('User clicked:', user)">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                      <div class="user-name">{{ user.nama }}</div>
                      <div class="user-nip">{{ user.nip }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="user-username">@{{ user.username }}</span>
                </td>
                <td>
                  <span class="user-role">{{ user.role_name || 'Administrator' }}</span>
                </td>
                <td>
                  <span :class="['user-status', user.status == 1 ? 'status-active' : 'status-inactive']">
                    {{ user.status == 1 ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button type="button" class="btn-icon btn-edit" @click="editUser(user)" title="Edit User">
                      <i class="fas fa-edit">✏️</i>
                    </button>
                    <button type="button" class="btn-icon btn-delete" @click="deleteUser(user)" title="Hapus User">
                      <i class="fas fa-trash">🗑️</i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper">
          <div class="pagination-info">
            Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ filteredUsers.length }} user
          </div>
          <div class="pagination-controls">
            <button
              class="btn btn-outline-secondary btn-sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <i class="fas fa-chevron-left"></i>
              Previous
            </button>
            <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
            <button
              class="btn btn-outline-secondary btn-sm"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Next
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateModal" class="user-create-modal-overlay">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="['fas', isEditing ? 'fa-edit' : 'fa-plus']"></i>
              {{ isEditing ? 'Edit User' : 'Tambah User Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeCreateModal">
              ×
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser" class="modern-form">
              <div class="form-grid">
                <!-- Nama -->
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user"></i>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.nama"
                    placeholder="Masukkan nama lengkap user"
                    required
                  >
                </div>

                <!-- NIP -->
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-id-card"></i>
                    NIP
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.nip"
                    placeholder="Masukkan NIP user"
                    required
                  >
                </div>

                <!-- Username -->
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-at"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.username"
                    placeholder="Masukkan username"
                    required
                  >
                </div>

                <!-- Password -->
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-lock"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="userForm.password"
                    :placeholder="isEditing ? 'Kosongkan jika tidak mengubah' : 'Masukkan password'"
                    :required="!isEditing"
                  >
                </div>

                
                <!-- Role -->
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user-tag"></i>
                    Role
                  </label>
                  <select class="form-control" v-model="userForm.id_role" required>
                    <option value="">Pilih Role</option>
                    <option v-for="role in roles" :key="role.id_role" :value="role.id_role">
                      {{ role.nama_role }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Status -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-toggle-on"></i>
                  Status User
                </label>
                <div class="status-options">
                  <label class="status-option">
                    <input type="radio" v-model="userForm.status" value="1" required>
                    <span class="status-label status-active">Aktif</span>
                  </label>
                  <label class="status-option">
                    <input type="radio" v-model="userForm.status" value="0" required>
                    <span class="status-label status-inactive">Tidak Aktif</span>
                  </label>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="closeCreateModal">
                  <i class="fas fa-times"></i>
                  Batal
                </button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <i class="fas fa-save"></i>
                  {{ submitting ? 'Menyimpan...' : (isEditing ? 'Update User' : 'Simpan User') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/menu'
import { useRoleStore } from '../stores/role'
import { pegawaiService } from '../services/menuService'
import { showToast } from '../utils/notification'

// Emits
const emit = defineEmits(['close'])

// Store
const userStore = useUserStore()
const roleStore = useRoleStore()

// Reactive data - connect to store for reactive updates
const users = computed(() => userStore.users)
const loading = ref(false)
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showCreateModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const roles = ref([])
const rolesFetched = ref(false)
const userForm = ref({
  id_user: null,
  nama: '',
  nip: '',
  username: '',
  password: '',
  id_role: '',
  originalRole: '',
  status: '1'
})

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value || []

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.nama?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.nip?.toLowerCase().includes(query)
    )
  }

  // Filter by role
  if (filterRole.value) {
    filtered = filtered.filter(user => user.id_role == filterRole.value)
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(user => user.status == filterStatus.value)
  }

  return filtered
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage) || 1
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + paginatedUsers.value.length, filteredUsers.value.length)
})

// Check if data is ready to be displayed (both users and roles loaded)
const isDataReady = computed(() => {
  return !loading.value && rolesFetched.value && users.value.length > 0
})

// Computed for paginated users that only shows when data is ready
const displayUsers = computed(() => {
  return isDataReady.value ? paginatedUsers.value : []
})

// Utility function for exponential backoff
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchWithRetry = async (fetchFn, maxRetries = 5, baseDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}...`)
      const result = await fetchFn()

      if (result && result.error && result.error.includes('Too Many')) {
        throw new Error('Rate limited')
      }

      console.log('✅ Request successful')
      return result
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ Max retries reached')
        throw error
      }

      const waitTime = baseDelay * Math.pow(2, attempt - 1)
      console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry...`)
      await delay(waitTime)
    }
  }
}

// Methods
const fetchRoles = async () => {
  try {
    console.log('🔍 Fetching roles...')
    const result = await fetchWithRetry(() => roleStore.fetchAllRoles())

    if (result.success) {
      roles.value = result.data || []
      console.log('✅ Roles loaded:', roles.value)
    }
  } catch (error) {
    console.error('❌ Failed to fetch roles after retries:', error)
    showToast('Gagal mengambil data role', 'error')
  }
}

const fetchUsers = async () => {
  loading.value = true
  try {
    console.log('🔍 Starting fetchUsers...')
    const result = await fetchWithRetry(() => userStore.fetchAllUsers())

    console.log('📊 Result from store:', result)
    if (result.success) {
      console.log('✅ Users loaded via store:', userStore.users)

      // Fetch roles in background without blocking UI
      fetchUserRoles()
    }
  } catch (error) {
    console.error('❌ Failed to fetch users after retries:', error)
    showToast('Gagal mengambil data user', 'error')
  } finally {
    loading.value = false
  }
}

const fetchUserRoles = async () => {
  try {
    console.log('🎭 Using backend role data from LEFT JOIN query...')

    // Backend now provides complete role data via LEFT JOIN
    // No need for individual API calls that cause rate limiting
    const allUsers = userStore.users
    console.log(`📋 Using role data for ${allUsers.length} users from backend`)

    // Simply mark as fetched since data is already complete from backend
    rolesFetched.value = true
    console.log('✅ Role data ready from backend LEFT JOIN query')

  } catch (error) {
    console.error('❌ Error processing user roles:', error)
    rolesFetched.value = true // Mark as fetched even if error to prevent infinite loading
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

const resetForm = () => {
  userForm.value = {
    id_user: null,
    nama: '',
    nip: '',
    username: '',
    password: '',
    id_role: '',
    originalRole: '',
    status: '1'
  }
  isEditing.value = false
}

const closeCreateModal = () => {
  showCreateModal.value = false
  resetForm()
}

const editUser = async (user) => {
  console.log('✏️ Editing user:', user)
  console.log('📋 User properties:', Object.keys(user))

  // Fetch current role data for this user from API
  let currentRoleData = { id_role: 1, nama_role: 'Administrator' } // default

  if (user.nip && user.nip !== '-') {
    try {
      console.log(`🔍 Fetching current role for ${user.nip}...`)
      const roleResponse = await pegawaiService.getPegawaiAccessLevels(user.nip)
      if (roleResponse.data && roleResponse.data.length > 0) {
        const roleInfo = roleResponse.data[0]
        currentRoleData = {
          id_role: roleInfo.id_role,
          nama_role: roleInfo.nama_role
        }
        console.log(`✅ Found current role for ${user.nip}:`, currentRoleData.nama_role)
      } else {
        console.log(`⚠️ No role found for ${user.nip}, using default Administrator`)
      }
    } catch (error) {
      console.error(`❌ Error fetching role for ${user.nip}:`, error)
      console.log(`⚠️ Using default Administrator role for ${user.nip}`)
    }
  }

  userForm.value = {
    id_user: user.id_user || user.nip, // fallback to nip if id_user not available
    nama: user.nama || '',
    nip: user.nip || '',
    username: user.username || user.nip || '', // fallback to nip if username not available
    password: '', // always empty for edit
    id_role: currentRoleData.id_role.toString(), // use actual role from API
    originalRole: currentRoleData.id_role.toString(), // store original role for comparison
    status: (user.status !== undefined ? user.status.toString() : '1') // fallback to active
  }
  console.log('📝 User form set to:', userForm.value)
  console.log(`🎯 Using role: ${currentRoleData.nama_role} (${currentRoleData.id_role})`)
  isEditing.value = true
  showCreateModal.value = true
  console.log('🔓 Modal should open now. isEditing:', isEditing.value, 'showCreateModal:', showCreateModal.value)
}

const saveUser = async () => {
  submitting.value = true

  try {
    console.log('💾 Saving user:', userForm.value)
    console.log('🔧 isEditing:', isEditing.value)
    console.log('🆔 User ID:', userForm.value.id_user)

    let result

    if (isEditing.value) {
      // For editing, we focus on role assignment only
      const currentRole = parseInt(userForm.value.id_role)
      const originalRole = parseInt(userForm.value.originalRole)

      console.log('🔍 Debug role update check:', {
        currentRole: userForm.value.id_role,
        originalRole: userForm.value.originalRole,
        currentRoleInt: currentRole,
        originalRoleInt: originalRole,
        areEqual: currentRole === originalRole,
        formIdUser: userForm.value.id_user
      })

      if (userForm.value.id_role && currentRole !== originalRole) {
        console.log('🔐 Updating role:', userForm.value.id_role, 'from:', userForm.value.originalRole)

        try {
          const roleResult = await roleStore.assignRoleToPegawai(
            userForm.value.id_user,
            userForm.value.id_role,
            userForm.value.id_user
          )

          console.log('🔐 Role update result:', roleResult)

          if (roleResult.success) {
            console.log('✅ Role assignment successful!')
            showToast('Role berhasil diperbarui', 'success')

            // Update local state immediately with a slight delay for smooth UX
            setTimeout(() => {
              const userIndex = users.value.findIndex(u =>
                u.id_user === userForm.value.id_user || u.nip === userForm.value.id_user
              )

              if (userIndex !== -1) {
                const selectedRole = roles.value.find(r => r.id_role === parseInt(userForm.value.id_role))
                if (selectedRole) {
                  const updatedUser = {
                    ...users.value[userIndex],
                    id_role: parseInt(userForm.value.id_role),
                    role_name: selectedRole.nama_role
                  }

                  // Update store for immediate UI update
                  const storeUserIndex = userStore.users.findIndex(u =>
                    u.id_user === userForm.value.id_user || u.nip === userForm.value.id_user
                  )

                  if (storeUserIndex !== -1) {
                    // Update the store with the correct role immediately
                    userStore.users = [
                      ...userStore.users.slice(0, storeUserIndex),
                      updatedUser,
                      ...userStore.users.slice(storeUserIndex + 1)
                    ]

                    console.log('✅ Updated user role immediately:', updatedUser)
                    console.log(`📋 Role changed: ${selectedRole.nama_role} (ID: ${selectedRole.id_role})`)
                  }
                }
              }
            }, 100) // Small delay for smooth transition

            // Optional: Refresh users in background without blocking UI
            setTimeout(() => {
              fetchUsers().catch(err => {
                console.warn('Background refresh failed, but UI already updated:', err)
              })
            }, 500) // Delayed background refresh

            result = { success: true }
          } else {
            showToast(roleResult.error || 'Gagal mengupdate role', 'error')
            result = { success: false }
          }
        } catch (roleError) {
          console.error('🚨 Role assignment error:', roleError)
          showToast('Gagal mengupdate role', 'error')
          result = { success: false }
        }
      } else {
        console.log('ℹ️ No role change detected')
        showToast('Tidak ada perubahan role', 'info')
        result = { success: true }
      }
    } else {
      // For creating new user
      result = await userStore.createUser(userForm.value)
    }

    console.log('📊 Final save result:', result)

    if (result.success) {
      showToast(
        isEditing.value ? 'User berhasil diupdate!' : 'User berhasil ditambahkan!',
        'success'
      )
      closeCreateModal()
      await fetchUsers()
    } else {
      console.error('❌ Save failed:', result.error)
      showToast(result.error || 'Gagal menyimpan user', 'error')
    }

  } catch (error) {
    console.error('🚨 Error saving user:', error)
    console.error('🚨 Error response:', error.response)
    showToast('Terjadi kesalahan saat menyimpan user', 'error')
  } finally {
    submitting.value = false
  }
}

const deleteUser = async (user) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus user "${user.nama}"?`)) {
    return
  }

  try {
    const result = await userStore.deleteUser(user.id_user)
    if (result.success) {
      showToast('User berhasil dihapus!', 'success')
      await fetchUsers()
    } else {
      showToast(result.error || 'Gagal menghapus user', 'error')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    showToast('Terjadi kesalahan saat menghapus user', 'error')
  }
}

// Lifecycle
onMounted(async () => {
  // Reset state
  rolesFetched.value = false
  loading.value = true
  console.log('🔄 Starting user management modal load...')

  const startTime = Date.now()

  try {
    // Step 1: Fetch roles first (needed for role dropdowns)
    console.log('📋 Step 1: Fetching roles data...')
    await fetchRoles()
    console.log(`✅ Roles loaded: ${roles.value.length} roles`)

    // Step 2: Fetch users data
    console.log('📋 Step 2: Fetching users data...')
    await fetchUsers()
    console.log(`✅ Users loaded: ${userStore.users.length} users`)

    // Step 3: Fetch role assignments for users (in same function to ensure consistency)
    console.log('📋 Step 3: Fetching user role assignments...')
    await fetchUserRoles()
    console.log('✅ Role assignments completed')

    // Ensure minimum loading time for smooth UX
    const elapsedTime = Date.now() - startTime
    const minLoadingTime = 1200 // 1.2 seconds minimum
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

    if (remainingTime > 0) {
      console.log(`⏳ Adding ${remainingTime}ms for consistent loading...`)
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }

    console.log(`🎉 All data loaded successfully in ${Date.now() - startTime}ms`)

  } catch (error) {
    console.error('❌ Error loading user management data:', error)
    // Still hide loading even if error occurs
    showToast('Gagal memuat data user management', 'error')
  } finally {
    // Always hide loading at the end
    loading.value = false
    console.log('✅ Loading state set to false')
  }
})

// Watch for changes
watch(currentPage, () => {
  // Reset to top when page changes
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* User Management Modal Styles - Consistent with Menu Management */
.user-management-modal-overlay {
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

.user-management-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.user-management-modal .modal-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-management-modal .modal-header h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-management-modal .modal-header .btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-management-modal .modal-header .btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-management-modal .modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

/* Modern Filter Section */
.filter-section-modern {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-title i {
  color: #3b82f6;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.filter-group {
  position: relative;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 1;
}

.input-with-icon input,
.input-with-icon select {
  padding-left: 2.75rem;
}

.input-with-icon input::placeholder {
  color: #9ca3af;
}

/* Modern Table */
.table-responsive-modern {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.table-modern {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table-modern thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-modern th {
  padding: 1rem 1.25rem;
  font-weight: 600;
  color: #374151;
  text-align: left;
}

.table-header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  color: #9ca3af;
  font-size: 0.75rem;
  cursor: pointer;
}

.sort-icon:hover {
  color: #3b82f6;
}

.table-modern td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-row-hover:hover {
  background: #f9fafb;
}

/* User Info Styles */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.125rem;
}

.user-nip {
  font-size: 0.8rem;
  color: #6b7280;
}

.user-username {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  color: #3b82f6;
}

.user-role {
  font-weight: 500;
  color: #059669;
}

.user-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  font-weight: bold;
}

.btn-icon i {
  display: block;
  font-style: normal;
  line-height: 1;
}

.btn-edit {
  background: #eff6ff;
  color: #1d4ed8;
}

.btn-edit:hover {
  background: #dbeafe;
  transform: scale(1.05);
}

.btn-delete {
  background: #fef2f2;
  color: #dc2626;
}

.btn-delete:hover {
  background: #fee2e2;
  transform: scale(1.05);
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem 0;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-info {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Loading and Empty States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  text-align: left;
}

.loading-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.loading-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 2rem;
}

/* User Create Modal Overlay */
.user-create-modal-overlay {
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
.user-create-modal-overlay .modal-dialog {
  background: white !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.user-create-modal-overlay .modal-content {
  background: white !important;
  border: none !important;
  border-radius: 12px !important;
}

.user-create-modal-overlay .modal-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
  color: white !important;
  padding: 1.5rem !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-radius: 12px 12px 0 0 !important;
}

.user-create-modal-overlay .modal-title {
  color: white !important;
  font-weight: 600 !important;
  margin: 0 !important;
  font-size: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.user-create-modal-overlay .btn-close {
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

.user-create-modal-overlay .btn-close:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  transform: scale(1.05) !important;
}

.user-create-modal-overlay .modal-body {
  background: white !important;
  padding: 1.5rem !important;
}

.user-create-modal-overlay .modern-form {
  background: white !important;
}

.user-create-modal-overlay .form-group {
  background: white !important;
}

.user-create-modal-overlay .form-control {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
}

/* Modern Form Styles */
.modern-form {
  max-width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-label i {
  color: #3b82f6;
  font-size: 0.8rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.status-options {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.status-option input[type="radio"] {
  margin: 0;
}

.status-label {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .user-management-modal {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .filter-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filter-actions {
    justify-content: stretch;
  }

  .filter-actions button {
    flex: 1;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .table-modern {
    font-size: 0.8rem;
  }

  .table-modern th,
  .table-modern td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>