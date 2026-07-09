<template>
  <div class="carabayar-rl319-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-wallet"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">RL 3.19 - Cara Bayar</h3>
            <p class="page-subtitle mb-0 small">Laporan Kunjungan Rumah Sakit Berdasarkan Cara Pembayaran/Penjamin</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <!-- Tahun -->
          <div class="col-lg-10 col-md-12">
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
          <h5 class="mb-0 fw-bold text-dark">Data Kunjungan RL 3.19</h5>
        </div>
      </div>
      
      <div class="card-body p-0 chart-and-table-container">
        <div class="table-responsive-modern custom-scrollbar">
          <table class="table table-hover table-bordered mb-0 align-middle">
            <thead class="sticky-thead">
              <tr class="header-row-1">
                <th rowspan="2" class="text-center align-middle fixed-col header-fixed" style="width: 50px; min-width: 50px;">No.</th>
                <th rowspan="2" class="text-center align-middle fixed-col header-fixed" style="left: 50px; min-width: 80px;">No. Cara Bayar</th>
                <th rowspan="2" class="text-center align-middle fixed-col header-fixed" style="left: 130px; min-width: 250px;">Cara Pembayaran</th>
                <th colspan="2" class="text-center bg-primary-soft text-primary py-2 border-bottom-0 border-start-item">
                  Pasien Rawat Inap
                </th>
                <th colspan="4" class="text-center bg-success-soft text-success py-2 border-bottom-0 border-start-item border-end-item">
                  Pasien Rawat Jalan
                </th>
              </tr>
              <tr class="header-row-2">
                <th class="text-center align-middle bg-primary-soft text-primary border-start-item">Jumlah Pasien Keluar</th>
                <th class="text-center align-middle bg-primary-soft text-primary">Jumlah Lama Dirawat</th>
                <th class="text-center align-middle bg-success-soft text-success border-start-item">Jumlah Pasien Rawat Jalan</th>
                <th class="text-center align-middle bg-success-soft text-success">Laboratorium</th>
                <th class="text-center align-middle bg-success-soft text-success">Radiologi</th>
                <th class="text-center align-middle bg-success-soft text-success border-end-item">Lain-lain</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-5 border-0">
                  <div class="loading-state">
                    <div class="spinner-grow text-primary mb-3" role="status"></div>
                    <p class="text-muted fw-500">Memuat data cara bayar...</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!results.length">
                <td colspan="9" class="text-center py-5 border-0">
                  <div class="empty-state">
                    <i class="fas fa-search fa-3x text-light mb-3"></i>
                    <p class="text-muted">Tidak ada data untuk periode terpilih</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in results" :key="index" class="data-row">
                <td class="text-center fixed-col" style="width: 50px; min-width: 50px;">{{ index + 1 }}</td>
                <td class="text-center fixed-col" style="left: 50px; min-width: 80px;">{{ item.no_cara_bayar }}</td>
                <td class="fixed-col text-truncate shadow-right" style="left: 130px; min-width: 250px;">
                  <span class="penyakit-name">{{ item.cara_pembayaran }}</span>
                </td>
                
                <!-- Inpatients -->
                <td class="text-center border-start-item" :class="{ 'cursor-pointer': item.ranap_keluar > 0 }" @click="item.ranap_keluar > 0 ? openDetail(item.no_cara_bayar, item.cara_pembayaran, 'ranap_keluar', 'Pasien Rawat Inap - Jumlah Pasien Keluar') : null">
                  <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-primary fw-bold text-decoration-underline': item.ranap_keluar > 0 }" disabled>{{ item.ranap_keluar }}</div>
                </td>
                <td class="text-center" :class="{ 'cursor-pointer': item.ranap_lama > 0 }" @click="item.ranap_lama > 0 ? openDetail(item.no_cara_bayar, item.cara_pembayaran, 'ranap_lama', 'Pasien Rawat Inap - Jumlah Lama Dirawat') : null">
                  <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-primary fw-bold text-decoration-underline': item.ranap_lama > 0 }" disabled>{{ item.ranap_lama }}</div>
                </td>
                
                <!-- Outpatients -->
                <td class="text-center border-start-item" :class="{ 'cursor-pointer': item.ralan_total > 0 }" @click="item.ralan_total > 0 ? openDetail(item.no_cara_bayar, item.cara_pembayaran, 'ralan_total', 'Pasien Rawat Jalan - Jumlah Pasien Rawat Jalan') : null">
                  <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-success fw-bold text-decoration-underline': item.ralan_total > 0 }" disabled>{{ item.ralan_total }}</div>
                </td>
                <td class="text-center" :class="{ 'cursor-pointer': item.ralan_lab > 0 }" @click="item.ralan_lab > 0 ? openDetail(item.no_cara_bayar, item.cara_pembayaran, 'ralan_lab', 'Pasien Rawat Jalan - Laboratorium') : null">
                  <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-success fw-bold text-decoration-underline': item.ralan_lab > 0 }" disabled>{{ item.ralan_lab }}</div>
                </td>
                <td class="text-center" :class="{ 'cursor-pointer': item.ralan_radiologi > 0 }" @click="item.ralan_radiologi > 0 ? openDetail(item.no_cara_bayar, item.cara_pembayaran, 'ralan_radiologi', 'Pasien Rawat Jalan - Radiologi') : null">
                  <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-success fw-bold text-decoration-underline': item.ralan_radiologi > 0 }" disabled>{{ item.ralan_radiologi }}</div>
                </td>
                <td class="text-center border-end-item" :class="{ 'cursor-pointer': item.ralan_lain > 0 }" @click="item.ralan_lain > 0 ? openDetail(item.no_cara_bayar, item.cara_pembayaran, 'ralan_lain', 'Pasien Rawat Jalan - Lain-lain') : null">
                  <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-success fw-bold text-decoration-underline': item.ralan_lain > 0 }" disabled>{{ item.ralan_lain }}</div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="results.length">
              <tr class="footer-row-combined fw-800">
                <td colspan="3" class="text-center fixed-col footer-fixed bg-light">TOTAL KESELURUHAN</td>
                <td class="text-center border-start-item bg-primary-soft text-primary">{{ totals.ranap_keluar }}</td>
                <td class="text-center bg-primary-soft text-primary">{{ totals.ranap_lama }}</td>
                <td class="text-center border-start-item bg-success-soft text-success">{{ totals.ralan_total }}</td>
                <td class="text-center bg-success-soft text-success">{{ totals.ralan_lab }}</td>
                <td class="text-center bg-success-soft text-success">{{ totals.ralan_radiologi }}</td>
                <td class="text-center border-end-item bg-success-soft text-success">{{ totals.ralan_lain }}</td>
              </tr>
            </tfoot>
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
                <i class="fas fa-search-location text-primary"></i>
              </div>
              <div>
                <h5 class="modal-title fw-800 mb-1">Detail Kunjungan Pasien</h5>
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
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light sticky-top">
                  <tr>
                    <th class="ps-4">No. Rawat / Tgl</th>
                    <th>No. RM</th>
                    <th>Nama Pasien</th>
                    <th class="text-center">JK</th>
                    <th>Penjamin (Asli)</th>
                    <th class="pe-4">Poli / Bangsal</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in paginatedDetailData" :key="i" class="small">
                    <td class="ps-4">
                      <div class="fw-bold text-primary">{{ p.no_rawat }}</div>
                      <div class="text-muted smallest">{{ p.tanggal }}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">{{ p.no_rkm_medis }}</span></td>
                    <td class="fw-600 text-dark">{{ p.nm_pasien }}</td>
                    <td class="text-center">
                      <i v-if="p.jk === 'L'" class="fas fa-mars text-info"></i>
                      <i v-else class="fas fa-venus text-pink"></i>
                    </td>
                    <td>{{ p.asal_rujukan }}</td>
                    <td class="pe-4">{{ p.tujuan_rujukan }}</td>
                    <td>
                      <span class="badge bg-light text-secondary border px-2 py-1 rounded-pill">{{ p.keterangan }}</span>
                    </td>
                  </tr>
                  <tr v-if="!detailData.length">
                    <td colspan="7" class="text-center py-4 text-muted">Tidak ada rincian data ditemukan</td>
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
                <option :value="100">100 / hal</option>
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
import { ref, computed, reactive, onMounted } from 'vue'
import { caraBayarRl319Service } from '@/services/laporan/caraBayarRl319Service'
import Swal from 'sweetalert2'

