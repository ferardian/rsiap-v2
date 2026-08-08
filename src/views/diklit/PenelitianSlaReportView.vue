<template>
  <div class="penelitian-sla-report">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="header-text">
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="header-icon-box">
              <i class="fas fa-award"></i>
            </div>
            <h2 class="page-title mb-0">Laporan Indikator Ketepatan Waktu Riset</h2>
          </div>
          <p class="page-subtitle text-muted mb-0">Laporan Indikator Ketepatan Waktu Penyediaan Data Riset (Target SLA ≤ 3 Hari)</p>
        </div>

        <div class="header-actions d-flex align-items-center gap-2">
          <router-link to="/diklit/penelitian" class="btn btn-action-secondary shadow-sm">
            <i class="fas fa-arrow-left me-1"></i>
            <span>Kembali ke Permohonan</span>
          </router-link>
          <button class="btn btn-action-success shadow-sm" @click="printReport">
            <i class="fas fa-print me-1"></i>
            <span>Cetak Laporan SLA</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card toolbar-card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label-custom">Periode Tanggal Awal</label>
            <input type="date" class="form-control form-control-custom" v-model="filters.tgl_awal" @change="fetchReport">
          </div>
          <div class="col-md-4">
            <label class="form-label-custom">Periode Tanggal Akhir</label>
            <input type="date" class="form-control form-control-custom" v-model="filters.tgl_akhir" @change="fetchReport">
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-refresh-premium shadow-sm w-100 justify-content-center" @click="fetchReport" :disabled="loading">
              <i :class="['fas fa-sync-alt me-1', { 'fa-spin': loading }]"></i>
              <span>Refresh Laporan</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon primary">
              <i class="fas fa-folder-open"></i>
            </div>
            <div>
              <div class="stat-label">Total Permohonan</div>
              <div class="stat-value">{{ summary.total_permohonan }}</div>
            </div>
          </div>
          <div class="stat-bar primary"></div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon info">
              <i class="fas fa-check-double"></i>
            </div>
            <div>
              <div class="stat-label">Selesai Disediakan</div>
              <div class="stat-value">{{ summary.total_selesai }}</div>
            </div>
          </div>
          <div class="stat-bar info"></div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon success">
              <i class="fas fa-clock"></i>
            </div>
            <div>
              <div class="stat-label">Tepat Waktu (≤ 3 Hr)</div>
              <div class="stat-value text-success">{{ summary.total_tepat_waktu }}</div>
            </div>
          </div>
          <div class="stat-bar success"></div>
        </div>
      </div>

      <div class="col-6 col-md-3">
        <div class="card stat-card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon warning">
              <i class="fas fa-percentage"></i>
            </div>
            <div>
              <div class="stat-label">Capaian Mutu (SLA)</div>
              <div class="stat-value text-primary">{{ summary.persentase_tepat_waktu }}%</div>
            </div>
          </div>
          <div class="stat-bar warning"></div>
        </div>
      </div>
    </div>

    <!-- Printable Report Card -->
    <div class="card table-card border-0 shadow-sm rounded-4 overflow-hidden" id="printableArea">
      <div class="card-header bg-white border-0 pt-4 px-4">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3">
          <div>
            <h5 class="fw-extrabold text-dark mb-1">REKAPITULASI KETEPATAN WAKTU PENYEDIAAN DATA RISET / PENDIDIKAN</h5>
            <p class="text-xs text-muted mb-0">Standar Ketepatan Waktu Penyediaan Data | Periode: <b>{{ formatDate(filters.tgl_awal) }}</b> s/d <b>{{ formatDate(filters.tgl_akhir) }}</b></p>
          </div>
          <div class="text-end">
            <span class="badge badge-sla-compliance">
              Kepatuhan SLA: {{ summary.persentase_tepat_waktu }}%
            </span>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table-premium">
            <thead>
              <tr>
                <th class="ps-4">No.</th>
                <th>No. Surat & Tgl Masuk</th>
                <th>Judul Penelitian & Institusi</th>
                <th>Peneliti</th>
                <th>Tgl Data Selesai</th>
                <th>Durasi (SLA)</th>
                <th class="pe-4 text-center">Status Kepatuhan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="py-4 text-center text-muted">Memuat data laporan akreditasi...</td>
              </tr>
              <tr v-else-if="detail.length === 0">
                <td colspan="7" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fa-2x mb-2 d-block opacity-50"></i>
                  Belum ada data permohonan pada periode tanggal ini
                </td>
              </tr>
              <tr v-for="(item, idx) in detail" :key="item.id">
                <td class="ps-4 font-mono fw-bold text-muted">{{ idx + 1 }}</td>
                <td>
                  <div class="fw-bold font-mono text-dark">{{ item.no_surat }}</div>
                  <div class="text-xs text-muted">{{ formatDate(item.tgl_pengajuan) }}</div>
                </td>
                <td class="max-w-title">
                  <div class="fw-bold text-primary title-text">{{ item.judul_penelitian }}</div>
                  <div class="text-xs text-muted mt-1">{{ item.institusi }}</div>
                </td>
                <td><span class="fw-semibold text-dark">{{ item.nama_peneliti }}</span></td>
                <td>{{ formatDate(item.tgl_data_selesai) || '-' }}</td>
                <td>
                  <span v-if="item.sla_hari !== null" class="fw-bold font-mono">{{ item.sla_hari }} Hari</span>
                  <span v-else class="text-muted fst-italic text-xs">Dalam Proses</span>
                </td>
                <td class="pe-4 text-center">
                  <span v-if="item.is_tepat_waktu === 'Y'" class="badge badge-status bg-success-subtle text-success-emphasis border border-success">
                    <i class="fas fa-check-circle me-1"></i> TEPAT WAKTU
                  </span>
                  <span v-else-if="item.is_tepat_waktu === 'T'" class="badge badge-status bg-danger-subtle text-danger-emphasis border border-danger">
                    <i class="fas fa-exclamation-triangle me-1"></i> TERLAMBAT
                  </span>
                  <span v-else class="badge badge-status bg-secondary-subtle text-secondary-emphasis border border-secondary">
                    DIPROSES
                  </span>
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
.penelitian-sla-report {
  padding-bottom: 2rem;
}

