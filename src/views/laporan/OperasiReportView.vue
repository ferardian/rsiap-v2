<template>
  <div class="operasi-report-container p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="header-content">
        <div class="header-text">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <h2 class="page-title mb-0">
              <i class="fas fa-file-medical-alt me-2"></i>
              Laporan Operasi
            </h2>
            <button @click="isFilterVisible = !isFilterVisible" class="btn-toggle-filter d-md-none">
              <i class="fas text-white" :class="isFilterVisible ? 'fa-chevron-up' : 'fa-filter'"></i>
            </button>
          </div>
          <p class="page-subtitle mb-0 text-white">Rekapitulasi data tindakan operasi berdasarkan periode dan filter</p>
        </div>
        
        <transition name="collapse">
          <div v-show="isFilterVisible || !isMobile" class="header-actions">
            <div class="filter-grid">
              <!-- Date Range -->
            <div class="filter-group wider-filter">
              <label class="filter-label">PERIODE</label>
              <div class="date-input-group p-0 overflow-hidden">
                <div class="flex-grow-1 d-flex align-items-center ps-3 pe-2 h-100 border-end" @click="triggerDatePicker('start')">
                  <input type="date" v-model="filters.start" class="form-input" ref="startDateInput" />
                  <i class="far fa-calendar-alt text-muted ms-2 small"></i>
                </div>
                <span class="date-separator px-2">s/d</span>
                <div class="flex-grow-1 d-flex align-items-center ps-2 pe-3 h-100 border-start" @click="triggerDatePicker('end')">
                  <input type="date" v-model="filters.end" class="form-input" ref="endDateInput" />
                  <i class="far fa-calendar-alt text-muted ms-2 small"></i>
                </div>
              </div>
            </div>

              <!-- Penjab / Jenis Bayar -->
              <div class="filter-group custom-v-select">
                <label class="filter-label">JENIS BAYAR</label>
                <v-select
                  v-model="filters.kd_pj"
                  :options="penjabList"
                  :reduce="p => p.kd_pj"
                  label="png_jawab"
                  placeholder="Semua Bayar"
                  class="modern-v-select"
                />
              </div>

              <!-- Dokter / Operator -->
              <div class="filter-group custom-v-select">
                <label class="filter-label">DOKTER OPERATOR</label>
                <v-select
                  v-model="filters.operator"
                  :options="dokterList"
                  :reduce="d => d.kd_dokter"
                  label="nm_dokter"
                  placeholder="Semua Dokter"
                  class="modern-v-select"
                />
              </div>

              <!-- Filter Mode Toggle (Desktop & Mobile) -->
              <div class="filter-group-toggle">
                <label class="filter-label">METODE FILTER</label>
                <div class="mode-toggle-group">
                  <button 
                    @click="filterMode = 'paket'; filters.jenis_tindakan = null" 
                    :class="{ active: filterMode === 'paket' }"
                    class="mode-btn"
                  >
                    Nama
                  </button>
                  <button 
                    @click="filterMode = 'jenis'; filters.kode_paket = ''" 
                    :class="{ active: filterMode === 'jenis' }"
                    class="mode-btn"
                  >
                    Jenis
                  </button>
                </div>
              </div>

              <!-- Nama Operasi / Paket -->
              <div v-if="filterMode === 'paket'" class="filter-group custom-v-select">
                <label class="filter-label">NAMA OPERASI</label>
                <v-select
                  v-model="filters.kode_paket"
                  :options="paketList"
                  :reduce="p => p.kode_paket"
                  label="nm_perawatan"
                  placeholder="Semua Operasi"
                  class="modern-v-select"
                />
              </div>

              <!-- Jenis Operasi (SC, Kuret, Lainnya) -->
              <div v-else class="filter-group custom-v-select">
                <label class="filter-label">JENIS OPERASI</label>
                <v-select
                  v-model="filters.jenis_tindakan"
                  :options="jenisTindakanOptions"
                  placeholder="Semua Jenis"
                  class="modern-v-select"
                />
              </div>

              <div class="filter-group d-flex align-items-end">
                <button @click="loadData(1)" class="btn-refresh-premium" :disabled="loading">
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                  Tampilkan
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-card">
      <div class="card-header-modern d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Daftar Tindakan Operasi</h5>
        <div class="search-box">
          <input type="text" v-model="filters.q" placeholder="Cari No. Rawat/RM/Pasien..." @input="onSearch" class="form-control form-control-sm">
        </div>
      </div>
      
      <div class="card-body-modern p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="bg-light text-secondary lowercase">
              <tr>
                <th class="ps-4">Tgl Operasi</th>
                <th>No. Rawat / RM</th>
                <th>Nama Pasien</th>
                <th>Kelas</th>
                <th>Operasi</th>
                <th>Operator</th>
                <th>Bayar</th>
                <th class="text-center">Kategori</th>
                <th class="text-center pe-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="text-center">
                <td colspan="9" class="py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0" class="text-center">
                <td colspan="9" class="py-5 text-muted">Data tidak ditemukan</td>
              </tr>
              <tr v-for="item in items" :key="item.no_rawat + item.tgl_operasi + item.kode_paket">
                <td class="ps-4">
                  <div class="fw-bold">{{ formatDateShort(item.tgl_operasi) }}</div>
                  <small class="text-muted">{{ formatTime(item.tgl_operasi) }}</small>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ item.no_rawat }}</span>
                  <div class="small text-muted mt-1">{{ item.reg_periksa?.no_rkm_medis }}</div>
                </td>
                <td><div class="fw-bold">{{ item.reg_periksa?.pasien?.nm_pasien || '-' }}</div></td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="badge bg-light text-secondary border px-2 mb-1 w-fit">
                      {{ getKamarInfo(item).kelas }}
                    </span>
                    <small class="text-muted text-nowrap" style="font-size: 0.75rem;">
                      {{ getKamarInfo(item).kamar }}
                    </small>
                  </div>
                </td>
                <td>
                  <div class="text-primary fw-medium">{{ item.detail_paket?.nm_perawatan }}</div>
                  <small class="text-muted">{{ item.kode_paket }}</small>
                </td>
                <td>{{ item.detail_operator1?.nm_dokter || '-' }}</td>
                <td>
                  <span class="badge bg-soft-info text-info rounded-pill px-3">
                    {{ item.reg_periksa?.cara_bayar?.png_jawab || '-' }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="['badge rounded-pill px-3', getKategoriClass(item.kategori)]">
                    {{ item.kategori || '-' }}
                  </span>
                </td>
                <td class="text-center pe-4">
                  <button @click="showDetail(item)" class="btn-action-detail" title="Lihat Detail Laporan">
                    <i class="fas fa-file-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modern Pagination Footer -->
      <div class="pagination-footer px-4 py-3" v-if="pagination.total > 0">
        <div class="pagination-info d-none d-md-flex">
          <span class="info-label">Menampilkan</span>
          <span class="info-value">{{ pagination.from }} - {{ pagination.to }}</span>
          <span class="info-label">dari</span>
          <span class="info-value total">{{ pagination.total }}</span>
          <span class="info-label ms-1">data</span>
        </div>
        
        <div class="pagination-controls">
          <button 
            class="control-btn" 
            :disabled="!pagination.prev_page_url"
            @click="loadData(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="current-page-pill">
            <span class="label">Halaman</span>
            <span class="number">{{ pagination.current_page }}</span>
          </div>
          
          <button 
            class="control-btn" 
            :disabled="!pagination.next_page_url"
            @click="loadData(pagination.current_page + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Laporan Modal -->
    <div v-if="selectedReport" class="modal-backdrop-premium" @click.self="selectedReport = null">
      <div class="modal-dialog-premium">
        <div class="modal-header-premium">
          <div class="header-left">
            <i class="fas fa-file-medical-alt title-icon"></i>
            <div>
              <h5 class="modal-title">Detail Laporan Operasi</h5>
              <p class="modal-subtitle">{{ selectedReport.no_rawat }} • {{ selectedReport.reg_periksa?.pasien?.nm_pasien }}</p>
            </div>
          </div>
          <button class="btn-close-premium" @click="selectedReport = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body-premium">
          <div v-if="reportLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted">Mengambil data laporan...</p>
          </div>
          
          <div v-else-if="reportDetail" class="detail-content">
            <!-- Grid Info Utama -->
            <div class="info-grid mb-4">
              <div class="info-card">
                <i class="fas fa-calendar-check icon"></i>
                <div class="text">
                  <label>Tanggal Operasi</label>
                  <span>{{ formatDateTime(reportDetail.tgl_operasi) }}</span>
                </div>
              </div>
              <div class="info-card">
                <i class="fas fa-procedures icon"></i>
                <div class="text">
                  <label>Nama Operasi</label>
                  <span>{{ reportDetail.detail_paket?.nm_perawatan || '-' }}</span>
                </div>
              </div>
              <div class="info-card">
                <i class="fas fa-user-md icon"></i>
                <div class="text">
                  <label>Operator Utama</label>
                  <span>{{ reportDetail.detail_operator1?.nm_dokter || '-' }}</span>
                </div>
              </div>
              <div class="info-card">
                <i class="fas fa-syringe icon"></i>
                <div class="text">
                  <label>Jenis Anestesi</label>
                  <span>{{ reportDetail.jenis_anasthesi || '-' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Diagnosa Section -->
            <div class="detail-section card border-0 shadow-sm mb-4" style="background: #fdfdfd; border-left: 4px solid #3b82f6 !important;">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-md-6 border-end">
                    <h6 class="text-primary mb-2 small fw-bold text-uppercase" style="letter-spacing: 0.5px;">
                      <i class="fas fa-stethoscope me-2"></i>Diagnosa Utama
                    </h6>
                    <div v-if="getPrimaryDiagnosa(reportDetail).length > 0">
                      <div v-for="(diag, idx) in getPrimaryDiagnosa(reportDetail)" :key="idx" class="fw-medium text-dark">
                        {{ diag.kd_penyakit }} - {{ diag.penyakit?.nm_penyakit }}
                      </div>
                    </div>
                    <div v-else class="text-muted small italic">Tidak ada diagnosa utama</div>
                  </div>
                  <div class="col-md-6 ps-md-4">
                    <h6 class="text-secondary mb-2 small fw-bold text-uppercase" style="letter-spacing: 0.5px;">
                      <i class="fas fa-notes-medical me-2"></i>Diagnosa Sekunder
                    </h6>
                    <div v-if="getSecondaryDiagnosa(reportDetail).length > 0">
                      <div v-for="(diag, idx) in getSecondaryDiagnosa(reportDetail)" :key="idx" class="small text-muted mb-1">
                        • {{ diag.kd_penyakit }} - {{ diag.penyakit?.nm_penyakit }}
                      </div>
                    </div>
                    <div v-else class="text-muted small italic">Tidak ada diagnosa sekunder</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detail Laporan Text Section -->
            <div class="detail-section card border-0 bg-light-blue shadow-sm mb-4">
              <div class="card-body p-4">
                <h6 class="section-title border-bottom pb-3 mb-3">
                  <i class="fas fa-notes-medical me-2"></i>Laporan Tindakan
                </h6>
                <div class="laporan-text" v-if="reportDetail.laporan_operasi || reportDetail.laporan?.laporan_operasi">
                  {{ reportDetail.laporan_operasi || reportDetail.laporan?.laporan_operasi }}
                </div>
                <div v-else class="text-muted italic">Tidak ada catatan laporan tertulis.</div>
              </div>
            </div>

            <!-- Tim Operasi Section -->
            <div class="detail-section">
              <h6 class="section-title mb-3 px-1">
                <i class="fas fa-users-cog me-2"></i>Tim Operasi
              </h6>
              <div class="team-grid">
                <div v-if="reportDetail.detail_operator2?.nm_dokter" class="team-item">
                  <span class="role">Operator 2</span>
                  <span class="name">{{ reportDetail.detail_operator2.nm_dokter }}</span>
                </div>
                <div v-if="reportDetail.detail_asisten_operator1?.nama" class="team-item">
                  <span class="role">Asisten OP 1</span>
                  <span class="name">{{ reportDetail.detail_asisten_operator1.nama }}</span>
                </div>
                <div v-if="reportDetail.detail_asisten_operator2?.nama" class="team-item">
                  <span class="role">Asisten OP 2</span>
                  <span class="name">{{ reportDetail.detail_asisten_operator2.nama }}</span>
                </div>
                <div v-if="reportDetail.detail_dokter_anestesi?.nm_dokter" class="team-item">
                  <span class="role">dr. Anestesi</span>
                  <span class="name">{{ reportDetail.detail_dokter_anestesi.nm_dokter }}</span>
                </div>
                <div v-if="reportDetail.detail_asisten_anestesi?.nama" class="team-item">
                  <span class="role">Ast. Anestesi</span>
                  <span class="name">{{ reportDetail.detail_asisten_anestesi.nama }}</span>
                </div>
                <div v-if="reportDetail.detail_operator3?.nm_dokter" class="team-item">
                  <span class="role">Operator 3</span>
                  <span class="name">{{ reportDetail.detail_operator3.nm_dokter }}</span>
                </div>
                <div v-if="reportDetail.detail_dokter_anak?.nm_dokter" class="team-item">
                  <span class="role">dr. Anak</span>
                  <span class="name">{{ reportDetail.detail_dokter_anak.nm_dokter }}</span>
                </div>
                <div v-if="reportDetail.detail_perawat_resusitas?.nama || reportDetail.detail_perawaat_resusitas?.nama" class="team-item">
                  <span class="role">Pwt. Resusitasi</span>
                  <span class="name">{{ reportDetail.detail_perawat_resusitas?.nama || reportDetail.detail_perawaat_resusitas?.nama }}</span>
                </div>
                <div v-if="reportDetail.detail_bidan?.nama" class="team-item">
                  <span class="role">Bidan</span>
                  <span class="name">{{ reportDetail.detail_bidan.nama }}</span>
                </div>
                <div v-if="reportDetail.detail_onloop?.nama || reportDetail.detail_omloop?.nama" class="team-item">
                  <span class="role">Omloop</span>
                  <span class="name">{{ reportDetail.detail_onloop?.nama || reportDetail.detail_omloop?.nama }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="!reportDetail.laporan_operasi && !reportDetail.laporan?.laporan_operasi" class="alert alert-info mt-4 d-flex align-items-center" role="alert">
              <i class="fas fa-info-circle me-3 fs-4"></i>
              <div>
                Data ini diambil langsung dari tabel Operasi karena belum ada laporan rinci di arsip.
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-5">
            <i class="fas fa-ghost text-muted mb-3 fs-1"></i>
            <p class="text-muted">Gagal memuat detail laporan.</p>
          </div>
        </div>
        
        <div class="modal-footer-premium">
          <button class="btn-primary-premium" @click="selectedReport = null">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import operasiService from '@/services/operasiService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const items = ref([])
const penjabList = ref([])
const dokterList = ref([])
const paketList = ref([])

// Detail Report State
const selectedReport = ref(null)
const reportDetail = ref(null)
const reportLoading = ref(false)

// Refs for date inputs
const startDateInput = ref(null)
const endDateInput = ref(null)

const triggerDatePicker = (type) => {
  if (type === 'start' && startDateInput.value) {
    startDateInput.value.showPicker()
  } else if (type === 'end' && endDateInput.value) {
    endDateInput.value.showPicker()
  }
}

// Mobile & Filter State
const isFilterVisible = ref(false)
const isMobile = ref(false)
const filterMode = ref('paket') // 'paket' or 'jenis'

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isFilterVisible.value = true
  }
}

const filters = reactive({
  start: new Date().toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
  kd_pj: '',
  operator: '',
  kode_paket: '',
  jenis_tindakan: null,
  q: ''
})

const jenisTindakanOptions = [
  'Sectio Caesaria / SC',
  'Curetage',
  'Lainnya'
]

const pagination = ref({
  total: 0,
  current_page: 1,
  from: 0,
  to: 0,
  prev_page_url: null,
  next_page_url: null
})

const loadData = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      ...filters,
      page,
      limit: 15
    }
    const response = await operasiService.getLaporanList(params)
    const { data } = response.data
    items.value = data.data
    pagination.value = {
      total: data.total,
      current_page: data.current_page,
      from: data.from,
      to: data.to,
      prev_page_url: data.prev_page_url,
      next_page_url: data.next_page_url
    }
  } catch (error) {
    console.error('Error load data:', error)
    toast.error('Gagal mengambil data laporan')
  } finally {
    loading.value = false
  }
}

