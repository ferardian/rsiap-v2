<template>
  <div class="stok-opname-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">📦 Stok Opname Farmasi</h1>
          <p class="page-subtitle">Penyesuaian stok fisik secara massal</p>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'worksheet' }" href="#" @click.prevent="activeTab = 'worksheet'">
                <i class="fas fa-edit me-2"></i>Lembar Kerja
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'history' }" href="#" @click.prevent="loadHistory(1); activeTab = 'history'">
                <i class="fas fa-history me-2"></i>Riwayat Opname
            </a>
        </li>
    </ul>

    <!-- Tab 1: Lembar Kerja -->
    <div v-if="activeTab === 'worksheet'" class="d-flex flex-column flex-grow-1" style="min-height: 0;">
        <!-- Header Controls -->
        <div class="card mb-3" style="overflow: visible; z-index: 100;">
            <div class="card-body" style="overflow: visible;">
                <div class="row g-3">
                     <div class="col-md-3">
                        <label class="form-label">Tanggal Opname</label>
                        <input v-model="session.tanggal" type="date" class="form-control">
                    </div>
                     <div class="col-md-3">
                        <label class="form-label">Lokasi / Bangsal</label>
                         <v-select 
                            v-model="session.kd_bangsal" 
                            :options="bangsals" 
                            label="nm_bangsal" 
                            :reduce="option => option.kd_bangsal"
                            placeholder="Pilih Lokasi"
                            :disabled="items.length > 0 && hasChanges"
                        />
                    </div>
                     <div class="col-md-4">
                        <label class="form-label">Keterangan</label>
                        <input v-model="session.keterangan" type="text" class="form-control" placeholder="Keterangan opname...">
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button class="btn btn-primary w-100" @click="loadItems" :disabled="!isSessionValid || loading">
                             <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                             <i v-else class="fas fa-list me-1"></i> Tampilkan
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data Sheet -->
        <div v-if="items.length > 0 || hasSearched" class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
             <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3" style="flex: 1;">
                     <h6 class="mb-0 fw-bold"><i class="fas fa-table me-2"></i>Lembar Kerja Opname</h6>
                     
                     <!-- Filter Select -->
                     <select v-model="filterStok" @change="loadItems(1)" class="form-select form-select-sm" style="max-width: 150px;">
                         <option value="">Semua Stok</option>
                         <option value="0">Stok 0</option>
                         <option value=">0">Stok > 0</option>
                     </select>

                     <div class="input-group input-group-sm" style="max-width: 300px;">
                        <span class="input-group-text bg-light"><i class="fas fa-search"></i></span>
                        <input v-model="searchQuery" @input="debounceSearch" type="text" class="form-control" placeholder="Cari barang...">
                     </div>
                </div>
                
                <div class="d-flex gap-2 align-items-center">
                     <button v-if="hasChanges" class="btn btn-warning text-white btn-sm px-3 text-nowrap" @click="resetChanges">
                         <i class="fas fa-undo me-1"></i> Reset
                     </button>
                     <button class="btn btn-success btn-sm px-3 text-nowrap" @click="saveChanges" :disabled="!hasChanges || saving">
                          <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                          <i v-else class="fas fa-save me-1"></i> Simpan ({{ changesCount }})
                     </button>
                </div>
             </div>
             
             <div class="card-body p-0 d-flex flex-column" style="overflow: hidden;">
                 <div class="table-responsive flex-grow-1" style="overflow-y: auto;">
                     <table class="table table-bordered table-hover mb-0 sticky-header table-sm" style="font-size: 0.8rem;">
                         <thead class="table-light">
                             <tr class="text-nowrap">
                                 <th style="width: 100px; min-width: 100px;" class="text-center bg-light sticky-col z-20">Real</th>
                                 <th style="min-width: 120px;">Kode Barang</th>
                                 <th style="min-width: 250px;">Nama Barang</th>
                                 <th>Jenis</th>
                                 <th>Satuan</th>
                                 <th class="text-end">Harga</th>
                                 <th class="text-center">Stok</th>
                                 <th class="text-center">Selisih</th>
                                 <th class="text-center">Lebih</th>
                                 <th class="text-end">Nominal Hilang (Rp)</th>
                                 <th class="text-end">Nominal Lebih (Rp)</th>
                                 <th>No. Batch</th>
                                 <th>No. Faktur</th>
                             </tr>
                         </thead>
                         <tbody>
                             <tr v-if="loadingItems">
                                 <td colspan="13" class="text-center py-5">
                                     <div class="spinner-border text-primary"></div>
                                 </td>
                             </tr>
                             <tr v-else-if="items.length === 0">
                                 <td colspan="13" class="text-center py-5 text-muted">Tidak ada data barang.</td>
                             </tr>
                             <tr v-for="(item, index) in items" :key="item.kode_brng + (item.no_batch || 'no_batch') + (item.no_faktur || 'no_faktur')" :class="{'bg-warning-subtle': isModified(item)}">
                                 <td class="p-1 sticky-col bg-white z-20" :class="{'bg-warning-subtle': isModified(item)}">
                                     <input 
                                        v-model.number="item.real" 
                                        type="number"
                                        step="any"
                                        class="form-control form-control-sm text-center fw-bold text-primary border-0 shadow-none bg-transparent"
                                        placeholder="0"
                                        @focus="$event.target.select()"
                                     >
                                 </td>
                                 <td><code>{{ item.kode_brng }}</code></td>
                                 <td class="fw-semibold text-wrap">{{ item.nama_brng }}</td>
                                 <td>{{ item.jenis_nama || '-' }}</td>
                                 <td>{{ item.satuan_nama || '-' }}</td>
                                 <td class="text-end">{{ formatCurrency(item.h_beli) }}</td>
                                 <td class="text-center bg-light">{{ item.stok || 0 }}</td>
                                 
                                 <!-- Selisih (Kurang) -->
                                 <td class="text-center fw-bold text-danger">
                                     {{ getSelisih(item) < 0 ? Math.abs(getSelisih(item)) : 0 }}
                                 </td>
                                 
                                 <!-- Lebih -->
                                 <td class="text-center fw-bold text-success">
                                    {{ getSelisih(item) > 0 ? getSelisih(item) : 0 }}
                                 </td>

                                 <!-- Nominal Hilang -->
                                 <td class="text-end text-danger">
                                    {{ formatCurrency(getNominalHilang(item)) }}
                                 </td>

                                 <!-- Nominal Lebih -->
                                 <td class="text-end text-success">
                                    {{ formatCurrency(getNominalLebih(item)) }}
                                 </td>

                                 <td>{{ item.no_batch || '-' }}</td>
                                 <td class="small text-muted">{{ item.no_faktur || '-' }}</td>
                             </tr>
                         </tbody>
                     </table>
                 </div>
                 <!-- Pagination -->
                 <div class="border-top p-2 d-flex justify-content-between align-items-center bg-light">
                     <span class="small text-muted">
                         Menampilkan {{ pagination.from || 0 }} - {{ pagination.to || 0 }} dari {{ pagination.total || 0 }} item
                     </span>
                     <nav v-if="pagination.last_page > 1">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                                <button class="page-link" @click="changePage(pagination.current_page - 1)">Prev</button>
                            </li>
                            <li class="page-item active">
                                 <span class="page-link">{{ pagination.current_page }}</span>
                            </li>
                            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                                <button class="page-link" @click="changePage(pagination.current_page + 1)">Next</button>
                            </li>
                        </ul>
                     </nav>
                 </div>
             </div>
        </div>
    </div>

    <!-- Tab 2: Riwayat Opname -->
    <div v-if="activeTab === 'history'" class="d-flex flex-column flex-grow-1" style="min-height: 0;">
         <!-- History Filters -->
        <div class="card mb-3">
             <div class="card-body py-3">
                 <div class="row g-3">
                     <div class="col-md-3">
                        <label class="form-label small mb-1">Tanggal</label>
                        <input v-model="historyFilter.tanggal" type="date" class="form-control form-control-sm" @change="loadHistory(1)">
                    </div>
                     <div class="col-md-3">
                        <label class="form-label small mb-1">Lokasi / Bangsal</label>
                         <v-select 
                            v-model="historyFilter.kd_bangsal" 
                            :options="bangsals" 
                            label="nm_bangsal" 
                            :reduce="option => option.kd_bangsal"
                            placeholder="Semua Lokasi"
                            class="style-chooser-sm"
                            @option:selected="loadHistory(1)"
                            @search:blur="loadHistory(1)"
                        />
                    </div>
                 </div>
             </div>
        </div>

        <!-- History Table -->
        <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
            <div class="card-body p-0 d-flex flex-column" style="overflow: hidden;">
                 <div class="table-responsive flex-grow-1">
                     <table class="table table-bordered table-hover align-middle mb-0" style="font-size: 0.85rem;">
                         <thead class="bg-light text-secondary sticky-top">
                             <tr>
                                 <th>Kode Barang</th>
                                 <th>Nama Barang</th>
                                 <th class="text-end">Harga Beli</th>
                                 <th>Satuan</th>
                                 <th>Tanggal</th>
                                 <th class="text-center">Stok</th>
                                 <th class="text-center">Real</th>
                                 <th class="text-center">Selisih</th>
                                 <th class="text-center">Lebih</th>
                                 <th class="text-end">Total Real</th>
                                 <th class="text-end">Nominal Hilang (Rp)</th>
                                 <th class="text-end">Nominal Lebih (Rp)</th>
                                 <th>Keterangan</th>
                                 <th>Kode Lokasi</th>
                                 <th>Nama Lokasi</th>
                                 <th>No. Batch</th>
                                 <th>No. Faktur</th>
                                 <th class="text-center" style="width: 50px;">Aksi</th>
                             </tr>
                         </thead>
                          <tbody>
                             <tr v-if="loadingHistory">
                                 <td colspan="18" class="text-center py-5">
                                     <div class="spinner-border text-primary spinner-border-sm"></div>
                                 </td>
                             </tr>
                             <tr v-else-if="historyItems.length === 0">
                                 <td colspan="18" class="text-center py-5 text-muted">Belum ada riwayat stok opname.</td>
                             </tr>
                             <tr v-for="hItem in historyItems" :key="hItem.no_batch + hItem.kode_brng + hItem.tanggal">
                                 <td><small class="text-muted">{{ hItem.kode_brng }}</small></td>
                                 <td><div class="fw-semibold">{{ hItem.barang?.nama_brng || hItem.kode_brng }}</div></td>
                                 <td class="text-end">{{ formatCurrency(hItem.h_beli) }}</td>
                                 <td>{{ hItem.barang?.satuan?.satuan || '-' }}</td>
                                 <td>{{ hItem.tanggal }}</td>
                                 <td class="text-center">{{ hItem.stok }}</td>
                                 <td class="text-center fw-bold">{{ hItem.real }}</td>
                                 <td class="text-center" :class="hItem.selisih < 0 ? 'text-danger' : (hItem.selisih > 0 ? 'text-success' : '')">
                                     {{ hItem.selisih }}
                                 </td>
                                 <td class="text-center">{{ hItem.lebih }}</td>
                                 <td class="text-end fw-bold">{{ formatCurrency(hItem.real * hItem.h_beli) }}</td>
                                 <td class="text-end text-danger">{{ formatCurrency(hItem.nomihilang) }}</td>
                                 <td class="text-end text-success">{{ formatCurrency(hItem.nomilebih) }}</td>
                                 <td>{{ hItem.keterangan }}</td>
                                 <td>{{ hItem.kd_bangsal }}</td>
                                 <td>{{ hItem.bangsal?.nm_bangsal || hItem.kd_bangsal }}</td>
                                 <td>{{ hItem.no_batch }}</td>
                                 <td>{{ hItem.no_faktur }}</td>
                                 <td class="text-center">
                                     <button class="btn btn-danger btn-sm p-1 px-2" @click="deleteHistory(hItem)" title="Hapus Riwayat">
                                         <i class="fas fa-trash-alt"></i>
                                     </button>
                                 </td>
                             </tr>
                          </tbody>
                     </table>
                 </div>
                  <!-- History Pagination -->
                 <div class="border-top p-2 d-flex justify-content-between align-items-center bg-light">
                     <span class="small text-muted">
                         Menampilkan {{ historyPagination.from || 0 }} - {{ historyPagination.to || 0 }} dari {{ historyPagination.total || 0 }} data
                     </span>
                     <nav v-if="historyPagination.last_page > 1">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: historyPagination.current_page === 1 }">
                                <button class="page-link" @click="loadHistory(historyPagination.current_page - 1)">Prev</button>
                            </li>
                            <li class="page-item active">
                                 <span class="page-link">{{ historyPagination.current_page }}</span>
                            </li>
                            <li class="page-item" :class="{ disabled: historyPagination.current_page === historyPagination.last_page }">
                                <button class="page-link" @click="loadHistory(historyPagination.current_page + 1)">Next</button>
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
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../services/api' 
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'

