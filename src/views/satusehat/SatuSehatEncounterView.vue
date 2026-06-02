<template>
  <div class="satusehat-encounter-view">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1">Monitoring Encounter</h2>
        <p class="page-subtitle text-secondary mb-0">Daftar log sinkronisasi SatuSehat Encounter</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4 animate__animated animate__fadeInDown">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Awal</label>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                class="form-control form-control-custom" 
                v-model="filters.tgl_awal"
                @change="fetchData(true)"
              >
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Akhir</label>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                class="form-control form-control-custom" 
                v-model="filters.tgl_akhir"
                :min="filters.tgl_awal"
                @change="fetchData(true)"
              >
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Status Sinkronisasi</label>
            <select class="form-select form-control-custom" v-model="filters.status" @change="fetchData(true)">
              <option value="">Semua Status</option>
              <option value="sukses">Sukses</option>
              <option value="gagal">Gagal / Error</option>
              <option value="belum">Belum Sinkron</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Cari Pasien / No. Rawat</label>
            <input type="text" class="form-control form-control-custom" v-model="filters.keyword" placeholder="Nama / No. RM / No. Rawat..." @keyup.enter="fetchData(true)">
          </div>
          <div class="col-md-3 d-flex align-items-end gap-2">
            <button class="btn btn-primary flex-fill py-2" @click="fetchData(true)">
              <i class="fas fa-sync-alt me-2"></i> Refresh List
            </button>
            <button class="btn btn-success flex-fill py-2" @click="handleSync" :disabled="syncLoading">
              <span v-if="syncLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-paper-plane me-2"></i> Kirim Data
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
                <th class="ps-4 text-nowrap">No. Rawat & Tanggal</th>
                <th class="text-nowrap">Pasien</th>
                <th class="text-center text-nowrap">Jenis / Kelas</th>
                <th class="text-nowrap">Poliklinik</th>
                <th class="text-nowrap">ID Encounter</th>
                <th class="text-nowrap">Status</th>
                <th class="text-center text-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="text-muted mt-2 mb-0">Memuat data encounter...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5">
                  <i class="fas fa-inbox fa-3x text-muted mb-3 opacity-50"></i>
                  <h6 class="text-muted">Tidak ada data encounter</h6>
                </td>
              </tr>
              <tr v-for="(item, index) in items" :key="index" v-else>
                <td class="ps-4">
                  <span class="fw-bold text-dark d-block mb-1">{{ item.no_rawat }}</span>
                  <span class="text-xs text-muted">
                    <i class="fas fa-calendar-alt me-1"></i> {{ item.tgl_registrasi }} {{ item.jam_reg }}
                  </span>
                </td>
                <td>
                  <span class="d-block fw-bold text-dark mb-1">{{ item.nm_pasien }}</span>
                  <span class="text-xs text-muted">
                    <i class="fas fa-id-card me-1"></i> {{ item.no_ktp || '-' }}
                  </span>
                </td>
                <td class="text-center">
                  <span v-if="item.status_lanjut === 'Ranap'" class="badge badge-soft-danger" title="Inpatient">
                    IMP
                  </span>
                  <span v-else-if="item.kd_poli === 'IGDK'" class="badge badge-soft-warning" title="Emergency">
                    EMER
                  </span>
                  <span v-else class="badge badge-soft-info" title="Ambulatory">
                    AMB
                  </span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ item.nm_poli }}</span>
                </td>
                <td>
                  <div v-if="item.id_encounter" class="badge-id-success" :title="item.id_encounter">
                    <i class="fas fa-check-circle"></i>
                    <span class="text-truncate text-monospace" style="max-width: 180px;">{{ item.id_encounter }}</span>
                  </div>
                  <div v-else class="badge-id-pending">
                    <i class="fas fa-times-circle"></i>
                    <span>Belum Sync</span>
                  </div>
                </td>
                <td>
                  <div v-if="item.id_encounter" class="badge bg-success">Sukses</div>
                  <div v-else-if="item.pesan_error" class="d-flex flex-column align-items-start gap-1">
                    <span class="badge bg-danger">Gagal</span>
                    <span class="error-text-box" style="max-width: 280px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;" :title="item.pesan_error">
                      {{ item.pesan_error }}
                    </span>
                  </div>
                  <div v-else class="badge bg-secondary">Belum Sinkron</div>
                </td>
                <td class="text-center">
                  <button 
                    class="btn btn-sync-row" 
                    @click="syncSingle(item.no_rawat)"
                    :disabled="syncSingleLoading === item.no_rawat"
                    title="Sync data untuk kunjungan ini saja"
                  >
                    <span v-if="syncSingleLoading === item.no_rawat" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    <i v-else class="fas fa-sync-alt me-1"></i>
                    Sync
                  </button>
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
                <button class="page-link" @click="changePage(pagination.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              
              <li class="page-item" v-for="page in displayedPages" :key="page" :class="{ active: page === pagination.current_page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link" @click="changePage(pagination.current_page + 1)">
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
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

