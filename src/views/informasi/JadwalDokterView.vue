<template>
  <div class="jadwal-dokter-page">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1><i class="fas fa-calendar-alt"></i> Jadwal Dokter</h1>
          <p>Jadwal praktik dokter per hari dan poliklinik</p>
        </div>
        <button @click="openAddModal" class="btn-add-schedule">
          <i class="fas fa-plus"></i>
          <span>Tambah Jadwal</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label><i class="fas fa-search"></i> Cari Dokter</label>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Nama dokter..."
          class="search-input"
        >
      </div>

      <div class="filter-group">
        <label><i class="fas fa-hospital"></i> Poliklinik</label>
        <select v-model="selectedPoli" @change="loadSchedules" class="filter-select">
          <option value="">Semua Poli</option>
          <option v-for="poli in poliList" :key="poli.kd_poli" :value="poli.kd_poli">
            {{ poli.nm_poli }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label><i class="fas fa-calendar-day"></i> Hari</label>
        <select v-model="selectedDay" @change="loadSchedules" class="filter-select">
          <option value="">Semua Hari</option>
          <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat jadwal...</p>
    </div>

    <!-- Schedule Display -->
    <div v-else class="schedule-container">
      <div v-for="day in days" :key="day" class="day-section">
        <h2 class="day-header">
          <i class="fas fa-calendar"></i>
          {{ day }}
        </h2>

        <div v-if="getSchedulesByDay(day).length > 0" class="schedule-grid">
          <div 
            v-for="schedule in getSchedulesByDay(day)" 
            :key="`${schedule.kd_dokter}-${schedule.jam_mulai}`"
            class="schedule-card"
          >
            <div class="poli-badge-top">
              {{ schedule.poliklinik?.nm_poli || 'N/A' }}
            </div>

            <div class="card-content">
              <div class="card-actions">
                <button @click="openEditModal(schedule)" class="btn-action btn-edit" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(schedule)" class="btn-action btn-delete" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <div class="doctor-section">
                <h3 class="doctor-name">{{ schedule.dokter?.nm_dokter || 'N/A' }}</h3>
                <span class="spesialis-tag">{{ schedule.dokter?.spesialis?.nm_sps || 'Umum' }}</span>
              </div>

              <div class="schedule-info">
                <div class="time-info">
                  <i class="fas fa-clock"></i>
                  <span>{{ formatTime(schedule.jam_mulai) }} - {{ formatTime(schedule.jam_selesai) }}</span>
                </div>

                <div class="kuota-info" v-if="schedule.kuota">
                  <i class="fas fa-users"></i>
                  <span>Kuota: {{ schedule.kuota }} pasien</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-schedule">
          <i class="fas fa-calendar-times"></i>
          <p>Tidak ada jadwal praktik</p>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <i class="fas" :class="isEditMode ? 'fa-edit' : 'fa-plus'"></i>
            {{ isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal' }}
          </h2>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Dokter <span class="required">*</span></label>
            <VueSelect
              v-model="formData.kd_dokter"
              :options="dokterList"
              :reduce="dokter => dokter.kd_dokter"
              label="nm_dokter"
              placeholder="Pilih Dokter"
              :disabled="isEditMode"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Hari <span class="required">*</span></label>
              <select v-model="formData.hari_kerja">
                <option value="">Pilih Hari</option>
                <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Poliklinik <span class="required">*</span></label>
              <VueSelect
                v-model="formData.kd_poli"
                :options="poliListAll"
                :reduce="poli => poli.kd_poli"
                label="nm_poli"
                placeholder="Pilih Poli"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Jam Mulai <span class="required">*</span></label>
              <input type="time" v-model="formData.jam_mulai">
            </div>

            <div class="form-group">
              <label>Jam Selesai <span class="required">*</span></label>
              <input type="time" v-model="formData.jam_selesai">
            </div>
          </div>

          <div class="form-group">
            <label>Kuota Pasien</label>
            <input type="number" v-model.number="formData.kuota" min="0" placeholder="Contoh: 50">
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Batal</button>
          <button @click="saveSchedule" class="btn-save" :disabled="saving">
            <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'
import jadwalService from '@/services/jadwalService'
import dokterService from '@/services/dokterService'
import poliklinikService from '@/services/poliklinikService'

// Reactive data
const loading = ref(false)
const schedules = ref([])
const searchQuery = ref('')
const selectedPoli = ref('')
const selectedDay = ref('')
const poliList = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const dokterList = ref([])
const poliListAll = ref([])

const days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'AKHAD']

const formData = ref({
  kd_dokter: '',
  hari_kerja: '',
  jam_mulai: '',
  jam_selesai: '',
  kd_poli: '',
  kuota: null
})

// Load schedules
const loadSchedules = async () => {
  loading.value = true
  try {
    const params = {
      limit: 1000 // Increase limit to get all schedules
    }
    
    if (selectedPoli.value) {
      params.kd_poli = selectedPoli.value
    }
    
    if (selectedDay.value) {
      params.hari_kerja = selectedDay.value
    }

    const response = await jadwalService.getJadwalDokter(params)
    
    schedules.value = response.data.data || []
    
    // Extract unique poli for filter
    const uniquePoli = new Map()
    schedules.value.forEach(schedule => {
      if (schedule.poliklinik && !uniquePoli.has(schedule.kd_poli)) {
        uniquePoli.set(schedule.kd_poli, schedule.poliklinik)
      }
    })
    poliList.value = Array.from(uniquePoli.values())
  } catch (error) {
    console.error('Error loading schedules:', error)
    console.error('Error details:', error.response?.data)
  } finally {
    loading.value = false
  }
}

// Search handler with debounce
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadSchedules()
  }, 500)
}

