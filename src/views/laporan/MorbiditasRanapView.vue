<template>
  <div class="morbiditas-ranap-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4 mt-n3 mx-n3 mt-md-n4 mx-md-n4">
      <div class="header-content d-flex flex-column flex-md-row justify-content-between align-items-md-center px-4 py-3 py-md-5">
        <div class="header-text mb-3 mb-md-0">
          <h2 class="page-title mb-1">
            <i class="fas fa-hospital-user me-2"></i>
            Morbiditas Pasien Rawat Inap
          </h2>
          <p class="page-subtitle mb-0">Laporan Morbiditas (SIRS/RL) Berdasarkan Kelompok Umur & Jenis Kelamin</p>
        </div>
        
        <div class="header-filters p-3 p-md-4">
          <div class="row g-2 align-items-end">
            <div class="col-6 col-md-auto">
              <label class="filter-label">BULAN</label>
              <select v-model="filters.month" class="form-select-modern">
                <option v-for="(name, index) in months" :key="index" :value="String(index + 1).padStart(2, '0')">
                  {{ name }}
                </option>
              </select>
            </div>
            <div class="col-6 col-md-auto">
              <label class="filter-label">TAHUN</label>
              <select v-model="filters.year" class="form-select-modern">
                <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
              </select>
            </div>
            <div class="col-12 col-md-auto d-grid">
              <button @click="loadData" class="btn-refresh-modern" :disabled="loading">
                <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i>
                {{ loading ? 'Memuat...' : 'Refresh' }}
              </button>
            </div>
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
                <th rowspan="3" class="text-center align-middle bg-light-soft fixed-col">No.</th>
                <th rowspan="3" class="align-middle bg-light-soft fixed-col" style="left: 50px;">Kode ICD-10</th>
                <th rowspan="3" class="align-middle bg-light-soft fixed-col" style="left: 150px; min-width: 250px;">Diagnosis Penyakit</th>
                <th :colspan="Object.keys(ageGroups).length * 2" class="text-center bg-primary-soft text-primary py-2 border-bottom-0">
                  Jumlah Pasien Hidup dan Mati Menurut Kelompok Umur & Jenis Kelamin
                </th>
                <th rowspan="3" class="text-center align-middle bg-dark text-white">Total</th>
              </tr>
              <tr class="header-row-2">
                <th v-for="(group, key) in ageGroups" :key="key" colspan="2" class="text-center py-2 age-group-header">
                  {{ group.label }}
                </th>
              </tr>
              <tr class="header-row-3 text-center">
                <template v-for="n in Object.keys(ageGroups).length" :key="n">
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
                <td class="text-center fixed-col">{{ index + 1 }}</td>
                <td class="fixed-col" style="left: 50px;">
                  <span class="badge bg-info-soft text-info fw-700">{{ item.kd_penyakit }}</span>
                </td>
                <td class="fixed-col text-truncate" style="left: 150px; cursor: pointer;" :title="item.nm_penyakit">
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
                <td class="text-center fw-bold bg-light-item">{{ item.total_pasien }}</td>
              </tr>
            </tbody>
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
import { ref, reactive, onMounted } from 'vue'
import { morbiditasRanapService } from '@/services/laporan/morbiditasRanapService'
import * as XLSX from 'xlsx'

const loading = ref(false)
const viewMode = ref('table') // table or summary
const results = ref([])
const ageGroups = ref({})
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

const filters = reactive({
  month: String(new Date().getMonth() + 1).padStart(2, '0'),
  year: String(currentYear)
})

const loadData = async () => {
  loading.value = true
  try {
    const response = await morbiditasRanapService.getData(filters)
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
  h1.push("Total")
  h2.push("")
  
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
    row.push(item.total_pasien)
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
  
  ws['!merges'] = merges
  
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Morbiditas Ranap")
  XLSX.writeFile(wb, `Morbiditas_Ranap_${filters.month}_${filters.year}.xlsx`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.morbiditas-ranap-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 0 0 40px 40px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.page-title {
  color: white;
  font-weight: 800;
  font-size: 1.75rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: rgba(255,255,255,0.8);
  font-size: 0.95rem;
}

.header-filters {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
}

.filter-label {
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  margin-bottom: 4px;
  display: block;
}

.form-select-modern {
  background: rgba(255,255,255,0.95);
  border: 0;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e3a8a;
}

.btn-refresh-modern {
  background: #34d399;
  color: white;
  border: 0;
  border-radius: 12px;
  padding: 0.6rem 1.5rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(52, 211, 153, 0.3);
  transition: all 0.3s;
}

.btn-refresh-modern:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Report Table Styling */
.report-card {
  border-radius: 24px;
  background: white;
  overflow: hidden;
  box-shadow: 0 4px 25px rgba(0,0,0,0.05);
}

.bg-primary-soft { background-color: #eef2ff; }
.text-pink { color: #db2777; }
.bg-info-soft { background-color: #ecf8ff; }

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

.header-row-1 th { background: #f8fafc; font-weight: 800; border-bottom: 0 !important; }
.age-group-header { 
  background: #f1f5f9; 
  font-weight: 700; 
  font-size: 0.75rem; 
  color: #475569;
  border-left: 1px solid #e2e8f0 !important;
}

.gender-header { font-weight: 800; background: #fff; border-bottom: 2px solid #e2e8f0 !important; }
.male { color: #3b82f6; border-left: 1px solid #e2e8f0 !important; }
.female { color: #db2777; }

.fixed-col {
  position: sticky !important;
  left: 0;
  z-index: 20;
  background: #fff;
}

.data-row td { 
  border-color: #f1f5f9;
  padding: 0.75rem 0.5rem;
}

.data-row:hover .fixed-col { background: #f8fafc; }
.data-row:hover td { background: #f8fafc; }

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
}
</style>
