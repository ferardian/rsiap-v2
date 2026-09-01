<template>
  <div class="sep-container">
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <div class="header-content">
        <h2 class="page-title">
          <i class="fas fa-file-invoice"></i>
          Data SEP BPJS
        </h2>
        <p class="page-subtitle mb-0">Monitoring Surat Eligibilitas Peserta (bridging_sep)</p>
      </div>
      <div>
        <button 
          class="btn btn-primary rounded-pill px-3 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
          @click="openCekPesertaModal()"
        >
          <i class="fas fa-id-card"></i>
          <span>Cek Kepesertaan BPJS</span>
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="filter-card card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Global Search -->
          <div class="col-md-4">
            <label class="form-label fw-bold">Pencarian</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                v-model="filters.q" 
                @input="handleFilterChange"
                placeholder="No. SEP, No. RM, Nama Pasien..." 
                class="form-control border-start-0 ps-0"
              />
            </div>
          </div>

          <!-- Date Range -->
          <div class="col-md-4">
            <label class="form-label fw-bold">Periode Tgl. SEP</label>
            <div class="d-flex gap-2">
              <input 
                type="date" 
                v-model="filters.tgl_awal" 
                @change="handleFilterChange"
                class="form-control"
              />
              <span class="align-self-center">s/d</span>
              <input 
                type="date" 
                v-model="filters.tgl_akhir" 
                @change="handleFilterChange"
                class="form-control"
              />
            </div>
          </div>

          <!-- Jenis Pelayanan -->
          <div class="col-md-2">
            <label class="form-label fw-bold">Jenis Layanan</label>
            <select v-model="filters.jns_layanan" @change="handleFilterChange" class="form-select">
              <option value="">Semua</option>
              <option value="1">Rawat Inap</option>
              <option value="2">Rawat Jalan</option>
            </select>
          </div>

          <!-- Dokter Selection -->
          <div class="col-md-2">
            <label class="form-label fw-bold">Dokter (DPJP)</label>
            <v-select
              v-model="filters.dokter"
              :options="doctorOptions"
              label="nm_dokter"
              :reduce="d => d.nm_dokter"
              placeholder="Pilih Dokter..."
              @option:selected="handleFilterChange"
              @option:deselected="handleFilterChange"
              append-to-body
              class="v-select-custom"
            >
               <template #no-options>
                <div class="p-2 small text-muted">Dokter tidak ditemukan...</div>
              </template>
            </v-select>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="data-card card shadow-sm">
      <!-- Loading State -->
      <div v-if="loading" class="card-body py-5 text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Memuat data SEP...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="sepList.length === 0" class="card-body py-5 text-center text-muted">
        <i class="fas fa-folder-open fa-3x mb-3 opacity-25"></i>
        <p>Tidak ada data SEP yang ditemukan untuk kriteria ini.</p>
      </div>

      <!-- Table View -->
      <div v-else class="table-responsive">
        <table class="table table-hover custom-table align-middle">
          <thead>
            <tr>
              <th>No. SEP</th>
              <th>Pasien</th>
              <th>Tgl. SEP</th>
              <th>Poliklinik / DPJP</th>
              <th>Layanan</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sepList" :key="item.no_sep">
              <td>
                <div class="badge-sep">{{ item.no_sep }}</div>
                <small class="text-muted d-block mt-1">{{ item.no_rawat }}</small>
                <div v-if="item.user" class="mt-1">
                  <span class="badge rounded-pill bg-light text-dark border fw-normal" style="font-size: 0.7rem;">
                    <i class="fas fa-user-edit me-1 text-muted"></i>
                    {{ item.user }}
                  </span>
                </div>
              </td>
              <td>
                <div class="fw-bold">{{ item.nama_pasien }}</div>
                <div class="small text-muted">
                  RM: {{ item.nomr }} | Kartu: {{ item.no_kartu }}
                </div>
                <div v-if="item.reg_periksa && item.reg_periksa.stts_daftar" class="mt-1">
                  <span :class="['badge rounded-pill fw-normal', item.reg_periksa.stts_daftar === 'Baru' ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle']" style="font-size: 0.7rem;">
                    {{ item.reg_periksa.stts_daftar }}
                  </span>
                </div>
              </td>
              <td>
                <div>{{ formatDate(item.tglsep) }}</div>
                <small v-if="formatDate(item.tglpulang)" class="text-success text-xs d-block">
                   Tgl. Pulang: {{ formatDate(item.tglpulang) }}
                </small>
              </td>
              <td>
                <div class="small-title">{{ item.nmpolitujuan || '-' }}</div>
                <small class="text-muted text-dpjp">{{ item.nmdpdjp || '-' }}</small>
              </td>
              <td>
                <span :class="['badge-status', item.jnspelayanan == '1' ? 'ranap' : 'ralan']">
                  {{ item.jnspelayanan == '1' ? 'Rawat Inap' : 'Rawat Jalan' }}
                </span>
                <div class="mt-1 small text-muted">Kelas {{ item.klsrawat }}</div>
                <div v-if="item.jnspelayanan == '1' && item.klsnaik" class="mt-1">
                  <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold px-2 py-0.5 rounded-pill" style="font-size: 0.68rem;" :title="`Naik Kelas ke ${translateKlsNaik(item.klsnaik)}`">
                    <i class="fas fa-arrow-alt-circle-up me-1 text-warning"></i>
                    Naik {{ translateKlsNaik(item.klsnaik) }}
                  </span>
                </div>
              </td>
              <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                  <button 
                    class="btn btn-sm btn-icon-glass btn-outline-info"
                    @click="checkPesertaRow(item)"
                    title="Cek Kepesertaan BPJS & Hak Kelas"
                  >
                    <i class="fas fa-id-card"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-icon-glass btn-outline-primary"
                    @click="showDetail(item)"
                    title="Detail SEP"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-icon-glass btn-outline-warning"
                    @click="editSep(item)"
                    title="Edit SEP"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-icon-glass btn-outline-danger"
                    @click="deleteSep(item)"
                    title="Hapus SEP"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="card-footer bg-white border-top-0 py-3" v-if="pagination.total > 0">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="pagination-info">
            Menampilkan <strong>{{ pagination.from }}</strong> - <strong>{{ pagination.to }}</strong> dari <strong>{{ pagination.total }}</strong> SEP
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm m-0 gap-1">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button class="page-link rounded-circle border-0 shadow-none" @click="changePage(pagination.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li class="page-item active">
                <span class="page-link rounded-circle border-0">{{ pagination.current_page }}</span>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link rounded-circle border-0 shadow-none" @click="changePage(pagination.current_page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <SepDetailModal 
      v-if="showModal"
      :sepData="selectedSep"
      @close="showModal = false"
    />

    <!-- Generate/Edit Modal -->
    <GenerateSepModal
        :show="showEditModal"
        :registration="selectedRegistration"
        @close="showEditModal = false"
        @success="handleEditSuccess"
    />

    <!-- Cek Kepesertaan Modal -->
    <CekPesertaModal
      v-if="showCekPesertaModal"
      :noKartu="selectedCekPesertaData.noKartu"
      :nik="selectedCekPesertaData.nik"
      :tglSepDate="selectedCekPesertaData.tglSepDate"
      :sepKlsRawat="selectedCekPesertaData.sepKlsRawat"
      @close="showCekPesertaModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import sepService from '@/services/sepService'
import dokterService from '@/services/dokterService'
import bpjsVclaimService from '@/services/bpjsVclaimService'
import SepDetailModal from './components/SepDetailModal.vue'
import GenerateSepModal from './components/GenerateSepModal.vue'
import CekPesertaModal from './components/CekPesertaModal.vue'
import { debounce } from 'lodash'
import Swal from 'sweetalert2'

// State
const loading = ref(false)
const sepList = ref([])
const showModal = ref(false)
const showEditModal = ref(false)
const showCekPesertaModal = ref(false)
const selectedSep = ref(null)
const selectedRegistration = ref(null)
const doctorOptions = ref([])

const selectedCekPesertaData = reactive({
  noKartu: '',
  nik: '',
  tglSepDate: '',
  sepKlsRawat: ''
})

const filters = reactive({
  q: '',
  tgl_awal: new Date().toISOString().slice(0, 10),
  tgl_akhir: new Date().toISOString().slice(0, 10),
  jns_layanan: '',
  dokter: ''
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
  per_page: 15
})

// Fetch Doctors for filter
const fetchDoctors = async () => {
  try {
    const response = await dokterService.getDokter(1, 500)
    doctorOptions.value = response.data.data
  } catch (error) {
    console.error('Error fetching doctors:', error)
  }
}

// Fetch Data
const fetchSEP = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current_page,
      limit: pagination.per_page,
      q: filters.q,
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir,
      jnspelayanan: filters.jns_layanan,
      dokter: filters.dokter
    }

    const response = await sepService.search(params)
    
    // Standard Laravel Pagination Response
    const result = response.data
    sepList.value = result.data
    
    pagination.current_page = result.current_page
    pagination.last_page = result.last_page
    pagination.per_page = result.per_page
    pagination.total = result.total
    pagination.from = result.from
    pagination.to = result.to
  } catch (error) {
    console.error('Error fetching SEP:', error)
  } finally {
    loading.value = false
  }
}

