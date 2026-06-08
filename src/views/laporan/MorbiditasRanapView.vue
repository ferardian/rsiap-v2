<template>
  <div class="morbiditas-ranap-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-hospital-user"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Morbiditas Pasien Rawat Inap</h3>
            <p class="page-subtitle mb-0 small">Laporan Morbiditas (SIRS/RL) Berdasarkan Kelompok Umur & Jenis Kelamin</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <!-- Mode Laporan -->
          <div class="col-lg-3 col-md-6">
            <label class="filter-label"><i class="fas fa-sliders-h me-1 text-primary"></i> Mode Laporan</label>
            <div class="mode-toggle">
              <button @click="filters.mode = 'bulanan'" class="mode-btn" :class="{ active: filters.mode === 'bulanan' }">Bulanan</button>
              <button @click="filters.mode = 'tahunan'" class="mode-btn" :class="{ active: filters.mode === 'tahunan' }">Tahunan</button>
            </div>
          </div>

          <!-- Bulan (Only Bulanan) -->
          <div class="col-lg-2 col-md-6" v-if="filters.mode === 'bulanan'">
            <label class="filter-label"><i class="fas fa-calendar-alt me-1 text-primary"></i> Bulan</label>
            <select v-model="filters.month" class="form-select form-select-sm modern-select">
              <option v-for="(name, index) in months" :key="index" :value="String(index + 1).padStart(2, '0')">
                {{ name }}
              </option>
            </select>
          </div>

          <!-- Tahun -->
          <div class="col-lg-2 col-md-6" :class="{'col-lg-3': filters.mode === 'tahunan'}">
            <label class="filter-label"><i class="fas fa-calendar me-1 text-primary"></i> Tahun</label>
            <select v-model="filters.year" class="form-select form-select-sm modern-select">
              <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
            </select>
          </div>

          <!-- Jenis Pasien -->
          <div class="col-lg-3 col-md-6" :class="{'col-lg-4': filters.mode === 'tahunan'}">
            <label class="filter-label"><i class="fas fa-user-friends me-1 text-primary"></i> Jenis Pasien</label>
            <select v-model="filters.kd_sps" class="form-select form-select-sm modern-select">
              <option value="">Semua Pasien</option>
              <option v-for="sps in specialties" :key="sps.kd_sps" :value="sps.kd_sps">
                {{ sps.nm_sps }}
              </option>
            </select>
          </div>

          <!-- Refresh Button -->
          <div class="col-lg-2 col-md-6 d-grid">
            <button @click="loadData" class="btn btn-primary btn-sm rounded-3 fw-bold btn-refresh-custom" :disabled="loading">
              <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="report-card elevation-sm border-0">
      <div class="card-header-modern d-flex justify-content-between align-items-center bg-white border-bottom py-3 px-4">
        <div class="d-flex align-items-center gap-3">
          <h5 class="mb-0 fw-bold text-dark">Daftar Diagnosa Penyakit</h5>
          <span class="badge rounded-pill bg-primary-soft text-primary px-3 py-2">
            {{ results.length }} Diagnosa
          </span>
        </div>
        <div class="header-actions">
          <button @click="exportToExcel" class="btn btn-outline-success btn-sm rounded-pill px-3 shadow-none border-0" :disabled="!results.length">
            <i class="fas fa-file-excel me-2"></i>Export Excel
          </button>
        </div>
      </div>
      
      <div class="card-body p-0 chart-and-table-container">
        <!-- View selection for mobile -->
        <div class="d-md-none p-3 border-bottom sticky-top bg-white z-index-10">
          <div class="btn-group w-100 rounded-pill overflow-hidden border">
            <button @click="viewMode = 'table'" class="btn btn-sm py-2 shadow-none border-0" :class="viewMode === 'table' ? 'btn-primary' : 'btn-white'">
              <i class="fas fa-table me-2"></i>Tabel
            </button>
            <button @click="viewMode = 'summary'" class="btn btn-sm py-2 shadow-none border-0" :class="viewMode === 'summary' ? 'btn-primary' : 'btn-white'">
              <i class="fas fa-list-ul me-2"></i>Ringkasan
            </button>
          </div>
        </div>

        <!-- Table View (Desktop & Responsive) -->
        <div v-if="viewMode === 'table'" class="table-responsive-modern custom-scrollbar">
          <table class="table table-hover table-bordered mb-0 align-middle">
            <thead class="sticky-thead">
              <tr class="header-row-1">
                <th rowspan="3" class="text-center align-middle fixed-col header-fixed">No.</th>
                <th rowspan="3" class="align-middle fixed-col header-fixed" style="left: 50px; width: 100px; min-width: 100px;">Kode ICD-10</th>
                <th rowspan="3" class="align-middle fixed-col header-fixed" style="left: 150px; min-width: 300px; max-width: 450px;">Diagnosis Penyakit</th>
                <th :colspan="Object.keys(ageGroups).length * 2" class="text-center bg-primary-soft text-primary py-2 border-bottom-0">
                  Jumlah Pasien Hidup dan Mati Menurut Kelompok Umur & Jenis Kelamin
                </th>
                <th colspan="2" class="text-center bg-success-soft text-success py-2 border-bottom-0">Jml. Pasien (L+P)</th>
                <th colspan="2" class="text-center bg-danger-soft text-danger py-2 border-bottom-0">Jml. Pasien Keluar Mati</th>
                <th rowspan="3" class="text-center align-middle bg-dark text-white">Total</th>
              </tr>
              <tr class="header-row-2">
                <th v-for="(group, key) in ageGroups" :key="key" colspan="2" class="text-center py-2 age-group-header">
                  {{ group.label }}
                </th>
                <th colspan="2" class="text-center py-2 age-group-header">Total L/P</th>
                <th colspan="2" class="text-center py-2 age-group-header">Mati L/P</th>
              </tr>
              <tr class="header-row-3 text-center">
                <template v-for="n in (Object.keys(ageGroups).length + 2)" :key="n">
                  <th class="gender-header male text-nowrap"><small>L</small></th>
                  <th class="gender-header female text-nowrap"><small>P</small></th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td :colspan="Object.keys(ageGroups).length * 2 + 4" class="text-center py-5 border-0">
                  <div class="loading-state">
                    <div class="spinner-grow text-primary mb-3" role="status"></div>
                    <p class="text-muted fw-500">Sedang mengolah ribuan data...</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!results.length">
                <td :colspan="Object.keys(ageGroups).length * 2 + 4" class="text-center py-5 border-0">
                  <div class="empty-state">
                    <i class="fas fa-search fa-3x text-light mb-3"></i>
                    <p class="text-muted">Tidak ada data untuk periode terpilih</p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, index) in results" :key="item.kd_penyakit" class="data-row">
                <td class="text-center fixed-col" style="width: 50px; min-width: 50px;">{{ index + 1 }}</td>
                <td class="fixed-col" style="left: 50px; width: 100px; min-width: 100px;">
                  <span class="badge bg-info-soft text-info fw-700">{{ item.kd_penyakit }}</span>
                </td>
                <td class="fixed-col text-truncate" style="left: 150px; min-width: 300px; max-width: 450px; cursor: pointer;" :title="item.nm_penyakit">
                  <span class="penyakit-name">{{ item.nm_penyakit }}</span>
                </td>
                <template v-for="(group, key) in ageGroups" :key="key">
                  <td class="text-center border-start-item" :class="{'val-nonzero': item[key + '_l'] > 0}">
                    {{ item[key + '_l'] || 0 }}
                  </td>
                  <td class="text-center" :class="{'val-nonzero': item[key + '_p'] > 0}">
                    {{ item[key + '_p'] || 0 }}
                  </td>
                </template>
                <!-- New Columns -->
                <td class="text-center border-start-item fw-700 bg-success-soft">{{ item.total_l || 0 }}</td>
                <td class="text-center fw-700 bg-success-soft">{{ item.total_p || 0 }}</td>
                <td class="text-center border-start-item fw-700 bg-danger-soft">{{ item.mati_l || 0 }}</td>
                <td class="text-center fw-700 bg-danger-soft">{{ item.mati_p || 0 }}</td>
                
                <td class="text-center fw-bold bg-light-item">{{ item.total_pasien }}</td>
              </tr>
            </tbody>
            <tfoot v-if="results.length">
              <tr class="footer-row-lp fw-bold">
                <td colspan="3" class="text-center fixed-col footer-fixed">TOTAL (LAKI-LAKI & PEREMPUAN)</td>
                <template v-for="(group, key) in ageGroups" :key="'total-lp-'+key">
                  <td class="text-center border-start-item" :class="{'bg-yellow-soft': totals[key + '_l'] > 0}">{{ totals[key + '_l'] }}</td>
                  <td class="text-center" :class="{'bg-yellow-soft': totals[key + '_p'] > 0}">{{ totals[key + '_p'] }}</td>
                </template>
                <td class="text-center border-start-item bg-success-soft">{{ totals.total_l }}</td>
                <td class="text-center bg-success-soft">{{ totals.total_p }}</td>
                <td class="text-center border-start-item bg-danger-soft">{{ totals.mati_l }}</td>
                <td class="text-center bg-danger-soft">{{ totals.mati_p }}</td>
                <td class="text-center bg-dark text-white" rowspan="2" style="vertical-align: middle;">{{ totals.total_pasien }}</td>
              </tr>
              <tr class="footer-row-combined fw-800">
                <td colspan="3" class="text-center fixed-col footer-fixed bg-light">JUMLAH (L + P)</td>
                <template v-for="(group, key) in ageGroups" :key="'sum-'+key">
                  <td colspan="2" class="text-center border-start-item bg-primary-soft text-primary">
                    {{ totals[key + '_l'] + totals[key + '_p'] }}
                  </td>
                </template>
                <td colspan="2" class="text-center border-start-item bg-success text-white">
                  {{ totals.total_l + totals.total_p }}
                </td>
                <td colspan="2" class="text-center border-start-item bg-danger text-white">
                  {{ totals.mati_l + totals.mati_p }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Summary View (Mobile Optimized) -->
        <div v-else class="mobile-summary-list custom-scrollbar">
          <div v-if="loading" class="text-center py-5">
             <div class="spinner-grow text-primary" role="status"></div>
          </div>
          <div v-else-if="!results.length" class="text-center py-5 text-muted">
            Kosong
          </div>
          <div v-else v-for="(item, index) in results" :key="item.kd_penyakit" class="mobile-item p-3 border-bottom">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-dark rounded-circle" style="width:24px; height:24px; display:flex; align-items:center; justify-content:center">{{ index + 1 }}</span>
                <span class="badge bg-info-soft text-info fw-700">{{ item.kd_penyakit }}</span>
              </div>
              <span class="badge bg-primary rounded-pill px-3">Total: {{ item.total_pasien }}</span>
            </div>
            <h6 class="mb-3 fw-bold">{{ item.nm_penyakit }}</h6>
            <div class="age-summary-grid">
               <div v-for="(group, key) in ageGroups" :key="key" 
                    v-if="(item[key + '_l'] || 0) + (item[key + '_p'] || 0) > 0"
                    class="age-card p-2 rounded border mb-2">
                 <div class="small fw-bold text-muted mb-1">{{ group.label }}</div>
                 <div class="d-flex justify-content-between">
                   <span class="small text-info"><i class="fas fa-mars me-1"></i>{{ item[key + '_l'] || 0 }}</span>
                   <span class="small text-pink"><i class="fas fa-venus me-1"></i>{{ item[key + '_p'] || 0 }}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { morbiditasRanapService } from '@/services/laporan/morbiditasRanapService'
import { dokterService } from '@/services/dokterService'
import * as XLSX from 'xlsx'

const loading = ref(false)
const viewMode = ref('table') // table or summary
const results = ref([])
const ageGroups = ref({})
const specialties = ref([])
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i)

