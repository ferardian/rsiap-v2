<template>
  <div class="tab-tarif-radiologi">
    <div class="card glass-card border-0 shadow-sm mt-2">
      <div class="card-body p-4">
        <!-- 1. Clean Header Row: Title on Left -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="tab-header-icon bg-warning-subtle text-warning shadow-2xs">
              <i class="fas fa-x-ray text-warning-dark fa-lg"></i>
            </div>
            <div>
              <h5 class="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                Tarif Radiologi
                <span class="badge bg-light text-secondary border px-2 py-0.5 fs-xs fw-semibold">
                  {{ pagination.total || 0 }} Tindakan
                </span>
              </h5>
              <p class="text-muted small m-0">Kelola master tarif pemeriksaan dan tindakan radiologi</p>
            </div>
          </div>
        </div>

        <!-- 2. Clean Dedicated Filter Toolbar -->
        <div class="filter-toolbar mb-4 p-2.5 rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <!-- Search Box -->
            <div class="filter-search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                v-model="filters.keyword" 
                type="text" 
                class="form-control filter-input" 
                placeholder="Cari nama pemeriksaan / kode..."
                @keyup.enter="fetchData"
              >
              <button 
                v-if="filters.keyword" 
                class="btn-clear-search" 
                @click="filters.keyword = ''; fetchData()"
                title="Hapus pencarian"
              >
                <i class="fas fa-times-circle"></i>
              </button>
            </div>

            <!-- Filter Kelas -->
            <select v-model="filters.kelas" class="form-select filter-select" @change="fetchData">
              <option value="">Semua Kelas</option>
              <option value="Rawat Jalan">Rawat Jalan</option>
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas VIP">Kelas VIP</option>
              <option value="Kelas VVIP">Kelas VVIP</option>
            </select>

            <!-- Reset Filter Button -->
            <button 
              v-if="filters.keyword || filters.kelas" 
              class="btn btn-light btn-sm filter-reset-btn" 
              @click="resetFilters"
              title="Reset Filter"
            >
              <i class="fas fa-undo me-1"></i> Reset
            </button>
          </div>

          <!-- Right Action: Refresh -->
          <div class="d-flex align-items-center gap-2">
            <button 
              class="btn btn-outline-secondary btn-sm px-3 filter-refresh-btn" 
              @click="fetchData" 
              :disabled="loading" 
              title="Segarkan Data"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              <span class="d-none d-sm-inline ms-1.5">Refresh</span>
            </button>
          </div>
        </div>

        <div class="table-responsive premium-table">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Pemeriksaan</th>
                <th>Kelas</th>
                <th class="text-end">Tarif Dokter</th>
                <th class="text-end">Tarif Petugas</th>
                <th class="text-end">Tarif DR & PR</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-warning spinner-sm"></div>
                  <p class="mt-2 text-muted small">Memuat data tarif radiologi...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open fa-3x mb-3 text-light"></i>
                  <p class="mb-0">Tidak ditemukan data tarif radiologi.</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.kd_jenis_prw" class="hover-row">
                <td>
                  <span class="badge bg-light text-dark border fw-bold">{{ item.kd_jenis_prw }}</span>
                </td>
                <td class="fw-bold text-dark" style="font-size: 0.8rem; white-space: normal; min-width: 250px;">{{ item.nm_perawatan }}</td>
                <td>
                  <div class="small fw-bold text-muted">{{ item.kelas }}</div>
                </td>
                <td class="text-end numeric-text">
                  {{ formatRupiah(item.tarif_tindakan_dokter) }}
                </td>
                <td class="text-end numeric-text">
                  {{ formatRupiah(item.tarif_tindakan_petugas) }}
                </td>
                <td class="text-end">
                  <span class="fw-bold text-success">{{ formatRupiah(item.total_byr) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav aria-label="Page navigation" class="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="small text-muted">
            Menampilkan data {{ pagination.from || 0 }} - {{ pagination.to || 0 }} dari {{ pagination.total || 0 }}
          </div>
          <ul class="pagination pagination-sm mb-0 shadow-sm">
            <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)"><i class="fas fa-chevron-left"></i></button>
            </li>
            <li class="page-item disabled">
              <span class="page-link text-dark fw-bold px-3">{{ pagination.current_page || 1 }} &nbsp;/&nbsp; {{ pagination.last_page || 1 }}</span>
            </li>
            <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
              <button class="page-link" @click="changePage(pagination.current_page + 1)"><i class="fas fa-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import keuanganTarifService from '@/services/keuanganTarifService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const items = ref([])

const filters = reactive({
  keyword: '',
  kelas: '',
  page: 1
})

const resetFilters = () => {
  filters.keyword = ''
  filters.kelas = ''
  filters.page = 1
  fetchData()
}

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0,
  prev_page_url: null,
  next_page_url: null
})

