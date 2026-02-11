<template>
  <div class="morbiditas-ralan-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4 mt-n3 mx-n3 mt-md-n4 mx-md-n4">
      <div class="header-content d-flex flex-column flex-md-row justify-content-between align-items-md-center px-4 py-3 py-md-5">
        <div class="header-text mb-3 mb-md-0">
          <h2 class="page-title mb-1">
            <i class="fas fa-user-md me-2"></i>
            Morbiditas Pasien Rawat Jalan
          </h2>
          <p class="page-subtitle mb-0">Laporan Morbiditas (SIRS/RL) Berdasarkan Kasus Baru & Kelompok Umur</p>
        </div>
        
        <div class="header-filters p-3 p-md-4">
          <div class="row g-2 align-items-end">
            <div class="col-12 col-md-auto">
              <label class="filter-label">MODE LAPORAN</label>
              <div class="btn-group w-100 rounded-12 overflow-hidden">
                <button @click="filters.mode = 'bulanan'" class="btn btn-sm py-2 px-3 border-0 transition-all" 
                  :class="filters.mode === 'bulanan' ? 'btn-primary shadow' : 'bg-white text-dark border-end'"> BULANAN </button>
                <button @click="filters.mode = 'tahunan'" class="btn btn-sm py-2 px-3 border-0 transition-all" 
                  :class="filters.mode === 'tahunan' ? 'btn-primary shadow' : 'bg-white text-dark'"> TAHUNAN </button>
              </div>
            </div>
            <div class="col-6 col-md-auto" v-if="filters.mode === 'bulanan'">
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
            <div class="col-12 col-md-auto">
              <label class="filter-label">JENIS PASIEN</label>
              <select v-model="filters.kd_sps" class="form-select-modern">
                <option value="">SEMUA PASIEN</option>
                <option v-for="sps in specialties" :key="sps.kd_sps" :value="sps.kd_sps">
                  {{ sps.nm_sps }}
                </option>
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
                <th rowspan="3" class="text-center align-middle fixed-col header-fixed">No.</th>
                <th rowspan="3" class="text-center align-middle fixed-col header-fixed" style="left: 50px; width: 80px; min-width: 80px;">Aksi</th>
                <th rowspan="3" class="align-middle fixed-col header-fixed" style="left: 130px; width: 100px; min-width: 100px;">Kode ICD-10</th>
                <th rowspan="3" class="align-middle fixed-col header-fixed" style="left: 230px; min-width: 300px; max-width: 450px;">Diagnosis Penyakit</th>
                <th :colspan="Object.keys(ageGroups).length * 2" class="text-center bg-primary-soft text-primary py-2 border-bottom-0 border-start-item">
                  Jumlah Kasus Baru Menurut Kelompok Umur & Jenis Kelamin
                </th>
                <th colspan="3" class="text-center bg-success-soft text-success py-2 border-bottom-0 border-start-item border-end-item">Jumlah Kasus Baru Menurut Jenis Kelamin</th>
                <th colspan="3" class="text-center bg-info-soft text-info py-2 border-bottom-0">Jumlah Kunjungan</th>
              </tr>
              <tr class="header-row-2">
                <th v-for="(group, key) in ageGroups" :key="key" colspan="2" class="text-center py-2 age-group-header">
                  {{ group.label }}
                </th>
                <th rowspan="2" class="text-center align-middle bg-success-soft text-success border-start-item">L</th>
                <th rowspan="2" class="text-center align-middle bg-success-soft text-success">P</th>
                <th rowspan="2" class="text-center align-middle bg-success text-white border-end-item">Total</th>
                <th rowspan="2" class="text-center align-middle bg-info-soft text-info border-start-item">L</th>
                <th rowspan="2" class="text-center align-middle bg-info-soft text-info">P</th>
                <th rowspan="2" class="text-center align-middle bg-info text-white">Total</th>
              </tr>
              <tr class="header-row-3 text-center">
                <template v-for="(group, key) in ageGroups" :key="key">
                  <th class="gender-header male text-nowrap"><small>L</small></th>
                  <th class="gender-header female text-nowrap"><small>P</small></th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td :colspan="Object.keys(ageGroups).length * 2 + 10" class="text-center py-5 border-0">
                  <div class="loading-state">
                    <div class="spinner-grow text-primary mb-3" role="status"></div>
                    <p class="text-muted fw-500">Sedang mengolah ribuan data...</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!results.length">
                <td :colspan="Object.keys(ageGroups).length * 2 + 10" class="text-center py-5 border-0">
                  <div class="empty-state">
                    <i class="fas fa-search fa-3x text-light mb-3"></i>
                    <p class="text-muted">Tidak ada data untuk periode terpilih</p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, index) in results" :key="item.kd_penyakit" class="data-row">
                <td class="text-center fixed-col" style="width: 50px; min-width: 50px;">{{ index + 1 }}</td>
                <td class="text-center fixed-col" style="left: 50px; width: 80px; min-width: 80px;">
                  <button @click="openDetail(item)" class="btn btn-sm btn-outline-primary rounded-pill py-0 px-2" title="Detail">
                    <i class="fas fa-eye small"></i>
                  </button>
                </td>
                <td class="fixed-col" style="left: 130px; width: 100px; min-width: 100px;">
                  <span class="badge bg-info-soft text-info fw-700">{{ item.kd_penyakit }}</span>
                </td>
                <td class="fixed-col text-truncate shadow-right" style="left: 230px; min-width: 300px; max-width: 450px; cursor: pointer;" :title="item.nm_penyakit">
                  <span class="penyakit-name">{{ item.nm_penyakit }}</span>
                </td>
                
                <template v-for="(group, key) in ageGroups" :key="key">
                  <td class="text-center border-start-item" :class="{'val-nonzero': item[key + '_l'] > 0}">{{ item[key + '_l'] || 0 }}</td>
                  <td class="text-center" :class="{'val-nonzero': item[key + '_p'] > 0}">{{ item[key + '_p'] || 0 }}</td>
                </template>

                <!-- Kasus Baru JK -->
                <td class="text-center border-start-item fw-700 bg-success-soft">{{ item.total_l_baru || 0 }}</td>
                <td class="text-center fw-700 bg-success-soft">{{ item.total_p_baru || 0 }}</td>
                <td class="text-center fw-bold bg-success text-white border-end-item">{{ item.total_baru || 0 }}</td>

                <!-- Kunjungan -->
                <td class="text-center border-start-item fw-700 bg-info-soft">{{ item.total_l_kunjungan || 0 }}</td>
                <td class="text-center fw-700 bg-info-soft">{{ item.total_p_kunjungan || 0 }}</td>
                <td class="text-center fw-bold bg-info text-white">{{ item.total_kunjungan || 0 }}</td>
              </tr>
            </tbody>
            <tfoot v-if="results.length">
              <tr class="footer-row-lp fw-bold">
                <td colspan="4" class="text-center fixed-col footer-fixed">TOTAL (LAKI-LAKI & PEREMPUAN)</td>
                <template v-for="(group, key) in ageGroups" :key="'total-lp-'+key">
                  <td class="text-center border-start-item" :class="{'bg-yellow-soft': totals[key + '_l'] > 0}">{{ totals[key + '_l'] }}</td>
                  <td class="text-center" :class="{'bg-yellow-soft': totals[key + '_p'] > 0}">{{ totals[key + '_p'] }}</td>
                </template>
                <td class="text-center border-start-item bg-success-soft">{{ totals.total_l_baru }}</td>
                <td class="text-center bg-success-soft">{{ totals.total_p_baru }}</td>
                <td class="text-center bg-success text-white border-end-item fw-800" rowspan="2" style="vertical-align: middle;">{{ totals.total_baru }}</td>
                <td class="text-center border-start-item bg-info-soft">{{ totals.total_l_kunjungan }}</td>
                <td class="text-center bg-info-soft">{{ totals.total_p_kunjungan }}</td>
                <td class="text-center bg-info text-white fw-800" rowspan="2" style="vertical-align: middle;">{{ totals.total_kunjungan }}</td>
              </tr>
              <tr class="footer-row-combined fw-800">
                <td colspan="4" class="text-center fixed-col footer-fixed bg-light">JUMLAH (L + P)</td>
                <template v-for="(group, key) in ageGroups" :key="'sum-'+key">
                  <td colspan="2" class="text-center border-start-item bg-primary-soft text-primary">
                    {{ totals[key + '_l'] + totals[key + '_p'] }}
                  </td>
                </template>
                <td colspan="2" class="text-center border-start-item bg-success text-white">
                  {{ totals.total_l_baru + totals.total_p_baru }}
                </td>
                <td colspan="2" class="text-center border-start-item bg-info text-white">
                  {{ totals.total_l_kunjungan + totals.total_p_kunjungan }}
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
          <div v-else v-for="(item, index) in results" :key="item.kd_penyakit" class="mobile-item p-3 border-bottom shadow-sm mb-2 mx-2 rounded-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-dark rounded-circle" style="width:24px; height:24px; display:flex; align-items:center; justify-content:center">{{ index + 1 }}</span>
                <span class="badge bg-info-soft text-info fw-700">{{ item.kd_penyakit }}</span>
              </div>
              <div class="d-flex flex-column align-items-end">
                <button @click="openDetail(item)" class="btn btn-sm btn-primary rounded-pill px-3 mb-1">
                  <i class="fas fa-eye me-1"></i>Detail
                </button>
              </div>
            </div>
            <h6 class="mb-3 fw-bold">{{ item.nm_penyakit }}</h6>
            <div class="d-flex gap-2 mb-3">
                <span class="badge bg-success rounded-pill px-3">Baru: {{ item.total_baru }}</span>
                <span class="badge bg-info rounded-pill px-3">Kunjungan: {{ item.total_kunjungan }}</span>
            </div>
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

    <!-- Detail Modal -->
    <div class="modal fade show" v-if="showDetailModal" tabindex="-1" style="display: block; background: rgba(15, 23, 42, 0.6); z-index: 1060;">
      <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered px-3">
        <div class="modal-content border-0 elevation-lg overflow-hidden" style="border-radius: 20px;">
          <div class="modal-header border-0 bg-primary-gradient text-white p-4">
            <div>
              <h5 class="modal-title fw-800 mb-1 d-flex align-items-center">
                <i class="fas fa-users-viewfinder me-3 fa-lg"></i>
                Detail Pasien
              </h5>
              <p class="mb-0 opacity-90 small fw-500">{{ selectedDisease.kd_penyakit }} &bull; {{ selectedDisease.nm_penyakit }}</p>
            </div>
            <button type="button" class="btn-close btn-close-white shadow-none opacity-100" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body p-0 custom-scrollbar">
            <div v-if="loadingDetail" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted fw-500">Mengambil data detail...</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light sticky-top">
                  <tr>
                    <th class="ps-4">Tgl. Registrasi</th>
                    <th>No. RM</th>
                    <th>Nama Pasien</th>
                    <th class="text-center">JK</th>
                    <th>Umur</th>
                    <th>Poliklinik</th>
                    <th>Dokter</th>
                    <th class="text-center pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in detailResults" :key="p.no_rawat" class="small">
                    <td class="ps-4">
                      <div class="fw-bold">{{ p.tgl_registrasi }}</div>
                      <div class="text-muted smallest">{{ p.jam_reg }}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">{{ p.no_rkm_medis }}</span></td>
                    <td class="fw-600">{{ p.nm_pasien }}</td>
                    <td class="text-center">
                      <i v-if="p.jk === 'L'" class="fas fa-mars text-info"></i>
                      <i v-else class="fas fa-venus text-pink"></i>
                    </td>
                    <td>{{ p.umurdaftar }} {{ p.sttsumur }}</td>
                    <td>{{ p.nm_poli }}</td>
                    <td>{{ p.nm_dokter }}</td>
                    <td class="text-center pe-4">
                      <span v-if="p.is_kasus_baru" class="badge bg-success-soft text-success rounded-pill px-3">Kasus Baru</span>
                      <span v-else class="badge bg-info-soft text-info rounded-pill px-3">Lama</span>
                    </td>
                  </tr>
                  <tr v-if="!detailResults.length">
                    <td colspan="8" class="text-center py-4 text-muted">Tidak ada rincian data ditemukan</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 p-3">
            <button type="button" class="btn btn-dark rounded-pill px-4 shadow-none" @click="showDetailModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { morbiditasRalanService } from '@/services/laporan/morbiditasRalanService'
