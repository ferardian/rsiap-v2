<template>
  <div class="facility-management">
    <div class="page-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="page-title">🏥 Kelola Fasilitas</h1>
          <p class="page-subtitle">Manajemen fasilitas rumah sakit di aplikasi mobile</p>
        </div>
        <div class="header-right">
          <button class="btn btn-primary btn-add" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Tambah Fasilitas</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Facility Table -->
    <div class="card flex-grow-1">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data fasilitas...</p>
        </div>

        <div v-else-if="facilities.length === 0" class="text-center py-5">
          <i class="fas fa-hospital fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Belum ada data fasilitas</h5>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Urutan</th>
                <th>Icon</th>
                <th>Nama Fasilitas</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="facility in facilities" :key="facility.id">
                <td>{{ facility.order }}</td>
                <td>
                  <div class="icon-preview">
                    <i class="material-icons">{{ facility.icon }}</i>
                  </div>
                </td>
                <td>
                  <span class="fw-bold">{{ facility.title }}</span>
                </td>
                <td>
                  <small class="text-muted">{{ facility.description || '-' }}</small>
                </td>
                <td>
                  <div class="status-badge" :class="{ active: facility.status === 'active' }" @click="toggleStatus(facility)">
                    <span class="status-dot"></span>
                    {{ facility.status === 'active' ? 'Aktif' : 'Non-aktif' }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="editFacility(facility)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDelete(facility)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Sidebar -->
    <div class="sidebar-form" :class="{ active: showModal }">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h5 class="sidebar-title">
            {{ isEditing ? '✏️ Edit Fasilitas' : '➕ Tambah Fasilitas Baru' }}
          </h5>
          <button type="button" class="btn-sidebar-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sidebar-body">
          <form @submit.prevent="saveFacility">
            <div class="form-group mb-4">
              <label class="form-label fw-bold">Icon Material *</label>
              <div class="input-wrapper">
                <input v-model="formData.icon" type="text" class="form-control" placeholder="Contoh: local_hospital" required />
                <i class="fas fa-icons input-icon"></i>
              </div>
              <small class="text-muted">
                Lihat icon di <a href="https://fonts.google.com/icons" target="_blank">Material Icons</a>
              </small>
            </div>

            <div class="form-group mb-4">
              <label class="form-label fw-bold">Nama Fasilitas *</label>
              <div class="input-wrapper">
                <input v-model="formData.title" type="text" class="form-control" placeholder="Contoh: IGD 24 Jam" required />
                <i class="fas fa-hospital input-icon"></i>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label fw-bold">Deskripsi</label>
              <textarea v-model="formData.description" rows="4" class="form-control ps-3" placeholder="Deskripsi fasilitas..." style="resize: none;"></textarea>
            </div>

            <div class="row">
              <div class="col-6">
                <div class="form-group mb-4">
                  <label class="form-label fw-bold">Urutan</label>
                  <div class="input-wrapper">
                    <input v-model.number="formData.order" type="number" class="form-control" min="0" />
                    <i class="fas fa-sort-numeric-up input-icon"></i>
                  </div>
                </div>
              </div>
              <div v-if="isEditing" class="col-6">
                <div class="form-group mb-4">
                  <label class="form-label fw-bold">Status</label>
                  <div class="toggle-group mt-2">
                    <div class="toggle-switch" :class="{ active: formData.status === 'active' }" @click="formData.status = formData.status === 'active' ? 'inactive' : 'active'">
                      <div class="toggle-slider"></div>
                    </div>
                    <span class="toggle-label">{{ formData.status === 'active' ? 'Aktif' : 'Non-aktif' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="sidebar-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button type="button" class="btn btn-primary" @click="saveFacility" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-save me-2"></i>
            {{ isEditing ? 'Update Fasilitas' : 'Simpan Fasilitas' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import facilityService from '../../services/facilityService'
import { showToast } from '../../utils/notification'

const facilities = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const formData = ref({
  id: null,
  icon: '',
  title: '',
  description: '',
  order: 0,
  status: 'active'
})

const fetchFacilities = async () => {
  loading.value = true
  try {
    const response = await facilityService.getAllFacilities()
    facilities.value = response.data.data
  } catch (error) {
    showToast('Gagal memuat data fasilitas', 'error')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = { id: null, icon: '', title: '', description: '', order: 0, status: 'active' }
  showModal.value = true
}

const editFacility = (facility) => {
  isEditing.value = true
  formData.value = { ...facility }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveFacility = async () => {
  submitting.value = true
  try {
    const data = {
      icon: formData.value.icon,
      title: formData.value.title,
      description: formData.value.description || '',
      order: formData.value.order,
      status: formData.value.status
    }

    if (isEditing.value) {
      await facilityService.updateFacility(formData.value.id, data)
      showToast('Fasilitas berhasil diperbarui', 'success')
    } else {
      await facilityService.createFacility(data)
      showToast('Fasilitas berhasil ditambahkan', 'success')
    }
    closeModal()
    fetchFacilities()
  } catch (error) {
    showToast('Gagal menyimpan fasilitas', 'error')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (facility) => {
  const newStatus = facility.status === 'active' ? 'inactive' : 'active'
  try {
    await facilityService.updateStatus(facility.id, newStatus)
    facility.status = newStatus
    showToast(`Status fasilitas diperbarui menjadi ${newStatus}`, 'success')
  } catch (error) {
    showToast('Gagal memperbarui status', 'error')
  }
}

const confirmDelete = async (facility) => {
  if (confirm(`Hapus fasilitas ${facility.title}? Tindakan ini tidak dapat dibatalkan.`)) {
    try {
      await facilityService.deleteFacility(facility.id)
      showToast('Fasilitas berhasil dihapus', 'success')
      fetchFacilities()
    } catch (error) {
      showToast('Gagal menghapus fasilitas', 'error')
    }
  }
}

onMounted(fetchFacilities)
</script>

<style scoped>
/* Inherit styles from SliderManagementView */
.facility-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.page-header {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  justify-content: space-between;
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
  font-size: 0.875rem;
  margin-bottom: 0;
}

.card {
  border: none;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f0f7ff;
  border-radius: 8px;
}

.icon-preview .material-icons {
  color: #3b82f6;
  font-size: 24px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.status-badge.active {
  background: #ecfdf5;
  color: #10b981;
  border-color: #a7f3d0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

.active .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* Sidebar Form */
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

.sidebar-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-body {
  padding: 2rem;
  height: calc(100vh - 150px);
  overflow-y: auto;
  background: #f8fafc;
}

.sidebar-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  background: white;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.form-control {
  padding-left: 2.75rem;
  border: 1px solid #cbd5e1;
  height: 45px;
  border-radius: 0.5rem;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 50px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: #10b981;
}

.toggle-slider {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.active .toggle-slider {
  transform: translateX(24px);
}

.btn-sidebar-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-sidebar-close:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}
</style>
