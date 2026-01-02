<template>
  <div class="riwayat-obat-page">
    <div class="page-header mb-3">
      <div class="header-content">
        <h1 class="page-title">📜 Riwayat Obat / Barang Medis</h1>
        <p class="page-subtitle text-muted">Pantau pergerakan stok obat dan alat kesehatan (Masuk, Keluar, Mutasi, dll)</p>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'detail' }" href="#" @click.prevent="activeTab = 'detail'">
                <i class="fas fa-list me-2"></i>Detail Riwayat
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'summary' }" href="#" @click.prevent="loadSummaryTab">
                <i class="fas fa-chart-pie me-2"></i>Ringkasan Penggunaan
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'stock' }" href="#" @click.prevent="loadStockTab">
                <i class="fas fa-calendar-check me-2"></i>Stok Akhir Per Tanggal
            </a>
        </li>
    </ul>

    <!-- Tab 1: Detail Riwayat -->
    <div v-if="activeTab === 'detail'" class="d-flex flex-column flex-grow-1">
        <!-- Filters -->
        <div class="card mb-3" style="overflow: visible; z-index: 100;">
        <div class="card-body py-3" style="overflow: visible;">
            <div class="row g-3 align-items-end">
                <div class="col-md-2">
                    <label class="form-label small fw-bold text-muted">Tanggal Awal</label>
                    <input v-model="filters.tgl_awal" type="date" class="form-control form-control-sm">
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold text-muted">Tanggal Akhir</label>
                    <input v-model="filters.tgl_akhir" type="date" class="form-control form-control-sm">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small mb-1">Lokasi / Bangsal</label>
                     <v-select 
                        v-model="filters.kd_bangsal" 
                        :options="bangsals" 
                        label="nm_bangsal" 
                        :reduce="option => option.kd_bangsal"
                        placeholder="Semua Lokasi"
                        class="style-chooser-sm"
                    />
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold text-muted">Pencarian</label>
                    <div class="input-group input-group-sm">
                        <span class="input-group-text bg-light border-end-0"><i class="fas fa-search text-muted"></i></span>
                        <input v-model="filters.keyword" type="text" class="form-control border-start-0 ps-0" placeholder="Nama Obat, No Batch, No Faktur...">
                    </div>
                </div>
                <div class="col-md-3 d-flex gap-1">
                    <button class="btn btn-secondary btn-sm" @click="resetFilters" :disabled="loading" title="Reset Filter" style="min-width: 36px;">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-primary btn-sm flex-grow-1" @click="fetchRiwayat(1)" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="fas fa-filter me-1"></i> Tampilkan
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Table -->
    <div class="card flex-grow-1 d-flex flex-column" style="min-height: 500px;">
        <div class="card-body p-0 d-flex flex-column">
             <div class="table-responsive flex-grow-1">
                 <table class="table table-bordered table-hover mb-0 table-sm" style="font-size: 0.85rem;">
                     <thead class="bg-light text-secondary sticky-top">
                         <tr>
                             <th class="text-center">Tanggal & Jam</th>
                             <th>Barang</th>
                             <th>Lokasi</th>
                             <th>Status / Posisi</th>
                             <th class="text-center text-primary">Awal</th>
                             <th class="text-center text-success">Masuk</th>
                             <th class="text-center text-danger">Keluar</th>
                             <th class="text-center fw-bold">Akhir</th>
                             <th>Petugas</th>
                             <th>No. Faktur / Batch</th>
                             <th>Keterangan</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr v-if="loading">
                             <td colspan="11" class="text-center py-5">
                                 <div class="spinner-border text-primary spinner-border-sm"></div>
                                 <div class="mt-2 small text-muted">Memuat riwayat...</div>
                             </td>
                         </tr>
                         <tr v-else-if="items.length === 0">
                             <td colspan="11" class="text-center py-5 text-muted">
                                 <i class="fas fa-inbox fa-3x mb-3 text-light"></i><br>
                                 Tidak ada data riwayat ditemukan.
                             </td>
                         </tr>
                         <tr v-for="(item, i) in items" :key="i">
                             <td class="text-nowrap text-center">
                                 <div>{{ item.tanggal }}</div>
                                 <small class="text-muted">{{ item.jam }}</small>
                             </td>
                             <td>
                                 <div class="fw-semibold">{{ item.barang?.nama_brng || item.kode_brng }}</div>
                                 <small class="text-muted">{{ item.kode_brng }}</small>
                             </td>
                             <td>
                                 {{ item.bangsal?.nm_bangsal || item.kd_bangsal }}
                             </td>
                             <td>
                                 <span class="badge bg-secondary mb-1">{{ item.status }}</span><br>
                                 <small class="text-muted">{{ item.posisi }}</small>
                             </td>
                             <td class="text-center">{{ item.stok_awal }}</td>
                             <td class="text-center bg-success-subtle fw-bold text-success">{{ item.masuk > 0 ? '+' + item.masuk : '-' }}</td>
                             <td class="text-center bg-danger-subtle fw-bold text-danger">{{ item.keluar > 0 ? '-' + item.keluar : '-' }}</td>
                             <td class="text-center fw-bold">{{ item.stok_akhir }}</td>
                             <td>{{ item.petugas }}</td>
                             <td>
                                 <div v-if="item.no_faktur" class="text-nowrap"><i class="fas fa-file-invoice me-1 text-muted"></i>{{ item.no_faktur }}</div>
                                 <div v-if="item.no_batch" class="text-nowrap small text-muted"><i class="fas fa-barcode me-1"></i>{{ item.no_batch }}</div>
                             </td>
                             <td><small>{{ item.keterangan }}</small></td>
                         </tr>
                     </tbody>
                 </table>
             </div>

             <!-- Pagination -->
             <div class="border-top p-2 d-flex justify-content-between align-items-center bg-light">
                 <span class="small text-muted">
                     Menampilkan {{ pagination.from || 0 }} - {{ pagination.to || 0 }} dari {{ pagination.total || 0 }} data
                 </span>
                 <nav v-if="pagination.last_page > 1">
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                            <button class="page-link" @click="fetchRiwayat(pagination.current_page - 1)">Prev</button>
                        </li>
                         <li class="page-item disabled">
                             <span class="page-link">{{ pagination.current_page }}</span>
                         </li>
                        <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                            <button class="page-link" @click="fetchRiwayat(pagination.current_page + 1)">Next</button>
                        </li>
                    </ul>
                 </nav>
             </div>
        </div>
    </div>
    </div>

    <!-- Tab 2: Ringkasan Penggunaan -->
    <div v-if="activeTab === 'summary'" class="d-flex flex-column flex-grow-1">
        <!-- Summary Filters -->
        <div class="card mb-3" style="overflow: visible; z-index: 100;">
            <div class="card-body py-3" style="overflow: visible;">
                <div class="row g-3 align-items-end">
                    <div class="col-md-2">
                        <label class="form-label small fw-bold text-muted">Tanggal Awal</label>
                        <input v-model="summaryFilters.tgl_awal" type="date" class="form-control form-control-sm">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small fw-bold text-muted">Tanggal Akhir</label>
                        <input v-model="summaryFilters.tgl_akhir" type="date" class="form-control form-control-sm">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small mb-1">Posisi (Jenis Transaksi)</label>
                         <v-select 
                            v-model="summaryFilters.posisi" 
                            :options="posisiOptions" 
                            multiple
                            placeholder="Semua Posisi"
                            class="style-chooser-sm"
                        />
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small fw-bold text-muted">Cari Obat</label>
                        <div class="input-group input-group-sm">
                             <input v-model="summaryFilters.keyword" type="text" class="form-control" placeholder="Nama abat...">
                        </div>
                    </div>
                    <div class="col-md-3 d-flex gap-1">
                        <button class="btn btn-secondary btn-sm" @click="resetSummaryFilters" :disabled="summaryLoading" title="Reset Filter" style="min-width: 36px;">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="btn btn-success btn-sm" @click="exportExcel" :disabled="summaryLoading" title="Export Excel" style="min-width: 36px;">
                            <i class="fas fa-file-excel"></i>
                        </button>
                        <button class="btn btn-primary btn-sm flex-grow-1" @click="fetchSummary(1)" :disabled="summaryLoading">
                            <span v-if="summaryLoading" class="spinner-border spinner-border-sm me-1"></span>
                            Tampilkan
                        </button>
                    </div>
                </div>
            </div>
        </div>

         <!-- Summary Table -->
        <div class="card flex-grow-1 d-flex flex-column" style="min-height: 500px;">
            <div class="card-body p-0 d-flex flex-column">
                 <div class="table-responsive flex-grow-1" style="overflow-y: auto; height: 0;">
                     <table class="table table-bordered table-hover mb-0 table-sm" style="font-size: 0.9rem;">
                         <thead class="bg-light text-secondary sticky-top">
                             <tr>
                                 <th>Kode & Nama Barang</th>
                                 <th v-for="col in activeColumns" :key="col" class="text-center">{{ col }}</th>
                                 <th class="text-center fw-bold">Total</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr v-if="!summaryLoaded && !summaryLoading">
                                 <td :colspan="2 + activeColumns.length" class="text-center py-5 text-muted">
                                     <i class="fas fa-filter fa-3x mb-3 text-secondary opacity-50"></i><br>
                                     <span class="fs-6">Pilih <strong>Filter</strong> (Tanggal, Posisi) dan klik <strong>Tampilkan</strong>.</span>
                                 </td>
                             </tr>
                             <tr v-else-if="summaryLoading">
                                 <td :colspan="2 + activeColumns.length" class="text-center py-5">
                                     <div class="spinner-border text-primary spinner-border-sm"></div>
                                     <div class="mt-2 small text-muted">Mengalkulasi ringkasan...</div>
                                 </td>
                             </tr>
                             <tr v-else-if="summaryItems.length === 0">
                                 <td :colspan="2 + activeColumns.length" class="text-center py-5 text-muted">
                                     <i class="fas fa-chart-pie fa-3x mb-3 text-light"></i><br>
                                     Tidak ada data untuk filter yang dipilih.
                                 </td>
                             </tr>
                             <tr v-else v-for="(item, i) in summaryItems" :key="i">
                                 <td>
                                     <div class="fw-semibold">{{ item.barang?.nama_brng || item.nama_brng }}</div>
                                     <div class="small text-muted d-flex gap-2">
                                         <span>{{ item.kode_brng }}</span>
                                         <span v-if="item.barang?.satuan?.satuan" class="border-start ps-2">{{ item.barang?.satuan?.satuan }}</span>
                                     </div>
                                 </td>
                                 <td v-for="col in activeColumns" :key="col" class="text-center text-danger">
                                     <!-- Convert col name to snake_case to match key from backend -->
                                     {{ parseFloat(item[col.toLowerCase().replace(/ /g, '_')] || 0).toLocaleString('id-ID') }}
                                 </td>
                                 <!-- Total Selected -->
                                 <td class="text-center fw-bold">{{ parseFloat(item.total_selected || 0).toLocaleString('id-ID') }}</td>
                             </tr>
                             <!-- Loading Trigger / Sentinel (Inside Table) -->
                             <tr v-if="summaryPagination.next_page_url" ref="loadMoreTrigger">
                                 <td :colspan="2 + activeColumns.length" class="text-center py-2 bg-light text-muted small">
                                      <div class="spinner-border spinner-border-sm text-primary align-middle me-2"></div>
                                      Memuat lebih banyak data...
                                 </td>
                             </tr>
                         </tbody>
                     </table>
                 </div>

                 <!-- Footer Info (Static) -->
                 <div class="border-top p-2 bg-light text-center small text-muted">
                     <span v-if="summaryItems.length > 0">
                         Menampilkan {{ summaryItems.length }} data (Scroll untuk memuat lebih banyak)
                     </span>
                     <span v-else>
                         Memuat...
                     </span>
                 </div>
            </div>
        </div>
    </div>

    <!-- Tab 3: Stok Akhir Per Tanggal -->
    <div v-if="activeTab === 'stock'" class="d-flex flex-column flex-grow-1">
        <!-- Stock Filters -->
        <div class="card mb-3">
            <div class="card-body py-3">
                <div class="row g-3 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label small fw-bold text-muted">Tanggal Cek Stok</label>
                        <input v-model="stockFilters.tanggal" type="date" class="form-control form-control-sm">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-bold text-muted">Cari Obat</label>
                        <div class="input-group input-group-sm">
                             <input v-model="stockFilters.keyword" type="text" class="form-control" placeholder="Nama obat / kode...">
                        </div>
                    </div>
                    <div class="col-md-auto ms-auto d-flex gap-1">
                        <button class="btn btn-secondary btn-sm" @click="resetStockFilters" :disabled="stockLoading" title="Reset Filter" style="min-width: 36px;">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="btn btn-success btn-sm" @click="exportStock" :disabled="stockLoading" title="Export Excel" style="min-width: 36px;">
                            <i class="fas fa-file-excel"></i>
                        </button>
                        <button class="btn btn-primary btn-sm px-4" @click="fetchStock(1)" :disabled="stockLoading">
                            <span v-if="stockLoading" class="spinner-border spinner-border-sm me-1"></span>
                            Tampilkan
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stock Table -->
        <div class="card flex-grow-1 d-flex flex-column" style="min-height: 500px;">
            <div class="card-body p-0 d-flex flex-column">
                 <div class="table-responsive flex-grow-1">
                     <table class="table table-bordered table-hover mb-0 table-sm" style="font-size: 0.9rem;">
                         <thead class="bg-light text-secondary sticky-top">
                             <tr>
                                 <th>Kode Barang</th>
                                 <th>Nama Barang</th>
                                 <th class="text-center">Satuan</th>
                                 <th class="text-center fw-bold text-primary">Stok Akhir</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr v-if="stockLoading">
                                 <td colspan="4" class="text-center py-5">
                                     <div class="spinner-border text-primary spinner-border-sm"></div>
                                     <div class="mt-2 small text-muted">Mengambil data stok...</div>
                                 </td>
                             </tr>
                             <tr v-else-if="stockItems.length === 0">
                                 <td colspan="4" class="text-center py-5 text-muted">
                                     <i class="fas fa-search fa-3x mb-3 text-light"></i><br>
                                     <span v-if="stockPagination.total === 0">Klik <strong>Tampilkan</strong> untuk memuat data.</span>
                                     <span v-else>Tidak ada data ditemukan.</span>
                                 </td>
                             </tr>
                             <tr v-else v-for="(item, i) in stockItems" :key="i">
                                 <td>{{ item.kode_brng }}</td>
                                 <td class="fw-semibold">{{ item.nama_brng }}</td>
                                 <td class="text-center">{{ item.satuan?.satuan || item.kode_sat }}</td>
                                 <td class="text-center fw-bold fs-6">{{ parseFloat(item.last_stock || 0).toLocaleString('id-ID') }}</td>
                             </tr>
                         </tbody>
                     </table>
                 </div>

                 <!-- Stock Pagination -->
                 <div class="border-top p-2 d-flex justify-content-between align-items-center bg-light">
                     <span class="small text-muted">
                         Menampilkan {{ stockPagination.from || 0 }} - {{ stockPagination.to || 0 }} dari {{ stockPagination.total || 0 }} data
                     </span>
                     <nav v-if="stockPagination.last_page > 1">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: stockPagination.current_page === 1 }">
                                <button class="page-link" @click="fetchStock(stockPagination.current_page - 1)">Prev</button>
                            </li>
                             <li class="page-item disabled">
                                 <span class="page-link">{{ stockPagination.current_page }}</span>
                             </li>
                            <li class="page-item" :class="{ disabled: stockPagination.current_page === stockPagination.last_page }">
                                <button class="page-link" @click="fetchStock(stockPagination.current_page + 1)">Next</button>
                            </li>
                        </ul>
                     </nav>
                 </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'
