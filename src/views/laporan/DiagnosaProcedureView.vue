<template>
  <div class="diagnosa-prosedur-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-file-medical-alt"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Laporan Diagnosa & Prosedur</h3>
            <p class="page-subtitle mb-0 small">Analisis statistik ICD-10 (Diagnosa) dan ICD-9 (Prosedur) pasien</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <!-- Date Range -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label"><i class="fas fa-calendar-alt me-1 text-primary"></i> Periode</label>
            <div class="d-flex align-items-center gap-2">
              <input type="date" v-model="filters.tgl_awal" class="form-control form-control-sm filter-date" />
              <span class="text-muted small fw-bold">s/d</span>
              <input type="date" v-model="filters.tgl_akhir" class="form-control form-control-sm filter-date" />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-lg-2 col-md-6">
            <label class="filter-label"><i class="fas fa-hospital me-1 text-primary"></i> Layanan</label>
            <select v-model="filters.status" class="form-select form-select-sm modern-select">
              <option value="all">Semua Layanan</option>
              <option value="Ralan">Rawat Jalan</option>
              <option value="Ranap">Rawat Inap</option>
            </select>
          </div>

          <!-- Doctor Filter -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label"><i class="fas fa-user-md me-1 text-primary"></i> Dokter DPJP</label>
            <select v-model="filters.kd_dokter" class="form-select form-select-sm modern-select">
              <option value="all">Semua Dokter</option>
              <option v-for="d in dokterList" :key="d.kd_dokter" :value="d.kd_dokter">
                {{ d.nm_dokter }}
              </option>
            </select>
          </div>

          <!-- Search Filter -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label"><i class="fas fa-search me-1 text-primary"></i> Cari Diagnosa / Prosedur</label>
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="filters.keyword" 
                class="form-control form-control-sm filter-search ps-5" 
                placeholder="Ketik kode atau nama..."
                @keyup.enter="refreshData"
              />
            </div>
          </div>

          <!-- Action Button -->
          <div class="col-lg-1 col-md-12 d-grid">
            <button @click="refreshData" class="btn btn-primary btn-sm rounded-3 fw-bold btn-refresh-custom" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="stats-card-premium diagnosa">
          <div class="card-icon">
            <i class="fas fa-stethoscope"></i>
          </div>
          <div class="card-details">
            <p class="stats-label">Total Diagnosa (ICD-10)</p>
            <h3 class="stats-value">{{ diagnosaSummary.total }}</h3>
            <div class="stats-footer">
              <span><i class="fas fa-walking me-1"></i> Ralan: {{ diagnosaSummary.ralan }}</span>
              <span class="ms-3"><i class="fas fa-bed me-1"></i> Ranap: {{ diagnosaSummary.ranap }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="stats-card-premium prosedur">
          <div class="card-icon">
            <i class="fas fa-microscope"></i>
          </div>
          <div class="card-details">
            <p class="stats-label">Total Prosedur (ICD-9)</p>
            <h3 class="stats-value">{{ prosedurSummary.total }}</h3>
            <div class="stats-footer">
              <span><i class="fas fa-walking me-1"></i> Ralan: {{ prosedurSummary.ralan }}</span>
              <span class="ms-3"><i class="fas fa-bed me-1"></i> Ranap: {{ prosedurSummary.ranap }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Tabs -->
    <div class="content-wrapper-premium">
      <div class="tabs-header">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'diagnosa' }"
          @click="activeTab = 'diagnosa'"
        >
          <i class="fas fa-notes-medical me-2"></i>
          Diagnosa Pasien (ICD-10)
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'prosedur' }"
          @click="activeTab = 'prosedur'"
        >
          <i class="fas fa-procedures me-2"></i>
          Prosedur Pasien (ICD-9)
        </button>
      </div>

      <div class="tabs-content p-4">
        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3">Memuat data laporan...</p>
        </div>

        <div v-else class="row g-4">
          <!-- Charts Section -->
          <div class="col-lg-6">
            <div class="chart-container-premium">
              <h5 class="chart-title">Visualisasi 10 Besar {{ activeTab === 'diagnosa' ? 'Diagnosa' : 'Prosedur' }}</h5>
              <apexchart 
                type="bar" 
                height="450" 
                :options="chartOptions" 
                :series="chartSeries"
              ></apexchart>
            </div>
          </div>

          <!-- Table Section -->
          <div class="col-lg-6">
            <div class="table-container-premium">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="table-title">Daftar Frekuensi Terbanyak</h5>
                <button @click="exportToExcel" class="btn-export">
                  <i class="fas fa-file-excel me-2"></i> Export
                </button>
              </div>
              <div class="table-responsive">
                <table class="table custom-table-premium">
                  <thead>
                    <tr>
                      <th width="60">No</th>
                      <th width="100">Kode</th>
                      <th>{{ activeTab === 'diagnosa' ? 'Nama Penyakit' : 'Nama Prosedur' }}</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="(item, index) in tableData" 
                      :key="index" 
                      @click="openPatientModal(item)"
                      class="clickable-row"
                      title="Klik untuk detail pasien"
                    >
                      <td><span class="rank-num">{{ index + 1 }}</span></td>
                      <td><span class="badge-kode">{{ item.kd_penyakit || item.kode }}</span></td>
                      <td>
                        <div class="item-name">{{ item.nm_penyakit || item.nm_prosedur }}</div>
                        <div class="item-sub-details">
                          <span class="badge bg-light text-dark">Ralan: {{ item.ralan }}</span>
                          <span class="badge bg-light text-dark ms-1">Ranap: {{ item.ranap }}</span>
                        </div>
                      </td>
                      <td class="text-end fw-bold text-primary">{{ item.total }}</td>
                    </tr>
                    <tr v-if="tableData.length === 0">
                      <td colspan="4" class="text-center py-5 text-muted">Data tidak ditemukan</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Patient Detail Modal -->
    <div class="modal fade" id="patientListModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 24px; overflow: hidden;">
          <!-- Clean White Modal Header -->
          <div class="modal-header d-flex justify-content-between align-items-center p-4 border-bottom">
            <div class="d-flex align-items-center gap-3">
              <div class="header-icon-circle shadow-sm border">
                <i class="fas fa-user-injured text-primary"></i>
              </div>
              <div class="header-text">
                <h5 class="modal-title fw-800 text-dark mb-0">
                  Daftar Pasien
                </h5>
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="badge bg-primary-soft text-primary fw-bold">{{ selectedItem?.kd_penyakit || selectedItem?.kode }}</span>
                  <span class="text-muted small fw-600">{{ selectedItem?.nm_penyakit || selectedItem?.nm_prosedur }}</span>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <div class="patient-count-badge shadow-sm">
                <span class="count-num">{{ filteredPatients.length }}</span>
                <span class="count-label">Pasien</span>
              </div>
              <button type="button" class="btn-close-custom shadow-sm" data-bs-dismiss="modal">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="modal-body p-0">
            <!-- Modal Filters -->
            <div class="modal-filters p-3 bg-light border-bottom">
              <div class="row g-2 align-items-center">
                <div class="col-md-5">
                  <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                      type="text" 
                      v-model="patientSearch" 
                      class="form-control form-control-sm filter-search ps-5" 
                      placeholder="Cari Pasien..."
                    />
                  </div>
                </div>
                <div class="col-md-3">
                  <select v-model="patientStatusFilter" class="form-select form-select-sm modern-select">
                    <option value="all">Semua Layanan</option>
                    <option value="Ralan">Rawat Jalan</option>
                    <option value="Ranap">Rawat Inap</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select v-model="patientPjFilter" class="form-select form-select-sm modern-select">
                    <option value="all">Semua Pembiayaan</option>
                    <option v-for="pj in uniquePj" :key="pj" :value="pj">{{ pj }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div v-if="loadingPatients" class="p-5 text-center">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-3 text-muted">Mengambil data pasien...</p>
            </div>
            <div v-else class="table-responsive" style="max-height: 60vh;">
              <table class="table custom-table-patient mb-0">
                <thead class="sticky-top bg-white shadow-sm">
                  <tr>
                    <th class="ps-4">Registrasi</th>
                    <th>Identitas Pasien</th>
                    <th>Info Rawat</th>
                    <th>Dokter DPJP</th>
                    <th>Detail Fisik</th>
                    <th>Alamat</th>
                    <th class="pe-4">Pembiayaan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in filteredPatients" :key="i">
                    <td class="ps-4 text-nowrap">
                      <div class="fw-bold">{{ p.tgl_registrasi }}</div>
                      <span class="badge" :class="p.jk === 'L' ? 'bg-blue-soft text-blue' : 'bg-pink-soft text-pink'">
                        {{ p.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
                      </span>
                    </td>
                    <td>
                      <div class="fw-bold text-dark">{{ p.nm_pasien }}</div>
                      <div class="small text-muted">No RM: <span class="fw-bold text-primary">{{ p.no_rkm_medis }}</span></div>
                      <div class="small text-muted">NIK: {{ p.no_ktp }}</div>
                    </td>
                    <td>
                      <div class="text-primary fw-bold small mb-1">{{ p.no_rawat }}</div>
                      <div class="small text-muted">Lahir: {{ p.tgl_lahir }}</div>
                    </td>
                    <td>
                      <div class="fw-bold text-dark text-nowrap"><i class="fas fa-user-md text-primary me-1"></i>{{ p.nm_dokter || '-' }}</div>
                      <div class="small text-muted font-mono" v-if="p.kd_dokter">{{ p.kd_dokter }}</div>
                    </td>
                    <td>
                      <div class="fw-bold text-dark">{{ p.umur }}</div>
                    </td>
                    <td>
                      <div class="small-text-truncate" :title="p.alamat">{{ p.alamat }}</div>
                    </td>
                    <td class="pe-4">
                      <span class="badge badge-premium-pj">{{ p.pembiayaan }}</span>
                    </td>
                  </tr>
                  <tr v-if="filteredPatients.length === 0">
                    <td colspan="7" class="text-center py-5">
                      <div class="no-data-content py-4">
                        <i class="fas fa-user-slash fa-3x mb-3 text-muted opacity-25"></i>
                        <p class="text-muted fw-600">Tidak ada pasien yang cocok dengan filter Anda</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="custom-modal-footer p-3 bg-light d-flex justify-content-end gap-2 border-top">
            <button type="button" class="btn btn-secondary fw-bold btn-sm px-4 py-2" data-bs-dismiss="modal" style="border-radius: 12px; font-size: 0.75rem; width: auto !important; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              Tutup
            </button>
            <button type="button" class="btn btn-success fw-bold btn-sm px-4 py-2" @click="exportPatientsExcel" style="border-radius: 12px; font-size: 0.75rem; width: auto !important; border: none; box-shadow: 0 4px 10px rgba(21, 128, 61, 0.2);">
              <i class="fas fa-file-excel me-2"></i> Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import laporanService from '@/services/laporanService'
import dokterService from '@/services/dokterService'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import { debounce } from 'lodash'

const apexchart = VueApexCharts

const loading = ref(false)
const activeTab = ref('diagnosa')
const diagnosaData = ref([])
const prosedurData = ref([])
const patientList = ref([])
const dokterList = ref([])
const patientSearch = ref('')
const patientPjFilter = ref('all')
const patientStatusFilter = ref('all')
const selectedItem = ref(null)
const loadingPatients = ref(false)
let modalInstance = null

const uniquePj = computed(() => {
  const pjs = patientList.value.map(p => p.pembiayaan)
  return [...new Set(pjs)].sort()
})

const filteredPatients = computed(() => {
  return patientList.value.filter(p => {
    const matchesSearch = 
      p.nm_pasien.toLowerCase().includes(patientSearch.value.toLowerCase()) ||
      p.no_rkm_medis.toLowerCase().includes(patientSearch.value.toLowerCase()) ||
      p.no_rawat.toLowerCase().includes(patientSearch.value.toLowerCase()) ||
      (p.nm_dokter && p.nm_dokter.toLowerCase().includes(patientSearch.value.toLowerCase()))
    
    const matchesPj = patientPjFilter.value === 'all' || p.pembiayaan === patientPjFilter.value
    const matchesStatus = patientStatusFilter.value === 'all' || p.status === patientStatusFilter.value
    
    return matchesSearch && matchesPj && matchesStatus
  })
})

const filters = reactive({
  tgl_awal: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  tgl_akhir: new Date().toISOString().split('T')[0],
  status: 'all',
  kd_dokter: 'all',
  keyword: ''
})

const fetchDokterList = async () => {
  try {
    const res = await dokterService.getAllDokter({ status: '1' })
    dokterList.value = res.data.data || res.data || []
  } catch (err) {
    console.error('Gagal mengambil daftar dokter:', err)
  }
}

const diagnosaSummary = computed(() => {
  return {
    total: diagnosaData.value.reduce((acc, curr) => acc + parseInt(curr.total), 0),
    ralan: diagnosaData.value.reduce((acc, curr) => acc + parseInt(curr.ralan), 0),
    ranap: diagnosaData.value.reduce((acc, curr) => acc + parseInt(curr.ranap), 0)
  }
})

const prosedurSummary = computed(() => {
  return {
    total: prosedurData.value.reduce((acc, curr) => acc + parseInt(curr.total), 0),
    ralan: prosedurData.value.reduce((acc, curr) => acc + parseInt(curr.ralan), 0),
    ranap: prosedurData.value.reduce((acc, curr) => acc + parseInt(curr.ranap), 0)
  }
})

const tableData = computed(() => {
  return activeTab.value === 'diagnosa' ? diagnosaData.value : prosedurData.value
})

const chartSeries = computed(() => {
  return [{
    name: 'Total Kasus',
    data: tableData.value.slice(0, 10).map(item => parseInt(item.total))
  }]
})

const chartOptions = computed(() => {
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        distributed: true,
        dataLabels: { position: 'top' }
      }
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#f97316', '#6366f1', '#14b8a6'],
    dataLabels: {
      enabled: true,
      formatter: function (val) { return val },
      offsetX: -10,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    xaxis: {
      categories: tableData.value.slice(0, 10).map(item => item.kd_penyakit || item.kode),
      labels: { style: { fontWeight: 600 } }
    },
    yaxis: {
      labels: {
        maxWidth: 200,
        style: { fontWeight: 600 }
      }
    },
    tooltip: {
      y: {
        formatter: function (val, { series, seriesIndex, dataPointIndex, w }) {
          const item = tableData.value[dataPointIndex]
          return `${val} Kasus (${item.nm_penyakit || item.nm_prosedur})`
        }
      }
    },
    legend: { show: false }
  }
})

const refreshData = async () => {
  loading.value = true
  try {
    const [resDiag, resPros] = await Promise.all([
      laporanService.getDiagnosaReport(filters),
      laporanService.getProsedurReport(filters)
    ])
    diagnosaData.value = resDiag.data.data.results
    prosedurData.value = resPros.data.data.results
  } catch (error) {
    console.error('Gagal mengambil laporan:', error)
  } finally {
    loading.value = false
  }
}

const exportToExcel = () => {
  const data = tableData.value.map((item, index) => ({
    No: index + 1,
    Kode: item.kd_penyakit || item.kode,
    Nama: item.nm_penyakit || item.nm_prosedur,
    Ralan: item.ralan,
    Ranap: item.ranap,
    Total: item.total
  }))
  
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, activeTab.value === 'diagnosa' ? 'Diagnosa' : 'Prosedur')
  XLSX.writeFile(workbook, `Laporan_${activeTab.value}_${filters.tgl_awal}_sd_${filters.tgl_akhir}.xlsx`)
}

const openPatientModal = async (item) => {
  selectedItem.value = item
  patientList.value = []
  loadingPatients.value = true
  
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(document.getElementById('patientListModal'))
  }
  modalInstance.show()
  
  try {
    const params = {
      ...filters,
      kd_penyakit: item.kd_penyakit,
      kode: item.kode
    }
    
    let response
    if (activeTab.value === 'diagnosa') {
      response = await laporanService.getDiagnosaPatients(params)
    } else {
      response = await laporanService.getProsedurPatients(params)
    }
    patientList.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil daftar pasien:', error)
  } finally {
    loadingPatients.value = false
  }
}