const fetchMasters = async () => {
  try {
    const [resPj, resDr, resPk] = await Promise.all([
      operasiService.getPenjab(),
      operasiService.getDokter(),
      operasiService.getPaket()
    ])
    penjabList.value = resPj.data.data
    dokterList.value = resDr.data.data
    paketList.value = resPk.data.data
  } catch (error) {
    console.error('Error masters:', error)
  }
}

let searchTimeout = null
const onSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadData(1)
    }, 500)
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const getKategoriClass = (kat) => {
  if (!kat) return 'bg-light text-dark'
  if (kat.includes('Khusus')) return 'bg-danger text-white'
  if (kat.includes('Besar')) return 'bg-warning text-dark'
  if (kat.includes('Sedang')) return 'bg-info text-white'
  return 'bg-success text-white'
}

const getKamarInfo = (item) => {
  const ki = item.reg_periksa?.kamar_inap
  if (!ki || ki.length === 0) return { kelas: '-', kamar: '-' }
  
  // 1. Try to find active room
  // 2. If not found, try to find the one that is NOT a transfer (Pindah Kamar)
  // 3. Fallback to the first one (most recent by date)
  const room = ki.find(k => k.stts_pulang === '-') || 
               ki.find(k => k.stts_pulang !== 'Pindah Kamar') || 
               ki[0]
               
  const kelas = room?.kamar?.kelas || '-'
  const namaKamar = room?.kd_kamar ? room.kd_kamar.trim() : '-'
  const bangsal = room?.kamar?.bangsal?.nm_bangsal || '-'
  
  return {
    kelas,
    kamar: `${namaKamar} (${bangsal})`
  }
}

