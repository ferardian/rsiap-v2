<template>
  <div class="rujukan-rl310-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="page-header mb-4 mt-n3 mx-n3 mt-md-n4 mx-md-n4">
      <div class="header-content d-flex flex-column flex-md-row justify-content-between align-items-md-center px-4 py-3 py-md-5">
        <div class="header-text mb-3 mb-md-0">
          <h2 class="page-title mb-1">
            <i class="fas fa-exchange-alt me-2"></i>
            RL 3.10 - Rujukan
          </h2>
          <p class="page-subtitle mb-0">Laporan Rujukan Masuk dan Keluar Berdasarkan Spesialisasi</p>
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

    <!-- Table Section -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-bordered table-hover rl-table mb-0">
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
    <div class="modal fade show" v-if="showDetailModal" tabindex="-1" style="display: block; background: rgba(15, 23, 42, 0.6); z-index: 1060;">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div class="modal-header bg-gradient-primary text-white border-0 py-3 px-4">
            <div>
              <h5 class="modal-title fw-bold mb-1">
                <i class="fas fa-list-ul me-2"></i>
                Detail Pasien Rujukan
              </h5>
              <p class="mb-0 opacity-90 small fw-500">{{ detailTitle }}</p>
            </div>
            <button type="button" class="btn-close btn-close-white shadow-none opacity-100" @click="showDetailModal = false"></button>
          </div>
          
          <div class="modal-body p-0 bg-light">
            <div v-if="detailLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted fw-500">Mengambil data detail...</p>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-hover bg-white mb-0">
                <thead class="table-light sticky-top">
                  <tr>
                    <th class="py-3 px-4 text-secondary small fw-bold">NO</th>
                    <th class="py-3 text-secondary small fw-bold">TANGGAL</th>
                    <th class="py-3 text-secondary small fw-bold">NO RAWAT / RM</th>
                    <th class="py-3 text-secondary small fw-bold">NAMA PASIEN</th>
                    <th class="py-3 text-center text-secondary small fw-bold">JK</th>
                    <th class="py-3 text-secondary small fw-bold">ASAL / TUJUAN</th>
                    <th class="py-3 px-4 text-secondary small fw-bold text-end">KETERANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in paginatedDetailData" :key="i" class="small">
                    <td class="px-4 text-muted">{{ (detailCurrentPage - 1) * detailItemsPerPage + i + 1 }}</td>
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
                    <td class="px-4 text-end">
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
          
          <div class="modal-footer bg-white border-top-0 py-3 px-4 d-flex justify-content-between align-items-center">
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
            <button type="button" class="btn btn-dark rounded-pill px-4 shadow-none" @click="showDetailModal = false">Tutup</button>
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

.rl-table {
  font-size: 0.9rem;
}

.rl-table thead th {
  background-color: #f8fafc;
  color: #334155;
  border-bottom-width: 2px;
  font-weight: 600;
  vertical-align: middle;
}

.rl-table td {
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: #f1f5f9;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}
</style>