const filters = reactive({
  mode: 'bulanan',
  month: String(new Date().getMonth() + 1).padStart(2, '0'),
  year: String(currentYear),
  kd_sps: ''
})

const totals = computed(() => {
  const t = {
    total_l: 0,
    total_p: 0,
    mati_l: 0,
    mati_p: 0,
    total_pasien: 0
  }
  
  Object.keys(ageGroups.value).forEach(key => {
    t[key + '_l'] = 0
    t[key + '_p'] = 0
  })

  results.value.forEach(item => {
    t.total_l += parseInt(item.total_l || 0)
    t.total_p += parseInt(item.total_p || 0)
    t.mati_l += parseInt(item.mati_l || 0)
    t.mati_p += parseInt(item.mati_p || 0)
    t.total_pasien += parseInt(item.total_pasien || 0)
    
    Object.keys(ageGroups.value).forEach(key => {
      t[key + '_l'] += parseInt(item[key + '_l'] || 0)
      t[key + '_p'] += parseInt(item[key + '_p'] || 0)
    })
  })
  
  return t
})

const loadSpecialties = async () => {
  try {
    const response = await dokterService.getSpesialisasi()
    if (response.data.success) {
      specialties.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading specialties:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      month: filters.mode === 'tahunan' ? 'annual' : filters.month,
      year: filters.year,
      kd_sps: filters.kd_sps
    }
    const response = await morbiditasRanapService.getData(params)
    if (response.data.success) {
      results.value = response.data.data.results
      ageGroups.value = response.data.data.age_groups
    }
  } catch (error) {
    console.error('Error loading morbiditas data:', error)
  } finally {
    loading.value = false
  }
}

