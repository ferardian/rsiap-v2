<template>
  <div class="hais-report-container p-3 p-md-4">
    <!-- Header Section -->
    <div class="report-header brand-gradient shadow-lg rounded-4 p-4 mb-4 text-white animate__animated animate__fadeIn">
      <div class="row align-items-center">
        <div class="col-md-7">
          <div class="d-flex align-items-center mb-2">
            <div class="header-icon-bg me-3 glass-effect">
              <i class="fas fa-chart-pie fa-2x"></i>
            </div>
            <div>
              <h3 class="mb-0 fw-bold tracking-tight">Laporan HAIS Terintegrasi</h3>
              <p class="mb-0 opacity-75">Healthcare-Associated Infections Surveillance & Monitoring</p>
            </div>
          </div>
        </div>
        
        <!-- Filter Section -->
        <div class="col-md-5 mt-3 mt-md-0">
          <div class="glass-effect rounded-3 p-3 d-flex flex-wrap gap-2 align-items-end justify-content-md-end border border-white border-opacity-10">
            <div class="flex-grow-1" style="min-width: 120px;">
              <label class="text-xs fw-bold opacity-75 mb-1 text-uppercase">Bulan</label>
              <select class="form-select form-select-sm border-0 shadow-none glass-input text-white" v-model="filters.bulan">
                <option v-for="(name, index) in monthNames" :key="index" :value="index + 1" class="text-dark">{{ name }}</option>
              </select>
            </div>
            <div class="flex-grow-1" style="min-width: 100px;">
              <label class="text-xs fw-bold opacity-75 mb-1 text-uppercase">Tahun</label>
              <select class="form-select form-select-sm border-0 shadow-none glass-input text-white" v-model="filters.tahun">
                <option v-for="y in yearRange" :key="y" :value="y" class="text-dark">{{ y }}</option>
              </select>
            </div>
            <button class="btn btn-light btn-sm px-3 shadow-sm fw-bold border-0" @click="fetchData" :disabled="loading">
               <i v-if="loading" class="spinner-border spinner-border-sm me-1"></i>
               <i v-else class="fas fa-sync-alt me-1"></i>
               UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden animate__animated animate__fadeIn animate__delay-1s">
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-grow text-blue-600" role="status"></div>
      </div>

      <!-- Table Container -->
      <div class="table-responsive custom-scrollbar">
        <table class="table mb-0 hais-styled-table">
          <thead>
            <!-- Level 1 Header -->
            <tr class="header-level-1 text-uppercase">
              <th rowspan="2" class="align-middle text-start px-4" style="min-width: 150px;">Ruang / Unit</th>
              <th colspan="3" class="bg-yellow-pale text-yellow-900 border-start border-end">ISK <span class="badge-mini text-xs ms-1">UC</span></th>
              <th colspan="3" class="bg-blue-pale text-blue-900 border-end">VAP <span class="badge-mini text-xs ms-1">ETT</span></th>
              <th colspan="3" class="bg-yellow-pale text-yellow-900 border-end">IAD <span class="badge-mini text-xs ms-1">CVL</span></th>
              <th colspan="3" class="bg-blue-pale text-blue-900 border-end">PLEB <span class="badge-mini text-xs ms-1">IVL</span></th>
              <th colspan="3" class="bg-yellow-pale text-yellow-900">IDO <span class="badge-mini text-xs ms-1">OP</span></th>
            </tr>
            <!-- Level 2 Header -->
            <tr class="header-level-2 text-center text-xs fw-bold">
               <!-- ISK -->
               <th class="bg-yellow-subtle border-start">UC</th>
               <th class="bg-yellow-subtle">INFEKSI</th>
               <th class="bg-yellow-subtle border-end">‰</th>
               <!-- VAP -->
               <th class="bg-blue-subtle">ETT</th>
               <th class="bg-blue-subtle">INFEKSI</th>
               <th class="bg-blue-subtle border-end">‰</th>
               <!-- IAD -->
               <th class="bg-yellow-subtle">CVL</th>
               <th class="bg-yellow-subtle">INFEKSI</th>
               <th class="bg-yellow-subtle border-end">‰</th>
               <!-- PLEB -->
               <th class="bg-blue-subtle">IVL</th>
               <th class="bg-blue-subtle">INFEKSI</th>
               <th class="bg-blue-subtle border-end">‰</th>
               <!-- IDO -->
               <th class="bg-yellow-subtle">OP</th>
               <th class="bg-yellow-subtle">INFEKSI</th>
               <th class="bg-yellow-subtle">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reportData.length === 0" class="text-center">
              <td colspan="16" class="py-5 text-muted fst-italic">
                <i class="fas fa-folder-open d-block fa-2x mb-2 opacity-25"></i>
                Tidak ada data pada periode terpilih
              </td>
            </tr>
            <tr v-for="item in reportData" :key="item.ruang" class="data-row">
              <td class="text-start px-4 fw-bold text-blue-800">{{ item.ruang }}</td>
              
              <!-- ISK (UC Pair) -->
              <td class="bg-soft-yellow">{{ item.uc }}</td>
              <td class="bg-soft-yellow fw-bold" :class="{ 'has-infection': item.isk > 0 }">
                <i v-if="item.isk > 0" class="fas fa-exclamation-circle text-danger me-1"></i>
                {{ item.isk }}
              </td>
              <td class="bg-soft-yellow highlight-column text-muted">{{ item.isk_ratio }}</td>

              <!-- VAP (ETT Pair) -->
              <td class="bg-soft-blue">{{ item.ett }}</td>
              <td class="bg-soft-blue fw-bold" :class="{ 'has-infection': item.vap > 0 }">
                <i v-if="item.vap > 0" class="fas fa-exclamation-circle text-danger me-1"></i>
                {{ item.vap }}
              </td>
              <td class="bg-soft-blue highlight-column text-muted">{{ item.vap_ratio }}</td>

              <!-- IAD (CVL Pair) -->
              <td class="bg-soft-yellow">{{ item.cvl }}</td>
              <td class="bg-soft-yellow fw-bold" :class="{ 'has-infection': item.iad > 0 }">
                <i v-if="item.iad > 0" class="fas fa-exclamation-circle text-danger me-1"></i>
                {{ item.iad }}
              </td>
              <td class="bg-soft-yellow highlight-column text-muted">{{ item.iad_ratio }}</td>

              <!-- PLEB (IVL Pair) -->
              <td class="bg-soft-blue">{{ item.ivl }}</td>
              <td class="bg-soft-blue fw-bold" :class="{ 'has-infection': item.pleb > 0 }">
                <i v-if="item.pleb > 0" class="fas fa-exclamation-circle text-danger me-1"></i>
                {{ item.pleb }}
              </td>
              <td class="bg-soft-blue highlight-column text-muted">{{ item.pleb_ratio }}</td>

              <!-- IDO (OP Pair) -->
              <td class="bg-soft-yellow">{{ item.op }}</td>
              <td class="bg-soft-yellow fw-bold" :class="{ 'has-infection': item.ido > 0 }">
                <i v-if="item.ido > 0" class="fas fa-exclamation-circle text-danger me-1"></i>
                {{ item.ido }}
              </td>
              <td class="bg-soft-yellow highlight-column text-muted">{{ item.ido_ratio }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import haisService from '@/services/haisService'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const reportData = ref([])

const filters = reactive({
  bulan: new Date().getMonth() + 1,
  tahun: new Date().getFullYear()
})

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const currentYear = new Date().getFullYear()
const yearRange = Array.from({ length: 5 }, (_, i) => currentYear - i)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await haisService.getReport(filters)
    if (res.data.success) {
      reportData.value = res.data.data
    } else {
      toast.error(res.data.message || 'Gagal memuat data')
    }
  } catch (error) {
    console.error('Error fetching report:', error)
    toast.error('Terjadi kesalahan sistem')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.hais-report-container {
  background-color: #f8fafc;
  min-height: 100vh;
}

.brand-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-icon-bg {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-input {
  background: rgba(0, 0, 0, 0.1) !important;
  color: white !important;
  border-radius: 6px;
}

.glass-input:focus {
  background: rgba(0, 0, 0, 0.2) !important;
}

.text-xs { font-size: 0.7rem; }
.tracking-tight { letter-spacing: -0.025em; }

/* Table Styling */
.hais-styled-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.hais-styled-table thead tr th {
  padding: 0.75rem 0.5rem;
  border-bottom: 0;
  text-align: center;
}

.header-level-1 {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.bg-yellow-pale { background-color: #fef9c3; }
.bg-blue-pale { background-color: #dbeafe; }
.text-yellow-900 { color: #854d0e; }
.text-blue-900 { color: #1e3a8a; }

.bg-yellow-subtle { background-color: #fefce8; }
.bg-blue-subtle { background-color: #eff6ff; }

.data-row td {
  padding: 1rem 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.data-row:hover td {
  background-color: #f8fafc !important;
}

.bg-soft-yellow { background-color: #fefdf0; }
.bg-soft-blue { background-color: #f7fbff; }

.has-infection {
  color: #dc2626 !important; /* text-danger */
  background-color: rgba(239, 68, 68, 0.1) !important;
}

.highlight-column {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 600;
  color: #64748b !important;
}

.badge-mini {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
}

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .report-header {
    padding: 1.5rem !important;
  }
}
</style>
