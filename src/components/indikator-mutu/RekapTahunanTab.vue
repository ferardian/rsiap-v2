<template>
  <div>
    <!-- Filters Header Section -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <!-- Kategori Sub-Tabs -->
      <div>
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
      <div class="d-flex align-items-center gap-2 flex-grow-1 justify-content-end" style="max-width: 500px;">
        <!-- Search input -->
        <div class="search-box-custom flex-grow-1">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari indikator..." 
            class="form-control form-control-sm search-input-custom w-100"
          />
        </div>

        <!-- Year select -->
        <div class="filter-container-custom">
          <select class="filter-month-input text-slate-700" v-model="filters.tahun" @change="fetchData" style="width: auto; font-size: 0.8rem; font-weight: 700;">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Refresh button -->
        <button class="btn btn-sm btn-outline-secondary btn-refresh-rekap" @click="fetchData" :disabled="loading" title="Refresh">
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
            <th class="sticky-no text-center" style="width: 60px; min-width: 60px;">No</th>
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
            <td class="sticky-no text-center fw-bold text-slate-500" style="width: 60px; min-width: 60px;">{{ idx + 1 }}</td>
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
                <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                  <span class="badge rounded-2 py-1 px-2 font-monospace" :class="isTargetMet(item, item.monthly_data[m].score) ? 'bg-success-light text-success-dark' : 'bg-danger-light text-danger-dark'">
                    Capaian: {{ item.monthly_data[m].score }}%
                  </span>
                  <button class="btn btn-xs btn-primary text-white d-inline-flex align-items-center gap-1 border-0" style="font-size: 0.65rem; padding: 3px 8px; border-radius: 6px; font-weight: 700;" @click="openDetailModal(item, m)">
                    <i class="fas fa-eye" style="font-size: 0.6rem;"></i>
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

        <!-- ── HEADER ── -->
        <div class="rekap-modal-header" :style="{ background: `linear-gradient(135deg, ${getKategoriColor()}, ${getKategoriColorDark()})` }">
          <div class="d-flex align-items-center gap-3">
            <div class="modal-header-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div>
              <div class="modal-header-eyebrow">Detail Analisa &amp; Tindak Lanjut</div>
              <h5 class="rekap-modal-title text-white mb-0">{{ modal.indicatorName }}</h5>
            </div>
          </div>
          <button class="rekap-modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- ── META CHIPS ── -->
        <div class="modal-meta-bar">
          <div class="modal-chip chip-period">
            <i class="fas fa-calendar-alt me-1"></i>
            {{ monthNames[modal.month - 1] }} {{ filters.tahun }}
          </div>
          <div class="modal-chip" :class="modal.isMet ? 'chip-success' : 'chip-danger'">
            <i :class="modal.isMet ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="me-1"></i>
            Capaian: <strong>{{ modal.score != null ? modal.score + '%' : '–' }}</strong>
          </div>
          <div class="modal-chip chip-target">
            <i class="fas fa-bullseye me-1"></i>
            Target: <strong>{{ modal.target }}</strong>
          </div>
        </div>

        <!-- ── BODY ── -->
        <div class="rekap-modal-body">
          <!-- analyses list -->
          <div v-if="modal.analyses && modal.analyses.length">
            <div
              v-for="(ana, idx) in modal.analyses"
              :key="idx"
              class="modal-analysis-block"
              :style="{ '--accent': getKategoriColor() }"
            >
              <!-- unit header (non-prioritas_unit only) -->
              <div class="modal-unit-header" v-if="filters.kategori !== 'prioritas_unit'">
                <div class="modal-unit-avatar" :style="{ background: getKategoriColor() }">
                  {{ (ana.nama_ruang || '?').charAt(0).toUpperCase() }}
                </div>
                <span class="modal-unit-name">{{ ana.nama_ruang }}</span>
                <span class="modal-unit-badge">Unit {{ idx + 1 }}</span>
              </div>

              <!-- Analisa -->
              <div class="modal-section">
                <div class="modal-section-label modal-section-label--analisa">
                  <i class="fas fa-microscope"></i>
                  Analisa Masalah
                </div>
                <p class="modal-section-text">{{ ana.analisa || '–' }}</p>
              </div>

              <!-- Tindak Lanjut -->
              <div class="modal-section modal-section--tl">
                <div class="modal-section-label modal-section-label--tl">
                  <i class="fas fa-tasks"></i>
                  Rencana Tindak Lanjut
                </div>
                <p class="modal-section-text">{{ ana.tindak_lanjut || '–' }}</p>
              </div>
            </div>
          </div>

          <!-- empty -->
          <div v-else class="modal-empty-state">
            <i class="fas fa-clipboard-list modal-empty-icon"></i>
            <p class="modal-empty-text">Belum ada data analisa untuk bulan ini.</p>
          </div>
        </div>

        <!-- ── FOOTER ── -->
        <div class="rekap-modal-footer">
          <div class="modal-footer-count" v-if="modal.analyses && modal.analyses.length">
            <i class="fas fa-layer-group me-1"></i>
            {{ modal.analyses.length }} unit melaporkan
          </div>
          <button class="modal-close-btn" @click="closeModal">
            <i class="fas fa-times me-2"></i>Tutup
          </button>
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

