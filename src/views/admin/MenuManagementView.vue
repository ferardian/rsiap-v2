<template>
  <div class="menu-management">
    <div class="page-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="page-title">📋 Kelola Menu</h1>
          <p class="page-subtitle">Manajemen menu dan hak akses sistem</p>
        </div>
        <div class="header-right">
          <button v-if="isMobile" class="btn btn-filter-toggle" @click="showFilters = !showFilters">
            <i class="fas" :class="showFilters ? 'fa-filter-circle-xmark' : 'fa-filter'"></i>
            {{ showFilters ? 'Sembunyikan' : 'Filter' }}
          </button>
          <button class="btn btn-primary btn-add-menu" @click="showCreateModal = true">
            <i class="fas fa-plus"></i>
            <span>{{ isMobile ? 'Tambah' : 'Tambah Menu' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter dan Search -->
    <transition name="animate-fade-down">
      <div v-if="!isMobile || showFilters" class="card mb-3 flex-shrink-0 filter-card">
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
                      {{ parent.nama_menu }} ({{ parent.platform === 'mobile' ? 'Mobile' : 'Web' }})
                    </option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>
            </div>
            <div class="col-6 col-lg-2">
              <div class="filter-group">
                <label class="filter-label">
                  <i class="fas fa-laptop-code"></i> Platform
                </label>
                <div class="select-wrapper">
                  <select v-model="filterPlatform" class="form-select modern-select" @change="fetchMenus">
                    <option value="">Semua</option>
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                  </select>
                  <i class="fas fa-chevron-down select-arrow"></i>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-1">
              <div class="filter-actions">
                <button class="btn-reset w-100" @click="resetFilters">
                  <i class="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Menu Table -->
    <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
      <div class="card-body d-flex flex-column">
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

        <div v-else class="table-responsive flex-grow-1">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th @click="sortBy('urutan')" style="cursor: pointer;">
                  Urutan <i class="fas fa-sort"></i>
                </th>
                <th @click="sortBy('nama_menu')" style="cursor: pointer;">
                  Nama Menu <i class="fas fa-sort"></i>
                </th>
                <th class="d-none d-md-table-cell">Icon</th>
                <th class="d-none d-md-table-cell">Route</th>
                <th class="d-none d-md-table-cell">Platform</th>
                <th class="d-none d-md-table-cell">Parent</th>
                <th class="d-none d-md-table-cell">Status</th>
                <th class="text-center" style="width: 110px; min-width: 110px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="menu in paginatedMenus" :key="menu.id_menu">
                <td>{{ menu.urutan }}</td>
                <td>
                  <div class="d-flex align-items-center flex-wrap gap-2">
                    <span class="menu-name fw-semibold text-dark">{{ menu.nama_menu }}</span>
                    <span v-if="menu.children && menu.children.length > 0" class="badge bg-info">
                      {{ menu.children.length }} sub
                    </span>
                  </div>
                  <!-- Mobile-only compact metadata (Platform & Status) -->
                  <div class="d-md-none mt-1 d-flex gap-1 align-items-center flex-wrap">
                    <span :class="['badge rounded-pill', menu.platform === 'mobile' ? 'bg-indigo' : 'bg-blue']" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;">
                      {{ menu.platform === 'mobile' ? '📱 Mobile' : '💻 Web' }}
                    </span>
                    <span :class="['badge', menu.is_active ? 'bg-success' : 'bg-danger']" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;">
                      {{ menu.is_active ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </div>
                </td>
                <td class="d-none d-md-table-cell"><span class="menu-icon">{{ menu.icon }}</span></td>
                <td class="d-none d-md-table-cell"><code class="text-muted">{{ menu.route || '-' }}</code></td>
                <td class="d-none d-md-table-cell">
                  <span :class="['badge rounded-pill', menu.platform === 'mobile' ? 'bg-indigo' : 'bg-blue']">
                    {{ menu.platform === 'mobile' ? '📱 Mobile' : '💻 Web' }}
                  </span>
                </td>
                <td class="d-none d-md-table-cell">{{ menu.parent?.nama_menu || '-' }}</td>
                <td class="d-none d-md-table-cell">
                  <span :class="['badge', menu.is_active ? 'bg-success' : 'bg-danger']">
                    {{ menu.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td class="text-center" style="width: 110px; min-width: 110px;">
                  <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-outline-primary action-btn-custom" @click="editMenu(menu)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-outline-info action-btn-custom"
                      @click="viewMenuPermissions(menu)"
                      title="Permissions"
                    >
                      <i class="fas fa-key"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger action-btn-custom"
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
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3 flex-shrink-0 pagination-container">
          <div class="text-muted pagination-summary">
            Menampilkan {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredMenus.length) }}
            dari {{ filteredMenus.length }} menu
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination mb-0 justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage = 1" title="Halaman Pertama">
                  <span class="d-none d-sm-inline">First</span>
                  <span class="d-inline d-sm-none">«</span>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--" title="Halaman Sebelumnya">
                  <span class="d-none d-sm-inline">Previous</span>
                  <span class="d-inline d-sm-none">‹</span>
                </a>
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
                <a class="page-link" href="#" @click.prevent="currentPage++" title="Halaman Selanjutnya">
                  <span class="d-none d-sm-inline">Next</span>
                  <span class="d-inline d-sm-none">›</span>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage = totalPages" title="Halaman Terakhir">
                  <span class="d-none d-sm-inline">Last</span>
                  <span class="d-inline d-sm-none">»</span>
                </a>
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

        <div class="sidebar-body" ref="sidebarBody">
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
              <label class="form-label">Platform *</label>
              <div class="select-wrapper">
                <select v-model="formData.platform" class="form-select" required>
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                </select>
                <i class="fas fa-laptop-code select-icon"></i>
              </div>
              <div class="form-help">Pilih target platform untuk menu ini</div>
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
      <div class="modal-dialog modal-dialog-centered">
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

    <!-- Menu Permissions Modal -->
    <div
      class="modal fade"
      :class="{ show: showPermissionsModal }"
      :style="{ display: showPermissionsModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div :class="['modal-header header-permissions', selectedMenuForPermissions?.platform === 'mobile' ? 'header-mobile' : 'header-web']">
            <h5 class="modal-title d-flex align-items-center gap-2 flex-wrap">
              <span>🔐 Kelola Hak Akses: {{ selectedMenuForPermissions?.nama_menu }}</span>
              <span class="badge-platform-header">
                {{ selectedMenuForPermissions?.platform === 'mobile' ? '📱 Mobile' : '💻 Web' }}
              </span>
            </h5>
            <button type="button" class="btn-close-modal-header" @click="showPermissionsModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <!-- Tab Headers -->
            <ul class="nav nav-pills modal-tabs mb-4 d-flex gap-2">
              <li class="nav-item">
                <button 
                  type="button"
                  :class="['tab-btn', activePermissionsTab === 'current' ? 'active' : '']"
                  @click="activePermissionsTab = 'current'"
                >
                  <i class="fas fa-user-shield me-2"></i>Akses Saat Ini
                </button>
              </li>
              <li class="nav-item">
                <button 
                  type="button"
                  :class="['tab-btn', activePermissionsTab === 'bulk' ? 'active' : '']"
                  @click="activePermissionsTab = 'bulk'"
                >
                  <i class="fas fa-plus-circle me-2"></i>Tambah Akses Massal
                </button>
              </li>
            </ul>

            <div v-if="loadingPermissions" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Memuat data hak akses role...</p>
            </div>

            <!-- Tab 1: Current Access -->
            <div v-else-if="activePermissionsTab === 'current'">
              <div v-if="menuRoles.length === 0" class="text-center py-5">
                <i class="fas fa-user-shield fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Belum ada role yang memiliki akses</h5>
                <p class="text-muted">Gunakan tab <strong>Tambah Akses Massal</strong> untuk memberikan akses menu ini.</p>
              </div>

              <div v-else class="roles-list">
                <div v-for="role in menuRoles" :key="role.id_role" class="role-item">
                  <div class="role-details">
                    <h6 class="role-name-text">{{ role.nama_role }}</h6>
                    <p class="role-description-text" v-if="role.deskripsi">{{ role.deskripsi }}</p>
                  </div>
                  <div class="role-permissions-badges">
                    <div class="badges-wrapper">
                      <span v-if="role.pivot.can_view" class="badge-perm badge-view">View</span>
                      <span v-if="role.pivot.can_create" class="badge-perm badge-create">Create</span>
                      <span v-if="role.pivot.can_update" class="badge-perm badge-update">Update</span>
                      <span v-if="role.pivot.can_delete" class="badge-perm badge-delete">Delete</span>
                      <span v-if="role.pivot.can_export" class="badge-perm badge-export">Export</span>
                      <span v-if="role.pivot.can_import" class="badge-perm badge-import">Import</span>
                    </div>
                  </div>
                  <div class="role-actions">
                    <button
                      class="btn-revoke-role"
                      @click="confirmRevoke(role)"
                      title="Copot Akses"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Bulk Assign -->
            <div v-else-if="activePermissionsTab === 'bulk'">
              <div class="row g-4">
                <!-- Column 1: Roles Selection -->
                <div class="col-12 col-md-6 d-flex flex-column" style="min-height: 380px;">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label-custom mb-0">
                      <i class="fas fa-users me-1"></i> Pilih Role Target
                    </label>
                    <button
                      v-if="availableRolesToAssign.length > 0"
                      type="button"
                      class="btn btn-sm btn-link p-0 text-decoration-none fw-semibold text-primary"
                      @click="toggleSelectAllRoles"
                      style="font-size: 0.78rem;"
                    >
                      <i class="fas me-1" :class="isAllRolesSelected ? 'fa-check-square text-primary' : 'fa-square text-muted'"></i>
                      {{ isAllRolesSelected ? 'Batalkan Semua' : 'Pilih Semua (' + availableRolesToAssign.length + ')' }}
                    </button>
                  </div>
                  
                  <!-- Role Search -->
                  <div class="input-group modern-input mb-3" style="max-height: 42px;">
                    <span class="input-group-text bg-transparent border-0">
                      <i class="fas fa-search text-muted"></i>
                    </span>
                    <input
                      v-model="bulkSearchQuery"
                      type="text"
                      class="form-control border-0 bg-transparent ps-0"
                      placeholder="Cari nama role..."
                      style="box-shadow: none;"
                    />
                  </div>

                  <!-- Roles Checklist -->
                  <div class="roles-checklist-container flex-grow-1">
                    <div v-if="availableRolesToAssign.length === 0" class="text-center py-5 text-muted">
                      <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                      <p class="mb-0">Semua role aktif sudah memiliki akses ke menu ini.</p>
                    </div>
                    
                    <div v-else class="checklist-grid">
                      <label 
                        v-for="role in availableRolesToAssign" 
                        :key="role.id_role" 
                        :class="['checklist-item-card', selectedBulkRoles.includes(role.id_role) ? 'checked' : '']"
                        style="margin-bottom: 0;"
                      >
                        <input
                          type="checkbox"
                          :value="role.id_role"
                          v-model="selectedBulkRoles"
                          class="d-none"
                        />
                        <div class="checklist-item-content">
                          <div class="item-checkbox-ui">
                            <i class="fas" :class="selectedBulkRoles.includes(role.id_role) ? 'fa-check-square text-success' : 'fa-square text-muted'"></i>
                          </div>
                          <div class="item-text">
                            <span class="role-title-text">{{ role.nama_role }}</span>
                            <span class="role-desc-text text-muted" v-if="role.deskripsi">{{ role.deskripsi }}</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Column 2: Permissions Configuration -->
                <div class="col-12 col-md-6">
                  <div class="card border-0 bg-light-gray p-4 h-100 rounded-3" style="background-color: #f8fafc; border: 1px solid #e2e8f0;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <label class="form-label-custom mb-0">
                        <i class="fas fa-cog me-1"></i> Hak Akses Default
                      </label>
                      <button
                        type="button"
                        class="btn btn-sm btn-link p-0 text-decoration-none fw-semibold text-muted"
                        @click="toggleAllDefaultPermissions"
                        style="font-size: 0.78rem;"
                      >
                        <i class="fas me-1" :class="isAllPermissionsActive ? 'fa-toggle-on text-success' : 'fa-toggle-off'"></i>
                        {{ isAllPermissionsActive ? 'Matikan Semua' : 'Aktifkan Semua' }}
                      </button>
                    </div>

                    <div class="permission-toggles-grid">
                      <div class="permission-toggle-item">
                        <div class="toggle-control">
                          <div 
                            class="toggle-switch-sm" 
                            :class="{ active: bulkPermissions.can_view }"
                            @click="bulkPermissions.can_view = !bulkPermissions.can_view"
                          >
                            <div class="toggle-slider-sm"></div>
                          </div>
                        </div>
                        <div class="toggle-label-desc">
                          <span class="perm-title text-view">Can View</span>
                          <span class="perm-desc">Melihat menu di navigasi utama</span>
                        </div>
                      </div>

                      <div class="permission-toggle-item">
                        <div class="toggle-control">
                          <div 
                            class="toggle-switch-sm" 
                            :class="{ active: bulkPermissions.can_create }"
                            @click="bulkPermissions.can_create = !bulkPermissions.can_create"
                          >
                            <div class="toggle-slider-sm"></div>
                          </div>
                        </div>
                        <div class="toggle-label-desc">
                          <span class="perm-title text-create">Can Create</span>
                          <span class="perm-desc">Menambah/menyimpan data baru</span>
                        </div>
                      </div>

                      <div class="permission-toggle-item">
                        <div class="toggle-control">
                          <div 
                            class="toggle-switch-sm" 
                            :class="{ active: bulkPermissions.can_update }"
                            @click="bulkPermissions.can_update = !bulkPermissions.can_update"
                          >
                            <div class="toggle-slider-sm"></div>
                          </div>
                        </div>
                        <div class="toggle-label-desc">
                          <span class="perm-title text-update">Can Update</span>
                          <span class="perm-desc">Mengubah/mengedit data yang ada</span>
                        </div>
                      </div>

                      <div class="permission-toggle-item">
                        <div class="toggle-control">
                          <div 
                            class="toggle-switch-sm" 
                            :class="{ active: bulkPermissions.can_delete }"
                            @click="bulkPermissions.can_delete = !bulkPermissions.can_delete"
                          >
                            <div class="toggle-slider-sm"></div>
                          </div>
                        </div>
                        <div class="toggle-label-desc">
                          <span class="perm-title text-delete">Can Delete</span>
                          <span class="perm-desc">Menghapus data dari sistem</span>
                        </div>
                      </div>

                      <div class="permission-toggle-item">
                        <div class="toggle-control">
                          <div 
                            class="toggle-switch-sm" 
                            :class="{ active: bulkPermissions.can_export }"
                            @click="bulkPermissions.can_export = !bulkPermissions.can_export"
                          >
                            <div class="toggle-slider-sm"></div>
                          </div>
                        </div>
                        <div class="toggle-label-desc">
                          <span class="perm-title text-export">Can Export</span>
                          <span class="perm-desc">Mengunduh/mengekspor data (PDF/Excel)</span>
                        </div>
                      </div>

                      <div class="permission-toggle-item">
                        <div class="toggle-control">
                          <div 
                            class="toggle-switch-sm" 
                            :class="{ active: bulkPermissions.can_import }"
                            @click="bulkPermissions.can_import = !bulkPermissions.can_import"
                          >
                            <div class="toggle-slider-sm"></div>
                          </div>
                        </div>
                        <div class="toggle-label-desc">
                          <span class="perm-title text-import">Can Import</span>
                          <span class="perm-desc">Mengunggah/mengimpor data dari luar</span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-top border-light d-flex flex-column gap-2">
                      <div class="selected-roles-badge-summary mb-2" v-if="selectedBulkRoles.length > 0">
                        Terpilih: <strong>{{ selectedBulkRoles.length }} role</strong>
                      </div>
                      <button
                        type="button"
                        class="btn-apply-bulk-assign"
                        @click="bulkAssignPermissions"
                        :disabled="selectedBulkRoles.length === 0 || bulkAssigning"
                      >
                        <i class="fas fa-check-double me-2" v-if="!bulkAssigning"></i>
                        <span v-else class="spinner-border spinner-border-sm me-2"></span>
                        Terapkan Akses Massal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer d-flex flex-row flex-nowrap justify-content-end align-items-center gap-2">
            <button type="button" class="btn btn-close-modal-custom m-0" @click="showPermissionsModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Revoke Modal -->
    <div
      class="modal fade"
      :class="{ show: showConfirmRevokeModal }"
      :style="{ display: showConfirmRevokeModal ? 'block' : 'none' }"
      tabindex="-1"
      style="z-index: 1060;"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">⚠️ Konfirmasi Copot Akses</h5>
            <button type="button" class="btn-close-modal-header" @click="showConfirmRevokeModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin mencopot hak akses role <strong>{{ roleToRevoke?.nama_role }}</strong> dari menu <strong>{{ selectedMenuForPermissions?.nama_menu }}</strong>?</p>
            <p class="text-danger"><small>* Tindakan ini akan menghapus seluruh permission role ini untuk menu terkait.</small></p>
          </div>
          <div class="modal-footer d-flex flex-row flex-nowrap justify-content-end align-items-center gap-2">
            <button type="button" class="btn btn-close-modal-custom m-0" @click="showConfirmRevokeModal = false">Batal</button>
            <button
              type="button"
              class="btn btn-confirm-danger m-0"
              @click="revokePermission"
              :disabled="revokingRole"
            >
              <span v-if="revokingRole" class="spinner-border spinner-border-sm me-2"></span>
              Copot Akses
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMenuStore } from '../../stores/menu'
import { useRoleStore } from '../../stores/role'
import { showToast } from '../../utils/notification'
import { menuService } from '../../services/menuService'

const menuStore = useMenuStore()
const roleStore = useRoleStore()
const sidebarBody = ref(null)

// Responsiveness
const isMobile = ref(false)
const showFilters = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// State
const searchQuery = ref('')
const filterActive = ref('')
const filterParent = ref('')
const filterPlatform = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('urutan')
const sortDirection = ref('asc')

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const error = ref(null)

const showPermissionsModal = ref(false)
const selectedMenuForPermissions = ref(null)
const menuRoles = ref([])
const loadingPermissions = ref(false)

const showConfirmRevokeModal = ref(false)
const roleToRevoke = ref(null)
const revokingRole = ref(false)

const activePermissionsTab = ref('current') // 'current' or 'bulk'
const selectedBulkRoles = ref([])
const bulkSearchQuery = ref('')
const bulkAssigning = ref(false)
const bulkPermissions = ref({
  can_view: true,
  can_create: true,
  can_update: true,
  can_delete: true,
  can_export: true,
  can_import: true
})

const formData = ref({
  id_menu: null,
  nama_menu: '',
  icon: '',
  route: '',
  parent_id: null,
  urutan: 1,
  is_active: true,
  platform: 'web'
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
  } else {
    // Show only main menus if no parent filter is applied (default state)
    // Only apply if search query is empty to avoid hiding searched sub-menus
    if (!searchQuery.value) {
      menus = menus.filter(menu => menu.parent_id === null)
    }
  }

  // Filter by platform
  if (filterPlatform.value !== '') {
    menus = menus.filter(menu => menu.platform === filterPlatform.value)
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
  filterPlatform.value = ''
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
    is_active: true,
    platform: 'web'
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
  // Ensure we strictly use booleans for the switch
  const isActive = formData.value.is_active;
  formData.value.is_active = !(isActive === true || isActive == 1);
}

const viewMenuPermissions = async (menu) => {
  selectedMenuForPermissions.value = menu
  showPermissionsModal.value = true
  activePermissionsTab.value = 'current'
  selectedBulkRoles.value = []
  bulkSearchQuery.value = ''
  bulkPermissions.value = {
    can_view: true,
    can_create: true,
    can_update: true,
    can_delete: true,
    can_export: true,
    can_import: true
  }
  await fetchMenuPermissions()
}

const fetchMenuPermissions = async () => {
  if (!selectedMenuForPermissions.value) return
  loadingPermissions.value = true
  try {
    const res = await menuService.getMenu(selectedMenuForPermissions.value.id_menu)
    if (res.success) {
      menuRoles.value = res.data.roles || []
    } else {
      showToast(res.error || 'Gagal memuat hak akses menu', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat memuat hak akses menu', 'error')
    console.error(err)
  } finally {
    loadingPermissions.value = false
  }
}

const availableRolesToAssign = computed(() => {
  const currentRoleIds = menuRoles.value.map(r => r.id_role)
  let filtered = roleStore.roles.filter(r => !currentRoleIds.includes(r.id_role) && r.is_active)
  
  if (bulkSearchQuery.value) {
    const q = bulkSearchQuery.value.toLowerCase()
    filtered = filtered.filter(r => r.nama_role.toLowerCase().includes(q))
  }
  
  return filtered
})

const isAllRolesSelected = computed(() => {
  if (availableRolesToAssign.value.length === 0) return false
  return availableRolesToAssign.value.every(r => selectedBulkRoles.value.includes(r.id_role))
})

const toggleSelectAllRoles = () => {
  const availableIds = availableRolesToAssign.value.map(r => r.id_role)
  if (isAllRolesSelected.value) {
    selectedBulkRoles.value = selectedBulkRoles.value.filter(id => !availableIds.includes(id))
  } else {
    selectedBulkRoles.value = Array.from(new Set([...selectedBulkRoles.value, ...availableIds]))
  }
}

const isAllPermissionsActive = computed(() => {
  return Object.values(bulkPermissions.value).every(val => val === true)
})

const toggleAllDefaultPermissions = () => {
  const targetState = !isAllPermissionsActive.value
  Object.keys(bulkPermissions.value).forEach(key => {
    bulkPermissions.value[key] = targetState
  })
}

const bulkAssignPermissions = async () => {
  if (selectedBulkRoles.value.length === 0) {
    showToast('Pilih minimal satu role terlebih dahulu', 'warning')
    return
  }
  
  bulkAssigning.value = true
  try {
    const payload = {
      id_roles: selectedBulkRoles.value,
      ...bulkPermissions.value
    }
    const res = await menuService.bulkAssignMenuPermissions(
      selectedMenuForPermissions.value.id_menu,
      payload
    )
    
    if (res.success) {
      showToast('Akses menu berhasil ditambahkan ke role terpilih', 'success')
      selectedBulkRoles.value = []
      activePermissionsTab.value = 'current'
      await fetchMenuPermissions()
      await fetchMenus()
    } else {
      showToast(res.error || 'Gagal menambahkan akses massal', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat menyimpan akses massal', 'error')
    console.error(err)
  } finally {
    bulkAssigning.value = false
  }
}

const confirmRevoke = (role) => {
  roleToRevoke.value = role
  showConfirmRevokeModal.value = true
}

const revokePermission = async () => {
  if (!selectedMenuForPermissions.value || !roleToRevoke.value) return
  revokingRole.value = true
  try {
    const res = await menuService.revokeRolePermission(
      selectedMenuForPermissions.value.id_menu,
      roleToRevoke.value.id_role
    )
    if (res.success) {
      showToast('Akses role berhasil dicopot', 'success')
      showConfirmRevokeModal.value = false
      roleToRevoke.value = null
      await fetchMenuPermissions()
      await fetchMenus()
    } else {
      showToast(res.error || 'Gagal mencopot akses role', 'error')
    }
  } catch (err) {
    showToast('Terjadi kesalahan saat mencopot akses role', 'error')
    console.error(err)
  } finally {
    revokingRole.value = false
  }
}

// Watch for filter changes to reset pagination
watch([filterActive, filterParent, filterPlatform], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  fetchMenus()
  checkMobile()
  roleStore.fetchAllRoles()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Watch for modal opening to scroll to top
watch(showCreateModal, (val) => {
  if (val) {
    setTimeout(() => {
      if (sidebarBody.value) {
        sidebarBody.value.scrollTop = 0
      }
    }, 50)
  }
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

.btn-filter-toggle {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.btn-filter-toggle:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-add-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
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
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
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

.action-btn-custom {
  width: 32px;
  height: 32px;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
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
  width: 95%;
}

.modal-dialog:not(.modal-lg) {
  max-width: 600px;
}

@media (min-width: 992px) {
  .modal-dialog.modal-lg {
    max-width: 800px;
  }
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
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
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
  font-weight: 700;
  color: #475569;
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
}

.table th:hover {
  background: #f1f5f9;
  cursor: pointer;
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

.bg-indigo {
  background: #6366f1 !important;
  color: white;
}

.bg-blue {
  background: #3b82f6 !important;
  color: white;
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

/* Sidebar Form Styles */
.sidebar-form {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100vh;
  background: white;
  z-index: 1050;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  border-left: 1px solid #e2e8f0;
}

.sidebar-form.active {
  right: 0;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.25rem;
}

.btn-sidebar-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.btn-sidebar-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.sidebar-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #f8fafc;
}

.sidebar-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  background: white;
  flex-shrink: 0;
}

/* Toggle Switch Styles */
.toggle-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
  background-color: #cbd5e1;
  border-radius: 13px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
}

.toggle-switch.active {
  background-color: #10b981;
  border-color: #059669;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  transition: all 0.3s ease;
}

.toggle-switch.active + .toggle-label {
  color: #10b981;
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

  .card {
    overflow: visible !important;
  }

  .card-body {
    padding: 1rem;
    overflow: visible !important;
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

  /* Pagination responsive */
  .pagination-container {
    flex-direction: column !important;
    gap: 1rem !important;
    align-items: center !important;
    text-align: center;
  }

  .pagination {
    width: auto;
    overflow-x: visible;
    flex-wrap: nowrap;
    justify-content: center !important;
    padding-bottom: 0;
  }

  .pagination .page-item {
    flex-shrink: 0;
  }

  .pagination .page-link {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }

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

  .btn-filter-toggle, .btn-add-menu {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .action-btn-custom {
    width: 28px !important;
    height: 28px !important;
    font-size: 0.75rem !important;
    border-radius: 4px !important;
  }

  .table td:last-child {
    padding: 0.5rem 0.25rem !important;
    min-width: 110px !important;
    width: 110px !important;
    text-align: center;
  }
}

/* Animations */
.animate-fade-down-enter-active {
  transition: all 0.3s ease-out;
}

.animate-fade-down-leave-active {
  transition: all 0.2s ease-in;
}

.animate-fade-down-enter-from,
.animate-fade-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
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

  /* Action buttons mobile */
  .btn-group-sm {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 2px;
  }

  .btn-group-sm > .btn {
    padding: 0.2rem 0.3rem !important;
    font-size: 0.65rem !important;
    border-radius: 3px !important;
    flex-shrink: 0;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-group-sm {
    gap: 1px !important;
  }

  /* Prevent column clipping and allow text wrapping */
  .table th, .table td {
    white-space: normal !important;
  }

  .table-responsive {
    margin: 0 -0.75rem;
    padding: 0 0.75rem;
    width: calc(100% + 1.5rem);
    overflow-x: auto !important;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    display: block;
  }

  .table td:last-child {
    padding: 0.5rem 0.25rem !important;
    min-width: 110px !important;
    width: 110px !important;
    text-align: center;
  }

  .row.g-3 .col-md-4, .row.g-3 .col-md-3, .row.g-3 .col-md-2 {
    margin-bottom: 0.75rem;
  }
}

/* Custom styles for permissions management */
.header-permissions {
  color: white;
}

.header-permissions.header-web {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

.header-permissions.header-mobile {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
}

.btn-close-modal-header {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  flex-shrink: 0;
}

.btn-close-modal-header:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.btn-close-modal-custom {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  width: auto;
}

.btn-close-modal-custom:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.role-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.role-details {
  flex: 1.5;
  min-width: 150px;
}

.role-name-text {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.role-description-text {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.role-permissions-badges {
  flex: 2;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
}

.badges-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  justify-content: center;
}

.role-actions {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
}

.btn-revoke-role {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-revoke-role:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

/* Badges styling */
.badge-perm {
  font-size: 0.725rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.badge-view {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.badge-create {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.badge-update {
  background-color: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.badge-delete {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.badge-export {
  background-color: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #e9d5ff;
}

.badge-import {
  background-color: #e0e7ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

@media (max-width: 768px) {
  .role-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .role-permissions-badges {
    padding: 0;
    justify-content: flex-start;
  }
  .badges-wrapper {
    justify-content: flex-start;
  }
  .role-actions {
    justify-content: flex-end;
  }
}

.badge-platform-header {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-confirm-danger {
  background-color: #ef4444;
  color: white;
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  width: auto;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: auto;
}

.btn-confirm-danger:hover:not(:disabled) {
  background-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  color: white;
}

.btn-confirm-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Custom styles for bulk permissions management tabs */
.modal-tabs {
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: transparent;
  border: none;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.tab-btn.active {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

/* Scrollable checklist container */
.roles-checklist-container {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
}

.checklist-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checklist-item-card {
  display: block;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checklist-item-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.checklist-item-card.checked {
  border-color: #a7f3d0;
  background: #ecfdf5;
}

.checklist-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-checkbox-ui {
  font-size: 1.15rem;
}

.item-text {
  display: flex;
  flex-direction: column;
}

.role-title-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.role-desc-text {
  font-size: 0.75rem;
}

.form-label-custom {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Permission toggles grid */
.permission-toggles-grid {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.permission-toggle-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-control {
  flex-shrink: 0;
}

.toggle-label-desc {
  display: flex;
  flex-direction: column;
}

.perm-title {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.perm-desc {
  font-size: 0.725rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.text-view { color: #0369a1; }
.text-create { color: #15803d; }
.text-update { color: #b45309; }
.text-delete { color: #b91c1c; }
.text-export { color: #7e22ce; }
.text-import { color: #4338ca; }

/* Small Toggle Switch */
.toggle-switch-sm {
  position: relative;
  width: 40px;
  height: 22px;
  background-color: #cbd5e1;
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.toggle-switch-sm.active {
  background-color: #10b981;
  border-color: #059669;
}

.toggle-slider-sm {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch-sm.active .toggle-slider-sm {
  transform: translateX(18px);
}

/* Apply button */
.btn-apply-bulk-assign {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-apply-bulk-assign:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-apply-bulk-assign:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.selected-roles-badge-summary {
  font-size: 0.8rem;
  color: #475569;
}
</style>