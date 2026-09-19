<template>
  <div class="container-fluid py-3 px-3 px-md-4 main-bg">
    <!-- Header Section (Hidden saat cetak) -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3 no-print">
      <div>
        <h4 class="fw-bold text-slate-800 mb-1 d-flex align-items-center gap-2 page-title">
          <i class="fas fa-file-invoice text-primary"></i> Laporan Profil Risiko Rumah Sakit
        </h4>
        <p class="text-slate-500 mb-0 small">
          Dokumen formal profil risiko siap cetak untuk persyaratan akreditasi RS (STARKES PMKP / KARS) dan Rapat Tinjauan Manajemen (RTM).
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <select v-model="selectedUnit" @change="fetchData" class="form-select form-select-sm shadow-sm" style="width: 220px;">
          <option value="">Seluruh Unit Kerja (RS)</option>
          <option v-for="u in departemens" :key="u.dep_id" :value="u.dep_id">
            {{ u.nama }}
          </option>
        </select>

        <button @click="printReport" class="btn btn-sm btn-primary shadow-sm d-flex align-items-center gap-1.5">
          <i class="fas fa-print"></i>
          <span>Cetak Dokumen Resmi</span>
        </button>
      </div>
    </div>

    <!-- Paper Preview Sheet (Standar Cetak Akreditasi) -->
    <div class="paper-sheet shadow-sm p-4 p-md-5 mx-auto bg-white">
      <!-- Kop Surat -->
      <div class="text-center pb-3 mb-3 border-bottom border-dark border-2">
        <h5 class="fw-bold text-uppercase mb-0">RUMAH SAKIT IBU DAN ANAK AISYIYAH PEKAJANGAN</h5>
        <div class="small text-muted mb-1">Jl. Raya Pekajangan No. 610, Pekalongan, Jawa Tengah</div>
        <div class="fw-bold text-dark mt-2 text-uppercase fs-6">
          DAFTAR RISIKO RUMAH SAKIT (RISK REGISTER) TAHUN {{ currentYear }}
        </div>
        <div class="small text-secondary" v-if="selectedUnitName">
          UNIT KERJA: <strong>{{ selectedUnitName }}</strong>
        </div>
      </div>

      <!-- Ringkasan Statistik -->
      <div class="row g-2 mb-3 text-center" style="font-size: 0.8rem;">
        <div class="col-3">
          <div class="p-2 border rounded">
            <span class="text-muted d-block small">Total Teridentifikasi</span>
            <strong class="fs-6">{{ items.length }}</strong>
          </div>
        </div>
        <div class="col-3">
          <div class="p-2 border rounded bg-light">
            <span class="text-danger d-block small fw-semibold">Ekstrem (Merah)</span>
            <strong class="fs-6 text-danger">{{ countLevel('ekstrem') }}</strong>
          </div>
        </div>
        <div class="col-3">
          <div class="p-2 border rounded bg-light">
            <span class="text-warning d-block small fw-semibold">Tinggi (Kuning)</span>
            <strong class="fs-6 text-warning">{{ countLevel('tinggi') }}</strong>
          </div>
        </div>
        <div class="col-3">
          <div class="p-2 border rounded bg-light">
            <span class="text-success d-block small fw-semibold">Sedang / Rendah</span>
            <strong class="fs-6 text-success">{{ countLevel('sedang') + countLevel('rendah') }}</strong>
          </div>
        </div>
      </div>

      <!-- Tabel Dokumen -->
      <table class="table table-bordered align-middle report-table mb-4">
        <thead>
          <tr class="text-center">
            <th rowspan="2" style="width: 30px;">NO</th>
            <th rowspan="2" style="width: 110px;">UNIT</th>
            <th rowspan="2">PROSES KERJA & IDENTIFIKASI RISIKO</th>
            <th rowspan="2" style="width: 90px;">KLASIFIKASI</th>
            <th colspan="3" class="bg-light">RISIKO AWAL</th>
            <th rowspan="2">PENGENDALIAN & MITIGASI</th>
            <th colspan="3" class="bg-light">RISIKO SISA</th>
            <th rowspan="2" style="width: 100px;">PEMILIK RISIKO</th>
          </tr>
          <tr class="text-center bg-light">
            <th style="width: 25px;">D</th>
            <th style="width: 25px;">F</th>
            <th style="width: 35px;">R</th>
            <th style="width: 25px;">D</th>
            <th style="width: 25px;">F</th>
            <th style="width: 35px;">R</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!items.length">
            <td colspan="12" class="text-center py-4 text-muted">Tidak ada data risiko untuk dicetak.</td>
          </tr>
          <tr v-for="(item, idx) in items" :key="item.id_risiko">
            <td class="text-center">{{ idx + 1 }}</td>
            <td class="fw-semibold">{{ item.departemen?.nama || item.kd_departemen }}</td>
            <td>
              <div class="fw-bold">{{ item.proses_kerja }}</div>
              <div class="text-secondary">{{ item.identifikasi_risiko }}</div>
            </td>
            <td>{{ item.klasifikasi?.nama_klasifikasi }}</td>
            <!-- Inheren -->
            <td class="text-center">{{ item.dampak_awal }}</td>
            <td class="text-center">{{ item.frekuensi_awal }}</td>
            <td class="text-center fw-bold" :class="getTextColorByLevel(item.level_awal)">
              {{ item.skor_awal }}
            </td>
            <!-- Pengendalian -->
            <td>
              <div v-if="item.rekom_mitigasi"><strong>Mitigasi:</strong> {{ item.rekom_mitigasi }}</div>
              <div v-if="item.rekom_avoid"><strong>Avoid:</strong> {{ item.rekom_avoid }}</div>
              <div v-if="item.rekom_administrasi"><strong>Administrasi:</strong> {{ item.rekom_administrasi }}</div>
              <div v-if="item.rekom_transfer"><strong>Transfer:</strong> {{ item.rekom_transfer }}</div>
            </td>
            <!-- Residual -->
            <td class="text-center">{{ item.dampak_sisa }}</td>
            <td class="text-center">{{ item.frekuensi_sisa }}</td>
            <td class="text-center fw-bold" :class="getTextColorByLevel(item.level_sisa)">
              {{ item.skor_sisa }}
            </td>
            <td>{{ item.risk_owner?.nama || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Lembar Pengesahan Tanda Tangan -->
      <div class="row pt-4 text-center signature-section" style="font-size: 0.85rem;">
        <div class="col-4">
          <div>Mengetahui,</div>
          <div class="fw-bold">Ketua Komite PMKP / K3RS</div>
          <div style="height: 60px;"></div>
          <div class="fw-bold text-decoration-underline">( ........................................ )</div>
          <div class="small text-muted">NIP. ............................</div>
        </div>
        <div class="col-4"></div>
        <div class="col-4">
          <div>Pekalongan, {{ currentDateFormatted }}</div>
          <div class="fw-bold">Direktur RSIA Aisyiyah Pekajangan</div>
          <div style="height: 60px;"></div>
          <div class="fw-bold text-decoration-underline">( dr. Himawan Budityastomo, Sp.OG )</div>
          <div class="small text-muted">Direktur RS</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import manajemenRisikoService from '../../services/manajemenRisikoService'

const items = ref([])
const departemens = ref([])
const selectedUnit = ref('')
const currentYear = ref(2027)

const selectedUnitName = computed(() => {
  if (!selectedUnit.value) return ''
  const u = departemens.value.find(d => d.dep_id === selectedUnit.value)
  return u ? u.nama : selectedUnit.value
})

const currentDateFormatted = computed(() => {
  return new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
})

const countLevel = (lvl) => {
  return items.value.filter(i => i.level_awal === lvl).length
}

const getTextColorByLevel = (lvl) => {
  const map = {
    ekstrem: 'text-danger',
    tinggi: 'text-warning',
    sedang: 'text-success',
    rendah: 'text-info'
  }
  return map[lvl] || ''
}

const fetchData = async () => {
  try {
    const params = {
      kd_departemen: selectedUnit.value || undefined
    }
    const res = await manajemenRisikoService.getAll(params)
    if (res.data?.success) {
      items.value = res.data.data || []
    }
  } catch (err) {
    console.error('Failed to load report data', err)
  }
}

const fetchMetadata = async () => {
  try {
    const res = await manajemenRisikoService.getMeta()
    if (res.data?.success) {
      departemens.value = res.data.data.departemens || []
    }
  } catch (err) {
    console.error('Failed to load metadata', err)
  }
}

const printReport = () => {
  window.print()
}

onMounted(async () => {
  await fetchMetadata()
  await fetchData()
})
</script>

<style scoped>
.main-bg {
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.paper-sheet {
  max-width: 1200px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.report-table {
  font-size: 0.75rem;
}

.report-table th, .report-table td {
  padding: 6px 8px;
  vertical-align: middle;
}

@media print {
  .no-print, header, .sidebar, .sidebar-backdrop {
    display: none !important;
  }
  body, .main-bg {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .paper-sheet {
    max-width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
}
</style>