const getKategoriColorDark = () => {
  const darkMap = {
    nasional: '#3730a3',
    prioritas_rs: '#0e7490',
    prioritas_unit: '#047857'
  }
  return darkMap[filters.kategori] || '#3730a3'
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
  overflow: auto;
  max-height: 68vh;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  background: white;
  -webkit-overflow-scrolling: touch;
  
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.table-rekap-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-rekap-container::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 14px;
}

.table-rekap-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 14px;
  border: 2px solid #f8fafc;
}

.table-rekap-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}


.table-rekap {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0;
}

/* Force all regular body td cells into z-index 0 so they
   never paint above the sticky columns */
.table-rekap tbody td {
  position: relative;
  z-index: 0;
  padding: 10px;
  vertical-align: top;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
}

/* Sticky Left Columns in Body — raised above regular cells */
.table-rekap td.sticky-no {
  position: sticky;
  left: 0;
  z-index: 10 !important;
  background: #ffffff !important;
  border-right: 1px solid #e2e8f0;
  width: 60px;
  min-width: 60px;
  max-width: 60px;
}

.table-rekap td.sticky-name {
  position: sticky;
  left: 60px;
  z-index: 10 !important;
  background: #ffffff !important;
  border-right: none;
  /* Shadow as visual divider */
  box-shadow: 4px 0 10px -2px rgba(0, 0, 0, 0.1);
}

.indicator-name-cell {
  white-space: normal;
  max-width: 280px;
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Sticky Headers (Top only) */
.table-rekap th {
  position: sticky;
  top: 0;
  z-index: 3;
  background-color: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 10px;
  border-bottom: 2px solid #e2e8f0;
}

/* Sticky Corner Headers (Top and Left) — highest z-index */
.table-rekap th.sticky-no {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 20 !important;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  width: 60px;
  min-width: 60px;
  max-width: 60px;
}

.table-rekap th.sticky-name {
  position: sticky;
  top: 0;
  left: 60px;
  z-index: 20 !important;
  background-color: #f8fafc;
  border-right: 2px solid #cbd5e1;
}

.table-rekap tr:hover td {
  background-color: #f8fafc;
}

.table-rekap tr:hover td.sticky-no,
.table-rekap tr:hover td.sticky-name {
  background: #f1f5f9 !important;
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
  min-height: 75px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* Do NOT use transition: all or transform here — they create
     new stacking contexts that punch above sticky z-index */
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.analysis-snippet-box:hover {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  /* No transform, no box-shadow — avoids stacking context creation */
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
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.rekap-modal-container {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 640px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.06),
    0 24px 48px -8px rgba(0, 0, 0, 0.24),
    0 8px 16px -4px rgba(0, 0, 0, 0.12);
  animation: modal-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-in {
  from { transform: translateY(24px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}

/* — Header — */
.rekap-modal-header {
  padding: 1.5rem 1.5rem 1.25rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.modal-header-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: #fff;
  flex-shrink: 0;
}

.modal-header-eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  margin-bottom: 4px;
}

.rekap-modal-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  color: #fff;
  margin: 0;
}

.rekap-modal-close {
  background: rgba(255,255,255,0.15);
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.rekap-modal-close:hover {
  background: rgba(255,255,255,0.25);
}

/* — Meta chips bar — */
.modal-meta-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0.85rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.chip-period {
  background: #e2e8f0;
  color: #475569;
}
.chip-success {
  background: #d1fae5;
  color: #065f46;
}
.chip-danger {
  background: #fee2e2;
  color: #991b1b;
}
.chip-target {
  background: #fef3c7;
  color: #92400e;
}

/* — Body — */
.rekap-modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.rekap-modal-body::-webkit-scrollbar { width: 6px; }
.rekap-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

/* — Analysis block — */
.modal-analysis-block {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid var(--accent, #4f46e5);
  border-radius: 12px;
  overflow: hidden;
}

.modal-unit-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-unit-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: #fff;
}

.modal-unit-name {
  font-weight: 700;
  font-size: 0.82rem;
  color: #1e293b;
  flex: 1;
}

.modal-unit-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* — Section (Analisa / TL) — */
.modal-section {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}
.modal-section:last-child { border-bottom: none; }

.modal-section--tl {
  background: #fafbff;
}

.modal-section-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.modal-section-label--analisa {
  background: #f0f9ff;
  color: #0369a1;
}
.modal-section-label--tl {
  background: #f0fdf4;
  color: #15803d;
}

.modal-section-text {
  font-size: 0.82rem;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

/* — Empty state — */
.modal-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}
.modal-empty-icon {
  font-size: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 0.75rem;
}
.modal-empty-text {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
  margin: 0;
}

/* — Footer — */
.rekap-modal-footer {
  padding: 0.85rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  flex-shrink: 0;
}

.modal-footer-count {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
}

.modal-close-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 10px;
  background: #1e293b;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  letter-spacing: 0.02em;
}
.modal-close-btn:hover {
  background: #0f172a;
  transform: translateY(-1px);
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
  height: 32px;
  padding: 0 0.5rem;
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
  height: 32px;
}
.search-input-custom:focus {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.btn-refresh-rekap {
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  color: #64748b;
  background: #ffffff;
  width: 32px;
  padding: 0;
}
.btn-refresh-rekap:hover {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}
</style>