const getPrimaryDiagnosa = (item) => {
  if (!item?.reg_periksa?.diagnosa_pasien) return []
  return item.reg_periksa.diagnosa_pasien.filter(d => d.prioritas == 1)
}

const getSecondaryDiagnosa = (item) => {
  if (!item?.reg_periksa?.diagnosa_pasien) return []
  return item.reg_periksa.diagnosa_pasien.filter(d => d.prioritas != 1)
}

const showDetail = async (item) => {
  selectedReport.value = item
  reportLoading.value = true
  reportDetail.value = null
  
  try {
    const params = {
      no_rawat: item.no_rawat,
      kode_paket: item.kode_paket,
      tgl_operasi: item.tgl_operasi
    }
    const response = await operasiService.getLaporan(params)
    reportDetail.value = response.data.data
  } catch (error) {
    console.error('Error detail:', error)
    toast.error('Gagal mengambil detail laporan')
  } finally {
    reportLoading.value = false
  }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Set start to beginning of month
  const d = new Date()
  d.setDate(1)
  filters.start = d.toISOString().split('T')[0]
  
  fetchMasters()
  loadData()
})
</script>

<style scoped>
.operasi-report-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.w-fit {
  width: fit-content;
}

.btn-toggle-filter {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-filter:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Collapse Transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease-out;
  max-height: 600px;
  opacity: 1;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.page-header {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 2rem 2.5rem 3.5rem 2.5rem;
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: visible !important;
  z-index: 100 !important; /* Higher than content-card */
}

.page-title {
  color: white !important;
  font-weight: 800;
  letter-spacing: -0.5px;
  font-size: 1.75rem;
}

.page-subtitle {
  opacity: 0.9;
  font-size: 0.95rem;
}

.header-content {
  position: relative;
  overflow: visible !important;
}

.header-actions {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  margin-top: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: visible !important;
  position: relative;
  z-index: 101 !important;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: flex-end;
  overflow: visible;
}

.filter-group-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 0 0 auto;
}