const activeTab = ref('worksheet')
const bangsals = ref([])
const items = ref([])
const loading = ref(false)
const loadingItems = ref(false)
const saving = ref(false)
const hasSearched = ref(false)
const searchQuery = ref('')
const filterStok = ref('')
const searchTimer = ref(null)

// History State
const historyItems = ref([])
const loadingHistory = ref(false)
const historyFilter = ref({
    tanggal: new Date().toISOString().slice(0, 10),
    kd_bangsal: null
})

const session = ref({
    tanggal: new Date().toISOString().slice(0, 10),
    kd_bangsal: '',
    keterangan: ''
})

const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
    from: 0,
    to: 0
})

const historyPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0
})

// Computed
const isSessionValid = computed(() => {
    return session.value.tanggal && session.value.kd_bangsal
})

const modifiedItems = computed(() => {
    return items.value.filter(item => item.real !== null && item.real !== undefined && item.real !== '')
})

const hasChanges = computed(() => modifiedItems.value.length > 0)
const changesCount = computed(() => modifiedItems.value.length)

// Methods
const fetchBangsals = async () => {
    try {
        const response = await api.get('/farmasi/stok-opname/bangsal')
        if (response.data && response.data.success) {
            bangsals.value = response.data.data
        }
    } catch (err) {
        console.error('Failed to fetch bangsals', err)
    }
}

