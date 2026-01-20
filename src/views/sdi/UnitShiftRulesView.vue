<template>
  <div class="unit-shift-rules-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Aturan Shift per Unit</h1>
        <p>Kelola konfigurasi shift untuk setiap departemen</p>
      </div>
      <button class="btn-add" @click="openAddModal">
        <i class="fas fa-plus"></i>
        <span>Tambah Aturan</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="filter-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari shift..."
        />
      </div>
      <v-select
        v-model="filterDepartment"
        :options="departments"
        :reduce="dept => dept.dep_id"
        label="nama"
        placeholder="Semua Departemen"
        class="filter-select-vue"
        :clearable="true"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data...</p>
    </div>

    <!-- Data Table -->
    <div v-else-if="filteredRules.length > 0" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Departemen</th>
            <th>Kode Shift</th>
            <th>Durasi (Jam)</th>
            <th>Prioritas</th>
            <th>Min. Staf</th>
            <th>Tipe Role</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in filteredRules" :key="rule.id">
            <td>{{ rule.departemen?.nama || rule.dep_id }}</td>
            <td><span class="shift-badge">{{ rule.shift_code }}</span></td>
            <td>{{ rule.duration_hours }} jam</td>
            <td><span class="priority-badge">{{ rule.priority }}</span></td>
            <td>{{ rule.min_staff }} orang</td>
            <td><span :class="['role-badge', rule.role_type]">{{ rule.role_type }}</span></td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" @click="openEditModal(rule)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" @click="confirmDelete(rule)" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-calendar-alt"></i>
      <p>Belum ada aturan shift</p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit' : 'Tambah' }} Aturan Shift</h2>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveRule">
          <div class="form-group">
            <label>Departemen <span class="required">*</span></label>
            <v-select
              v-model="formData.dep_id"
              :options="departments"
              :reduce="dept => dept.dep_id"
              label="nama"
              placeholder="Pilih Departemen"
              :clearable="false"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Kode Shift <span class="required">*</span></label>
              <v-select
                v-model="formData.shift_code"
                :options="shifts"
                :reduce="shift => shift.shift"
                label="shift"
                placeholder="Pilih Shift"
                @option:selected="onShiftSelected"
                :clearable="false"
              >
                <template #option="{ shift, jam_masuk, jam_pulang }">
                  <div>
                    <strong>{{ shift }}</strong>
                    <span style="color: #64748b; font-size: 12px; margin-left: 8px;">
                      {{ jam_masuk }} - {{ jam_pulang }}
                    </span>
                  </div>
                </template>
              </v-select>
            </div>
            <div class="form-group">
              <label>Durasi (Jam) <span class="required">*</span></label>
              <input type="number" step="0.5" v-model="formData.duration_hours" required min="0" readonly />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prioritas <span class="required">*</span></label>
              <input type="number" v-model="formData.priority" required min="1" />
            </div>
            <div class="form-group">
              <label>Min. Staf <span class="required">*</span></label>
              <input type="number" v-model="formData.min_staff" required min="1" />
            </div>
          </div>

          <div class="form-group">
            <label>Tipe Role <span class="required">*</span></label>
            <select v-model="formData.role_type" required>
              <option value="perawat">Perawat</option>
              <option value="admin">Admin</option>
              <option value="karu">Kepala Ruangan</option>
              <option value="dokter">Dokter</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeModal">Batal</button>
            <button type="submit" class="btn-save" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <span>{{ saving ? 'Menyimpan...' : 'Simpan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import unitShiftRuleService from '@/services/unitShiftRuleService'
import api from '@/services/api'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const filterDepartment = ref('')
const rules = ref([])
const departments = ref([])
const shifts = ref([])

const formData = ref({
  dep_id: '',
  shift_code: '',
  duration_hours: 7.0,
  priority: 1,
  min_staff: 1,
  role_type: 'perawat'
})

const filteredRules = computed(() => {
  let filtered = rules.value

  if (filterDepartment.value) {
    filtered = filtered.filter(r => r.dep_id === filterDepartment.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.shift_code.toLowerCase().includes(query) ||
      r.departemen?.nama.toLowerCase().includes(query)
    )
  }

  return filtered
})

const fetchRules = async () => {
  loading.value = true
  try {
    const response = await unitShiftRuleService.getAll({ include: 'departemen', sort: 'dep_id,priority' })
    rules.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch rules:', error)
    alert('Gagal memuat data aturan shift.')
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const response = await api.get('/departemen', { params: { limit: 1000 } })
    departments.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  }
}

const fetchShifts = async () => {
  try {
    const response = await api.get('/sdi/shifts')
    shifts.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch shifts:', error)
  }
}

const calculateDuration = (jamMasuk, jamPulang) => {
  const [hMasuk, mMasuk] = jamMasuk.split(':').map(Number)
  const [hPulang, mPulang] = jamPulang.split(':').map(Number)
  
  let totalMinutes = (hPulang * 60 + mPulang) - (hMasuk * 60 + mMasuk)
  
  // Handle overnight shifts (e.g., Malam: 21:00 - 07:00)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
  }
  
  return (totalMinutes / 60).toFixed(1)
}

const onShiftSelected = (selectedShift) => {
  if (selectedShift) {
    formData.value.duration_hours = calculateDuration(selectedShift.jam_masuk, selectedShift.jam_pulang)
  }
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = {
    dep_id: '',
    shift_code: '',
    duration_hours: 7.0,
    priority: 1,
    min_staff: 1,
    role_type: 'perawat'
  }
  showModal.value = true
}

const openEditModal = (rule) => {
  isEditing.value = true
  formData.value = { ...rule }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveRule = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await unitShiftRuleService.update(formData.value.id, formData.value)
      alert('Aturan shift berhasil diperbarui!')
    } else {
      await unitShiftRuleService.create(formData.value)
      alert('Aturan shift berhasil ditambahkan!')
    }
    closeModal()
    fetchRules()
  } catch (error) {
    console.error('Failed to save rule:', error)
    alert('Gagal menyimpan aturan shift.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (rule) => {
  if (!confirm(`Hapus aturan shift "${rule.shift_code}" untuk ${rule.departemen?.nama}?`)) return

  try {
    await unitShiftRuleService.delete(rule.id)
    alert('Aturan shift berhasil dihapus!')
    fetchRules()
  } catch (error) {
    console.error('Failed to delete rule:', error)
    alert('Gagal menghapus aturan shift.')
  }
}

onMounted(() => {
  fetchRules()
  fetchDepartments()
  fetchShifts()
})
</script>

<style scoped>
.unit-shift-rules-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.header-left p {
  color: #64748b;
  margin: 0;
}

.btn-add {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
}

.filter-select-vue {
  min-width: 250px;
}

.filter-select-vue :deep(.vs__dropdown-toggle) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  min-height: 44px;
  background: white;
}

.filter-select-vue :deep(.vs__search) {
  font-size: 14px;
  margin: 0;
  padding: 0;
}

.filter-select-vue :deep(.vs__selected) {
  font-size: 14px;
  margin: 0;
  padding: 0;
}

.filter-select-vue :deep(.vs__actions) {
  padding: 0 4px;
}



.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-state i, .empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8fafc;
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
}

.shift-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
}

.priority-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.perawat { background: #d1fae5; color: #065f46; }
.role-badge.admin { background: #fce7f3; color: #9f1239; }
.role-badge.karu { background: #ddd6fe; color: #5b21b6; }
.role-badge.dokter { background: #fef3c7; color: #92400e; }

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
}

form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel, .btn-save {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-section {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