export default {
  name: 'SatuSehatEncounterView',
  data() {
    return {
      items: [],
      loading: false,
      filters: {
        tgl_awal: dayjs().format('YYYY-MM-DD'),
        tgl_akhir: dayjs().format('YYYY-MM-DD'),
        status: '',
        keyword: ''
      },
      syncLoading: false,
      syncSingleLoading: '',
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
      }
    }
  },
  computed: {
    displayedPages() {
      let pages = [];
      let start = Math.max(1, this.pagination.current_page - 2);
      let end = Math.min(this.pagination.last_page, start + 4);
      
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
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
        const response = await satuSehatService.getEncounter({
          tglAwal: this.filters.tgl_awal,
          tglAkhir: this.filters.tgl_akhir,
          status: this.filters.status,
          keyword: this.filters.keyword,
          page: this.pagination.current_page
        });
        
        if (response.data && response.data.data) {
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
        console.error('Error fetching satusehat encounter data:', error);
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
        text: `Apakah Anda yakin ingin mengirim data SatuSehat untuk periode ${this.filters.tgl_awal} s/d ${this.filters.tgl_akhir}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#198754'
      });

      if (result.isConfirmed) {
        this.syncLoading = true;
        try {
          const response = await satuSehatService.syncEncounter({
            tglAwal: this.filters.tgl_awal,
            tglAkhir: this.filters.tgl_akhir,
            resource: 'all'
          });

          if (response.data && response.data.success) {
            Swal.fire({
                title: 'Berhasil',
                text: response.data.message || 'Sinkronisasi berhasil dijalankan',
                icon: 'success',
                timer: 3000
            });
            this.fetchData(true);
          } else {
            Swal.fire('Gagal', (response.data && response.data.message) || 'Terjadi kesalahan saat sinkronisasi', 'error');
          }
        } catch (error) {
          console.error('Error syncing SatuSehat data:', error);
          const errorMsg = error.response && error.response.data && error.response.data.message 
            ? error.response.data.message 
            : 'Terjadi kesalahan pada server';
          Swal.fire('Error', errorMsg, 'error');
        } finally {
          this.syncLoading = false;
        }
      }
    },
    async syncSingle(noRawat) {
      this.syncSingleLoading = noRawat;
      try {
        const response = await satuSehatService.syncEncounter({
          noRawat: noRawat
        });

        if (response.data && response.data.success) {
          Swal.fire({
            title: 'Berhasil',
            text: response.data.message || 'Sinkronisasi kunjungan berhasil',
            icon: 'success',
            timer: 3000
          });
          this.fetchData();
        } else {
          Swal.fire(
            'Gagal', 
            (response.data && response.data.message) || 'Terjadi kesalahan saat sinkronisasi', 
            'error'
          );
          this.fetchData();
        }
      } catch (error) {
        console.error('Error syncing single SatuSehat encounter:', error);
        const errorMsg = error.response && error.response.data && error.response.data.message 
          ? error.response.data.message 
          : 'Terjadi kesalahan pada server';
        Swal.fire('Error', errorMsg, 'error');
        this.fetchData();
      } finally {
        this.syncSingleLoading = '';
      }
    }
  }
}
</script>

<style scoped>
.table-custom th {
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.table-custom td {
  vertical-align: middle;
}

.badge-soft-danger {
  background-color: rgba(220, 53, 69, 0.08) !important;
  color: #dc3545 !important;
  border: 1px solid rgba(220, 53, 69, 0.2) !important;
  padding: 0.4rem 0.75rem !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
  letter-spacing: 0.5px;
}

.badge-soft-warning {
  background-color: rgba(245, 158, 11, 0.08) !important;
  color: #d97706 !important;
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
  padding: 0.4rem 0.75rem !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
  letter-spacing: 0.5px;
}

.badge-soft-info {
  background-color: rgba(13, 202, 240, 0.08) !important;
  color: #0dcaf0 !important;
  border: 1px solid rgba(13, 202, 240, 0.2) !important;
  padding: 0.4rem 0.75rem !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
  letter-spacing: 0.5px;
}

.badge-id-success {
  background-color: rgba(25, 135, 84, 0.08);
  color: #198754;
  border: 1px solid rgba(25, 135, 84, 0.15);
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
}

.badge-id-pending {
  background-color: rgba(108, 117, 125, 0.08);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.15);
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.error-text-box {
  font-size: 0.7rem;
  line-height: 1.4;
  background-color: rgba(220, 53, 69, 0.04);
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(220, 53, 69, 0.1);
  color: #dc3545;
  font-weight: 600;
  word-break: break-word;
}

.btn-sync-row {
  background-color: rgba(94, 114, 228, 0.08);
  color: #5e72e4;
  border: 1px solid rgba(94, 114, 228, 0.15);
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-sync-row:hover:not(:disabled) {
  background-color: #5e72e4;
  color: white;
  border-color: #5e72e4;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(94, 114, 228, 0.25);
}

.btn-sync-row:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
