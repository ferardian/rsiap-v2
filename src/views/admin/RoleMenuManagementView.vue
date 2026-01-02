<template>
  <div class="role-menu-management">
    <!-- Beautiful Header -->
    <div class="hero-header">
      <div class="layout-container">
        <div class="header-flex">
          <div class="header-content">
            <h1 class="hero-title">
              <i class="fas fa-shield-alt hero-icon"></i>
              Manajemen Role-Menu
            </h1>
            <p class="hero-subtitle">Kelola hak akses pengguna dengan sistem permission yang fleksibel dan aman</p>
          </div>
          <div class="header-actions">
            <button class="btn-back-hero" @click="$router.back()">
              <i class="fas fa-arrow-left me-2"></i>Kembali
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="layout-container">
        <div class="stats-grid-wrapper">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>{{ roles.length }}</h3>
              <p>Total Roles</p>
            </div>
          </div>
          <div class="stat-card stat-success">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>{{ totalEnabledPermissions }}</h3>
              <p>Permissions Enabled</p>
            </div>
          </div>
          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <i class="fas fa-sitemap"></i>
            </div>
            <div class="stat-content">
              <h3>{{ totalMenus }}</h3>
              <p>Total Menus</p>
            </div>
          </div>
          <div class="stat-card stat-info">
            <div class="stat-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="stat-content">
              <h3>{{ menuLevels }}</h3>
              <p>Menu Levels</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Selection Section -->
    <div class="role-selection-section">
      <div class="layout-container">
        <div class="role-selector-card-modern">
          <div class="card-header-gradient">
            <h3><i class="fas fa-user-tag me-2"></i>Pilih Role</h3>
            <p class="mb-0">Pilih role yang ingin Anda kelola permissionnya</p>
          </div>
          <div class="card-body-modern">
            <div class="selection-grid">
              <div class="selection-col">
                <div class="select-wrapper">
                  <select
                    v-model="selectedRole"
                    class="modern-select"
                    @change="loadMenuPermissions"
                  >
                    <option value="">🎯 Pilih Role</option>
                    <option v-for="role in roles" :key="role.id_role" :value="role.id_role">
                      👤 {{ role.nama_role }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="selection-col">
                <div class="action-buttons">
                  <button
                    class="btn-modern btn-expand"
                    @click="expandAll"
                    :disabled="!selectedRole || loading"
                    title="Expand All Menus"
                  >
                    <i class="fas fa-expand"></i>
                  </button>
                  <button
                    class="btn-modern btn-collapse"
                    @click="collapseAll"
                    :disabled="!selectedRole || loading"
                    title="Collapse All Menus"
                  >
                    <i class="fas fa-compress"></i>
                  </button>
                  <button
                    class="btn-modern btn-copy"
                    @click="showCopyModal = true"
                    :disabled="!selectedRole"
                    title="Copy Permissions"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                  <button
                    class="btn-modern btn-reset"
                    @click="resetAllPermissions"
                    :disabled="!selectedRole || loading"
                    title="Reset All Permissions"
                  >
                    <i class="fas fa-undo"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Permissions Section -->
    <div v-if="selectedRole" class="permissions-section">
      <div class="layout-container">
        <div class="permissions-container-modern">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="loading-animation">
              <div class="loader"></div>
              <h4>Sedang Memuat...</h4>
              <p>Mengambil data permissions untuk role</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <div class="error-animation">
              <i class="fas fa-exclamation-triangle"></i>
              <h4>Terjadi Kesalahan</h4>
              <p>{{ error }}</p>
              <button class="btn btn-retry" @click="loadMenuPermissions">
                <i class="fas fa-redo me-2"></i>Coba Lagi
              </button>
            </div>
          </div>

          <!-- Permission Content -->
          <div v-else class="permission-content">
            <!-- Save Bar -->
            <div class="save-bar">
              <div class="save-info">
                <h4><i class="fas fa-cog me-2"></i>Pengaturan Permissions</h4>
                <div class="save-stats">
                  <span class="badge bg-modified" v-if="hasChanges">
                    <i class="fas fa-edit me-1"></i>{{ modifiedCount }} Modified
                  </span>
                  <span class="badge bg-primary">
                    <i class="fas fa-check me-1"></i>{{ totalEnabledPermissions }} Enabled
                  </span>
                </div>
              </div>
              <button
                class="btn-save-primary"
                @click="savePermissions"
                :disabled="saving || !hasChanges"
              >
                <i class="fas fa-save me-2"></i>
                {{ saving ? '💾 Menyimpan...' : '💾 Simpan Perubahan' }}
              </button>
            </div>

            <!-- Menu Tree -->
            <div class="menu-tree-modern">
              <MenuPermissionNode
                v-for="menu in menuTree"
                :key="menu.id_menu"
                :menu="menu"
                @permission-changed="handlePermissionChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy Modal -->
    <div v-if="showCopyModal" class="modal-backdrop" @click.self="showCopyModal = false">
      <div class="modal-container modal-copy">
        <div class="modal-header-gradient">
          <h3><i class="fas fa-copy me-2"></i>Copy Permissions</h3>
          <button class="btn-close-modal" @click="showCopyModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="copy-content">
            <div class="copy-icon">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="copy-form">
              <div class="form-group-modern">
                <label>📤 Role Sumber</label>
                <select v-model="copySourceRole" class="form-control-modern">
                  <option value="">Pilih Role Sumber</option>
                  <option v-for="role in roles" :key="'src-'+role.id_role" :value="role.id_role">
                    {{ role.nama_role }}
                  </option>
                </select>
              </div>
              <div class="arrow-transfer">
                <i class="fas fa-arrow-down"></i>
              </div>
              <div class="form-group-modern">
                <label>📥 Role Target</label>
                <select v-model="copyTargetRole" class="form-control-modern">
                  <option value="">Pilih Role Target</option>
                  <option v-for="role in roles" :key="'tgt-'+role.id_role" :value="role.id_role">
                    {{ role.nama_role }}
                  </option>
                </select>
              </div>
            </div>
            <div class="alert-copy">
              <i class="fas fa-info-circle me-2"></i>
              Permission target akan ditimpa dengan permission dari role sumber
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showCopyModal = false">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button
            class="btn-confirm-copy"
            @click="copyPermissions"
            :disabled="!copySourceRole || !copyTargetRole || copySourceRole === copyTargetRole || copying"
          >
            <i class="fas fa-copy me-2"></i>
            {{ copying ? '🔄 Menyalin...' : '🚀 Salin Permission' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { menuService } from '../../services/menuService'
import { showToast } from '../../utils/notification'

// Components
import MenuPermissionNode from '../../components/admin/MenuPermissionNode.vue'

// State
const roles = ref([])
const selectedRole = ref('')
const menuTree = ref([])
const originalMenuTree = ref([])
const loading = ref(false)
const saving = ref(false)
const copying = ref(false)
const error = ref('')
const showCopyModal = ref(false)
const copySourceRole = ref('')
const copyTargetRole = ref('')

// Computed properties
const totalEnabledPermissions = computed(() => {
  let count = 0
  const countPermissions = (menus) => {
    menus.forEach(menu => {
      if (menu.permissions) {
        Object.values(menu.permissions).forEach(enabled => {
          if (enabled) count++
        })
      }
      if (menu.children) {
        countPermissions(menu.children)
      }
    })
  }
  countPermissions(menuTree.value)
  return count
})

const totalMenus = computed(() => {
  let count = 0
  const countMenus = (menus) => {
    menus.forEach(menu => {
      count++
      if (menu.children) {
        countMenus(menu.children)
      }
    })
  }
  countMenus(menuTree.value)
  return count
})

const menuLevels = computed(() => {
  const getMaxDepth = (menus, depth = 1) => {
    let maxDepth = depth
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        maxDepth = Math.max(maxDepth, getMaxDepth(menu.children, depth + 1))
      }
    })
    return maxDepth
  }
  return getMaxDepth(menuTree.value)
})

