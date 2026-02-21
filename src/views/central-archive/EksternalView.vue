<template>
  <div class="eksternal-view-wrapper">
    <div class="eksternal-container">
      <!-- Hero Header -->
      <div class="hero-header">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="fas fa-envelope-open-text"></i>
          </div>
          <div>
            <h1 class="hero-title">
              Surat Eksternal
              <span class="mobile-stats-badge">{{ stats.total }} Surat</span>
            </h1>
            <p class="hero-subtitle">Manajemen arsip surat keluar ke instansi luar (eksternal) RSIA Aisyiyah Pekajangan</p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <span class="stat-label">Total Surat</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
          <div class="stat-card warning">
            <span class="stat-label">Pengajuan</span>
            <span class="stat-value">{{ stats.pengajuan }}</span>
          </div>
          <div class="stat-card success">
            <span class="stat-label">Disetujui</span>
            <span class="stat-value">{{ stats.disetujui }}</span>
          </div>
        </div>
      </div>

      <!-- Filter & Action Bar -->
      <div class="action-bar">
        <div class="filter-group">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari perihal, nomor surat, atau alamat tujuan..."
              @keyup.enter="handleSearch"
            >
          </div>
          <div class="date-filter">
            <input type="date" v-model="filters.tgl_terbit_start" class="filter-input">
            <span>s/d</span>
            <input type="date" v-model="filters.tgl_terbit_end" class="filter-input">
          </div>
          <select v-model="filters.status" class="filter-input status-select">
            <option value="">Semua Status</option>
            <option value="pengajuan">Pengajuan</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <button class="btn-filter" @click="handleSearch" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Terapkan
          </button>
        </div>
        <button class="btn-add" @click="openAddModal">
          <i class="fas fa-plus"></i>
          Buat Surat Baru
        </button>
      </div>

      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Unified Loading State -->
        <div v-if="loading" class="loading-state-unified">
          <div class="spinner-container">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
          <p>Memuat Arsip Surat...</p>
        </div>

        <!-- Unified Empty State -->
        <div v-else-if="suratList.length === 0" class="empty-state-unified">
          <div class="empty-icon-container">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3>Arsip Kosong</h3>
          <p>Tidak ada data surat eksternal ditemukan untuk kriteria ini.</p>
          <button class="btn-refresh-empty" @click="handleSearch">
            <i class="fas fa-sync-alt"></i> Segarkan Halaman
          </button>
        </div>
        
        <!-- Desktop Table View -->
        <div v-else class="table-responsive desktop-view">
          <table class="modern-table">
            <thead>
              <tr>
                <th width="150">No. Surat</th>
                <th>Perihal / Tujuan</th>
                <th width="180">Tgl Terbit</th>
                <th width="200">PJ</th>
                <th width="120">Status</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in suratList" :key="item.id" @click="viewDetail(item)">
                <td class="text-mono">{{ item.no_surat || '(Belum Terbit)' }}</td>
                <td>
                  <div class="fw-bold">{{ item.perihal }}</div>
                  <small class="text-muted"><i class="fas fa-map-marker-alt mr-1"></i> {{ item.alamat || '-' }}</small>
                </td>
                <td>{{ formatDate(item.tgl_terbit) }}</td>
                <td>
                  <div class="pj-info">
                    <span class="pj-name">{{ item.penanggung_jawab?.nama || '-' }}</span>
                    <small class="pj-nik text-muted">{{ item.pj }}</small>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', item.status]">
                    {{ capitalize(item.status) }}
                  </span>
                </td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button class="btn-icon edit" title="Edit" @click="openEditModal(item)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" title="Hapus" @click="confirmDelete(item)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div v-if="!loading && suratList.length > 0" class="mobile-view">
          <div v-for="item in suratList" :key="item.id" class="mobile-card" @click="viewDetail(item)">
            <div class="mobile-card-header">
              <span class="mobile-card-no text-mono">{{ item.no_surat || 'Draft' }}</span>
              <span :class="['status-badge-mini', item.status]">{{ capitalize(item.status) }}</span>
            </div>
            <div class="mobile-card-body">
              <h3 class="mobile-card-perihal">{{ item.perihal }}</h3>
              <div class="mobile-card-meta">
                <div class="meta-item">
                  <i class="far fa-calendar-alt"></i>
                  {{ formatDate(item.tgl_terbit) }}
                </div>
                <div class="meta-item">
                   <i class="fas fa-map-marker-alt"></i>
                  {{ item.alamat || '-' }}
                </div>
                <div class="meta-item">
                  <i class="far fa-user"></i>
                  {{ item.penanggung_jawab?.nama }}
                </div>
              </div>
            </div>
            <div class="mobile-card-footer" @click.stop>
              <button class="btn-mobile-edit" @click="openEditModal(item)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn-mobile-delete" @click="confirmDelete(item)">
                <i class="fas fa-trash"></i> Hapus
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination-footer">
          <button 
            :disabled="pagination.current_page === 1" 
            @click="changePage(pagination.current_page - 1)"
            class="btn-page"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}</span>
          <button 
            :disabled="pagination.current_page === pagination.last_page" 
            @click="changePage(pagination.current_page + 1)"
            class="btn-page"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Create/Edit) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container main-modal">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit Surat Eksternal' : 'Tambah Surat Eksternal' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSurat" id="suratForm">
            <div class="form-row">
              <div class="form-group col-full">
                <label>Perihal <span class="required">*</span></label>
                <input v-model="formData.perihal" type="text" placeholder="Contoh: Permohonan Kerjasama" required>
              </div>
            </div>

             <div class="form-row">
              <div class="form-group col-full">
                <label>Alamat / Instansi Tujuan <span class="required">*</span></label>
                <textarea v-model="formData.alamat" rows="2" placeholder="Masukkan alamat lengkap atau nama instansi tujuan..." required></textarea>
              </div>
            </div>
            
            <div class="form-row flex-row">
              <div class="form-group flex-1">
                <label>Tanggal Terbit <span class="required">*</span></label>
                <input v-model="formData.tgl_terbit" type="date" required>
              </div>
              <div class="form-group flex-1">
                <label>Status <span class="required">*</span></label>
                <select v-model="formData.status" required :disabled="!isEdit && !isKoordinator">
                  <option value="pengajuan">Pengajuan</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-full">
                <label>Penanggung Jawab <span class="required">*</span></label>
                <SearchableSelect 
                  v-model="formData.pj"
                  :options="pegawaiList"
                  label-key="nama"
                  value-key="nik"
                  placeholder="Cari PJ..."
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-full">
                <label>Catatan</label>
                <textarea v-model="formData.catatan" rows="3" placeholder="Tambahkan catatan jika diperlukan..."></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Batal</button>
          <button type="submit" form="suratForm" class="btn-save-modal" :disabled="submitting">
            <i class="fas" :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            {{ submitting ? 'Menyimpan...' : 'Simpan Surat' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Drawer -->
    <div v-if="showDetail" class="drawer-overlay" @click.self="closeDetail">
      <div class="drawer-container animate-slide-left">
        <div class="drawer-header">
          <div class="drawer-header-content">
            <span class="drawer-subtitle">Detail Surat Eksternal</span>
            <h2 class="drawer-title">{{ selectedItem?.perihal }}</h2>
          </div>
          <button class="btn-close-drawer" @click="closeDetail">&times;</button>
        </div>
        
        <div class="drawer-body">
          <div class="card-section">
            <div class="card-section-header">
              <i class="fas fa-info-circle"></i>
              <span>Detail Surat</span>
            </div>
            <div class="info-grid mt-2">
              <div class="info-item">
                <label>No. Surat</label>
                <div class="info-value text-mono">{{ selectedItem?.no_surat || '(Belum Terbit)' }}</div>
              </div>
              <div class="info-item">
                <label>Status</label>
                <div class="info-value">
                  <span :class="['status-badge', selectedItem?.status]">
                    {{ capitalize(selectedItem?.status) }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <label>Tanggal Terbit</label>
                <div class="info-value">{{ formatDate(selectedItem?.tgl_terbit) }}</div>
              </div>
              <div class="info-item">
                <label>Penanggung Jawab</label>
                <div class="info-value">
                  <strong>{{ selectedItem?.penanggung_jawab?.nama }}</strong><br>
                  <small class="text-muted">{{ selectedItem?.pj }}</small>
                </div>
              </div>
            </div>
             <div class="mt-3">
              <label class="info-label-mini">Tujuan / Alamat</label>
              <div class="info-value">
                <i class="fas fa-map-marker-alt mr-1 text-primary"></i>
                {{ selectedItem?.alamat || '-' }}
              </div>
            </div>
            <div v-if="selectedItem?.catatan" class="mt-3">
              <label class="info-label-mini">Catatan</label>
              <p class="section-text-small text-muted">{{ selectedItem.catatan }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { suratEksternalService } from '@/services/suratEksternalService'
import { pegawaiService } from '@/services/pegawaiService'
import { useAuthStore } from '@/stores/auth'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import Swal from 'sweetalert2'

// State
const authStore = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const suratList = ref([])
const searchQuery = ref('')
const filters = ref({
  tgl_terbit_start: '',
  tgl_terbit_end: '',
  status: ''
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})
const stats = ref({
  total: 0,
  pengajuan: 0,
  disetujui: 0,
  ditolak: 0
})

// Modal & Form State
const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: null,
  perihal: '',
  alamat: '',
  tgl_terbit: new Date().toISOString().split('T')[0],
  pj: '',
  status: 'pengajuan',
  catatan: ''
})

// Detail State
const showDetail = ref(false)
const selectedItem = ref(null)
const pegawaiList = ref([])

const isKoordinator = computed(() => {
  const role = authStore.userRole || ''
  return role.includes('Koordinator Diklat')
})

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const payload = {
      page: page,
      limit: 10,
      sort: [{ field: 'created_at', direction: 'desc' }],
      filters: []
    }

    if (searchQuery.value) {
      payload.search = { value: searchQuery.value }
    }

    if (filters.value.status) {
      payload.filters.push({ field: 'status', operator: '=', value: filters.value.status })
    }

    if (filters.value.tgl_terbit_start) {
      payload.filters.push({ field: 'tgl_terbit', operator: '>=', value: filters.value.tgl_terbit_start })
    }
    if (filters.value.tgl_terbit_end) {
      payload.filters.push({ field: 'tgl_terbit', operator: '<=', value: filters.value.tgl_terbit_end })
    }
    
    // Auto-filter by User's Department
    const userDept = authStore.userDepartment
    if (!isKoordinator.value && userDept && userDept !== '-') {
      payload.departemen = userDept
    }

    const response = await suratEksternalService.getSuratEksternal(payload)
    suratList.value = response.data.data || []
    
    const meta = response.data.meta || response.data.pagination || response.data
    pagination.value = {
      current_page: meta.current_page || 1,
      last_page: meta.last_page || 1,
      total: meta.total || 0
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    if (error.response?.status !== 401) {
      Swal.fire('Error', 'Gagal memuat data surat eksternal', 'error')
    }
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const params = {}
    const userDept = authStore.userDepartment
    if (!isKoordinator.value && userDept && userDept !== '-') {
      params.departemen = userDept
    }
    
    const response = await suratEksternalService.getStats(params)
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (err) {
    console.error('Error fetching global stats:', err)
  }
}

const loadPegawai = async () => {
  try {
    const params = { status: 'AKTIF' }
    const userDept = authStore.userDepartment
    if (!isKoordinator.value && userDept && userDept !== '-') {
      params.departemen = userDept
    }
    const response = await pegawaiService.getKaryawanList(params)
    pegawaiList.value = response.data.data
  } catch (error) {
    console.error('Error fetching pegawai:', error)
  }
}

const handleSearch = () => {
  pagination.value.current_page = 1
  fetchData(1)
}

const changePage = (page) => {
  pagination.value.current_page = page
  fetchData(page)
}

const openAddModal = () => {
  isEdit.value = false
  formData.value = {
    id: null,
    perihal: '',
    alamat: '',
    tgl_terbit: new Date().toISOString().split('T')[0],
    pj: '',
    status: 'pengajuan',
    catatan: ''
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  
  // Robust Date Parsing
  let tgl = ''
  if (item.tgl_terbit) {
    const dateObj = new Date(item.tgl_terbit)
    if (!isNaN(dateObj.getTime())) {
      const offset = dateObj.getTimezoneOffset()
      const adjustedDate = new Date(dateObj.getTime() - (offset * 60 * 1000))
      tgl = adjustedDate.toISOString().split('T')[0]
    } else if (typeof item.tgl_terbit === 'string') {
      tgl = item.tgl_terbit.split(' ')[0]
    }
  }

  // Robust PJ Mapping
  const pjNik = item.pj || item.penanggung_jawab?.nik || item.penanggungJawab?.nik || ''
  const nikStr = pjNik ? String(pjNik).trim() : ''

  // Ensure PJ is in the list so SearchableSelect can show the label
  if (nikStr && !pegawaiList.value.some(p => String(p.nik).trim() === nikStr)) {
    const pjName = item.penanggung_jawab?.nama || item.penanggungJawab?.nama || nikStr
    pegawaiList.value.push({
      nik: nikStr,
      nama: pjName
    })
  }

  formData.value = {
    id: item.id,
    perihal: item.perihal,
    alamat: item.alamat,
    tgl_terbit: tgl,
    pj: nikStr,
    status: item.status,
    catatan: item.catatan
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveSurat = async () => {
  submitting.value = true
  try {
    const payload = { ...formData.value }

    if (isEdit.value) {
      await suratEksternalService.updateSuratEksternal(payload.id, payload)
    } else {
      await suratEksternalService.storeSuratEksternal(payload)
    }

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })

    Toast.fire({
      icon: 'success',
      title: 'Berhasil',
      text: `Surat eksternal berhasil ${isEdit.value ? 'diperbarui' : 'disimpan'}`,
      background: '#f0fdf4',
      color: '#166534',
      iconColor: '#22c55e'
    })
    closeModal()
    fetchData(pagination.value.current_page)
    fetchStats()
  } catch (error) {
    console.error('Error saving surat:', error)
    Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Hapus Surat?',
    text: "Tindakan ini tidak dapat dibatalkan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await suratEksternalService.deleteSuratEksternal(item.id)
        Swal.fire('Terhapus!', 'Surat berhasil dihapus.', 'success')
        fetchData(pagination.value.current_page)
        fetchStats()
      } catch (error) {
        Swal.fire('Gagal', 'Gagal menghapus surat.', 'error')
      }
    }
  })
}