const loading = ref(false)
const results = ref([])

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

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i)

const filters = reactive({
  year: String(currentYear),
})

const totals = computed(() => {
  const t = {
    ranap_keluar: 0,
    ranap_lama: 0,
    ralan_total: 0,
    ralan_lab: 0,
    ralan_radiologi: 0,
    ralan_lain: 0
  }
  
  results.value.forEach(item => {
    t.ranap_keluar += parseInt(item.ranap_keluar || 0)
    t.ranap_lama += parseInt(item.ranap_lama || 0)
    t.ralan_total += parseInt(item.ralan_total || 0)
    t.ralan_lab += parseInt(item.ralan_lab || 0)
    t.ralan_radiologi += parseInt(item.ralan_radiologi || 0)
    t.ralan_lain += parseInt(item.ralan_lain || 0)
  })
  
  return t
})

const loadData = async () => {
  if (!filters.year) return;
  
  loading.value = true
  try {
    const params = {
      year: filters.year
    }
    const response = await caraBayarRl319Service.getData(params)
    if (response.data.success) {
      results.value = response.data.message
    }
  } catch (error) {
    console.error('Error loading cara bayar rl 3.19 data:', error)
    Swal.fire('Error', 'Gagal memuat data cara bayar', 'error')
  } finally {
    loading.value = false
  }
}