.header-icon-box {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  color: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 1.35rem;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.page-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
}

.btn-action-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-action-success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-action-secondary {
  background: white;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-action-secondary:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.toolbar-card {
  background: white;
  border: 1px solid #e2e8f0 !important;
}

.form-label-custom {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.35rem;
}

.form-control-custom {
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-size: 0.875rem;
  height: 44px;
  background: #f8fafc;
}

.btn-refresh-premium {
  height: 44px;
  padding: 0 1.25rem;
  border-radius: 12px;
  background: #2563eb;
  border: none;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-refresh-premium:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Stat Cards */
.stat-card {
  position: relative;
  transition: transform 0.2s ease;
  background: white;
}

.stat-card:hover { transform: translateY(-3px); }

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.stat-icon.primary { background: #eff6ff; color: #3b82f6; }
.stat-icon.info { background: #ecfeff; color: #0891b2; }
.stat-icon.success { background: #ecfdf5; color: #10b981; }
.stat-icon.warning { background: #fffbeb; color: #d97706; }

.stat-label {
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.stat-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.stat-bar.primary { background: #3b82f6; }
.stat-bar.info { background: #0891b2; }
.stat-bar.success { background: #10b981; }
.stat-bar.warning { background: #d97706; }

/* Table */
.custom-table-premium thead th {
  background: #f8fafc;
  padding: 1.1rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

.max-w-title { max-width: 320px; }

.title-text {
  font-size: 0.875rem;
  line-height: 1.35;
}

.badge-sla-compliance {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  font-size: 0.875rem;
  font-weight: 800;
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.badge-status {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
}

@media print {
  body * { visibility: hidden; }
  #printableArea, #printableArea * { visibility: visible; }
  #printableArea { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