const viewDetail = async (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

onMounted(() => {
  fetchData()
  fetchStats()
  loadPegawai()
})
</script>

<style scoped>
.eksternal-view-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 0.5rem 1rem;
  color: #1e293b;
}

.eksternal-container {
  max-width: 100%;
  margin: 0 auto;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -1.5rem;
  z-index: 10;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.2);
}

.hero-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.hero-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  margin: 0.25rem 0 0 0;
  opacity: 0.95;
  font-size: 0.9rem;
  max-width: 400px;
  line-height: 1.4;
}

.hero-stats {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 0.875rem 1.5rem;
  border-radius: 16px;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.8;
  margin-bottom: 0.25rem;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
}

/* Action Bar */
.action-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  padding: 1.25rem 1.5rem;
  border-radius: 20px;
  border: 1px solid white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin: 0 1rem 1.5rem 1rem;
  position: relative;
  z-index: 20;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  flex: 1 1 auto;
}

.search-box {
  position: relative;
  flex: 1 1 250px;
  min-width: 200px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-input {
  box-sizing: border-box;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  flex-shrink: 0;
}

.btn-filter, .btn-add {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-filter {
  background: #f1f5f9;
  color: #475569;
}

.btn-add {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-add:hover {
  background: #2563eb;
}

/* Table */
.content-area {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 2px solid #f1f5f9;
}

.modern-table td {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  cursor: pointer;
}

.text-mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge.pengajuan { background: #fee2e2; color: #991b1b; }
.status-badge.disetujui { background: #dcfce7; color: #166534; }
.status-badge.ditolak { background: #f1f5f9; color: #475569; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-save-modal {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-modal:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
}

.drawer-container {
  width: 100%;
  max-width: 500px;
  background: #f8fafc;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close-drawer {
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

.btn-close-drawer:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.drawer-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.card-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.info-item label {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.info-value {
  font-size: 0.875rem;
  color: #1e293b;
}

/* Pagination */
.pagination-footer {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  background: white;
}

.btn-page {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f1f5f9;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
}

.page-info {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

/* Mobile */
@media (max-width: 1024px) {
  .eksternal-view-wrapper {
    padding: 0.75rem 0.6rem 2rem 0.6rem;
    min-height: calc(100vh - 80px);
    background: #f8fafc;
  }
  
  .hero-header { 
    padding: 1rem 1.25rem; 
    border-radius: 12px; 
    margin-bottom: 1rem; 
    margin-top: 0; 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 0.5rem; 
  }
  .hero-stats { display: none; }
  .hero-content { gap: 0.75rem; width: 100%; }
  .hero-icon { width: 44px; height: 44px; font-size: 1.2rem; border-radius: 12px; flex-shrink: 0; }
  .hero-title { 
    font-size: 1.25rem; 
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .mobile-stats-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.65rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 800;
    color: white;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .hero-subtitle { font-size: 0.8rem; max-width: 100%; opacity: 0.9; }

  .action-bar { 
    margin: -1.25rem 0.5rem 1.5rem 0.5rem; 
    padding: 0.85rem 0.65rem; 
    flex-direction: column; 
    align-items: stretch;
    gap: 0.85rem;
    background: white;
    border-radius: 12px;
    z-index: 25;
    box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(226, 232, 240, 0.5);
  }
  .filter-group { 
    flex-direction: column; 
    width: 100%; 
    gap: 0.75rem; 
  }
  .search-box { 
    width: 100%; 
    position: relative;
    height: 36px;
    display: flex;
    align-items: center;
    flex: none !important;
  }
  .search-box i {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    z-index: 10;
    pointer-events: none;
    font-size: 0.8rem;
    margin: 0;
  }
  .search-box input { 
    width: 100%; 
    height: 100%;
    padding: 0 0.75rem 0 2rem !important;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.85rem;
  }
  
  .date-filter { 
    width: 100%; 
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
    background: transparent; 
    padding: 0; 
    border: none;
  }
  .date-filter span { font-weight: 600; font-size: 0.7rem; color: #94a3b8; text-align: center; flex-shrink: 0; }
  .date-filter .filter-input { 
    flex: 1;
    min-width: 0;
    height: 36px;
    background: white; 
    border: 1px solid #e2e8f0; 
    padding: 0 0.25rem; 
    border-radius: 8px; 
    font-size: 0.8rem;
  }
  .filter-input.status-select { 
    width: 100%;
    background: #f8fafc; 
    border: 1px solid #e2e8f0; 
    padding: 0 0.75rem; 
    border-radius: 8px;
    height: 36px;
    font-weight: 700;
    font-size: 0.85rem;
    color: #475569;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
  }
  .btn-filter { 
    width: 100%; 
    justify-content: center; 
    padding: 0.75rem; 
    border-radius: 8px; 
    background: #f1f5f9;
    color: #475569;
    font-weight: 700;
    height: 36px;
    font-size: 0.85rem;
  }
  .btn-add { 
    width: 100%; 
    justify-content: center; 
    padding: 0.65rem; 
    order: -1; 
    border-radius: 10px; 
    margin-bottom: 0.15rem;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    background: #3b82f6;
    color: white;
    border: none;
    font-weight: 700;
  }

  .content-area {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    overflow: visible;
  }

  .desktop-view { display: none; }
  .mobile-view { display: block !important; padding: 0.25rem 0; }
  
  .pagination-footer { 
    border-top: none; 
    margin-top: 1rem;
    padding: 1.25rem 0 3rem 0;
    background: transparent;
  }

  .mobile-card {
    background: white;
    border-radius: 16px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
  }

  .mobile-card-perihal {
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0.5rem 0 1rem 0;
    color: #1e293b;
    line-height: 1.3;
  }

  .mobile-card-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.85rem;
    color: #64748b;
  }

  .meta-item i {
    width: 16px;
    color: #3b82f6;
  }

  .mobile-card-footer {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #f8fafc;
  }

  .btn-mobile-edit, .btn-mobile-delete {
    flex: 1;
    padding: 0.65rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-mobile-edit { background: #f1f5f9; color: #475569; border: none; }
  .btn-mobile-delete { background: #fffafa; color: #ef4444; border: 1px solid #fee2e2; }
}

.mobile-view { display: none; }
.pj-info { display: flex; flex-direction: column; }
.pj-name { font-weight: 500; }
.pj-nik { font-size: 0.75rem; }
.required { color: #ef4444; }
.fw-bold { font-weight: 700; }
.mr-2 { margin-right: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.status-badge-mini {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
}
.status-badge-mini.pengajuan { background: #fee2e2; color: #b91c1c; }
.status-badge-mini.disetujui { background: #dcfce7; color: #15803d; }
.status-badge-mini.ditolak { background: #f1f5f9; color: #64748b; }
</style>
