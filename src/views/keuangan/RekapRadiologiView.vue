<template>
  <div class="rekap-radiologi-container p-4">
    <!-- Header Section -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3 shadow-sm rounded-4 d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style="width: 50px; height: 50px;">
            <i class="fas fa-x-ray fa-2x text-primary"></i>
          </div>
          <div>
            <h3 class="page-title mb-0 fw-bold text-dark">Rekap Radiologi</h3>
            <p class="text-muted small mb-0">Rekapitulasi data pemeriksaan radiologi dan jasa medis dokter spesialis radiologi</p>
          </div>
        </div>

        <!-- Action Header Buttons -->
        <div class="d-flex align-items-center gap-2">
          <button 
            v-if="activeTab === 'internal'"
            class="btn btn-sm btn-outline-success rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
            @click="exportToExcel('internal')"
            :disabled="loading || filteredList.length === 0"
          >
            <i class="fas fa-file-excel me-2"></i> Export Excel
          </button>

          <button 
            v-if="activeTab === 'eksternal'"
            class="btn btn-sm btn-outline-success rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
            @click="exportToExcel('eksternal')"
            :disabled="loading || filteredList.length === 0"
          >
            <i class="fas fa-file-excel me-2"></i> Export Excel
          </button>

          <button 
            v-if="activeTab === 'eksternal'"
            class="btn btn-sm btn-primary rounded-3 px-3 fw-bold shadow-sm d-flex align-items-center btn-action-header"
            @click="printEksternalReport"
            :disabled="loading || filteredList.length === 0"
          >
            <i class="fas fa-print me-2"></i> Cetak Laporan (PDF)
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-card card border-0 shadow-sm rounded-4 mb-4 glass-card">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3 align-items-end">
          
          <!-- Periode Tanggal -->
          <div class="col-lg-3 col-md-6">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-calendar-alt text-primary me-2"></i> Periode Pemeriksaan
            </label>
            <div class="d-flex align-items-center gap-2">
              <input 
                type="date" 
                v-model="filters.tgl_awal" 
                class="form-control form-control-filter" 
                @change="fetchData"
              />
              <span class="text-muted small fw-bold">s/d</span>
              <input 
                type="date" 
                v-model="filters.tgl_akhir" 
                class="form-control form-control-filter" 
                @change="fetchData"
              />
            </div>
          </div>

          <!-- Dokter Spesialis Radiologi -->
          <div class="col-lg-3 col-md-6">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-user-md text-primary me-2"></i> Dokter Spesialis Radiologi
            </label>
            <select 
              v-model="filters.kd_dokter" 
              class="form-select form-control-filter"
              @change="fetchData"
            >
              <option value="">Semua Dokter Radiologi</option>
              <option v-for="doc in dokterList" :key="doc.kd_dokter" :value="doc.kd_dokter">
                {{ doc.nm_dokter }}
              </option>
            </select>
          </div>

          <!-- Filter Shift / Jam Pelayanan -->
          <div class="col-lg-4 col-md-8">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-clock text-primary me-2"></i> Filter Waktu (Shift)
            </label>
            <div class="shift-btn-group w-100" role="group">
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'all' }"
                @click="setShift('all')"
              >
                Semua Jam
              </button>
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'pagi' }"
                @click="setShift('pagi')"
                title="Pemeriksaan jam 08:00 - 14:00"
              >
                08:00 - 14:00
              </button>
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'luar_pagi' }"
                @click="setShift('luar_pagi')"
                title="Pemeriksaan di luar jam 08:00 - 14:00"
              >
                Di Luar 08:00 - 14:00
              </button>
              <button 
                type="button" 
                class="shift-btn"
                :class="{ active: shiftMode === 'custom' }"
                @click="setShift('custom')"
              >
                Custom
              </button>
            </div>
          </div>

          <!-- Status Rawat -->
          <div class="col-lg-2 col-md-4">
            <label class="form-label small fw-bold text-muted mb-1 d-flex align-items-center">
              <i class="fas fa-hospital-user text-primary me-2"></i> Status Pasien
            </label>
            <select 
              v-model="filters.status" 
              class="form-select form-control-filter"
              @change="fetchData"
            >
              <option value="">Semua (Ralan & Ranap)</option>
              <option value="Ralan">Rawat Jalan (Ralan)</option>
              <option value="Ranap">Rawat Inap (Ranap)</option>
            </select>
          </div>

        </div>

        <!-- Custom Jam Row (Muncul Jika Mode Custom Dipilih) -->
        <div v-if="shiftMode === 'custom'" class="row g-3 mt-1 pt-2 border-top align-items-center">
          <div class="col-md-6 d-flex align-items-center gap-2">
            <span class="small fw-bold text-muted">Rentang Jam:</span>
            <input 
              type="time" 
              v-model="filters.jam_mulai" 
              class="form-control form-control-filter" 
              style="width: 140px;"
            />
            <span class="text-muted small">s/d</span>
            <input 
              type="time" 
              v-model="filters.jam_selesai" 
              class="form-control form-control-filter" 
              style="width: 140px;"
            />
            <button class="btn btn-sm btn-primary rounded-3 px-3 fw-bold" style="height: 38px;" @click="fetchData">
              Terapkan
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Summary Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Total Pemeriksaan</span>
            <div class="icon-circle bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
              <i class="fas fa-procedures"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-dark">{{ summary.total_pemeriksaan.toLocaleString('id-ID') }}</div>
          <div class="stat-footer mt-2 small text-muted">
            <span class="badge bg-success-subtle text-success me-1">{{ summary.ralan_count }} Ralan</span>
            <span class="badge bg-info-subtle text-info">{{ summary.ranap_count }} Ranap</span>
          </div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Total Jasa Medis</span>
            <div class="icon-circle bg-success bg-opacity-10 text-success p-2 rounded-circle">
              <i class="fas fa-coins"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-success">
            Rp {{ Number(summary.total_jasa || 0).toLocaleString('id-ID') }}
          </div>
          <div class="stat-footer mt-2 small text-muted">Total jasa dokter radiologi</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Shift Pagi (08 - 14)</span>
            <div class="icon-circle bg-warning bg-opacity-10 text-warning p-2 rounded-circle">
              <i class="fas fa-sun"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-warning">{{ summary.shift_pagi.toLocaleString('id-ID') }}</div>
          <div class="stat-footer mt-2 small text-muted">Tindakan jam 08:00 - 14:00</div>
        </div>
      </div>

      <div class="col-6 col-lg-3">
        <div class="stat-card glass-card p-3 shadow-sm border-0 rounded-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-muted small fw-bold text-uppercase">Di Luar 08:00 - 14:00</span>
            <div class="icon-circle bg-indigo bg-opacity-10 text-primary p-2 rounded-circle">
              <i class="fas fa-moon"></i>
            </div>
          </div>
          <div class="h3 fw-bold mb-0 text-primary">{{ (summary.shift_luar_pagi ?? summary.shift_sore ?? 0).toLocaleString('id-ID') }}</div>
          <div class="stat-footer mt-2 small text-muted">Tindakan di luar jam 08:00 - 14:00</div>
        </div>
      </div>
    </div>

    <!-- Main Content Card with Dual Tabs -->
    <div class="card border-0 shadow-sm glass-card rounded-4 mb-4">
      <!-- Clean Segmented Tab Switcher -->
      <div class="card-header bg-white border-bottom pt-3 px-4 pb-3">
        <div class="tab-switcher">
          <button 
            type="button" 
            class="tab-btn" 
            :class="{ active: activeTab === 'internal' }"
            @click="activeTab = 'internal'"
          >
            <i class="fas fa-hospital me-2"></i> Data Internal
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            :class="{ active: activeTab === 'eksternal' }"
            @click="activeTab = 'eksternal'"
          >
            <i class="fas fa-file-invoice me-2"></i> Data Eksternal
          </button>
        </div>
      </div>

      <div class="card-body p-4 pt-3">
        
        <!-- ========================================== -->
        <!-- TAB 1: KONSUMSI INTERNAL                  -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'internal'">
          <!-- Search & Controls Internal -->
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div class="d-flex align-items-center gap-2">
              <div class="input-group" style="width: 320px; height: 38px;">
                <span class="input-group-text bg-light border-secondary-subtle">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  v-model="searchKeyword" 
                  class="form-control form-control-filter" 
                  placeholder="Cari pasien / no rawat / tindakan..."
                />
              </div>
              <span class="text-muted small">Menampilkan <b>{{ filteredList.length }}</b> data</span>
            </div>
          </div>

          <!-- Internal Table -->
          <div class="table-responsive bg-white rounded-3 shadow-sm border">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-light text-nowrap">
                <tr>
                  <th class="ps-3 py-2 text-center" style="width: 50px;">No.</th>
                  <th class="py-2">Waktu Periksa</th>
                  <th class="py-2">No. Rawat</th>
                  <th class="py-2">No. RM</th>
                  <th class="py-2">Nama Pasien</th>
                  <th class="py-2">Cara Bayar / Status</th>
                  <th class="py-2">Tindakan Radiologi</th>
                  <th class="py-2">Dokter Radiologi</th>
                  <th class="py-2">Dokter Perujuk</th>
                  <th class="pe-3 py-2 text-end">Jasa Medis</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="10" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Memuat data pemeriksaan radiologi...
                  </td>
                </tr>
                <tr v-else-if="filteredList.length === 0">
                  <td colspan="10" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-2 d-block text-secondary opacity-50"></i>
                    Tidak ada data pemeriksaan radiologi pada periode & filter yang dipilih.
                  </td>
                </tr>
                <tr v-else v-for="(item, idx) in filteredList" :key="idx">
                  <td class="ps-3 text-center text-muted small">{{ idx + 1 }}</td>
                  <td class="text-nowrap">
                    <span class="fw-semibold text-dark">{{ formatDateIndo(item.tgl_periksa) }}</span>
                    <span class="badge bg-light text-secondary border ms-1 font-monospace">{{ item.jam }}</span>
                  </td>
                  <td class="font-monospace small text-primary">{{ item.no_rawat }}</td>
                  <td class="font-monospace small">{{ item.no_rkm_medis }}</td>
                  <td class="fw-bold text-dark text-nowrap">{{ item.nm_pasien }}</td>
                  <td>
                    <span class="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small me-1">
                      {{ item.png_jawab }}
                    </span>
                    <span class="badge rounded-pill px-2 py-1 small" :class="item.status_rawat === 'Ranap' ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'">
                      {{ item.status_rawat }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">{{ item.nm_perawatan }}</div>
                    <small class="text-muted font-monospace">({{ item.kd_jenis_prw }})</small>
                  </td>
                  <td class="text-nowrap small text-muted">
                    <i class="fas fa-user-md text-primary me-1"></i> {{ item.dokter_radiologi }}
                  </td>
                  <td class="text-nowrap small text-muted">
                    {{ item.dokter_perujuk || '-' }}
                  </td>
                  <td class="pe-3 text-end fw-bold text-success text-nowrap font-monospace">
                    Rp {{ Number(item.jasa_dokter || 0).toLocaleString('id-ID') }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredList.length > 0" class="table-light fw-bold">
                <tr>
                  <td colspan="9" class="ps-3 py-2 text-end text-uppercase">Total Jasa Medis:</td>
                  <td class="pe-3 py-2 text-end text-success font-monospace fs-6">
                    Rp {{ totalFilteredJasa.toLocaleString('id-ID') }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 2: LAPORAN EKSTERNAL                   -->
        <!-- ========================================== -->
        <div v-else-if="activeTab === 'eksternal'">

          <!-- Document Header Preview Card -->
          <div class="card border rounded-4 shadow-sm mb-4 bg-light bg-opacity-50">
            <div class="card-body p-4">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <span class="badge bg-primary rounded-pill px-3 py-1 mb-2">Lampiran Berita Acara Pelayanan</span>
                  <h5 class="fw-bold text-dark mb-1">
                    {{ selectedDoctorName || 'Semua Dokter Spesialis Radiologi' }}
                  </h5>
                  <p class="text-muted small mb-0">
                    Periode: <b>{{ formatDateIndo(filters.tgl_awal) }}</b> s.d. <b>{{ formatDateIndo(filters.tgl_akhir) }}</b> | 
                    Shift: <b>{{ shiftLabel }}</b>
                  </p>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                  <div class="display-6 fw-bold text-success">{{ filteredList.length }}</div>
                  <small class="text-muted fw-semibold">Total Tindakan Radiologi</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Eksternal Table -->
          <div class="table-responsive bg-white rounded-3 shadow-sm border">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.9rem;">
              <thead class="table-light">
                <tr>
                  <th class="ps-4 py-3 text-center" style="width: 70px;">No.</th>
                  <th class="py-3" style="width: 200px;">Tanggal Pemeriksaan</th>
                  <th class="py-3" style="width: 150px;">Jam Pemeriksaan</th>
                  <th class="pe-4 py-3">Nama Tindakan / Pemeriksaan Radiologi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Memuat data pemeriksaan radiologi...
                  </td>
                </tr>
                <tr v-else-if="filteredList.length === 0">
                  <td colspan="4" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-2 d-block text-secondary opacity-50"></i>
                    Tidak ada tindakan radiologi pada filter jam & tanggal yang dipilih.
                  </td>
                </tr>
                <tr v-else v-for="(item, idx) in filteredList" :key="idx">
                  <td class="ps-4 text-center text-muted fw-bold">{{ idx + 1 }}</td>
                  <td class="fw-semibold text-dark text-nowrap">{{ formatDateIndo(item.tgl_periksa) }}</td>
                  <td class="font-monospace text-muted">{{ item.jam }}</td>
                  <td class="pe-4 fw-semibold text-dark">{{ item.nm_perawatan }}</td>
                </tr>
              </tbody>
              <tfoot v-if="filteredList.length > 0" class="table-light">
                <tr>
                  <td colspan="3" class="ps-4 py-3 text-end fw-bold text-uppercase">Total Tindakan Pelayanan:</td>
                  <td class="pe-4 py-3 fw-bold text-success fs-6">{{ filteredList.length }} Tindakan</td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import rekapRadiologiService from '@/services/rekapRadiologiService'

const toast = useToast()
const loading = ref(false)
const activeTab = ref('internal') // 'internal' | 'eksternal'
const shiftMode = ref('all') // 'all' | 'pagi' | 'luar_pagi' | 'custom'
const searchKeyword = ref('')
const dokterList = ref([])
const rawData = ref([])

const summary = reactive({
  total_pemeriksaan: 0,
  total_jasa: 0,
  ralan_count: 0,
  ranap_count: 0,
  shift_pagi: 0,
  shift_luar_pagi: 0,
  shift_sore: 0,
  shift_lain: 0
})

// Default Filter: Bulan Ini (dari tgl 1 s.d. hari ini)
const now = new Date()
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
const todayStr = now.toISOString().split('T')[0]

const filters = reactive({
  tgl_awal: firstDayOfMonth,
  tgl_akhir: todayStr,
  shift: 'all',
  jam_mulai: '',
  jam_selesai: '',
  kd_dokter: '',
  status: '',
  keyword: ''
})

// Nama dokter yang dipilih untuk header laporan eksternal
const selectedDoctorName = computed(() => {
  if (!filters.kd_dokter) return ''
  const doc = dokterList.value.find(d => d.kd_dokter === filters.kd_dokter)
  return doc ? doc.nm_dokter : ''
})

// Label deskripsi shift
const shiftLabel = computed(() => {
  if (shiftMode.value === 'pagi') return '08:00 - 14:00'
  if (shiftMode.value === 'luar_pagi') return 'Di Luar 08:00 - 14:00'
  if (shiftMode.value === 'custom') {
    return `${filters.jam_mulai || '00:00'} - ${filters.jam_selesai || '23:59'}`
  }
  return 'Semua Jam (24 Jam)'
})

// Filter list berdasarkan pencarian kata kunci pada tabel
const filteredList = computed(() => {
  if (!searchKeyword.value) return rawData.value
  const kw = searchKeyword.value.toLowerCase()
  return rawData.value.filter(item => {
    return (
      (item.nm_pasien && item.nm_pasien.toLowerCase().includes(kw)) ||
      (item.no_rawat && item.no_rawat.toLowerCase().includes(kw)) ||
      (item.no_rkm_medis && item.no_rkm_medis.toLowerCase().includes(kw)) ||
      (item.nm_perawatan && item.nm_perawatan.toLowerCase().includes(kw)) ||
      (item.kd_jenis_prw && item.kd_jenis_prw.toLowerCase().includes(kw)) ||
      (item.dokter_perujuk && item.dokter_perujuk.toLowerCase().includes(kw))
    )
  })
})

// Total jasa medis yang difilter
const totalFilteredJasa = computed(() => {
  return filteredList.value.reduce((acc, curr) => acc + Number(curr.jasa_dokter || 0), 0)
})

// Format Tanggal Indonesia
const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  } catch (e) {
    return dateStr
  }
}

// Handler Ganti Shift
const setShift = (mode) => {
  shiftMode.value = mode
  filters.shift = mode
  if (mode === 'all') {
    filters.jam_mulai = ''
    filters.jam_selesai = ''
  } else if (mode === 'pagi') {
    filters.jam_mulai = '08:00:00'
    filters.jam_selesai = '14:00:00'
  } else if (mode === 'luar_pagi') {
    filters.jam_mulai = ''
    filters.jam_selesai = ''
  }
  fetchData()
}

// Ambil Daftar Dokter Spesialis Radiologi
const fetchDokterRadiologi = async () => {
  try {
    const res = await rekapRadiologiService.getDokterRadiologi()
    if (res.data?.metadata?.code === 200) {
      dokterList.value = res.data.response || []
    }
  } catch (err) {
    console.error('Error fetching dokter radiologi:', err)
  }
}

// Ambil Data Rekap Radiologi
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir,
      kd_dokter: filters.kd_dokter,
      status: filters.status,
      shift: filters.shift,
      jam_mulai: filters.jam_mulai,
      jam_selesai: filters.jam_selesai
    }

    const res = await rekapRadiologiService.getRekapRadiologi(params)
    if (res.data?.metadata?.code === 200) {
      const resp = res.data.response
      rawData.value = resp.data || []
      
      // Update Summary
      if (resp.summary) {
        summary.total_pemeriksaan = resp.summary.total_pemeriksaan || 0
        summary.total_jasa = resp.summary.total_jasa || 0
        summary.ralan_count = resp.summary.ralan_count || 0
        summary.ranap_count = resp.summary.ranap_count || 0
        summary.shift_pagi = resp.summary.shift_pagi || 0
        summary.shift_luar_pagi = resp.summary.shift_luar_pagi || resp.summary.shift_sore || 0
        summary.shift_sore = resp.summary.shift_luar_pagi || resp.summary.shift_sore || 0
        summary.shift_lain = resp.summary.shift_lain || 0
      }
    } else {
      toast.error(res.data?.metadata?.message || 'Gagal mengambil data radiologi')
    }
  } catch (err) {
    console.error('Error fetch rekap radiologi:', err)
    toast.error('Terjadi kesalahan saat memuat data rekap radiologi')
  } finally {
    loading.value = false
  }
}