import { dokterService } from '@/services/dokterService'
import * as XLSX from 'xlsx'

const loading = ref(false)
const loadingDetail = ref(false)
const viewMode = ref('table') 
const results = ref([])
const ageGroups = ref({})
const specialties = ref([])
const showDetailModal = ref(false)
const detailResults = ref([])
const selectedDisease = ref({})

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
    total_l_baru: 0,
    total_p_baru: 0,
    total_baru: 0,
    total_l_kunjungan: 0,
    total_p_kunjungan: 0,
    total_kunjungan: 0
  }
  
  Object.keys(ageGroups.value).forEach(key => {
    t[key + '_l'] = 0
    t[key + '_p'] = 0
  })

  results.value.forEach(item => {
    t.total_l_baru += parseInt(item.total_l_baru || 0)
    t.total_p_baru += parseInt(item.total_p_baru || 0)
    t.total_baru += parseInt(item.total_baru || 0)
    t.total_l_kunjungan += parseInt(item.total_l_kunjungan || 0)
    t.total_p_kunjungan += parseInt(item.total_p_kunjungan || 0)
    t.total_kunjungan += parseInt(item.total_kunjungan || 0)
    
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
    const response = await morbiditasRalanService.getData(params)
    if (response.data.success) {
      results.value = response.data.data.results
      ageGroups.value = response.data.data.age_groups
    }
  } catch (error) {
    console.error('Error loading ralan morbiditas data:', error)
  } finally {
    loading.value = false
  }
}

