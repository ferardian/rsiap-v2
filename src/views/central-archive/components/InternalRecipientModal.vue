<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container advanced-recipient-modal">
      <div class="modal-header">
        <div class="header-info">
          <i class="fas fa-users-cog"></i>
          <div>
            <h2>Pilih Penerima Surat</h2>
            <p>Pilih pegawai yang akan menerima undangan/surat internal ini</p>
          </div>
        </div>
        <button class="btn-close" @click="$emit('close')" title="Tutup">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body-layout">
        <!-- Sidebar: Selected Items (Left side as requested) -->
        <div class="selected-sidebar">
          <div class="sidebar-header">
            <h3>Penerima Terpilih ({{ selectedEmployees.length }})</h3>
          </div>
          <div class="sidebar-content">
            <div v-if="selectedEmployees.length === 0" class="empty-selection">
              <i class="fas fa-user-plus"></i>
              <p>Belum ada pegawai dipilih</p>
            </div>
            <div v-else class="selected-list">
              <div v-for="emp in selectedEmployees" :key="emp.nik" class="selected-item-card animate-fade-in">
                <div class="emp-info-mini">
                  <span class="emp-name">{{ emp.nama }}</span>
                  <span class="emp-nik">{{ emp.nik }}</span>
                </div>
                <button class="btn-remove" @click="toggleSelection(emp)" title="Hapus">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="sidebar-footer">
            <button 
              class="btn-save-recipient" 
              :disabled="loading"
              @click="handleSave"
            >
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ loading ? 'Menyimpan...' : 'Simpan Penerima' }}
            </button>
          </div>
        </div>

        <!-- Main Content: Employee Table -->
        <div class="main-employee-content">
          <div class="search-filter-bar">
            <div class="filter-item">
              <label>Departemen</label>
              <select v-model="filters.departemen" class="form-select" @change="() => fetchEmployees(1)">
                <option value="">Semua Departemen</option>
                <option v-for="dep in departemenList" :key="dep.dep_id" :value="dep.dep_id">
                  {{ dep.nama }}
                </option>
              </select>
            </div>
            <div class="filter-item flex-1">
              <label>Pencarian</label>
              <div class="search-input-group">
                <i class="fas fa-search"></i>
                <input 
                  v-model="filters.search" 
                  type="text" 
                  placeholder="Cari nama atau NIK..." 
                  @keyup.enter="() => fetchEmployees(1)"
                >
              </div>
            </div>
            <div class="filter-item align-self-end">
              <button class="btn-refresh" @click="() => fetchEmployees(1)" :disabled="fetching">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': fetching }"></i>
              </button>
            </div>
          </div>

          <div class="table-container">
            <table class="employees-table">
              <thead>
                <tr>
                  <th width="50">
                    <input 
                      type="checkbox" 
                      :checked="isAllSelected" 
                      @change="toggleSelectAll"
                    >
                  </th>
                  <th>Nama Pegawai</th>
                  <th width="100">JK</th>
                  <th width="150">NIK</th>
                  <th>Bidang</th>
                  <th>Departemen</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="emp in employees" 
                  :key="emp.nik || emp.id || emp.nip"
                  :class="{ 'is-selected': isEmployeeSelected(getEmpId(emp)) }"
                  @click="toggleSelection(emp)"
                >
                  <td @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="isEmployeeSelected(getEmpId(emp))"
                      @change="toggleSelection(emp)"
                    >
                  </td>
                  <td class="fw-bold">{{ emp.nama }}</td>
                  <td>
                    <span :class="['jk-tag', emp.jk]">
                      {{ emp.jk === 'Pria' ? '♂ Pria' : '♀ Wanita' }}
                    </span>
                  </td>
                  <td class="text-mono">{{ emp.nik || emp.id || emp.nip || '-' }}</td>
                  <td>{{ emp.bidang || '-' }}</td>
                  <td>{{ emp.dep?.nama || emp.departemen }}</td>
                </tr>
                <tr v-if="employees.length === 0 && !fetching">
                  <td colspan="6" class="text-center py-5 text-muted">
                    Tidak ada data pegawai ditemukan
                  </td>
                </tr>
                <tr v-if="fetching">
                  <td colspan="6" class="text-center py-5">
                    <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    <p class="mt-2">Memuat daftar pegawai...</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-bar">
            <span class="total-info">Total {{ pagination.total }} Pegawai</span>
            <div class="page-controls">
              <button :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span>Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>
              <button :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { pegawaiService } from '@/services/pegawaiService'
import departemenService from '@/services/departemenService'