const hasChanges = computed(() => {
  return modifiedCount.value > 0
})

const modifiedCount = computed(() => {
  let count = 0
  const checkChanges = (current, original) => {
    current.forEach((menu, index) => {
      const origMenu = original[index]
      if (origMenu && menu.permissions && origMenu.permissions) {
        Object.keys(menu.permissions).forEach(key => {
          if (menu.permissions[key] !== origMenu.permissions[key]) {
            count++
          }
        })
      }
      if (menu.children && origMenu && origMenu.children) {
        checkChanges(menu.children, origMenu.children)
      }
    })
  }
  checkChanges(menuTree.value, originalMenuTree.value)
  return count
})

// Methods
const loadRoles = async () => {
  try {
    const response = await menuService.getRoleMenuSummary()
    roles.value = response.data || []
  } catch (err) {
    console.error('Error loading roles:', err)
    showToast('Gagal memuat data role', 'error')
  }
}

const loadMenuPermissions = async () => {
  if (!selectedRole.value) {
    menuTree.value = []
    originalMenuTree.value = []
    return
  }

  try {
    loading.value = true
    error.value = ''

    const response = await menuService.getRolePermissions(selectedRole.value)
    menuTree.value = response.data.menus || []
    // Deep copy for comparison
    originalMenuTree.value = JSON.parse(JSON.stringify(response.data.menus || []))

  } catch (err) {
    error.value = 'Gagal memuat permissions'
    console.error('Error loading permissions:', err)
    showToast(error.value, 'error')
  } finally {
    loading.value = false
  }
}