const exportPatientsExcel = () => {
  const code = selectedItem.value?.kd_penyakit || selectedItem.value?.kode
  const name = selectedItem.value?.nm_penyakit || selectedItem.value?.nm_prosedur
  
  // Add header info
  const headerData = [
    ["LAPORAN DAFTAR PASIEN"],
    ["Diagnosa/Prosedur:", `${code} - ${name}`],
    ["Periode:", `${filters.tgl_awal} s/d ${filters.tgl_akhir}`],
    [""], // Spacer
    ["Tgl Registrasi", "No RM", "No Rawat", "Status", "Nama Pasien", "Dokter DPJP", "Tgl Lahir", "Umur", "No KTP", "JK", "Alamat", "Pembiayaan"]
  ]
  
  // Format patient data
  const data = filteredPatients.value.map(p => [
    p.tgl_registrasi, p.no_rkm_medis, p.no_rawat, p.status, p.nm_pasien, p.nm_dokter || '-', p.tgl_lahir, p.umur, p.no_ktp, p.jk, p.alamat, p.pembiayaan
  ])
  
  const worksheet = XLSX.utils.aoa_to_sheet([...headerData, ...data])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Pasien')
  XLSX.writeFile(workbook, `Pasien_${code}_${filters.tgl_awal}_sd_${filters.tgl_akhir}.xlsx`)
}

