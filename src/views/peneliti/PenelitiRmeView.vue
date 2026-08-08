<template>
  <div class="peneliti-rme-view min-vh-100 bg-light p-3 p-md-4">
    <!-- Navbar / Header for Researcher -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-dark text-white p-3">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="header-icon-box bg-white text-dark">
            <i class="fas fa-user-shield"></i>
          </div>
          <div>
            <h4 class="mb-0 fw-bold">{{ permohonan.judul || 'Portal Data Penelitian RME' }}</h4>
            <div class="text-xs opacity-75">
              Peneliti: <b>{{ permohonan.peneliti || username }}</b> ({{ permohonan.institusi || 'Institusi' }})
            </div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-warning text-dark"><i class="fas fa-lock me-1"></i> Data Masked Mode</span>
          <button class="btn btn-sm btn-outline-light rounded-pill px-3" @click="handleLogout">
            <i class="fas fa-sign-out-alt me-1"></i> Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control border-start-0 ps-0" 
                v-model="filters.search" 
                placeholder="Cari ICD-10, Diagnosa, atau Poliklinik..."
                @keyup.enter="fetchData"
              >
            </div>
          </div>
          <div class="col-md-3">
            <input type="text" class="form-control" v-model="filters.kd_penyakit" placeholder="Kode ICD-10 (misal: O14)" @keyup.enter="fetchData">
          </div>
          <div class="col-md-4 text-end d-flex gap-2 justify-content-end">
            <button class="btn btn-outline-primary rounded-3 shadow-sm" @click="fetchData" :disabled="loading">
              <i :class="['fas fa-sync-alt me-1', { 'fa-spin': loading }]"></i> Refresh
            </button>
            <button class="btn btn-success rounded-3 shadow-sm" @click="exportCsv" :disabled="loading || items.length === 0">
              <i class="fas fa-file-excel me-1"></i> Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr>
                <th class="ps-4">No. Rawat (Masked)</th>
                <th>Identitas Pasien (Ter-Masking)</th>
                <th>Umur / JK</th>
                <th>Poliklinik & Penjamin</th>
                <th>Diagnosa Utama (ICD-10)</th>
                <th class="pe-4 text-end">Tgl Registrasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" v-for="n in 5" :key="n">
                <td colspan="6" class="py-4 text-center">
                  <div class="spinner-border spinner-border-sm text-primary me-2"></div> Memuat data RME ter-masking...
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="py-5 text-center text-muted">
                  <i class="fas fa-search fa-2x mb-2 d-block opacity-50"></i>
                  Tidak ada data RME ditemukan untuk kriteria ini
                </td>
              </tr>
              <tr v-for="item in items" :key="item.no_rawat">
                <td class="ps-4">
                  <div class="fw-mono text-dark font-semibold">{{ item.no_rawat }}</div>
                  <div class="text-xs text-muted">{{ item.no_rkm_medis }}</div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nm_pasien }}</div>
                  <div class="text-xs text-muted"><i class="fas fa-id-card me-1"></i> NIK: {{ item.no_ktp }}</div>
                  <div class="text-xs text-muted"><i class="fas fa-map-marker-alt me-1"></i> {{ item.alamat }}</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border me-1">{{ item.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                  <div class="text-xs text-muted mt-1">{{ item.umur }}</div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.nm_poli }}</div>
                  <div class="text-xs text-muted">{{ item.penjamin }}</div>
                </td>
                <td>
                  <span class="badge bg-info-subtle text-info border border-info font-mono me-1">{{ item.icd10_utama || 'N/A' }}</span>
                  <div class="fw-semibold text-dark text-xs mt-1">{{ item.nama_diagnosa || 'Diagnosa belum terisi' }}</div>
                </td>
                <td class="pe-4 text-end">
                  <div class="fw-semibold">{{ formatDate(item.tgl_registrasi) }}</div>
                  <div class="text-xs text-muted">{{ item.jam_reg }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-white p-3 border-top-0 d-flex justify-content-between align-items-center">
        <div class="text-xs text-muted">
          Showing <b>{{ items.length }}</b> of <b>{{ pagination.total }}</b> entries
        </div>
        <nav v-if="pagination.last_page > 1">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)"><i class="fas fa-chevron-left"></i></button>
            </li>
            <li class="page-item active">
              <span class="page-link">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
              <button class="page-link" @click="changePage(pagination.current_page + 1)"><i class="fas fa-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import penelitianService from '@/services/penelitianService'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

export default {
  name: 'PenelitiRmeView',
  data() {
    return {
      items: [],
      loading: false,
      username: localStorage.getItem('peneliti_username') || '',
      accessId: localStorage.getItem('peneliti_access_id') || '',
      permohonan: JSON.parse(localStorage.getItem('peneliti_permohonan') || '{}'),
      filters: { search: '', kd_penyakit: '', page: 1, limit: 15 },
      pagination: { current_page: 1, last_page: 1, total: 0 }
    }
  },
  mounted() {
    if (!localStorage.getItem('peneliti_token')) {
      this.$router.push('/portal-peneliti/login')
      return
    }
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const headers = {
          'X-Peneliti-Username': this.username,
          'X-Peneliti-Access-Id': this.accessId
        }

        const res = await penelitianService.getRmeMasked(this.filters, headers)
        if (res.data.success) {
          const payload = res.data.data
          this.items = payload.data
          this.pagination.current_page = payload.current_page
          this.pagination.last_page = payload.last_page
          this.pagination.total = payload.total

          if (res.data.permohonan) {
            this.permohonan = res.data.permohonan
          }
        }
      } catch (err) {
        console.error('Fetch RME error:', err)
        if (err.response?.status === 403) {
          Swal.fire('Akses Berakhir', 'Masa berlaku akun peneliti Anda telah habis.', 'warning')
          this.handleLogout()
        } else {
          Swal.fire('Error', 'Gagal memuat data RME', 'error')
        }
      } finally {
        this.loading = false
      }
    },

    changePage(p) {
      if (p < 1 || p > this.pagination.last_page) return
      this.filters.page = p
      this.fetchData()
    },

    formatDate(d) {
      if (!d) return ''
      return dayjs(d).format('DD MMM YYYY')
    },

    handleLogout() {
      localStorage.removeItem('peneliti_token')
      localStorage.removeItem('peneliti_access_id')
      localStorage.removeItem('peneliti_username')
      localStorage.removeItem('peneliti_permohonan')
      this.$router.push('/portal-peneliti/login')
    },

    exportCsv() {
      if (this.items.length === 0) return

      let csv = 'No Rawat,No RM,NIK,Nama Pasien,JK,Umur,Alamat,Poliklinik,Penjamin,ICD10 Utama,Nama Diagnosa,Tgl Registrasi\n'
      this.items.forEach(i => {
        csv += `"${i.no_rawat}","${i.no_rkm_medis}","${i.no_ktp}","${i.nm_pasien}","${i.jk}","${i.umur}","${i.alamat}","${i.nm_poli}","${i.penjamin}","${i.icd10_utama || ''}","${i.nama_diagnosa || ''}","${i.tgl_registrasi}"\n`
      })

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', `data_rme_masked_${dayjs().format('YYYYMMDD')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style scoped>
.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.fw-mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.custom-table thead th {
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
}
</style>
