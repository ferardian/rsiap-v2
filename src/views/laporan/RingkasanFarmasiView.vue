<template>
  <div class="ringkasan-farmasi-page p-3 p-md-4">
    <!-- Page Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title m-0">📦 Ringkasan Transaksi Farmasi</h1>
        <p class="page-subtitle text-muted m-0 mt-1">
          Rekapitulasi transaksi penerimaan supplier, pemberian obat, resep pulang, penjualan bebas, retur, piutang, hibah & pengajuan
        </p>
      </div>
      <div class="header-actions d-flex gap-2">
        <button class="btn btn-sm btn-outline-secondary rounded-3 px-3 shadow-sm text-nowrap" @click="resetFilters" :disabled="loading">
          <i class="fas fa-undo me-1"></i> Reset
        </button>
        <button class="btn btn-sm btn-primary rounded-3 px-3 shadow-sm text-nowrap" @click="fetchCurrentTabData" :disabled="loading">
          <i class="fas me-1" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i> Refresh Data
        </button>
      </div>
    </div>

    <!-- Main Tabbed Card Container -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <!-- Navigation Tabs (Card Header) -->
      <div class="card-header bg-transparent border-bottom p-2 p-md-3">
        <ul class="nav nav-pills nav-fill flex-nowrap compact-scroll overflow-x-auto gap-2 pb-1">
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'total_obat_keluar' }" 
              @click="switchTab('total_obat_keluar')"
            >
              📊 Total Obat Keluar
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'pemberian_obat' }" 
              @click="switchTab('pemberian_obat')"
            >
              💊 Pemberian Obat
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'resep_pulang' }" 
              @click="switchTab('resep_pulang')"
            >
              🏠 Resep Pulang
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'penerimaan' }" 
              @click="switchTab('penerimaan')"
            >
              📦 Penerimaan Supplier
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'penjualan_bebas' }" 
              @click="switchTab('penjualan_bebas')"
            >
              🛍️ Penjualan Bebas
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'pengeluaran_bhp' }" 
              @click="switchTab('pengeluaran_bhp')"
            >
              📦 Pengeluaran Stok / BHP
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'retur_jual' }" 
              @click="switchTab('retur_jual')"
            >
              🔄 Retur Jual
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'piutang_obat' }" 
              @click="switchTab('piutang_obat')"
            >
              💳 Piutang Obat
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'hibah' }" 
              @click="switchTab('hibah')"
            >
              🎁 Hibah Medis
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'pengajuan' }" 
              @click="switchTab('pengajuan')"
            >
              📝 Pengajuan Pengadaan
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link rounded-3 fw-bold text-nowrap py-2 px-3" 
              :class="{ active: activeTab === 'biaya_pasien' }" 
              @click="switchTab('biaya_pasien')"
            >
              💰 Biaya Pasien/Tgl
            </button>
          </li>
        </ul>
      </div>

      <!-- Active Tab Body: Filter Box + KPI Cards + Data Table -->
      <div class="card-body p-3 p-md-4">
        <!-- Filter Box inside Tab Content -->
        <div class="filter-box p-3 bg-light rounded-4 mb-4 border">
          <div class="row g-3 align-items-end">
            <div class="col-6 col-md-3 col-lg-2">
              <label class="form-label text-muted small fw-bold mb-1">Tanggal Mulai</label>
              <input type="date" class="form-control form-control-sm rounded-3 shadow-none" v-model="filters.tgl_awal" @change="fetchCurrentTabData">
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <label class="form-label text-muted small fw-bold mb-1">Tanggal Akhir</label>
              <input type="date" class="form-control form-control-sm rounded-3 shadow-none" v-model="filters.tgl_akhir" @change="fetchCurrentTabData">
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <label class="form-label text-muted small fw-bold mb-1">Depo / Bangsal</label>
              <select class="form-select form-select-sm rounded-3 shadow-none" v-model="filters.kd_bangsal" @change="fetchCurrentTabData">
                <option value="all">Semua Depo/Bangsal</option>
                <option v-for="b in attributes.bangsal" :key="b.kd_bangsal" :value="b.kd_bangsal">
                  {{ b.nm_bangsal }}
                </option>
              </select>
            </div>
            <div class="col-6 col-md-3 col-lg-2" v-if="activeTab === 'total_obat_keluar' || activeTab === 'pemberian_obat' || activeTab === 'resep_pulang' || activeTab === 'biaya_pasien'">
              <label class="form-label text-muted small fw-bold mb-1">Cara Bayar</label>
              <select class="form-select form-select-sm rounded-3 shadow-none" v-model="filters.kd_pj" @change="fetchCurrentTabData">
                <option value="all">Semua Penjab</option>
                <option v-for="pj in attributes.penjab" :key="pj.kd_pj" :value="pj.kd_pj">
                  {{ pj.png_jawab }}
                </option>
              </select>
            </div>
            <div class="col-6 col-md-3 col-lg-2" v-if="activeTab === 'penerimaan'">
              <label class="form-label text-muted small fw-bold mb-1">Supplier (PBF)</label>
              <select class="form-select form-select-sm rounded-3 shadow-none" v-model="filters.kode_suplier" @change="fetchCurrentTabData">
                <option value="all">Semua Supplier</option>
                <option v-for="s in attributes.supplier" :key="s.kode_suplier" :value="s.kode_suplier">
                  {{ s.nama_suplier }}
                </option>
              </select>
            </div>
            <div class="col-12 col-md-6 col-lg-4 ms-auto">
              <label class="form-label text-muted small fw-bold mb-1">Cari Data</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white border-end-0 rounded-start-3 text-muted">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control border-start-0 rounded-end-3 shadow-none" 
                  placeholder="Cari kode/nama barang/pasien/nota..." 
                  v-model="filters.search"
                  @input="debounceSearch"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Summary KPI Banner -->
        <div class="row g-3 mb-3">
          <div :class="hasBeliInfo ? 'col-6 col-md-3' : 'col-6 col-md-4'">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary bg-white h-100">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Record / Item</span>
              <h4 class="fw-bold m-0 text-dark">{{ formatNumber(pagination.total) }}</h4>
              <small class="text-muted text-xs mt-1 d-block"><i class="fas fa-list me-1 text-primary"></i>Total Entri Terdaftar</small>
            </div>
          </div>
          <div :class="hasBeliInfo ? 'col-6 col-md-3' : 'col-6 col-md-4'">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-success bg-white h-100">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Kuantitas (Qty)</span>
              <h4 class="fw-bold m-0 text-dark">{{ formatNumber(totalSummaryQty) }}</h4>
              <small class="text-muted text-xs mt-1 d-block"><i class="fas fa-cubes me-1 text-success"></i>Volume Barang/Unit</small>
            </div>
          </div>
          <div class="col-6 col-md-3" v-if="hasBeliInfo">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-warning bg-white h-100">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total HPP / Harga Beli</span>
              <h4 class="fw-bold m-0 text-dark fs-5">{{ formatRupiah(totalSummaryBeli) }}</h4>
              <small class="text-muted text-xs mt-1 d-block"><i class="fas fa-tags me-1 text-warning"></i>Akumulasi Harga Modal</small>
            </div>
          </div>
          <div :class="hasBeliInfo ? 'col-6 col-md-3' : 'col-12 col-md-4'">
            <div class="kpi-card card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-danger bg-white h-100">
              <span class="text-muted text-xs fw-bold text-uppercase d-block mb-1">Total Nominal Transaksi</span>
              <h4 class="fw-bold m-0 text-dark fs-5">{{ formatRupiah(totalSummaryNominal) }}</h4>
              <small class="text-muted text-xs mt-1 d-block"><i class="fas fa-wallet me-1 text-danger"></i>Nilai Pengeluaran/Pendapatan</small>
            </div>
          </div>
        </div>

        <!-- Source Breakdown Detail Cards (Total Obat Keluar) -->
        <div v-if="activeTab === 'total_obat_keluar' && summary && summary.breakdown && summary.breakdown.length > 0" class="breakdown-container bg-light-subtle p-3 rounded-4 border mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-dark fs-7 d-flex align-items-center gap-2">
              <i class="fas fa-sitemap text-primary"></i> Rincian Pengeluaran Obat Per Sumber Transaksi
            </span>
            <span class="badge bg-white text-secondary border font-monospace text-xs">Breakdown 4 Sumber</span>
          </div>
          <div class="row g-2">
            <div 
              v-for="b in summary.breakdown" 
              :key="b.key" 
              class="col-12 col-sm-6 col-xl-3"
            >
              <div class="card border border-light-subtle shadow-sm rounded-3 p-3 bg-white h-100 position-relative">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold text-dark text-xs d-flex align-items-center gap-1">
                    {{ getSourceIcon(b.key) }} {{ b.label }}
                  </span>
                  <span class="badge bg-soft-primary text-primary font-monospace text-xs">{{ b.total_items }} item</span>
                </div>
                <div class="d-flex align-items-baseline justify-content-between mt-1">
                  <span class="text-muted text-xs">Total Qty:</span>
                  <span class="fw-bold text-dark fs-6">{{ formatNumber(b.total_qty) }}</span>
                </div>
                <div class="d-flex align-items-baseline justify-content-between">
                  <span class="text-muted text-xs">Nominal Jual:</span>
                  <span class="fw-bold text-danger fs-7">{{ formatRupiah(b.total_nominal) }}</span>
                </div>
                <div class="d-flex align-items-baseline justify-content-between border-top pt-1 mt-1">
                  <span class="text-muted text-xs">Total HPP:</span>
                  <span class="fw-bold text-warning fs-7">{{ formatRupiah(b.total_beli) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Title & Ekspor Button -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div class="d-flex align-items-center gap-2">
            <h6 class="fw-bold text-dark m-0">{{ currentTabTitle }}</h6>
            <span class="badge bg-soft-primary text-primary px-2 py-1 fs-7 fw-bold">{{ pagination.total }} data</span>
          </div>
          <div>
            <button class="btn btn-sm btn-success text-white rounded-3 text-nowrap px-3 shadow-sm fw-bold" style="width: auto !important; max-width: fit-content;" @click="exportExcel">
              <i class="fas fa-file-excel me-1"></i> Ekspor Excel
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status" style="width: 2.5rem; height: 2.5rem;"></div>
          <p class="mt-2 text-muted small fw-bold">Memuat data ringkasan farmasi...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="text-center py-5 text-muted">
          <i class="fas fa-inbox fa-3x mb-3 text-light-gray"></i>
          <p class="m-0 fw-bold">Tidak ada data transaksi ditemukan</p>
          <small>Coba sesuaikan filter periode tanggal atau kata kunci pencarian</small>
        </div>

        <!-- Table View -->
        <div v-else class="table-responsive compact-scroll border rounded-3">
          <!-- Standard Goods Summary Table (Pemberian, Resep Pulang, Penerimaan, Penjualan, Retur, Piutang, Hibah, Pengajuan) -->
          <table v-if="activeTab !== 'biaya_pasien'" class="table table-hover table-compact align-middle m-0">
            <thead class="table-light">
              <tr>
                <th class="text-center" style="width: 40px;">#</th>
                <th>Kode Barang</th>
                <th>Nama Barang / Obat</th>
                <th>Kategori/Jenis</th>
                <th class="text-center">Satuan</th>
                <th v-if="items[0] && items[0].keterangan !== undefined">Keterangan</th>
                <th class="text-end">Jumlah (Qty)</th>
                <th class="text-end">Total Nominal (Rp)</th>
                <th class="text-end" v-if="items[0] && items[0].total_beli !== undefined">Total HPP Beli (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="index">
                <td class="text-center text-muted fw-bold">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
                <td><code class="text-dark font-monospace">{{ item.kode_brng }}</code></td>
                <td class="fw-bold text-dark">{{ item.nama_brng }}</td>
                <td><span class="badge bg-light text-secondary border">{{ item.namajenis || '-' }}</span></td>
                <td class="text-center small">{{ item.satuan || '-' }}</td>
                <td v-if="item.keterangan !== undefined">
                  <span class="badge bg-light text-dark border text-wrap text-start font-monospace" style="max-width: 220px;">
                    {{ item.keterangan || '-' }}
                  </span>
                </td>
                <td class="text-end fw-bold text-primary">{{ formatNumber(item.total_qty || item.jumlah) }}</td>
                <td class="text-end fw-bold text-dark">{{ formatRupiah(item.total_nominal || item.total) }}</td>
                <td class="text-end text-muted" v-if="item.total_beli !== undefined">{{ formatRupiah(item.total_beli) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold border-top border-2">
              <tr>
                <td :colspan="(items[0] && items[0].keterangan !== undefined) ? 6 : 5" class="text-end text-uppercase">Total Subtotal Halaman Ini:</td>
                <td class="text-end text-primary fs-6">{{ formatNumber(pageSummaryQty) }}</td>
                <td class="text-end text-dark fs-6">{{ formatRupiah(pageSummaryNominal) }}</td>
                <td class="text-end text-muted fs-6" v-if="items[0] && items[0].total_beli !== undefined">{{ formatRupiah(pageSummaryBeli) }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Daily Patient Drug Summary Table (Biaya Pasien Per Tanggal) -->
          <table v-else class="table table-hover table-compact align-middle m-0">
            <thead class="table-light">
              <tr>
                <th class="text-center" style="width: 40px;">#</th>
                <th>Tanggal</th>
                <th>No. Rawat</th>
                <th>No. RM</th>
                <th>Nama Pasien</th>
                <th>Penjab</th>
                <th>Unit / Poli</th>
                <th class="text-end">Qty Obat</th>
                <th class="text-end">Total Biaya Obat (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="index">
                <td class="text-center text-muted fw-bold">{{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}</td>
                <td class="text-nowrap small fw-bold">{{ item.tgl_perawatan }}</td>
                <td><code class="text-dark font-monospace">{{ item.no_rawat }}</code></td>
                <td><span class="badge bg-soft-primary text-primary font-monospace">{{ item.no_rkm_medis }}</span></td>
                <td class="fw-bold text-dark">{{ item.nm_pasien }}</td>
                <td><span class="badge bg-light text-secondary border">{{ item.png_jawab }}</span></td>
                <td><span class="badge bg-soft-info text-info">{{ item.nm_unit }}</span></td>
                <td class="text-end fw-bold text-primary">{{ formatNumber(item.total_qty) }}</td>
                <td class="text-end fw-bold text-dark">{{ formatRupiah(item.total_nominal) }}</td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold border-top border-2">
              <tr>
                <td colspan="7" class="text-end text-uppercase">Total Subtotal Halaman Ini:</td>
                <td class="text-end text-primary fs-6">{{ formatNumber(pageSummaryQty) }}</td>
                <td class="text-end text-dark fs-6">{{ formatRupiah(pageSummaryNominal) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="card-footer bg-transparent border-0 pt-3 px-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <span class="text-muted small">
            Menampilkan {{ items.length > 0 ? (pagination.current_page - 1) * pagination.per_page + 1 : 0 }} 
            sampai {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
            dari <strong>{{ pagination.total }}</strong> data
          </span>
          <div class="d-flex align-items-center gap-2">
            <select class="form-select form-select-sm rounded-3 shadow-none" style="width: 80px;" v-model="pagination.per_page" @change="fetchCurrentTabData">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <nav aria-label="Page navigation">
              <ul class="pagination pagination-sm m-0">
                <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                  <button class="page-link rounded-start-3" @click="changePage(pagination.current_page - 1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                <li 
                  v-for="p in visiblePages" 
                  :key="p" 
                  class="page-item" 
                  :class="{ active: p === pagination.current_page, disabled: p === '...' }"
                >
                  <button class="page-link" @click="p !== '...' && changePage(p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                  <button class="page-link rounded-end-3" @click="changePage(pagination.current_page + 1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'RingkasanFarmasiView',
  data() {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')

    return {
      loading: true,
      searchTimeout: null,
      activeTab: 'total_obat_keluar',
      filters: {
        tgl_awal: `${yyyy}-${mm}-01`,
        tgl_akhir: `${yyyy}-${mm}-${dd}`,
        kd_bangsal: 'all',
        kd_pj: 'all',
        kode_suplier: 'all',
        search: ''
      },
      attributes: {
        bangsal: [],
        jenis: [],
        supplier: [],
        penjab: []
      },
      items: [],
      summary: {
        total_qty: 0,
        total_nominal: 0,
        total_beli: 0
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
      }
    }
  },
  computed: {
    currentTabTitle() {
      const titles = {
        total_obat_keluar: '📊 Ringkasan Total Akumulasi Obat Keluar RS',
        pemberian_obat: '💊 Ringkasan Pemberian Obat Pasien',
        resep_pulang: '🏠 Ringkasan Resep Pulang Pasien',
        penerimaan: '📦 Ringkasan Penerimaan Barang Supplier',
        penjualan_bebas: '🛍️ Ringkasan Penjualan Bebas',
        pengeluaran_bhp: '📦 Ringkasan Pengeluaran Stok / BHP Depo',
        retur_jual: '🔄 Ringkasan Retur Jual Obat',
        piutang_obat: '💳 Ringkasan Piutang Obat',
        hibah: '🎁 Ringkasan Hibah Barang Medis',
        pengajuan: '📝 Ringkasan Pengajuan Pengadaan',
        biaya_pasien: '💰 Ringkasan Biaya Obat Pasien Per Tanggal'
      }
      return titles[this.activeTab] || 'Ringkasan Transaksi Farmasi'
    },
    pageSummaryQty() {
      return this.items.reduce((sum, item) => sum + (parseFloat(item.total_qty || item.jumlah || 0)), 0)
    },
    pageSummaryNominal() {
      return this.items.reduce((sum, item) => sum + (parseFloat(item.total_nominal || item.total || 0)), 0)
    },
    pageSummaryBeli() {
      return this.items.reduce((sum, item) => sum + (parseFloat(item.total_beli || 0)), 0)
    },
    totalSummaryQty() {
      return (this.summary && this.summary.total_qty !== undefined && this.summary.total_qty !== null && this.summary.total_qty > 0) 
        ? this.summary.total_qty 
        : this.pageSummaryQty
    },
    totalSummaryNominal() {
      return (this.summary && this.summary.total_nominal !== undefined && this.summary.total_nominal !== null && this.summary.total_nominal > 0) 
        ? this.summary.total_nominal 
        : this.pageSummaryNominal
    },
    totalSummaryBeli() {
      return (this.summary && this.summary.total_beli !== undefined && this.summary.total_beli !== null && this.summary.total_beli > 0) 
        ? this.summary.total_beli 
        : this.pageSummaryBeli
    },
    hasBeliInfo() {
      return (
        this.activeTab === 'total_obat_keluar' || 
        this.activeTab === 'pemberian_obat' || 
        this.activeTab === 'resep_pulang' || 
        this.activeTab === 'penjualan_bebas' || 
        this.activeTab === 'pengeluaran_bhp' || 
        this.activeTab === 'piutang_obat' || 
        (this.summary && this.summary.total_beli > 0)
      )
    },
    visiblePages() {
      const pages = []
      const current = this.pagination.current_page
      const last = this.pagination.last_page

      if (last <= 7) {
        for (let i = 1; i <= last; i++) pages.push(i)
      } else {
        pages.push(1)
        if (current > 3) pages.push('...')
        
        const start = Math.max(2, current - 1)
        const end = Math.min(last - 1, current + 1)
        
        for (let i = start; i <= end; i++) pages.push(i)
        
        if (current < last - 2) pages.push('...')
        pages.push(last)
      }
      return pages
    }
  },
  mounted() {
    this.fetchAttributes()
    this.fetchCurrentTabData()
  },
  methods: {
    async fetchAttributes() {
      try {
        const res = await api.get('/laporan/ringkasan-farmasi/attributes')
        if (res.data.success) {
          this.attributes = res.data.data
        }
      } catch (err) {
        console.error('Error fetching attributes:', err)
      }
    },
    switchTab(tabKey) {
      this.activeTab = tabKey
      this.pagination.current_page = 1
      this.fetchCurrentTabData()
    },
    async fetchCurrentTabData(page = 1) {
      this.loading = true
      try {
        const endpointMap = {
          total_obat_keluar: '/laporan/ringkasan-farmasi/total-obat-keluar',
          pemberian_obat: '/laporan/ringkasan-farmasi/pemberian-obat',
          resep_pulang: '/laporan/ringkasan-farmasi/resep-pulang',
          penerimaan: '/laporan/ringkasan-farmasi/penerimaan',
          penjualan_bebas: '/laporan/ringkasan-farmasi/penjualan-bebas',
          pengeluaran_bhp: '/laporan/ringkasan-farmasi/pengeluaran-bhp',
          retur_jual: '/laporan/ringkasan-farmasi/retur-jual',
          piutang_obat: '/laporan/ringkasan-farmasi/piutang-obat',
          hibah: '/laporan/ringkasan-farmasi/hibah',
          pengajuan: '/laporan/ringkasan-farmasi/pengajuan',
          biaya_pasien: '/laporan/ringkasan-farmasi/biaya-pasien-per-tanggal'
        }

        const endpoint = endpointMap[this.activeTab] || endpointMap['total_obat_keluar']

        const params = {
          tgl_awal: this.filters.tgl_awal,
          tgl_akhir: this.filters.tgl_akhir,
          kd_bangsal: this.filters.kd_bangsal,
          kd_pj: this.filters.kd_pj,
          kode_suplier: this.filters.kode_suplier,
          search: this.filters.search,
          page: page,
          per_page: this.pagination.per_page
        }

        const res = await api.get(endpoint, { params })
        if (res.data.success) {
          this.items = res.data.data
          if (res.data.meta) {
            this.pagination.current_page = res.data.meta.current_page || 1
            this.pagination.last_page = res.data.meta.last_page || 1
            this.pagination.per_page = res.data.meta.per_page || 20
            this.pagination.total = res.data.meta.total || 0
            if (res.data.meta.summary) {
              this.summary = res.data.meta.summary
            }
          }
        }
      } catch (err) {
        console.error('Error fetching tab data:', err)
        this.items = []
      } finally {
        this.loading = false
      }
    },
    changePage(p) {
      if (p >= 1 && p <= this.pagination.last_page) {
        this.fetchCurrentTabData(p)
      }
    },
    resetFilters() {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')

      this.filters = {
        tgl_awal: `${yyyy}-${mm}-01`,
        tgl_akhir: `${yyyy}-${mm}-${dd}`,
        kd_bangsal: 'all',
        kd_pj: 'all',
        kode_suplier: 'all',
        search: ''
      }
      this.fetchCurrentTabData(1)
    },
    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.fetchCurrentTabData(1)
      }, 400)
    },
    formatNumber(num) {
      if (!num && num !== 0) return '0'
      return new Intl.NumberFormat('id-ID').format(num)
    },
    formatRupiah(num) {
      if (!num && num !== 0) return 'Rp 0'
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
    },
    getSourceIcon(key) {
      const icons = {
        pemberian_obat: '💊',
        resep_pulang: '🏠',
        penjualan_bebas: '🛍️',
        pengeluaran_bhp: '📦'
      }
      return icons[key] || '📋'
    },
    exportExcel() {
      window.alert('Fitur ekspor excel sedang memproses data ' + this.currentTabTitle)
    }
  }
}
</script>

<style scoped>
.ringkasan-farmasi-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
}

.compact-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.compact-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.compact-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.compact-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.table-compact th {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  padding: 0.75rem 0.75rem;
  white-space: nowrap;
}

.table-compact td {
  padding: 0.6rem 0.75rem;
  font-size: 0.825rem;
}

.bg-soft-primary {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-soft-info {
  background-color: rgba(13, 202, 240, 0.1);
}

.text-xs {
  font-size: 0.725rem;
}

.fs-7 {
  font-size: 0.75rem;
}
</style>
