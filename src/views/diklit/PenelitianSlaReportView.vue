<template>
  <div class="penelitian-sla-report">
    <!-- Header -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <div class="header-icon-box">
            <i class="fas fa-chart-bar"></i>
          </div>
          <h2 class="page-title mb-0">Laporan Indikator Ketepatan Waktu Data Riset</h2>
        </div>
        <p class="page-subtitle text-muted mb-0">Bukti kelengkapan fisik akreditasi RS - Elemen Penilaian MRMIK 1 EP e (Target SLA ≤ 3 Hari)</p>
      </div>
      <div class="d-flex gap-2">
        <router-link to="/diklit/penelitian" class="btn btn-outline-secondary rounded-3 shadow-sm px-3 d-flex align-items-center gap-2">
          <i class="fas fa-arrow-left"></i>
          <span>Kembali ke Permohonan</span>
        </router-link>
        <button class="btn btn-success rounded-3 shadow-sm px-3 d-flex align-items-center gap-2" @click="printReport">
          <i class="fas fa-print"></i>
          <span>Cetak Laporan Akreditasi</span>
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <label class="form-label text-xs font-semibold text-muted mb-1">Periode Tanggal Awal</label>
            <input type="date" class="form-control" v-model="filters.tgl_awal" @change="fetchReport">
          </div>
          <div class="col-md-4">
            <label class="form-label text-xs font-semibold text-muted mb-1">Periode Tanggal Akhir</label>
            <input type="date" class="form-control" v-model="filters.tgl_akhir" @change="fetchReport">
          </div>
          <div class="col-md-4 text-end mt-auto">
            <button class="btn btn-primary rounded-3 shadow-sm px-4" @click="fetchReport" :disabled="loading">
              <i :class="['fas fa-sync-alt me-1', { 'fa-spin': loading }]"></i> Refresh Laporan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle bg-primary-soft text-primary">
              <i class="fas fa-file-alt fa-lg"></i>
            </div>
            <div>
              <div class="text-xs text-muted font-semibold text-uppercase">Total Permohonan</div>
              <h3 class="fw-bold mb-0 text-dark">{{ summary.total_permohonan }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle bg-info-soft text-info">
              <i class="fas fa-check-double fa-lg"></i>
            </div>
            <div>
              <div class="text-xs text-muted font-semibold text-uppercase">Selesai Disediakan</div>
              <h3 class="fw-bold mb-0 text-dark">{{ summary.total_selesai }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle bg-success-soft text-success">
              <i class="fas fa-clock fa-lg"></i>
            </div>
            <div>
              <div class="text-xs text-muted font-semibold text-uppercase">Tepat Waktu (≤ 3 Hr)</div>
              <h3 class="fw-bold mb-0 text-success">{{ summary.total_tepat_waktu }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle bg-warning-soft text-warning">
              <i class="fas fa-percentage fa-lg"></i>
            </div>
            <div>
              <div class="text-xs text-muted font-semibold text-uppercase">Capaian Mutu (SLA)</div>
              <h3 class="fw-bold mb-0 text-primary">{{ summary.persentase_tepat_waktu }}%</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Printable Report Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden" id="printableArea">
      <div class="card-header bg-white border-0 pt-4 px-4">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3">
          <div>
            <h5 class="fw-bold text-dark mb-1">REKAPITULASI KETEPATAN WAKTU PENYEDIAAN DATA RISET / PENDIDIKAN</h5>
            <p class="text-xs text-muted mb-0">Standar MRMIK 1 EP e | Periode: {{ formatDate(filters.tgl_awal) }} s/d {{ formatDate(filters.tgl_akhir) }}</p>
          </div>
          <div class="text-end">
            <span class="badge bg-success-subtle text-success border border-success fw-bold px-3 py-2">
              Kepatuhan SLA: {{ summary.persentase_tepat_waktu }}%
            </span>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0 custom-report-table">
            <thead>
              <tr>
                <th class="ps-4">No.</th>
                <th>No. Surat & Tanggal Pengajuan</th>
                <th>Judul Penelitian & Institusi</th>
                <th>Peneliti</th>
                <th>Tgl Data Selesai</th>
                <th>Durasi (SLA)</th>
                <th class="pe-4 text-center">Kepatuhan Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="py-4 text-center">Memuat data laporan...</td>
              </tr>
              <tr v-else-if="detail.length === 0">
                <td colspan="7" class="py-4 text-center text-muted">Belum ada data permohonan pada periode ini</td>
              </tr>
              <tr v-for="(item, idx) in detail" :key="item.id">
                <td class="ps-4 font-semibold">{{ idx + 1 }}</td>
                <td>
                  <div class="fw-bold">{{ item.no_surat }}</div>
                  <div class="text-xs text-muted">{{ formatDate(item.tgl_pengajuan) }}</div>
                </td>
                <td>
                  <div class="fw-semibold text-primary">{{ item.judul_penelitian }}</div>
                  <div class="text-xs text-muted">{{ item.institusi }}</div>
                </td>
                <td>{{ item.nama_peneliti }}</td>
                <td>{{ formatDate(item.tgl_data_selesai) || '-' }}</td>
                <td>
                  <span v-if="item.sla_hari !== null" class="fw-bold">{{ item.sla_hari }} Hari</span>
                  <span v-else class="text-muted italic">Dalam Proses</span>
                </td>
                <td class="pe-4 text-center">
                  <span v-if="item.is_tepat_waktu === 'Y'" class="badge bg-success"><i class="fas fa-check me-1"></i> TEPAT WAKTU</span>
                  <span v-else-if="item.is_tepat_waktu === 'T'" class="badge bg-danger"><i class="fas fa-times me-1"></i> TERLAMBAT</span>
                  <span v-else class="badge bg-secondary">DIPROSES</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import penelitianService from '@/services/penelitianService'
import dayjs from 'dayjs'

export default {
  name: 'PenelitianSlaReportView',
  data() {
    return {
      loading: false,
      filters: {
        tgl_awal: dayjs().startOf('year').format('YYYY-MM-DD'),
        tgl_akhir: dayjs().format('YYYY-MM-DD')
      },
      summary: {
        total_permohonan: 0,
        total_selesai: 0,
        total_tepat_waktu: 0,
        total_terlambat: 0,
        persentase_tepat_waktu: 0,
        rata_rata_hari: 0
      },
      detail: []
    }
  },
  mounted() {
    this.fetchReport()
  },
  methods: {
    async fetchReport() {
      this.loading = true
      try {
        const res = await penelitianService.getLaporanSla(this.filters)
        if (res.data.success) {
          this.summary = res.data.data.summary
          this.detail = res.data.data.detail
        }
      } catch (err) {
        console.error('Fetch SLA report error:', err)
      } finally {
        this.loading = false
      }
    },

    formatDate(d) {
      if (!d) return ''
      return dayjs(d).format('DD MMM YYYY')
    },

    printReport() {
      window.print()
    }
  }
}
</script>

<style scoped>
.header-icon-box {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  color: white;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.25rem;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-primary-soft { background-color: rgba(59, 130, 246, 0.1); }
.bg-info-soft { background-color: rgba(6, 182, 212, 0.1); }
.bg-success-soft { background-color: rgba(16, 185, 129, 0.1); }
.bg-warning-soft { background-color: rgba(245, 158, 11, 0.1); }

.custom-report-table thead th {
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
}

@media print {
  body * { visibility: hidden; }
  #printableArea, #printableArea * { visibility: visible; }
  #printableArea { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