.mode-toggle-group {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 44px;
}

.mode-btn {
  border: none;
  background: transparent;
  color: white;
  padding: 0 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
}

.mode-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  flex: 1 1 200px;
  min-width: 0;
}

.wider-filter {
  flex: 2 1 380px;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
}

.date-input-group {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  height: 44px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  cursor: pointer;
  width: 100%;
}

.date-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-input-group .form-input {
  flex: 1; /* Ensure inputs share space equally */
  min-width: 100px; /* Prevent text truncation */
  border: none;
  font-size: 0.85rem;
  padding: 0;
  outline: none;
  color: #1e293b;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
  width: 100%;
}

/* Hide native date icons */
.form-input::-webkit-calendar-picker-indicator,
.form-input::-webkit-inner-spin-button,
.form-input::-webkit-clear-button {
  display: none;
  -webkit-appearance: none;
}

.date-separator {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.btn-refresh-premium {
  background: white;
  color: #3b82f6;
  border: none;
  padding: 0 1.5rem;
  height: 44px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  white-space: nowrap;
  width: auto; /* Default to auto for desktop */
}

.btn-refresh-premium:hover:not(:disabled) {
  transform: translateY(-3px);
  background: #f8fafc;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.btn-refresh-premium:active {
  transform: translateY(-1px);
}

.content-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.04);
  overflow: hidden;
  margin-top: -1rem;
  position: relative;
  z-index: 10;
}

