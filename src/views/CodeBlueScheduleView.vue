<template>
  <div class="codeblue-schedule-management">
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.back()" class="btn-back">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="header-text">
          <h1><i class="fas fa-user-md"></i> Kelola Jadwal Code Blue</h1>
          <p>Atur jadwal petugas code blue untuk setiap shift</p>
        </div>
      </div>
    </div>

    <div class="schedule-form-container">
      <!-- Date Selector -->
      <div class="date-selector-card">
        <label for="schedule-date">
          <i class="fas fa-calendar"></i> Pilih Tanggal Jadwal
        </label>
        <input 
          type="date" 
          id="schedule-date"
          v-model="selectedDate"
          @change="loadSchedule"
          class="date-input"
        >
        <button v-if="hasExistingSchedule" @click="confirmDelete" class="btn-delete-schedule">
          <i class="fas fa-trash"></i> Hapus Jadwal
        </button>
      </div>

      <!-- Shift Tabs -->
      <div class="shift-tabs">
        <div 
          v-for="shift in shifts" 
          :key="shift.value"
          @click="activeShift = shift.value"
          class="shift-tab"
          :class="{ 'active': activeShift === shift.value }"
        >
          <i :class="shift.icon"></i>
          <span>{{ shift.label }}</span>
        </div>
      </div>

      <!-- Team Assignment Form -->
      <div class="team-assignment-form">
        <div class="form-section">
          <h3><i class="fas fa-crown"></i> Leader</h3>
          <VueSelect
            v-model="scheduleData.LEADER[activeShift]"
            :options="pegawaiList"
            :reduce="pegawai => pegawai.nip"
            label="nama"
            placeholder="-- Pilih Leader --"
            class="pegawai-select leader-select"
            :clearable="true"
            :searchable="true"
          />
        </div>

        <div class="form-section">
          <h3><i class="fas fa-users"></i> Anggota Tim</h3>
          <div class="anggota-grid">
            <div v-for="i in 5" :key="i" class="anggota-item">
              <label>Anggota {{ i }}</label>
              <VueSelect
                v-model="scheduleData[`ANGGOTA ${i}`][activeShift]"
                :options="pegawaiList"
                :reduce="pegawai => pegawai.nip"
                label="nama"
                :placeholder="`-- Pilih Anggota ${i} --`"
                class="pegawai-select"
                :clearable="true"
                :searchable="true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="$router.back()" class="btn-cancel">
          <i class="fas fa-times"></i> Batal
        </button>
        <button @click="saveSchedule" class="btn-save" :disabled="saving">
          <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
          {{ saving ? 'Menyimpan...' : 'Simpan Jadwal' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'
import dashboardService from '@/services/dashboardService'
import { pegawaiService } from '@/services/pegawaiService'

const router = useRouter()

// Reactive data
const selectedDate = ref('')
const activeShift = ref('pagi')
const hasExistingSchedule = ref(false)
const saving = ref(false)
const pegawaiList = ref([])

const shifts = [
  { value: 'pagi', label: 'Shift Pagi', icon: 'fas fa-sun' },
  { value: 'siang', label: 'Shift Siang', icon: 'fas fa-cloud-sun' },
  { value: 'malam', label: 'Shift Malam', icon: 'fas fa-moon' }
]

const scheduleData = reactive({
  LEADER: { pagi: '', siang: '', malam: '' },
  'ANGGOTA 1': { pagi: '', siang: '', malam: '' },
  'ANGGOTA 2': { pagi: '', siang: '', malam: '' },
  'ANGGOTA 3': { pagi: '', siang: '', malam: '' },
  'ANGGOTA 4': { pagi: '', siang: '', malam: '' },
  'ANGGOTA 5': { pagi: '', siang: '', malam: '' }
})

// Load pegawai list
const loadPegawaiList = async () => {
  try {
    // Use getPegawai with large limit to get all employees
    const response = await pegawaiService.getPegawai(1, 1000)
    console.log('Pegawai list response:', response.data)
    pegawaiList.value = response.data.data || []
    console.log('Pegawai list loaded:', pegawaiList.value.length, 'items')
    if (pegawaiList.value.length > 0) {
      console.log('Sample pegawai:', pegawaiList.value[0])
    }
  } catch (error) {
    console.error('Error loading pegawai:', error)
  }
}

// Load schedule for selected date
const loadSchedule = async () => {
  if (!selectedDate.value) return

  try {
    const response = await dashboardService.getCodeBlueScheduleByDate(selectedDate.value)
    const data = response.data.data

    // Check if schedule exists
    hasExistingSchedule.value = Object.keys(data.pagi).length > 0

    // Populate form with existing data (backend returns 'nik' but we use 'nip' in frontend)
    Object.keys(scheduleData).forEach(tim => {
      scheduleData[tim].pagi = data.pagi[tim]?.nik || ''
      scheduleData[tim].siang = data.siang[tim]?.nik || ''
      scheduleData[tim].malam = data.malam[tim]?.nik || ''
    })
  } catch (error) {
    console.error('Error loading schedule:', error)
    hasExistingSchedule.value = false
  }
}

// Save schedule
const saveSchedule = async () => {
  if (!selectedDate.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Tanggal Belum Dipilih',
      text: 'Pilih tanggal terlebih dahulu',
      confirmButtonColor: '#3b82f6'
    })
    return
  }

  // Validate: at least leader must be filled for all shifts
  if (!scheduleData.LEADER.pagi || !scheduleData.LEADER.siang || !scheduleData.LEADER.malam) {
    Swal.fire({
      icon: 'error',
      title: 'Data Tidak Lengkap',
      text: 'Leader harus diisi untuk semua shift',
      confirmButtonColor: '#3b82f6'
    })
    return
  }

  saving.value = true

  try {
    const schedules = []
    let no_urut = 1

    Object.keys(scheduleData).forEach(tim => {
      schedules.push({
        tim: tim,
        pagi: scheduleData[tim].pagi || '-',
        siang: scheduleData[tim].siang || '-',
        malam: scheduleData[tim].malam || '-',
        no_urut: no_urut++
      })
    })

    await dashboardService.saveCodeBlueSchedule({
      tanggal: selectedDate.value,
      schedules: schedules
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Jadwal berhasil disimpan',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
      showConfirmButton: false
    })
    hasExistingSchedule.value = true
  } catch (error) {
    console.error('Error saving schedule:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: 'Terjadi kesalahan saat menyimpan jadwal',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    saving.value = false
  }
}

// Delete schedule
const confirmDelete = async () => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Jadwal?',
    text: 'Jadwal yang dihapus tidak dapat dikembalikan',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  try {
    await dashboardService.deleteCodeBlueSchedule(selectedDate.value)
    
    Swal.fire({
      icon: 'success',
      title: 'Terhapus!',
      text: 'Jadwal berhasil dihapus',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
      showConfirmButton: false
    })
    
    // Reset form
    Object.keys(scheduleData).forEach(tim => {
      scheduleData[tim].pagi = ''
      scheduleData[tim].siang = ''
      scheduleData[tim].malam = ''
    })
    hasExistingSchedule.value = false
  } catch (error) {
    console.error('Error deleting schedule:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menghapus',
      text: 'Terjadi kesalahan saat menghapus jadwal',
      confirmButtonColor: '#3b82f6'
    })
  }
}

