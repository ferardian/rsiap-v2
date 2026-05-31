<template>
  <div class="hfis-schedule-page">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1><i class="fas fa-file-medical"></i> SK Jadwal Praktik (HFIS)</h1>
          <p>Pembuatan data jadwal praktik untuk pengajuan BPJS (HFIS 6.1)</p>
        </div>
        <div class="header-actions" style="display: flex; gap: 0.75rem;">
          <button @click="openHfisCheckModal" class="btn-check-hfis" style="padding: 0.75rem 1.5rem; background: #0ea5e9; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;">
            <i class="fas fa-search-plus"></i>
            <span>Cek Jadwal BPJS</span>
          </button>
          <button @click="openAddModal" class="btn-add">
            <i class="fas fa-plus"></i>
            <span>Buat Pengajuan Baru</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="filter-group">
          <label><i class="fas fa-search"></i> Cari Dokter / PIC</label>
          <div class="search-wrapper">
            <input 
              v-model="searchQuery" 
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="Ketik nama dan tekan Enter..."
              class="search-input"
            >
            <button @click="handleSearch" class="btn-search">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div v-if="selectedIds.length > 0" class="bulk-actions">
          <button @click="generateBulkPdf" class="btn-bulk" :disabled="bulkLoading">
            <i class="fas" :class="bulkLoading ? 'fa-spinner fa-spin' : 'fa-file-medical'"></i>
            <span>Download PDF ({{ selectedIds.length }} Terpilih)</span>
          </button>
          <button @click="selectedIds = []" class="btn-clear">Batal</button>
        </div>
      </div>
    </div>

    <!-- List Section -->
    <div class="list-container">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat data...</p>
      </div>

      <div v-else-if="certificates.length > 0" class="certificates-grid">
        <div v-for="cert in certificates" :key="cert.id" class="cert-card" :class="{ 'is-selected': selectedIds.includes(cert.id) }">
          <div class="cert-header">
            <div class="cert-selection">
              <input 
                type="checkbox" 
                :value="cert.id" 
                v-model="selectedIds"
                :id="'cert-' + cert.id"
              >
              <div class="cert-date">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(cert.tgl_surat) }}
              </div>
            </div>
            <div class="cert-actions">
              <button @click="downloadPdf(cert.id)" class="btn-icon btn-pdf" title="Download PDF">
                <i class="fas fa-file-pdf"></i>
              </button>
              <button @click="openSyncHfisModal(cert)" class="btn-icon btn-sync" title="Sync ke HFIS">
                <i class="fas fa-sync-alt"></i>
              </button>
              <button @click="openEditModal(cert)" class="btn-icon btn-edit" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmDelete(cert)" class="btn-icon btn-delete" title="Hapus">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="cert-body">
            <h3 class="doctor-name">{{ cert.dokter?.nm_dokter }}</h3>
            <p class="spesialis-text">{{ cert.dokter?.spesialis?.nm_sps || 'Umum' }}</p>
            <div class="pic-info">
              <span><i class="fas fa-user-edit"></i> {{ cert.nama_pic }}</span>
              <span><i class="fas fa-id-badge"></i> {{ cert.jabatan_pic }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>Belum ada pengajuan jadwal.</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Prev</button>
        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>
            <i class="fas" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
            {{ isEditMode ? 'Edit Pengajuan Jadwal' : 'Pengajuan Jadwal Baru' }}
          </h2>
          <button @click="closeModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>

        <div class="modal-body">
          <!-- Header Info -->
          <div class="form-section">
            <h3 class="section-title">Informasi Dasar</h3>
            <div class="form-row">
              <div class="form-group flex-2">
                <label>Dokter <span class="required">*</span></label>
                <VueSelect
                  v-model="formData.kd_dokter"
                  :options="dokterList"
                  :reduce="d => d.kd_dokter"
                  label="nm_dokter"
                  placeholder="Pilih Dokter"
                />
              </div>
              <div class="form-group flex-1">
                <label>Tanggal Surat <span class="required">*</span></label>
                <input type="date" v-model="formData.tgl_surat">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Nama PIC</label>
                <input type="text" v-model="formData.nama_pic" placeholder="Nama Penanggung Jawab">
              </div>
              <div class="form-group">
                <label>Jabatan PIC</label>
                <input type="text" v-model="formData.jabatan_pic" placeholder="Jabatan PIC">
              </div>
            </div>
          </div>

          <!-- Faskes Info -->
          <div class="form-section">
            <h3 class="section-title">Institusi Praktik (SIP)</h3>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Faskes SIP 1 (Wajib)</label>
                <input type="text" v-model="formData.faskes_sip1" placeholder="Nama RS Utama">
              </div>
              <div class="form-group flex-1">
                <label>Faskes SIP 2</label>
                <input type="text" v-model="formData.faskes_sip2" placeholder="Nama RS Kedua (opsional)">
              </div>
              <div class="form-group flex-1">
                <label>Faskes SIP 3</label>
                <input type="text" v-model="formData.faskes_sip3" placeholder="Nama RS Ketiga (opsional)">
              </div>
            </div>
          </div>

          <!-- Schedule Grid -->
          <div class="form-section">
            <h3 class="section-title">Grid Jadwal Mingguan</h3>
            <div class="table-responsive">
              <table class="grid-table">
                <thead>
                  <tr>
                    <th rowspan="2" class="day-col">Hari</th>
                    <th colspan="2">SIP 1</th>
                    <th colspan="2">SIP 2</th>
                    <th colspan="2">SIP 3</th>
                  </tr>
                  <tr>
                    <th>Jam Kerja</th>
                    <th>Jam Praktek</th>
                    <th>Jam Kerja</th>
                    <th>Jam Praktik</th>
                    <th>Jam Kerja</th>
                    <th>Jam Praktik</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(day, index) in days" :key="day">
                    <td class="day-label">{{ day }}</td>
                    <td><textarea v-model="formData.details[index].sip1_jam_kerja"></textarea></td>
                    <td><textarea v-model="formData.details[index].sip1_jam_praktek"></textarea></td>
                    <td><textarea v-model="formData.details[index].sip2_jam_kerja"></textarea></td>
                    <td><textarea v-model="formData.details[index].sip2_jam_praktek"></textarea></td>
                    <td><textarea v-model="formData.details[index].sip3_jam_kerja"></textarea></td>
                    <td><textarea v-model="formData.details[index].sip3_jam_praktek"></textarea></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="helper-text">*) Enter dalam Jam Kerja/Praktek akan terlihat sebagai baris baru di PDF (Visi & Tindakan).</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Batal</button>
          <button @click="saveCertificate" class="btn-save" :disabled="saving">
            <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            {{ saving ? 'Menyimpan...' : 'Simpan Pengajuan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sync HFIS Modal -->
    <div v-if="showSyncModal" class="modal-overlay" @click.self="closeSyncModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h2><i class="fas fa-sync-alt text-primary"></i> Sync Jadwal ke HFIS</h2>
          <button @click="closeSyncModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>

        <div class="modal-body">
          <div class="alert alert-info mb-4">
            <i class="fas fa-info-circle me-2"></i>
            Pastikan Kode Dokter, Poli, dan Subspesialis sesuai dengan referensi BPJS.
          </div>

          <div class="form-section">
            <h3 class="section-title">Data Referensi BPJS</h3>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Dokter (BPJS)</label>
                <div class="input-group">
                  <input type="text" :value="syncData.nm_dokter" readonly class="bg-gray-100">
                  <input type="text" v-model="syncData.kodedokter" placeholder="Kode Dokter BPJS" class="font-bold">
                </div>
                <small class="text-muted">Kode Dokter BPJS wajib diisi.</small>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Poli (BPJS)</label>
                <VueSelect
                  v-model="syncData.kodepoli"
                  :options="poliList"
                  :reduce="p => p.kd_poli_bpjs"
                  label="nm_poli_bpjs"
                  placeholder="Pilih Poli BPJS"
                >
                  <template #option="{ kd_poli_bpjs, nm_poli_bpjs }">
                    <span><strong>{{ kd_poli_bpjs }}</strong> - {{ nm_poli_bpjs }}</span>
                  </template>
                </VueSelect>
              </div>
              <div class="form-group flex-1">
                <label>Subspesialis (BPJS)</label>
                <input type="text" v-model="syncData.kodesubspesialis" placeholder="Kode Subspesialis (ex: 008)">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Preview Jadwal Parsed</h3>
            <div class="table-responsive">
              <table class="grid-table">
                <thead>
                  <tr>
                    <th>Hari (Angka)</th>
                    <th>Hari</th>
                    <th>Jam Buka</th>
                    <th>Jam Tutup</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(sch, idx) in syncData.jadwal_parsed" :key="idx">
                    <td>{{ sch.hari }}</td>
                    <td>{{ sch.hari_nama }}</td>
                    <td><input type="time" v-model="sch.buka" class="form-control-sm"></td>
                    <td><input type="time" v-model="sch.tutup" class="form-control-sm"></td>
                  </tr>
                  <tr v-if="syncData.jadwal_parsed.length === 0">
                    <td colspan="4" class="text-center p-3 text-muted">
                      Tidak ada jadwal yang terdeteksi valid (Format: HH:mm - HH:mm)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="helper-text text-warning mt-2" v-if="syncData.jadwal_parsed.length === 0">
              <i class="fas fa-exclamation-triangle"></i> Format jam praktek di SK harus "HH:mm - HH:mm" (contoh: 08:00 - 12:00) agar terdeteksi.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeSyncModal" class="btn-cancel">Batal</button>
          <button @click="confirmSyncHfis" class="btn-save" :disabled="syncLoading || syncData.jadwal_parsed.length === 0">
            <i class="fas" :class="syncLoading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
            {{ syncLoading ? 'Mengirim...' : 'Kirim ke HFIS' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Cek Jadwal HFIS -->
    <div v-if="showHfisCheckModal" class="modal-overlay" @click.self="closeHfisCheckModal">
      <div class="modal-content large" style="max-width: 900px;">
        <div class="modal-header shadow-sm" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white;">
          <h2 style="color: white; margin: 0;"><i class="fas fa-search text-white"></i> Cek Jadwal Praktik BPJS (HFIS)</h2>
          <button @click="closeHfisCheckModal" class="btn-close" style="color: white; opacity: 0.8;"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="modal-body bg-light">
          <div class="search-hfis-card p-4 bg-white rounded-3 shadow-sm mb-4 border">
             <div class="row g-3 align-items-end">
                <div class="col-md-5">
                   <label class="form-label small fw-bold text-muted mb-1">Pilih Poli (Wajib)</label>
                   <VueSelect
                      v-model="hfisCheckForm.poli"
                      :options="poliList"
                      :reduce="p => p.kd_poli_bpjs"
                      label="nm_poli_bpjs"
                      placeholder="Pilih Poli BPJS"
                   >
                     <template #option="{ kd_poli_bpjs, nm_poli_bpjs }">
                       <span><strong>{{ kd_poli_bpjs }}</strong> - {{ nm_poli_bpjs }}</span>
                     </template>
                   </VueSelect>
                </div>
                <div class="col-md-4">
                   <label class="form-label small fw-bold text-muted mb-1">Tanggal (Wajib)</label>
                   <input type="date" v-model="hfisCheckForm.tanggal" class="form-control" style="height: 38px;">
                </div>
                <div class="col-md-3">
                   <button @click="fetchHfisSchedule" class="btn btn-primary w-100 fw-bold" style="height: 38px;" :disabled="hfisCheckLoading">
                     <i class="fas" :class="hfisCheckLoading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                     {{ hfisCheckLoading ? 'Mencari...' : 'Cari Jadwal' }}
                   </button>
                </div>
             </div>
          </div>
          
          <div class="result-hfis-card bg-white rounded-3 shadow-sm border p-0 overflow-hidden">
             <!-- Loading State -->
             <div v-if="hfisCheckLoading" class="text-center p-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-3 small">Menghubungi WebService BPJS...</p>
             </div>
             
             <!-- Empty State (No Search Yet / No Result) -->
             <div v-else-if="!hfisCheckResult && !hfisCheckHasSearched" class="text-center p-5 text-muted">
                <i class="fas fa-stethoscope fa-3x mb-3 opacity-25"></i>
                <p class="m-0">Silakan pilih poli dan tanggal untuk melihat jadwal pelayanan dokter pada Aplikasi HFIS BPJS.</p>
             </div>
             
             <!-- Error State -->
             <div v-else-if="hfisCheckHasSearched && hfisCheckResult.length === 0" class="text-center p-5">
                <div class="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mb-3" style="width: 60px; height: 60px;">
                    <i class="fas fa-info-circle fa-2x"></i>
                </div>
                <h6 class="fw-bold">Tidak Ada Jadwal</h6>
                <p class="text-muted small">Mungkin tidak ada dokter yang melayani di Poli tersebut pada hari spesifik ini.</p>
             </div>
             
             <!-- Result Table -->
             <div v-else-if="hfisCheckHasSearched && hfisCheckResult.length > 0" class="table-responsive">
                <div class="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-dark"><i class="fas fa-list-alt text-primary me-2"></i>Daftar Dokter Praktik</span>
                    <span class="badge bg-primary rounded-pill px-3">{{ hfisCheckResult.length }} Jadwal</span>
                </div>
                <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
                   <thead class="table-light text-muted">
                      <tr>
                         <th class="ps-4 py-3">Dokter & Spesialis</th>
                         <th class="py-3">Poli</th>
                         <th class="py-3">Hari & Jadwal Praktek</th>
                         <th class="py-3 text-center">Kapasitas</th>
                         <th class="py-3 text-center">Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr v-for="(item, idx) in hfisCheckResult" :key="idx">
                         <td class="ps-4">
                            <div class="fw-bold text-dark">{{ item.namadokter }}</div>
                            <div class="small text-muted">Subspesialis: {{ item.namasubspesialis }} ({{ item.kodesubspesialis }})</div>
                         </td>
                         <td>
                            <div class="fw-bold">{{ item.namapoli }}</div>
                            <div class="small text-muted">{{ item.kodepoli }}</div>
                         </td>
                         <td>
                            <div class="fw-bold text-primary">{{ item.namahari }}</div>
                            <div class="small"><i class="far fa-clock me-1"></i>{{ item.jadwal }}</div>
                         </td>
                         <td class="text-center">
                            <span class="badge bg-secondary-subtle text-dark border">{{ item.kapasitaspasien }} Pasien</span>
                         </td>
                         <td class="text-center">
                            <span v-if="item.libur == 1" class="badge bg-danger">Libur</span>
                            <span v-else class="badge bg-success">Buka</span>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        </div>
        
        <div class="modal-footer bg-light border-top p-3">
          <button @click="closeHfisCheckModal" class="btn btn-secondary px-4 fw-bold">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'
import hfisScheduleService from '@/services/hfisScheduleService'

// Days list for the grid
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Cuti/Libur']

// State
const loading = ref(false)
const saving = ref(false)
const certificates = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const showModal = ref(false)
const showHfisCheckModal = ref(false)
const isEditMode = ref(false)
const dokterList = ref([])
const selectedIds = ref([])
const bulkLoading = ref(false)

// HFIS Check Schedule State
const hfisCheckLoading = ref(false)
const hfisCheckHasSearched = ref(false)
const hfisCheckResult = ref(null)
const hfisCheckForm = ref({
  poli: '',
  tanggal: new Date().toISOString().split('T')[0]
})

const formData = ref({
  kd_dokter: '',
  tgl_surat: new Date().toISOString().split('T')[0],
  nama_pic: 'Ferry Ardiansyah',
  jabatan_pic: 'PIC HFIS',
  faskes_sip1: 'RSIA Aisyiyah Pekajangan',
  faskes_sip2: '',
  faskes_sip3: '',
  details: days.map(day => ({
    hari: day,
    sip1_jam_kerja: '',
    sip1_jam_praktek: '',
    sip2_jam_kerja: '',
    sip2_jam_praktek: '',
    sip3_jam_kerja: '',
    sip3_jam_praktek: ''
  }))
})

// Handlers
const loadCertificates = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: 12 }
    if (searchQuery.value) params.keyword = searchQuery.value
    
    const response = await hfisScheduleService.getCertificates(params)
    certificates.value = response.data.data.data
    currentPage.value = response.data.data.current_page
    totalPages.value = response.data.data.last_page
  } catch (error) {
    console.error('Error loading:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadCertificates(1)
}

const changePage = (page) => {
  loadCertificates(page)
}

const openAddModal = () => {
  isEditMode.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (cert) => {
  isEditMode.value = true
  
  // Fill header
  formData.value = {
    id: cert.id,
    kd_dokter: cert.kd_dokter,
    tgl_surat: cert.tgl_surat,
    nama_pic: cert.nama_pic,
    jabatan_pic: cert.jabatan_pic,
    faskes_sip1: cert.faskes_sip1,
    faskes_sip2: cert.faskes_sip2 || '',
    faskes_sip3: cert.faskes_sip3 || '',
    details: days.map(day => {
      const existing = cert.detail.find(d => d.hari === day)
      return existing ? { ...existing } : {
        hari: day,
        sip1_jam_kerja: '',
        sip1_jam_praktek: '',
        sip2_jam_kerja: '',
        sip2_jam_praktek: '',
        sip3_jam_kerja: '',
        sip3_jam_praktek: ''
      }
    })
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const resetForm = () => {
  formData.value = {
    kd_dokter: '',
    tgl_surat: new Date().toISOString().split('T')[0],
    nama_pic: 'Ferry Ardiansyah',
    jabatan_pic: 'PIC HFIS',
    faskes_sip1: 'RSIA Aisyiyah Pekajangan',
    faskes_sip2: '',
    faskes_sip3: '',
    details: days.map(day => ({
      hari: day,
      sip1_jam_kerja: '',
      sip1_jam_praktek: '',
      sip2_jam_kerja: '',
      sip2_jam_praktek: '',
      sip3_jam_kerja: '',
      sip3_jam_praktek: ''
    }))
  }
}

const saveCertificate = async () => {
  if (!formData.value.kd_dokter || !formData.value.tgl_surat) {
    Swal.fire('Oops!', 'Dokter dan Tanggal Surat wajib diisi.', 'warning')
    return
  }

  saving.value = true
  try {
    if (isEditMode.value) {
      await hfisScheduleService.updateCertificate(formData.value.id, formData.value)
    } else {
      await hfisScheduleService.storeCertificate(formData.value)
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Draft pengajuan berhasil disimpan.',
      timer: 1500,
      showConfirmButton: false
    })
    
    closeModal()
    loadCertificates(currentPage.value)
  } catch (error) {
    console.error('Error saving:', error)
    Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan data.', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (cert) => {
  const result = await Swal.fire({
    title: 'Hapus Pengajuan?',
    text: `Yakin ingin menghapus draf pengajuan untuk ${cert.dokter.nm_dokter}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Ya, Hapus!'
  })

  if (result.isConfirmed) {
    try {
      await hfisScheduleService.deleteCertificate(cert.id)
      Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success')
      loadCertificates(currentPage.value)
    } catch (error) {
      Swal.fire('Gagal!', 'Gagal menghapus data.', 'error')
    }
  }
}

const downloadPdf = async (id) => {
  try {
    const response = await hfisScheduleService.downloadPdf(id)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => window.URL.revokeObjectURL(url), 100)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    Swal.fire('Gagal!', 'Gagal mengunduh PDF.', 'error')
  }
}

const generateBulkPdf = async () => {
  if (selectedIds.value.length === 0) return

  bulkLoading.value = true
  try {
    const response = await hfisScheduleService.downloadPdfBulk(selectedIds.value)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `sk_jadwal_hfis_bulk_${new Date().getTime()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => window.URL.revokeObjectURL(url), 100)
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'PDF Bulk berhasil digenerate.',
      timer: 1500,
      showConfirmButton: false
    })
  } catch (error) {
    console.error('Error bulk PDF:', error)
    Swal.fire('Gagal!', 'Gagal menggenerate bulk PDF.', 'error')
  } finally {
    bulkLoading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const loadMasterData = async () => {
  try {
    const resDokter = await hfisScheduleService.getDokter()
    dokterList.value = resDokter.data.data

    const resPoli = await hfisScheduleService.getPoliMappings()
    poliList.value = resPoli.data.data.poli
  } catch (err) {
    console.error('Error loading master data', err)
  }
}

// Sync HFIS Logic
const showSyncModal = ref(false)
const syncLoading = ref(false)
const poliList = ref([])
const syncData = ref({
  id: '',
  kodedokter: '',
  kodepoli: '',
  kodesubspesialis: '',
  nm_dokter: '',
  jadwal_parsed: []
})

const openSyncHfisModal = (cert) => {
  // Parse schedule from details
  // Group by day to create the array expected by API
  // Map day names to numbers: Senin=1... Minggu=7, Libur=8
  const daysMap = {
    'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7, 'Cuti/Libur': 8
  }

  const parsedSchedule = []
  
  cert.detail.forEach(d => {
    // Check sip1_jam_praktek
    // Format expected: 08:00 - 10:00 (multiple lines possible)
    const times = d.sip1_jam_praktek ? d.sip1_jam_praktek.split('\n') : []
    
    times.forEach(timeRange => {
      // Basic parser for "HH:mm - HH:mm"
      // Remove text like "WIB", etc if simple
      const cleanTime = timeRange.replace(/[a-zA-Z]/g, '').trim()
      const parts = cleanTime.split('-').map(t => t.trim())
      
      if (parts.length >= 2) {
        // Validation simple
        if (parts[0].length === 5 && parts[1].length === 5) {
             parsedSchedule.push({
               hari: daysMap[d.hari],
               hari_nama: d.hari,
               buka: parts[0],
               tutup: parts[1]
             })
        }
      }
    })
  })

  syncData.value = {
    id: cert.id,
    kodedokter: cert.dokter?.mapping_bpjs?.kd_dokter_bpjs || '', 
    // Auto-fill poli if available from first schedule
    kodepoli: cert.dokter?.jadwal?.[0]?.poliklinik?.mapping_bpjs?.kd_poli_bpjs || '',
    kodesubspesialis: cert.dokter?.jadwal?.[0]?.poliklinik?.mapping_bpjs?.kd_poli_bpjs || '',
    nm_dokter: cert.dokter?.nm_dokter,
    jadwal_parsed: parsedSchedule
  }

  showSyncModal.value = true
}

const closeSyncModal = () => {
  showSyncModal.value = false
}

const confirmSyncHfis = async () => {
  if (!syncData.value.kodedokter || !syncData.value.kodepoli || !syncData.value.kodesubspesialis) {
    Swal.fire('Oops!', 'Semua field (Dokter, Poli, Subspesialis) harus diisi.', 'warning')
    return
  }
  
  if (syncData.value.jadwal_parsed.length === 0) {
    Swal.fire('Oops!', 'Tidak ada jadwal yang terdeteksi untuk disync.', 'warning')
    return
  }

  syncLoading.value = true
  try {
    const payload = {
      kodedokter: syncData.value.kodedokter,
      kodepoli: syncData.value.kodepoli,
      kodesubspesialis: syncData.value.kodesubspesialis,
      jadwal: syncData.value.jadwal_parsed.map(j => ({
        hari: j.hari,
        buka: j.buka,
        tutup: j.tutup
      }))
    }
    
    await hfisScheduleService.updateHfis(payload)
    
    Swal.fire('Berhasil!', 'Jadwal dokter berhasil diupdate ke HFIS.', 'success')
    closeSyncModal()
  } catch (error) {
    console.error('Sync Error:', error)
    const msg = error.response?.data?.message || 'Gagal update jadwal ke HFIS.'
    Swal.fire('Gagal!', msg, 'error')
  } finally {
    syncLoading.value = false
  }
}

// Check HFIS Schedule Methods
const openHfisCheckModal = () => {
  showHfisCheckModal.value = true
  hfisCheckHasSearched.value = false
  hfisCheckResult.value = null
  hfisCheckForm.value.poli = ''
}

const closeHfisCheckModal = () => {
  showHfisCheckModal.value = false
}

const fetchHfisSchedule = async () => {
  if (!hfisCheckForm.value.poli || !hfisCheckForm.value.tanggal) {
    Swal.fire('Perhatian', 'Poli dan Tanggal wajib diisi', 'warning')
    return
  }
  
  hfisCheckLoading.value = true
  hfisCheckHasSearched.value = true
  
  try {
    const res = await hfisScheduleService.getJadwalDokter(hfisCheckForm.value.poli, hfisCheckForm.value.tanggal)
    
    if (res.data.status === 'success' && res.data.data?.response) {
      const respData = res.data.data.response
      if (Array.isArray(respData)) {
        hfisCheckResult.value = respData
      } else if (respData && Array.isArray(respData.list)) {
        hfisCheckResult.value = respData.list
      } else {
        hfisCheckResult.value = []
      }
      
      if (hfisCheckResult.value.length === 0) {
        Swal.fire('Informasi', 'Tidak ada jadwal ditemukan', 'info')
      }
    } else {
      hfisCheckResult.value = []
      Swal.fire('Informasi', res.data.message || 'Tidak ada jadwal ditemukan', 'info')
    }
  } catch (err) {
    console.error('Error fetching HFIS schedule:', err)
    hfisCheckResult.value = []
    const msg = err.response?.data?.message || 'Gagal terhubung ke service BPJS'
    Swal.fire('Error', msg, 'error')
  } finally {
    hfisCheckLoading.value = false
  }
}

onMounted(() => {
  loadCertificates()
  loadMasterData()
})
</script>

<style scoped>
.hfis-schedule-page {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1e293b;
}

.header-content h1 i { color: #2563eb; }
.header-content p { color: #64748b; margin-top: 0.5rem; }

.btn-add {
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-add:hover { background: #1d4ed8; transform: translateY(-1px); }

/* Filters */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}

.search-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-bulk {
  padding: 0.75rem 1.25rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-bulk:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
}

.btn-bulk:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-clear {
  color: #64748b;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
}

.btn-search {
  padding: 0 1.25rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}

/* List Grid */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.cert-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  transition: all 0.2s;
}

.cert-card:hover { border-color: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08); }

.cert-card.is-selected {
  border-color: #059669;
  background: #f0fdf4;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.cert-selection {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cert-selection input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #059669;
}

.cert-date {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cert-actions { display: flex; gap: 0.5rem; }

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-pdf { color: #dc2626; border-color: #fecaca; background: #fef2f2; }
.btn-pdf:hover { background: #fee2e2; }
.btn-edit { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
.btn-edit:hover { background: #dbeafe; }
.btn-delete { color: #ef4444; border-color: #fecaca; }
.btn-delete:hover { background: #fee2e2; }

.doctor-name { font-size: 1.15rem; color: #1e293b; margin: 0; font-weight: 700; }
.spesialis-text { color: #64748b; font-size: 0.9rem; margin: 0.25rem 0 1rem; }

.pic-info {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #64748b;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; bottom: 0; right: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 2rem;
}

.modal-content.large {
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-content {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 { font-size: 1.25rem; margin: 0; display: flex; align-items: center; gap: 0.75rem; }

.btn-close { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.form-section { margin-bottom: 2.5rem; }
.section-title { font-size: 1rem; font-weight: 700; color: #475569; margin-bottom: 1.25rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f1f5f9; }

.form-row { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.flex-2 { flex: 2; }

.form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
.form-group input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.required { color: #ef4444; }

/* Grid Table */
.table-responsive { overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
.grid-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.grid-table th { background: #f8fafc; padding: 0.75rem; font-size: 0.75rem; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
.grid-table td { padding: 0.5rem; border: 1px solid #e2e8f0; vertical-align: top; }
.day-label { background: #f8fafc; font-weight: 700; font-size: 0.85rem; color: #1e293b; width: 120px; }

.grid-table textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.25rem;
  outline: none;
}

.helper-text { font-size: 0.8rem; color: #94a3b8; font-style: italic; margin-top: 0.75rem; }

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}


/* Modern Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  background: radial-gradient(circle at center, rgba(248, 250, 252, 0.5) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 16px;
  grid-column: 1 / -1;
}

.empty-state i {
  font-size: 3rem;
  color: #3b82f6;
  margin-bottom: 1.5rem;
  animation: floatEmptyIcon 4s ease-in-out infinite;
}

.empty-state p {
  color: #64748b;
  font-size: 0.925rem;
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
}

@keyframes floatEmptyIcon {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}

.btn-cancel { padding: 0.75rem 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-save { padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
@media (max-width: 768px) {
  .hfis-schedule-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
  }

  .bulk-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-bulk {
    justify-content: center;
  }

  .btn-clear {
    text-align: center;
    padding: 0.5rem;
  }

  .certificates-grid {
    grid-template-columns: 1fr;
  }

  .cert-card {
    padding: 1.25rem;
  }

  .modal-overlay {
    padding: 0;
  }

  .modal-content.large {
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .grid-table th {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }
  .grid-table th:first-child,
  .grid-table td:first-child {
    width: 60px;
  }
}
</style>
