<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1 fw-bold text-dark">
          <i class="fas fa-procedures me-2 text-danger"></i>
          Jadwal Operasi
        </h4>
        <p class="text-muted small mb-0">Daftar Jadwal Operasi Pasien</p>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card shadow-sm mb-4" style="overflow: visible;">
      <div class="card-body" style="overflow: visible;">
        <div class="row g-3 align-items-end">
          <div class="col-md-2">
            <label class="form-label small fw-bold text-muted mb-1">Tanggal Awal</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="filters.tgl_awal"
              @change="fetchData(true)"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold text-muted mb-1">Tanggal Akhir</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="filters.tgl_akhir"
              @change="fetchData(true)"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold text-muted mb-1">Status</label>
            <select 
              class="form-select" 
              v-model="filters.status"
              @change="fetchData(true)"
            >
              <option value="">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Proses Operasi">Proses Operasi</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted mb-1">Dokter Operator</label>
            <v-select
              v-model="filters.kd_dokter"
              :options="dokterList"
              :reduce="dokter => dokter.kd_dokter"
              label="nm_dokter"
              placeholder="Pilih Dokter"
              @update:modelValue="fetchData(true)"
              :append-to-body="true"
            ></v-select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted mb-1">Cari (No. Rawat / Nama Pasien)</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="filters.keyword"
              placeholder="Ketik untuk mencari..."
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive" style="max-height: calc(100vh - 350px); overflow-y: auto;" @scroll="handleScroll">
          <table class="table table-hover table-sm mb-0">
            <thead class="table-light sticky-top">
              <tr>
                <th class="text-center" style="width: 50px;">#</th>
                <th style="width: 150px;">Tanggal</th>
                <th style="width: 120px;">Jam</th>
                <th style="width: 150px;">No. Rawat</th>
                <th>Pasien</th>
                <th>Paket Operasi</th>
                <th style="width: 200px;">Diagnosa</th>
                <th>Dokter Operator</th>
                <th class="text-center" style="width: 120px;">Status</th>
                <th class="text-center" style="width: 100px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading && items.length === 0">
                <td colspan="10" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="text-muted mt-2 mb-0">Memuat data...</p>
                </td>
              </tr>
              <tr v-else-if="!loading && items.length === 0">
                <td colspan="10" class="text-center py-5">
                  <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p class="text-muted mb-0">Tidak ada data jadwal operasi</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in items" :key="item.no_rawat + '-' + item.tanggal">
                <td class="text-center text-muted small">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
                <td class="small">
                  <div class="fw-bold">{{ formatDate(item.tanggal) }}</div>
                </td>
                <td class="small">
                  <div>{{ item.jam_mulai }} - {{ item.jam_selesai }}</div>
                </td>
                <td class="small">
                  <span class="badge bg-light text-dark border">{{ item.no_rawat }}</span>
                </td>
                <td class="small">
                  <div class="fw-bold">{{ item.reg_periksa?.pasien?.nm_pasien || '-' }}</div>
                  <div class="text-muted">{{ item.reg_periksa?.no_rkm_medis || '-' }}</div>
                </td>
                <td class="small">
                  <div class="fw-bold text-primary">{{ item.paket_operasi?.nm_perawatan || '-' }}</div>
                  <div class="text-muted">{{ item.paket_operasi?.kategori || '-' }}</div>
                </td>
                <td class="small">
                  <div v-if="item.diagnosa_operasi && item.diagnosa_operasi.length > 0">
                    <div v-for="(diag, idx) in item.diagnosa_operasi" :key="idx" class="mb-1">
                      {{ diag.diagnosa }}
                    </div>
                  </div>
                  <span v-else class="text-muted fst-italic">-</span>
                </td>
                <td class="small">
                  {{ item.dokter?.nm_dokter || '-' }}
                </td>
                <td class="text-center">
                  <span 
                    class="badge" 
                    :class="{
                      'bg-warning': item.status === 'Menunggu',
                      'bg-info': item.status === 'Proses Operasi',
                      'bg-success': item.status === 'Selesai'
                    }"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-flex gap-1 justify-content-center">
                     <button 
                       v-if="item.status === 'Selesai'"
                       class="btn btn-sm"
                       :class="item.laporan_operasi ? 'btn-success' : 'btn-primary'"
                       @click="openLaporanModal(item)"
                       title="Laporan Operasi"
                       style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
                     >
                       <i class="fas fa-file-medical"></i>
                     </button>
                     <button 
                       class="btn btn-sm btn-warning"
                       @click="openUpdateStatusModal(item)"
                       title="Update Status"
                       style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
                     >
                       <i class="fas fa-sync-alt"></i>
                     </button>
                     <button 
                       class="btn btn-sm btn-danger"
                       @click="confirmDelete(item)"
                       title="Hapus Jadwal"
                       style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"
                     >
                       <i class="fas fa-trash"></i>
                     </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Footer with total count -->
      <div class="card-footer bg-light border-top">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">
            <i class="fas fa-info-circle me-1"></i>
            Total: <strong>{{ pagination.total || 0 }}</strong> jadwal operasi
          </small>
          <small class="text-muted" v-if="loading && items.length > 0">
            <span class="spinner-border spinner-border-sm me-1"></span>
            Memuat lebih banyak...
          </small>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="showUpdateStatusModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-primary text-white border-0">
            <h5 class="modal-title">
              <i class="fas fa-sync-alt me-2"></i>
              Update Status Operasi
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeUpdateStatusModal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="text-center mb-4">
              <i class="fas fa-procedures fa-3x text-primary mb-3"></i>
            </div>
            
            <div class="bg-light p-3 rounded mb-3">
              <div class="row mb-2">
                <div class="col-4 text-muted small">No. Rawat:</div>
                <div class="col-8">
                  <span class="badge bg-secondary">{{ selectedItem?.no_rawat }}</span>
                </div>
              </div>
              <hr class="my-2">
              <div class="row mb-2">
                <div class="col-4 text-muted small">Pasien:</div>
                <div class="col-8 fw-bold">{{ selectedItem?.reg_periksa?.pasien?.nm_pasien }}</div>
              </div>
              <hr class="my-2">
              <div class="row mb-2">
                <div class="col-4 text-muted small">Tanggal:</div>
                <div class="col-8">{{ formatDate(selectedItem?.tanggal) }}</div>
              </div>
              <hr class="my-2">
              <div class="row">
                <div class="col-4 text-muted small">Status Saat Ini:</div>
                <div class="col-8">
                  <span class="badge" :class="{
                    'bg-warning': selectedItem?.status === 'Menunggu',
                    'bg-info': selectedItem?.status === 'Proses Operasi',
                    'bg-success': selectedItem?.status === 'Selesai'
                  }">
                    {{ selectedItem?.status }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-bold">
                <i class="fas fa-arrow-right me-2 text-primary"></i>
                Pilih Status Baru
              </label>
              <div class="d-grid gap-2">
                <button 
                  type="button" 
                  class="btn text-start d-flex align-items-center justify-content-between"
                  :class="newStatus === 'Menunggu' ? 'btn-warning' : 'btn-outline-warning'"
                  @click="newStatus = 'Menunggu'"
                >
                  <span>
                    <i class="fas fa-clock me-2"></i>
                    Menunggu
                  </span>
                  <i v-if="newStatus === 'Menunggu'" class="fas fa-check"></i>
                </button>
                <button 
                  type="button" 
                  class="btn text-start d-flex align-items-center justify-content-between"
                  :class="newStatus === 'Proses Operasi' ? 'btn-info' : 'btn-outline-info'"
                  @click="newStatus = 'Proses Operasi'"
                >
                  <span>
                    <i class="fas fa-heartbeat me-2"></i>
                    Proses Operasi
                  </span>
                  <i v-if="newStatus === 'Proses Operasi'" class="fas fa-check"></i>
                </button>
                <button 
                  type="button" 
                  class="btn text-start d-flex align-items-center justify-content-between"
                  :class="newStatus === 'Selesai' ? 'btn-success' : 'btn-outline-success'"
                  @click="newStatus = 'Selesai'"
                >
                  <span>
                    <i class="fas fa-check-circle me-2"></i>
                    Selesai
                  </span>
                  <i v-if="newStatus === 'Selesai'" class="fas fa-check"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary" @click="closeUpdateStatusModal">
              <i class="fas fa-times me-1"></i>
              Batal
            </button>
            <button type="button" class="btn btn-primary" @click="submitUpdateStatus" :disabled="isUpdating">
              <span v-if="isUpdating" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-save me-1"></i>
              {{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-danger text-white border-0">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Konfirmasi Hapus
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="text-center mb-3">
              <i class="fas fa-trash-alt fa-3x text-danger mb-3"></i>
              <h5 class="fw-bold">Apakah Anda yakin ingin menghapus jadwal operasi ini?</h5>
            </div>
            <div class="bg-light p-3 rounded">
              <div class="row">
                <div class="col-4 text-muted small">Pasien:</div>
                <div class="col-8 fw-bold">{{ itemToDelete?.reg_periksa?.pasien?.nm_pasien }}</div>
              </div>
              <hr class="my-2">
              <div class="row">
                <div class="col-4 text-muted small">No. Rawat:</div>
                <div class="col-8">
                  <span class="badge bg-secondary">{{ itemToDelete?.no_rawat }}</span>
                </div>
              </div>
              <hr class="my-2">
              <div class="row">
                <div class="col-4 text-muted small">Tanggal:</div>
                <div class="col-8">{{ formatDate(itemToDelete?.tanggal) }}</div>
              </div>
              <hr class="my-2">
              <div class="row">
                <div class="col-4 text-muted small">Paket:</div>
                <div class="col-8 text-primary">{{ itemToDelete?.paket_operasi?.nm_perawatan }}</div>
              </div>
            </div>
            <div class="alert alert-warning mt-3 mb-0">
              <i class="fas fa-info-circle me-2"></i>
              <small>Data yang sudah dihapus tidak dapat dikembalikan!</small>
            </div>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">
              <i class="fas fa-times me-1"></i>
              Batal
            </button>
            <button type="button" class="btn btn-danger" @click="executeDelete" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-trash me-1"></i>
              {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-body text-center p-4">
            <div class="mb-3">
              <div class="success-checkmark">
                <div class="check-icon">
                  <span class="icon-line line-tip"></span>
                  <span class="icon-line line-long"></span>
                  <div class="icon-circle"></div>
                  <div class="icon-fix"></div>
                </div>
              </div>
            </div>
            <h5 class="fw-bold text-success mb-2">Berhasil!</h5>
            <p class="text-muted mb-0">{{ successMessage }}</p>
          </div>
          <div class="modal-footer border-0 justify-content-center pb-4">
            <button type="button" class="btn btn-success px-4" @click="closeSuccessModal">
              <i class="fas fa-check me-1"></i>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Laporan Operasi Modal -->
    <!-- Laporan Operasi Modal -->
    <LaporanOperasiModal 
        :show="showLaporanModal"
        :form="laporanForm"
        :dokter-list="dokterList"
        :pegawai-list="listPegawai"
        :loading="isSavingLaporan"
        @close="showLaporanModal = false"
        @submit="submitLaporan"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import operasiService from '@/services/operasiService'
import rawatInapService from '@/services/rawatInapService'
import LaporanOperasiModal from '@/components/pemeriksaan/LaporanOperasiModal.vue'

// Debounce helper
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// State
const items = ref([])
const loading = ref(false)
const hasMore = ref(true)
const dokterList = ref([])
const showUpdateStatusModal = ref(false)
const selectedItem = ref(null)
const newStatus = ref('')
const isUpdating = ref(false)
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const isDeleting = ref(false)
const showSuccessModal = ref(false)
const successMessage = ref('')

const pagination = reactive({
  current_page: 1,
  per_page: 20,
  total: 0
})

const filters = reactive({
  tgl_awal: new Date().toISOString().split('T')[0],
  tgl_akhir: new Date().toISOString().split('T')[0],
  status: '',
  kd_dokter: null,
  keyword: ''
})

// Laporan Operasi State
const showLaporanModal = ref(false)
const listPegawai = ref([])
const isSavingLaporan = ref(false)
const laporanForm = reactive({
  no_rawat: '',
  kode_paket: '',
  tgl_operasi: '',
  tgl_selesai: '',
  kategori: 'Elektive',
  jenis_anestesi: '',
  diagnosa_preop: '',
  diagnosa_postop: '',
  laporan_operasi: '',
  operator1: '',
  asisten_operator1: '',
  asisten_operator2: '',
  dokter_anak: '',
  dokter_anestesi: '',
  asisten_anestesi: '',
  onloop: '',
  jaringan_insisi: '',
  pemeriksaan_pa: 'Tidak',
  dr_anestesi_hadir: 'Tidak',
  dr_anak_hadir: 'Tidak',
  darah_masuk: '',
  darah_hilang: '',
  komplikasi: ''
})

// Methods
const fetchData = async (reset = false) => {
  if (loading.value) return
  
  if (reset) {
    items.value = []
    pagination.current_page = 1
    hasMore.value = true
  }
  
  loading.value = true
  
  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir
    }
    
    if (filters.status) params.status = filters.status
    if (filters.kd_dokter) params.kd_dokter = filters.kd_dokter
    if (filters.keyword) params.keyword = filters.keyword
    
    const response = await operasiService.getBooking(params)
    
    if (response.data && response.data.success) {
      const newItems = response.data.data.data || []
      
      if (reset) {
        items.value = newItems
      } else {
        items.value = [...items.value, ...newItems]
      }
      
      pagination.current_page = response.data.data.current_page
      pagination.total = response.data.data.total
      
      hasMore.value = response.data.data.current_page < response.data.data.last_page
    }
  } catch (error) {
    console.error('Error fetching booking operasi:', error)
  } finally {
    loading.value = false
  }
}

const fetchDokter = async () => {
  try {
    const response = await rawatInapService.getDokter()
    if (response.data && response.data.success) {
      dokterList.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching dokter:', error)
  }
}

const fetchPegawai = async () => {
    try {
        const response = await operasiService.getPegawai()
        if (response.data && response.data.success) {
            listPegawai.value = response.data.data
        }
    } catch (e) { console.error(e) }
}

const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  
  if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore.value && !loading.value) {
    pagination.current_page++
    fetchData()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
}

const openLaporanModal = async (item) => {
  // Initialize form
  Object.keys(laporanForm).forEach(key => laporanForm[key] = '')
  
  // Set keys
  laporanForm.no_rawat = item.no_rawat
  laporanForm.kode_paket = item.kode_paket
  laporanForm.tgl_operasi = item.tanggal 
  // note: item.tanggal might be '2023-01-01 10:00:00' or just date?
  // If it's just date, we might need to append time from jam_mulai?
  // But DB PK schema usually expects exact match. 
  // Let's rely on what the API returns or use existing item.tanggal.
  
  // Set defaults from item
  laporanForm.operator1 = item.kd_dokter
  laporanForm.diagnosa_preop = item.diagnosa || (item.diagnosa_operasi?.[0]?.diagnosa || '')
  
  // Fetch existing laporan if any
  try {
      const res = await operasiService.getLaporan({
          no_rawat: item.no_rawat,
          kode_paket: item.kode_paket,
          tgl_operasi: item.tanggal
      })
      
      if (res.data && res.data.data) {
          const existing = res.data.data
          Object.keys(laporanForm).forEach(key => {
              if (existing[key] !== undefined && existing[key] !== null) {
                  laporanForm[key] = existing[key]
              }
          })
      }
  } catch (e) { console.error('Error fetch laporan', e) }
  
  showLaporanModal.value = true
  
  // Ensure master data is loaded
  if (listPegawai.value.length === 0) fetchPegawai()
}

const submitLaporan = async () => {
    if (!laporanForm.tgl_selesai || !laporanForm.operator1 || !laporanForm.jenis_anestesi) {
        alert('Mohon lengkapi data wajib (Tgl Selesai, Operator, Jenis Anestesi)')
        return
    }

    isSavingLaporan.value = true
    try {
        const res = await operasiService.storeLaporan(laporanForm)
        if (res.data && res.data.success) {
            successMessage.value = 'Laporan Operasi berhasil disimpan!'
            showSuccessModal.value = true
            showLaporanModal.value = false
        }
    } catch (e) {
        alert('Gagal menyimpan: ' + (e.response?.data?.message || e.message))
    } finally {
        isSavingLaporan.value = false
    }
}

const openUpdateStatusModal = (item) => {
  selectedItem.value = item
  newStatus.value = item.status
  showUpdateStatusModal.value = true
}

const closeUpdateStatusModal = () => {
  showUpdateStatusModal.value = false
  selectedItem.value = null
  newStatus.value = ''
}

const submitUpdateStatus = async () => {
  if (!selectedItem.value || !newStatus.value) return
  
  if (newStatus.value === selectedItem.value.status) {
    alert('Status tidak berubah')
    return
  }
  
  isUpdating.value = true
  
  try {
    const response = await operasiService.updateStatus(
      selectedItem.value.no_rawat,
      selectedItem.value.tanggal,
      newStatus.value
    )
    
    if (response.data && response.data.success) {
      successMessage.value = 'Status operasi berhasil diupdate!'
      showSuccessModal.value = true
      closeUpdateStatusModal()
      fetchData(true) // Refresh data
    }
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Gagal mengupdate status: ' + (error.response?.data?.message || error.message))
  } finally {
    isUpdating.value = false
  }
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  successMessage.value = ''
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
}

const executeDelete = async () => {
  if (!itemToDelete.value) return
  
  isDeleting.value = true
  
  try {
    const response = await operasiService.deleteBooking(
      itemToDelete.value.no_rawat,
      itemToDelete.value.tanggal
    )
    
    if (response.data && response.data.success) {
      successMessage.value = 'Jadwal operasi berhasil dihapus!'
      showSuccessModal.value = true
      closeDeleteModal()
      fetchData(true) // Refresh data
    }
  } catch (error) {
    console.error('Error deleting booking:', error)
    alert('❌ Gagal menghapus jadwal: ' + (error.response?.data?.message || error.message))
  } finally {
    isDeleting.value = false
  }
}

// Watchers
const startDebounceSearch = debounce(() => {
  fetchData(true)
}, 500)

watch(() => filters.keyword, () => {
  startDebounceSearch()
})

// Lifecycle
onMounted(() => {
  fetchDokter()
  fetchData(true)
})
</script>

<style scoped>
.table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.85rem;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr {
  transition: background-color 0.2s;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Fix v-select dropdown overflow */
.card-body {
  overflow: visible !important;
}

:deep(.v-select) {
  /* Remove static z-index to prevent stacking context issues */
  /* z-index: 1000; */ 
}

:deep(.vs__dropdown-menu) {
  z-index: 9999 !important; /* Higher than modal (1050/1060) */
  max-height: 200px; /* Limit height to prevent huge dropdowns */
}

/* Success Checkmark Animation */
.success-checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.success-checkmark .check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4caf50;
}

.success-checkmark .check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.success-checkmark .check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.success-checkmark .check-icon::before,
.success-checkmark .check-icon::after {
  content: '';
  height: 100px;
  position: absolute;
  background: #fff;
  transform: rotate(-45deg);
}

.success-checkmark .check-icon .icon-line {
  height: 5px;
  background-color: #4caf50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.success-checkmark .check-icon .icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.success-checkmark .check-icon .icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.success-checkmark .check-icon .icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(76, 175, 80, 0.5);
}

.success-checkmark .check-icon .icon-fix {
  top: 8px;
  width: 5px;
  left: 26px;
  z-index: 1;
  height: 85px;
  position: absolute;
  transform: rotate(-45deg);
  background-color: #fff;
}

@keyframes rotate-circle {
  0% {
    transform: rotate(-45deg);
  }
  5% {
    transform: rotate(-45deg);
  }
  12% {
    transform: rotate(-405deg);
  }
  100% {
    transform: rotate(-405deg);
  }
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 45px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}
</style>
