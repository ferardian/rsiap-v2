<template>
  <div class="container-fluid py-3 px-3 px-md-4 main-bg">
    <!-- Header Section -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
      <div>
        <h4 class="fw-bold text-slate-800 mb-1 d-flex align-items-center gap-2 page-title">
          <i class="fas fa-book-medical text-primary"></i> Master Klasifikasi & Kamus Risiko
        </h4>
        <p class="text-slate-500 mb-0 small">
          Standar kamus risiko rumah sakit sesuai acuan STARKES PMKP dan Master Excel Tahun 2027.
        </p>
      </div>
    </div>

    <div class="row g-3">
      <!-- 11 Klasifikasi Risiko -->
      <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-header bg-white py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between">
            <h6 class="fw-bold text-slate-800 mb-0">11 Klasifikasi Risiko Rumah Sakit</h6>
            <span class="badge bg-primary-subtle text-primary small">Standar Baku</span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped align-middle mb-0" style="font-size: 0.85rem;">
                <thead class="table-light">
                  <tr>
                    <th style="width: 40px;" class="text-center">No</th>
                    <th style="width: 80px;">Kode</th>
                    <th>Nama Klasifikasi</th>
                    <th>Definisi & Ruang Lingkup Bahaya</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(k, idx) in klasifikasis" :key="k.id_klasifikasi">
                    <td class="text-center fw-semibold text-muted">{{ idx + 1 }}</td>
                    <td><span class="badge bg-slate-100 text-slate-800 border font-monospace">{{ k.kode }}</span></td>
                    <td class="fw-bold text-slate-800">{{ k.nama_klasifikasi }}</td>
                    <td class="small text-slate-600">{{ k.deskripsi }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 6 Ruang Lingkup Risiko & Matriks Panduan -->
      <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm rounded-3 mb-3">
          <div class="card-header bg-white py-2.5 px-3 border-bottom">
            <h6 class="fw-bold text-slate-800 mb-0">6 Ruang Lingkup Sasaran Dampak</h6>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush small">
              <li v-for="(rl, idx) in ruangLingkups" :key="rl.id_ruang_lingkup" class="list-group-item py-2 px-3">
                <div class="fw-bold text-slate-800">{{ idx + 1 }}. {{ rl.nama_ruang_lingkup }}</div>
                <div class="text-muted" style="font-size: 0.78rem;">{{ rl.deskripsi }}</div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Matriks 4 Level Panduan Tindakan -->
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-header bg-white py-2.5 px-3 border-bottom">
            <h6 class="fw-bold text-slate-800 mb-0">Ketentuan Tindakan Berdasarkan Skor</h6>
          </div>
          <div class="card-body p-3 small">
            <div class="d-flex flex-column gap-2">
              <div class="p-2 rounded bg-danger-subtle border border-danger-subtle">
                <strong class="text-danger">Ekstrem (Skor 15 - 25):</strong> Tindakan segera oleh Direksi & Manajemen RS dalam 1x24 jam.
              </div>
              <div class="p-2 rounded bg-warning-subtle border border-warning-subtle">
                <strong class="text-warning-emphasis">Tinggi (Skor 8 - 12):</strong> Diperlukan rencana penanganan terinci & tinjauan mingguan oleh Kepala Unit.
              </div>
              <div class="p-2 rounded bg-success-subtle border border-success-subtle">
                <strong class="text-success">Sedang (Skor 4 - 6):</strong> Penanganan melalui prosedur rutin dan monitoring bulanan.
              </div>
              <div class="p-2 rounded bg-info-subtle border border-info-subtle">
                <strong class="text-info-emphasis">Rendah (Skor 1 - 3):</strong> Risiko dapat diterima (acceptable), tinjauan tahunan.
              </div>
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

const klasifikasis = ref([])
const ruangLingkups = ref([])

onMounted(async () => {
  try {
    const res = await manajemenRisikoService.getMeta()
    if (res.data?.success) {
      klasifikasis.value = res.data.data.klasifikasis || []
      ruangLingkups.value = res.data.data.ruang_lingkups || []
    }
  } catch (err) {
    console.error('Failed to load kamus metadata', err)
  }
})
</script>

<style scoped>
.main-bg {
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.card .card-header {
  background: #ffffff !important;
  background-image: none !important;
  color: #1e293b !important;
  padding: 0.85rem 1.15rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  text-align: left !important;
}
</style>