const openDetail = async (no_cara_bayar, cara_pembayaran, tipe, titleDesc) => {
  if (!filters.year) return;
  
  detailTitle.value = `${cara_pembayaran} - ${titleDesc}`
  showDetailModal.value = true
  detailLoading.value = true
  detailData.value = []
  detailCurrentPage.value = 1
  
  try {
    const params = {
      year: filters.year,
      no_cara_bayar: no_cara_bayar,
      tipe: tipe
    }
    
    const response = await caraBayarRl319Service.getDetail(params)
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.carabayar-rl319-container {
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

.bg-primary-soft { background-color: #eff6ff !important; color: #3b82f6 !important; }
.bg-success-soft { background-color: #ecfdf5 !important; color: #059669 !important; }
.bg-info-soft { background-color: #f0f9ff !important; color: #0284c7 !important; }
.fw-800 { font-weight: 800; }
.fw-600 { font-weight: 600; }
.smallest { font-size: 0.7rem; }
.text-pink { color: #db2777; }
.cursor-pointer { cursor: pointer; }

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

.header-row-1 th, .header-row-2 th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-color: #e2e8f0 !important;
  vertical-align: middle;
  text-align: center;
}

.fixed-col {
  position: sticky !important;
  left: 0;
  z-index: 20;
  background-color: #ffffff !important; 
  border-right: 1px solid #e2e8f0 !important;
  border-color: #e2e8f0 !important;
}

.fixed-col:nth-of-type(2) {
  left: 50px !important;
}

.fixed-col:nth-of-type(3) {
  left: 130px !important;
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
  z-index: 200 !important;
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

.footer-row-combined td {
  padding: 0.75rem 0.5rem;
  border-top: 2px solid #cbd5e1 !important;
  border-bottom: 2px solid #cbd5e1 !important;
  background-color: #ffffff !important;
  font-size: 0.9rem;
  border-color: #cbd5e1 !important;
}

.footer-row-combined .bg-primary-soft { background-color: #eff6ff !important; color: #3b82f6 !important; }
.footer-row-combined .bg-success-soft { background-color: #ecfdf5 !important; color: #059669 !important; }

.data-row td { 
  border-color: #f1f5f9;
  padding: 0.75rem 0.5rem;
}

.data-row:hover td { background: #f8fafc; }
.data-row:hover .fixed-col { background-color: #f8fafc !important; }

.border-start-item { border-left: 1.5px solid #e2e8f0 !important; }
.border-end-item { border-right: 1.5px solid #e2e8f0 !important; }
.penyakit-name {
  font-weight: 600;
  color: #1e293b;
  display: block;
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

@media (max-width: 768px) {
  .page-header { border-radius: 0; margin-bottom: 0; }
  .report-card { border-radius: 0; border: 0; }
  .btn-refresh-custom {
    width: 100%;
  }
}
</style>