const debouncedRefresh = debounce(refreshData, 500)

watch(() => filters.keyword, () => {
  debouncedRefresh()
})

onMounted(() => {
  fetchDokterList()
  refreshData()
})

watch(activeTab, () => {
  // Can trigger sub-actions here if needed
})
</script>

<style scoped>
.diagnosa-prosedur-container {
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

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  font-size: 0.875rem;
}

.filter-search {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  color: #334155;
  border-radius: 10px;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  height: 38px;
  width: 100%;
}

.filter-search:focus {
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

.btn-refresh-custom:active:not(:disabled) {
  transform: translateY(0);
}

/* Stats Cards */
.stats-card-premium {
  background: white;
  padding: 1.5rem;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  border-left: 5px solid transparent;
}

.stats-card-premium.diagnosa { border-left-color: #3b82f6; }
.stats-card-premium.prosedur { border-left-color: #10b981; }

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.diagnosa .card-icon { background: #eff6ff; color: #3b82f6; }
.prosedur .card-icon { background: #ecfdf5; color: #10b981; }

.stats-label {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.stats-value {
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.3rem;
  font-size: 1.5rem;
}

.stats-footer {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}

/* Content Area */
.content-wrapper-premium {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
}

.tabs-header {
  display: flex;
  background: #f8fafc;
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  padding: 0.85rem 1.5rem;
  border: 1px solid transparent;
  background: transparent;
  font-weight: 700;
  color: #64748b;
  border-radius: 10px;
  transition: all 0.2s;
  flex: 1;
  font-size: 0.9rem;
}

.tab-btn:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  border-color: #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
}

.chart-container-premium, .table-container-premium {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
  height: 100%;
}

.chart-title, .table-title {
  font-weight: 800;
  color: #334155;
  margin-bottom: 1.5rem;
}

.btn-export {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #047857;
}

.clickable-row {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable-row:hover {
  background-color: #f8fafc !important;
  transform: scale(1.005);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.fw-800 { font-weight: 800; }
.fw-600 { font-weight: 600; }

/* Modal Styles */
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.modal-title {
  color: #0f172a;
  font-weight: 800;
}

.header-icon-circle {
  width: 44px;
  height: 44px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.patient-count-badge {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 0.4rem 0.85rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.count-num {
  color: #3b82f6;
  font-weight: 800;
  font-size: 1rem;
  line-height: 1;
}

.count-label {
  color: #64748b;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-close-custom {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-custom:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: rotate(90deg);
}

.custom-modal-footer {
  display: flex !important;
  flex-direction: row !important;
  justify-content: flex-end !important;
  align-items: center !important;
}

.custom-modal-footer .btn {
  flex: 0 0 auto !important;
  width: auto !important;
  margin: 0 !important;
}

.modal-filters {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.bg-blue-soft, .bg-primary-soft { background-color: #eff6ff; }
.text-blue { color: #3b82f6; }
.bg-pink-soft { background-color: #fdf2f8; }
.text-pink { color: #ec4899; }

.small-text-truncate {
  font-size: 0.8rem;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-premium-pj {
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
  font-weight: 700;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
}

/* Custom Table */
.custom-table-premium thead th, .custom-table-patient thead th {
  background: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.85rem 1rem;
  border-top: none;
  border-bottom: 1px solid #e2e8f0;
}

.custom-table-patient tbody tr {
  transition: all 0.2s;
}

.custom-table-premium tbody td, .custom-table-patient tbody td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
}

.custom-table-premium tbody tr:last-child td, .custom-table-patient tbody tr:last-child td {
  border-bottom: none;
}

.rank-num {
  width: 28px;
  height: 28px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 800;
  font-size: 0.75rem;
  color: #475569;
}

.badge-kode {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
}

.item-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
  line-height: 1.2;
}

.item-sub-details {
  margin-top: 0.3rem;
}

.item-sub-details .badge {
  font-size: 0.65rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .btn-refresh-custom {
    width: 100%;
  }
  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