.card-header-modern {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header-modern h5 {
  font-weight: 800;
  color: #1e293b;
}

.search-box .form-control {
  border-radius: 10px;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.search-box .form-control:focus {
  background-color: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table th {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  padding: 1.25rem 1rem;
  background-color: #f8fafc;
}

.table td {
  padding: 1.25rem 1rem;
  font-size: 0.9rem;
  color: #334155;
}

.bg-soft-info {
  background-color: #f0f9ff;
}

.text-info {
  color: #0369a1;
}

/* Custom V-Select Styles */
.custom-v-select {
  width: 100%;
}

.custom-v-select :deep(.vs__dropdown-toggle) {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  min-height: 44px;
  padding: 0 8px;
  transition: all 0.2s;
  overflow: hidden;
  width: 100%;
}

.custom-v-select :deep(.vs--open .vs__dropdown-toggle) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-v-select :deep(.vs__selected) {
  font-size: 0.85rem;
  color: #1e293b !important; /* Force dark text */
  font-weight: 500;
}

/* Ensure placeholder is visible and has correct color */
.custom-v-select :deep(.vs__search::placeholder),
.custom-v-select :deep(.vs__search) {
  font-size: 0.85rem;
  color: #64748b !important;
}

.custom-v-select :deep(.vs__dropdown-menu) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 8px;
  margin-top: 8px;
  z-index: 1060 !important;
  background: white;
}

.custom-v-select :deep(.vs__dropdown-option) {
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  margin-bottom: 2px;
  color: #334155 !important; /* Force dark text for options */
}

.custom-v-select :deep(.vs__dropdown-option--highlight) {
  background: #3b82f6;
  color: white !important;
}

.custom-v-select :deep(.vs__actions) {
  padding: 2px 6px 0 3px;
}

/* Modern Pagination Styles */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-top: 1px solid #f1f5f9;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
}

.info-label {
  font-weight: 500;
}

.info-value {
  font-weight: 700;
  color: #1e293b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 6px;
}

.info-value.total {
  background: #e0f2fe;
  color: #0369a1;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.control-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f8fafc;
}

.current-page-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  padding: 6px 16px;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.current-page-pill .label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.current-page-pill .number {
  font-size: 0.95rem;
  font-weight: 800;
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 1rem 3.5rem 1rem;
    border-radius: 0 0 30px 30px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }

  .page-subtitle {
    padding-right: 3rem;
    font-size: 0.8rem;
    line-height: 1.4;
  }
  
  .filter-grid {
    grid-template-columns: 100%;
    gap: 1rem;
    width: 100%;
  }
  
  .header-actions {
    padding: 1rem;
    margin-top: 1.25rem;
    border-radius: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .filter-group-toggle {
    width: 100%;
  }

  .mode-toggle-group {
    width: 100%;
  }

  .mode-btn {
    flex: 1;
  }

  .filter-group {
    flex: 1 1 100%;
    width: 100%;
  }

  .wider-filter {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .date-input-group {
    width: 100%;
    box-sizing: border-box;
    flex-direction: column;
    height: auto;
  }

  .date-input-group > div {
    width: 100%;
    height: 44px !important;
    border: none !important;
    padding: 0 1rem !important;
  }

  .date-input-group > div:first-child {
    border-bottom: 1px solid #f1f5f9 !important;
  }

  .date-separator {
    display: none;
  }

  .content-card {
    margin-top: 0;
    border-radius: 20px;
    margin-left: 0;
    margin-right: 0;
  }
  
  .custom-v-select :deep(.vs__selected) {
    max-width: 100%;
  }

  .btn-refresh-premium {
    width: 100%; /* Full width on mobile */
    margin-top: 0.5rem;
    box-sizing: border-box;
  }

  .pagination-footer {
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem 1rem !important;
  }

  .pagination-controls {
    width: 100%;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .current-page-pill {
    padding: 6px 12px;
  }

  .modal-dialog-premium {
    width: 95%;
    max-height: 90vh;
  }

  .info-grid {
    grid-template-columns: 100%;
  }
}

/* Action Styles */
.btn-action-detail {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  margin: 0 auto;
}

.btn-action-detail:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

/* Modal Premium Styles */
.modal-backdrop-premium {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-dialog-premium {
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header-premium {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header-premium .header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.modal-header-premium .title-icon {
  font-size: 1.75rem;
  color: #3b82f6;
  background: #eff6ff;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.modal-header-premium .modal-title {
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  font-size: 1.25rem;
}

.modal-header-premium .modal-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.btn-close-premium {
  background: #f8fafc;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-premium:hover {
  background: #fee2e2;
  color: #ef4444;
}

.modal-body-premium {
  padding: 2rem;
  overflow-y: auto;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.info-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 16px;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid #f1f5f9;
}

.info-card .icon {
  color: #3b82f6;
  font-size: 1.1rem;
  margin-top: 0.25rem;
}

.info-card .text label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 2px;
}

.info-card .text span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
}

.bg-light-blue {
  background-color: #f0f9ff !important;
}

.section-title {
  color: #0369a1;
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.laporan-text {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #334155;
  font-size: 0.95rem;
}

.italic {
  font-style: italic;
}

/* Team Grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.team-item {
  display: flex;
  flex-direction: column;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.team-item .role {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.5px;
}

.team-item .name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 2px;
}

.modal-footer-premium {
  padding: 1.25rem 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.btn-primary-premium {
  padding: 0.75rem 2.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-primary-premium:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}
</style>