const loadItems = async (page = 1) => {
    if (!isSessionValid.value) return

    if (!session.value.keterangan || session.value.keterangan.trim() === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Keterangan Kosong',
            text: 'Mohon isi keterangan opname terlebih dahulu sebelum menampilkan data.',
            confirmButtonText: 'OK'
        })
        return
    }
    
    // Alert if unsaved changes when changing page/refresh
    if (hasChanges.value && page !== pagination.value.current_page) {
         const confirm = await Swal.fire({
             title: 'Perubahan belum disimpan',
             text: 'Anda memiliki data yang belum disimpan. Pindah halaman akan mereset input.',
             icon: 'warning',
             showCancelButton: true,
             confirmButtonText: 'Lanjutkan (Reset)',
             cancelButtonText: 'Batal'
         })
         if (!confirm.isConfirmed) return
    }

    loadingItems.value = true
    hasSearched.value = true
    try {
        const params = {
            kd_bangsal: session.value.kd_bangsal,
            q: searchQuery.value,
            stok_filter: filterStok.value,
            page: page,
            limit: pagination.value.per_page
        }
        
        const response = await api.get('/farmasi/stok-opname/items', { params })
        if (response.data && response.data.success) {
            items.value = response.data.data.data.map(item => ({
                ...item,
                real: null // Initialize real input
            }))
            
            pagination.value = {
                current_page: response.data.data.current_page,
                last_page: response.data.data.last_page,
                per_page: response.data.data.per_page,
                total: response.data.data.total,
                from: response.data.data.from,
                to: response.data.data.to
            }
        }
    } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat data barang', 'error')
    } finally {
        loadingItems.value = false
        loading.value = false
    }
}

