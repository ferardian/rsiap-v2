<template>
  <div class="sr-radiology-page">

    <!-- Page Header -->
    <div class="page-header mb-3">
      <div>
        <h5 class="mb-0 fw-bold text-dark">
          <i class="fas fa-x-ray me-2 text-primary"></i>
          Monitoring ServiceRequest Radiologi
        </h5>
        <p class="text-muted small mb-0">Sinkronisasi data permintaan radiologi ke platform SatuSehat</p>
      </div>
      <div class="btn-group-actions">
        <button class="btn btn-sm btn-light border" @click="fetchData" :disabled="loading" style="white-space:nowrap;">
          <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i> Refresh
        </button>
        <button class="btn btn-sm btn-info text-white" @click="handlePushOrthanc" :disabled="pushing || loading" style="white-space:nowrap;">
          <i class="fas fa-broadcast-tower me-1"></i>
          {{ pushing ? 'Mengirim...' : 'Push DICOM' }}
        </button>
        <button class="btn btn-sm btn-primary" @click="handleSync" :disabled="syncing || loading" style="white-space:nowrap;">
          <i class="fas fa-cloud-upload-alt me-1"></i>
          {{ syncing ? 'Mengirim SR...' : 'Kirim SR' }}
        </button>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body py-3">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small text-muted fw-semibold mb-1">TGL AWAL</label>
            <input type="date" class="form-control form-control-sm" v-model="filter.tglAwal" @change="fetchData" />
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted fw-semibold mb-1">TGL AKHIR</label>
            <input type="date" class="form-control form-control-sm" v-model="filter.tglAkhir" @change="fetchData" />
          </div>
          <div class="col-md-6">
            <label class="form-label small text-muted fw-semibold mb-1">PENCARIAN</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0" v-model="filter.keyword"
                placeholder="No. Order, RM, Nama pasien, Jenis pemeriksaan..."
                @keyup.enter="fetchData" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Filter Badge -->
    <div class="row g-2 mb-3" v-if="stats.total > 0">
      <div class="col-auto">
        <span class="badge-stat bg-light text-dark border" :class="{ 'badge-stat-active-none': !filter.status_filter }" @click="setStatusFilter('')" style="cursor:pointer">
          <i class="fas fa-list-ul me-1 text-muted"></i> Semua: <b>{{ stats.total }}</b>
        </span>
      </div>
      <div class="col-auto">
        <span class="badge-stat bg-success-soft text-success" :class="{ 'badge-stat-active': filter.status_filter === 'sr_terkirim' }" @click="setStatusFilter('sr_terkirim')" style="cursor:pointer">
          <i class="fas fa-check-circle me-1"></i> SR Terkirim: <b>{{ stats.sr_terkirim }}</b>
        </span>
      </div>
      <div class="col-auto">
        <span class="badge-stat bg-info-soft text-info" :class="{ 'badge-stat-active': filter.status_filter === 'dicom_terkirim' }" @click="setStatusFilter('dicom_terkirim')" style="cursor:pointer">
          <i class="fas fa-broadcast-tower me-1"></i> DICOM Terkirim: <b>{{ stats.dicom_terkirim }}</b>
        </span>
      </div>
      <div class="col-auto">
        <span class="badge-stat bg-warning-soft text-warning" :class="{ 'badge-stat-active': filter.status_filter === 'menunggu_foto' }" @click="setStatusFilter('menunggu_foto')" style="cursor:pointer">
          <i class="fas fa-clock me-1"></i> Menunggu Foto: <b>{{ stats.menunggu_foto }}</b>
        </span>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 table-sm">
            <thead class="table-light">
              <tr>
                <th class="th-label ps-3">No. Order / Waktu</th>
                <th class="th-label">Pasien</th>
                <th class="th-label">Pemeriksaan</th>
                <th class="th-label">Dokter</th>
                <th class="th-label text-center">Encounter</th>
                <th class="th-label text-center">Status SR</th>
                <th class="th-label text-center">Status DICOM</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  <span class="text-muted small">Memuat data...</span>
                </td>
              </tr>
              <!-- Empty -->
              <tr v-else-if="!data.length">
                <td colspan="7" class="text-center py-5">
                  <i class="fas fa-x-ray fa-2x text-muted mb-2 d-block"></i>
                  <p class="text-muted small mb-0">Tidak ada data untuk filter yang dipilih</p>
                </td>
              </tr>
              <!-- Data -->
              <tr v-for="(item, index) in data" :key="index">
                <!-- Order & Waktu -->
                <td class="ps-3">
                  <div class="fw-semibold text-primary small">{{ item.noorder }}</div>
                  <div class="text-muted" style="font-size:11px;">{{ item.tgl_permintaan }} {{ item.jam_permintaan }}</div>
                  <div class="text-muted" style="font-size:11px;">Rawat: {{ item.no_rawat }}</div>
                </td>
                <!-- Pasien -->
                <td>
                  <div class="fw-semibold small text-dark text-truncate" style="max-width:160px;" :title="item.nm_pasien">{{ item.nm_pasien }}</div>
                  <div class="text-muted" style="font-size:11px;">RM: {{ item.no_rkm_medis }}</div>
                </td>
                <!-- Pemeriksaan -->
                <td>
                  <div v-if="item.is_mapped" class="fw-semibold small text-dark">{{ item.nm_perawatan }}</div>
                  <div v-else class="d-flex align-items-center gap-1">
                    <span class="fw-semibold small text-muted">{{ item.nm_perawatan }}</span>
                    <span class="badge bg-danger-soft text-danger" style="font-size:10px;">Belum Di-map</span>
                  </div>
                </td>
                <!-- Dokter -->
                <td>
                  <div class="small text-truncate" style="max-width:160px;" :title="item.nm_dokter">{{ item.nm_dokter }}</div>
                  <div class="text-muted text-truncate" style="font-size:11px;max-width:160px;" :title="item.diagnosa_klinis">{{ item.diagnosa_klinis || '-' }}</div>
                </td>
                <!-- Encounter -->
                <td class="text-center">
                  <span v-if="item.id_encounter" class="badge bg-success-soft text-success" :title="item.id_encounter">
                    <i class="fas fa-link me-1"></i>Ada
                  </span>
                  <span v-else class="badge bg-warning-soft text-warning">
                    <i class="fas fa-unlink me-1"></i>Belum
                  </span>
                </td>
                <!-- Status SR -->
                <td class="text-center">
                  <div v-if="item.id_servicerequest">
                    <span class="badge bg-success-soft text-success">
                      <i class="fas fa-check me-1"></i>Terkirim
                    </span>
                    <div class="text-muted mt-1" style="font-size:10px;" :title="item.id_servicerequest">
                      {{ item.id_servicerequest.substring(0,8) }}...
                    </div>
                  </div>
                  <span v-else class="badge bg-warning-soft text-warning">
                    <i class="fas fa-clock me-1"></i>Belum
                  </span>
                </td>
                <!-- Status DICOM -->
                <td class="text-center">
                  <div v-if="item.status_dicom === 'sent'">
                    <span class="badge bg-info-soft text-info">
                      <i class="fas fa-broadcast-tower me-1"></i>Terkirim
                    </span>
                    <div class="text-muted mt-1" style="font-size:10px;" v-if="item.dicom_sent_at">
                      {{ item.dicom_sent_at?.substring(0,16) }}
                    </div>
                  </div>
                  <span v-else-if="item.status_dicom === 'failed'" class="badge bg-danger-soft text-danger">
                    <i class="fas fa-times me-1"></i>Gagal
                  </span>
                  <span v-else class="badge bg-secondary-soft text-secondary">
                    <i class="fas fa-clock me-1"></i>Menunggu Foto
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div class="card-footer border-0 bg-white py-2 px-3">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">
            Menampilkan {{ meta.from || 0 }}–{{ meta.to || 0 }} dari {{ meta.total || 0 }} data
          </small>
          <nav v-if="meta.last_page > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
                <button class="page-link" @click="changePage(meta.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: meta.current_page === page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
                <button class="page-link" @click="changePage(meta.current_page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import satuSehatService from '@/services/satuSehatService'
