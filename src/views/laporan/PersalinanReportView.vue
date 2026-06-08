<template>
  <div class="persalinan-report-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 w-100">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-baby-carriage"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Laporan Persalinan</h3>
            <p class="page-subtitle mb-0 small">Rangkuman data persalinan baik melalui tindakan operasi (SC) maupun persalinan normal (Partus)</p>
          </div>
        </div>
        
        <div class="header-tabs-premium">
          <button 
            @click="currentTab = 'operasi'" 
            :class="['tab-btn', { active: currentTab === 'operasi' }]"
          >
            <i class="fas fa-scissors me-2"></i> Tindakan Operasi
          </button>
          <button 
            @click="currentTab = 'partus'" 
            :class="['tab-btn', { active: currentTab === 'partus' }]"
          >
            <i class="fas fa-baby me-2"></i> Tindakan Partus (Normal)
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div v-show="isFilterVisible || !isMobile" class="filters-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <!-- Date Range Filter -->
          <div class="col-lg-4 col-md-6">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label class="filter-label mb-0"><i class="fas fa-calendar-alt me-1 text-primary"></i> Filter Waktu</label>
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
            <div v-if="filters.filterMode === 'daily'" class="d-flex align-items-center gap-2">
              <input type="date" v-model="filters.start" class="form-control form-control-sm filter-date" @change="loadData(1)">
              <span class="text-muted small fw-bold">s/d</span>
              <input type="date" v-model="filters.end" class="form-control form-control-sm filter-date" @change="loadData(1)">
            </div>

            <!-- Annual Mode Input -->
            <div v-else>
              <select v-model="filters.year" class="form-select form-select-sm modern-select" @change="loadData(1)">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>

          <!-- Payment Filter -->
          <div class="col-lg-2 col-md-6">
            <label class="filter-label"><i class="fas fa-credit-card me-1 text-primary"></i> Cara Bayar</label>
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
          <div class="col-lg-2 col-md-6">
            <label class="filter-label"><i class="fas fa-user-md me-1 text-primary"></i> Dokter/Operator</label>
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
          <div v-if="currentTab === 'operasi'" class="col-lg-2 col-md-6">
            <label class="filter-label"><i class="fas fa-briefcase-medical me-1 text-primary"></i> Jenis Tindakan</label>
            <v-select 
              v-model="filters.jenis_tindakan" 
              :options="['SC (Sectio Caesarea)', 'Curetage (Kuret)', 'Lainnya']" 
              placeholder="Semua Tindakan"
              class="custom-v-select"
              @update:modelValue="loadData(1)"
            />
          </div>

          <!-- Action Buttons -->
          <div class="col-lg-2 col-md-6 d-grid gap-2" :class="{'offset-lg-2': currentTab !== 'operasi'}">
            <button @click="loadData(1)" :disabled="loading" class="btn btn-primary btn-sm rounded-3 fw-bold btn-refresh-custom">
              <i :class="['fas fa-sync-alt me-2', { 'fa-spin': loading }]"></i>
              Refresh Data
            </button>
            <button @click="exportToExcel" :disabled="loading || items.length === 0" class="btn btn-success btn-sm rounded-3 fw-bold btn-export-excel-custom">
              <i class="fas fa-file-excel me-2"></i>
              Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="content-card card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
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
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-icon-bg {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  font-size: 1.5rem;
}