import Swal from 'sweetalert2'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'


const items = ref([])
const loading = ref(false)
const bangsals = ref([])
const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0
})

const activeTab = ref('detail')
const summaryLoading = ref(false)

const filters = ref({
    tgl_awal: new Date().toISOString().slice(0, 10),
    tgl_akhir: new Date().toISOString().slice(0, 10),
    keyword: '',
    kd_bangsal: ''
})

const fetchBangsals = async () => {
    try {
        const response = await api.get('/farmasi/stok-opname/bangsal') // Reusing existing endpoint
        if (response.data && response.data.success) {
            bangsals.value = [{ kd_bangsal: '', nm_bangsal: 'Semua Lokasi' }, ...response.data.data]
        }
    } catch (err) {
        console.error('Failed to fetch bangsals', err)
    }
}

const fetchRiwayat = async (page = 1) => {
    loading.value = true
    try {
        const params = {
            page: page,
            limit: pagination.value.per_page,
            tgl_awal: filters.value.tgl_awal,
            tgl_akhir: filters.value.tgl_akhir,
            keyword: filters.value.keyword,
            kd_bangsal: filters.value.kd_bangsal
        }

        const response = await api.get('/farmasi/riwayat-obat', { params })
        if (response.data && response.data.success) {
             const data = response.data.data
             items.value = data.data
             pagination.value = {
                current_page: data.current_page,
                last_page: data.last_page,
                per_page: data.per_page,
                total: data.total,
                from: data.from,
                to: data.to
             }
        }
    } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat riwayat obat', 'error')
    } finally {
        loading.value = false
    }
}
const summaryItems = ref([])
const activeColumns = ref([])
const summaryLoaded = ref(false)

