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
                <th class="ps-4">No. Rawat & Tanggal</th>
                <th>Pasien</th>
                <th>Poliklinik</th>
                <th>ID Encounter</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="text-muted mt-2 mb-0">Memuat data encounter...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="5" class="text-center py-5">
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
                <td>
                  <span class="badge bg-light text-dark border">{{ item.nm_poli }}</span>
                </td>
                <td>
                  <div v-if="item.id_encounter">
                    <span class="text-success fw-bold d-block text-truncate" style="max-width: 250px;" :title="item.id_encounter">
                      <i class="fas fa-check-circle me-1"></i> {{ item.id_encounter }}
                    </span>
                  </div>
                  <div v-else class="text-muted text-xs">
                    <i class="fas fa-times-circle me-1"></i> Belum ada ID
                  </div>
                </td>
                <td>
                  <div v-if="item.id_encounter" class="badge bg-success">Sukses</div>
                  <div v-else-if="item.pesan_error" class="d-flex flex-column align-items-start">
                    <span class="badge bg-danger mb-1">Gagal</span>
                    <span class="text-danger text-xs fw-bold" style="white-space: normal; max-width: 300px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" :title="item.pesan_error">
                      {{ item.pesan_error }}
                    </span>
                  </div>
                  <div v-else class="badge bg-secondary">Belum Sinkron</div>
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
}

.table-custom td {
  vertical-align: middle;
}
</style>
