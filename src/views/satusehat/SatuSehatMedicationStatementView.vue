<template>
  <div class="satusehat-medstatement">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1 text-dark fw-bold">Monitoring Medication Statement</h4>
        <p class="text-muted mb-0">Manajemen sinkronisasi data pernyataan pengobatan pasien ke SatuSehat</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="fetchData">
          <i class="fas fa-sync-alt me-2" :class="{ 'fa-spin': loading }"></i> Refresh
        </button>
        <button class="btn btn-primary" @click="handleSync" :disabled="syncing || loading">
          <i class="fas fa-cloud-upload-alt me-2"></i>
          {{ syncing ? 'Menyinkronkan...' : 'Kirim Data' }}
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label text-muted text-xs fw-bold tracking-wider text-uppercase">Tgl Awal (Penyerahan)</label>
            <input type="date" class="form-control" v-model="filter.tglAwal" @change="fetchData" />
          </div>
          <div class="col-md-3">
            <label class="form-label text-muted text-xs fw-bold tracking-wider text-uppercase">Tgl Akhir (Penyerahan)</label>
            <input type="date" class="form-control" v-model="filter.tglAkhir" @change="fetchData" />
          </div>
          <div class="col-md-4">
            <label class="form-label text-muted text-xs fw-bold tracking-wider text-uppercase">Pencarian</label>
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input type="text" class="form-control border-start-0 ps-0" v-model="filter.keyword" placeholder="Cari No. Rawat, Resep, Nama..." @keyup.enter="fetchData" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-4">Waktu & Rawat</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No. Resep</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pasien</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Obat Diberikan</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Encounter</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Mapping</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">Status Sync</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!data.length">
                <td colspan="7" class="text-center py-5">
                  <div class="empty-state">
                    <i class="fas fa-pills fa-3x text-muted mb-3"></i>
                    <h6 class="text-dark">Tidak ada data medication statement</h6>
                    <p class="text-muted text-sm">Ganti filter tanggal atau keyword pencarian.</p>
                  </div>
                </td>
              </tr>
              <tr v-for="(item, index) in data" :key="index">
                <td class="ps-4">
                  <div class="d-flex flex-column">
                    <span class="text-sm fw-bold text-dark">{{ item.tgl_penyerahan }} {{ item.jam_penyerahan }}</span>
                    <span class="text-xs text-muted">{{ item.no_rawat }}</span>
                  </div>
                </td>
                <td>
                  <span class="text-sm fw-bold text-primary">{{ item.no_resep || '-' }}</span>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="text-sm fw-bold text-dark">{{ item.nm_pasien }}</span>
                    <span class="text-xs text-muted">RM: {{ item.no_rkm_medis }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column max-w-300">
                    <span class="text-sm fw-bold text-dark text-truncate" :title="item.nm_obat">{{ item.nm_obat }}</span>
                    <span class="text-xs text-muted">Aturan Pakai: <strong>{{ item.aturan_pakai }}</strong></span>
                  </div>
                </td>
                <td class="text-center">
                  <div v-if="item.id_encounter" class="badge bg-success-soft text-success" :title="item.id_encounter">
                    <i class="fas fa-link me-1"></i> Terhubung
                  </div>
                  <div v-else class="badge bg-warning-soft text-warning">
                    <i class="fas fa-unlink me-1"></i> Belum
                  </div>
                </td>
                 <td class="text-center">
                  <div v-if="item.is_mapped" class="badge bg-success-soft text-success">
                    <i class="fas fa-check-circle me-1"></i> Terpetakan
                  </div>
                  <div v-else class="badge bg-danger-soft text-danger">
                    <i class="fas fa-exclamation-circle me-1"></i> Belum
                  </div>
                </td>
                <td class="text-center">
                  <div v-if="item.id_medicationstatement" class="d-flex align-items-center justify-content-center">
                    <span class="status-indicator bg-success"></span>
                    <span class="text-xs font-weight-bold ms-2 text-success">Terkirim</span>
                  </div>
                  <div v-else class="d-flex align-items-center justify-content-center">
                    <span class="status-indicator bg-warning"></span>
                    <span class="text-xs font-weight-bold ms-2 text-warning">Belum</span>
                  </div>
                  <div v-if="item.id_medicationstatement" class="text-xxs text-muted mt-1" :title="item.id_medicationstatement">
                    ID: {{ item.id_medicationstatement.substring(0,8) }}...
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer border-0 bg-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-sm text-muted">
            Menampilkan {{ meta.from || 0 }} - {{ meta.to || 0 }} dari {{ meta.total || 0 }} data
          </span>
          <nav v-if="meta.last_page > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
                <button class="page-link" @click="changePage(meta.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li class="page-item" v-for="page in displayedPages" :key="page" :class="{ active: meta.current_page === page }">
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
  name: 'SatuSehatMedicationStatementView',
  data() {
    return {
      loading: false,
      syncing: false,
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
      },
      filter: {
        tglAwal: new Date().toISOString().substr(0, 10),
        tglAkhir: new Date().toISOString().substr(0, 10),
        keyword: ''
      }
    }
  },
  computed: {
    displayedPages() {
      const current = this.meta.current_page
      const last = this.meta.last_page
      let start = Math.max(1, current - 2)
      let end = Math.min(last, start + 4)
      
      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  methods: {
    async fetchData() {
      if (this.loading) return
      
      this.loading = true
      try {
        const response = await satuSehatService.getMedicationStatements({
          tglAwal: this.filter.tglAwal,
          tglAkhir: this.filter.tglAkhir,
          keyword: this.filter.keyword,
          page: this.meta.current_page
        })
        
        if (response.data?.success) {
          const resPath = response.data.data
          this.data = resPath.data || []
          this.meta = {
            current_page: resPath.current_page,
            last_page: resPath.last_page,
            total: resPath.total,
            from: resPath.from,
            to: resPath.to
          }
        } else {
            this.data = []
            this.meta.total = 0
            console.error('API Error:', response?.data?.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: error.response?.data?.message || 'Terjadi kesalahan pada server'
        })
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.meta.last_page) {
        this.meta.current_page = page
        this.fetchData()
      }
    },
    async handleSync() {
      try {
        const result = await Swal.fire({
          title: 'Kirim Data Medication Statement?',
          text: `Sistem akan mengirimkan data Medication Statement periode ${this.filter.tglAwal} sampai ${this.filter.tglAkhir} ke SatuSehat secara background.`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Ya, Kirim',
          cancelButtonText: 'Batal',
          confirmButtonColor: '#3b82f6'
        })

        if (!result.isConfirmed) return

        this.syncing = true
        const response = await satuSehatService.syncMedicationStatement({
          tglAwal: this.filter.tglAwal,
          tglAkhir: this.filter.tglAkhir
        })

        if (response.data?.success) {
          Swal.fire({
            icon: 'success',
            title: 'Sinkronisasi Berjalan',
            text: response.data.message || 'Proses sinkronisasi sedang berjalan di background.',
            timer: 3000,
            showConfirmButton: false
          })
          
          setTimeout(() => {
            this.fetchData()
          }, 3000)
        } else {
             Swal.fire({
            icon: 'error',
            title: 'Sinkronisasi Gagal',
            text: response.data?.message || 'Terjadi kesalahan'
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: error.response?.data?.message || 'Terjadi kesalahan jaringan'
        })
      } finally {
        this.syncing = false
      }
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped>
.max-w-300 {
  max-width: 300px;
}
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.bg-success-soft {
  background-color: rgba(16, 185, 129, 0.1);
}
.bg-danger-soft {
  background-color: rgba(239, 68, 68, 0.1);
}
</style>
