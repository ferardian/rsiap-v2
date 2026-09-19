<template>
  <div class="container-fluid py-3 px-3 px-md-4 main-bg">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
      <div>
        <h4 class="fw-bold text-slate-800 mb-1 d-flex align-items-center gap-2 page-title">
          <i class="fas fa-shield-halved text-rose-600"></i> Dashboard Manajemen Risiko
        </h4>
        <p class="text-slate-500 mb-0 small">
          Pemantauan profil risiko rumah sakit, matriks grading 5×5 (Inheren vs Residual), dan efektivitas mitigasi.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <!-- Filter Periode -->
        <select v-model="selectedPeriode" @change="fetchDashboardData" class="form-select form-select-sm header-select shadow-none border-slate-200">
          <option v-if="!periodes.length" value="">Memuat periode...</option>
          <option v-for="p in periodes" :key="p.id_periode" :value="p.id_periode">
            {{ p.nama_periode }} ({{ p.tahun }})
          </option>
        </select>

        <!-- Filter Unit -->
        <select v-model="selectedUnit" @change="fetchDashboardData" class="form-select form-select-sm header-select shadow-none border-slate-200">
          <option value="">Semua Unit Kerja</option>
          <option v-for="u in departemens" :key="u.dep_id" :value="u.dep_id">
            {{ u.nama }}
          </option>
        </select>

        <button @click="reloadData" class="btn btn-sm btn-light border shadow-none" title="Refresh">
          <i class="fas fa-sync-alt text-secondary" :class="{ 'fa-spin': isLoading }"></i>
        </button>

        <router-link to="/manajemen-risiko/register" class="btn btn-sm btn-primary rounded-3 shadow-none d-flex align-items-center gap-1.5">
          <i class="fas fa-clipboard-list"></i>
          <span>Buka Risk Register</span>
        </router-link>
      </div>
    </div>

    <!-- Summary KPI Stat Cards -->
    <div class="row g-2.5 mb-3">
      <!-- Total Risiko -->
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-blue-light text-blue-600">
            <i class="fas fa-shield-virus"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Teridentifikasi</span>
            <div class="stat-value text-slate-800">{{ stats.total_risiko || 0 }}</div>
            <span class="stat-sub text-muted">Seluruh Unit</span>
          </div>
        </div>
      </div>

      <!-- Risiko Ekstrem (Merah) -->
      <div class="col-6 col-md-3">
        <div class="stat-card border-danger-subtle">
          <div class="stat-icon bg-red-light text-red-600">
            <i class="fas fa-radiation"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Risiko Ekstrem (Merah)</span>
            <div class="d-flex align-items-baseline gap-2">
              <span class="stat-value text-danger">{{ stats.level_awal_counts?.ekstrem || 0 }}</span>
              <span v-if="stats.level_sisa_counts" class="badge bg-emerald-light text-emerald-600 rounded-pill small">
                Sisa: {{ stats.level_sisa_counts?.ekstrem || 0 }}
              </span>
            </div>
            <span class="stat-sub text-danger-subtle fw-semibold">Prioritas Direksi</span>
          </div>
        </div>
      </div>

      <!-- Risiko Tinggi (Kuning) -->
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-amber-light text-amber-600">
            <i class="fas fa-triangle-exclamation"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Risiko Tinggi (Kuning)</span>
            <div class="d-flex align-items-baseline gap-2">
              <span class="stat-value text-amber-600">{{ stats.level_awal_counts?.tinggi || 0 }}</span>
              <span v-if="stats.level_sisa_counts" class="badge bg-emerald-light text-emerald-600 rounded-pill small">
                Sisa: {{ stats.level_sisa_counts?.tinggi || 0 }}
              </span>
            </div>
            <span class="stat-sub text-muted">Mitigasi Manajemen</span>
          </div>
        </div>
      </div>

      <!-- Status Treatment Monitoring -->
      <div class="col-6 col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-emerald-light text-emerald-600">
            <i class="fas fa-circle-check"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Status Penanganan</span>
            <div class="d-flex align-items-center gap-2 mt-1">
              <span class="badge bg-primary-subtle text-primary border px-2 py-0.5" title="Sedang Diproses">
                Progress: {{ stats.status_counts?.in_progress || 0 }}
              </span>
              <span class="badge bg-success-subtle text-success border px-2 py-0.5" title="Selesai / Terkendali">
                Closed: {{ stats.status_counts?.closed || 0 }}
              </span>
            </div>
            <span class="stat-sub text-muted mt-1">Open: {{ stats.status_counts?.open || 0 }} item</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Matriks Risiko 5x5 (Inheren vs Residual) Side by Side -->
    <div class="row g-3 mb-4">
      <!-- Heatmap Risiko Awal (Inheren) -->
      <div class="col-12 col-xl-6">
        <div class="card card-clean h-100 shadow-sm border-0">
          <div class="card-header d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2.5">
              <div class="icon-indicator">
                <i class="fas fa-layer-group"></i>
              </div>
              <div>
                <h6 class="fw-bold text-slate-800 mb-0" style="font-size: 0.95rem;">Matriks Risiko Awal (Inheren)</h6>
                <small class="text-muted" style="font-size: 0.72rem;">Tingkat risiko alami sebelum upaya mitigasi</small>
              </div>
            </div>
            <span class="badge-clean">
              Inheren
            </span>
          </div>
          <div class="card-body p-3">
            <div class="matrix-wrapper">
              <div class="matrix-y-axis">
                <span class="y-label">DAMPAK (SEVERITY)</span>
              </div>
              <div class="matrix-grid-container">
                <table class="table table-bordered matrix-table mb-0 text-center">
                  <thead>
                    <tr>
                      <th class="axis-header" style="width: 140px;">Dampak \ Prob</th>
                      <th v-for="f in 5" :key="f" class="prob-header">
                        F{{ f }}
                        <div class="small fw-normal text-muted" style="font-size: 0.65rem;">{{ getProbShort(f) }}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="d in [5, 4, 3, 2, 1]" :key="d">
                      <td class="impact-header text-start">
                        <strong>D{{ d }}</strong> <span class="small text-muted" style="font-size: 0.7rem;">{{ getImpactShort(d) }}</span>
                      </td>
                      <td 
                        v-for="f in 5" 
                        :key="f"
                        :class="['matrix-cell', getCellColorClass(d, f)]"
                      >
                        <div class="cell-score">{{ d * f }}</div>
                        <div v-if="stats.matrix_awal?.[`${d}_${f}`]" class="cell-badge">
                          {{ stats.matrix_awal[`${d}_${f}`] }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- Matrix Legend -->
            <div class="d-flex align-items-center justify-content-center gap-3 mt-3 flex-wrap small">
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-blue"></span> <span>Rendah (1-3)</span>
              </div>
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-green"></span> <span>Sedang (4-6)</span>
              </div>
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-yellow"></span> <span>Tinggi (8-12)</span>
              </div>
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-red"></span> <span>Ekstrem (15-25)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap Risiko Sisa (Residual) -->
      <div class="col-12 col-xl-6">
        <div class="card card-clean h-100 shadow-sm border-0">
          <div class="card-header d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2.5">
              <div class="icon-indicator">
                <i class="fas fa-shield-check"></i>
              </div>
              <div>
                <h6 class="fw-bold text-slate-800 mb-0" style="font-size: 0.95rem;">Matriks Risiko Sisa (Residual)</h6>
                <small class="text-muted" style="font-size: 0.72rem;">Tingkat risiko setelah pengendalian & mitigasi</small>
              </div>
            </div>
            <span class="badge-clean">
              Residual
            </span>
          </div>
          <div class="card-body p-3">
            <div class="matrix-wrapper">
              <div class="matrix-y-axis">
                <span class="y-label">DAMPAK (SEVERITY)</span>
              </div>
              <div class="matrix-grid-container">
                <table class="table table-bordered matrix-table mb-0 text-center">
                  <thead>
                    <tr>
                      <th class="axis-header" style="width: 140px;">Dampak \ Prob</th>
                      <th v-for="f in 5" :key="f" class="prob-header">
                        F{{ f }}
                        <div class="small fw-normal text-muted" style="font-size: 0.65rem;">{{ getProbShort(f) }}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="d in [5, 4, 3, 2, 1]" :key="d">
                      <td class="impact-header text-start">
                        <strong>D{{ d }}</strong> <span class="small text-muted" style="font-size: 0.7rem;">{{ getImpactShort(d) }}</span>
                      </td>
                      <td 
                        v-for="f in 5" 
                        :key="f"
                        :class="['matrix-cell', getCellColorClass(d, f)]"
                      >
                        <div class="cell-score">{{ d * f }}</div>
                        <div v-if="stats.matrix_sisa?.[`${d}_${f}`]" class="cell-badge">
                          {{ stats.matrix_sisa[`${d}_${f}`] }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- Matrix Legend -->
            <div class="d-flex align-items-center justify-content-center gap-3 mt-3 flex-wrap small">
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-blue"></span> <span>Rendah (1-3)</span>
              </div>
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-green"></span> <span>Sedang (4-6)</span>
              </div>
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-yellow"></span> <span>Tinggi (8-12)</span>
              </div>
              <div class="d-flex align-items-center gap-1.5">
                <span class="legend-box bg-cell-red"></span> <span>Ekstrem (15-25)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breakdown per Klasifikasi & Top Prioritas Risiko -->
    <div class="row g-3">
      <!-- Klasifikasi Table -->
      <div class="col-12 col-lg-7">
        <div class="card card-clean shadow-sm border-0 h-100">
          <div class="card-header d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2.5">
              <div class="icon-indicator">
                <i class="fas fa-cubes-stacked"></i>
              </div>
              <div>
                <h6 class="fw-bold text-slate-800 mb-0" style="font-size: 0.95rem;">Distribusi 11 Klasifikasi Risiko</h6>
                <small class="text-muted" style="font-size: 0.72rem;">Kamus baku PMKP / KARS</small>
              </div>
            </div>
            <span class="badge-clean">
              11 Kategori
            </span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped align-middle mb-0" style="font-size: 0.85rem;">
                <thead class="table-light">
                  <tr>
                    <th class="ps-3">Klasifikasi Risiko</th>
                    <th class="text-center" style="width: 70px;">Total</th>
                    <th class="text-center text-danger" style="width: 70px;">Ekstrem</th>
                    <th class="text-center text-warning" style="width: 70px;">Tinggi</th>
                    <th class="text-center text-success" style="width: 70px;">Sedang</th>
                    <th class="text-center text-info" style="width: 70px;">Rendah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="k in stats.by_klasifikasi" :key="k.id_klasifikasi">
                    <td class="ps-3 fw-semibold text-slate-700">
                      {{ k.nama_klasifikasi }}
                    </td>
                    <td class="text-center fw-bold">{{ k.total }}</td>
                    <td class="text-center">
                      <span v-if="k.ekstrem" class="badge bg-danger rounded-pill">{{ k.ekstrem }}</span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td class="text-center">
                      <span v-if="k.tinggi" class="badge bg-warning text-dark rounded-pill">{{ k.tinggi }}</span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td class="text-center">
                      <span v-if="k.sedang" class="badge bg-success rounded-pill">{{ k.sedang }}</span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td class="text-center">
                      <span v-if="k.rendah" class="badge bg-info text-white rounded-pill">{{ k.rendah }}</span>
                      <span v-else class="text-muted">-</span>
                    </td>
                  </tr>
                  <tr v-if="!stats.by_klasifikasi?.length">
                    <td colspan="6" class="text-center py-4 text-muted">Belum ada data risiko pada filter ini.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 10 High/Extreme Risks -->
      <div class="col-12 col-lg-5">
        <div class="card card-clean shadow-sm border-0 h-100">
          <div class="card-header d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2.5">
              <div class="icon-indicator">
                <i class="fas fa-triangle-exclamation"></i>
              </div>
              <div>
                <h6 class="fw-bold text-slate-800 mb-0" style="font-size: 0.95rem;">Top Prioritas Risiko Inheren</h6>
                <small class="text-muted" style="font-size: 0.72rem;">Skor dampak & frekuensi tertinggi</small>
              </div>
            </div>
            <span class="badge-clean">
              Prioritas
            </span>
          </div>
          <div class="card-body p-2.5">
            <div v-if="stats.top_risks?.length" class="d-flex flex-column gap-2">
              <div 
                v-for="(r, idx) in stats.top_risks" 
                :key="r.id_risiko"
                class="p-2.5 rounded border risk-item-card transition-all"
                :class="{
                  'border-danger-subtle bg-red-50': r.level_awal === 'ekstrem',
                  'border-warning-subtle bg-yellow-50': r.level_awal === 'tinggi',
                  'border-success-subtle': r.level_awal === 'sedang',
                  'border-light': r.level_awal === 'rendah'
                }"
              >
                <div class="d-flex align-items-start justify-content-between gap-2 mb-1">
                  <span class="badge" :class="getLevelBadgeClass(r.level_awal)">
                    {{ r.level_awal.toUpperCase() }} (R: {{ r.skor_awal }})
                  </span>
                  <span class="small text-muted font-monospace">
                    {{ r.departemen?.nama || 'Unit RS' }}
                  </span>
                </div>
                <div class="fw-semibold text-slate-800 small line-clamp-2 mb-1">
                  {{ r.identifikasi_risiko }}
                </div>
                <div class="d-flex align-items-center justify-content-between text-muted" style="font-size: 0.72rem;">
                  <span><i class="fas fa-tag me-1"></i>{{ r.klasifikasi?.nama_klasifikasi }}</span>
                  <span v-if="r.level_sisa" class="text-success fw-semibold">
                    Sisa: {{ r.level_sisa.toUpperCase() }} ({{ r.skor_sisa }})
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-5 text-muted small">
              <i class="fas fa-check-double fs-3 text-emerald-500 mb-2 d-block"></i>
              Tidak ada data risiko terdaftar.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import manajemenRisikoService from '../../services/manajemenRisikoService'

const isLoading = ref(false)
const periodes = ref([])
const departemens = ref([])
const selectedPeriode = ref(null)
const selectedUnit = ref('')
const stats = ref({})

const getProbShort = (f) => {
  const map = { 1: 'Sgt Jarang', 2: 'Jarang', 3: 'Mungkin', 4: 'Sering', 5: 'Sgt Sering' }
  return map[f] || ''
}

const getImpactShort = (d) => {
  const map = { 1: 'Sgt Rendah', 2: 'Rendah', 3: 'Sedang', 4: 'Tinggi', 5: 'Sgt Tinggi' }
  return map[d] || ''
}

const getCellColorClass = (d, f) => {
  const score = d * f
  if (score >= 15) return 'bg-cell-red'
  if (score >= 8) return 'bg-cell-yellow'
  if (score >= 4) return 'bg-cell-green'
  return 'bg-cell-blue'
}

const getLevelBadgeClass = (lvl) => {
  const map = {
    ekstrem: 'bg-danger text-white',
    tinggi: 'bg-warning text-dark',
    sedang: 'bg-success text-white',
    rendah: 'bg-info text-white'
  }
  return map[lvl] || 'bg-secondary text-white'
}

const reloadData = async () => {
  await fetchMetadata()
  await fetchDashboardData()
}

const fetchMetadata = async () => {
  try {
    const res = await manajemenRisikoService.getMeta()
    if (res.data?.success) {
      periodes.value = res.data.data.periodes || []
      departemens.value = res.data.data.departemens || []
      
      if (!selectedPeriode.value && periodes.value.length) {
        const activeP = periodes.value.find(p => p.status === 'aktif') || periodes.value[0]
        if (activeP) {
          selectedPeriode.value = activeP.id_periode
        }
      }
    }
  } catch (err) {
    console.error('Failed to load metadata', err)
  }
}

const fetchDashboardData = async () => {
  if (!selectedPeriode.value && periodes.value.length) {
    const activeP = periodes.value.find(p => p.status === 'aktif') || periodes.value[0]
    if (activeP) selectedPeriode.value = activeP.id_periode
  }

  isLoading.value = true
  try {
    const params = {
      id_periode: selectedPeriode.value || undefined,
      kd_departemen: selectedUnit.value || undefined
    }
    const res = await manajemenRisikoService.getDashboard(params)
    if (res.data?.success) {
      stats.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to load dashboard data', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchMetadata()
  await fetchDashboardData()
})
</script>

<style scoped>
.main-bg {
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.page-title {
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}

.header-select {
  width: auto;
  min-width: 180px;
  font-size: 0.85rem;
  border-radius: 8px;
}

/* Stat Cards */
.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.stat-value {
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-sub {
  font-size: 0.72rem;
}

/* Color Tokens */
.bg-blue-light { background-color: #eff6ff; }
.bg-red-light { background-color: #fef2f2; }
.bg-amber-light { background-color: #fffbeb; }
.bg-emerald-light { background-color: #ecfdf5; }
.bg-rose-light { background-color: #fff1f2; }

.text-blue-600 { color: #2563eb; }
.text-red-600 { color: #dc2626; }
.text-amber-600 { color: #d97706; }
.text-emerald-600 { color: #059669; }
.text-rose-600 { color: #e11d48; }
.text-slate-800 { color: #1e293b; }
.text-slate-700 { color: #334155; }
.text-slate-500 { color: #64748b; }

.card-clean {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.card-clean .card-header,
.card .card-header {
  background: #ffffff !important;
  background-image: none !important;
  color: #1e293b !important;
  padding: 0.875rem 1.15rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  text-align: left !important;
}

.icon-indicator {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.badge-clean {
  display: inline-flex;
  align-items: center;
  background-color: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.01em;
}

.card-custom {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

/* Matrix 5x5 Grid */
.matrix-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.matrix-y-axis {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
}

.y-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #64748b;
}

.matrix-grid-container {
  flex: 1;
}

.matrix-table {
  border-collapse: separate;
  border-spacing: 3px;
  border: none;
}

.matrix-table th, .matrix-table td {
  border: none !important;
  border-radius: 6px;
  padding: 6px 4px;
}

.axis-header, .prob-header, .impact-header {
  background-color: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
}

.matrix-cell {
  position: relative;
  height: 48px;
  vertical-align: middle;
  transition: all 0.15s ease;
  cursor: pointer;
}

.matrix-cell:hover {
  filter: brightness(0.93);
  transform: scale(1.02);
}

.cell-score {
  font-size: 0.72rem;
  opacity: 0.55;
  font-weight: 600;
}

.cell-badge {
  display: inline-block;
  background-color: #0f172a;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 1px 7px;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 2px;
}

/* 4 Matrix Grading Colors */
.bg-cell-blue {
  background-color: #93c5fd !important; /* Biru: Rendah 1-3 */
  color: #1e3a8a;
}
.bg-cell-green {
  background-color: #86efac !important; /* Hijau: Sedang 4-6 */
  color: #14532d;
}
.bg-cell-yellow {
  background-color: #fde047 !important; /* Kuning: Tinggi 8-12 */
  color: #713f12;
}
.bg-cell-red {
  background-color: #fca5a5 !important; /* Merah: Ekstrem 15-25 */
  color: #7f1d1d;
}

.legend-box {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
}

.risk-item-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
