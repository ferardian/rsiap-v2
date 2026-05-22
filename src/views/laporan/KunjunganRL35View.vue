<template>
  <div class="kunjungan-rl35-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4 mt-n3 mx-n3 mt-md-n4 mx-md-n4">
      <div class="header-content d-flex flex-column flex-md-row justify-content-between align-items-md-center px-4 py-3 py-md-5">
        <div class="header-text mb-3 mb-md-0">
          <h2 class="page-title mb-1">
            <i class="fas fa-users-viewfinder me-2"></i>
            RL 3.5 - Kunjungan
          </h2>
          <p class="page-subtitle mb-0">Laporan Kunjungan Berdasarkan Poli dari Dalam Kota dan Luar Kota</p>
        </div>
        
        <div class="header-filters p-3 p-md-4">
          <div class="row g-2 align-items-end">
            <div class="col-6 col-md-auto">
              <label class="filter-label">TAHUN</label>
              <select v-model="filters.year" class="form-select-modern">
                <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
              </select>
            </div>
            <div class="col-6 col-md-auto">
              <label class="filter-label">BULAN</label>
              <select v-model="filters.month" class="form-select-modern">
                <option value="">-- PILIH BULAN --</option>
                <option v-for="(name, index) in months" :key="index" :value="String(index + 1).padStart(2, '0')">
                  {{ name }}
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
          <h5 class="mb-0 fw-bold text-dark">Data Kunjungan RL 3.5</h5>
        </div>
      </div>
      
      <div class="card-body p-0 chart-and-table-container">
        <div class="table-responsive-modern custom-scrollbar">
          <table class="table table-hover table-bordered mb-0 align-middle">
            <thead class="sticky-thead">
              <tr class="header-row-1">
                <th rowspan="2" class="text-center align-middle fixed-col header-fixed">No.</th>
                <th rowspan="2" class="text-center align-middle fixed-col header-fixed" style="left: 50px; min-width: 250px;">Jenis Kegiatan</th>
                <th colspan="2" class="text-center bg-primary-soft text-primary py-2 border-bottom-0 border-start-item">
                  Kunjungan Pasien Dalam Kota
                </th>
                <th colspan="2" class="text-center bg-success-soft text-success py-2 border-bottom-0 border-start-item border-end-item">
                  Kunjungan Pasien Luar Kota
                </th>
                <th rowspan="2" class="text-center align-middle bg-info-soft text-info">Total Kunjungan</th>
              </tr>
              <tr class="header-row-2">
                <th class="text-center align-middle bg-primary-soft text-primary border-start-item">Laki-Laki</th>
                <th class="text-center align-middle bg-primary-soft text-primary">Perempuan</th>
                <th class="text-center align-middle bg-success-soft text-success border-start-item">Laki-Laki</th>
                <th class="text-center align-middle bg-success-soft text-success border-end-item">Perempuan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5 border-0">
                  <div class="loading-state">
                    <div class="spinner-grow text-primary mb-3" role="status"></div>
                    <p class="text-muted fw-500">Memuat data kunjungan...</p>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!results.length">
                <td colspan="7" class="text-center py-5 border-0">
                  <div class="empty-state">
                    <i class="fas fa-search fa-3x text-light mb-3"></i>
                    <p class="text-muted">Tidak ada data untuk periode terpilih</p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, index) in results" :key="index" class="data-row">
                <td class="text-center fixed-col" style="width: 50px; min-width: 50px;">{{ index + 1 }}</td>
                <td class="fixed-col text-truncate shadow-right" style="left: 50px; min-width: 250px;">
                  <span class="penyakit-name">{{ item.jenis_kegiatan }}</span>
                </td>
                
                <td class="text-center border-start-item" :class="{ 'cursor-pointer': item.dalam_kota_l > 0 }" @click="item.dalam_kota_l > 0 ? openDetail(item.jenis_kegiatan, 'dalam_kota_l', 'Dalam Kota (Laki-Laki)') : null">
                    <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-primary fw-bold text-decoration-underline': item.dalam_kota_l > 0 }" disabled>{{ item.dalam_kota_l }}</div>
                </td>
                <td class="text-center" :class="{ 'cursor-pointer': item.dalam_kota_p > 0 }" @click="item.dalam_kota_p > 0 ? openDetail(item.jenis_kegiatan, 'dalam_kota_p', 'Dalam Kota (Perempuan)') : null">
                    <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-primary fw-bold text-decoration-underline': item.dalam_kota_p > 0 }" disabled>{{ item.dalam_kota_p }}</div>
                </td>
                
                <td class="text-center border-start-item" :class="{ 'cursor-pointer': item.luar_kota_l > 0 }" @click="item.luar_kota_l > 0 ? openDetail(item.jenis_kegiatan, 'luar_kota_l', 'Luar Kota (Laki-Laki)') : null">
                    <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-success fw-bold text-decoration-underline': item.luar_kota_l > 0 }" disabled>{{ item.luar_kota_l }}</div>
                </td>
                <td class="text-center border-end-item" :class="{ 'cursor-pointer': item.luar_kota_p > 0 }" @click="item.luar_kota_p > 0 ? openDetail(item.jenis_kegiatan, 'luar_kota_p', 'Luar Kota (Perempuan)') : null">
                    <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-success fw-bold text-decoration-underline': item.luar_kota_p > 0 }" disabled>{{ item.luar_kota_p }}</div>
                </td>
                
                <td class="text-center fw-bold bg-info-soft" :class="{ 'cursor-pointer': item.total_kunjungan > 0 }" @click="item.total_kunjungan > 0 ? openDetail(item.jenis_kegiatan, 'total', 'Total Kunjungan') : null">
                    <div class="form-control form-control-sm text-center bg-light border-0" :class="{ 'text-info fw-bold text-decoration-underline': item.total_kunjungan > 0 }" disabled>{{ item.total_kunjungan }}</div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="results.length">
              <tr class="footer-row-combined fw-800">
                <td colspan="2" class="text-center fixed-col footer-fixed bg-light">TOTAL KUNJUNGAN</td>
                <td class="text-center border-start-item bg-primary-soft text-primary">{{ totals.dalam_kota_l }}</td>
                <td class="text-center bg-primary-soft text-primary">{{ totals.dalam_kota_p }}</td>
                <td class="text-center border-start-item bg-success-soft text-success">{{ totals.luar_kota_l }}</td>
                <td class="text-center border-end-item bg-success-soft text-success">{{ totals.luar_kota_p }}</td>
                <td class="text-center bg-info text-white">{{ totals.total_kunjungan }}</td>
              </tr>
            </tfoot>
          </table>
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
                <i class="fas fa-search-location me-3 fa-lg"></i>
                Detail Kunjungan Pasien
              </h5>
              <p class="mb-0 opacity-90 small fw-500">{{ detailTitle }}</p>
            </div>
            <button type="button" class="btn-close btn-close-white shadow-none opacity-100" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body p-0 custom-scrollbar">
            <div v-if="detailLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted fw-500">Mengambil data detail...</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover table-sm align-middle mb-0">
                <thead class="bg-light sticky-top">
                  <tr>
                    <th class="ps-4 py-2">No. Rawat / Tgl</th>
                    <th class="py-2">No. RM</th>
                    <th class="py-2">Nama Pasien</th>
                    <th class="text-center py-2">JK</th>
                    <th class="py-2" style="width: 40%;">Alamat / Alamat PJ</th>
                    <th class="pe-4 py-2">Poliklinik (Asli)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in paginatedDetailData" :key="i" class="small">
                    <td class="ps-4">
                      <div class="fw-bold">{{ p.no_rawat }}</div>
                      <div class="text-muted smallest">{{ p.tgl_registrasi }}</div>
                    </td>
                    <td><span class="badge bg-light text-dark border">{{ p.no_rkm_medis }}</span></td>
                    <td class="fw-600">{{ p.nm_pasien }}</td>
                    <td class="text-center">
                      <i v-if="p.jk === 'L'" class="fas fa-mars text-info"></i>
                      <i v-else class="fas fa-venus text-pink"></i>
                    </td>
                    <td class="py-2">
                      <div><i class="fas fa-home me-1 text-muted"></i>{{ p.alamat }}</div>
                      <div class="smallest text-muted mt-1"><i class="fas fa-user-friends me-1"></i>{{ p.almt_pj || '-' }}</div>
                    </td>
                    <td class="pe-4">{{ p.nm_poli }}</td>
                  </tr>
                  <tr v-if="!detailData.length">
                    <td colspan="6" class="text-center py-4 text-muted">Tidak ada rincian data ditemukan</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 p-3 d-flex justify-content-between align-items-center">
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
                <option value="10">10 / hal</option>
                <option value="25">25 / hal</option>
                <option value="50">50 / hal</option>
                <option value="100">100 / hal</option>
              </select>
            </div>
            <button type="button" class="btn btn-dark rounded-pill px-4 shadow-none" @click="showDetailModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { kunjunganRl35Service } from '@/services/laporan/kunjunganRl35Service'

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
  month: String(new Date().getMonth() + 1).padStart(2, '0'),
  year: String(currentYear),
})