// Handlers
const handleFilterChange = debounce(() => {
  pagination.current_page = 1
  fetchSEP()
}, 500)

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  pagination.current_page = page
  fetchSEP()
}

const openCekPesertaModal = () => {
  selectedCekPesertaData.noKartu = ''
  selectedCekPesertaData.nik = ''
  selectedCekPesertaData.tglSepDate = new Date().toISOString().slice(0, 10)
  selectedCekPesertaData.sepKlsRawat = ''
  showCekPesertaModal.value = true
}

const checkPesertaRow = (item) => {
  selectedCekPesertaData.noKartu = item.no_kartu || ''
  selectedCekPesertaData.nik = item.pasien?.no_ktp || ''
  selectedCekPesertaData.tglSepDate = item.tglsep || new Date().toISOString().slice(0, 10)
  selectedCekPesertaData.sepKlsRawat = String(item.klsrawat || '')
  showCekPesertaModal.value = true
}

const showDetail = (item) => {
  selectedSep.value = item
  showModal.value = true
}

const editSep = (item) => {
  // We need to map item from bridging_sep to a registration-like object
  // so GenerateSepModal can consume it
  selectedRegistration.value = {
    no_rawat: item.no_rawat,
    no_rkm_medis: item.nomr,
    pasien: {
        nm_pasien: item.nama_pasien,
        no_peserta: item.no_kartu,
    },
    // sepSimple is the key to trigger edit mode in GenerateSepModal
    sepSimple: {
        no_sep: item.no_sep
    },
    // Pass the full local record as a fallback
    sepItem: item
  }
  showEditModal.value = true
}