const summaryFilters = ref({
    tgl_awal: new Date().toISOString().slice(0, 10),
    tgl_akhir: new Date().toISOString().slice(0, 10),
    keyword: '',
    posisi: []
})

const summaryPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0
})
// Hardcoded based on user request/DB enum
const posisiOptions = ref([
    'Pemberian Obat','Pengadaan','Penerimaan','Piutang','Retur Beli','Retur Jual',
    'Retur Piutang','Mutasi','Opname','Resep Pulang','Retur Pasien','Stok Pasien Ranap',
    'Pengambilan Medis','Penjualan','Stok Keluar','Hibah'
])

const fetchStatuses = async () => {
    // Override fetch from backend with hardcoded enum as per request to match exact table structure
    // We keep this function just in case or we just use the ref above.
    // posisiOptions.value = ...
}

// Infinite Scroll Logic
const loadMoreTrigger = ref(null)
const observer = ref(null)

const setupObserver = () => {
    if (observer.value) observer.value.disconnect()
    
    observer.value = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !summaryLoading.value && summaryPagination.value.next_page_url) {
            fetchSummary(summaryPagination.value.current_page + 1, true)
        }
    }, {
        root: null, // viewport
        threshold: 0.1
    })

    if (loadMoreTrigger.value) {
        observer.value.observe(loadMoreTrigger.value)
    }
}