import Swal from 'sweetalert2'

export default {
  name: 'SatuSehatServiceRequestRadiologyView',
  data() {
    return {
      loading: false,
      syncing: false,
      pushing: false,
      data: [],
      stats: { total: 0, sr_terkirim: 0, dicom_terkirim: 0, menunggu_foto: 0 },
      meta: { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
      filter: {
        tglAwal: new Date().toISOString().substr(0, 10),
        tglAkhir: new Date().toISOString().substr(0, 10),
        keyword: '',
        status_filter: ''
      }
    }
  },
  computed: {
    displayedPages() {
      const current = this.meta.current_page
      const last = this.meta.last_page
      let start = Math.max(1, current - 2)
      let end = Math.min(last, start + 4)
      if (end - start < 4) start = Math.max(1, end - 4)
      const pages = []
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    }
  },
  methods: {
    async fetchData() {
      if (this.loading) return
      this.loading = true
      try {
        const response = await satuSehatService.getServiceRequestRadiologi({
          tglAwal:       this.filter.tglAwal,
          tglAkhir:      this.filter.tglAkhir,
          keyword:       this.filter.keyword,
          status_filter: this.filter.status_filter,
          page:          this.meta.current_page
        })
        if (response.data?.success) {
          const r = response.data.data
          this.data  = r.data || []
          this.stats = response.data.stats || { total: 0, sr_terkirim: 0, dicom_terkirim: 0, menunggu_foto: 0 }
          this.meta  = { current_page: r.current_page, last_page: r.last_page, total: r.total, from: r.from, to: r.to }
        } else {
          this.data = []
          this.meta.total = 0
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal Memuat Data', text: error.response?.data?.message || 'Terjadi kesalahan' })
      } finally {
        this.loading = false
      }
    },
    setStatusFilter(val) {
      // Toggle: klik yg sama lagi = reset ke semua
      this.filter.status_filter = this.filter.status_filter === val ? '' : val
      this.meta.current_page = 1
      this.fetchData()
    },
    changePage(page) {
      if (page >= 1 && page <= this.meta.last_page) {
        this.meta.current_page = page
        this.fetchData()
      }
    },
    async handleSync() {
      const result = await Swal.fire({
        title: 'Kirim ServiceRequest?',
        text: `Sinkronisasi permintaan radiologi periode ${this.filter.tglAwal} s/d ${this.filter.tglAkhir} ke SatuSehat.`,
        icon: 'question', showCancelButton: true,
        confirmButtonText: 'Ya, Kirim', cancelButtonText: 'Batal', confirmButtonColor: '#3b82f6'
      })
      if (!result.isConfirmed) return
      try {
        this.syncing = true
        const response = await satuSehatService.syncServiceRequestRadiologi({
          tglAwal: this.filter.tglAwal, tglAkhir: this.filter.tglAkhir
        })
        if (response.data?.success) {
          Swal.fire({ icon: 'success', title: 'Sinkronisasi Berjalan', text: response.data.message, timer: 3000, showConfirmButton: false })
          setTimeout(() => this.fetchData(), 3000)
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan jaringan' })
      } finally {
        this.syncing = false
      }
    },
    async handlePushOrthanc() {
      const result = await Swal.fire({
        title: 'Push DICOM ke Router?',
        text: `Mencari foto rontgen di Orthanc untuk periode ${this.filter.tglAwal} s/d ${this.filter.tglAkhir} lalu dikirim ke DICOM Router.`,
        icon: 'question', showCancelButton: true,
        confirmButtonText: 'Ya, Push', cancelButtonText: 'Batal', confirmButtonColor: '#0dcaf0'
      })
      if (!result.isConfirmed) return
      try {
        this.pushing = true
        const response = await satuSehatService.pushOrthancRadiologi({
          tglAwal: this.filter.tglAwal, tglAkhir: this.filter.tglAkhir
        })
        if (response.data?.success) {
          const d = response.data.data
          Swal.fire({
            icon: 'success', title: 'Push DICOM Selesai',
            html: `<div class="text-start"><b>${d.pushed}</b> berhasil dikirim ke Router<br><b>${d.not_found_in_orthanc}</b> foto belum tersedia di Orthanc<br><b>${d.error}</b> gagal</div>`,
            confirmButtonText: 'OK'
          })
          setTimeout(() => this.fetchData(), 1500)
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan jaringan' })
      } finally {
        this.pushing = false
      }
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped>
.sr-radiology-page {
  padding: 0;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.btn-group-actions {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
}
.th-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #8392a5;
  letter-spacing: 0.5px;
  white-space: nowrap;
  padding: 10px 12px;
  border-bottom: 1px solid #e9ecef;
}
.badge-stat {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  user-select: none;
}
.badge-stat:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}
.badge-stat-active {
  box-shadow: 0 0 0 2.5px currentColor;
  font-weight: 700;
}
.badge-stat-active-none {
  box-shadow: 0 0 0 2px #6c757d;
  font-weight: 700;
}
.bg-success-soft {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}
.bg-warning-soft {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}
.bg-danger-soft {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}
.bg-info-soft {
  background-color: rgba(13, 202, 240, 0.1);
  border-color: rgba(13, 202, 240, 0.2);
}
.bg-secondary-soft {
  background-color: rgba(108, 117, 125, 0.1);
  border-color: rgba(108, 117, 125, 0.2);
}
.table-sm td {
  padding: 8px 12px;
  vertical-align: middle;
}
.table-hover tbody tr:hover {
  background-color: rgba(59, 130, 246, 0.03);
}
</style>