const debounceSearch = () => {
    clearTimeout(searchTimer.value)
    searchTimer.value = setTimeout(() => {
        loadItems(1)
    }, 500)
}

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
        loadItems(page)
    }
}

const isModified = (item) => {
    return item.real !== null && item.real !== undefined && item.real !== ''
}

const getSelisih = (item) => {
    if (!isModified(item)) return 0
    return item.real - item.stok
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('id-ID').format(value)
}

const getNominalHilang = (item) => {
    const diff = getSelisih(item)
    if (diff < 0) {
        return Math.abs(diff) * (item.h_beli || 0)
    }
    return 0
}

const getNominalLebih = (item) => {
    const diff = getSelisih(item)
    if (diff > 0) {
        return diff * (item.h_beli || 0)
    }
    return 0
}

const resetChanges = () => {
    items.value.forEach(item => item.real = null)
}

const saveChanges = async () => {
    if (!hasChanges.value) return

    if (!session.value.keterangan || session.value.keterangan.trim() === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Keterangan Wajib Diisi',
            text: 'Mohon isi keterangan opname terlebih dahulu!',
            confirmButtonText: 'OK'
        })
        return
    }

    saving.value = true
    try {
        const payload = {
            tanggal: session.value.tanggal,
            keterangan: session.value.keterangan || '-',
            items: modifiedItems.value.map(item => ({
                kd_bangsal: session.value.kd_bangsal, // Ensure we send the selected bangsal for all items
                kode_brng: item.kode_brng,
                no_batch: item.no_batch || '', // Handle null batch
                no_faktur: item.no_faktur || '', // Handle null faktur
                h_beli: item.h_beli || 0,
                real: item.real
            }))
        }

        const response = await api.post('/farmasi/stok-opname/bulk', payload)
        
        if (response.data && response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: response.data.message,
                timer: 1500,
                showConfirmButton: false
            })
            // Reload current page to refresh stock values and clear inputs
            loadItems(pagination.value.current_page)
        }
    } catch (err) {
        console.error(err)
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: err.response?.data?.message || 'Gagal menyimpan data'
        })
    } finally {
        saving.value = false
    }
}