const openDetail = async (item) => {
  selectedDisease.value = item
  showDetailModal.value = true
  loadingDetail.value = true
  detailResults.value = []
  
  try {
    const response = await morbiditasRalanService.getDetails({
      kd_penyakit: item.kd_penyakit,
      month: filters.month,
      year: filters.year,
      kd_sps: filters.kd_sps
    })
    
    if (response.data.success) {
      detailResults.value = response.data.data.results
    }
  } catch (error) {
    console.error('Error loading detail patients:', error)
  } finally {
    loadingDetail.value = false
  }
}

const exportToExcel = () => {
  const wsData = []
  const h1 = ["No.", "Kode ICD-10", "Diagnosis Penyakit"]
  const h2 = ["", "", ""]
  
  Object.values(ageGroups.value).forEach(group => {
    h1.push(group.label, "")
    h2.push("Laki-Laki", "Perempuan")
  })
  
  h1.push("Kasus Baru L", "Kasus Baru P", "Total Baru", "Kunjungan L", "Kunjungan P", "Total Kunjungan")
  h2.push("", "", "", "", "", "")
  
  wsData.push(["LAPORAN MORBIDITAS RAWAT JALAN"])
  wsData.push([`Periode: ${months[parseInt(filters.month) - 1]} ${filters.year}`])
  wsData.push([])
  wsData.push(h1)
  wsData.push(h2)
  
  results.value.forEach((item, index) => {
    const row = [index + 1, item.kd_penyakit, item.nm_penyakit]
    Object.keys(ageGroups.value).forEach(key => {
      row.push(item[key + '_l'] || 0, item[key + '_p'] || 0)
    })
    row.push(item.total_l_baru || 0, item.total_p_baru || 0, item.total_baru || 0, 
             item.total_l_kunjungan || 0, item.total_p_kunjungan || 0, item.total_kunjungan || 0)
    wsData.push(row)
  })
  
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } },
  ]
  
  let colIdx = 3
  Object.keys(ageGroups.value).forEach(() => {
    merges.push({ s: { r: 3, c: colIdx }, e: { r: 3, c: colIdx + 1 } })
    colIdx += 2
  })
  
  ws['!merges'] = merges
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Morbiditas Ralan")
  const filename = filters.mode === 'tahunan' 
    ? `Morbiditas_Ralan_${filters.year}.xlsx` 
    : `Morbiditas_Ralan_${filters.month}_${filters.year}.xlsx`
  XLSX.writeFile(wb, filename)
}

