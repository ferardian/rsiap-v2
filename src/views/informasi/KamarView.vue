<template>
  <div class="kamar-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1><i class="fas fa-bed"></i> Master Data Kamar</h1>
          <p>Data master kamar rawat inap</p>
        </div>
        <button @click="openAddModal" class="btn-add">
          <i class="fas fa-plus"></i>
          Tambah Kamar
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        @click="activeTab = 'kamar'" 
        :class="['tab-button', { active: activeTab === 'kamar' }]"
      >
        <i class="fas fa-bed"></i>
        Data Kamar
      </button>
      <button 
        @click="activeTab = 'indent'" 
        :class="['tab-button', { active: activeTab === 'indent' }]"
      >
        <i class="fas fa-bookmark"></i>
        Indent Kamar
      </button>
    </div>

    <!-- Kamar Tab Content -->

    <!-- Filters -->
    <div v-if="activeTab === 'kamar'" class="filters-section">
      <div class="filter-row">
        <!-- Search -->
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            @input="handleSearch"
            type="text" 
            placeholder="Cari kode kamar..."
          >
        </div>

        <!-- Filter Bangsal -->
        <select v-model="selectedBangsal" @change="loadKamar" class="filter-select">
          <option value="">Semua Bangsal</option>
          <option v-for="bangsal in bangsalList" :key="bangsal.kd_bangsal" :value="bangsal.kd_bangsal">
            {{ bangsal.nm_bangsal }}
          </option>
        </select>

        <!-- Filter Status -->
        <select v-model="selectedStatus" @change="loadKamar" class="filter-select">
          <option value="">Semua Status</option>
          <option value="KOSONG">Kosong</option>
          <option value="ISI">Isi</option>
          <option value="DIBERSIHKAN">Dibersihkan</option>
          <option value="DIBOOKING">Dibooking</option>
        </select>

        <!-- Filter Kelas -->
        <select v-model="selectedKelas" @change="loadKamar" class="filter-select">
          <option value="">Semua Kelas</option>
          <option value="Kelas 1">Kelas 1</option>
          <option value="Kelas 2">Kelas 2</option>
          <option value="Kelas 3">Kelas 3</option>
          <option value="Kelas Utama">Kelas Utama</option>
          <option value="Kelas VIP">Kelas VIP</option>
          <option value="Kelas VVIP">Kelas VVIP</option>
        </select>
      </div>
    </div>

    <!-- Kamar Table -->
    <div v-if="activeTab === 'kamar'" class="table-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat data...</p>
      </div>

      <table v-else class="kamar-table">
        <thead>
          <tr>
            <th>Kode Kamar</th>
            <th>Bangsal</th>
            <th>Kelas</th>
            <th>Status</th>
            <th>Tarif</th>
            <th class="actions-col">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="kamar in kamarList" :key="kamar.kd_kamar">
            <td class="kamar-code">{{ kamar.kd_kamar }}</td>
            <td>{{ kamar.bangsal?.nm_bangsal || '-' }}</td>
            <td>
              <span class="kelas-badge" :class="`kelas-${getKelasClass(kamar.kelas)}`">
                {{ kamar.kelas }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="`status-${kamar.status?.toLowerCase()}`">
                {{ kamar.status }}
              </span>
            </td>
            <td class="tarif">{{ formatCurrency(kamar.trf_kamar) }}</td>
            <td class="actions">
              <button @click="openEditModal(kamar)" class="btn-edit" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteKamar(kamar)" class="btn-delete" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="kamarList.length === 0">
            <td colspan="6" class="no-data">
              <i class="fas fa-inbox"></i>
              <p>Tidak ada data kamar</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <i class="fas fa-bed"></i>
            {{ isEditMode ? 'Edit Kamar' : 'Tambah Kamar' }}
          </h2>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveKamar" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Kode Kamar <span class="required">*</span></label>
              <input 
                v-model="formData.kd_kamar" 
                type="text" 
                required
                :disabled="isEditMode"
                placeholder="Contoh: 101"
              >
            </div>

            <div class="form-group">
              <label>Bangsal <span class="required">*</span></label>
              <select v-model="formData.kd_bangsal" required>
                <option value="">Pilih Bangsal</option>
                <option v-for="bangsal in bangsalList" :key="bangsal.kd_bangsal" :value="bangsal.kd_bangsal">
                  {{ bangsal.nm_bangsal }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Kelas <span class="required">*</span></label>
              <select v-model="formData.kelas" required>
                <option value="">Pilih Kelas</option>
                <option value="Kelas 1">Kelas 1</option>
                <option value="Kelas 2">Kelas 2</option>
                <option value="Kelas 3">Kelas 3</option>
                <option value="Kelas Utama">Kelas Utama</option>
                <option value="Kelas VIP">Kelas VIP</option>
                <option value="Kelas VVIP">Kelas VVIP</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status <span class="required">*</span></label>
              <select v-model="formData.status" required>
                <option value="">Pilih Status</option>
                <option value="KOSONG">Kosong</option>
                <option value="ISI">Isi</option>
                <option value="DIBERSIHKAN">Dibersihkan</option>
                <option value="DIBOOKING">Dibooking</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Tarif <span class="required">*</span></label>
            <input 
              v-model.number="formData.trf_kamar" 
              type="number" 
              required
              placeholder="Contoh: 300000"
              min="0"
            >
          </div>

          <!-- Conditional Keterangan for DIBOOKING -->
          <div v-if="formData.status === 'DIBOOKING'" class="form-group">
            <label>Keterangan Booking <span class="required">*</span></label>
            <textarea 
              v-model="formData.keterangan_booking" 
              rows="3"
              required
              placeholder="Masukkan keterangan booking (nama pasien, dll)"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Batal
            </button>
            <button type="submit" class="btn-submit" :disabled="saving">
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Indent Tab Content -->
    <div v-if="activeTab === 'indent'" class="indent-section">
      <!-- Search -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="indentSearchQuery" 
            @input="handleIndentSearch"
            type="text" 
            placeholder="Cari kode kamar atau keterangan..."
          >
        </div>
      </div>

      <!-- Indent Table -->
      <div class="table-container">
        <div v-if="loadingIndent" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Memuat data...</p>
        </div>

        <table v-else class="kamar-table">
          <thead>
            <tr>
              <th>Kode Kamar</th>
              <th>Bangsal</th>
              <th>Keterangan</th>
              <th>Tanggal Input</th>
              <th class="actions-col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="indent in indentList" :key="indent.kd_indent">
              <td class="kamar-code">{{ indent.kd_kamar }}</td>
              <td>{{ indent.kamar?.bangsal?.nm_bangsal || '-' }}</td>
              <td>{{ indent.pasien }}</td>
              <td>{{ formatDateTime(indent.tanggal_input) }}</td>
              <td class="actions">
                <button @click="openEditIndentModal(indent)" class="btn-edit" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteIndent(indent)" class="btn-delete" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="indentList.length === 0">
              <td colspan="7" class="no-data">
                <i class="fas fa-inbox"></i>
                <p>Tidak ada data indent kamar</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Indent Edit Modal -->
    <div v-if="showIndentModal" class="modal-overlay" @click.self="closeIndentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <i class="fas fa-bookmark"></i>
            Edit Indent Kamar
          </h2>
          <button @click="closeIndentModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveIndent" class="modal-form">
          <div class="form-group">
            <label>Kode Kamar</label>
            <input 
              :value="indentFormData.kd_kamar" 
              type="text" 
              disabled
            >
          </div>

          <div class="form-group">
            <label>Keterangan <span class="required">*</span></label>
            <textarea 
              v-model="indentFormData.pasien" 
              rows="3"
              required
              placeholder="Masukkan keterangan booking"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeIndentModal" class="btn-cancel">
              Batal
            </button>
            <button type="submit" class="btn-submit" :disabled="savingIndent">
              <i class="fas" :class="savingIndent ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ savingIndent ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import kamarService from '@/services/kamarService'
import Swal from 'sweetalert2'

// State
const loading = ref(false)
const kamarList = ref([])
const bangsalList = ref([])
const searchQuery = ref('')
const selectedBangsal = ref('')
const selectedStatus = ref('')
const selectedKelas = ref('')

// Tab state
const activeTab = ref('kamar')

// Indent state
const loadingIndent = ref(false)
const indentList = ref([])
const indentSearchQuery = ref('')

// Indent modal state
const showIndentModal = ref(false)
const savingIndent = ref(false)
const indentFormData = ref({
  kd_indent: null,
  kd_kamar: '',
  pasien: ''
})

// Modal state
const showModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const formData = ref({
  kd_kamar: '',
  kd_bangsal: '',
  kelas: '',
  status: '',
  trf_kamar: 0,
  keterangan_booking: ''
})

// Load kamar data
const loadKamar = async () => {
  loading.value = true
  try {
    const params = {
      limit: 1000
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (selectedBangsal.value) {
      params.kd_bangsal = selectedBangsal.value
    }

    if (selectedStatus.value) {
      params.status = selectedStatus.value
    }

    if (selectedKelas.value) {
      params.kelas = selectedKelas.value
    }

    const response = await kamarService.getKamar(params)
    kamarList.value = response.data.data || []
  } catch (error) {
    console.error('Error loading kamar:', error)
  } finally {
    loading.value = false
  }
}

// Load bangsal list
const loadBangsal = async () => {
  try {
    const response = await kamarService.getBangsal()
    bangsalList.value = response.data.data || []
  } catch (error) {
    console.error('Error loading bangsal:', error)
  }
}

// Search handler with debounce
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadKamar()
  }, 500)
}