const loadHistory = async (page = 1) => {
    loadingHistory.value = true
    try {
        const params = {
            page: page,
            limit: historyPagination.value.per_page,
            tanggal: historyFilter.value.tanggal,
            kd_bangsal: historyFilter.value.kd_bangsal
        }
        
        const response = await api.get('/farmasi/stok-opname', { params })
        if (response.data && response.data.success) {
            historyItems.value = response.data.data.data
             historyPagination.value = {
                current_page: response.data.data.current_page,
                last_page: response.data.data.last_page,
                per_page: response.data.data.per_page,
                total: response.data.data.total,
                from: response.data.data.from,
                to: response.data.data.to
            }
        }
    } catch (err) {
        console.error('Failed to load history', err)
        Swal.fire('Error', 'Gagal memuat riwayat opname', 'error')
    } finally {
        loadingHistory.value = false
    }
}

const deleteHistory = async (item) => {
    const confirm = await Swal.fire({
        title: 'Hapus Riwayat Opname?',
        text: `Anda akan menghapus riwayat opname untuk "${item.barang?.nama_brng || item.kode_brng}" pada tanggal ${item.tanggal}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    })

    if (confirm.isConfirmed) {
        try {
            // Need to pass keys to identify composite primary key record
            // Opname keys: kode_brng, tanggal, kd_bangsal, no_batch, no_faktur
            const response = await api.delete('/farmasi/stok-opname', {
                data: {
                    kode_brng: item.kode_brng,
                    tanggal: item.tanggal,
                    kd_bangsal: item.kd_bangsal,
                    no_batch: item.no_batch,
                    no_faktur: item.no_faktur
                }
            })

            if (response.data && response.data.success) {
                Swal.fire(
                    'Terhapus!',
                    'Riwayat opname berhasil dihapus.',
                    'success'
                )
                // Refresh history
                loadHistory(historyPagination.value.current_page)
            }
        } catch (err) {
            console.error('Failed to delete history', err)
            Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat menghapus data', 'error')
        }
    }
}

watch(() => session.value.kd_bangsal, () => {
    items.value = []
    hasSearched.value = false
    searchQuery.value = ''
})

onMounted(() => {
    fetchBangsals()
})
</script>

<style scoped>
.stok-opname-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.page-header {
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

/* Sticky Headers */
.sticky-header thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.sticky-col {
    position: sticky;
    left: 0;
    border-right: 2px solid #dee2e6;
}
.z-20 {
    z-index: 20 !important;
}

/* Ensure sticky column header is above sticky row header */
.sticky-header thead th.sticky-col {
    z-index: 30 !important;
}
</style>