const changePage = (page) => {
  if (page < 1 || page > pagination.last_page) return
  filters.page = page
  fetchData()
}

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await keuanganTarifService.getTarifRadiologi(filters)
    if (res.data.success) {
      const respData = res.data.data
      items.value = respData.data || []
      
      pagination.current_page = respData.current_page
      pagination.last_page = respData.last_page
      pagination.from = respData.from
      pagination.to = respData.to
      pagination.total = respData.total
      pagination.prev_page_url = respData.prev_page_url
      pagination.next_page_url = respData.next_page_url
    } else if (res.data.metadata?.code === 200) {
      items.value = res.data.response.data || res.data.response
    } else {
      items.value = []
    }
  } catch (error) {
    console.error('Error fetching tarif radiologi', error)
    if (error.response?.status === 404) {
       items.value = [
          { kd_jenis_prw: 'RAD001', nm_perawatan: 'USG Abdomen', kelas: 'Rawat Jalan', tarif_tindakan_dokter: 200000, tarif_tindakan_petugas: 50000, total_byr: 300000, status: '1' },
          { kd_jenis_prw: 'RAD002', nm_perawatan: 'Thorax AP/PA', kelas: 'Kelas 3', tarif_tindakan_dokter: 80000, tarif_tindakan_petugas: 30000, total_byr: 150000, status: '1' }
       ]
    } else {
       toast.error('Gagal mengambil data tarif radiologi')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 16px; }

.tab-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-warning-subtle { background-color: #fef3c7; }
.text-warning-dark { color: #d97706; }

/* Dedicated Filter Toolbar */
.filter-toolbar {
  background-color: #f8fafc;
  border-color: #e2e8f0 !important;
}
.filter-search-box {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  flex-grow: 1;
}
.filter-search-box .search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}
.filter-input {
  height: 38px;
  border-radius: 10px;
  padding-left: 2.35rem;
  padding-right: 2.2rem;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  transition: all 0.2s;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}
.btn-clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
}
.btn-clear-search:hover { color: #64748b; }

.filter-select {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  background-color: #ffffff;
  width: auto;
  min-width: 140px;
}
.filter-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  outline: none;
}

.filter-reset-btn {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0 0.85rem;
  color: #64748b;
  display: inline-flex;
  align-items: center;
}
.filter-reset-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.filter-refresh-btn {
  height: 38px;
  border-radius: 10px;
  border-color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
  display: inline-flex;
  align-items: center;
}
.filter-refresh-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}

.tab-tarif-radiologi {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.table-responsive.premium-table { 
  background: white; 
  border-radius: 12px; 
  border: 1px solid #f1f5f9; 
  overflow-x: auto !important; 
  overflow-y: hidden; 
  -webkit-overflow-scrolling: touch; 
  width: 100%;
  max-width: 100%;
  display: block;
}
.table-responsive.premium-table::-webkit-scrollbar {
  height: 8px;
}
.table-responsive.premium-table::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.table-responsive.premium-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.table-responsive.premium-table::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.premium-table table { 
  margin-bottom: 0; 
  width: 100%;
  min-width: 780px;
}
.premium-table thead th { background: #f8fafc; color: #64748b; font-size: 0.70rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem 1rem; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
.premium-table tbody td { padding: 0.75rem 1rem; font-size: 0.85rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap; }
.hover-row:hover { background-color: #f8fafc; }
.numeric-text { font-family: inherit; font-weight: 500; }
.badge { padding: 0.4em 0.8em; font-weight: 700; }
.bg-success-subtle { background-color: #dcfce7; }
.bg-danger-subtle { background-color: #fee2e2; }
</style>
