<template>
  <div class="hutang-vendor-container p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-file-invoice-dollar text-primary"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">📑 Ringkasan Hutang Vendor Farmasi</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          
          <!-- Filter Tanggal Datang (Tgl Pesan) -->
          <div class="col-lg-4 col-md-6">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <label class="filter-label m-0">
                <i class="fas fa-calendar-alt me-1 text-primary"></i> Tgl. Datang (Pesan)
              </label>
              <div class="form-check form-switch m-0">
                <input 
                  v-model="filters.enableTglDatang" 
                  class="form-check-input cursor-pointer" 
                  type="checkbox" 
                  id="switchTglDatang"
                >
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <input 
                type="date" 
                v-model="filters.tgl_datang_awal" 
                class="form-control form-control-sm filter-date" 
                :disabled="!filters.enableTglDatang"
              />
              <span class="text-muted small fw-bold">s/d</span>
              <input 
                type="date" 
                v-model="filters.tgl_datang_akhir" 
                class="form-control form-control-sm filter-date" 
                :disabled="!filters.enableTglDatang"
              />
            </div>
          </div>

          <!-- Filter Tanggal Tempo -->
          <div class="col-lg-4 col-md-6">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <label class="filter-label m-0">
                <i class="fas fa-calendar-times me-1 text-primary"></i> Tgl. Jatuh Tempo
              </label>
              <div class="form-check form-switch m-0">
                <input 
                  v-model="filters.enableTglTempo" 
                  class="form-check-input cursor-pointer" 
                  type="checkbox" 
                  id="switchTglTempo"
                >
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <input 
                type="date" 
                v-model="filters.tgl_tempo_awal" 
                class="form-control form-control-sm filter-date" 
                :disabled="!filters.enableTglTempo"
              />
              <span class="text-muted small fw-bold">s/d</span>
              <input 
                type="date" 
                v-model="filters.tgl_tempo_akhir" 
                class="form-control form-control-sm filter-date" 
                :disabled="!filters.enableTglTempo"
              />
            </div>
          </div>

          <!-- Kata Kunci Pencarian -->
          <div class="col-lg-4 col-md-12">
            <label class="filter-label mb-2"><i class="fas fa-search me-1 text-primary"></i> Kata Kunci</label>
            <input 
              type="text" 
              v-model="filters.keyword" 
              placeholder="Cari kode / nama supplier..." 
              class="form-control filter-input"
              @keyup.enter="loadData"
            />
          </div>

          <!-- Buttons Row with Top Divider -->
          <div class="col-12 d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3 pt-3 border-top">
            <!-- Left Side Buttons -->
            <div class="d-flex align-items-center gap-2">
              <button 
                @click="loadData" 
                class="btn btn-primary px-4 py-2" 
                :disabled="loading"
                style="width: auto !important; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 600; font-size: 0.85rem;"
              >
                <i class="fas fa-search me-2" :class="{ 'fa-spin': loading }"></i> Cari Data
              </button>
              
              <button 
                @click="resetFilters" 
                class="btn btn-outline-secondary px-3 py-2"
                style="width: auto !important; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 600; font-size: 0.85rem;"
              >
                <i class="fas fa-undo me-2"></i> Reset Filter
              </button>
            </div>

            <!-- Right Side Buttons (Direct Action Buttons) -->
            <div class="d-flex align-items-center gap-2">
              <button 
                @click="exportToExcel" 
                class="btn btn-outline-success px-3 py-2" 
                :disabled="items.length === 0"
                style="width: auto !important; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 600; font-size: 0.85rem;"
              >
                <i class="fas fa-file-excel me-2"></i> Excel (.xlsx)
              </button>

              <button 
                @click="exportToPDF" 
                class="btn btn-outline-danger px-3 py-2" 
                :disabled="items.length === 0"
                style="width: auto !important; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 600; font-size: 0.85rem;"
              >
                <i class="fas fa-file-pdf me-2"></i> Unduh PDF
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-4 mb-4">
      <!-- Total Outstanding Debt -->
      <div class="col-md-3">
        <div class="stat-card premium red h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0">{{ formatRupiah(summaryData.total_hutang) }}</h3>
              <p class="mb-0 opacity-75 small">Total Outstanding Hutang</p>
            </div>
          </div>
          <div class="stat-footer mt-auto text-white-50 small">
            Status: Belum Dibayar / Belum Lunas
          </div>
        </div>
      </div>

      <!-- Total Vendors in Debt -->
      <div class="col-md-3">
        <div class="stat-card premium purple h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-truck-loading"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0">{{ summaryData.total_vendor }} <small class="fs-6 opacity-75">Vendor</small></h3>
              <p class="mb-0 opacity-75 small">Vendor Outstanding</p>
            </div>
          </div>
          <div class="stat-footer mt-auto text-white-50 small">
            Jumlah suplier aktif terhutang
          </div>
        </div>
      </div>

      <!-- Highest Vendor Debt -->
      <div class="col-md-3">
        <div class="stat-card premium orange h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0 text-truncate" style="max-width: 100%;" :title="highestDebtVendor.name">
                {{ formatRupiah(highestDebtVendor.amount) }}
              </h3>
              <p class="mb-0 opacity-75 small text-truncate" :title="highestDebtVendor.name">
                Hutang Tertinggi: {{ highestDebtVendor.name }}
              </p>
            </div>
          </div>
          <div class="stat-footer mt-auto text-white-50 small">
            Suplier dengan outstanding terbesar
          </div>
        </div>
      </div>

      <!-- Average Vendor Debt -->
      <div class="col-md-3">
        <div class="stat-card premium blue h-100">
          <div class="stat-body">
            <div class="stat-icon-wrapper">
              <i class="fas fa-chart-pie"></i>
            </div>
            <div class="stat-info">
              <h3 class="mb-0">{{ formatRupiah(averageDebtPerVendor) }}</h3>
              <p class="mb-0 opacity-75 small">Rata-rata Hutang/Vendor</p>
            </div>
          </div>
          <div class="stat-footer mt-auto text-white-50 small">
            Outstanding rata-rata per suplier
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="content-card shadow-sm border-0 mb-4">
      <div class="card-header-modern bg-white border-0 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold"><i class="fas fa-list me-2 text-primary"></i>Daftar Hutang Per Vendor</h5>
        <div class="search-box">
          <input 
            type="text" 
            v-model="localSearch" 
            placeholder="Filter hasil di halaman ini..." 
            class="form-control form-control-sm rounded-pill" 
          />
        </div>
      </div>
      <div class="card-body-modern p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th style="width: 15%">Kode Supplier</th>
                <th style="width: 40%">Nama Supplier</th>
                <th class="text-end" style="width: 15%">Total Tagihan</th>
                <th class="text-end" style="width: 15%">Total Bayar</th>
                <th class="text-end" style="width: 15%">Sisa Hutang</th>
                <th class="text-center" style="width: 10%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5 text-muted">
                  <div class="spinner-border text-primary spinner-sm mb-2" role="status"></div>
                  <p class="mb-0 small font-500">Memuat ringkasan hutang vendor...</p>
                </td>
              </tr>
              <tr v-else-if="filteredItems.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p class="mb-0 small">Tidak ada data hutang vendor ditemukan.</p>
                </td>
              </tr>
              <tr 
                v-else 
                v-for="item in filteredItems" 
                :key="item.kode_suplier" 
                class="hover-row transition-all"
              >
                <td>
                  <span class="badge bg-light text-dark border fw-bold font-monospace">{{ item.kode_suplier }}</span>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nama_suplier }}</div>
                </td>
                <td class="text-end numeric-text text-muted font-500">
                  {{ formatRupiah(item.total_tagihan) }}
                </td>
                <td class="text-end numeric-text text-success font-500">
                  {{ formatRupiah(item.total_bayar) }}
                </td>
                <td class="text-end">
                  <span class="fw-extrabold text-danger numeric-text">
                    {{ formatRupiah(item.sisa_hutang) }}
                  </span>
                </td>
                <td class="text-center">
                  <button 
                    @click="openDetailModal(item)" 
                    class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 btn-detail-drill"
                    title="Helicopter View - Lihat rincian faktur"
                  >
                    <i class="fas fa-expand me-1"></i> Rincian
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="filteredItems.length > 0 && !loading">
              <tr class="table-light fw-bold border-top">
                <td colspan="2" class="text-center font-monospace">TOTAL OUTSTANDING</td>
                <td class="text-end numeric-text text-muted font-600">
                  {{ formatRupiah(filteredItems.reduce((acc, c) => acc + parseFloat(c.total_tagihan), 0)) }}
                </td>
                <td class="text-end numeric-text text-success font-600">
                  {{ formatRupiah(filteredItems.reduce((acc, c) => acc + parseFloat(c.total_bayar), 0)) }}
                </td>
                <td class="text-end text-danger numeric-text fw-bold">
                  {{ formatRupiah(filteredItems.reduce((acc, c) => acc + parseFloat(c.sisa_hutang), 0)) }}
                </td>
                <td class="d-print-none"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Drill-down Details Modal (Helicopter View) -->
    <div 
      class="modal fade" 
      id="detailFakturModal" 
      tabindex="-1" 
      aria-labelledby="detailFakturModalLabel" 
      aria-hidden="true"
      ref="modalRef"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <!-- Modal Header -->
          <div class="modal-header bg-light border-0 py-3 px-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="modal-title fw-bold text-dark d-flex align-items-center" id="detailFakturModalLabel">
                <div class="icon-box-sm bg-primary-subtle text-primary rounded-3 p-2 me-3 d-inline-flex">
                  <i class="fas fa-info-circle"></i>
                </div>
                Helicopter View: Rincian Hutang Faktur
              </h5>
              <p class="mb-0 text-muted small mt-1">
                Supplier: <span class="fw-bold text-dark">{{ selectedSupplier.nama }}</span> ({{ selectedSupplier.code }})
              </p>
            </div>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-4 bg-white">
            <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-danger px-3 py-2 rounded-3">
                  Outstanding: {{ formatRupiah(selectedSupplier.outstanding) }}
                </span>
                <span class="badge bg-secondary px-3 py-2 rounded-3">
                  {{ detailInvoices.length }} Invoice Pending
                </span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button 
                  @click="exportDetailToPDF" 
                  class="btn btn-sm btn-outline-danger fw-bold rounded-3"
                  :disabled="detailInvoices.length === 0"
                >
                  <i class="fas fa-file-pdf me-1"></i> Unduh PDF (Faktur)
                </button>
                <button 
                  @click="exportDetailToExcel" 
                  class="btn btn-sm btn-outline-success fw-bold rounded-3"
                  :disabled="detailInvoices.length === 0"
                >
                  <i class="fas fa-file-excel me-1"></i> Export Excel (Faktur)
                </button>
              </div>
            </div>

            <!-- Invoices Table -->
            <div class="table-responsive border rounded-3 overflow-hidden">
              <table class="table table-hover align-middle mb-0 text-sm">
                <thead class="bg-light-subtle">
                  <tr>
                    <th>No. Faktur</th>
                    <th>No. Order</th>
                    <th>Tgl Datang (Pesan)</th>
                    <th>Tgl Jatuh Tempo</th>
                    <th class="text-end">Tagihan</th>
                    <th class="text-end">Besar Bayar</th>
                    <th class="text-end">Sisa Hutang</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="detailLoading">
                    <td colspan="8" class="text-center py-5">
                      <div class="spinner-border text-primary spinner-sm mb-2" role="status"></div>
                      <p class="mb-0 text-muted small">Memuat rincian faktur...</p>
                    </td>
                  </tr>
                  <tr v-else-if="detailInvoices.length === 0">
                    <td colspan="8" class="text-center py-5 text-muted">
                      <i class="fas fa-file-invoice fa-2x mb-3 text-light"></i>
                      <p class="mb-0 small">Tidak ada rincian faktur outstanding.</p>
                    </td>
                  </tr>
                  <tr v-else v-for="inv in detailInvoices" :key="inv.no_faktur" class="hover-row-light">
                    <td>
                      <span class="fw-bold text-dark font-monospace">{{ inv.no_faktur }}</span>
                    </td>
                    <td>
                      <span class="text-muted font-monospace">{{ inv.no_order || '-' }}</span>
                    </td>
                    <td class="text-nowrap">{{ formatDate(inv.tgl_pesan) }}</td>
                    <td class="text-nowrap">
                      <span :class="{'text-danger fw-bold': isOverdue(inv.tgl_tempo)}">
                        {{ formatDate(inv.tgl_tempo) }}
                        <i v-if="isOverdue(inv.tgl_tempo)" class="fas fa-exclamation-circle ms-1" title="Jatuh Tempo!"></i>
                      </span>
                    </td>
                    <td class="text-end numeric-text font-500">{{ formatRupiah(inv.tagihan) }}</td>
                    <td class="text-end numeric-text text-success font-500">{{ formatRupiah(inv.besar_bayar) }}</td>
                    <td class="text-end text-danger numeric-text fw-bold">{{ formatRupiah(inv.sisa_hutang) }}</td>
                    <td class="text-center">
                      <span :class="getStatusBadgeClass(inv.status)">
                        {{ inv.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="detailInvoices.length > 0 && !detailLoading">
                  <tr class="table-light fw-bold border-top">
                    <td colspan="4" class="text-center font-monospace">TOTAL OUTSTANDING</td>
                    <td class="text-end numeric-text font-600">
                      {{ formatRupiah(detailInvoices.reduce((acc, c) => acc + parseFloat(c.tagihan), 0)) }}
                    </td>
                    <td class="text-end numeric-text text-success font-600">
                      {{ formatRupiah(detailInvoices.reduce((acc, c) => acc + parseFloat(c.besar_bayar), 0)) }}
                    </td>
                    <td class="text-end text-danger numeric-text fw-bold">
                      {{ formatRupiah(selectedSupplier.outstanding) }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer bg-light border-0 py-3 px-4">
            <button type="button" class="btn btn-secondary btn-sm px-4 rounded-3 fw-bold" data-bs-dismiss="modal">Tutup</button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import keuanganHutangService from '@/services/keuanganHutangService'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useToast } from 'vue-toastification'
import { Modal } from 'bootstrap'
import logoSquare from '@/assets/logo.png'
import logoLarsi from '@/assets/logo-larsi.png'

const toast = useToast()

const loadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}
const loading = ref(false)
const items = ref([])
const localSearch = ref('')

const summaryData = reactive({
  total_hutang: 0,
  total_vendor: 0
})

// Current month dates helper
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA')
const today = new Date().toLocaleDateString('en-CA')

const filters = reactive({
  enableTglDatang: false,
  tgl_datang_awal: firstDayOfMonth,
  tgl_datang_akhir: today,
  enableTglTempo: false,
  tgl_tempo_awal: firstDayOfMonth,
  tgl_tempo_akhir: today,
  keyword: ''
})

// Detail drill down state (Helicopter View)
const detailLoading = ref(false)
const detailInvoices = ref([])
const selectedSupplier = reactive({
  code: '',
  nama: '',
  outstanding: 0
})

let detailModalInstance = null

// Calculation logic
const averageDebtPerVendor = computed(() => {
  if (summaryData.total_vendor === 0) return 0
  return summaryData.total_hutang / summaryData.total_vendor
})

const highestDebtVendor = computed(() => {
  if (items.value.length === 0) return { name: '-', amount: 0, code: '' }
  
  // Find vendor with maximum sisa_hutang
  const highest = items.value.reduce((prev, current) => {
    return (parseFloat(prev.sisa_hutang) > parseFloat(current.sisa_hutang)) ? prev : current
  })

  return {
    name: highest.nama_suplier,
    amount: parseFloat(highest.sisa_hutang),
    code: highest.kode_suplier
  }
})

// Client side search matching
const filteredItems = computed(() => {
  if (!localSearch.value.trim()) return items.value
  const q = localSearch.value.toLowerCase()
  return items.value.filter(item => 
    item.kode_suplier.toLowerCase().includes(q) || 
    item.nama_suplier.toLowerCase().includes(q)
  )
})

// Load main summary list
const loadData = async () => {
  loading.value = true
  items.value = []
  
  const params = {
    keyword: filters.keyword.trim()
  }

  if (filters.enableTglDatang) {
    params.tgl_datang_awal = filters.tgl_datang_awal
    params.tgl_datang_akhir = filters.tgl_datang_akhir
  }

  if (filters.enableTglTempo) {
    params.tgl_tempo_awal = filters.tgl_tempo_awal
    params.tgl_tempo_akhir = filters.tgl_tempo_akhir
  }

  try {
    const res = await keuanganHutangService.getHutangVendorFarmasi(params)
    if (res.data.success) {
      items.value = res.data.data || []
      summaryData.total_hutang = res.data.summary?.total_hutang || 0
      summaryData.total_vendor = res.data.summary?.total_vendor || 0
    } else {
      toast.error(res.data.message || 'Gagal mengambil data hutang vendor')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Gagal memuat data dari server')
  } finally {
    loading.value = false
  }
}

// Reset filters to defaults
const resetFilters = () => {
  filters.enableTglDatang = false
  filters.tgl_datang_awal = firstDayOfMonth
  filters.tgl_datang_akhir = today
  filters.enableTglTempo = false
  filters.tgl_tempo_awal = firstDayOfMonth
  filters.tgl_tempo_akhir = today
  filters.keyword = ''
  loadData()
}

// Fetch invoices details for a selected vendor
const openDetailModal = async (supplierItem) => {
  selectedSupplier.code = supplierItem.kode_suplier
  selectedSupplier.nama = supplierItem.nama_suplier
  selectedSupplier.outstanding = parseFloat(supplierItem.sisa_hutang)
  
  detailInvoices.value = []
  detailLoading.value = true

  // Open the Modal UI
  if (!detailModalInstance) {
    const el = document.getElementById('detailFakturModal')
    detailModalInstance = new Modal(el)
  }
  detailModalInstance.show()

  const params = {
    kode_suplier: supplierItem.kode_suplier
  }

  if (filters.enableTglDatang) {
    params.tgl_datang_awal = filters.tgl_datang_awal
    params.tgl_datang_akhir = filters.tgl_datang_akhir
  }

  if (filters.enableTglTempo) {
    params.tgl_tempo_awal = filters.tgl_tempo_awal
    params.tgl_tempo_akhir = filters.tgl_tempo_akhir
  }

  try {
    const res = await keuanganHutangService.getHutangVendorFarmasiDetail(params)
    if (res.data.success) {
      detailInvoices.value = res.data.data || []
    } else {
      toast.error('Gagal mengambil rincian faktur')
    }
  } catch (error) {
    console.error('Error fetching invoices detail:', error)
    toast.error('Gagal mengambil rincian data dari server')
  } finally {
    detailLoading.value = false
  }
}

// Formatting helpers
const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00') return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const isOverdue = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00') return false
  const deadline = new Date(dateStr)
  const todayDate = new Date()
  todayDate.setHours(0,0,0,0)
  return deadline < todayDate
}

