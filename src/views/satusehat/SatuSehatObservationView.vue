<template>
  <div class="satusehat-observation-view">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1">Monitoring Observation (Vital Signs)</h2>
        <p class="page-subtitle text-secondary mb-0">Daftar sinkronisasi Tanda-Tanda Vital SatuSehat</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4 animate__animated animate__fadeInDown">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Awal</label>
            <div class="date-input-wrapper">
              <input type="date" class="form-control form-control-custom" v-model="filters.tgl_awal" @change="fetchData(true)">
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Tanggal Akhir</label>
            <div class="date-input-wrapper">
              <input type="date" class="form-control form-control-custom" v-model="filters.tgl_akhir" :min="filters.tgl_awal" @change="fetchData(true)">
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide">Cari Pasien / No. Rawat</label>
            <input type="text" class="form-control form-control-custom" v-model="filters.keyword" placeholder="Nama / No. Rawat..." @keyup.enter="fetchData(true)">
          </div>
          <div class="col-md-5 d-flex align-items-end gap-2">
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
                <th class="ps-4">No. Rawat & Waktu</th>
                <th>Pasien</th>
                <th>Tipe</th>
                <th class="text-center">Indikator Sync (TTV)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="text-muted mt-2 mb-0">Memuat data observation...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="4" class="text-center py-5">
                  <i class="fas fa-inbox fa-3x text-muted mb-3 opacity-50"></i>
                  <h6 class="text-muted">Tidak ada data observation pemeriksaan</h6>
                </td>
              </tr>
              <tr v-for="(item, index) in items" :key="index" v-else>
                <td class="ps-4">
                  <span class="fw-bold text-dark d-block mb-1">{{ item.no_rawat }}</span>
                  <span class="text-xs text-muted">
                    <i class="fas fa-calendar-alt me-1"></i> {{ item.tgl_perawatan }} {{ item.jam_rawat }}
                  </span>
                </td>
                <td>
                  <span class="d-block fw-bold text-dark mb-1">{{ item.nm_pasien }}</span>
                  <span class="badge bg-light text-primary border text-xs">RM: {{ item.no_rkm_medis || '-' }}</span>
                </td>
                <td>
                  <span :class="['badge', item.tipe_perawatan === 'Ranap' ? 'bg-info' : 'bg-warning text-dark']">
                    {{ item.tipe_perawatan }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-flex justify-content-center gap-2 flex-wrap">
                    <!-- Iterasi melalui indikator -->
                    <div v-for="ind in indicators" :key="ind.key" class="indicator-wrapper" :title="getTooltip(item, ind)">
                      <div :class="['icon-circle', getStatusClass(item[ind.valKey], item[ind.idKey])]">
                        <i :class="['fas', ind.icon]"></i>
                      </div>
                      <span class="indicator-label mt-1">{{ ind.label }}</span>
                    </div>
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
  name: 'SatuSehatObservationView',
  data() {
    return {
      items: [],
      loading: false,
      filters: {
        tgl_awal: dayjs().format('YYYY-MM-DD'),
        tgl_akhir: dayjs().format('YYYY-MM-DD'),
        keyword: ''
      },
      syncLoading: false,
      pagination: {
        current_page: 1, last_page: 1, total: 0, from: 0, to: 0
      },
      indicators: [
        { key: 'suhu', label: 'Suhu', icon: 'fa-thermometer-half', valKey: 'suhu_tubuh', idKey: 'id_suhu' },
        { key: 'tensi', label: 'Tensi', icon: 'fa-stethoscope', valKey: 'tensi', idKey: 'id_tensi' },
        { key: 'nadi', label: 'Nadi', icon: 'fa-heartbeat', valKey: 'nadi', idKey: 'id_nadi' },
        { key: 'respi', label: 'Respi', icon: 'fa-lungs', valKey: 'respirasi', idKey: 'id_respi' },
        { key: 'spo2', label: 'SpO2', icon: 'fa-tint', valKey: 'spo2', idKey: 'id_spo2' },
        { key: 'gcs', label: 'GCS', icon: 'fa-brain', valKey: 'gcs', idKey: 'id_gcs' },
        { key: 'kes', label: 'Kes', icon: 'fa-user-md', valKey: 'kesadaran', idKey: 'id_kesadaran' },
        { key: 'lp', label: 'LP', icon: 'fa-tape', valKey: 'lingkar_perut', idKey: 'id_lp' },
        { key: 'bb', label: 'BB', icon: 'fa-weight', valKey: 'berat', idKey: 'id_bb' },
        { key: 'tb', label: 'TB', icon: 'fa-ruler-vertical', valKey: 'tinggi', idKey: 'id_tb' }
      ]
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
    getStatusClass(value, id) {
      if (!value || value == '-' || value == '0' || value == '0/0') return 'icon-disabled';
      return id ? 'icon-success' : 'icon-pending';
    },
    getTooltip(item, ind) {
      const val = item[ind.valKey];
      const id = item[ind.idKey];
      if (!val || val == '-' || val == '0' || val == '0/0') return `${ind.label}: Kosong`;
      return `${ind.label}: ${val} ${id ? '(Synced)' : '(Belum Sync)'}`;
    },
    async fetchData(resetPage = false) {
      if (resetPage) this.pagination.current_page = 1;
      this.loading = true;
      try {
        const response = await satuSehatService.getObservations({
          tglAwal: this.filters.tgl_awal,
          tglAkhir: this.filters.tgl_akhir,
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
        console.error('Error fetching observation data:', error);
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
        text: `Kirim data Observation TTV periode ${this.filters.tgl_awal} s/d ${this.filters.tgl_akhir}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#198754'
      });

      if (result.isConfirmed) {
        this.syncLoading = true;
        try {
          const response = await satuSehatService.syncObservation({
            tglAwal: this.filters.tgl_awal,
            tglAkhir: this.filters.tgl_akhir
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
.table-custom th {
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}
.indicator-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45px;
}
.icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}
.icon-success { background-color: #d1e7dd; color: #0f5132; border: 1px solid #badbcc; }
.icon-pending { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
.icon-disabled { background-color: #f8f9fa; color: #dee2e6; border: 1px solid #e9ecef; opacity: 0.5; }
.indicator-label { font-size: 0.65rem; font-weight: bold; color: #6c757d; text-transform: uppercase; }
</style>
