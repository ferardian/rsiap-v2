<template>
  <div>
    <!-- Filters Header Section -->
    <div class="row g-3 mb-4 justify-content-between align-items-center">
      <!-- Kategori Sub-Tabs -->
      <div class="col-md-8">
        <div class="sub-tab-switcher">
          <button 
            v-for="sub in kategoriOptions" 
            :key="sub.key"
            class="sub-tab-btn" 
            :class="[sub.key, { active: filters.kategori === sub.key }]"
            @click="setKategori(sub.key)"
          >
            <i :class="[sub.icon, 'me-1']"></i>
            <span>{{ sub.label }}</span>
          </button>
        </div>
      </div>

      <!-- Year and Search Filters -->
      <div class="col-md-4 d-flex justify-content-md-end align-items-center gap-2 flex-wrap">
        <!-- Search input -->
        <div class="search-box-custom me-2" style="min-width: 180px; flex: 1;">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari indikator..." 
            class="form-control form-control-sm search-input-custom"
          />
        </div>

        <!-- Year select -->
        <div class="filter-container-custom" style="height: 32px; padding: 0.2rem 0.5rem;">
          <select class="filter-month-input text-slate-700" v-model="filters.tahun" @change="fetchData" style="width: auto; font-size: 0.8rem; font-weight: 700;">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Refresh button -->
        <button class="btn btn-sm btn-outline-secondary" @click="fetchData" :disabled="loading" title="Refresh">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-ring mx-auto mb-3"></div>
      <p class="text-muted small">Memuat rekap tahunan...</p>
    </div>

    <div v-else-if="filteredItems.length" class="table-rekap-container">
      <table class="table table-rekap align-middle">
        <thead>
          <tr>
            <th class="sticky-no text-center">No</th>
            <th class="sticky-name">Nama Indikator</th>
            <th class="text-center" style="width: 110px;">Target</th>
            <th v-for="m in 12" :key="m" class="text-center" style="width: 260px;">
              {{ monthNames[m - 1] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in filteredItems" :key="item.id_master || item.id_inmut">
            <!-- Sticky Columns -->
            <td class="sticky-no text-center fw-bold text-slate-500">{{ idx + 1 }}</td>
            <td class="sticky-name indicator-name-cell fw-bold text-slate-800">
              {{ item.nama_inmut }}
              <div v-if="item.nama_ruang" class="text-xs text-slate-400 font-normal mt-1">
                <i class="fas fa-hospital me-1"></i>{{ item.nama_ruang }}
              </div>
            </td>
            
            <!-- Target Column -->
            <td class="text-center fw-bold text-warning-dark font-monospace" style="font-size: 0.8rem;">
              {{ getTargetDisplay(item) }}
            </td>

            <!-- Month Columns -->
            <td v-for="m in 12" :key="m" class="month-cell">
              <div v-if="item.monthly_data && item.monthly_data[m] && item.monthly_data[m].has_data" class="month-cell-content">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge rounded-2 py-1 px-2 font-monospace" :class="isTargetMet(item, item.monthly_data[m].score) ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'">
                    Capaian: {{ item.monthly_data[m].score }}%
                  </span>
                  <button class="btn btn-xs btn-outline-primary py-0 px-2" style="font-size: 0.65rem;" @click="openDetailModal(item, m)">
                    Detail
                  </button>
                </div>
                
                <!-- Snippet Box -->
                <div class="analysis-snippet-box mt-2" @click="openDetailModal(item, m)" style="cursor: pointer;">
                  <div v-if="item.monthly_data[m].analyses && item.monthly_data[m].analyses.length">
                    <div v-for="(ana, aIdx) in item.monthly_data[m].analyses.slice(0, 1)" :key="aIdx" class="snippet-block">
                      <div class="snippet-unit small fw-bold text-indigo mb-1" v-if="filters.kategori !== 'prioritas_unit'">
                        <i class="fas fa-hospital me-1"></i>{{ ana.nama_ruang }}
                      </div>
                      <div class="text-truncate-2 small text-slate-700 mb-1" :title="ana.analisa">
                        <strong>A:</strong> {{ truncateText(ana.analisa, 65) }}
                      </div>
                      <div class="text-truncate-2 small text-indigo" :title="ana.tindak_lanjut">
                        <strong>TL:</strong> {{ truncateText(ana.tindak_lanjut, 65) }}
                      </div>
                    </div>
                    <!-- If more than 1 analyses (cumulative) -->
                    <div v-if="item.monthly_data[m].analyses.length > 1" class="text-center mt-1 border-top pt-1 text-slate-500" style="font-size: 0.68rem; font-weight: 700;">
                      +{{ item.monthly_data[m].analyses.length - 1 }} Unit Lainnya
                    </div>
                  </div>
                  <div v-else class="text-muted small italic text-center py-2">
                    Belum ada analisa
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-muted py-4 small italic">
                -
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-calendar-times"></i>
      </div>
      <p class="empty-text">Tidak ada data indikator yang ditemukan</p>
      <small class="text-muted">Coba ubah kata kunci pencarian atau kategori filter.</small>
    </div>

    <!-- Modal Detail Analisa -->
    <div v-if="modal.show" class="rekap-modal-overlay" @click.self="closeModal">
      <div class="rekap-modal-container">
        <div class="rekap-modal-header" :style="{ backgroundColor: getKategoriColor() }">
          <h5 class="rekap-modal-title text-white">Detail Analisa & Tindak Lanjut</h5>
          <button class="rekap-modal-close text-white" @click="closeModal">&times;</button>
        </div>
        <div class="rekap-modal-body">
          <div class="mb-3">
            <h6 class="text-slate-800 fw-bold" style="line-height: 1.4;">{{ modal.indicatorName }}</h6>
            <div class="d-flex align-items-center gap-2 mt-3 flex-wrap">
              <span class="badge bg-secondary py-1 px-2 font-monospace" style="font-size: 0.72rem;">
                Bulan: {{ monthNames[modal.month - 1] }} {{ filters.tahun }}
              </span>
              <span class="badge py-1 px-2 font-monospace" :class="modal.isMet ? 'bg-success' : 'bg-danger'" style="font-size: 0.72rem;">
                Capaian: {{ modal.score != null ? modal.score + '%' : 'Belum Ada Data' }}
              </span>
              <span class="badge bg-warning text-dark py-1 px-2 font-monospace" style="font-size: 0.72rem;">
                Target: {{ modal.target }}
              </span>
            </div>
          </div>
          <hr />
          <div class="rekap-modal-content">
            <div v-if="modal.analyses && modal.analyses.length">
              <div v-for="(ana, idx) in modal.analyses" :key="idx" class="analysis-detail-block p-3 mb-3 bg-light rounded border">
                <div class="fw-bold text-indigo mb-2 border-bottom pb-1" v-if="filters.kategori !== 'prioritas_unit'">
                  <i class="fas fa-hospital me-1"></i>{{ ana.nama_ruang }}
                </div>
                <div class="mb-3">
                  <div class="text-xs text-muted fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Analisa Masalah:</div>
                  <p class="mb-0 text-slate-800 small whitespace-pre-wrap">{{ ana.analisa }}</p>
                </div>
                <div>
                  <div class="text-xs text-muted fw-bold text-uppercase mb-1" style="font-size: 0.65rem;">Rekomendasi / Rencana Tindak Lanjut:</div>
                  <p class="mb-0 text-indigo small whitespace-pre-wrap">{{ ana.tindak_lanjut }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-muted italic">
              Belum ada data analisa yang dilaporkan untuk bulan ini.
            </div>
          </div>
        </div>
        <div class="rekap-modal-footer">
          <button class="btn btn-sm btn-secondary" @click="closeModal">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'

const toast = useToast()
const items = ref([])
const loading = ref(false)
const searchQuery = ref('')

const filters = reactive({
  tahun: new Date().getFullYear(),
  kategori: 'nasional'
})

const currentYear = new Date().getFullYear()
const years = computed(() => {
  const yrs = []
  for (let y = currentYear; y >= currentYear - 5; y--) yrs.push(y)
  return yrs
})

const kategoriOptions = [
  { key: 'nasional', label: 'IMN', icon: 'fas fa-flag', color: '#4f46e5' },
  { key: 'prioritas_rs', label: 'IMPRS', icon: 'fas fa-hospital', color: '#0891b2' },
  { key: 'prioritas_unit', label: 'IMPU', icon: 'fas fa-door-open', color: '#059669' }
]

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Modal state
const modal = reactive({
  show: false,
  indicatorName: '',
  month: 1,
  score: null,
  isMet: false,
  target: '',
  analyses: []
})

const setKategori = (key) => {
  filters.kategori = key
  fetchData()
}

const getKategoriColor = () => {
  const opt = kategoriOptions.find(o => o.key === filters.kategori)
  return opt ? opt.color : '#4f46e5'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      tahun: filters.tahun,
      kategori: filters.kategori
    }
    const response = await api.getRekapTahunan(params)
    items.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching rekap tahunan:', error)
    toast.error('Gagal mengambil data rekap tahunan')
  } finally {
    loading.value = false
  }
}

// Search and filter
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item => 
    (item.nama_inmut && item.nama_inmut.toLowerCase().includes(query)) ||
    (item.nama_ruang && item.nama_ruang.toLowerCase().includes(query))
  )
})