const exportToExcel = () => {
  const wsData = []
  
  // Custom headers for Excel
  const h1 = ["No.", "Kode ICD-10", "Diagnosis Penyakit"]
  const h2 = ["", "", ""]
  
  Object.values(ageGroups.value).forEach(group => {
    h1.push(group.label, "")
    h2.push("Laki-Laki", "Perempuan")
  })
  
  h1.push("Total L/P", "", "Mati L/P", "", "Total")
  h2.push("L", "P", "L", "P", "")
  
  wsData.push(["LAPORAN MORBIDITAS RAWAT INAP"])
  wsData.push([`Periode: ${months[parseInt(filters.month) - 1]} ${filters.year}`])
  wsData.push([])
  wsData.push(h1)
  wsData.push(h2)
  
  results.value.forEach((item, index) => {
    const row = [index + 1, item.kd_penyakit, item.nm_penyakit]
    Object.keys(ageGroups.value).forEach(key => {
      row.push(item[key + '_l'] || 0)
      row.push(item[key + '_p'] || 0)
    })
    row.push(item.total_l || 0, item.total_p || 0, item.mati_l || 0, item.mati_p || 0, item.total_pasien)
    wsData.push(row)
  })
  
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // Merge headers in excel
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }, // No
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // Kode
    { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, // Nama
  ]
  
  let colIdx = 3
  Object.keys(ageGroups.value).forEach(() => {
    merges.push({ s: { r: 3, c: colIdx }, e: { r: 3, c: colIdx + 1 } })
    colIdx += 2
  })
  
  // Merge new columns headers
  merges.push({ s: { r: 3, c: colIdx }, e: { r: 3, c: colIdx + 1 } }) // Total L/P
  merges.push({ s: { r: 3, c: colIdx + 2 }, e: { r: 3, c: colIdx + 3 } }) // Mati L/P
  merges.push({ s: { r: 3, c: colIdx + 4 }, e: { r: 4, c: colIdx + 4 } }) // Grand Total
  
  ws['!merges'] = merges
  
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Morbiditas Ranap")
  const filename = filters.mode === 'tahunan' 
    ? `Morbiditas_Ranap_${filters.year}.xlsx` 
    : `Morbiditas_Ranap_${filters.month}_${filters.year}.xlsx`
  XLSX.writeFile(wb, filename)
}