onMounted(() => {
  loadSpecialties()
  loadData()
})
</script>

<style scoped>
.morbiditas-ralan-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 0 0 40px 40px;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2);
}

.bg-primary-gradient {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.page-title { color: white; font-weight: 800; font-size: 1.75rem; }
.page-subtitle { color: rgba(255,255,255,0.7); font-size: 0.95rem; }

.header-filters {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}

.filter-label { color: white; font-size: 0.65rem; font-weight: 700; margin-bottom: 4px; display: block; }
.form-select-modern {
  background: rgba(255,255,255,0.95);
  border: 0; border-radius: 12px; padding: 0.6rem 1rem; font-weight: 600; font-size: 0.9rem; color: #1e293b;
}

.btn-refresh-modern {
  background: #3b82f6; color: white; border: 0; border-radius: 12px; padding: 0.6rem 1.5rem;
  font-weight: 700; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); transition: all 0.3s;
}

.rounded-12 { border-radius: 12px; }
.transition-all { transition: all 0.2s ease; }
.btn-primary.shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }

.btn-refresh-modern:hover { transform: translateY(-2px); filter: brightness(1.1); }

.report-card { border-radius: 24px; background: white; overflow: hidden; box-shadow: 0 4px 25px rgba(0,0,0,0.05); }