// Format currency
const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

// Get kelas class for styling
const getKelasClass = (kelas) => {
  if (!kelas) return 'default'
  if (kelas.includes('VVIP')) return 'vvip'
  if (kelas.includes('VIP')) return 'vip'
  if (kelas.includes('Utama')) return 'utama'
  if (kelas.includes('1')) return '1'
  if (kelas.includes('2')) return '2'
  if (kelas.includes('3')) return '3'
  return 'default'
}

// Load indent data
const loadIndent = async () => {
  loadingIndent.value = true
  try {
    const params = {
      limit: 1000
    }

    if (indentSearchQuery.value) {
      params.search = indentSearchQuery.value
    }

    const response = await kamarService.getIndent(params)
    indentList.value = response.data.data || []
  } catch (error) {
    console.error('Error loading indent:', error)
  } finally {
    loadingIndent.value = false
  }
}

// Indent search handler with debounce
let indentSearchTimeout
const handleIndentSearch = () => {
  clearTimeout(indentSearchTimeout)
  indentSearchTimeout = setTimeout(() => {
    loadIndent()
  }, 500)
}

// Format datetime
const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Watch activeTab to load data
watch(activeTab, (newTab) => {
  if (newTab === 'indent') {
    loadIndent()
  }
})

// Modal functions
const openAddModal = () => {
  isEditMode.value = false
  formData.value = {
    kd_kamar: '',
    kd_bangsal: '',
    kelas: '',
    status: '',
    trf_kamar: 0,
    keterangan_booking: ''
  }
  showModal.value = true
}