// Truncate text
const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Rumus symbol map
const rumusSymbolMap = { '1': '=', '2': '≤', '3': '<', '4': '≥', '5': '>' }

const getTargetDisplay = (item) => {
  const std = item.standar
  if (!std) return '–'
  const rumusCode = String(item.rumus || '')
  const symbol = rumusSymbolMap[rumusCode] || ''
  let satuan = item.satuan || ''
  if (satuan === 'Persentase') satuan = '%'
  return `${symbol}${std}${satuan ? ' ' + satuan : ''}`
}

const isTargetMet = (item, score) => {
  if (score == null || isNaN(score)) return false
  const std = parseFloat(item.standar)
  if (isNaN(std)) return false
  const rumusCode = String(item.rumus || '')
  switch (rumusCode) {
    case '1': return score === std
    case '2': return score <= std
    case '3': return score < std
    case '4': return score >= std
    case '5': return score > std
    default: return score >= std
  }
}

// Modal actions
const openDetailModal = (item, m) => {
  const mData = item.monthly_data && item.monthly_data[m]
  if (!mData) return
  
  modal.indicatorName = item.nama_inmut
  modal.month = m
  modal.score = mData.score
  modal.isMet = isTargetMet(item, mData.score)
  modal.target = getTargetDisplay(item)
  modal.analyses = mData.analyses || []
  modal.show = true
}