const handlePermissionChange = (menu) => {
  console.log('Permission changed:', menu.nama_menu, menu.permissions)
}

const savePermissions = async () => {
  try {
    saving.value = true

    const permissions = []
    collectPermissions(menuTree.value, permissions)

    await menuService.updateRolePermissions(selectedRole.value, permissions)

    // Update original copy after successful save
    originalMenuTree.value = JSON.parse(JSON.stringify(menuTree.value))

    showToast('Permissions berhasil disimpan', 'success')

  } catch (err) {
    console.error('Error saving permissions:', err)
    showToast('Gagal menyimpan permissions', 'error')
  } finally {
    saving.value = false
  }
}

const collectPermissions = (menus, permissionsArray) => {
  menus.forEach(menu => {
    permissionsArray.push({
      id_menu: menu.id_menu,
      ...menu.permissions
    })

    if (menu.children) {
      collectPermissions(menu.children, permissionsArray)
    }
  })
}

const copyPermissions = async () => {
  if (!copySourceRole.value || !copyTargetRole.value) {
    showToast('Pilih role sumber dan target', 'error')
    return
  }

  if (copySourceRole.value === copyTargetRole.value) {
    showToast('Role sumber dan target tidak boleh sama', 'error')
    return
  }

  try {
    copying.value = true

    await menuService.copyRolePermissions(copySourceRole.value, copyTargetRole.value)

    showToast('Permission berhasil disalin', 'success')
    showCopyModal.value = false

    // Reload if current role is the target
    if (selectedRole.value === copyTargetRole.value) {
      await loadMenuPermissions()
    }

  } catch (err) {
    console.error('Error copying permissions:', err)
    showToast('Gagal menyalin permission', 'error')
  } finally {
    copying.value = false
  }
}

const expandAll = () => {
  setExpandState(menuTree.value, true)
}

const collapseAll = () => {
  setExpandState(menuTree.value, false)
}

const setExpandState = (menus, expanded) => {
  menus.forEach(menu => {
    if (menu.children) {
      menu.expanded = expanded
      setExpandState(menu.children, expanded)
    }
  })
}