// ==========================================
// EXPORT EXCEL (CSV UTF-8)
// ==========================================
const exportToExcel = (mode) => {
  if (filteredList.value.length === 0) {
    return toast.warning('Tidak ada data untuk diexport')
  }

  const docName = selectedDoctorName.value ? selectedDoctorName.value.replace(/[^a-zA-Z0-9]/g, '_') : 'SemuaDokter'
  const filename = mode === 'internal'
    ? `Rekap_Radiologi_Internal_${filters.tgl_awal}_sd_${filters.tgl_akhir}.csv`
    : `Rekap_Radiologi_Eksternal_${docName}_${filters.tgl_awal}_sd_${filters.tgl_akhir}.csv`

  let csvContent = '\uFEFF' // BOM UTF-8

  if (mode === 'internal') {
    // Header Kolom Internal
    csvContent += 'No,Tanggal Periksa,Jam,No Rawat,No RM,Nama Pasien,Penanggung Jawab,Status Rawat,Kode Tindakan,Nama Pemeriksaan,Dokter Radiologi,Dokter Perujuk,Jasa Medis\n'
    
    filteredList.value.forEach((item, idx) => {
      const row = [
        idx + 1,
        `"${item.tgl_periksa}"`,
        `"${item.jam}"`,
        `"${item.no_rawat}"`,
        `"'${item.no_rkm_medis}"`,
        `"${(item.nm_pasien || '').replace(/"/g, '""')}"`,
        `"${(item.png_jawab || '').replace(/"/g, '""')}"`,
        `"${item.status_rawat || ''}"`,
        `"${item.kd_jenis_prw}"`,
        `"${(item.nm_perawatan || '').replace(/"/g, '""')}"`,
        `"${(item.dokter_radiologi || '').replace(/"/g, '""')}"`,
        `"${(item.dokter_perujuk || '').replace(/"/g, '""')}"`,
        item.jasa_dokter || 0
      ]
      csvContent += row.join(',') + '\n'
    })

    // Footer Total
    csvContent += `,,,,,,,,,,,,Total Jasa Medis,${totalFilteredJasa.value}\n`
  } else {
    // Header Kolom Eksternal (Hanya Tanggal, Jam, Nama Tindakan)
    csvContent += `Laporan Rekap Pemeriksaan Radiologi (Eksternal)\n`
    csvContent += `Dokter Spesialis Radiologi: "${selectedDoctorName.value || 'Semua Dokter'}"\n`
    csvContent += `Periode: "${filters.tgl_awal} s.d. ${filters.tgl_akhir}"\n`
    csvContent += `Shift Waktu: "${shiftLabel.value}"\n\n`
    csvContent += 'No,Tanggal Pemeriksaan,Jam Pemeriksaan,Nama Pemeriksaan / Tindakan\n'

    filteredList.value.forEach((item, idx) => {
      const row = [
        idx + 1,
        `"${item.tgl_periksa}"`,
        `"${item.jam}"`,
        `"${(item.nm_perawatan || '').replace(/"/g, '""')}"`
      ]
      csvContent += row.join(',') + '\n'
    })

    csvContent += `,,,Total Tindakan,${filteredList.value.length}\n`
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success('File berhasil diexport')
}

// ==========================================
// CETAK LAPORAN EKSTERNAL (PDF)
// ==========================================
const printEksternalReport = () => {
  if (filteredList.value.length === 0) {
    return toast.warning('Tidak ada data untuk dicetak')
  }

  const docName = selectedDoctorName.value || 'Dokter Spesialis Radiologi'
  const printWindow = window.open('', '_blank', 'width=900,height=700')

  let rowsHtml = ''
  filteredList.value.forEach((item, idx) => {
    rowsHtml += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${formatDateIndo(item.tgl_periksa)}</td>
        <td style="text-align: center; font-family: monospace;">${item.jam}</td>
        <td><strong>${item.nm_perawatan}</strong></td>
      </tr>
    `
  })

  const todayPrint = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Pelayanan Radiologi - ${docName}</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 20px 30px;
          color: #333;
          font-size: 11pt;
        }
        .kop {
          border-bottom: 3px double #000;
          padding-bottom: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        .kop h1 {
          margin: 0;
          font-size: 16pt;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .kop p {
          margin: 3px 0 0 0;
          font-size: 9pt;
          color: #444;
        }
        .judul {
          text-align: center;
          margin-bottom: 20px;
        }
        .judul h2 {
          margin: 0;
          font-size: 13pt;
          text-decoration: underline;
        }
        .judul p {
          margin: 4px 0 0 0;
          font-size: 10pt;
          color: #555;
        }
        .meta-table {
          width: 100%;
          margin-bottom: 15px;
          font-size: 10.5pt;
        }
        .meta-table td {
          padding: 3px 0;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 10pt;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #333;
          padding: 6px 8px;
        }
        table.data-table th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
        }
        .total-box {
          margin-top: 15px;
          text-align: right;
          font-size: 11pt;
          font-weight: bold;
        }
        .ttd-container {
          margin-top: 40px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .ttd-box {
          width: 42%;
          text-align: center;
        }
        .ttd-space {
          height: 70px;
        }
        @media print {
          body { padding: 10mm 15mm; }
          @page { size: A4 portrait; margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="kop">
        <h1>RSIA AISYIYAH PEKAJANGAN</h1>
        <p>Jl. Raya Pekajangan No. 610, Pekalongan, Jawa Tengah 51172</p>
        <p>Telp. (0285) 785909 | Email: rsiap_pkj@yahoo.co.id</p>
      </div>

      <div class="judul">
        <h2>LAPORAN REKAPITULASI PELAYANAN DOKTER SPESIALIS RADIOLOGI</h2>
        <p>Lampiran Rekapitulasi Pelayanan Tenaga Medis Spesialis</p>
      </div>

      <table class="meta-table">
        <tr>
          <td style="width: 25%;">Nama Dokter Spesialis</td>
          <td style="width: 2%;">:</td>
          <td><strong>${docName}</strong></td>
        </tr>
        <tr>
          <td>Periode Pelayanan</td>
          <td>:</td>
          <td>${formatDateIndo(filters.tgl_awal)} s/d ${formatDateIndo(filters.tgl_akhir)}</td>
        </tr>
        <tr>
          <td>Waktu / Shift</td>
          <td>:</td>
          <td>${shiftLabel.value}</td>
        </tr>
        <tr>
          <td>Total Tindakan</td>
          <td>:</td>
          <td><strong>${filteredList.value.length} Tindakan</strong></td>
        </tr>
      </table>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40px;">No.</th>
            <th style="width: 140px;">Tanggal</th>
            <th style="width: 100px;">Jam</th>
            <th>Nama Pemeriksaan Radiologi</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="total-box">
        Total Tindakan Pelayanan: ${filteredList.value.length} Tindakan
      </div>

      <div class="ttd-container">
        <div class="ttd-box">
          <p style="margin: 0;">Pekalongan, ${todayPrint}</p>
          <p style="margin: 3px 0 0 0;"><strong>Pihak Pertama (RSIA)</strong></p>
          <div class="ttd-space"></div>
          <p style="margin: 0; font-weight: bold; text-decoration: underline;">dr. Hj. Himmatun Nisa</p>
          <p style="margin: 0; font-size: 9pt;">Direktur RSIA Aisyiyah Pekajangan</p>
        </div>

        <div class="ttd-box">
          <p style="margin: 0;">&nbsp;</p>
          <p style="margin: 3px 0 0 0;"><strong>Pihak Kedua (Dokter Ybs)</strong></p>
          <div class="ttd-space"></div>
          <p style="margin: 0; font-weight: bold; text-decoration: underline;">${docName}</p>
          <p style="margin: 0; font-size: 9pt;">Dokter Spesialis Radiologi</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `)

  printWindow.document.close()
}

onMounted(async () => {
  await fetchDokterRadiologi()
  fetchData()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06) !important;
}

/* Sizing Harmonization for Filters */
.form-control-filter {
  height: 38px !important;
  min-height: 38px !important;
  font-size: 0.85rem !important;
  border-radius: 8px !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: none !important;
}

.form-control-filter:focus {
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15) !important;
}

.shift-btn-group {
  display: flex;
  height: 38px;
  min-height: 38px;
  padding: 3px;
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  gap: 2px;
}

.shift-btn {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  padding: 0 8px;
}

.shift-btn:hover {
  color: #0f172a;
}

.shift-btn.active {
  background-color: #0d6efd;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(13, 110, 253, 0.3);
}

.btn-action-header {
  height: 38px !important;
  font-size: 0.85rem !important;
}

/* Segmented Tab Switcher */
.tab-switcher {
  display: inline-flex;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 4px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 22px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.tab-btn:hover {
  color: #0f172a;
}

.tab-btn.active {
  background-color: #ffffff;
  color: #0d6efd;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
</style>