const getStatusBadgeClass = (status) => {
  if (status === 'Belum Dibayar') return 'badge bg-danger-subtle text-danger border border-danger-subtle'
  if (status === 'Belum Lunas') return 'badge bg-warning-subtle text-warning-dark border border-warning-subtle'
  return 'badge bg-secondary-subtle text-secondary'
}

// Export Parent Summary List to Excel
const exportToExcel = () => {
  const data = items.value.map(item => ({
    'Kode Supplier': item.kode_suplier,
    'Nama Supplier': item.nama_suplier,
    'Total Tagihan': parseFloat(item.total_tagihan),
    'Total Bayar': parseFloat(item.total_bayar),
    'Sisa Hutang (Outstanding)': parseFloat(item.sisa_hutang)
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  
  // Format total summary row
  const totalRow = {
    'Kode Supplier': 'TOTAL OUTSTANDING',
    'Nama Supplier': '',
    'Total Tagihan': items.value.reduce((acc, c) => acc + parseFloat(c.total_tagihan), 0),
    'Total Bayar': items.value.reduce((acc, c) => acc + parseFloat(c.total_bayar), 0),
    'Sisa Hutang (Outstanding)': summaryData.total_hutang
  }
  XLSX.utils.sheet_add_json(ws, [totalRow], { skipHeader: true, origin: -1 })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Summary Hutang")
  XLSX.writeFile(wb, `Ringkasan_Hutang_Vendor_Farmasi_${today}.xlsx`)
  toast.success('Excel summary berhasil diunduh')
}

// Export Supplier Invoice Details list to Excel (Helicopter View detail download)
const exportDetailToExcel = () => {
  const data = detailInvoices.value.map(inv => ({
    'No. Faktur': inv.no_faktur,
    'No. Order': inv.no_order || '-',
    'Tanggal Datang': inv.tgl_pesan,
    'Tanggal Jatuh Tempo': inv.tgl_tempo,
    'Tagihan': parseFloat(inv.tagihan),
    'Besar Bayar': parseFloat(inv.besar_bayar),
    'Sisa Hutang': parseFloat(inv.sisa_hutang),
    'Status': inv.status
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  
  // Summary Row inside detail Sheet
  const totalRow = {
    'No. Faktur': 'TOTAL OUTSTANDING',
    'No. Order': '',
    'Tanggal Datang': '',
    'Tanggal Jatuh Tempo': '',
    'Tagihan': detailInvoices.value.reduce((acc, c) => acc + parseFloat(c.tagihan), 0),
    'Besar Bayar': detailInvoices.value.reduce((acc, c) => acc + parseFloat(c.besar_bayar), 0),
    'Sisa Hutang': selectedSupplier.outstanding,
    'Status': ''
  }
  XLSX.utils.sheet_add_json(ws, [totalRow], { skipHeader: true, origin: -1 })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Rincian Faktur")
  XLSX.writeFile(wb, `Rincian_Hutang_${selectedSupplier.code}_${today}.xlsx`)
  toast.success('Excel detail faktur berhasil diunduh')
}

// Export Summary List to PDF File
const exportToPDF = async () => {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // Header Kop
  const logoImg = await loadImage(logoSquare)
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 15, 8, 15, 15)
  }

  const larsiImg = await loadImage(logoLarsi)
  if (larsiImg) {
    const larsiHeight = 12
    const larsiWidth = larsiHeight * (larsiImg.naturalWidth / larsiImg.naturalHeight)
    doc.addImage(larsiImg, 'PNG', 195 - larsiWidth, 9, larsiWidth, larsiHeight)
  }

  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('RSIA AISYIYAH PEKAJANGAN PEKALONGAN', 33, 12)
  
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Jl. Raya Pekajangan No. 612, Pekajangan, Kec. Kedungwuni, Pekalongan, Jawa Tengah 51151', 33, 17)
  doc.text('Telp: (0285) 785909 | Email: rsiapeka@yahoo.co.id', 33, 21)
  
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(15, 27, 195, 27) // Line separator

  // Title Section below KOP
  doc.setTextColor(0, 0, 0)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('LAPORAN RINGKASAN HUTANG VENDOR FARMASI', 105, 35, { align: 'center' })
  
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(50)
  
  let filterText = 'Periode: Semua'
  if (filters.enableTglDatang && filters.enableTglTempo) {
    filterText = `Tgl Datang: ${formatDate(filters.tgl_datang_awal)} s/d ${formatDate(filters.tgl_datang_akhir)} | Tgl Tempo: ${formatDate(filters.tgl_tempo_awal)} s/d ${formatDate(filters.tgl_tempo_akhir)}`
  } else if (filters.enableTglDatang) {
    filterText = `Tgl Datang: ${formatDate(filters.tgl_datang_awal)} s/d ${formatDate(filters.tgl_datang_akhir)}`
  } else if (filters.enableTglTempo) {
    filterText = `Tgl Tempo: ${formatDate(filters.tgl_tempo_awal)} s/d ${formatDate(filters.tgl_tempo_akhir)}`
  }
  doc.text(filterText, 15, 43)
  
  doc.text(`Total Outstanding Hutang: ${formatRupiah(summaryData.total_hutang)}`, 15, 48)

  const head = [['Kode', 'Nama Supplier', 'Total Tagihan', 'Total Bayar', 'Sisa Hutang']]
  
  const body = items.value.map(item => [
    item.kode_suplier,
    item.nama_suplier,
    formatRupiah(item.total_tagihan),
    formatRupiah(item.total_bayar),
    formatRupiah(item.sisa_hutang)
  ])

  // Total summary footer inside PDF
  body.push([
    'TOTAL',
    '',
    formatRupiah(items.value.reduce((acc, c) => acc + parseFloat(c.total_tagihan), 0)),
    formatRupiah(items.value.reduce((acc, c) => acc + parseFloat(c.total_bayar), 0)),
    formatRupiah(summaryData.total_hutang)
  ])

  autoTable(doc, {
    head: head,
    body: body,
    startY: 53,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // blue color
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Bold final row (total)
      if (data.row.index === body.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    }
  })

  const pdfBlob = doc.output('blob')
  const blobUrl = URL.createObjectURL(pdfBlob)
  window.open(blobUrl, '_blank')
  toast.success('PDF summary berhasil dibuka')
}

const exportDetailToPDF = async () => {
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // Header Kop
  const logoImg = await loadImage(logoSquare)
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', 15, 8, 15, 15)
  }

  const larsiImg = await loadImage(logoLarsi)
  if (larsiImg) {
    const larsiHeight = 12
    const larsiWidth = larsiHeight * (larsiImg.naturalWidth / larsiImg.naturalHeight)
    doc.addImage(larsiImg, 'PNG', 195 - larsiWidth, 9, larsiWidth, larsiHeight)
  }

  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('RSIA AISYIYAH PEKAJANGAN PEKALONGAN', 33, 12)
  
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text('Jl. Raya Pekajangan No. 612, Pekajangan, Kec. Kedungwuni, Pekalongan, Jawa Tengah 51151', 33, 17)
  doc.text('Telp: (0285) 785909 | Email: rsiapeka@yahoo.co.id', 33, 21)
  
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(15, 27, 195, 27) // Line separator

  // Title Section below KOP
  doc.setTextColor(0, 0, 0)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('LAPORAN RINCIAN HUTANG VENDOR FARMASI', 105, 35, { align: 'center' })

  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(50)
  doc.text(`Supplier: ${selectedSupplier.nama} (${selectedSupplier.code})`, 15, 43)
  doc.text(`Tanggal Cetak: ${formatDate(today)}`, 15, 48)
  doc.text(`Total Outstanding: ${formatRupiah(selectedSupplier.outstanding)}`, 15, 53)

  const head = [['No. Faktur', 'No. Order', 'Tgl Datang', 'Tgl Tempo', 'Tagihan', 'Sudah Dibayar', 'Sisa Hutang', 'Status']]
  const body = detailInvoices.value.map(inv => [
    inv.no_faktur,
    inv.no_order || '-',
    formatDate(inv.tgl_pesan),
    formatDate(inv.tgl_tempo),
    formatRupiah(inv.tagihan),
    formatRupiah(inv.besar_bayar),
    formatRupiah(inv.sisa_hutang),
    inv.status
  ])

  body.push([
    'TOTAL OUTSTANDING',
    '',
    '',
    '',
    formatRupiah(detailInvoices.value.reduce((acc, c) => acc + parseFloat(c.tagihan), 0)),
    formatRupiah(detailInvoices.value.reduce((acc, c) => acc + parseFloat(c.besar_bayar), 0)),
    formatRupiah(selectedSupplier.outstanding),
    ''
  ])

  autoTable(doc, {
    head: head,
    body: body,
    startY: 58,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.row.index === body.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
      }
    }
  })

  const pdfBlob = doc.output('blob')
  const blobUrl = URL.createObjectURL(pdfBlob)
  window.open(blobUrl, '_blank')
  toast.success('PDF detail faktur berhasil dibuka')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.hutang-vendor-container {
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

/* Filters Card */
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
}

.filter-date, .filter-input {
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

.filter-date:focus:not(:disabled), .filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

.filter-date:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.cursor-pointer {
  cursor: pointer;
}

/* Premium Stat Cards */
.stat-card.premium {
  padding: 1.5rem;
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card.premium:hover { 
  transform: translateY(-3px); 
}

.stat-card.red { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
.stat-card.purple { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); }
.stat-card.orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.stat-card.blue { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }

.stat-body {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-icon-wrapper {
  position: absolute;
  right: -10px;
  top: -10px;
  font-size: 4.5rem;
  opacity: 0.18;
  transform: rotate(15deg);
}

.stat-info h3 {
  font-weight: 800;
  letter-spacing: -0.025em;
}

.stat-footer {
  margin-top: auto;
  font-weight: 500;
}

/* Content Card & Tables */
.content-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02) !important;
  overflow: hidden;
}

.card-header-modern {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.85rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.table tbody td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
}

.hover-row {
  cursor: default;
}

.hover-row:hover {
  background-color: #f8fafc;
}

.numeric-text {
  font-weight: 600;
}

.fw-extrabold {
  font-weight: 800;
}

.font-500 {
  font-weight: 500;
}

.text-warning-dark {
  color: #d97706;
}

.bg-warning-subtle {
  background-color: #fef3c7;
}

.bg-danger-subtle {
  background-color: #fee2e2;
}

/* Modal and Detail Page Styling */
.icon-box-sm {
  align-items: center;
  justify-content: center;
}

.bg-primary-subtle {
  background-color: #e0f2fe;
}

.hover-row-light:hover {
  background-color: #f8fafc;
}

.text-sm {
  font-size: 0.825rem;
}

.btn-detail-drill {
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-detail-drill:hover {
  transform: scale(1.05);
}

.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

</style>