const resetAllPermissions = () => {
  if (!confirm('Apakah Anda yakin ingin mereset semua permissions menjadi false?')) {
    return
  }

  const resetMenuPermissions = (menus) => {
    menus.forEach(menu => {
      if (menu.permissions) {
        Object.keys(menu.permissions).forEach(key => {
          menu.permissions[key] = false
        })
      }
      if (menu.children) {
        resetMenuPermissions(menu.children)
      }
    })
  }

  resetMenuPermissions(menuTree.value)
  showToast('Semua permissions telah direset', 'info')
}

// Lifecycle
onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.role-menu-management {
  background-color: #f1f5f9;
  min-height: 100%;
  padding-bottom: 2rem;
}

/* Layout Utilities */
.layout-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero Header */
.hero-header {
  background: white;
  padding: 2rem 0 2rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-title {
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hero-icon {
  color: #3b82f6;
  background: #eff6ff;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.1rem;
}

.hero-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 0;
  margin-left: 3.5rem;
}

.btn-back-hero {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-back-hero:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.stats-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-primary .stat-icon { background: #eff6ff; color: #3b82f6; }
.stat-success .stat-icon { background: #f0fdf4; color: #22c55e; }
.stat-warning .stat-icon { background: #fffbeb; color: #f59e0b; }
.stat-info .stat-icon { background: #f0f9ff; color: #0ea5e9; }

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.stat-content p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Role Selection */
.role-selection-section {
  margin-bottom: 2rem;
}

.role-selector-card-modern {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  padding: 1.5rem 2rem;
  color: white;
}

.card-header-gradient h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
}

.card-header-gradient p {
  opacity: 0.9;
  font-size: 0.9rem;
}

.card-body-modern {
  padding: 1.5rem 2rem;
}

.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: center;
}

@media (max-width: 768px) {
  .selection-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    justify-content: flex-start;
    margin-top: 1rem;
  }
}

.select-wrapper {
  position: relative;
}

.modern-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  color: #1e293b;
  background-color: #f8fafc;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px 12px;
}

.modern-select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-modern {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.btn-modern:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-modern:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(110%);
}

.btn-expand { background: #3b82f6; }
.btn-collapse { background: #64748b; }
.btn-copy { background: #f59e0b; }
.btn-reset { background: #ef4444; }

/* Permissions Section */
.permissions-section {
  /* Padding handled by layout-container */
}

.permissions-container-modern {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 400px;
}

.loading-state, .error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-animation h4, .error-animation h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.save-bar {
  background: #f8fafc;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
}

.save-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.save-stats {
  display: flex;
  gap: 0.75rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
}

.bg-modified { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
.bg-primary { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }

.btn-save-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.btn-save-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-save-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.menu-tree-modern {
  padding: 2rem;
}

/* Menu Node Styles - Moved to MenuPermissionNode.vue */

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.modal-header-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 1.25rem 1.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-gradient h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 2rem;
}

.copy-content {
  text-align: center;
}

.copy-icon {
  width: 64px;
  height: 64px;
  background: #fff7ed;
  color: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin: 0 auto 1.5rem;
}

.arrow-transfer {
  color: #cbd5e1;
  font-size: 1.5rem;
  margin: 1rem 0;
}

.form-group-modern {
  text-align: left;
}

.form-group-modern label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #475569;
}

.form-control-modern {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.alert-copy {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  color: #1e40af;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 1.25rem 1.5rem; /* Fixed typo padding */
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm-copy {
  background: #f59e0b;
  border: none;
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-confirm-copy:hover:not(:disabled) {
  background: #d97706;
}

.btn-confirm-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-header {
    padding: 1.5rem;
  }
  
  .hero-title {
    font-size: 1.25rem;
  }
  
  .hero-subtitle {
     margin-left: 0;
     margin-top: 0.5rem;
  }
  
  .permissions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
}
</style>
