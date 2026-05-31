<template>
  <div class="tim-akred-page">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="header-content d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1><i class="fas fa-shield-alt text-primary"></i> Tim Akreditasi</h1>
          <p class="text-muted mb-0">Kelompok Kerja & Organisasi Akreditasi Rumah Sakit Ibu dan Anak Aisyiyah Pekajangan</p>
        </div>
        <button @click="openAddModal" class="btn btn-primary btn-add px-4 py-2.5 shadow-sm d-flex align-items-center gap-2">
          <i class="fas fa-user-plus"></i>
          <span>Tambah Anggota</span>
        </button>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="stats-card glass-card">
          <div class="stats-icon bg-soft-primary"><i class="fas fa-users"></i></div>
          <div class="stats-info">
            <span class="stats-label">Total Anggota</span>
            <span class="stats-value">{{ totalCount }}</span>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stats-card glass-card">
          <div class="stats-icon bg-soft-purple"><i class="fas fa-user-shield"></i></div>
          <div class="stats-info">
            <span class="stats-label">Tim Inti</span>
            <span class="stats-value">{{ intiCount }}</span>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stats-card glass-card">
          <div class="stats-icon bg-soft-success"><i class="fas fa-folder-open"></i></div>
          <div class="stats-info">
            <span class="stats-label">Total Pokja</span>
            <span class="stats-value">{{ pokjaList.length }}</span>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stats-card glass-card">
          <div class="stats-icon bg-soft-info"><i class="fas fa-network-wired"></i></div>
          <div class="stats-info">
            <span class="stats-label">Anggota Pokja</span>
            <span class="stats-value">{{ totalCount - intiCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Area -->
    <div class="controls-section glass-card p-3 mb-4">
      <div class="d-flex flex-column gap-3">
        <!-- Search -->
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery" 
            @input="handleSearch"
            type="text" 
            class="search-input"
            placeholder="Cari nama, NIK, peran, atau keterangan..."
          >
        </div>
        
        <!-- Filter Tabs / Scrolling List -->
        <div class="pokja-tabs-container">
          <div class="pokja-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: selectedPokjaFilter === null }"
              @click="setPokjaFilter(null)"
            >
              Semua
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: selectedPokjaFilter === 'inti' }"
              @click="setPokjaFilter('inti')"
            >
              Tim Inti
            </button>
            <button 
              v-for="pokja in pokjaList" 
              :key="pokja.id" 
              class="tab-btn"
              :class="{ active: selectedPokjaFilter === pokja.id }"
              @click="setPokjaFilter(pokja.id)"
              :title="pokja.nama_lengkap"
            >
              {{ pokja.kode }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5 my-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted fw-bold">Memuat data tim akreditasi...</p>
    </div>

    <!-- Data Layout -->
    <div v-else>
      <div v-if="filteredTeamList.length === 0" class="empty-state glass-card text-center py-5">
        <div class="empty-icon-container mb-3">
          <i class="fas fa-user-slash float-icon"></i>
          <div class="empty-shadow"></div>
        </div>
        <h4 class="fw-bold text-dark">Data Tidak Ditemukan</h4>
        <p class="text-muted">Belum ada anggota tim akreditasi yang terdaftar di kategori/pencarian ini.</p>
        <button @click="resetFilters" class="btn btn-outline-primary btn-sm px-4 fw-bold">
          <i class="fas fa-redo me-2"></i>Reset Filter
        </button>
      </div>

      <!-- Grid Cards -->
      <div v-else class="team-grid animate__animated animate__fadeIn">
        <div v-for="member in filteredTeamList" :key="member.id" class="team-card glass-card">
          <!-- Card Header Decoration -->
          <div class="card-bg-glow" :class="getRoleColorClass(member.role)"></div>
          
          <div class="card-body-content p-4">
            <!-- Member Photo / Initials -->
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="member-photo-container">
                <div class="initials-placeholder" :class="getRoleColorClass(member.role)">
                  {{ getInitials(member.pegawai?.nama) }}
                </div>
              </div>
              <div>
                <h3 class="member-name text-truncate" :title="member.pegawai?.nama || 'Nama Tidak Ditemukan'">
                  {{ member.pegawai?.nama || 'Nama Tidak Ditemukan' }}
                </h3>
                <span class="member-nik"><i class="far fa-id-card me-1"></i> {{ member.nik || '-' }}</span>
              </div>
            </div>

            <!-- Role and Pokja Badges -->
            <div class="d-flex flex-wrap gap-2 mb-3">
              <span class="badge-role" :class="getRoleColorClass(member.role)">
                {{ member.role }}
              </span>
              <span v-if="member.pokja" class="badge-pokja" :title="member.pokja.nama_lengkap">
                Pokja: {{ member.pokja.kode }}
              </span>
              <span v-else class="badge-pokja bg-secondary-subtle text-secondary">
                Struktur Inti
              </span>
            </div>

            <!-- Description / Meta info -->
            <div class="member-meta mb-3">
              <p v-if="member.keterangan" class="member-keterangan mb-0">
                <i class="fas fa-info-circle text-muted me-1"></i> {{ member.keterangan }}
              </p>
              <p v-else class="member-keterangan text-muted-italic mb-0">
                Tidak ada keterangan tambahan
              </p>
            </div>

            <!-- Card Actions -->
            <div class="card-actions d-flex justify-content-end gap-2 border-top pt-3">
              <button @click="openEditModal(member)" class="btn-action-icon btn-edit" title="Edit Anggota">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button @click="confirmDelete(member)" class="btn-action-icon btn-delete" title="Hapus Anggota">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form CRUD -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card animate__animated animate__zoomIn animate__faster">
        <div class="modal-header d-flex justify-content-between align-items-center p-4 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="modal-icon-container" :class="isEditMode ? 'bg-soft-warning text-warning' : 'bg-soft-primary text-primary'">
              <i class="fas" :class="isEditMode ? 'fa-user-edit' : 'fa-user-plus'"></i>
            </div>
            <div>
              <h2 class="modal-title mb-0">{{ isEditMode ? 'Edit Anggota Tim' : 'Tambah Anggota Tim' }}</h2>
              <span class="text-muted small">Silakan lengkapi informasi pengurus akreditasi di bawah</span>
            </div>
          </div>
          <button @click="closeModal" class="btn-close-modal"><i class="fas fa-times"></i></button>
        </div>

        <div class="modal-body p-4">
          <!-- Selection (Create Mode Only) -->
          <div v-if="!isEditMode" class="form-group mb-3">
            <label class="form-label-custom">Cari Pegawai <span class="text-danger">*</span></label>
            <VueSelect
              v-model="selectedPegawai"
              :options="pegawaiList"
              label="nama"
              placeholder="Ketik NIK atau Nama Pegawai..."
              @search="onSearchPegawai"
              class="v-select-custom"
            >
              <template #option="{ nama, nik }">
                <div class="d-flex flex-column py-1">
                  <span class="fw-bold text-dark">{{ nama }}</span>
                  <span class="text-muted small">NIK: {{ nik }}</span>
                </div>
              </template>
              <template #no-options="{ search, searching }">
                <div class="p-3 text-center text-muted small">
                  <i class="fas" :class="searching ? 'fa-search' : 'fa-keyboard'"></i>
                  <span class="ms-2">{{ searching ? `Tidak ada hasil untuk "${search}"` : 'Ketik nama pegawai...' }}</span>
                </div>
              </template>
            </VueSelect>
          </div>

          <!-- Readonly Name (Edit Mode Only) -->
          <div v-else class="form-group mb-3">
            <label class="form-label-custom">Nama Pegawai</label>
            <input type="text" class="form-control-custom bg-light" :value="formData.nama" readonly disabled>
          </div>

          <div class="row g-3">
            <!-- Role Selection -->
            <div class="col-12 col-md-6">
              <div class="form-group mb-3">
                <label class="form-label-custom">Role Akreditasi <span class="text-danger">*</span></label>
                <select v-model="formData.role" class="form-select-custom">
                  <option value="" disabled>Pilih Role...</option>
                  <option v-for="role in rolesOptions" :key="role" :value="role">{{ role }}</option>
                </select>
              </div>
            </div>

            <!-- Pokja Selection -->
            <div class="col-12 col-md-6">
              <div class="form-group mb-3">
                <label class="form-label-custom">Pokja / BAB</label>
                <select v-model="formData.pokja_id" class="form-select-custom">
                  <option :value="null">Struktur Inti (Non-Pokja)</option>
                  <option v-for="pokja in pokjaList" :key="pokja.id" :value="pokja.id">
                    {{ pokja.kode }} - {{ pokja.nama_lengkap }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Keterangan -->
          <div class="form-group mb-2">
            <label class="form-label-custom">Keterangan / Detail Jabatan</label>
            <input 
              v-model="formData.keterangan" 
              type="text" 
              class="form-control-custom" 
              placeholder="Contoh: Sekretaris II, Anggota Pokja, dsb."
            >
          </div>
        </div>

        <div class="modal-footer p-4 border-top d-flex justify-content-end gap-2 bg-light">
          <button @click="closeModal" class="btn btn-outline-secondary px-4 fw-bold">Batal</button>
          <button @click="saveMember" class="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span>
            <span>{{ saving ? 'Menyimpan...' : 'Simpan Data' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import Swal from 'sweetalert2'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import akreditasiService from '@/services/akreditasiService'
import { pegawaiService } from '@/services/pegawaiService'

// States
const teamList = ref([])
const pokjaList = ref([])
const pegawaiList = ref([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const selectedPokjaFilter = ref(null)
const showModal = ref(false)
const isEditMode = ref(false)
const selectedPegawai = ref(null)

const formData = reactive({
  id: null,
  nik: '',
  nama: '',
  pokja_id: null,
  role: '',
  keterangan: ''
})

const rolesOptions = [
  'Penanggung Jawab',
  'Pembina',
  'Asesor Internal',
  'Ketua I Tim',
  'Ketua II Tim',
  'Sekretaris',
  'Bendahara',
  'IT',
  'Ketua Pokja',
  'Sekretaris Pokja',
  'Anggota Pokja'
]

// Computed Stats
const totalCount = computed(() => teamList.value.length)
const intiCount = computed(() => teamList.value.filter(m => m.pokja_id === null).length)

// Filtered Team List
const filteredTeamList = computed(() => {
  let list = teamList.value

  // Search Filter
  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(m => {
      const nameMatch = m.pegawai?.nama?.toLowerCase().includes(q)
      const nikMatch = m.nik?.toLowerCase().includes(q)
      const roleMatch = m.role?.toLowerCase().includes(q)
      const ketMatch = m.keterangan?.toLowerCase().includes(q)
      return nameMatch || nikMatch || roleMatch || ketMatch
    })
  }

  // Pokja Tab Filter
  if (selectedPokjaFilter.value === 'inti') {
    list = list.filter(m => m.pokja_id === null)
  } else if (selectedPokjaFilter.value !== null) {
    list = list.filter(m => m.pokja_id === selectedPokjaFilter.value)
  }

  return list
})

// Methods
const loadTeam = async () => {
  loading.value = true
  try {
    const response = await akreditasiService.getTim({ 
      include: 'pegawai,pokja',
      limit: 1000 // Load all members since we have ~150 and want to filter client-side smoothly
    })
    teamList.value = response.data.data || []
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Gagal memuat data tim akreditasi', 'error')
  } finally {
    loading.value = false
  }
}

const loadPokja = async () => {
  try {
    const response = await akreditasiService.getPokja()
    // Sort pokjas by their urutan field
    pokjaList.value = (response.data.data || []).sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
  } catch (error) {
    console.error(error)
  }
}

const onSearchPegawai = async (search, loadingStatus) => {
  if (search.length < 3) {
    pegawaiList.value = []
    return
  }
  loadingStatus(true)
  try {
    const response = await pegawaiService.searchPegawai(search)
    pegawaiList.value = response.data.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loadingStatus(false)
  }
}

// Filters Toggle
const setPokjaFilter = (val) => {
  selectedPokjaFilter.value = val
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedPokjaFilter.value = null
}

// Avatar Helpers
const getInitials = (name) => {
  if (!name) return '?'
  const cleanName = name.split(',')[0].replace(/\./g, '')
  const parts = cleanName.split(' ').filter(p => p.trim().length > 0)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0] ? parts[0].substring(0, 2).toUpperCase() : '?'
}

// Badges Color Mapper
const getRoleColorClass = (role) => {
  const mapping = {
    'Penanggung Jawab': 'role-red',
    'Pembina': 'role-purple',
    'Asesor Internal': 'role-orange',
    'Ketua I Tim': 'role-blue',
    'Ketua II Tim': 'role-blue-light',
    'Sekretaris': 'role-teal',
    'Bendahara': 'role-green',
    'IT': 'role-indigo',
    'Ketua Pokja': 'role-teal-dark',
    'Sekretaris Pokja': 'role-cyan',
    'Anggota Pokja': 'role-gray'
  }
  return mapping[role] || 'role-gray'
}

// CRUD Modal Actions
const openAddModal = () => {
  isEditMode.value = false
  selectedPegawai.value = null
  pegawaiList.value = []
  
  formData.id = null
  formData.nik = ''
  formData.nama = ''
  formData.pokja_id = null
  formData.role = ''
  formData.keterangan = ''
  
  showModal.value = true
}

const openEditModal = (member) => {
  isEditMode.value = true
  formData.id = member.id
  formData.nik = member.nik
  formData.nama = member.pegawai?.nama || 'Nama Tidak Ditemukan'
  formData.pokja_id = member.pokja_id
  formData.role = member.role
  formData.keterangan = member.keterangan || ''
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveMember = async () => {
  if (!isEditMode.value && !selectedPegawai.value) {
    Swal.fire('Warning', 'Silakan pilih pegawai terlebih dahulu', 'warning')
    return
  }
  if (!formData.role) {
    Swal.fire('Warning', 'Role akreditasi harus diisi', 'warning')
    return
  }

  saving.value = true
  try {
    const payload = {
      role: formData.role,
      pokja_id: formData.pokja_id,
      keterangan: formData.keterangan || null
    }

    if (isEditMode.value) {
      await akreditasiService.updateTim(formData.id, payload)
      Swal.fire('Sukses', 'Anggota tim berhasil diperbarui', 'success')
    } else {
      payload.nik = selectedPegawai.value.nik
      payload.nip = selectedPegawai.value.nik // Set NIP identical to NIK as mapped in DB
      await akreditasiService.createTim(payload)
      Swal.fire('Sukses', 'Anggota tim baru berhasil ditambahkan', 'success')
    }
    closeModal()
    loadTeam()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data anggota', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (member) => {
  const result = await Swal.fire({
    title: 'Hapus Anggota?',
    text: `Apakah Anda yakin ingin menghapus ${member.pegawai?.nama || 'anggota ini'} dari Tim Akreditasi?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await akreditasiService.deleteTim(member.id)
      Swal.fire('Terhapus', 'Anggota berhasil dihapus dari tim.', 'success')
      loadTeam()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'Gagal menghapus anggota tim', 'error')
    }
  }
}

// Debounced Search Handler
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Computed list automatically refreshes, no fetch needed since we filter in-memory
  }, 200)
}

onMounted(() => {
  loadTeam()
  loadPokja()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.tim-akred-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1e293b;
  min-height: 100vh;
  padding: 1rem 0.5rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
}

.btn-add {
  width: auto !important;
  white-space: nowrap;
}

/* Glassmorphism Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.04);
}

/* Stats Cards */
.stats-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  transition: transform 0.25s ease;
}

.stats-card:hover {
  transform: translateY(-3px);
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.bg-soft-primary { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
.bg-soft-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.bg-soft-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.bg-soft-info { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

/* Controls */
.controls-section {
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

/* Scrolling Tabs */
.pokja-tabs-container {
  overflow-x: auto;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(37, 99, 235, 0.25) rgba(0, 0, 0, 0.05);
  padding-bottom: 8px;
}

.pokja-tabs-container::-webkit-scrollbar {
  height: 6px;
  display: block;
}

.pokja-tabs-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 10px;
}

.pokja-tabs-container::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.25);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.pokja-tabs-container::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.5);
}

.pokja-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 2px 0;
}

.tab-btn {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  font-size: 0.825rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tab-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

/* Team Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.team-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.08);
}

.card-bg-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
}

/* Photo container */
.member-photo-container {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
}

.member-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initials-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
  text-transform: uppercase;
}

.member-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.15rem;
  line-height: 1.3;
  max-width: 200px;
}

.member-nik {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

/* Role coloring */
.role-red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.role-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.role-orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.role-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.role-blue-light { background: rgba(96, 165, 250, 0.1); color: #2563eb; }
.role-teal { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
.role-green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.role-indigo { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.role-teal-dark { background: rgba(15, 118, 110, 0.1); color: #0f766e; }
.role-cyan { background: rgba(6, 182, 212, 0.1); color: #0891b2; }
.role-gray { background: rgba(100, 116, 139, 0.1); color: #64748b; }

.badge-role {
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.725rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.badge-pokja {
  background: rgba(241, 245, 249, 0.9);
  color: #334155;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.725rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
}

.member-keterangan {
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
  line-height: 1.4;
}

.text-muted-italic {
  font-size: 0.8rem;
  color: #94a3b8;
  font-style: italic;
}

/* Card Actions */
.btn-action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.825rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-action-icon:hover {
  transform: scale(1.05);
}

.btn-edit:hover {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.2);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

/* Empty State & Animation */
.empty-state {
  padding: 4rem 2rem;
  border: 1px dashed #cbd5e1;
}

.empty-icon-container {
  position: relative;
  width: 80px;
  margin: 0 auto;
}

.float-icon {
  font-size: 3rem;
  color: #94a3b8;
  animation: floatIcon 3s ease-in-out infinite;
}

.empty-shadow {
  width: 40px;
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  margin: 8px auto 0;
  filter: blur(1px);
  animation: floatShadow 3s ease-in-out infinite;
}

@keyframes floatIcon {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes floatShadow {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(0.7); opacity: 0.4; filter: blur(2px); }
  100% { transform: scale(1); opacity: 0.8; }
}

/* Modals & Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.modal-icon-container {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-close-modal {
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
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  background: #ef4444;
  color: white;
}

.form-label-custom {
  display: block;
  font-size: 0.825rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-control-custom {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.925rem;
  font-weight: 500;
  color: #1e293b;
  transition: border-color 0.2s;
  background: #f8fafc;
}

.form-control-custom:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
}

.form-select-custom {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.925rem;
  font-weight: 500;
  color: #1e293b;
  background: #f8fafc url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") no-repeat right 1rem center/0.75rem;
  appearance: none;
  transition: border-color 0.2s;
}

.form-select-custom:focus {
  outline: none;
  border-color: #2563eb;
  background-color: white;
}

/* Custom Vue Select inside Modal */
.v-select-custom :deep(.vs__dropdown-toggle) {
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 5px 6px;
  background: #f8fafc;
}

.v-select-custom :deep(.vs--open .vs__dropdown-toggle) {
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.v-select-custom :deep(.vs__dropdown-menu) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  padding: 8px;
}

.v-select-custom :deep(.vs__dropdown-option--highlight) {
  background: #2563eb;
  border-radius: 8px;
}

.v-select-custom :deep(.vs__selected) {
  font-weight: 600;
  color: #1e293b;
}

/* Responsiveness overrides */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>
