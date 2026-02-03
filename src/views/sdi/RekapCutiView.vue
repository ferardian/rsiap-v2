<template>
  <div class="p-3">
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <!-- Header Section -->
      <div class="card-header bg-gradient-deep border-0 py-3">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 class="mb-0 text-white fw-bold">Rekapitulasi Cuti Pegawai</h5>
            <p class="mb-0 text-white-50 small">Monitoring jatah & sisa cuti per semester</p>
          </div>
          <div class="d-flex gap-2">
            <div class="input-group input-group-sm custom-search" style="width: 250px;">
              <span class="input-group-text bg-white border-0 ps-3"><i class="bi bi-search text-muted"></i></span>
              <input 
                type="text" 
                class="form-control border-0 py-2 shadow-none" 
                placeholder="Cari Nama / NIK..." 
                v-model="filters.search"
                @input="handleSearch"
              >
            </div>
            <select class="form-select form-select-sm border-0 rounded-3 shadow-none fw-bold" style="width: 100px;" v-model="filters.year" @change="fetchData">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="card-body bg-light-soft border-bottom py-0">
        <ul class="nav nav-tabs border-0">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 1 }" @click="switchTab(1)" href="javascript:void(0)">
              <i class="bi bi-calendar-check me-1"></i> Tahunan
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 2 }" @click="switchTab(2)" href="javascript:void(0)">
              <i class="bi bi-heart-pulse me-1"></i> Bersalin
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 3 }" @click="switchTab(3)" href="javascript:void(0)">
              <i class="bi bi-file-earmark-text me-1"></i> Diluar Tanggungan
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 4 }" @click="switchTab(4)" href="javascript:void(0)">
              <i class="bi bi-calendar-range me-1"></i> Besar
            </a>
          </li>
        </ul>
      </div>

      <!-- Filters Row -->
      <div class="card-body bg-light-soft border-bottom py-2">
        <div class="d-flex align-items-center gap-2">
          <span class="smallest fw-bold text-muted text-uppercase tracking-wider">Departemen:</span>
          <select class="form-select form-select-sm border-0 rounded-3 shadow-sm w-auto" v-model="filters.dep_id" @change="fetchData">
            <option value="">Semua Departemen</option>
            <option v-for="d in departemenOptions" :key="d.dep_id" :value="d.dep_id">{{ d.nama }}</option>
          </select>
        </div>
      </div>

      <!-- Table Section for Tahunan -->
      <div v-if="activeTab === 1" class="table-responsive">
        <table class="table table-hover align-middle mb-0 text-center custom-table">
          <thead>
            <tr class="bg-white border-bottom small-label text-dark fw-bold">
              <th rowspan="2" class="ps-4 py-4 text-start vertical-middle">PEGAWAI</th>
              <th colspan="2" class="py-3 bg-primary-soft border-start border-end">SEMESTER 1 (JAN-JUN)</th>
              <th colspan="2" class="py-3 bg-success-soft">SEMESTER 2 (JUL-DES)</th>
            </tr>
            <tr class="bg-white border-bottom smallest tracking-wider text-muted fw-bold">
              <th class="py-2 border-start">DIAMBIL</th>
              <th class="py-2 border-end">SISA</th>
              <th class="py-2">DIAMBIL</th>
              <th class="py-2">SISA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && items.length === 0">
              <td colspan="5" class="py-5 text-center">
                <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                <span class="text-muted small">Memuat data...</span>
              </td>
            </tr>
            <tr v-else-if="items.length === 0" class="border-0">
              <td colspan="5" class="py-5 text-center text-muted border-0">
                <i class="bi bi-inbox fs-2 d-block mb-2 opacity-25"></i>
                Data tidak ditemukan
              </td>
            </tr>
            <tr v-for="item in items" :key="item.nik" class="table-row">
              <td class="ps-4 text-start py-3">
                <div class="d-flex flex-column">
                  <span class="fw-bold text-dark lh-sm">{{ item.nama }}</span>
                  <span class="smallest text-muted">{{ item.nik }} • {{ item.departemen }}</span>
                </div>
              </td>
              <td class="bg-primary-soft-v2 fw-bold text-primary">{{ item.s1_took }}</td>
              <td class="bg-primary-soft border-end fw-bold" :class="item.s1_left < 2 ? 'text-danger' : 'text-dark'">
                {{ item.s1_left }}
              </td>
              <td class="bg-success-soft-v2 fw-bold text-success">{{ item.s2_took }}</td>
              <td class="bg-success-soft fw-bold" :class="item.s2_left < 2 ? 'text-danger' : 'text-dark'">
                {{ item.s2_left }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Section for Other Types (List Mode) -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0 custom-table">
          <thead>
            <tr class="bg-white border-bottom small-label text-dark fw-bold">
              <th class="ps-4 py-3 text-start">NAMA PEGAWAI</th>
              <th class="py-3">NIK</th>
              <th class="py-3">DEPARTEMEN</th>
              <th class="py-3" v-if="activeTab === 2">TGL MULAI</th>
              <th class="py-3" v-if="activeTab === 2">TGL SELESAI</th>
              <th class="py-3" v-if="activeTab !== 2">TANGGAL CUTI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading && items.length === 0">
              <td :colspan="activeTab === 2 ? 5 : 4" class="py-5 text-center">
                <div class="spinner-border text-primary spinner-border-sm me-2"></div>
                <span class="text-muted small">Memuat data...</span>
              </td>
            </tr>
            <tr v-else-if="items.length === 0" class="border-0">
              <td :colspan="activeTab === 2 ? 5 : 4" class="py-5 text-center text-muted border-0">
                <i class="bi bi-inbox fs-2 d-block mb-2 opacity-25"></i>
                Data tidak ditemukan
              </td>
            </tr>
            <tr v-for="item in items" :key="item.id_cuti" class="table-row">
              <td class="ps-4 text-start py-3">
                <span class="fw-bold text-dark">{{ item.nama }}</span>
              </td>
              <td class="text-center py-3">
                <span class="text-muted small">{{ item.nik }}</span>
              </td>
              <td class="text-center py-3">
                <span class="text-muted small">{{ item.departemen }}</span>
              </td>
              <td class="text-center py-3" v-if="activeTab === 2">
                <span class="badge bg-primary-soft text-primary">{{ formatDate(item.tgl_mulai) }}</span>
              </td>
              <td class="text-center py-3" v-if="activeTab === 2">
                <span class="badge bg-success-soft text-success">{{ formatDate(item.tgl_selesai) }}</span>
              </td>
              <td class="text-center py-3" v-if="activeTab !== 2">
                <span class="badge bg-info-soft text-info">{{ formatDate(item.tanggal_cuti) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import cutiService from '@/services/cutiService'
import _ from 'lodash'

const loading = ref(false)
const items = ref([])
const departemenOptions = ref([])
const activeTab = ref(1) // 1=Tahunan, 2=Bersalin, 3=Diluar Tanggungan, 4=Besar
const filters = reactive({
  search: '',
  year: new Date().getFullYear(),
  dep_id: ''
})

const yearOptions = [
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1
]

const switchTab = (tabId) => {
  activeTab.value = tabId
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...filters,
      id_jenis: activeTab.value
    }
    const res = await cutiService.getRekapCuti(params)
    items.value = res.data.response
  } catch (error) {
    console.error('Failed to fetch rekap cuti:', error)
  } finally {
    loading.value = false
  }
}

const fetchDepartemen = async () => {
  try {
    const res = await cutiService.getDepartemen()
    departemenOptions.value = res.data.data || []
  } catch (error) {
    console.error('Failed to fetch departemen:', error)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const handleSearch = _.debounce(() => {
  fetchData()
}, 500)

onMounted(() => {
  fetchDepartemen()
  fetchData()
})
</script>

<style scoped>
.bg-gradient-deep {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.bg-light-soft {
  background-color: #f8fafc;
}

.custom-search .input-group-text {
  border-radius: 12px 0 0 12px;
}

.custom-search .form-control {
  border-radius: 0 12px 12px 0;
  font-size: 0.9rem;
}

.small-label {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.smallest {
  font-size: 0.7rem;
}

.tracking-wider {
  letter-spacing: 0.1em;
}

.bg-primary-soft { background-color: rgba(13, 110, 253, 0.05); }
.bg-primary-soft-v2 { background-color: rgba(13, 110, 253, 0.02); }
.bg-success-soft { background-color: rgba(25, 135, 84, 0.05); }
.bg-success-soft-v2 { background-color: rgba(25, 135, 84, 0.02); }
.bg-info-soft { background-color: rgba(13, 202, 240, 0.1); }

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: rgba(0, 0, 0, 0.01) !important;
}

.vertical-middle {
  vertical-align: middle;
}

.custom-table thead th {
  border-bottom-width: 1px;
}

.custom-table tbody td {
  border-bottom-color: #f1f5f9;
}

.nav-tabs {
  margin-bottom: 0;
}

.nav-tabs .nav-link {
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1.25rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  color: #0f172a;
  background-color: rgba(0, 0, 0, 0.02);
}

.nav-tabs .nav-link.active {
  color: #0f172a;
  background-color: white;
  border-bottom: 3px solid #3b82f6;
}

.badge {
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
}
</style>