const totals = computed(() => {
  const t = {
    dalam_kota_l: 0,
    dalam_kota_p: 0,
    luar_kota_l: 0,
    luar_kota_p: 0,
    total_kunjungan: 0
  }
  
  results.value.forEach(item => {
    t.dalam_kota_l += parseInt(item.dalam_kota_l || 0)
    t.dalam_kota_p += parseInt(item.dalam_kota_p || 0)
    t.luar_kota_l += parseInt(item.luar_kota_l || 0)
    t.luar_kota_p += parseInt(item.luar_kota_p || 0)
    t.total_kunjungan += parseInt(item.total_kunjungan || 0)
  })
  
  return t
})

const loadData = async () => {
  if (!filters.month || !filters.year) return;
  
  loading.value = true
  try {
    const tgl_awal = `${filters.year}-${filters.month}-01`
    const lastDay = new Date(filters.year, parseInt(filters.month), 0).getDate()
    const tgl_akhir = `${filters.year}-${filters.month}-${lastDay}`
    
    const params = {
      tgl_awal,
      tgl_akhir
    }
    const response = await kunjunganRl35Service.getData(params)
    if (response.data.success) {
      results.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading kunjungan rl 3.5 data:', error)
  } finally {
    loading.value = false
  }
}

const openDetail = async (jenis_kegiatan, tipe, titleDesc) => {
  if (!filters.month || !filters.year) return;
  
  detailTitle.value = `${jenis_kegiatan} - ${titleDesc}`
  showDetailModal.value = true
  detailLoading.value = true
  detailData.value = []
  detailCurrentPage.value = 1
  
  try {
    const tgl_awal = `${filters.year}-${filters.month}-01`
    const lastDay = new Date(filters.year, parseInt(filters.month), 0).getDate()
    const tgl_akhir = `${filters.year}-${filters.month}-${lastDay}`
    
    const params = {
      tgl_awal,
      tgl_akhir,
      jenis_kegiatan,
      tipe: tipe === 'total' ? '' : tipe
    }
    
    const response = await kunjunganRl35Service.getDetail(params)
    if (response.data.success) {
      detailData.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading detail:', error)
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.kunjungan-rl35-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.bg-primary-gradient {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.page-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 0 0 40px 40px;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.2);
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

.btn-refresh-modern:hover { transform: translateY(-2px); filter: brightness(1.1); }

.report-card { border-radius: 24px; background: white; overflow: hidden; box-shadow: 0 4px 25px rgba(0,0,0,0.05); }

.bg-primary-soft { background-color: #f1f5f9; }
.bg-success-soft { background-color: #f0fdf4; }
.bg-info-soft { background-color: #ecf8ff; }
.fw-800 { font-weight: 800; }
.fw-600 { font-weight: 600; }
.smallest { font-size: 0.7rem; }
.text-pink { color: #db2777; }
.cursor-pointer { cursor: pointer; }

.table-responsive-modern { overflow-x: auto; font-size: 0.85rem; }
.sticky-thead { position: sticky; top: 0; z-index: 100; }
.header-row-1 th { background: #f8fafc; font-weight: 800; border-bottom: 0 !important; }

.fixed-col {
  position: sticky !important;
  left: 0;
  z-index: 20;
  background-color: #ffffff !important; 
  border-right: 1px solid #e2e8f0 !important;
}

thead .header-fixed {
  z-index: 150 !important;
  background-color: #f1f5f9 !important;
  border-bottom: 2px solid #e2e8f0 !important;
}

tfoot {
  position: sticky;
  bottom: 0;
  z-index: 200 !important;
  background-color: #ffffff !important;
}

tfoot tr { background-color: #ffffff !important; }
tfoot .footer-fixed { z-index: 110 !important; background-color: #f8fafc !important; border-top: 2px solid #cbd5e1 !important; }

.footer-row-combined td {
  padding: 0.75rem 0.5rem;
  border-top: 2px solid #cbd5e1 !important;
  border-bottom: 2px solid #cbd5e1 !important;
  background-color: #ffffff !important;
  font-size: 0.9rem;
}

.footer-row-combined .bg-primary-soft { background-color: #eef2ff !important; }
.footer-row-combined .bg-success-soft { background-color: #f0fdf4 !important; }
.footer-row-combined .bg-info { background-color: #0dcaf0 !important; }

.data-row td { border-color: #f1f5f9; padding: 0.5rem; }
.data-row:hover td { background: #f8fafc; }
.data-row:hover .fixed-col { background-color: #f8fafc !important; }

.border-start-item { border-left: 1.5px solid #e2e8f0 !important; }
.border-end-item { border-right: 1.5px solid #e2e8f0 !important; }
.penyakit-name { font-weight: 600; color: #1e293b; display: block; }

.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

@media (max-width: 768px) {
  .page-header { border-radius: 0; margin-bottom: 0; }
  .report-card { border-radius: 0; border: 0; }
}
</style>