// Watch for changes/tab switch to re-setup observer
watch([activeTab, summaryItems], () => {
    if (activeTab.value === 'summary') {
        setTimeout(() => setupObserver(), 100)
    }
})


const fetchSummary = async (page = 1, append = false) => {
    if (summaryLoading.value) return
    summaryLoading.value = true
    
    try {
        const params = {
            page: page,
            limit: 20, // Keep limit small for smooth loading
            tgl_awal: summaryFilters.value.tgl_awal,
            tgl_akhir: summaryFilters.value.tgl_akhir,
            keyword: summaryFilters.value.keyword,
            posisi: summaryFilters.value.posisi
        }

        const response = await api.get('/farmasi/riwayat-obat/summary', { 
            params,
            timeout: 60000 // Increase timeout to 60s
        })
        if (response.data && response.data.success) {
             const data = response.data.data
             
             if (append) {
                 summaryItems.value = [...summaryItems.value, ...data.data]
             } else {
                 summaryItems.value = data.data
             }

             // Use columns returned from backend OR fallback to selected filters
             activeColumns.value = response.data.columns || summaryFilters.value.posisi
             
             summaryPagination.value = {
                current_page: data.current_page,
                // simplePaginate doesn't distinguish last_page well, so we rely on next_page_url checks
                last_page: data.next_page_url ? data.current_page + 1 : data.current_page, 
                per_page: data.per_page,
                total: 0, // Total is unavailable in fast mode
                from: data.from,
                to: data.to,
                next_page_url: data.next_page_url
             }
             summaryLoaded.value = true
        } else if (response.data && response.data.message) {
             Swal.fire('Info', response.data.message, 'info')
             if (!append) summaryItems.value = []
        }
    } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat ringkasan', 'error')
    } finally {
        summaryLoading.value = false
    }
}

