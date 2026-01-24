<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content modern-modal" @click.stop>
      <div class="modal-header modern-header">
        <div class="header-content">
          <div class="header-icon">
            <i :class="isEdit ? 'fas fa-user-edit' : 'fas fa-user-plus'"></i>
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Data Dokter' : 'Tambah Dokter Baru' }}</h3>
            <p class="header-subtitle">{{ isEdit ? 'Perbarui informasi dokter' : 'Lengkapi data dokter dari pegawai' }}</p>
          </div>
        </div>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body modern-body">
        <form @submit.prevent="handleSubmit">
          <!-- Employee Selection (Add Mode Only) -->
          <div v-if="!isEdit" class="form-section">
            <div class="section-header">
              <i class="fas fa-user-circle"></i>
              <span>Pilih Pegawai</span>
            </div>
            <div class="form-group">
              <label>Cari Pegawai <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="employeeSearch"
                @input="searchEmployee"
                placeholder="Ketik nama atau NIP pegawai..."
                :disabled="isEdit"
              />
              <div v-if="employeeResults.length > 0" class="search-results">
                <div 
                  v-for="emp in employeeResults" 
                  :key="emp.nip || emp.nik"
                  class="search-result-item"
                  @click="selectEmployee(emp)"
                >
                  <div class="emp-info">
                    <strong>{{ emp.nama }}</strong>
                    <span class="emp-nik">{{ emp.nip || emp.nik }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedEmployee" class="selected-employee">
              <i class="fas fa-check-circle"></i>
              <span>Dipilih: <strong>{{ selectedEmployee.nama }}</strong> ({{ selectedEmployee.nip || selectedEmployee.nik }})</span>
            </div>
          </div>

          <!-- Doctor Information -->
          <div class="form-section">
            <div class="section-header">
              <i class="fas fa-stethoscope"></i>
              <span>Informasi Dokter</span>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Kode Dokter <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.kd_dokter" 
                  readonly
                  placeholder="Otomatis dari NIP pegawai"
                  required
                />
              </div>
              <div class="form-group">
                <label>Nama Dokter <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="form.nm_dokter" 
                  placeholder="Nama lengkap dokter"
                  required
                />
              </div>
              <div class="form-group">
                <label>Jenis Kelamin <span class="required">*</span></label>
                <select v-model="form.jk" required>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div class="form-group">
                <label>Spesialisasi</label>

                <select v-model="form.kd_sps">
                  <option value="">Pilih Spesialisasi</option>
                  <option v-for="sps in spesialisasiList" :key="sps.kd_sps" :value="sps.kd_sps">
                    {{ sps.nm_sps }}
                  </option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>Alumni</label>
                <input 
                  type="text" 
                  v-model="form.alumni" 
                  placeholder="Universitas/Institusi pendidikan"
                />
              </div>
              <div class="form-group full-width">
                <label>No. Ijin Praktek</label>
                <input 
                  type="text" 
                  v-model="form.no_ijn_praktek" 
                  placeholder="Nomor SIP/STR"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer modern-footer">
        <button class="btn-cancel" @click="$emit('close')">
          <i class="fas fa-times"></i>
          Batal
        </button>
        <button 
          class="btn-save" 
          @click="handleSubmit" 
          :disabled="loading || (!isEdit && !selectedEmployee)"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Dokter') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { dokterService } from '../../../services/dokterService'
import { pegawaiService } from '../../../services/pegawaiService'
import { useToast } from 'vue-toastification'

const props = defineProps({
  show: Boolean,
  isEdit: Boolean,
  dokterData: Object
})

const emit = defineEmits(['close', 'saved'])
const toast = useToast()
const loading = ref(false)

const form = ref({
  kd_dokter: '',
  nm_dokter: '',
  jk: 'L',
  kd_sps: '',
  alumni: '',
  no_ijn_praktek: ''
})

const employeeSearch = ref('')
const employeeResults = ref([])
const selectedEmployee = ref(null)
const spesialisasiList = ref([])

// Define resetForm before watch
const resetForm = () => {
  form.value = {
    kd_dokter: '',
    nm_dokter: '',
    jk: 'L',
    kd_sps: '',
    alumni: '',
    no_ijn_praktek: ''
  }
  employeeSearch.value = ''
  employeeResults.value = []
  selectedEmployee.value = null
}

// Initialize form when editing
watch(() => props.dokterData, (newVal) => {
  if (newVal && props.isEdit) {
    form.value = {
      kd_dokter: newVal.kd_dokter || '',
      nm_dokter: newVal.nm_dokter || '',
      jk: newVal.jk || 'L',
      kd_sps: newVal.kd_sps || '',
      alumni: newVal.alumni || '',
      no_ijn_praktek: newVal.no_ijn_praktek || ''
    }
  } else if (!props.isEdit) {
    resetForm()
  }
}, { immediate: true })

// Load spesialisasi data
const loadSpesialisasi = async () => {
  try {
    const response = await dokterService.getSpesialisasi()
    if (response.data.success) {
      spesialisasiList.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading spesialisasi:', error)
  }
}

const searchEmployee = async () => {
  if (employeeSearch.value.length < 2) {
    employeeResults.value = []
    return
  }

  try {
    const response = await pegawaiService.searchPegawai(employeeSearch.value)
    if (response.data.success) {
      employeeResults.value = response.data.data.slice(0, 10)
    }
  } catch (error) {
    console.error('Error searching employee:', error)
  }
}

const selectEmployee = (employee) => {
  selectedEmployee.value = employee
  // Use nip field from API response
  form.value.kd_dokter = employee.nip || employee.nik
  form.value.nm_dokter = employee.nama
  form.value.jk = employee.jk === 'Pria' ? 'L' : 'P'
  employeeResults.value = []
  employeeSearch.value = employee.nama
  console.log('Selected employee:', employee)
  console.log('Form kd_dokter:', form.value.kd_dokter)
}

// Watch for modal close to reset search
watch(() => props.show, (newVal) => {
  if (!newVal) {
    // Modal is closing, reset search results
    employeeSearch.value = ''
    employeeResults.value = []
  }
})

const handleSubmit = async () => {
  if (!props.isEdit && !selectedEmployee.value) {
    toast.warning('Pilih pegawai terlebih dahulu')
    return
  }

  if (!form.value.nm_dokter) {
    toast.warning('Nama dokter harus diisi')
    return
  }

  loading.value = true
  try {
    let response
    if (props.isEdit) {
      response = await dokterService.updateDokter(form.value.kd_dokter, form.value)
      toast.success('Data dokter berhasil diperbarui')
    } else {
      response = await dokterService.createDokter(form.value)
      toast.success('Dokter baru berhasil ditambahkan')
    }
    
    if (response.data.success) {
      emit('saved')
      emit('close')
    }
  } catch (error) {
    console.error('Error saving doctor:', error)
    const errorMsg = error.response?.data?.message || error.message
    toast.error('Gagal menyimpan data: ' + errorMsg)
  } finally {
    loading.value = false
  }
}

// Load spesialisasi on component mount
onMounted(() => {
  loadSpesialisasi()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modern-modal {
  background: white;
  width: 95%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modern-header {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 700;
}

.header-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modern-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #3b82f6;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s;
  color: #1e293b;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled,
.form-group input:read-only {
  background: #f1f5f9;
  cursor: not-allowed;
  color: #94a3b8;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #f8fafc;
}

.emp-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.emp-nik {
  font-size: 0.75rem;
  color: #64748b;
}

.selected-employee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #166534;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.selected-employee i {
  color: #22c55e;
}

.modern-footer {
  padding: 1.25rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.btn-save {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modern-header {
    padding: 1rem 1.5rem;
  }
  
  .modern-body {
    padding: 1.25rem;
  }
}
</style>
