<template>
  <div class="diagnosa-prosedur-container p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title">
            <i class="fas fa-file-medical-alt me-2"></i>
            Laporan Diagnosa & Prosedur
          </h2>
          <p class="page-subtitle">Analisis statistik ICD-10 (Diagnosa) dan ICD-9 (Prosedur) pasien</p>
        </div>

        <div class="header-actions">
          <div class="filter-wrapper align-items-end">
            <div class="filter-group">
              <label class="filter-label">PERIODE</label>
              <div class="date-range-picker">
                <input type="date" v-model="filters.tgl_awal" class="form-input-premium" />
                <span class="sep">s/d</span>
                <input type="date" v-model="filters.tgl_akhir" class="form-input-premium" />
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-label">LAYANAN</label>
              <select v-model="filters.status" class="form-select-premium">
                <option value="all">Semua Layanan</option>
                <option value="Ralan">Rawat Jalan</option>
                <option value="Ranap">Rawat Inap</option>
              </select>
            </div>

            <div class="filter-group flex-grow-1">
              <label class="filter-label">CARI DIAGNOSA / PROSEDUR</label>
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="filters.keyword" 
                  class="form-input-premium w-100 ps-5" 
                  placeholder="Ketik kode atau nama..."
                  @keyup.enter="refreshData"
                />
              </div>
            </div>

            <div class="filter-group">
              <button @click="refreshData" class="btn-refresh-premium" :disabled="loading">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                Tampilkan
              </button>
            </div>
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
          <!-- Enhanced Header with Gradient -->
          <div class="modal-header-premium d-flex justify-content-between align-items-center p-4">
            <div class="d-flex align-items-center gap-3">
              <div class="header-icon-circle shadow-sm">
                <i class="fas fa-user-injured text-primary"></i>
              </div>
              <div class="header-text">
                <h5 class="modal-title fw-800 text-white mb-0">
                  Daftar Pasien
                </h5>
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="badge bg-white text-primary fw-bold shadow-sm">{{ selectedItem?.kd_penyakit || selectedItem?.kode }}</span>
                  <span class="text-white-50 small fw-600">{{ selectedItem?.nm_penyakit || selectedItem?.nm_prosedur }}</span>
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
                  <div class="search-input-wrapper shadow-sm">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                      type="text" 
                      v-model="patientSearch" 
                      class="form-input-premium w-100 ps-5" 
                      placeholder="Cari Pasien..."
                      style="height: 38px; font-size: 0.85rem;"
                    />
                  </div>
                </div>
                <div class="col-md-3">
                  <select v-model="patientStatusFilter" class="form-select-premium w-100 shadow-sm" style="height: 38px; font-size: 0.85rem;">
                    <option value="all">Semua Layanan</option>
                    <option value="Ralan">Rawat Jalan</option>
                    <option value="Ranap">Rawat Inap</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select v-model="patientPjFilter" class="form-select-premium w-100 shadow-sm" style="height: 38px; font-size: 0.85rem;">
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
                    <td colspan="6" class="text-center py-5">
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
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import { debounce } from 'lodash'

const apexchart = VueApexCharts

const loading = ref(false)
const activeTab = ref('diagnosa')
const diagnosaData = ref([])
const prosedurData = ref([])
const patientList = ref([])
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
      p.no_rawat.toLowerCase().includes(patientSearch.value.toLowerCase())
    
    const matchesPj = patientPjFilter.value === 'all' || p.pembiayaan === patientPjFilter.value
    const matchesStatus = patientStatusFilter.value === 'all' || p.status === patientStatusFilter.value
    
    return matchesSearch && matchesPj && matchesStatus
  })
})

const filters = reactive({
  tgl_awal: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  tgl_akhir: new Date().toISOString().split('T')[0],
  status: 'all',
  keyword: ''
})

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
    ["Tgl Registrasi", "No RM", "No Rawat", "Status", "Nama Pasien", "Tgl Lahir", "Umur", "No KTP", "JK", "Alamat", "Pembiayaan"]
  ]
  
  // Format patient data
  const data = filteredPatients.value.map(p => [
    p.tgl_registrasi, p.no_rkm_medis, p.no_rawat, p.status, p.nm_pasien, p.tgl_lahir, p.umur, p.no_ktp, p.jk, p.alamat, p.pembiayaan
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

onMounted(refreshData)

watch(activeTab, () => {
  // Can trigger sub-actions here if needed
})
</script>

<style scoped>
.diagnosa-prosedur-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 2.5rem;
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 25px rgba(30, 58, 138, 0.15);
}

.page-title {
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  opacity: 0.85;
  font-size: 1rem;
}

.header-actions {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 15px;
  backdrop-filter: blur(5px);
}

.filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.form-input-premium, .form-select-premium {
  background: white;
  border: none;
  padding: 0 1rem;
  height: 44px;
  border-radius: 10px;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.btn-refresh-premium {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0 1.5rem;
  height: 44px;
  border-radius: 10px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-refresh-premium:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
}

/* Stats Cards */
.stats-card-premium {
  background: white;
  padding: 1.5rem;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}

.tabs-header {
  display: flex;
  background: #f1f5f9;
  padding: 0.5rem;
}

.tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  font-weight: 700;
  color: #64748b;
  border-radius: 12px;
  transition: all 0.2s;
  flex: 1;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
  border: 1px solid #f1f5f9;
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
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

.clickable-row {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable-row:hover {
  background-color: #f8fafc !important;
  transform: scale(1.005);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.fw-800 { font-weight: 800; }
.fw-600 { font-weight: 600; }

/* Modal Premium Styles */
.modal-header-premium {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
}

.header-icon-circle {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.patient-count-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 80px;
}

.count-num {
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
  line-height: 1;
}

.count-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-close-custom {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-custom:hover {
  background: rgba(255, 255, 255, 0.3);
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
  color: #475569;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  padding: 0.75rem 1rem;
  border-top: none;
}

.custom-table-patient tbody tr {
  transition: all 0.2s;
}

.custom-table-patient tbody td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.8rem;
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
  .header-actions {
    padding: 1rem;
  }
  .filter-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  .date-range-picker {
    width: 100%;
  }
  .form-input-premium {
    flex: 1;
  }
}
</style>
