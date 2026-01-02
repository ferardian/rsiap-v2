<template>
  <div class="role-management">
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">👥 Kelola Role</h1>
          <p class="page-subtitle">Manajemen role dan hak akses pengguna</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="showUserAssignmentModal = true">
            <i class="fas fa-user-plus"></i> Assign User
          </button>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <i class="fas fa-plus"></i> Tambah Role
          </button>
        </div>
      </div>
    </div>


    <!-- Role Cards -->
    <div v-if="roleStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat data role...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-else-if="roleStore.roles.length === 0" class="text-center py-5">
      <i class="fas fa-users fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">Belum ada data role</h5>
      <p class="text-muted">Klik tombol "Tambah Role" untuk membuat role baru</p>
    </div>

    <div v-else class="row g-4 flex-grow-1" style="overflow-y: auto;">
      <div
        v-for="role in roleStore.rolesWithUserCount"
        :key="role.id_role"
        class="col-lg-4 col-md-6"
      >
        <div class="card role-card h-100">
          <div class="card-header bg-primary text-white">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">{{ role.nama_role }}</h5>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-light btn-sm" @click="editRole(role)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-light btn-sm"
                  @click="viewRoleUsers(role)"
                  title="Lihat User"
                >
                  <i class="fas fa-users"></i>
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="confirmDelete(role)"
                  title="Hapus"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <p class="card-text">{{ role.deskripsi || 'Tidak ada deskripsi' }}</p>
            <div class="row text-center">
              <div class="col-6">
                <div class="stat-box">
                  <h4 class="text-primary">{{ role.user_count || 0 }}</h4>
                  <small class="text-muted">Pengguna</small>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-box clickable" @click="viewRoleMenus(role)" style="cursor: pointer;" title="Klik untuk lihat menu">
                  <h4 class="text-info">{{ role.menu_count || 0 }}</h4>
                  <small class="text-muted">Menu</small>
                </div>
              </div>
            </div>
            <div class="mt-3">
              <small class="text-muted">
                Dibuat: {{ formatDate(role.created_at) }}
              </small>
            </div>
          </div>
          <div class="card-footer bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">Role #{{ role.id_role }}</small>
              <div>
                <button class="btn btn-outline-primary btn-sm me-2" @click="managePermissions(role)">
                  <i class="fas fa-key"></i> Permissions
                </button>
                <button class="btn btn-outline-info btn-sm" @click="viewRoleUsers(role)">
                  <i class="fas fa-users"></i> Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      class="modal fade"
      :class="{ show: showCreateModal }"
      :style="{ display: showCreateModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? '✏️ Edit Role' : '➕ Tambah Role Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRole">
              <div class="mb-3">
                <label class="form-label">Nama Role *</label>
                <input
                  v-model="formData.nama_role"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.nama_role }"
                  placeholder="Masukkan nama role"
                  required
                />
                <div v-if="errors.nama_role" class="invalid-feedback">
                  {{ errors.nama_role }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Deskripsi</label>
                <textarea
                  v-model="formData.deskripsi"
                  class="form-control"
                  :class="{ 'is-invalid': errors.deskripsi }"
                  rows="3"
                  placeholder="Masukkan deskripsi role"
                ></textarea>
                <div v-if="errors.deskripsi" class="invalid-feedback">
                  {{ errors.deskripsi }}
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveRole"
              :disabled="roleStore.loading"
            >
              <span v-if="roleStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditing ? 'Update' : 'Simpan' }}
            </button>
          </div>
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
            <p>Apakah Anda yakin ingin menghapus role <strong>{{ roleToDelete?.nama_role }}</strong>?</p>
            <div v-if="getUserCountForRole(roleToDelete?.id_role) > 0" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Role ini memiliki {{ getUserCountForRole(roleToDelete?.id_role) }} pengguna.
              Pengguna akan kehilangan aksesnya!
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Batal</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteRole"
              :disabled="roleStore.loading"
            >
              <span v-if="roleStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Users Modal -->
    <div
      class="modal fade"
      :class="{ show: showUsersModal }"
      :style="{ display: showUsersModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              👥 Pengguna Role: {{ selectedRole?.nama_role }}
            </h5>
            <button type="button" class="btn-close" @click="showUsersModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input
                  v-model="userSearchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Cari pegawai..."
                />
                <button class="btn btn-outline-primary" @click="assignUserToRole">
                  <i class="fas fa-plus"></i> Assign User
                </button>
              </div>
            </div>

            <div v-if="roleStore.loading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2">Memuat...</span>
            </div>

            <div v-else-if="roleUsers.length === 0" class="text-center py-3">
              <i class="fas fa-users fa-2x text-muted mb-2"></i>
              <p class="text-muted">Belum ada pengguna dalam role ini</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm">
                <thead class="table-light">
                  <tr>
                    <th>NIP</th>
                    <th>Nama</th>
                    <th>Jabatan</th>
                    <th>Departemen</th>
                    <th class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredRoleUsers" :key="user.nip">
                    <td>{{ user.nip }}</td>
                    <td>{{ user.nama }}</td>
                    <td>{{ user.nama_jabatan || '-' }}</td>
                    <td>{{ user.departemen || '-' }}</td>
                    <td class="text-center">
                      <button
                        class="btn btn-outline-danger btn-sm"
                        @click="removeUserFromRole(user)"
                        title="Hapus dari role"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showUsersModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Assignment Modal -->
    <div
      class="modal fade"
      :class="{ show: showUserAssignmentModal }"
      :style="{ display: showUserAssignmentModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-plus"></i> Assign User ke Role
            </h5>
            <button type="button" class="btn-close" @click="showUserAssignmentModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Pilih Pegawai *</label>
                <select v-model="userAssignment.nip" class="form-select" :class="{ 'is-invalid': errors.nip }">
                  <option value="">-- Pilih Pegawai --</option>
                  <option
                    v-for="pegawai in availablePegawai"
                    :key="pegawai.nip"
                    :value="pegawai.nip"
                  >
                    {{pegawai.nama}} ({{pegawai.nip}})
                  </option>
                </select>
                <div v-if="errors.nip" class="invalid-feedback">
                  {{ errors.nip }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Pilih Role *</label>
                <select v-model="userAssignment.id_role" class="form-select" :class="{ 'is-invalid': errors.id_role }">
                  <option value="">-- Pilih Role --</option>
                  <option
                    v-for="role in roleStore.roles"
                    :key="role.id_role"
                    :value="role.id_role"
                  >
                    {{ role.nama_role }}
                  </option>
                </select>
                <div v-if="errors.id_role" class="invalid-feedback">
                  {{ errors.id_role }}
                </div>
              </div>
            </div>
            <div class="mt-3">
              <small class="text-muted">
                <i class="fas fa-info-circle"></i>
                User akan mendapatkan akses ke semua menu yang ditetapkan untuk role ini.
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showUserAssignmentModal = false">Batal</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveUserAssignment"
              :disabled="roleStore.loading"
            >
              <span v-if="roleStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              Assign User
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Role Menus Modal -->
    <div
      class="modal fade"
      :class="{ show: showMenusModal }"
      :style="{ display: showMenusModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-list"></i> Menu untuk Role: {{ selectedRole?.nama_role }}
            </h5>
            <button type="button" class="btn-close" @click="showMenusModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="roleStore.loading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2">Memuat...</span>
            </div>

            <div v-else-if="roleMenus.length === 0" class="text-center py-3">
              <i class="fas fa-list fa-2x text-muted mb-2"></i>
              <p class="text-muted">Belum ada menu dalam role ini</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Nama Menu</th>
                    <th>Route</th>
                    <th>Icon</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="menu in roleMenus" :key="menu.id_menu">
                    <td>{{ menu.nama_menu }}</td>
                    <td><code>{{ menu.route || '-' }}</code></td>
                    <td><i :class="menu.icon || 'fas fa-circle'"></i></td>
                    <td class="text-center">
                      <span class="badge" :class="menu.is_active ? 'bg-success' : 'bg-secondary'">
                        {{ menu.is_active ? 'Aktif' : 'Non-aktif' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showMenusModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoleStore } from '../../stores/role'
import { useAuthStore } from '../../stores/auth'
import { showToast } from '../../utils/notification'

const roleStore = useRoleStore()
const authStore = useAuthStore()

// State
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showUsersModal = ref(false)
const showMenusModal = ref(false)
const showUserAssignmentModal = ref(false)
const isEditing = ref(false)
const error = ref(null)
const userSearchQuery = ref('')

const formData = ref({
  id_role: null,
  nama_role: '',
  deskripsi: ''
})

const userAssignment = ref({
  nip: '',
  id_role: ''
})

const errors = ref({})
const roleToDelete = ref(null)
const selectedRole = ref(null)
const roleUsers = ref([])
const roleMenus = ref([])


// Computed
const getUserCountForRole = (roleId) => {
  return roleStore.userRoles.filter(ur => ur.id_role === roleId).length
}

const filteredRoleUsers = computed(() => {
  if (!userSearchQuery.value) return roleUsers.value

  const query = userSearchQuery.value.toLowerCase()
  return roleUsers.value.filter(user =>
    user.nama.toLowerCase().includes(query) ||
    user.nip.includes(query)
  )
})

const availablePegawai = computed(() => {
  // Return pegawai that don't have roles yet or allow multiple roles
  return roleStore.pegawai
})

// Methods
const fetchRoles = async () => {
  try {
    error.value = null
    await roleStore.fetchAllRoles()
    await roleStore.fetchAllUserRoles()
  } catch (err) {
    error.value = 'Gagal memuat data role'
    console.error('Error fetching roles:', err)
  }
}

const fetchPegawai = async () => {
  try {
    await roleStore.fetchAllPegawai()
  } catch (err) {
    console.error('Error fetching pegawai:', err)
  }
}

const editRole = (role) => {
  isEditing.value = true
  formData.value = { ...role }
  showCreateModal.value = true
  errors.value = {}
}

const closeModal = () => {
  showCreateModal.value = false
  isEditing.value = false
  formData.value = {
    id_role: null,
    nama_role: '',
    deskripsi: ''
  }
  errors.value = {}
}

const validateRoleForm = () => {
  errors.value = {}

  if (!formData.value.nama_role.trim()) {
    errors.value.nama_role = 'Nama role wajib diisi'
  }

  return Object.keys(errors.value).length === 0
}

const saveRole = async () => {
  if (!validateRoleForm()) return

  try {
    const roleData = { ...formData.value }
    delete roleData.id_role

    let result
    if (isEditing.value) {
      result = await roleStore.updateRole(formData.value.id_role, roleData)
    } else {
      result = await roleStore.createRole(roleData)
    }

    if (result.success) {
      showToast(
        isEditing.value ? 'Role berhasil diperbarui' : 'Role berhasil ditambahkan',
        'success'
      )
      closeModal()
      await fetchRoles()
    } else {
      showToast(result.error || 'Gagal menyimpan role', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menyimpan role', 'error')
    console.error('Error saving role:', err)
  }
}

const confirmDelete = (role) => {
  roleToDelete.value = role
  showDeleteModal.value = true
}

const deleteRole = async () => {
  if (!roleToDelete.value) return

  try {
    const result = await roleStore.deleteRole(roleToDelete.value.id_role)

    if (result.success) {
      showToast('Role berhasil dihapus', 'success')
      showDeleteModal.value = false
      roleToDelete.value = null
      await fetchRoles()
    } else {
      showToast(result.error || 'Gagal menghapus role', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menghapus role', 'error')
    console.error('Error deleting role:', err)
  }
}

const viewRoleUsers = async (role) => {
  selectedRole.value = role

  try {
    // Get users in this role
    const userInRole = roleStore.getUsersInRole(role.id_role)

    if (userInRole.length === 0) {
      // Fetch pegawai data if not available
      if (roleStore.pegawai.length === 0) {
        await fetchPegawai()
      }
    }

    roleUsers.value = userInRole
    showUsersModal.value = true
  } catch (err) {
    showToast('Gagal memuat data pengguna', 'error')
    console.error('Error fetching role users:', err)
  }
}

const viewRoleMenus = async (role) => {
  selectedRole.value = role

  try {
    // Fetch menus for this role
    const result = await roleStore.getRolePermissions(role.id_role)
    
    if (result.success && result.data) {
      // Extract menu data from role_menu relationships
      roleMenus.value = result.data.map(rm => rm.menu).filter(menu => menu != null)
    } else {
      roleMenus.value = []
    }
    
    showMenusModal.value = true
  } catch (err) {
    showToast('Gagal memuat data menu', 'error')
    console.error('Error fetching role menus:', err)
    roleMenus.value = []
  }
}


const removeUserFromRole = async (user) => {
  if (!selectedRole.value) return

  try {
    const result = await roleStore.removeRoleFromPegawai(user.nip, selectedRole.value.id_role)

    if (result.success) {
      showToast('User berhasil dihapus dari role', 'success')

      // Update local data
      roleUsers.value = roleUsers.value.filter(u => u.nip !== user.nip)

      // Refresh data
      await fetchRoles()
    } else {
      showToast(result.error || 'Gagal menghapus user dari role', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menghapus user dari role', 'error')
    console.error('Error removing user from role:', err)
  }
}

const validateUserAssignment = () => {
  errors.value = {}

  if (!userAssignment.value.nip) {
    errors.value.nip = 'Pegawai wajib dipilih'
  }

  if (!userAssignment.value.id_role) {
    errors.value.id_role = 'Role wajib dipilih'
  }

  return Object.keys(errors.value).length === 0
}

const saveUserAssignment = async () => {
  if (!validateUserAssignment()) return

  try {
    const userId = authStore.user?.id_user || 1 // Use current user ID or default

    const result = await roleStore.assignRoleToPegawai(
      userAssignment.value.nip,
      userAssignment.value.id_role,
      userId
    )

    if (result.success) {
      showToast('User berhasil ditambahkan ke role', 'success')

      // Reset form and close modal
      userAssignment.value = { nip: '', id_role: '' }
      showUserAssignmentModal.value = false

      // Refresh data
      await fetchRoles()
    } else {
      showToast(result.error || 'Gagal menambahkan user ke role', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menambahkan user ke role', 'error')
    console.error('Error assigning user to role:', err)
  }
}

const assignUserToRole = () => {
  showUsersModal.value = false
  showUserAssignmentModal.value = true
  userAssignment.value.id_role = selectedRole.value?.id_role || ''
}

const managePermissions = (role) => {
  showToast('Fitur permissions akan segera hadir', 'info')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  await fetchRoles()
  await fetchPegawai()
})
</script>

<style scoped>
.role-management {
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.header-text {
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.role-card {
  transition: all 0.3s ease;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  overflow: hidden;
}

.role-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.role-card .card-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  padding: 1.5rem;
}

.role-card .card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
}

.role-card .card-body {
  padding: 2rem;
}

.stat-box {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-box h4 {
  margin-bottom: 0.25rem;
  font-weight: 800;
  font-size: 1.5rem;
}

.role-card .card-footer {
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  padding: 1rem 1.5rem;
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
  overflow: hidden;
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
}

.modal-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
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

.invalid-feedback {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #6b7280;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-outline-primary {
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
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
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-info:hover {
  background: #06b6d4;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}

.btn-outline-danger {
  background: transparent;
  border: 2px solid #ef4444;
  color: #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-light {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #374151;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-light:hover {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.alert-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.table-responsive {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.table {
  margin-bottom: 0;
  background: white;
}

.table th {
  border-top: none;
  font-weight: 700;
  color: #374151;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
  border-top: 1px solid #e5e7eb;
}

.table tbody tr:hover {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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

.spinner-border {
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

.text-primary {
  color: #3b82f6 !important;
  font-weight: 700;
}

.text-info {
  color: #06b6d4 !important;
  font-weight: 700;
}

@media (max-width: 768px) {
  .role-management {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .btn-group .btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .modal-dialog {
    margin: 1rem;
  }

  .modal-header, .modal-body, .modal-footer {
    padding: 1rem 1.5rem;
  }
}

/* Custom styles for full page layout */
.role-management .row.g-4 {
  padding: 0 0.5rem;
}

@media (max-width: 768px) {
  .role-management {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .row.g-4 {
    gap: 1rem;
  }

  .col-md-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 576px) {
  .role-management {
    padding: 0.5rem;
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

  .btn-group {
    flex-direction: column;
    width: 100%;
  }

  .btn-group .btn {
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .row.g-4 {
    gap: 0.75rem;
  }

  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>