onMounted(() => {
  loadSpecialties()
  loadData()
})
</script>

<style scoped>
.morbiditas-ranap-container {
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

/* Mode Toggle Styles */
.mode-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  height: 38px;
  align-items: center;
}

.mode-btn {
  flex: 1;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.modern-select {
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

.modern-select:focus {
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

/* Report Table Styling */
.report-card {
  border-radius: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.bg-primary-soft { background-color: #eff6ff !important; color: #3b82f6 !important; }
.bg-success-soft { background-color: #ecfdf5 !important; color: #059669 !important; }
.bg-danger-soft { background-color: #fef2f2 !important; color: #dc2626 !important; }
.bg-info-soft { background-color: #f0f9ff !important; color: #0284c7 !important; }
.text-pink { color: #db2777; }

.table-responsive-modern {
  max-height: 70vh;
  overflow-y: auto;
  font-size: 0.85rem;
}

.sticky-thead {
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-row-1 th, .header-row-2 th, .header-row-3 th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-color: #e2e8f0 !important;
  vertical-align: middle;
}

.age-group-header { 
  background: #f1f5f9; 
  font-weight: 700; 
  font-size: 0.75rem; 
  color: #475569;
  border-left: 1px solid #e2e8f0 !important;
}

.gender-header { 
  font-weight: 800; 
  background: #ffffff; 
  border-bottom: 2px solid #e2e8f0 !important; 
}

.male { 
  color: #3b82f6; 
  border-left: 1px solid #e2e8f0 !important; 
}

.female { 
  color: #db2777; 
}

.fixed-col {
  position: sticky !important;
  left: 0;
  z-index: 20;
  background-color: #ffffff !important; 
  border-right: 1px solid #e2e8f0 !important;
  border-color: #e2e8f0 !important;
}

.fixed-col:nth-of-type(3) {
  border-right: 2px solid #cbd5e1 !important;
  box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1);
}

/* Ensure header fixed columns stay above everything */
thead .header-fixed {
  z-index: 150 !important;
  background-color: #f8fafc !important;
  border-bottom: 2px solid #e2e8f0 !important;
  color: #475569;
}

tfoot {
  position: sticky;
  bottom: 0;
  z-index: 200 !important; /* Higher than header-fixed to be safe */
  background-color: #ffffff !important;
}

tfoot tr {
  background-color: #ffffff !important;
}

tfoot .footer-fixed {
  z-index: 110 !important;
  background-color: #f8fafc !important;
  border-top: 2px solid #cbd5e1 !important;
}

.footer-row-lp td, .footer-row-combined td {
  padding: 0.75rem 0.5rem;
  border-top: 1px solid #cbd5e1 !important;
  background-color: #ffffff !important;
  opacity: 1 !important;
  position: relative; /* Create stacking context */
  border-color: #cbd5e1 !important;
}

.footer-row-lp td {
  border-top: 2px solid #cbd5e1 !important;
}

.footer-row-combined td {
  font-size: 0.9rem;
  border-bottom: 2px solid #cbd5e1 !important;
}

/* Specific background overrides for total columns and sum columns */
.footer-row-lp .bg-yellow-soft { background-color: #fffbeb !important; }
.footer-row-lp .bg-success-soft { background-color: #ecfdf5 !important; color: #059669 !important; }
.footer-row-lp .bg-danger-soft { background-color: #fef2f2 !important; color: #dc2626 !important; }

.footer-row-combined .bg-primary-soft { background-color: #eff6ff !important; color: #3b82f6 !important; }
.footer-row-combined .bg-success { background-color: #10b981 !important; color: #ffffff !important; }
.footer-row-combined .bg-danger { background-color: #ef4444 !important; color: #ffffff !important; }

.footer-row-lp .bg-dark { background-color: #1e293b !important; color: #ffffff !important; }

.bg-yellow-soft { background-color: #fffbeb; }

.data-row td { 
  border-color: #f1f5f9;
  padding: 0.75rem 0.5rem;
}

.data-row:hover td { background: #f8fafc; }
.data-row:hover .fixed-col { background-color: #f8fafc !important; }

.val-nonzero { color: #1e293b; font-weight: 700; background: #fffcf0; }
.border-start-item { border-left: 1.5px solid #e2e8f0 !important; }
.bg-light-item { background: #f8fafc; }

.penyakit-name {
  font-weight: 600;
  color: #1e293b;
  display: block;
}

/* Mobile Ringsan List */
.age-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
}

.age-card { background: #fcfcfc; }

.fw-700 { font-weight: 700; }
.fw-500 { font-weight: 500; }

.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

@media (max-width: 768px) {
  .page-header { border-radius: 0; margin-bottom: 0; }
  .report-card { border-radius: 0; border: 0; }
  .btn-refresh-custom {
    width: 100%;
  }
}
</style>