const handleEditSuccess = () => {
  showEditModal.value = false
  fetchSEP()
}

const deleteSep = async (item) => {
  const result = await Swal.fire({
    title: 'Hapus SEP?',
    text: `Anda akan menghapus SEP ${item.no_sep}. Tindakan ini tidak dapat dibatalkan!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    customClass: {
      popup: 'swal2-glass'
    }
  })

  if (result.isConfirmed) {
    try {
      const payload = {
        noSep: item.no_sep,
        user: 'Bridging RSIAP V2'
      }
      
      const res = await bpjsVclaimService.deleteSep(payload)
      
      if (res.data.metaData.code === '200') {
        Swal.fire({
          title: 'Terhapus!',
          text: 'SEP berhasil dihapus dari sistem BPJS dan lokal.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'swal2-glass' }
        })
        fetchSEP()
      } else {
        Swal.fire({
          title: 'Gagal!',
          text: res.data.metaData.message,
          icon: 'error',
          customClass: { popup: 'swal2-glass' }
        })
      }
    } catch (error) {
      console.error('Error deleting SEP:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan sistem saat menghapus SEP.',
        icon: 'error',
        customClass: { popup: 'swal2-glass' }
      })
    }
  }
}

const translateKlsNaik = (code) => {
  if (!code) return ''
  const mapping = {
    '1': 'VVIP',
    '2': 'VIP',
    '3': 'Kelas I',
    '4': 'Kelas II',
    '5': 'Kelas III',
    '6': 'ICCU',
    '7': 'ICU',
    '8': 'Diatas Kelas 1'
  }
  return mapping[code] || `Kelas ${code}`
}

const formatDate = (dateString) => {
  if (!dateString || dateString === '0000-00-00' || dateString === '0000-00-00 00:00:00') return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchDoctors()
  fetchSEP()
})
</script>

<style scoped>
.sep-container {
  padding: 0.75rem 1rem;
  width: 100%;
}

/* Header */
.page-title {
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.02em;
}

.page-title i {
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.75rem;
  border-radius: 1rem;
  font-size: 1.25rem;
}

.page-subtitle {
  margin-top: 0.5rem;
  color: #64748b;
  font-weight: 500;
}

/* Cards */
.card {
  border: none;
  border-radius: 1rem;
}

.filter-card {
  overflow: visible !important;
}

.data-card {
  overflow: hidden;
}

/* Table */
.custom-table thead th {
  background: #f8fafc;
  border-bottom: 2px solid #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  padding: 0.6rem 0.85rem;
}

.custom-table tbody td {
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
}

.badge-sep {
  background: #f1f5f9;
  color: #334155;
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  font-size: 0.78rem;
  padding: 0.15rem 0.45rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  display: inline-block;
}

.small-title {
  font-weight: 600;
  color: #334155;
  font-size: 0.83rem;
}

.text-dpjp {
  font-size: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.badge-status {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 2rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-status.ranap {
  background: #dcfce7;
  color: #166534;
}

.badge-status.ralan {
  background: #dbeafe;
  color: #1e40af;
}

/* Form Controls */
.form-label {
  font-size: 0.8rem;
  color: #475569;
  margin-bottom: 0.25rem;
}

.form-control, .form-select {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
}

.form-control:focus, .form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.page-link {
  color: #64748b;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

.page-item.active .page-link {
  background: #3b82f6;
  color: white;
}

@media (max-width: 768px) {
  .sep-container { padding: 0.5rem; }
  .header-content { text-align: center; }
  .page-title { justify-content: center; }
}

/* Glass Buttons */
.btn-icon-glass {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 0.8rem;
    transition: all 0.2s;
    background: transparent;
}

.btn-icon-glass:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.btn-outline-info.btn-icon-glass {
    border-color: #cff4fc;
    color: #0dcaf0;
}
.btn-outline-info.btn-icon-glass:hover {
    background: #0dcaf0;
    color: white;
}

.btn-outline-primary.btn-icon-glass {
    border-color: #dbeafe;
    color: #3b82f6;
}
.btn-outline-primary.btn-icon-glass:hover {
    background: #3b82f6;
    color: white;
}

.btn-outline-warning.btn-icon-glass {
    border-color: #fef3c7;
    color: #f59e0b;
}
.btn-outline-warning.btn-icon-glass:hover {
    background: #f59e0b;
    color: white;
}

.btn-outline-danger.btn-icon-glass {
    border-color: #fee2e2;
    color: #ef4444;
}
.btn-outline-danger.btn-icon-glass:hover {
    background: #ef4444;
    color: white;
}

/* Custom v-select styling to match bootstrap */
.v-select-custom :deep(.vs__dropdown-toggle) {
  border-radius: 0.75rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid #e2e8f0;
}

.v-select-custom :deep(.vs__selected-options) {
  padding: 0;
}

.v-select-custom :deep(.vs__search::placeholder) {
  color: #64748b;
  font-size: 0.95rem;
}

.v-select-custom :deep(.vs__actions) {
  padding-top: 0;
}

.v-select-custom :deep(.vs__dropdown-menu) {
  border-radius: 0.75rem;
  margin-top: 4px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
}
</style>
