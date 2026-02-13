<template>
  <div class="persalinan-report-container">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Laporan Persalinan</h1>
          <p class="page-subtitle">Rangkuman data persalinan baik melalui tindakan operasi (SC) maupun persalinan normal (Partus).</p>
        </div>
        
        <div class="header-tabs-premium">
          <button 
            @click="currentTab = 'operasi'" 
            :class="['tab-btn', { active: currentTab === 'operasi' }]"
          >
            <i class="fas fa-scissors mr-2"></i> Tindakan Operasi
          </button>
          <button 
            @click="currentTab = 'partus'" 
            :class="['tab-btn', { active: currentTab === 'partus' }]"
          >
            <i class="fas fa-baby mr-2"></i> Tindakan Partus (Normal)
          </button>
        </div>
      </div>

      <div v-show="isFilterVisible || !isMobile" class="header-actions">
        <div class="filter-grid">
          <!-- Date Range Filter -->
          <!-- Mode & Date/Year Filter -->
          <div class="filter-group date-range">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="filter-label mb-0">Filter Waktu</label>
              <div class="mode-toggle">
                <button 
                  @click="filters.filterMode = 'daily'; loadData(1)" 
                  :class="['mode-btn', { active: filters.filterMode === 'daily' }]"
                >Harian</button>
                <button 
                  @click="filters.filterMode = 'annual'; loadData(1)" 
                  :class="['mode-btn', { active: filters.filterMode === 'annual' }]"
                >Tahunan</button>
              </div>
            </div>

            <!-- Daily Mode Inputs -->
            <div v-if="filters.filterMode === 'daily'" class="date-input-group">
              <div class="input-with-icon">
                <i class="fas fa-calendar-alt"></i>
                <input type="date" v-model="filters.start" class="form-input" @change="loadData(1)">
              </div>
              <div class="date-separator">SAMPAI</div>
              <div class="input-with-icon">
                <i class="fas fa-calendar-alt"></i>
                <input type="date" v-model="filters.end" class="form-input" @change="loadData(1)">
              </div>
            </div>

            <!-- Annual Mode Input -->
            <div v-else class="annual-input-group">
              <div class="input-with-icon full-width">
                <i class="fas fa-calendar-check"></i>
                <select v-model="filters.year" class="form-input" @change="loadData(1)">
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Payment Filter -->
          <div class="filter-group">
            <label class="filter-label">Cara Bayar</label>
            <v-select 
              v-model="filters.kd_pj" 
              :options="masters.penjab" 
              :reduce="option => option.kd_pj"
              label="png_jawab"
              placeholder="Semua Cara Bayar"
              class="custom-v-select"
              @update:modelValue="loadData(1)"
            />
          </div>

          <!-- Operator Filter -->
          <div class="filter-group">
            <label class="filter-label">Dokter/Operator</label>
            <v-select 
              v-model="filters.operator" 
              :options="masters.dokter" 
              :reduce="option => option.kd_dokter"
              label="nm_dokter"
              placeholder="Semua Dokter"
              class="custom-v-select"
              @update:modelValue="loadData(1)"
            />
          </div>

          <!-- Type Filter (Only for Operasi tab) -->
          <div v-if="currentTab === 'operasi'" class="filter-group">
            <label class="filter-label">Jenis Tindakan</label>
            <v-select 
              v-model="filters.jenis_tindakan" 
              :options="['SC (Sectio Caesarea)', 'Curetage (Kuret)', 'Lainnya']" 
              placeholder="Semua Tindakan"
              class="custom-v-select"
              @update:modelValue="loadData(1)"
            />
          </div>

          <!-- Refresh Button -->
          <div class="filter-group-toggle">
            <button @click="loadData(1)" :disabled="loading" class="btn-refresh-premium mb-2">
              <i :class="['fas fa-sync-alt', { 'fa-spin': loading }]"></i>
              <span>REFRESH DATA</span>
            </button>
            <button @click="exportToExcel" :disabled="loading || items.length === 0" class="btn-export-excel-premium">
              <i class="fas fa-file-excel"></i>
              <span>EXPORT EXCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="content-card">
      <div class="card-header-modern">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h5>{{ currentTab === 'operasi' ? 'Daftar Tindakan Operasi' : 'Daftar Tindakan Partus (Normal)' }}</h5>
          <div class="search-box">
            <input 
              type="text" 
              v-model="filters.q" 
              placeholder="Cari No. Rawat/RM/Pasien..." 
              @input="onSearch" 
              class="form-control form-control-sm"
            >
          </div>
        </div>
      </div>

      <div class="card-body-modern p-0 overflow-auto">
        <!-- Operasi Table -->
        <table v-if="currentTab === 'operasi'" class="table table-hover mb-0 align-middle table-responsive-custom">
          <thead>
            <tr>
              <th width="50" class="text-center">#</th>
              <th>Tgl. Operasi</th>
              <th>Identitas Pasien</th>
              <th>Cara Bayar</th>
              <th>Nama Perawatan</th>
              <th>Operator</th>
              <th width="80" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="n in 5">
              <td colspan="7"><div class="skeleton-line"></div></td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="7" class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-muted mb-3 d-block"></i>
                Tidak ada data ditemukan
              </td>
            </tr>
            <tr v-for="(item, index) in items" :key="index">
              <td class="text-center">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              <td>
                <div class="date-badge">
                  <span class="day">{{ formatDate(item.tgl_operasi, 'DD') }}</span>
                  <span class="month">{{ formatDate(item.tgl_operasi, 'MMM YYYY') }}</span>
                </div>
              </td>
              <td>
                <div class="patient-info">
                  <span class="rm">{{ item.reg_periksa?.pasien?.no_rkm_medis }}</span>
                  <span class="name">{{ item.reg_periksa?.pasien?.nm_pasien }}</span>
                  <span class="rawat">{{ item.no_rawat }}</span>
                </div>
              </td>
              <td>
                <span class="badge-bayar">{{ item.reg_periksa?.cara_bayar?.png_jawab }}</span>
              </td>
              <td>
                <div class="nm-perawatan">{{ item.detail_paket?.nm_perawatan || '-' }}</div>
              </td>
              <td>
                <div class="doctor-badge">
                  <i class="fas fa-user-md me-2"></i>
                  {{ item.detail_operator1?.nm_dokter || '-' }}
                </div>
              </td>
              <td>
                <button @click="showDetail(item)" class="btn-action-detail">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Partus Table -->
        <table v-else class="table table-hover mb-0 align-middle table-responsive-custom">
          <thead>
            <tr>
              <th width="50" class="text-center">#</th>
              <th>Tgl. Tindakan</th>
              <th>Identitas Pasien</th>
              <th>Cara Bayar</th>
              <th>Nama Perawatan</th>
              <th>Dokter</th>
              <th>Bidan / Paramedis</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="n in 5">
              <td colspan="7"><div class="skeleton-line"></div></td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="7" class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-muted mb-3 d-block"></i>
                Tidak ada data ditemukan
              </td>
            </tr>
            <tr v-for="(item, index) in items" :key="index">
              <td class="text-center">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
              <td>
                <div class="date-badge partus">
                  <span class="day">{{ formatDate(item.tgl_perawatan, 'DD') }}</span>
                  <span class="month">{{ formatDate(item.tgl_perawatan, 'MMM YYYY') }}</span>
                </div>
              </td>
              <td>
                <div class="patient-info">
                  <span class="rm">{{ item.reg_periksa?.pasien?.no_rkm_medis }}</span>
                  <span class="name">{{ item.reg_periksa?.pasien?.nm_pasien }}</span>
                  <span class="rawat">{{ item.no_rawat }}</span>
                </div>
              </td>
              <td>
                <span class="badge-bayar">{{ item.reg_periksa?.cara_bayar?.png_jawab }}</span>
              </td>
              <td>
                <div class="nm-perawatan">{{ item.jenis_perawatan?.nm_perawatan || '-' }}</div>
              </td>
              <td>
                <div class="doctor-badge">
                  <i class="fas fa-user-md me-2"></i>
                  {{ item.dokter?.nm_dokter || '-' }}
                </div>
              </td>
              <td>
                <div class="medic-badge">
                  <i class="fas fa-user-nurse me-2"></i>
                  {{ item.petugas?.nama || '-' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-footer p-4">
        <div class="pagination-info">
          <span class="info-label">Menampilkan</span>
          <span class="info-value">{{ items.length }}</span>
          <span class="info-label">dari</span>
          <span class="info-value total">{{ pagination.total }}</span>
          <span class="info-label">tindakan</span>
        </div>

        <div class="pagination-controls">
          <button 
            @click="loadData(pagination.current_page - 1)" 
            :disabled="pagination.current_page === 1 || loading" 
            class="control-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="current-page-pill">
            <span class="label">Halaman</span>
            <span class="number">{{ pagination.current_page }}</span>
          </div>

          <button 
            @click="loadData(pagination.current_page + 1)" 
            :disabled="pagination.current_page === pagination.last_page || loading" 
            class="control-btn"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal (Enhanced) -->
    <transition name="fade">
      <div v-if="selectedReport" class="modal-backdrop-premium" @click.self="selectedReport = null">
        <div class="modal-dialog-premium shadow-lg">
          <div class="modal-header-premium">
            <div class="header-left d-flex align-items-center gap-3">
              <div class="title-icon-wrapper">
                <i class="fas fa-notes-medical"></i>
              </div>
              <div class="title-text-group">
                <h5 class="modal-title-modern">Laporan Operasi</h5>
                <p class="modal-title-procedure">{{ selectedReport.detail_paket?.nm_perawatan || '-' }}</p>
                <div class="modal-subtitle-pills">
                  <span class="pill-no-rawat"><i class="fas fa-id-card me-1"></i> {{ selectedReport.no_rawat }}</span>
                  <span class="pill-patient-name"><i class="fas fa-user-circle me-1"></i> {{ selectedReport.reg_periksa?.pasien?.nm_pasien }}</span>
                </div>
              </div>
            </div>
            <button @click="selectedReport = null" class="btn-close-premium-scoped" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body-premium p-4">
             <div class="info-grid-premium mb-4">
              <div class="info-card-modern">
                <div class="icon-box"><i class="fas fa-calendar-day mt-1"></i></div>
                <div class="content">
                  <label>Tanggal Operasi</label>
                  <span>{{ formatDate(selectedReport.tgl_operasi, 'DD MMMM YYYY') }}</span>
                </div>
              </div>
              <div class="info-card-modern">
                <div class="icon-box"><i class="fas fa-clock mt-1"></i></div>
                <div class="content">
                  <label>Mulai - Selesai</label>
                  <span>{{ formatDate(selectedReport.tgl_operasi, 'HH:mm') }} - {{ formatDate(selectedReport.tgl_selesai, 'HH:mm') }}</span>
                </div>
              </div>
               <div class="info-card-modern">
                <div class="icon-box"><i class="fas fa-syringe mt-1"></i></div>
                <div class="content">
                  <label>Jenis Anestesi</label>
                  <span>{{ selectedReport.jenis_anestesi || '-' }}</span>
                </div>
              </div>
              <div class="info-card-modern">
                <div class="icon-box"><i class="fas fa-tag mt-1"></i></div>
                <div class="content">
                  <label>Kategori</label>
                  <span class="badge-kategori">{{ selectedReport.kategori || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Patient Info Card (New) -->
            <div class="patient-detail-card mb-4">
              <div class="d-flex align-items-center gap-3">
                <div class="avatar-circle">
                  <i class="fas fa-user"></i>
                </div>
                <div class="patient-meta">
                  <div class="rm-badge">{{ selectedReport.reg_periksa?.pasien?.no_rkm_medis }}</div>
                  <h4 class="patient-name-large">{{ selectedReport.reg_periksa?.pasien?.nm_pasien }}</h4>
                  <div class="other-info">
                    <span><i class="fas fa-venus-mars me-1"></i> {{ selectedReport.reg_periksa?.pasien?.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                    <span class="mx-2">|</span>
                    <span><i class="fas fa-birthday-cake me-1"></i> {{ formatDate(selectedReport.reg_periksa?.pasien?.tgl_lahir, 'DD MMMM YYYY') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="row g-4">
              <div class="col-md-6">
                <div class="section-card-modern">
                  <div class="section-header">
                    <i class="fas fa-diagnoses"></i>
                    <h6>Diagnosa</h6>
                  </div>
                  <div class="diagnosa-content">
                    <div class="diagnosa-item mb-3">
                      <label>Diagnosa Pre-Op</label>
                      <p>{{ selectedReport.diagnosa_preop || '-' }}</p>
                    </div>
                    <div class="diagnosa-item">
                      <label>Diagnosa Post-Op</label>
                      <p>{{ selectedReport.diagnosa_postop || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="section-card-modern">
                  <div class="section-header">
                    <i class="fas fa-users-cog"></i>
                    <h6>Tim Operasi</h6>
                  </div>
                  <div class="team-list">
                    <div class="team-row">
                      <span class="role">Operator 1</span>
                      <span class="name">{{ selectedReport.detail_operator1?.nm_dokter || '-' }}</span>
                    </div>
                    <div class="team-row">
                      <span class="role">Asisten 1</span>
                      <span class="name">{{ selectedReport.detail_asisten_operator1?.nama || '-' }}</span>
                    </div>
                    <div class="team-row">
                      <span class="role">Asisten 2</span>
                      <span class="name">{{ selectedReport.detail_asisten_operator2?.nama || '-' }}</span>
                    </div>
                    <div class="team-row">
                      <span class="role">Dokter Anak</span>
                      <div class="d-flex align-items-center gap-2">
                        <span v-if="selectedReport.dr_anak_hadir" 
                          :class="['badge-attendance', isHadir(selectedReport.dr_anak_hadir) ? 'badge-hadir-anak' : 'badge-tidak-hadir']">
                          {{ selectedReport.dr_anak_hadir }}
                        </span>
                        <span class="name">{{ selectedReport.detail_dokter_anak?.nm_dokter || '-' }}</span>
                      </div>
                    </div>
                    <div class="team-row">
                      <span class="role">Dokter Anestesi</span>
                      <div class="d-flex align-items-center gap-2">
                        <span v-if="selectedReport.dr_anestesi_hadir" 
                          :class="['badge-attendance', isHadir(selectedReport.dr_anestesi_hadir) ? 'badge-hadir-anestesi' : 'badge-tidak-hadir']">
                          {{ selectedReport.dr_anestesi_hadir }}
                        </span>
                        <span class="name">{{ selectedReport.detail_dokter_anestesi?.nm_dokter || '-' }}</span>
                      </div>
                    </div>
                    <div class="team-row">
                      <span class="role">Asisten Anestesi</span>
                      <span class="name">{{ selectedReport.detail_asisten_anestesi?.nama || '-' }}</span>
                    </div>
                    <div class="team-row">
                      <span class="role">Bidan / Petugas</span>
                      <span class="name">{{ selectedReport.detail_bidan?.nama || '-' }}</span>
                    </div>
                    <div class="team-row">
                      <span class="role">Onloop / Omloop</span>
                      <span class="name">{{ selectedReport.detail_onloop?.nama || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 mt-4">
                <div class="report-box-premium">
                  <div class="section-header mb-3">
                    <i class="fas fa-notes-medical"></i>
                    <h6>Ringkasan Laporan Operasi</h6>
                  </div>
                  <div class="report-content" v-html="selectedReport.laporan_operasi ? selectedReport.laporan_operasi.replace(/\n/g, '<br>') : 'Tidak ada laporan tertulis.'"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer-premium justify-content-center border-0 pb-4">
            <button @click="selectedReport = null" class="btn-close-modal-premium px-5 py-3 shadow-sm">
              <i class="fas fa-times-circle me-2"></i>
              TUTUP DETAIL
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import vSelect from 'vue-select'
import persalinanService from '@/services/persalinanService'
import dayjs from 'dayjs'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'

const toast = useToast()
const loading = ref(false)
const isMobile = ref(window.innerWidth <= 768)
const isFilterVisible = ref(true)
const currentTab = ref('operasi')
const items = ref([])
const selectedReport = ref(null)

const isHadir = (val) => {
  if (!val) return false
  const str = val.toLowerCase()
  return str === 'hadir' || str === 'ya'
}

const filters = reactive({
  start: dayjs().startOf('month').format('YYYY-MM-DD'),
  end: dayjs().format('YYYY-MM-DD'),
  filterMode: 'daily', // daily | annual
  year: dayjs().format('YYYY'),
  kd_pj: '',
  operator: '',
  jenis_tindakan: null,
  q: ''
})

const years = Array.from({ length: 5 }, (_, i) => dayjs().subtract(i, 'year').format('YYYY'))

const pagination = ref({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1
})

const masters = reactive({
  penjab: [],
  dokter: []
})

const loadData = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      ...filters,
      page,
      limit: pagination.value.per_page,
      jenis_tindakan: filters.jenis_tindakan
    }

    if (filters.filterMode === 'annual') {
      params.tahun = filters.year
      delete params.start
      delete params.end
    }

    let response
    if (currentTab.value === 'operasi') {
      response = await persalinanService.getOperasiList(params)
    } else {
      response = await persalinanService.getLaporanList(params)
    }

    if (response.data.success) {
      items.value = response.data.data.data
      pagination.value = {
        current_page: response.data.data.current_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
        last_page: response.data.data.last_page
      }
    }
  } catch (error) {
    console.error('Error loadData:', error)
    toast.error('Gagal memuat data laporan')
  } finally {
    loading.value = false
  }
}

const exportToExcel = async () => {
  if (items.value.length === 0) return

  loading.value = true
  const exportParams = {
    ...filters,
    page: 1,
    limit: 10000, // Fetch all data
    jenis_tindakan: filters.jenis_tindakan
  }

  if (filters.filterMode === 'annual') {
    exportParams.tahun = filters.year
    delete exportParams.start
    delete exportParams.end
  }

  try {
    let response
    if (currentTab.value === 'operasi') {
      response = await persalinanService.getOperasiList(exportParams)
    } else {
      response = await persalinanService.getLaporanList(exportParams)
    }

    if (!response.data.success || !response.data.data.data.length) {
       toast.error('Data tidak ditemukan untuk di export')
       return
    }

    const exportItems = response.data.data.data
    const reportTitle = currentTab.value === 'operasi' ? 'Laporan Tindakan Operasi' : 'Laporan Tindakan Partus'
    const wsData = []

    // Add Header Information
    wsData.push([reportTitle.toUpperCase()])
    wsData.push([`Periode: ${filters.filterMode === 'annual' ? filters.year : filters.start + ' s/d ' + filters.end}`])
    wsData.push([])

    if (currentTab.value === 'operasi') {
      // Headers for Operasi
      wsData.push([
        'No',
        'No. Rawat',
        'No. RM',
        'Nama Pasien',
        'Tgl. Operasi',
        'Cara Bayar',
        'Nama Perawatan',
        'Operator 1',
        'Asisten 1',
        'Asisten 2',
        'Dokter Anak',
        'Dokter Anestesi'
      ])

      exportItems.forEach((item, index) => {
        wsData.push([
          index + 1,
          item.no_rawat,
          item.reg_periksa?.pasien?.no_rkm_medis || '-',
          item.reg_periksa?.pasien?.nm_pasien || '-',
          item.tgl_operasi,
          item.reg_periksa?.cara_bayar?.png_jawab || '-',
          item.detail_paket?.nm_perawatan || '-',
          item.detail_operator1?.nm_dokter || '-',
          item.detail_asisten1?.nm_dokter || '-',
          item.detail_asisten2?.nm_dokter || '-',
          item.detail_dokter_anak?.nm_dokter || '-',
          item.detail_dokter_anestesi?.nm_dokter || '-'
        ])
      })
    } else {
      // Headers for Partus
      wsData.push([
        'No',
        'No. Rawat',
        'No. RM',
        'Nama Pasien',
        'Tgl. Tindakan',
        'Cara Bayar',
        'Nama Perawatan',
        'Dokter',
        'Bidan/Paramedis'
      ])

      exportItems.forEach((item, index) => {
        wsData.push([
          index + 1,
          item.no_rawat,
          item.reg_periksa?.pasien?.no_rkm_medis || '-',
          item.reg_periksa?.pasien?.nm_pasien || '-',
          item.tgl_perawatan,
          item.reg_periksa?.cara_bayar?.png_jawab || '-',
          item.jenis_perawatan?.nm_perawatan || '-',
          item.dokter?.nm_dokter || '-',
          item.petugas?.nama || '-'
        ])
      })
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Laporan")

    const fileName = `${reportTitle}_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    toast.success('Laporan berhasil diexport ke Excel')
    
  } catch (error) {
    console.error('Export Error:', error)
    toast.error('Gagal men-export data')
  } finally {
    loading.value = false
  }
}

const fetchMasters = async () => {
  try {
    const [pjRes, drRes] = await Promise.all([
      persalinanService.getPenjab(),
      persalinanService.getDokter()
    ])
    masters.penjab = pjRes.data.data || []
    masters.dokter = drRes.data.data || []
  } catch (error) {
    console.error('Error fetchMasters:', error)
  }
}

const showDetail = async (item) => {
  try {
    const response = await persalinanService.getOperasiDetail({
      no_rawat: item.no_rawat,
      kode_paket: item.kode_paket,
      tgl_operasi: item.tgl_operasi
    })
    if (response.data.success) {
      selectedReport.value = response.data.data
    }
  } catch (error) {
    toast.error('Gagal memuat detail laporan')
  }
}

let searchTimer = null
const onSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadData(1)
  }, 500)
}

const formatDate = (date, format) => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

watch(currentTab, () => {
  loadData(1)
})

onMounted(() => {
  loadData()
  fetchMasters()
  
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
})
</script>

<style scoped>
.persalinan-report-container {
  padding: 0;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #334155 100%); /* Navy to Deep Slate */
  padding: 2.5rem 2rem 5rem 2rem;
  color: white;
  border-radius: 0 0 40px 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
  max-width: 600px;
  margin: 0;
}

.header-tabs-premium {
  display: flex;
  background: rgba(0, 0, 0, 0.2); /* Darker for high contrast against blue */
  padding: 5px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
}

.tab-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7); /* Clearer inactive text */
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover:not(.active) {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: white;
  color: #1e40af !important; /* Bold blue for active tab */
  box-shadow: 0 4px 15px rgba(0,0,0,0.25);
  transform: translateY(-1px);
}

.header-actions {
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  margin-top: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  border: 1px solid #f1f5f9;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: flex-end;
}

.filter-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.date-input-group {
  display: flex;
  align-items: center;
  background: white; /* Contrast with card background */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 44px;
  overflow: visible;
  transition: all 0.2s;
  min-width: 320px;
}

.input-with-icon {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  flex: 1;
}

.input-with-icon i {
  color: #94a3b8;
  font-size: 0.9rem;
}

.form-input {
  border: none;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  padding: 0 0.5rem;
  width: 100%;
  outline: none;
}

.date-separator {
  font-size: 0.65rem;
  font-weight: 800;
  color: #cbd5e1;
  padding: 0 0.5rem;
}

.btn-refresh-premium {
  background: #3b82f6;
  color: white;
  border: none;
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-refresh-premium:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.btn-export-excel-premium {
  background: #107c10;
  color: white;
  border: none;
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 124, 16, 0.2);
}

.btn-export-excel-premium:hover:not(:disabled) {
  background: #0e6c0e;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 124, 16, 0.3);
}

.btn-export-excel-premium:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.content-card {
  margin: -3rem 2rem 2rem 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 25px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

.card-header-modern {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header-modern h5 {
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.search-box input {
  min-width: 250px;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 65px;
  border: 1px solid #e2e8f0;
  padding: 0;
  transition: transform 0.2s;
}

.date-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.date-badge .month {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  width: 100%;
  text-align: center;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 0;
  letter-spacing: 0.05em;
  line-height: normal;
}

.date-badge .day {
  background: white;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 900;
  padding: 6px 0;
  line-height: 1;
}

.date-badge.partus .month {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.patient-info .rm {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
}

.patient-info .name {
  display: block;
  font-weight: 700;
  color: #1e293b;
}

.patient-info .rawat {
  font-size: 0.75rem;
  color: #64748b;
}

.badge-bayar {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}

.doctor-badge, .medic-badge {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.doctor-badge i { color: #3b82f6; }
.medic-badge i { color: #16a34a; }

.btn-action-detail {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #3b82f6;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-action-detail:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Modal Styles */
.modal-backdrop-premium {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-dialog-premium {
  background: white;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header-premium {
  padding: 2rem;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  background: #fff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
}

.modal-body-premium {
  padding: 2rem;
  overflow-y: auto;
  background: white;
}

.section-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 20px;
  height: 100%;
  border: 1px solid #f1f5f9;
}

@media (max-width: 768px) {
  .page-header { padding: 2rem 1rem 4rem 1rem; }
  .content-card { margin: -2.5rem 1rem 1rem 1rem; }
  .header-tabs-premium { width: 100%; overflow-x: auto; }
}

/* Enhanced Detail Modal Styles */
.modal-subtitle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.modal-subtitle-row .no-rawat {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.modal-subtitle-row .divider {
  color: #cbd5e1;
  font-size: 0.7rem;
}

.modal-subtitle-row .patient-name {
  font-size: 0.85rem;
  color: #1e3a8a;
  font-weight: 800;
  text-transform: uppercase;
}

.info-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.info-card-modern {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.info-card-modern:hover {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}

.info-card-modern .icon-box {
  width: 36px;
  height: 36px;
  background: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.info-card-modern .content {
  display: flex;
  flex-direction: column;
}

.info-card-modern .content label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 2px;
  letter-spacing: 0.025em;
}

.info-card-modern .content span {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.badge-kategori {
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem !important;
}

.section-card-modern {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 22px;
  padding: 1.5rem;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.25rem;
}

.section-header i {
  color: #3b82f6;
  font-size: 1.1rem;
}

.section-header h6 {
  margin: 0;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.025em;
}

.diagnosa-item label {
  font-size: 0.7rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.diagnosa-item p {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.6;
  margin: 0;
}

/* Modern Title Styles */
.title-icon-wrapper {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 8px 16px rgba(30, 64, 175, 0.2);
}

.modal-title-modern {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 800;
  color: #64748b;
  margin: 0;
}

.modal-title-procedure {
  font-size: 1.4rem;
  font-weight: 900;
  color: #0f172a;
  margin: 2px 0 8px 0;
  letter-spacing: -0.02em;
}

.modal-subtitle-pills {
  display: flex;
  gap: 10px;
}

.pill-no-rawat, .pill-patient-name {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}

.pill-no-rawat {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.pill-patient-name {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #dbeafe;
}

.btn-close-premium-scoped {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 38px;
  height: 38px;
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.btn-close-premium-scoped:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

/* Patient Detail Card Styles */
.patient-detail-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.avatar-circle {
  width: 56px;
  height: 56px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.5rem;
}

.patient-meta {
  flex: 1;
}

.rm-badge {
  display: inline-block;
  background: #3b82f6;
  color: white;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: 0.05em;
}

.patient-name-large {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 900;
  color: #1e3a8a;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.other-info {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.other-info i {
  color: #3b82f6;
}

/* Mode Toggle Styles */
.mode-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.mode-btn {
  padding: 4px 12px;
  border-radius: 7px;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: #64748b;
  transition: all 0.2s;
}

.mode-btn.active {
  background: white;
  color: #1e40af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.annual-input-group {
  display: flex;
  width: 100%;
  background: #f8fafc;
  border-radius: 12px;
  min-height: 46px;
  align-items: center;
  padding: 0;
  border: 1px solid transparent; /* Keeps layout consistent without visible border */
  transition: all 0.2s;
}

.annual-input-group:hover {
  background: #f1f5f9;
}

.annual-input-group .form-input {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e3a8a;
  padding: 0 10px 0 35px; /* Space for icon */
  cursor: pointer;
  width: 100%;
}

.annual-input-group .input-with-icon i {
  position: absolute;
  left: 12px;
  color: #3b82f6;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 5;
}

.full-width {
  width: 100% !important;
  position: relative;
  display: flex;
  align-items: center;
}

/* Attendance Badges */
.badge-attendance {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-width: 1px;
  border-style: solid;
}

.badge-hadir-anak {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.badge-hadir-anestesi {
  background: #eff6ff;
  color: #1e40af;
  border-color: #dbeafe;
}

.badge-tidak-hadir {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px dashed #f1f5f9;
}

.team-row:last-child {
  border-bottom: none;
}

.team-row .role {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
}

.team-row .name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e3a8a;
  text-align: right;
}

.report-box-premium {
  background: #f8fafc;
  border: 1px solid #eff6ff;
  border-radius: 24px;
  padding: 2rem;
}

.report-content {
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.8;
  font-weight: 500;
  white-space: pre-wrap;
}

.btn-close-modal-premium {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 12px 28px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.btn-close-modal-premium:hover {
  background: #e2e8f0;
  color: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.btn-close-modal-premium i {
  font-size: 1.1rem;
  color: #64748b;
}

.btn-close-premium {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.btn-close-premium:hover {
  background: #ef4444;
  color: white;
  transform: rotate(90deg);
}

.modal-footer-premium {
  padding: 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
  gap: 1rem;
  background: #fff;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Vibrant Blue Theme Refinements */
.page-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2) !important;
}

.header-tabs-premium {
  display: flex;
  background: rgba(0, 0, 0, 0.2); /* High contrast dark background */
  padding: 5px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
}

.tab-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover:not(.active) {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: white;
  color: #1e40af !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.25);
  transform: translateY(-1px);
}

/* Premium Table Refinements */
.table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1.25rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.table tbody tr {
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.table tbody tr:hover {
  background-color: #f8fafc !important;
  box-shadow: inset 4px 0 0 #3b82f6;
}

.patient-info .name {
  font-size: 0.95rem;
  color: #1e3a8a;
  letter-spacing: -0.01em;
  font-weight: 700;
}

.patient-info .rm {
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 2px;
  font-weight: 800;
  color: #3b82f6;
}

/* Pagination Styles */
.pagination-footer {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  background: white !important;
  border-top: 1px solid #e2e8f0 !important;
  padding: 1.25rem 2rem !important;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: #64748b;
  white-space: nowrap;
}

.info-label {
  font-weight: 600;
}

.info-value {
  font-weight: 800;
  color: #1e3a8a;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 2px 10px;
  border-radius: 8px;
  min-width: 35px;
  text-align: center;
}

.info-value.total {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-controls {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
}

.control-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #3b82f6;
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
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f8fafc;
}

.current-page-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #1e3a8a;
  color: white;
  padding: 8px 18px;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.current-page-pill .label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.current-page-pill .number {
  font-size: 1.1rem;
  font-weight: 900;
}

/* Filter Grid - Fixed Cutoff Issues */
.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem 2rem;
  align-items: flex-end;
}

.filter-group {
  flex: 1 1 200px; /* Grow/shrink base 200px */
}

.filter-group.date-range {
  flex: 0 0 420px; /* Locked width for date group */
}

.filter-group-toggle {
  flex: 0 0 auto; /* Don't shrink the button */
  min-width: 180px; /* Guaranteed width for button */
}

/* Premium Dropdowns & Enhanced Date Group */
.custom-v-select :deep(.vs__dropdown-toggle) {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  min-height: 46px;
  padding: 0 10px;
  transition: all 0.2s;
}

.custom-v-select :deep(.vs--open .vs__dropdown-toggle) {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.custom-v-select :deep(.vs__selected),
.custom-v-select :deep(.vs__search),
.custom-v-select :deep(.vs__search::placeholder) {
  font-size: 0.85rem;
  color: #1e3a8a !important; /* Deep navy */
  font-weight: 700;
  opacity: 1 !important;
}

.date-input-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 46px;
  overflow: hidden;
  transition: all 0.2s;
  width: 100%;
}

.date-input-group:focus-within {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-with-icon {
  display: flex;
  align-items: center;
  padding: 0 12px;
  flex: 1;
}

.input-with-icon i {
  color: #3b82f6;
  font-size: 0.9rem;
  margin-right: 8px;
}

.form-input {
  border: none !important;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e3a8a;
  padding: 0;
  width: 100%;
  outline: none;
  min-width: 110px;
}

.date-separator {
  height: 100%;
  padding: 0 12px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 800;
  color: #3b82f6;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.custom-v-select :deep(.vs__dropdown-menu) {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
  padding: 8px;
  margin-top: 8px;
  z-index: 1060;
  background: white !important;
}

.custom-v-select :deep(.vs__dropdown-option) {
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.85rem;
  color: #475569 !important;
}

.custom-v-select :deep(.vs__dropdown-option--highlight) {
  background: #3b82f6 !important;
  color: white !important;
}

/* Skeleton Loading State */
.skeleton-line {
  height: 20px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 10px;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

@media (max-width: 768px) {
  .filter-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group,
  .filter-group.date-range,
  .filter-group-toggle {
    flex: 1 1 100%;
    width: 100%;
    min-width: 0; /* Prevent flex item overflow */
  }

  /* Reset locked width for date group on mobile */
  .filter-group.date-range {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .date-input-group {
    flex-direction: column;
    height: auto;
    width: 100%;
    min-width: 0; /* Override the desktop min-width of 320px */
  }
  
  .date-input-group > div {
    width: 100%;
    height: 52px; /* Taller inputs */
    border-bottom: 1px solid #f1f5f9;
    border-right: none;
    flex: 1; /* let it grow */
  }

  .date-separator {
    width: 100%;
    justify-content: center;
    border: none;
    height: 22px; /* Even smaller separator */
    min-height: 22px; /* Enforce height */
    border-left: none;
    border-right: none;
    background: #f8fafc;
    font-size: 0.6rem;
    padding: 0;
    margin: 0; /* ensure no margin */
  }

  .pagination-footer {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem 1.5rem !important;
  }

  .pagination-info {
    flex-wrap: wrap;
    justify-content: center;
    white-space: normal;
    text-align: center;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }

  .page-header {
    padding: 1.5rem 1rem 3rem 1rem;
    border-radius: 0 0 30px 30px;
  }

  .header-actions {
    padding: 1rem;
    margin-top: 1.5rem;
  }

  /* Mobile Modal Adjustments */
  .modal-backdrop-premium {
    padding: 0.5rem; /* Reduce backdrop padding */
    align-items: flex-end; /* Bottom sheet align optionally, or center */
  }

  .modal-dialog-premium {
    max-height: 95vh;
    border-radius: 20px;
    width: 100%;
  }

  .modal-header-premium {
    padding: 1.25rem;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }

  .modal-body-premium {
    padding: 1.25rem;
  }

  .info-grid-premium {
    gap: 0.75rem;
    grid-template-columns: 1fr;
  }

  .info-card-modern {
    padding: 0.75rem 1rem;
    border-radius: 14px;
  }
  
  .modal-title-modern {
    font-size: 0.75rem;
  }
  
  .modal-title-procedure {
    font-size: 1.1rem;
  }
  
  .btn-close-premium-scoped {
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
  }
}
</style>
