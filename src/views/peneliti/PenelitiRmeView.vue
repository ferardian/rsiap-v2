<template>
  <div class="peneliti-rme-page min-vh-100 p-2 p-md-3">
    <!-- Navbar / Header for Researcher -->
    <div class="card navbar-researcher border-0 shadow-lg rounded-4 mb-3 text-white p-2.5 p-md-3 position-relative overflow-hidden">
      <div class="navbar-bg-glow"></div>
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 position-relative z-2">
        <div class="d-flex align-items-center gap-2.5">
          <div class="brand-logo-glass">
            <img src="@/assets/logo-rsia.png" alt="RSIA Logo" class="img-fluid logo-img">
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <h5 class="mb-0 fw-extrabold text-white tracking-tight">{{ permohonan.judul_penelitian || permohonan.judul || 'Portal Data Penelitian RME' }}</h5>
            </div>
            <div class="text-xs text-slate-300 mt-0.5">
              Peneliti: <b class="text-white">{{ permohonan.nama_peneliti || permohonan.peneliti || username }}</b> &bull; {{ permohonan.institusi || 'Institusi' }}
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <span class="badge badge-security-glow">
            <i class="fas fa-shield-check me-1 text-emerald-400"></i> Protected & Masked Mode
          </span>
          <button class="btn btn-logout-glass" @click="handleLogout">
            <i class="fas fa-sign-out-alt me-1"></i> Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards for Researcher (Compact) -->
    <div class="row g-2.5 mb-3">
      <div class="col-6 col-md-4">
        <div class="card stat-card-modern border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-2.5 d-flex align-items-center gap-2.5">
            <div class="stat-icon-modern primary">
              <i class="fas fa-database"></i>
            </div>
            <div>
              <div class="stat-label-modern">Total Record Ditemukan</div>
              <div class="stat-value-modern">{{ pagination.total }} Pasien</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-6 col-md-4">
        <div class="card stat-card-modern border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-2.5 d-flex align-items-center gap-2.5">
            <div class="stat-icon-modern info">
              <i class="fas fa-user-shield"></i>
            </div>
            <div>
              <div class="stat-label-modern">Status Anonimasi</div>
              <div class="stat-value-modern text-info">De-Identified</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card stat-card-modern border-0 shadow-sm rounded-4 h-100 overflow-hidden">
          <div class="card-body p-2.5 d-flex align-items-center gap-2.5">
            <div class="stat-icon-modern success">
              <i class="fas fa-certificate"></i>
            </div>
            <div>
              <div class="stat-label-modern">Target Ketepatan Waktu</div>
              <div class="stat-value-modern text-success">≤ 3 Hari Kerja</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar (Compact) -->
    <div class="card toolbar-card-modern border-0 shadow-sm rounded-4 mb-3">
      <div class="card-body p-2.5">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <div class="search-input-wrapper flex-grow-1">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                class="form-control search-input-modern" 
                v-model="filters.search" 
                placeholder="Cari Diagnosa, Poliklinik, atau Kata Kunci..."
                @keyup.enter="fetchData"
              >
              <button v-if="filters.search" class="btn-clear-search" @click="filters.search = ''; fetchData()">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="icd-input-wrapper">
              <i class="fas fa-hashtag search-icon"></i>
              <input 
                type="text" 
                class="form-control search-input-modern" 
                v-model="filters.kd_penyakit" 
                placeholder="Filter ICD-10 (misal: O14)" 
                @keyup.enter="fetchData"
              >
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-refresh-modern shadow-sm" @click="fetchData" :disabled="loading">
              <i :class="['fas fa-sync-alt me-1.5', { 'fa-spin': loading }]"></i>
              <span>Refresh</span>
            </button>
            <button class="btn btn-export-excel-modern shadow-sm" @click="exportCsv" :disabled="loading || isExporting || pagination.total === 0">
              <i :class="['fas me-1.5', isExporting ? 'fa-spinner fa-spin' : 'fa-file-excel']"></i>
              <span>{{ isExporting ? 'Mengunduh...' : 'Export Semua CSV' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card (Scrollable Container & Sticky Header) -->
    <div class="card table-card-modern border-0 shadow-sm rounded-4 overflow-hidden mb-0">
      <div class="card-body p-0">
        <div class="table-responsive-scrollable">
          <table class="table table-hover align-middle mb-0 custom-table-compact">
            <thead>
              <tr>
                <th class="ps-3">No. Rawat & RM (Masked)</th>
                <th>Identitas Pasien (Ter-Masking)</th>
                <th>Umur / JK</th>
                <th>Poliklinik & Penjamin</th>
                <th>Diagnosa Utama (ICD-10)</th>
                <th class="pe-3 text-end">Tgl Registrasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" v-for="n in 5" :key="n">
                <td colspan="6" class="p-3 text-center">
                  <div class="shimmer-line mb-2"></div>
                  <div class="shimmer-line w-75 mx-auto"></div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="py-5 text-center">
                  <div class="empty-icon-box mx-auto mb-2">
                    <i class="fas fa-search-minus"></i>
                  </div>
                  <p class="fw-bold text-slate-700 mb-1">Tidak Ada Data RME Ditemukan</p>
                  <p class="text-xs text-slate-500">Coba atur ulang filter pencarian atau kata kunci diagnosa</p>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.no_rawat" class="hover-row">
                <td class="ps-3">
                  <div class="fw-bold font-mono text-slate-900 text-xs">{{ item.no_rawat }}</div>
                  <div class="text-2xs text-slate-500 font-mono">{{ item.no_rkm_medis }}</div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="patient-avatar-circle-sm">
                      <i class="fas fa-user-shield"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-slate-900 text-xs">{{ item.nm_pasien }}</div>
                      <div class="text-2xs text-slate-500">
                        <span class="me-2"><i class="fas fa-id-card text-blue-500 me-1"></i> NIK: {{ item.no_ktp }}</span>
                      </div>
                      <div class="text-2xs text-slate-400">
                        <i class="fas fa-map-marker-alt text-rose-500 me-1"></i> {{ item.alamat }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="item.jk === 'L' ? 'badge badge-jk male' : 'badge badge-jk female'">
                    {{ item.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}
                  </span>
                  <div class="text-2xs text-slate-600 font-semibold mt-0.5">{{ item.umur }}</div>
                </td>
                <td>
                  <div class="fw-bold text-slate-900 text-xs">{{ item.nm_poli }}</div>
                  <div class="text-2xs text-slate-500">{{ item.penjamin }}</div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-1.5">
                    <span class="badge badge-icd10 font-mono">{{ item.icd10_utama || 'N/A' }}</span>
                    <span class="fw-semibold text-slate-800 text-xs text-truncate max-w-diagnosa">{{ item.nama_diagnosa || 'Diagnosa belum terisi' }}</span>
                  </div>
                </td>
                <td class="pe-3 text-end">
                  <div class="fw-semibold text-xs text-slate-900">{{ formatDate(item.tgl_registrasi) }}</div>
                  <div class="text-2xs text-slate-400 font-mono">{{ item.jam_reg }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modern Pagination Footer (Anchored below table) -->
      <div class="card-footer bg-white p-2.5 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div class="d-flex align-items-center gap-2">
          <span class="text-xs text-slate-500 font-medium">Per halaman:</span>
          <select v-model="filters.limit" @change="onLimitChange" class="form-select form-select-sm limit-select-compact">
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="text-xs text-slate-500 ms-1">
            <b>{{ ((pagination.current_page - 1) * filters.limit) + 1 }}</b> - <b>{{ Math.min(pagination.current_page * filters.limit, pagination.total) }}</b> dari <b>{{ pagination.total.toLocaleString() }}</b> data
          </span>
        </div>

        <nav v-if="pagination.last_page > 1">
          <ul class="pagination pagination-compact mb-0">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="changePage(1)" title="Halaman Pertama">
                <i class="fas fa-angle-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <button class="page-link" @click="changePage(pagination.current_page - 1)" title="Sebelumnya">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>

            <li 
              v-for="p in visiblePages" 
              :key="p" 
              class="page-item" 
              :class="{ active: p === pagination.current_page, disabled: p === '...' }"
            >
              <button v-if="p !== '...'" class="page-link" @click="changePage(p)">{{ p }}</button>
              <span v-else class="page-link">...</span>
            </li>

            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
              <button class="page-link" @click="changePage(pagination.current_page + 1)" title="Berikutnya">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
              <button class="page-link" @click="changePage(pagination.last_page)" title="Halaman Terakhir">
                <i class="fas fa-angle-double-right"></i>
              </button>
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
      isExporting: false,
      username: localStorage.getItem('peneliti_username') || '',
      accessId: localStorage.getItem('peneliti_access_id') || '',
      permohonan: JSON.parse(localStorage.getItem('peneliti_permohonan') || '{}'),
      filters: { search: '', kd_penyakit: '', page: 1, limit: 15 },
      pagination: { current_page: 1, last_page: 1, total: 0 }
    }
  },
  computed: {
    visiblePages() {
      const current = this.pagination.current_page
      const last = this.pagination.last_page
      const delta = 2
      const range = []

      for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        range.unshift('...')
      }
      if (current + delta < last - 1) {
        range.push('...')
      }

      range.unshift(1)
      if (last > 1) {
        range.push(last)
      }

      return range
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
      if (p < 1 || p > this.pagination.last_page || p === '...') return
      this.filters.page = p
      this.fetchData()
    },

    onLimitChange() {
      this.filters.page = 1
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

    async exportCsv() {
      if (this.pagination.total === 0) return

      this.isExporting = true
      try {
        const headers = {
          'X-Peneliti-Username': this.username,
          'X-Peneliti-Access-Id': this.accessId
        }

        const exportParams = { ...this.filters, export: 1 }
        const res = await penelitianService.getRmeMasked(exportParams, headers)

        if (res.data.success) {
          const exportData = res.data.data

          let csv = 'No Rawat,No RM,NIK,Nama Pasien,JK,Umur,Alamat,Poliklinik,Penjamin,ICD10 Utama,Nama Diagnosa,Tgl Registrasi\n'
          exportData.forEach(i => {
            csv += `"${i.no_rawat}","${i.no_rkm_medis}","${i.no_ktp}","${i.nm_pasien}","${i.jk}","${i.umur}","${i.alamat}","${i.nm_poli}","${i.penjamin}","${i.icd10_utama || ''}","${i.nama_diagnosa || ''}","${i.tgl_registrasi}"\n`
          })

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', `data_rme_masked_${dayjs().format('YYYYMMDD_HHmm')}.csv`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          Swal.fire({
            icon: 'success',
            title: 'Export Berhasil',
            text: `Sebanyak ${exportData.length} record data RME ter-masking telah diunduh.`,
            timer: 2000,
            showConfirmButton: false
          })
        }
      } catch (err) {
        console.error('Export CSV error:', err)
        Swal.fire('Error', 'Gagal mengekspor data CSV', 'error')
      } finally {
        this.isExporting = false
      }
    }
  }
}
</script>