// Get schedules by day
const getSchedulesByDay = (day) => {
  let filtered = schedules.value.filter(s => s.hari_kerja === day)
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.dokter?.nm_dokter?.toLowerCase().includes(query)
    )
  }
  
  // Sort by time
  return filtered.sort((a, b) => {
    return a.jam_mulai.localeCompare(b.jam_mulai)
  })
}

// Format time
const formatTime = (time) => {
  if (!time) return '-'
  return time.substring(0, 5) // HH:MM
}

// Modal functions
const openAddModal = () => {
  isEditMode.value = false
  formData.value = {
    kd_dokter: '',
    hari_kerja: '',
    jam_mulai: '',
    jam_selesai: '',
    kd_poli: '',
    kuota: null
  }
  showModal.value = true
}

const openEditModal = (schedule) => {
  isEditMode.value = true
  formData.value = {
    kd_dokter: schedule.kd_dokter,
    hari_kerja: schedule.hari_kerja,
    jam_mulai: schedule.jam_mulai.substring(0, 5), // HH:MM for input
    jam_selesai: schedule.jam_selesai.substring(0, 5),
    kd_poli: schedule.kd_poli,
    kuota: schedule.kuota,
    originalJamMulai: schedule.jam_mulai // Store original for backend search
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// Save schedule
const saveSchedule = async () => {
  // Validation
  if (!formData.value.kd_dokter || !formData.value.hari_kerja || !formData.value.jam_mulai || 
      !formData.value.jam_selesai || !formData.value.kd_poli) {
    Swal.fire({
      icon: 'warning',
      title: 'Data Tidak Lengkap',
      text: 'Mohon lengkapi semua field yang wajib diisi',
      confirmButtonColor: '#3b82f6'
    })
    return
  }

  saving.value = true
  try {
    // Add :00 suffix to match database format (HH:MM:SS)
    const dataToSend = {
      ...formData.value,
      jam_mulai: formData.value.jam_mulai + ':00',
      jam_selesai: formData.value.jam_selesai + ':00'
    }

    if (isEditMode.value) {
      // Use original jam_mulai for search, send new jam_mulai in data
      const searchKey = formData.value.originalJamMulai || dataToSend.jam_mulai
      await jadwalService.updateJadwal(
        dataToSend.kd_dokter,
        dataToSend.hari_kerja,
        searchKey,
        dataToSend
      )
    } else {
      await jadwalService.createJadwal(dataToSend)
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Jadwal berhasil ${isEditMode.value ? 'diupdate' : 'ditambahkan'}`,
      confirmButtonColor: '#3b82f6',
      timer: 2000,
      showConfirmButton: false
    })

    closeModal()
    loadSchedules()
  } catch (error) {
    console.error('Error saving schedule:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan jadwal',
      confirmButtonColor: '#3b82f6'
    })
  } finally {
    saving.value = false
  }
}

// Delete schedule
const confirmDelete = async (schedule) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Jadwal?',
    html: `Yakin ingin menghapus jadwal <strong>${schedule.dokter?.nm_dokter}</strong> pada hari <strong>${schedule.hari_kerja}</strong>?`,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  try {
    await jadwalService.deleteJadwal(
      schedule.kd_dokter,
      schedule.hari_kerja,
      schedule.jam_mulai
    )

    Swal.fire({
      icon: 'success',
      title: 'Terhapus!',
      text: 'Jadwal berhasil dihapus',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
      showConfirmButton: false
    })

    loadSchedules()
  } catch (error) {
    console.error('Error deleting schedule:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menghapus',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus jadwal',
      confirmButtonColor: '#3b82f6'
    })
  }
}

// Load master data
const loadDokterList = async () => {
  try {
    const response = await dokterService.getAllDokter({ limit: 1000 })
    dokterList.value = response.data.data || []
  } catch (error) {
    console.error('Error loading dokter:', error)
  }
}

const loadPoliList = async () => {
  try {
    const response = await poliklinikService.getAllPoliklinik({ limit: 1000 })
    poliListAll.value = response.data.data || []
  } catch (error) {
    console.error('Error loading poli:', error)
  }
}

// Initialize
onMounted(() => {
  loadSchedules()
  loadDokterList()
  loadPoliList()
})
</script>

<style scoped>
.jadwal-dokter-page {
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
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-content h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content h1 i {
  color: #3b82f6;
}

.header-content p {
  color: #6b7280;
  margin: 0;
}

/* Add Schedule Button */
.btn-add-schedule {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-add-schedule:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-add-schedule i {
  font-size: 1.125rem;
}

/* Filters */
.filters-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label i {
  color: #3b82f6;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus,
.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-state i {
  font-size: 3rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

/* Schedule Container */
.schedule-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.day-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.day-header {
  font-size: 1.25rem;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.day-header i {
  color: #3b82f6;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

/* Schedule Card */
.schedule-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.schedule-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

/* Poli Badge at Top */
.poli-badge-top {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card Content */
.card-content {
  padding: 1.25rem;
  position: relative;
}

/* Card Actions */
.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.schedule-card:hover .card-actions {
  opacity: 1;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Doctor Section */
.doctor-section {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.doctor-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  word-wrap: break-word;
}

.spesialis-tag {
  display: inline-block;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
}

/* Schedule Info */
.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-info,
.kuota-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #374151;
  font-weight: 500;
}

.time-info i,
.kuota-info i {
  color: #3b82f6;
  width: 20px;
  font-size: 1rem;
}

/* No Schedule */
.no-schedule {
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.no-schedule i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-schedule p {
  margin: 0;
  font-size: 1rem;
}

/* Modal */
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
  padding: 1rem;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header h2 i {
  color: #3b82f6;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 2px solid #f3f4f6;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: none;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* VueSelect Styling */
.form-group :deep(.v-select) {
  --vs-border-color: #e5e7eb;
  --vs-border-width: 2px;
  --vs-border-radius: 8px;
}

.form-group :deep(.v-select:focus-within) {
  --vs-border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group :deep(.vs__dropdown-toggle) {
  padding: 0.5rem 0.75rem;
}

.form-group :deep(.vs__search) {
  font-size: 1rem;
  padding: 0.25rem 0;
}

.form-group :deep(.vs__selected) {
  font-size: 1rem;
  color: #1f2937;
}

.form-group :deep(.vs__dropdown-menu) {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-group :deep(.vs__dropdown-option) {
  padding: 0.75rem 1rem;
}

.form-group :deep(.vs__dropdown-option--highlight) {
  background: #3b82f6;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .jadwal-dokter-page {
    padding: 1rem;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .schedule-grid {
    grid-template-columns: 1fr;
  }
}
</style>