const exportExcel = async () => {
    // Validation
    if (summaryFilters.value.posisi.length === 0) {
        Swal.fire('Info', 'Silakan pilih posisi (Jenis Transaksi) terlebih dahulu', 'info')
        return
    }

    try {
        Swal.fire({
            title: 'Menyiapkan Export...',
            text: 'Mohon tunggu, unduhan akan dimulai otomatis.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        })

        const params = {
            tgl_awal: summaryFilters.value.tgl_awal,
            tgl_akhir: summaryFilters.value.tgl_akhir,
            keyword: summaryFilters.value.keyword,
            posisi: summaryFilters.value.posisi
        }
        
        // We use window.open for simple get request triggers if no auth token needed in header, 
        // BUT we need auth headers usually. Ideally use AXIOS blob.
        
        const response = await api.get('/farmasi/riwayat-obat/export', { 
            params,
            responseType: 'blob',
            timeout: 300000 // 5 minutes timeout for large exports
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'riwayat_obat_summary.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        Swal.close()
    } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal melakukan export', 'error')
    }
}

const loadSummaryTab = () => {
    activeTab.value = 'summary'
    // User requested to empty list when switching to this tab
    summaryItems.value = []
    summaryLoaded.value = false
    activeColumns.value = []
}

const resetSummaryFilters = () => {
    summaryFilters.value = {
        tgl_awal: new Date().toISOString().slice(0, 10),
        tgl_akhir: new Date().toISOString().slice(0, 10),
        keyword: '',
        posisi: []
    }
    summaryLoaded.value = false
    summaryItems.value = []
    activeColumns.value = []
}

// === TAB: STOK AKHIR PER TANGGAL ===
const stockItems = ref([])
const stockLoading = ref(false)
const stockFilters = ref({
    tanggal: new Date().toISOString().slice(0, 10),
    keyword: ''
})
const stockPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0
})

const loadStockTab = () => {
    activeTab.value = 'stock'
    stockItems.value = []
    stockPagination.value.total = 0
}

const resetStockFilters = () => {
    stockFilters.value = {
        tanggal: new Date().toISOString().slice(0, 10),
        keyword: ''
    }
    stockItems.value = []
}

const fetchStock = async (page = 1) => {
    stockLoading.value = true
    try {
        const params = {
            page: page,
            limit: 20,
            tanggal: stockFilters.value.tanggal,
            keyword: stockFilters.value.keyword
        }

        const response = await api.get('/farmasi/riwayat-obat/last-stock', { params })
        if (response.data && response.data.success) {
             const data = response.data.data
             stockItems.value = data.data
             stockPagination.value = {
                current_page: data.current_page,
                last_page: data.last_page,
                per_page: data.per_page,
                total: data.total,
                from: data.from,
                to: data.to
             }
        }
    } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat stok akhir', 'error')
    } finally {
        stockLoading.value = false
    }
}

const exportStock = async () => {
    try {
        Swal.fire({
            title: 'Menyiapkan Export...',
            text: 'Mohon tunggu, unduhan akan dimulai otomatis.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        })

        const params = {
            tanggal: stockFilters.value.tanggal,
            keyword: stockFilters.value.keyword
        }
        
        const response = await api.get('/farmasi/riwayat-obat/export-last-stock', { 
            params,
            responseType: 'blob',
            timeout: 300000 
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'stok_akhir_' + params.tanggal + '.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        Swal.close()
    } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal melakukan export stok', 'error')
    }
}

onMounted(() => {
    fetchBangsals()
    fetchRiwayat()
})
</script>

<style scoped>
.style-chooser-sm .vs__dropdown-toggle {
    padding-bottom: 0;
    height: 31px;
}
</style>