<style scoped>
.peneliti-rme-page {
  background-color: #0f172a;
  min-height: 100vh;
}

.text-2xs {
  font-size: 0.7rem;
}

.navbar-researcher {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
}

.navbar-bg-glow {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.2), transparent 70%);
}

.brand-logo-glass {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img { max-height: 100%; object-fit: contain; }

.badge-security-glow {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 0.725rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 50px;
}

.btn-logout-glass {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.775rem;
  transition: all 0.2s ease;
}

.btn-logout-glass:hover {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border-color: #ef4444;
}

/* Stat Cards Compact */
.stat-card-modern {
  background: white;
  border-radius: 14px !important;
  transition: transform 0.2s ease;
}

.stat-icon-modern {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.stat-icon-modern.primary { background: #eff6ff; color: #3b82f6; }
.stat-icon-modern.info { background: #ecfeff; color: #0891b2; }
.stat-icon-modern.success { background: #ecfdf5; color: #10b981; }

.stat-label-modern {
  font-size: 0.675rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.stat-value-modern {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

/* Toolbar Compact */
.toolbar-card-modern {
  background: white;
  border-radius: 14px !important;
}

.search-input-wrapper, .icd-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper { min-width: 240px; }
.icd-input-wrapper { width: 190px; }

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: #94a3b8;
  font-size: 0.825rem;
}

.search-input-modern {
  padding-left: 2.35rem;
  padding-right: 1.75rem;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.825rem;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.search-input-modern:focus {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-clear-search {
  position: absolute;
  right: 0.65rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.75rem;
}

.btn-refresh-modern {
  height: 38px;
  padding: 0 1rem;
  border-radius: 10px;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-weight: 700;
  font-size: 0.825rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-refresh-modern:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e293b;
  border-color: #94a3b8;
}

.btn-export-excel-modern {
  height: 38px;
  padding: 0 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  font-weight: 700;
  font-size: 0.825rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-export-excel-modern:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

/* Scrollable Table Container & Sticky Header */
.table-card-modern {
  border-radius: 16px !important;
  background: white;
}

.table-responsive-scrollable {
  max-height: calc(100vh - 275px);
  min-height: 380px;
  overflow-y: auto;
  position: relative;
}

.custom-table-compact thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #f8fafc;
  padding: 0.65rem 0.65rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.custom-table-compact tbody td {
  padding: 0.55rem 0.65rem;
}

.hover-row { transition: background 0.15s ease; }
.hover-row:hover { background-color: #f8fafc; }

.patient-avatar-circle-sm {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.825rem;
  flex-shrink: 0;
}

.badge-jk {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 6px;
}
.badge-jk.male { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.badge-jk.female { background: #fdf2f8; color: #db2777; border: 1px solid #fbcfe8; }

.badge-icd10 {
  background: #ecfeff;
  color: #0891b2;
  border: 1px solid #a5f3fc;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 6px;
}

.max-w-diagnosa {
  max-width: 260px;
}

.empty-icon-box {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  color: #94a3b8;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
}

/* Limit Select & Pagination Compact */
.limit-select-compact {
  width: 65px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-weight: 600;
  font-size: 0.775rem;
  background-color: #f8fafc;
  padding-top: 2px;
  padding-bottom: 2px;
}

.pagination-compact {
  display: flex;
  gap: 3px;
}

.pagination-compact .page-item .page-link {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  border-radius: 8px;
  padding: 4px 9px;
  font-size: 0.775rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.pagination-compact .page-item:not(.active):not(.disabled) .page-link:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.pagination-compact .page-item.active .page-link {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.pagination-compact .page-item.disabled .page-link {
  opacity: 0.4;
  background: #f1f5f9;
  color: #94a3b8;
}

.shimmer-line {
  height: 16px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