const closeModal = () => {
  modal.show = false
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ===== FILTER BUTTONS ===== */
.sub-tab-switcher {
  display: flex;
  gap: 0.75rem;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  width: fit-content;
  border: 1px solid #e2e8f0;
}

.sub-tab-btn {
  padding: 8px 18px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sub-tab-btn:hover {
  color: #334155;
}

.sub-tab-btn.active.nasional {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.sub-tab-btn.active.prioritas_rs {
  background: #0891b2;
  color: white;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.25);
}

.sub-tab-btn.active.prioritas_unit {
  background: #059669;
  color: white;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

/* ===== TABLE LAYOUT ===== */
.table-rekap-container {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  background: white;
}

.table-rekap {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0;
}

/* Sticky Column Styles */
.table-rekap th.sticky-no,
.table-rekap td.sticky-no {
  position: sticky;
  left: 0;
  z-index: 3;
  width: 50px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
}

.table-rekap th.sticky-name,
.table-rekap td.sticky-name {
  position: sticky;
  left: 50px;
  z-index: 3;
  width: 280px;
  background-color: #ffffff;
  border-right: 2px solid #cbd5e1;
}

.indicator-name-cell {
  white-space: normal;
  max-width: 280px;
  font-size: 0.8rem;
  line-height: 1.4;
}

.table-rekap th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 10px;
  border-bottom: 2px solid #e2e8f0;
}

.table-rekap th.sticky-no,
.table-rekap th.sticky-name {
  z-index: 5;
  background-color: #f8fafc;
}

.table-rekap td {
  padding: 10px;
  vertical-align: top;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
}

.table-rekap tr:hover td {
  background-color: #f8fafc;
}

.table-rekap tr:hover td.sticky-no,
.table-rekap tr:hover td.sticky-name {
  background-color: #f8fafc;
}

/* Cell contents */
.month-cell-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bg-success-light {
  background-color: #d1fae5 !important;
}
.text-success-dark {
  color: #065f46 !important;
}
.bg-danger-light {
  background-color: #fee2e2 !important;
}
.text-danger-dark {
  color: #991b1b !important;
}

.analysis-snippet-box {
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 8px;
  transition: all 0.2s;
  min-height: 75px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.analysis-snippet-box:hover {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

/* ===== MODAL DETAIL STYLING ===== */
.rekap-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.rekap-modal-container {
  background-color: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slide-up 0.25s ease-out;
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.rekap-modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rekap-modal-title {
  font-weight: 700;
  margin: 0;
}

.rekap-modal-close {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.rekap-modal-close:hover {
  opacity: 1;
}

.rekap-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.rekap-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  background-color: #f8fafc;
}

.analysis-detail-block {
  border-color: #e2e8f0 !important;
}

/* ===== SKELETON ===== */
.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
  margin-top: 1rem;
}
.empty-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}
.empty-text {
  font-weight: 700;
  color: #475569;
  margin: 0;
}

/* ===== FILTER STYLINGS ===== */
.filter-container-custom {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
}
.filter-month-input {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
}

.search-box-custom {
  position: relative;
}
.search-input-custom {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  transition: all 0.2s ease;
}
.search-input-custom:focus {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}
</style>
