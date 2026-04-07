<template>
  <div class="satusehat-diagnosticreport-radiology-view">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1">Monitoring DiagnosticReport Radiologi</h2>
        <p class="page-subtitle text-secondary mb-0">Sinkronisasi laporan diagnostik radiologi ke SatuSehat</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4 animate__animated animate__fadeInDown">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Awal</label>
            <div class="date-input-wrapper">
              <input type="date" class="form-control form-control-custom" v-model="filters.tglAwal" @change="fetchData(true)">
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Akhir</label>
            <div class="date-input-wrapper">
              <input type="date" class="form-control form-control-custom" v-model="filters.tglAkhir" :min="filters.tglAwal" @change="fetchData(true)">
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Cari Order / Pasien</label>
            <input type="text" class="form-control form-control-custom" v-model="filters.keyword" placeholder="No. Order / Nama / No. Rawat..." @keyup.enter="fetchData(true)">
          </div>
          <div class="col-md-5 d-flex align-items-end gap-2">
            <button class="btn btn-primary flex-fill py-2" @click="fetchData(true)" :disabled="loading">
              <i class="fas fa-sync-alt me-2"></i> Refresh List
            </button>
            <button class="btn btn-success flex-fill py-2" @click="handleSync" :disabled="syncLoading">
              <span v-if="syncLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-paper-plane me-2"></i> Kirim Data (Background)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm animate__animated animate__fadeInUp animate__delay-1s">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-custom mb-0">
            <thead>
              <tr>
                <th class="ps-4">No. Order & Rawat</th>
                <th>Pasien</th>
                <th>Pemeriksaan & Referensi</th>
                <th>Waktu Hasil</th>
                <th class="text-center">Status Sync</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="text-muted mt-2 mb-0">Memuat data diagnosticreport...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="5" class="text-center py-5">
                  <i class="fas fa-file-medical fa-3x text-muted mb-3 opacity-50"></i>
                  <h6 class="text-muted">Tidak ada data diagnosticreport radiologi ditemukan</h6>
                </td>
              </tr>
              <tr v-for="(item, index) in items" :key="index" v-else>
                <td class="ps-4">
                  <span class="fw-bold text-dark d-block mb-1">{{ item.noorder }}</span>
                  <span class="text-xs text-muted d-block">{{ item.no_rawat }}</span>
                  <div class="mt-2 text-xs">
                    <i class="fas fa-calendar-alt me-1"></i> {{ item.tgl_registrasi }}
                  </div>
                </td>
                <td>
                  <span class="d-block fw-bold text-dark mb-1">{{ item.nm_pasien }}</span>
                  <span class="badge bg-light text-primary border text-xs">RM: {{ item.no_rkm_medis }}</span>
                </td>
                <td>
                  <span class="d-block fw-medium text-dark mb-2">{{ item.nm_perawatan }}</span>
                  <div class="d-flex flex-wrap gap-1">
                    <span v-if="item.id_specimen" class="badge bg-soft-info text-info border border-info border-opacity-10 text-xs" :title="item.id_specimen">
                      <i class="fas fa-vial me-1"></i> Specimen Linked
                    </span>
                    <span v-else class="badge bg-soft-danger text-danger border border-danger border-opacity-10 text-xs">
                      <i class="fas fa-times-circle me-1"></i> No Specimen
                    </span>
                    
                    <span v-if="item.id_observation" class="badge bg-soft-info text-info border border-info border-opacity-10 text-xs" :title="item.id_observation">
                      <i class="fas fa-clipboard-check me-1"></i> Observation Linked
                    </span>
                    <span v-else class="badge bg-soft-danger text-danger border border-danger border-opacity-10 text-xs">
                      <i class="fas fa-times-circle me-1"></i> No Observation
                    </span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column gap-1">
                    <span class="text-sm fw-medium text-dark">{{ item.tgl_hasil }}</span>
                    <span class="text-xs text-muted">{{ item.jam_hasil }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <div v-if="item.id_diagnosticreport" class="badge-success-glow" :title="'ID: ' + item.id_diagnosticreport">
                    <i class="fas fa-check-circle me-1"></i> Terkirim
                  </div>
                  <div v-else class="badge-warning-glow">
                    <i class="fas fa-clock me-1"></i> Belum Sync
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 py-3" v-if="pagination.total > 0">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div class="text-muted text-sm pb-1">
            Menampilkan <span class="fw-bold text-dark">{{ pagination.from || 0 }}</span> 
            sampai <span class="fw-bold text-dark">{{ pagination.to || 0 }}</span> 
            dari <span class="fw-bold text-dark">{{ pagination.total }}</span> data
          </div>
          <nav aria-label="Page navigation" v-if="pagination.last_page > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button class="page-link" @click="changePage(pagination.current_page - 1)"><i class="fas fa-chevron-left"></i></button>
              </li>
              <li class="page-item" v-for="page in displayedPages" :key="page" :class="{ active: page === pagination.current_page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link" @click="changePage(pagination.current_page + 1)"><i class="fas fa-chevron-right"></i></button>
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
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

export default {
  name: 'SatuSehatDiagnosticReportRadiologyView',
  data() {
    return {
      items: [],
      loading: false,
      filters: {
        tglAwal: dayjs().format('YYYY-MM-DD'),
        tglAkhir: dayjs().format('YYYY-MM-DD'),
        keyword: ''
      },
      syncLoading: false,
      pagination: {
        current_page: 1, last_page: 1, total: 0, from: 0, to: 0
      }
    }
  },
  computed: {
    displayedPages() {
      let pages = [];
      let start = Math.max(1, this.pagination.current_page - 2);
      let end = Math.min(this.pagination.last_page, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData(resetPage = false) {
      if (resetPage) this.pagination.current_page = 1;
      this.loading = true;
      try {
        const response = await satuSehatService.getDiagnosticReportRadiology({
          tglAwal: this.filters.tglAwal,
          tglAkhir: this.filters.tglAkhir,
          keyword: this.filters.keyword,
          page: this.pagination.current_page
        });
        if (response.data && response.data.success) {
          this.items = response.data.data.data;
          this.pagination = {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            total: response.data.data.total,
            from: response.data.data.from,
            to: response.data.data.to
          };
        }
      } catch (error) {
        console.error('Error fetching diagnosticreports:', error);
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page && page !== this.pagination.current_page) {
        this.pagination.current_page = page;
        this.fetchData();
      }
    },
    async handleSync() {
      const result = await Swal.fire({
        title: 'Konfirmasi Sinkronisasi',
        text: `Kirim data DiagnosticReport Radiologi periode ${this.filters.tglAwal} s/d ${this.filters.tglAkhir}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#198754'
      });

      if (result.isConfirmed) {
        this.syncLoading = true;
        try {
          const response = await satuSehatService.syncDiagnosticReportRadiology({
            tglAwal: this.filters.tglAwal,
            tglAkhir: this.filters.tglAkhir
          });
          if (response.data && response.data.success) {
            Swal.fire('Berhasil', response.data.message, 'success');
          }
        } catch (error) {
          Swal.fire('Error', 'Terjadi kesalahan pada server', 'error');
        } finally {
          this.syncLoading = false;
        }
      }
    }
  }
}
</script>

<style scoped>
.bg-soft-info { background-color: rgba(13, 202, 240, 0.1); }
.bg-soft-success { background-color: rgba(25, 135, 84, 0.1); }
.bg-soft-danger { background-color: rgba(220, 53, 69, 0.1); }
.badge-success-glow {
  color: #198754;
  background-color: #d1e7dd;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 0 10px rgba(25, 135, 84, 0.1);
}
.badge-warning-glow {
  color: #856404;
  background-color: #fff3cd;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.1);
}
</style>