.header-tabs-premium {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.tab-btn {
  padding: 8px 18px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn:hover:not(.active) {
  color: #0f172a;
  background: #e2e8f0;
}

.tab-btn.active {
  background: white;
  color: #3b82f6 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Filters Styling */
.filters-card {
  background: #ffffff;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02) !important;
}

.filter-label {
  display: block;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.filter-date, .modern-select {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  color: #334155;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  height: 38px;
}

.filter-date {
  flex: 1;
  min-width: 0;
}

.filter-date:focus, .modern-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

.btn-refresh-custom {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
  height: 38px;
  font-weight: 600;
  border-radius: 10px !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-refresh-custom:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.btn-export-excel-custom {
  background-color: #107c10;
  border-color: #107c10;
  color: #ffffff;
  height: 38px;
  font-weight: 600;
  border-radius: 10px !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-export-excel-custom:hover:not(:disabled) {
  background-color: #0e6c0e;
  border-color: #0e6c0e;
  transform: translateY(-1px);
}

.content-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.card-header-modern {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}

.card-header-modern h5 {
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.search-box input {
  min-width: 220px;
  border-radius: 8px;
  padding: 0.4rem 0.85rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 65px;
  border: 1px solid #e2e8f0;
  padding: 0;
  transition: transform 0.2s;
}

.date-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.date-badge .month {
  background: #3b82f6;
  color: white;
  width: 100%;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 0;
  letter-spacing: 0.05em;
  line-height: normal;
}

.date-badge .day {
  background: white;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 800;
  padding: 4px 0;
  line-height: 1;
}

.date-badge.partus .month {
  background: #10b981;
}

.patient-info .rm {
  display: inline-block;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 2px;
}

.patient-info .name {
  display: block;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
}

.patient-info .rawat {
  font-size: 0.75rem;
  color: #64748b;
  display: block;
}

.badge-bayar {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  border: 1px solid #e2e8f0;
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
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #3b82f6;
  transition: all 0.2s;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
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
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header-premium {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body-premium {
  padding: 1.5rem;
  overflow-y: auto;
  background: white;
}

.section-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 20px;
  height: 100%;
  border: 1px solid #e2e8f0;
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
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
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
  border: 1px solid #e2e8f0;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-close-modal-premium:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-close-modal-premium i {
  font-size: 1.1rem;
  color: #64748b;
}

/* Title Styles */
.title-icon-wrapper {
  width: 44px;
  height: 44px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 1.25rem;
}

.modal-title-modern {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 800;
  color: #64748b;
  margin: 0;
}

.modal-title-procedure {
  font-size: 1.25rem;
  font-weight: 800;
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
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-premium-scoped:hover {
  background: #fee2e2;
  color: #ef4444;
  transform: rotate(90deg);
}

/* Patient Detail Card Styles */
.patient-detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02);
}

.avatar-circle {
  width: 52px;
  height: 52px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.25rem;
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
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
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
  color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Premium Table Refinements */
.table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.table tbody tr {
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.table tbody tr:hover {
  background-color: #f8fafc !important;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.patient-info .name {
  font-size: 0.9rem;
  color: #1e293b;
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
  color: #3b82f6;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 2px 10px;
  border-radius: 8px;
  min-width: 35px;
  text-align: center;
}

.info-value.total {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
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
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  padding: 8px 18px;
  border-radius: 100px;
  box-shadow: none;
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

.section-card-modern {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
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

/* custom v-select premium styling */
.custom-v-select :deep(.vs__dropdown-toggle) {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-height: 38px;
  padding: 0;
  transition: all 0.2s;
}

.custom-v-select :deep(.vs--open .vs__dropdown-toggle) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.custom-v-select :deep(.vs__selected),
.custom-v-select :deep(.vs__search),
.custom-v-select :deep(.vs__search::placeholder) {
  font-size: 0.85rem;
  color: #334155 !important;
  font-weight: 600;
  opacity: 1 !important;
}

.custom-v-select :deep(.vs__dropdown-menu) {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 6px;
  margin-top: 6px;
  z-index: 1060;
  background: white !important;
}

.custom-v-select :deep(.vs__dropdown-option) {
  border-radius: 8px;
  padding: 8px 12px;
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
  .btn-refresh-custom, .btn-export-excel-custom {
    width: 100%;
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

  /* Mobile Modal Adjustments */
  .modal-backdrop-premium {
    padding: 0.5rem;
    align-items: flex-end;
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