const openEditModal = (kamar) => {
  isEditMode.value = true
  formData.value = {
    kd_kamar: kamar.kd_kamar,
    kd_bangsal: kamar.kd_bangsal,
    kelas: kamar.kelas,
    status: kamar.status,
    trf_kamar: kamar.trf_kamar,
    keterangan_booking: ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    kd_kamar: '',
    kd_bangsal: '',
    kelas: '',
    status: '',
    trf_kamar: 0,
    keterangan_booking: ''
  }
}

// Save kamar
const saveKamar = async () => {
  saving.value = true
  try {
    if (isEditMode.value) {
      await kamarService.updateKamar(formData.value.kd_kamar, formData.value)
    } else {
      await kamarService.createKamar(formData.value)
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Kamar berhasil ${isEditMode.value ? 'diupdate' : 'ditambahkan'}`,
      timer: 2000,
      showConfirmButton: false
    })

    closeModal()
    loadKamar()
  } catch (error) {
    console.error('Error saving kamar:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
    })
  } finally {
    saving.value = false
  }
}

// Delete kamar
const deleteKamar = async (kamar) => {
  const result = await Swal.fire({
    title: 'Hapus Kamar?',
    text: `Apakah Anda yakin ingin menghapus kamar ${kamar.kd_kamar}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await kamarService.deleteKamar(kamar.kd_kamar)
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Kamar berhasil dihapus',
        timer: 2000,
        showConfirmButton: false
      })

      loadKamar()
    } catch (error) {
      console.error('Error deleting kamar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menghapus data'
      })
    }
  }
}