// Initialize
onMounted(() => {
  loadPegawaiList()
  // Set default date to today
  const today = new Date().toISOString().split('T')[0]
  selectedDate.value = today
  loadSchedule()
})
</script>

<style scoped>
.codeblue-schedule-management {
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem;
}

.page-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.btn-back {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-back:hover {
  background: #e5e7eb;
  transform: translateX(-4px);
}

.header-text h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-text h1 i {
  color: #3b82f6;
}

.header-text p {
  color: #6b7280;
  margin: 0;
}

.schedule-form-container {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Date Selector */
.date-selector-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.date-selector-card label {
  font-weight: 600;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.date-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}

.date-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-delete-schedule {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-delete-schedule:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Shift Tabs */
.shift-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.shift-tab {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.shift-tab:hover {
  background: #f3f4f6;
}

.shift-tab.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Team Assignment Form */
.team-assignment-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section h3 i {
  color: #3b82f6;
}

/* Vue Select Custom Styling */
.pegawai-select :deep(.vs__dropdown-toggle) {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  min-height: 48px;
}

.pegawai-select :deep(.vs__search) {
  font-size: 1rem;
  color: #1f2937;
  padding: 0.375rem 0;
}

.pegawai-select :deep(.vs__search::placeholder) {
  color: #9ca3af;
}

.pegawai-select :deep(.vs__selected) {
  font-size: 1rem;
  color: #1f2937;
  padding: 0.25rem 0;
  margin: 0;
}

.pegawai-select :deep(.vs__dropdown-toggle):focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.pegawai-select :deep(.vs__dropdown-menu) {
  border: 2px solid #3b82f6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 250px;
}

.pegawai-select :deep(.vs__dropdown-option) {
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
}

.pegawai-select :deep(.vs__dropdown-option--highlight) {
  background: #3b82f6;
  color: white;
}

.pegawai-select :deep(.vs__clear) {
  margin-right: 0.25rem;
}

.leader-select :deep(.vs__dropdown-toggle) {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #ffffff 100%);
}

.leader-select :deep(.vs__selected) {
  font-weight: 600;
}

.anggota-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.anggota-item label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.btn-cancel,
.btn-save {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