.bg-primary-soft { background-color: #f1f5f9; }
.bg-success-soft { background-color: #f0fdf4; }
.bg-danger-soft { background-color: #fef2f2; }
.bg-info-soft { background-color: #ecf8ff; }
.text-pink { color: #db2777; }
.smallest { font-size: 0.7rem; }
.fw-600 { font-weight: 600; }
.fw-800 { font-weight: 800; }

.table-responsive-modern { max-height: 70vh; overflow-y: auto; font-size: 0.85rem; }
.sticky-thead { position: sticky; top: 0; z-index: 100; }
.header-row-1 th { background: #f8fafc; font-weight: 800; border-bottom: 0 !important; }
.age-group-header { background: #f1f5f9; font-weight: 700; font-size: 0.75rem; color: #475569; border-left: 1px solid #e2e8f0 !important; }
.gender-header { font-weight: 800; background: #fff; border-bottom: 2px solid #e2e8f0 !important; }
.male { color: #3b82f6; border-left: 1px solid #e2e8f0 !important; }
.female { color: #db2777; }

.fixed-col {
  position: sticky !important;
  left: 0;
  z-index: 20;
  background-color: #ffffff !important; 
  border-right: 1px solid #e2e8f0 !important;
}

.fixed-col:nth-of-type(4) {
  border-right: 2px solid #cbd5e1 !important;
  box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1);
}

thead .header-fixed {
  z-index: 150 !important;
  background-color: #f1f5f9 !important;
  border-bottom: 2px solid #e2e8f0 !important;
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
.footer-row-lp .bg-success-soft { background-color: #f0fdf4 !important; }
.footer-row-lp .bg-info-soft { background-color: #ecf8ff !important; }

.footer-row-combined .bg-primary-soft { background-color: #eef2ff !important; }
.footer-row-combined .bg-success { background-color: #198754 !important; }
.footer-row-combined .bg-info { background-color: #0dcaf0 !important; }

.bg-yellow-soft { background-color: #fffbeb; }

.data-row td { border-color: #f1f5f9; padding: 0.75rem 0.5rem; }
.data-row:hover td { background: #f8fafc; }
.data-row:hover .fixed-col { background-color: #f8fafc !important; }

.val-nonzero { color: #1e293b; font-weight: 700; background: #fffcf0; }
.border-start-item { border-left: 1.5px solid #e2e8f0 !important; }
.border-end-item { border-right: 1.5px solid #e2e8f0 !important; }
.penyakit-name { font-weight: 600; color: #1e293b; display: block; }

.age-summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
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
