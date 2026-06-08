<template>
  <div class="rujukan-rl310-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">RL 3.10 - Rujukan</h3>
            <p class="page-subtitle mb-0 small">Laporan Rujukan Masuk dan Keluar Berdasarkan Spesialisasi</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <!-- Bulan -->
          <div class="col-lg-5 col-md-6">
            <label class="filter-label"><i class="fas fa-calendar-alt me-1 text-primary"></i> Bulan</label>
            <select v-model="filters.month" class="form-select form-select-sm modern-select">
              <option v-for="(name, index) in months" :key="index" :value="String(index + 1).padStart(2, '0')">
                {{ name }}
              </option>
            </select>
          </div>

          <!-- Tahun -->
          <div class="col-lg-5 col-md-6">
            <label class="filter-label"><i class="fas fa-calendar me-1 text-primary"></i> Tahun</label>
            <select v-model="filters.year" class="form-select form-select-sm modern-select">
              <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
            </select>
          </div>

          <!-- Refresh Button -->
          <div class="col-lg-2 col-md-12 d-grid">
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
          <h5 class="mb-0 fw-bold text-dark">Data Rujukan RL 3.10</h5>
        </div>
      </div>
      
      <div class="card-body p-0 chart-and-table-container">
        <div class="table-responsive custom-scrollbar">
          <table class="table table-bordered table-hover rl-table mb-0 align-middle">
            <thead>
              <tr>
                <th rowspan="3" class="align-middle text-center" style="min-width: 200px;">Jenis Spesialisasi</th>
                <th colspan="8" class="text-center">Rujukan Masuk</th>
                <th colspan="4" rowspan="2" class="align-middle text-center">Dirujuk Keluar</th>
              </tr>
              <tr>
                <th colspan="4" class="text-center">Diterima Dari</th>
                <th colspan="4" class="text-center">Dikembalikan Ke</th>
              </tr>
              <tr>
                <!-- Diterima Dari -->
                <th class="text-center">Puskesmas</th>
                <th class="text-center">RS Lain</th>
                <th class="text-center">Faskes Lain</th>
                <th class="text-center bg-light fw-bold">Total Rujukan Masuk</th>
                
                <!-- Dikembalikan Ke -->
                <th class="text-center">Puskesmas</th>
                <th class="text-center">RS Asal</th>
                <th class="text-center">Faskes Lain</th>
                <th class="text-center bg-light fw-bold">Total Rujukan Masuk Dikembalikan</th>
                
                <!-- Dirujuk Keluar -->
                <th class="text-center">Pasien Rujukan</th>
                <th class="text-center">Pasien Datang Sendiri</th>
                <th class="text-center bg-light fw-bold">Total Dirujuk Keluar</th>
                <th class="text-center">Diterima Kembali</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="13" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2 mb-0 text-muted">Mengambil data dari server...</p>
                </td>
              </tr>
              <tr v-else-if="!loading && data.length === 0">
                <td colspan="13" class="text-center py-5 text-muted">
                  Tidak ada data rujukan untuk periode ini.
                </td>
              </tr>
              <template v-else>
                <tr v-for="(item, index) in data" :key="index">
                  <td class="fw-medium text-nowrap">{{ item.spesialisasi }}</td>
                  
                  <!-- Diterima Dari -->
                  <td class="text-center" :class="{ 'cursor-pointer text-primary text-decoration-underline': item.rujuk_masuk.diterima_dari.puskesmas > 0 }" @click="item.rujuk_masuk.diterima_dari.puskesmas > 0 ? openDetail(item.spesialisasi, 'masuk_puskesmas', 'Rujukan Masuk - Diterima Dari Puskesmas') : null">{{ item.rujuk_masuk.diterima_dari.puskesmas }}</td>
                  <td class="text-center" :class="{ 'cursor-pointer text-primary text-decoration-underline': item.rujuk_masuk.diterima_dari.rs_lain > 0 }" @click="item.rujuk_masuk.diterima_dari.rs_lain > 0 ? openDetail(item.spesialisasi, 'masuk_rs_lain', 'Rujukan Masuk - Diterima Dari RS Lain') : null">{{ item.rujuk_masuk.diterima_dari.rs_lain }}</td>
                  <td class="text-center" :class="{ 'cursor-pointer text-primary text-decoration-underline': item.rujuk_masuk.diterima_dari.faskes_lain > 0 }" @click="item.rujuk_masuk.diterima_dari.faskes_lain > 0 ? openDetail(item.spesialisasi, 'masuk_faskes_lain', 'Rujukan Masuk - Diterima Dari Faskes Lain') : null">{{ item.rujuk_masuk.diterima_dari.faskes_lain }}</td>
                  <td class="text-center bg-light fw-bold text-primary" :class="{ 'cursor-pointer text-decoration-underline': item.rujuk_masuk.diterima_dari.total > 0 }" @click="item.rujuk_masuk.diterima_dari.total > 0 ? openDetail(item.spesialisasi, 'masuk_total', 'Total Rujukan Masuk') : null">{{ item.rujuk_masuk.diterima_dari.total }}</td>
                  
                  <!-- Dikembalikan Ke -->
                  <td class="text-center" :class="{ 'cursor-pointer text-info text-decoration-underline': item.rujuk_masuk.dikembalikan_ke.puskesmas > 0 }" @click="item.rujuk_masuk.dikembalikan_ke.puskesmas > 0 ? openDetail(item.spesialisasi, 'kembali_puskesmas', 'Dikembalikan Ke Puskesmas') : null">{{ item.rujuk_masuk.dikembalikan_ke.puskesmas }}</td>
                  <td class="text-center" :class="{ 'cursor-pointer text-info text-decoration-underline': item.rujuk_masuk.dikembalikan_ke.rs_asal > 0 }" @click="item.rujuk_masuk.dikembalikan_ke.rs_asal > 0 ? openDetail(item.spesialisasi, 'kembali_rs_asal', 'Dikembalikan Ke RS Asal') : null">{{ item.rujuk_masuk.dikembalikan_ke.rs_asal }}</td>
                  <td class="text-center" :class="{ 'cursor-pointer text-info text-decoration-underline': item.rujuk_masuk.dikembalikan_ke.faskes_lain > 0 }" @click="item.rujuk_masuk.dikembalikan_ke.faskes_lain > 0 ? openDetail(item.spesialisasi, 'kembali_faskes_lain', 'Dikembalikan Ke Faskes Lain') : null">{{ item.rujuk_masuk.dikembalikan_ke.faskes_lain }}</td>
                  <td class="text-center bg-light fw-bold text-info" :class="{ 'cursor-pointer text-decoration-underline': item.rujuk_masuk.dikembalikan_ke.total > 0 }" @click="item.rujuk_masuk.dikembalikan_ke.total > 0 ? openDetail(item.spesialisasi, 'kembali_total', 'Total Dikembalikan Ke Faskes/RS Asal') : null">{{ item.rujuk_masuk.dikembalikan_ke.total }}</td>
                  
                  <!-- Dirujuk Keluar -->
                  <td class="text-center" :class="{ 'cursor-pointer text-danger text-decoration-underline': item.dirujuk_keluar.pasien_rujukan > 0 }" @click="item.dirujuk_keluar.pasien_rujukan > 0 ? openDetail(item.spesialisasi, 'keluar_pasien_rujukan', 'Dirujuk Keluar - Pasien Rujukan') : null">{{ item.dirujuk_keluar.pasien_rujukan }}</td>
                  <td class="text-center" :class="{ 'cursor-pointer text-danger text-decoration-underline': item.dirujuk_keluar.pasien_datang_sendiri > 0 }" @click="item.dirujuk_keluar.pasien_datang_sendiri > 0 ? openDetail(item.spesialisasi, 'keluar_pasien_datang_sendiri', 'Dirujuk Keluar - Pasien Datang Sendiri') : null">{{ item.dirujuk_keluar.pasien_datang_sendiri }}</td>
                  <td class="text-center bg-light fw-bold text-danger" :class="{ 'cursor-pointer text-decoration-underline': item.dirujuk_keluar.total > 0 }" @click="item.dirujuk_keluar.total > 0 ? openDetail(item.spesialisasi, 'keluar_total', 'Total Dirujuk Keluar') : null">{{ item.dirujuk_keluar.total }}</td>
                  <td class="text-center text-muted">{{ item.dirujuk_keluar.diterima_kembali }}</td>
                </tr>
                
                <!-- Grand Total Row -->
                <tr class="table-dark fw-bold">
                  <td class="text-end">TOTAL KESELURUHAN</td>
                  
                  <td class="text-center">{{ grandTotals.rm_diterima_puskesmas }}</td>
                  <td class="text-center">{{ grandTotals.rm_diterima_rs_lain }}</td>
                  <td class="text-center">{{ grandTotals.rm_diterima_faskes_lain }}</td>
                  <td class="text-center text-warning fs-5">{{ grandTotals.rm_diterima_total }}</td>
                  
                  <td class="text-center">{{ grandTotals.rm_dikembalikan_puskesmas }}</td>
                  <td class="text-center">{{ grandTotals.rm_dikembalikan_rs_asal }}</td>
                  <td class="text-center">{{ grandTotals.rm_dikembalikan_faskes_lain }}</td>
                  <td class="text-center text-info fs-5">{{ grandTotals.rm_dikembalikan_total }}</td>
                  
                  <td class="text-center">{{ grandTotals.rk_pasien_rujukan }}</td>
                  <td class="text-center">{{ grandTotals.rk_pasien_datang_sendiri }}</td>
                  <td class="text-center text-danger fs-5">{{ grandTotals.rk_total }}</td>
                  <td class="text-center">{{ grandTotals.rk_diterima_kembali }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal fade show" v-if="showDetailModal" tabindex="-1" style="display: block; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(4px); z-index: 1060;">
      <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered px-3">
        <div class="modal-content border-0 shadow-lg overflow-hidden" style="border-radius: 16px;">
          <div class="modal-header border-bottom bg-white p-4">
            <div class="d-flex align-items-center gap-3">
              <div class="header-icon-circle">
                <i class="fas fa-exchange-alt text-primary"></i>
              </div>
              <div>
                <h5 class="modal-title fw-800 mb-1">Detail Pasien Rujukan</h5>
                <p class="mb-0 text-muted small fw-500">{{ detailTitle }}</p>
              </div>
            </div>
            <button type="button" class="btn-close-custom shadow-none border-0" @click="showDetailModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body p-0 custom-scrollbar">
            <div v-if="detailLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted fw-500">Mengambil data detail...</p>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover bg-white mb-0 align-middle">
                <thead class="bg-light sticky-top">
                  <tr>
                    <th class="ps-4">NO</th>
                    <th>TANGGAL</th>
                    <th>NO RAWAT / RM</th>
                    <th>NAMA PASIEN</th>
                    <th class="text-center">JK</th>
                    <th>ASAL / TUJUAN</th>
                    <th class="pe-4 text-end">KETERANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in paginatedDetailData" :key="i" class="small">
                    <td class="ps-4 text-muted">{{ (detailCurrentPage - 1) * detailItemsPerPage + i + 1 }}</td>
                    <td class="text-nowrap">{{ p.tanggal }}</td>
                    <td>
                      <div class="fw-medium text-primary">{{ p.no_rawat }}</div>
                      <div class="text-muted" style="font-size: 0.8rem;">{{ p.no_rkm_medis }}</div>
                    </td>
                    <td class="fw-medium text-dark">{{ p.nm_pasien }}</td>
                    <td class="text-center">{{ p.jk }}</td>
                    <td>
                      <div class="text-muted" style="font-size: 0.75rem;" v-if="p.asal_rujukan && p.asal_rujukan !== '-'">Asal: <span class="fw-medium text-dark">{{ p.asal_rujukan }}</span></div>
                      <div class="text-muted" style="font-size: 0.75rem;" v-if="p.tujuan_rujukan && p.tujuan_rujukan !== '-'">Tujuan: <span class="fw-medium text-dark">{{ p.tujuan_rujukan }}</span></div>
                    </td>
                    <td class="pe-4 text-end">
                      <span class="badge bg-light text-secondary border px-2 py-1 rounded-pill">{{ p.keterangan }}</span>
                    </td>
                  </tr>
                  <tr v-if="!detailData.length">
                    <td colspan="7" class="text-center py-5 text-muted">Tidak ada data detail.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="modal-footer bg-light border-0 p-3 d-flex justify-content-between align-items-center custom-modal-footer">
            <div class="d-flex align-items-center gap-2" v-if="detailData.length > 0">
              <span class="small text-muted">Halaman {{ detailCurrentPage }} dari {{ detailTotalPages }}</span>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" :disabled="detailCurrentPage === 1" @click="detailCurrentPage--">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button class="btn btn-outline-secondary" :disabled="detailCurrentPage === detailTotalPages" @click="detailCurrentPage++">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              <select class="form-select form-select-sm w-auto ms-2" v-model="detailItemsPerPage" @change="detailCurrentPage = 1">
                <option :value="10">10 / hal</option>
                <option :value="25">25 / hal</option>
                <option :value="50">50 / hal</option>
              </select>
            </div>
            <div v-else></div>
            <button type="button" class="btn btn-secondary rounded-pill px-4 shadow-none border-0" @click="showDetailModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'

const data = ref([])
const loading = ref(false)

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const filters = ref({
  year: String(currentYear),
  month: String(new Date().getMonth() + 1).padStart(2, '0')
})

const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailData = ref([])
const detailTitle = ref('')
const detailCurrentPage = ref(1)
const detailItemsPerPage = ref(10)

const detailTotalPages = computed(() => Math.ceil(detailData.value.length / detailItemsPerPage.value))
const paginatedDetailData = computed(() => {
  const start = (detailCurrentPage.value - 1) * detailItemsPerPage.value
  const end = start + parseInt(detailItemsPerPage.value)
  return detailData.value.slice(start, end)
})

const loadData = async () => {
  loading.value = true
  try {
    const response = await api.get('/laporan/rl3-10-rujukan', { params: filters.value })
    if (response.data.success) {
      data.value = response.data.message
    }
  } catch (error) {
    console.error('Failed to load RL 3.10 data', error)
    Swal.fire('Error', 'Gagal memuat data rujukan', 'error')
  } finally {
    loading.value = false
  }
}

const openDetail = async (spesialisasi, tipe, titleDesc) => {
  detailTitle.value = `${spesialisasi} - ${titleDesc}`
  showDetailModal.value = true
  detailLoading.value = true
  detailData.value = []
  detailCurrentPage.value = 1
  
  try {
    const params = {
      year: filters.value.year,
      month: filters.value.month,
      spesialisasi: spesialisasi,
      tipe: tipe
    }
    const response = await api.get('/laporan/rl3-10-rujukan/detail', { params })
    if (response.data.success) {
      detailData.value = response.data.message
    }
  } catch (error) {
    console.error('Error loading detail:', error)
    Swal.fire('Error', 'Gagal memuat detail data', 'error')
  } finally {
    detailLoading.value = false
  }
}

const grandTotals = computed(() => {
  const totals = {
    rm_diterima_puskesmas: 0,
    rm_diterima_rs_lain: 0,
    rm_diterima_faskes_lain: 0,
    rm_diterima_total: 0,
    rm_dikembalikan_puskesmas: 0,
    rm_dikembalikan_rs_asal: 0,
    rm_dikembalikan_faskes_lain: 0,
    rm_dikembalikan_total: 0,
    rk_pasien_rujukan: 0,
    rk_pasien_datang_sendiri: 0,
    rk_total: 0,
    rk_diterima_kembali: 0,
  }

  data.value.forEach(item => {
    totals.rm_diterima_puskesmas += item.rujuk_masuk.diterima_dari.puskesmas || 0
    totals.rm_diterima_rs_lain += item.rujuk_masuk.diterima_dari.rs_lain || 0
    totals.rm_diterima_faskes_lain += item.rujuk_masuk.diterima_dari.faskes_lain || 0
    totals.rm_diterima_total += item.rujuk_masuk.diterima_dari.total || 0
    
    totals.rm_dikembalikan_puskesmas += item.rujuk_masuk.dikembalikan_ke.puskesmas || 0
    totals.rm_dikembalikan_rs_asal += item.rujuk_masuk.dikembalikan_ke.rs_asal || 0
    totals.rm_dikembalikan_faskes_lain += item.rujuk_masuk.dikembalikan_ke.faskes_lain || 0
    totals.rm_dikembalikan_total += item.rujuk_masuk.dikembalikan_ke.total || 0

    totals.rk_pasien_rujukan += item.dirujuk_keluar.pasien_rujukan || 0
    totals.rk_pasien_datang_sendiri += item.dirujuk_keluar.pasien_datang_sendiri || 0
    totals.rk_total += item.dirujuk_keluar.total || 0
    totals.rk_diterima_kembali += item.dirujuk_keluar.diterima_kembali || 0
  })

  return totals
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.rujukan-rl310-container {
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

.rl-table {
  font-size: 0.85rem;
}

.rl-table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-color: #e2e8f0 !important;
  vertical-align: middle;
  text-align: center;
  padding: 0.85rem 1rem;
}

.rl-table td {
  padding: 0.85rem 1rem;
  vertical-align: middle;
  border-color: #f1f5f9;
}

.table-hover tbody tr:hover td {
  background-color: #f8fafc;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  background-color: #f0f9ff !important;
}

.table-dark {
  background-color: #1e293b !important;
  color: #ffffff !important;
}

.table-dark td {
  background-color: #1e293b !important;
  color: #ffffff !important;
  border-color: #334155 !important;
}

.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

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
</style>