// Indent modal functions
const openEditIndentModal = (indent) => {
  indentFormData.value = {
    kd_indent: indent.kd_indent,
    kd_kamar: indent.kd_kamar,
    pasien: indent.pasien
  }
  showIndentModal.value = true
}

const closeIndentModal = () => {
  showIndentModal.value = false
  indentFormData.value = {
    kd_indent: null,
    kd_kamar: '',
    pasien: ''
  }
}

// Save indent
const saveIndent = async () => {
  savingIndent.value = true
  try {
    await kamarService.updateIndent(indentFormData.value.kd_indent, {
      pasien: indentFormData.value.pasien
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Indent berhasil diupdate',
      timer: 2000,
      showConfirmButton: false
    })

    closeIndentModal()
    loadIndent()
  } catch (error) {
    console.error('Error saving indent:', error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
    })
  } finally {
    savingIndent.value = false
  }
}

// Delete indent
const deleteIndent = async (indent) => {
  const result = await Swal.fire({
    title: 'Hapus Indent?',
    text: `Apakah Anda yakin ingin menghapus indent untuk kamar ${indent.kd_kamar}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await kamarService.deleteIndent(indent.kd_indent)
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Indent berhasil dihapus',
        timer: 2000,
        showConfirmButton: false
      })

      loadIndent()
    } catch (error) {
      console.error('Error deleting indent:', error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menghapus data'
      })
    }
  }
}

// Initialize
onMounted(() => {
  loadKamar()
  loadBangsal()
})
</script>

<style scoped>
.kamar-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

/* Tabs */
.tabs-container {
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 0.5rem;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.tab-button.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* Filters */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.kamar-table {
  width: 100%;
  border-collapse: collapse;
}

.kamar-table thead {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.kamar-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kamar-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.kamar-table tbody tr:hover {
  background: #f9fafb;
}

.kamar-table td {
  padding: 1rem;
  color: #374151;
}

.kamar-code {
  font-weight: 600;
  color: #1f2937;
  font-family: 'Courier New', monospace;
}

.kelas-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.kelas-vvip {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.kelas-vip {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  color: white;
}

.kelas-utama {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
}

.kelas-1 {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.kelas-2 {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.kelas-3 {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-kosong {
  background: #d1fae5;
  color: #065f46;
}

.status-isi {
  background: #fee2e2;
  color: #991b1b;
}

.status-dibersihkan {
  background: #dbeafe;
  color: #1e40af;
}

.status-dibooking {
  background: #fef3c7;
  color: #92400e;
}

.tarif {
  font-weight: 600;
  color: #059669;
}

.loading-state {
  padding: 4rem;
  text-align: center;
  color: #6b7280;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.no-data {
  text-align: center;
  padding: 4rem !important;
  color: #9ca3af;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.no-data p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .kamar-page {
    padding: 1rem;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .kamar-table {
    font-size: 0.875rem;
  }

  .kamar-table th,
  .kamar-table td {
    padding: 0.75rem 0.5rem;
  }
}

/* Header Button */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-add {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Action Buttons */
.actions-col {
  text-align: center;
  width: 120px;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
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
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
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
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>
