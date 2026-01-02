<template>
  <div class="data-barang-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">💊 Data Barang Farmasi</h1>
          <p class="page-subtitle">Master data obat dan alkes</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'aktif' }" href="#" @click.prevent="activeTab = 'aktif'; fetchData(1)">
          <i class="fas fa-box me-2"></i>Data Aktif
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-danger" :class="{ active: activeTab === 'non-aktif' }" href="#" @click.prevent="activeTab = 'non-aktif'; fetchData(1)">
          <i class="fas fa-trash-alt me-2"></i>Data Non-Aktif
        </a>
      </li>
    </ul>

    <!-- Filter dan Search -->
    <div class="card mb-3 flex-shrink-0 border-top-0">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-7">
            <label class="form-label">Cari Data</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Cari nama barang, kode, kategori, atau kandungan..."
                @input="debounceSearch"
              />
            </div>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="fas fa-redo me-1"></i> Reset
            </button>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-success w-100" @click="exportData" :disabled="loadingExport">
              <span v-if="loadingExport" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="fas fa-file-excel me-1"></i> Export Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
      <div class="card-body d-flex flex-column" style="overflow: hidden;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0 text-muted"><i class="fas fa-table me-2"></i>Daftar Barang</h5>
            <button class="btn btn-primary" style="width: fit-content;" @click="openModal()">
                <i class="fas fa-plus me-2"></i>Tambah Barang
            </button>
        </div>

        <div v-if="loading && items.length === 0" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Memuat data barang...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-else-if="!loading && items.length === 0" class="text-center py-5">
          <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Tidak ada data barang</h5>
        </div>

        <div v-else class="table-responsive flex-grow-1" style="overflow-y: auto;" :class="{ 'opacity-50': loading }">
          <div v-if="loading" class="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style="z-index: 5; background: rgba(255,255,255,0.3);">
             <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
             </div>
          </div>
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Satuan Kecil</th>
                <th>Satuan Besar</th>
                <th>Kategori</th>
                <th>Jenis</th>
                <th class="text-end">Kapasitas</th>
                <th>Kandungan</th>
                <th>Kadaluarsa</th>
                <th style="width: 140px;" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="item in items" :key="item.kode_brng">
              <tr>
                <td><code>{{ item.kode_brng }}</code></td>
                <td class="fw-semibold">{{ item.nama_brng }}</td>
                <td>{{ item.satuan ? item.satuan.satuan : item.kode_sat }}</td>
                <td>{{ item.satuan_besar ? item.satuan_besar.satuan : item.kode_satbesar }}</td>
                <td>{{ item.kategori ? item.kategori.nama : item.kode_kategori }}</td>
                <td>{{ item.jenis ? item.jenis.nama : item.kdjns }}</td>
                <td class="text-end">{{ item.kapasitas }}</td>
                <td>{{ item.letak_barang }}</td>
                <td class="text-danger fw-semibold" style="font-size: 0.85rem;">{{ item.expire }}</td>
                <td class="text-end">
                   <div class="d-flex justify-content-end gap-1">
                       <template v-if="activeTab === 'aktif'">
                           <button 
                              class="btn btn-sm btn-icon rounded-circle transition-transform" 
                              :class="expandedRowId === item.kode_brng ? 'btn-primary rotate-180' : 'btn-outline-primary'"
                              @click="toggleDetails(item.kode_brng)"
                              style="width: 32px; height: 32px; padding: 0;"
                              title="Detail"
                           >
                              <i class="fas fa-chevron-down"></i>
                           </button>
                           <button class="btn btn-sm btn-icon btn-outline-warning rounded-circle" style="width: 32px; height: 32px; padding: 0;" @click="openModal(item)" title="Edit">
                               <i class="fas fa-pencil-alt"></i>
                           </button>
                           <button class="btn btn-sm btn-icon btn-outline-danger rounded-circle" style="width: 32px; height: 32px; padding: 0;" @click="deleteData(item.kode_brng)" title="Hapus">
                               <i class="fas fa-trash"></i>
                           </button>
                       </template>
                       <template v-else>
                            <button class="btn btn-sm btn-success text-white" @click="restoreData(item.kode_brng)" title="Aktifkan Kembali">
                                <i class="fas fa-undo me-1"></i> Restore
                            </button>
                       </template>
                   </div>
                </td>
              </tr>
              <!-- Expanded Row -->
              <tr v-if="expandedRowId === item.kode_brng" class="bg-light">
                <td colspan="10" class="p-4">
                  <div class="row g-3">
                    <div class="col-12 mb-2">
                      <div class="p-3 bg-white border rounded">
                        <div class="row g-3">
                          <div class="col-md-3">
                             <small class="text-muted d-block">Stok Minimal</small>
                             <span class="fw-bold">{{ item.stokminimal }}</span>
                          </div>
                          <div class="col-md-5">
                             <small class="text-muted d-block">Industri Farmasi</small>
                             <span class="fw-semibold">{{ item.industri ? item.industri.nama_industri : '-' }}</span>
                          </div>
                          <div class="col-md-4">
                             <small class="text-muted d-block">Golongan</small>
                             <span class="fw-semibold">{{ item.golongan ? item.golongan.nama : '-' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12"><h6 class="fw-bold text-primary mb-2"><i class="fas fa-tags me-2"></i>Informasi Harga</h6></div>
                    
                    <div class="col-md-3 col-sm-4">
                      <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body py-2 px-3">
                          <small class="text-muted d-block">Harga Dasar</small>
                          <span class="fw-bold">{{ formatCurrency(item.dasar) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3 col-sm-4">
                       <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body py-2 px-3">
                          <small class="text-muted d-block">Harga Beli</small>
                          <span class="fw-bold text-success">{{ formatCurrency(item.h_beli) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3 col-sm-4">
                       <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body py-2 px-3">
                          <small class="text-muted d-block">Ralan</small>
                          <span class="fw-bold">{{ formatCurrency(item.ralan) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-12"><hr class="my-1 text-muted opacity-25"></div>

                    <div class="col-md-2 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">Kelas 1</small>
                          <span class="fw-semibold">{{ formatCurrency(item.kelas1) }}</span>
                       </div>
                    </div>
                    <div class="col-md-2 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">Kelas 2</small>
                          <span class="fw-semibold">{{ formatCurrency(item.kelas2) }}</span>
                       </div>
                    </div>
                    <div class="col-md-2 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">Kelas 3</small>
                          <span class="fw-semibold">{{ formatCurrency(item.kelas3) }}</span>
                       </div>
                    </div>
                    <div class="col-md-2 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">Utama</small>
                          <span class="fw-semibold">{{ formatCurrency(item.utama) }}</span>
                       </div>
                    </div>
                    <div class="col-md-2 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">VIP</small>
                          <span class="fw-semibold">{{ formatCurrency(item.vip) }}</span>
                       </div>
                    </div>
                    <div class="col-md-2 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">VVIP</small>
                          <span class="fw-semibold">{{ formatCurrency(item.vvip) }}</span>
                       </div>
                    </div>

                     <div class="col-12"><hr class="my-1 text-muted opacity-25"></div>

                    <div class="col-md-3 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">Beli Luar</small>
                          <span class="fw-semibold">{{ formatCurrency(item.beliluar) }}</span>
                       </div>
                    </div>
                    <div class="col-md-3 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">Jual Bebas</small>
                          <span class="fw-semibold">{{ formatCurrency(item.jualbebas) }}</span>
                       </div>
                    </div>
                    <div class="col-md-3 col-sm-4">
                       <div class="p-2 bg-white rounded border">
                          <small class="text-muted d-block" style="font-size: 0.75rem;">Karyawan</small>
                          <span class="fw-semibold">{{ formatCurrency(item.karyawan) }}</span>
                       </div>
                    </div>
                  </div>
                </td>
              </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="d-flex justify-content-between align-items-center mt-3 flex-shrink-0">
          <div class="text-muted">
            Halaman {{ pagination.current_page }} dari {{ pagination.last_page }}
            (Total {{ pagination.total }} data)
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button class="page-link" @click="changePage(1)">First</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button class="page-link" @click="changePage(pagination.current_page - 1)">Prev</button>
              </li>
              <li class="page-item active">
                <button class="page-link">{{ pagination.current_page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link" @click="changePage(pagination.current_page + 1)">Next</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link" @click="changePage(pagination.last_page)">Last</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Data Barang' : 'Tambah Data Barang' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body" style="max-height: 85vh; overflow-y: auto;">
            <form @submit.prevent="saveData">
              <div class="row g-3">
                <div class="col-md-4">
                   <label class="form-label">Kode Barang</label>
                   <input v-model="form.kode_brng" type="text" class="form-control" :readonly="isEditing" required>
                </div>
                <div class="col-md-8">
                   <label class="form-label">Nama Barang</label>
                   <input v-model="form.nama_brng" type="text" class="form-control" required>
                </div>
                
                <div class="col-md-6">
                   <label class="form-label">Satuan Kecil</label>
                   <v-select 
                        v-model="form.kode_sat" 
                        :options="attributes.satuan" 
                        label="satuan" 
                        :reduce="option => option.kode_sat"
                        placeholder="Pilih Satuan"
                    />
                </div>
                <div class="col-md-6">
                   <label class="form-label">Satuan Besar</label>
                   <v-select 
                        v-model="form.kode_satbesar" 
                        :options="attributes.satuan" 
                        label="satuan" 
                        :reduce="option => option.kode_sat"
                        placeholder="Pilih Satuan Besar"
                    />
                </div>

                <div class="col-md-4">
                   <label class="form-label">Kategori</label>
                   <v-select 
                        v-model="form.kode_kategori" 
                        :options="attributes.kategori" 
                        label="nama" 
                        :reduce="option => option.kode"
                        placeholder="Pilih Kategori"
                    />
                </div>
                <div class="col-md-4">
                   <label class="form-label">Jenis</label>
                   <v-select 
                        v-model="form.kdjns" 
                        :options="attributes.jenis" 
                        label="nama" 
                        :reduce="option => option.kdjns"
                        placeholder="Pilih Jenis"
                    />
                </div>
                <div class="col-md-4">
                   <label class="form-label">Golongan</label>
                   <v-select 
                        v-model="form.kode_golongan" 
                        :options="attributes.golongan" 
                        label="nama" 
                        :reduce="option => option.kode"
                        placeholder="Pilih Golongan"
                    />
                </div>

                <div class="col-md-6">
                   <label class="form-label">Industri Farmasi</label>
                   <v-select 
                        v-model="form.kode_industri" 
                        :options="attributes.industri" 
                        label="nama_industri" 
                        :reduce="option => option.kode_industri"
                        placeholder="Pilih Industri"
                    />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Stok Minimal</label>
                    <input v-model="form.stokminimal" type="number" class="form-control" step="any">
                </div>

                <div class="col-md-4">
                    <label class="form-label">Kapasitas</label>
                    <input v-model="form.kapasitas" type="number" class="form-control" step="any">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Isi</label>
                    <input v-model="form.isi" type="number" class="form-control" step="any">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Kadaluarsa</label>
                    <input v-model="form.expire" type="date" class="form-control">
                </div>
                <div class="col-12">
                     <label class="form-label">Kandungan / Letak</label>
                     <input v-model="form.letak_barang" type="text" class="form-control">
                </div>

                <div class="col-12"><hr> <h6 class="mb-0">Harga</h6></div>
                
                 <div class="col-md-4">
                    <label class="form-label">Dasar</label>
                    <input v-model="form.dasar" type="number" class="form-control" step="any">
                </div>
                 <div class="col-md-4">
                    <label class="form-label">H. Beli</label>
                    <input v-model="form.h_beli" type="number" class="form-control" step="any">
                </div>
                 <div class="col-md-4">
                    <label class="form-label">Ralan</label>
                    <input v-model="form.ralan" type="number" class="form-control" step="any">
                </div>
                
                 <div class="col-md-3">
                    <label class="form-label small">Kelas 1</label>
                    <input v-model="form.kelas1" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">Kelas 2</label>
                    <input v-model="form.kelas2" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">Kelas 3</label>
                    <input v-model="form.kelas3" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">Utama</label>
                    <input v-model="form.utama" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">VIP</label>
                    <input v-model="form.vip" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">VVIP</label>
                    <input v-model="form.vvip" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">Beli Luar</label>
                    <input v-model="form.beliluar" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">Jual Bebas</label>
                    <input v-model="form.jualbebas" type="number" class="form-control form-control-sm" step="any">
                </div>
                 <div class="col-md-3">
                    <label class="form-label small">Karyawan</label>
                    <input v-model="form.karyawan" type="number" class="form-control form-control-sm" step="any">
                </div>

              </div>
              <div class="d-flex justify-content-end gap-2 mt-4">
                 <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
                 <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                    Simpan
                 </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../../services/api' 
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'

// State
const items = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15
})
const searchQuery = ref('')
const loading = ref(false)
const loadingExport = ref(false)
const error = ref(null)
const timer = ref(null)
const expandedRowId = ref(null)
const activeTab = ref('aktif')

// CRUD State
const showModal = ref(false)
const isEditing = ref(false)
const form = ref({
  kode_brng: '',
  nama_brng: '',
  kode_sat: '',
  kode_satbesar: '',
  kode_kategori: '',
  kdjns: '',
  kode_golongan: '',
  kode_industri: '',
  kapasitas: 0,
  letak_barang: '',
  stokminimal: 0,
  expire: '',
  dasar: 0,
  h_beli: 0,
  ralan: 0,
  isi: 1, // default conversion
  // harga lain bisa set default 0 atau hitung otomatis, sementara manual input
  kelas1: 0, kelas2: 0, kelas3: 0,
  utama: 0, vip: 0, vvip: 0,
  beliluar: 0, jualbebas: 0, karyawan: 0
})
const attributes = ref({
  kategori: [],
  jenis: [],
  satuan: [],
  industri: [],
  golongan: []
})
const saving = ref(false)

// Methods
const toggleDetails = (id) => {
  if (expandedRowId.value === id) {
    expandedRowId.value = null
  } else {
    expandedRowId.value = id
  }
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const fetchData = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const params = {
      page: page,
      limit: pagination.value.per_page,
      q: searchQuery.value,
      status: activeTab.value === 'aktif' ? '1' : '0'
    }
    const response = await api.get('/farmasi/databarang', { params })
    
    if (response.data && response.data.success) {
      items.value = response.data.data.data
      pagination.value = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        total: response.data.data.total,
        per_page: response.data.data.per_page
      }
    } else {
      error.value = 'Gagal mengambil data'
    }
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Terjadi kesalahan saat memuat data'
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(timer.value)
  timer.value = setTimeout(() => {
    fetchData(1)
  }, 500)
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchData(page)
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  fetchData(1)
}

const exportData = async () => {
  loadingExport.value = true
  try {
    const params = {
      q: searchQuery.value
    }
    const response = await api.get('/farmasi/databarang/export', { 
      params,
      responseType: 'blob' 
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const fileName = `data-barang-${new Date().toISOString().slice(0,10)}.csv`
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error(err)
    Swal.fire({
        icon: 'error',
        title: 'Export Gagal',
        text: 'Gagal mengekspor data'
    })
  } finally {
    loadingExport.value = false
  }
}


const fetchAttributes = async () => {
    try {
        const response = await api.get('/farmasi/databarang/attributes')
        if (response.data && response.data.success) {
            attributes.value = response.data.data
        }
    } catch (err) {
        console.error('Failed to fetch attributes', err)
    }
}

const openModal = async (item = null) => {
    if (item) {
        isEditing.value = true
        form.value = { ...item } // clone data
    } else {
        isEditing.value = false
        // reset form
        form.value = {
            kode_brng: '', nama_brng: '', kode_sat: '', kode_satbesar: '',
            kode_kategori: '', kdjns: '', kode_golongan: '', kode_industri: '',
            kapasitas: 0, letak_barang: '', stokminimal: 0, expire: '',
            dasar: 0, h_beli: 0, ralan: 0, isi: 1,
            kelas1: 0, kelas2: 0, kelas3: 0, utama: 0, vip: 0, vvip: 0,
            beliluar: 0, jualbebas: 0, karyawan: 0
        }
        
        // Fetch next code
        try {
            const response = await api.get('/farmasi/databarang/next-code')
            if (response.data && response.data.success) {
                form.value.kode_brng = response.data.code
            }
        } catch (err) {
            console.error('Failed to get next code', err)
        }
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const saveData = async () => {
    saving.value = true
    try {
        let response
        if (isEditing.value) {
            response = await api.put(`/farmasi/databarang/${form.value.kode_brng}`, form.value)
        } else {
            response = await api.post('/farmasi/databarang', form.value)
        }

        if (response.data && response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: response.data.message,
                timer: 1500,
                showConfirmButton: false
            })
            closeModal()
            fetchData(pagination.value.current_page) // refresh
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: response.data.message || 'Gagal menyimpan data'
            })
        }
    } catch (err) {
        console.error(err)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Terjadi kesalahan saat menyimpan data: ' + (err.response?.data?.message || err.message)
        })
    } finally {
        saving.value = false
    }
}

const deleteData = async (id) => {
    const result = await Swal.fire({
        title: 'Non-aktifkan data?',
        text: "Data akan disimpan sebagai non-aktif.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Non-aktifkan!',
        cancelButtonText: 'Batal'
    })

    if (!result.isConfirmed) return

    try {
        const response = await api.delete(`/farmasi/databarang/${id}`)
        if (response.data && response.data.success) {
            Swal.fire(
                'Terhapus!',
                response.data.message,
                'success'
            )
            fetchData(pagination.value.current_page)
        } else {
            Swal.fire(
                'Gagal!',
                response.data.message || 'Gagal menghapus data',
                'error'
            )
        }
    } catch (err) {
         console.error(err)
         Swal.fire(
            'Error!',
            'Gagal menghapus data',
            'error'
         )
    }
}

const restoreData = async (id) => {
    const result = await Swal.fire({
        title: 'Aktifkan kembali?',
        text: "Data akan dikembalikan ke daftar aktif.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Aktifkan!',
        cancelButtonText: 'Batal'
    })

    if (!result.isConfirmed) return

    try {
        const response = await api.post(`/farmasi/databarang/${id}/restore`)
        if (response.data && response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: response.data.message,
                timer: 1500,
                showConfirmButton: false
            })
            fetchData(pagination.value.current_page)
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: response.data.message || 'Gagal mengaktifkan data'
            })
        }
    } catch (err) {
         console.error(err)
         Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Terjadi kesalahan saat mengaktifkan data'
         })
    }
}

onMounted(() => {
  fetchAttributes()
  fetchData()
})
</script>

<style scoped>
.data-barang-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.page-header {
  margin-bottom: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #64748b;
  margin-bottom: 0;
  font-size: 0.95rem;
}

.rotate-180 {
  transform: rotate(180deg);
}
.transition-transform {
  transition: transform 0.2s ease;
}
.btn-icon:hover {
  background-color: #e9ecef;
}
.bg-primary-subtle {
    background-color: rgba(13, 110, 253, 0.1);
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.modal-dialog {
  width: 95%;
  max-width: 1200px;
  margin: 1rem auto;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,.2);
  border-radius: 0.5rem;
  outline: 0;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: calc(0.3rem - 1px);
  border-top-right-radius: calc(0.3rem - 1px);
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
}
</style>