const props = defineProps({
  show: Boolean,
  initialSelected: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const emit = defineEmits(['close', 'save'])

// State
const fetching = ref(false)
const employees = ref([])
const departemenList = ref([])
const selectedEmployees = ref([])

const filters = ref({
  departemen: '',
  search: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

// Computed
const isEmployeeSelected = (nik) => {
  if (!nik) return false
  return selectedEmployees.value.some(e => e.nik === nik)
}

const getEmpId = (emp) => {
  return emp.nik || emp.id || emp.nip
}


const isAllSelected = computed(() => {
  return employees.value.length > 0 && 
         employees.value.every(e => isEmployeeSelected(getEmpId(e)))
})

// Methods
const fetchEmployees = async (page = 1) => {
  // Guard against event object or non-numeric page
  const pageNum = typeof page === 'number' ? page : 1
  
  fetching.value = true
  try {
    const extraParams = {
      select: '*'
    }

    if (filters.value.departemen) {
      extraParams['filter[departemen]'] = filters.value.departemen
    }

    if (filters.value.search) {
      extraParams['search'] = filters.value.search
    }

    const response = await pegawaiService.getPegawai(pageNum, 15, extraParams)
    
    // Mapping data
    employees.value = response.data.data
    
    // Meta mapping (Orion standard structure)
    const resData = response.data
    const meta = resData.meta || resData
    
    pagination.value = {
      current_page: meta.current_page || 1,
      last_page: meta.last_page || 1,
      total: meta.pagination?.total || meta.total || (resData.data?.length || 0)
    }
  } catch (error) {
    console.error('Error fetching employees:', error)
  } finally {
    fetching.value = false
  }
}

const loadDepartemen = async () => {
  try {
    const response = await departemenService.index({ limit: 100 })
    departemenList.value = response.data.data
  } catch (error) {
    console.error('Error loading departemen:', error)
  }
}

const toggleSelection = (emp) => {
  const id = getEmpId(emp)
  if (!id) return

  const index = selectedEmployees.value.findIndex(e => e.nik === id)
  if (index > -1) {
    selectedEmployees.value.splice(index, 1)
  } else {
    selectedEmployees.value.push({
      nik: id,
      nama: emp.nama
    })
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Unselect all in current view
    employees.value.forEach(emp => {
      const id = getEmpId(emp)
      const idx = selectedEmployees.value.findIndex(e => e.nik === id)
      if (idx > -1) selectedEmployees.value.splice(idx, 1)
    })
  } else {
    // Select all in current view
    employees.value.forEach(emp => {
      const id = getEmpId(emp)
      if (id && !isEmployeeSelected(id)) {
        selectedEmployees.value.push({
          nik: id,
          nama: emp.nama
        })
      }
    })
  }
}

const changePage = (page) => {
  fetchEmployees(page)
}

const handleSave = () => {
  emit('save', selectedEmployees.value.map(e => e.nik))
}

// Watchers
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Initialize selected from props
    selectedEmployees.value = props.initialSelected.map(rec => {
      if (typeof rec === 'string') return { nik: rec, nama: rec }
      return {
        nik: rec.penerima || rec.nik,
        nama: rec.pegawai?.nama || rec.detail?.nama || rec.nama || rec.nik
      }
    })
    
    if (departemenList.value.length === 0) loadDepartemen()
    fetchEmployees()
  }
})

onMounted(() => {
  if (props.show) {
    loadDepartemen()
    fetchEmployees()
  }
})
</script>

<style scoped>
.advanced-recipient-modal {
  max-width: 1200px;
  width: 95%;
  z-index: 1301;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}


.modal-header {
  padding: 1.25rem 2rem;
  background: white;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #64748b;
}

.btn-close:hover {
  background: #fee2e2;
  color: #ef4444;
}


.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-info i {
  font-size: 1.75rem;
  color: #3b82f6;
  background: #eff6ff;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.header-info h2 {
  margin: 0;
  font-size: 1.25rem;
}

.header-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.modal-body-layout {
  display: flex;
  height: 600px;
  overflow: hidden;
}

/* Sidebar Selected */
.selected-sidebar {
  width: 320px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-selection {
  text-align: center;
  padding: 4rem 1rem;
  color: #94a3b8;
}

.empty-selection i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selected-item-card {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.emp-info-mini {
  display: flex;
  flex-direction: column;
}

.emp-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.emp-nik {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

.btn-remove {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #ef4444;
  color: white;
}

.sidebar-footer {
  padding: 1.25rem;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.btn-save-recipient {
  width: 100%;
  padding: 0.875rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-save-recipient:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* Main Content Area */
.main-employee-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: white;
}

.search-filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-select, .search-input-group input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #f8fafc;
}

.search-input-group {
  position: relative;
}

.search-input-group i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input-group input {
  width: 100%;
  padding-left: 2.5rem;
}

.btn-refresh {
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  color: #64748b;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}

.employees-table {
  width: 100%;
  border-collapse: collapse;
}

.employees-table th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 2px solid #f1f5f9;
  z-index: 10;
}

.employees-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  cursor: pointer;
}

.employees-table tbody tr:hover {
  background: #f1f5f9;
}

.employees-table tr.is-selected {
  background: #eff6ff;
}

.jk-tag {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.jk-tag.Pria { background: #dbeafe; color: #1e40af; }
.jk-tag.Wanita { background: #fce7f3; color: #9d174d; }

.pagination-bar {
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  margin-top: 1rem;
}

.total-info {
  font-size: 0.875rem;
  color: #64748b;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.page-controls button {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.page-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 992px) {
  .modal-body-layout {
    flex-direction: column;
    height: 80vh;
  }
  
  .selected-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
