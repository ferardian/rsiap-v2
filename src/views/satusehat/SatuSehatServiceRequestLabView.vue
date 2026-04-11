<template>
  <div class="satusehat-service-request-lab">
    <div class="page-header mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="header-text">
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="header-icon-box">
              <i class="fas fa-flask-vial"></i>
            </div>
            <h2 class="page-title mb-0">ServiceRequest Lab <span class="text-primary-emphasis">SatuSehat</span></h2>
          </div>
          <p class="page-subtitle text-muted mb-0">Sinkronisasi permintaan pemeriksaan laboratorium ke platform SatuSehat FHIR</p>
        </div>
        <div class="header-actions d-flex gap-2">
          <button class="btn btn-refresh-premium shadow-sm" @click="fetchData" :disabled="loading">
            <i :class="['fas fa-sync-alt', { 'fa-spin': loading }]"></i>
            <span>Refresh</span>
          </button>
          <button class="btn btn-primary rounded-3 shadow-sm px-3 d-flex align-items-center gap-2" @click="syncAll" :disabled="loading || syncing">
            <i class="fas" :class="syncing ? 'fa-circle-notch fa-spin' : 'fa-cloud-upload-alt'"></i>
            <span>{{ syncing ? 'Syncing...' : 'Sync All Pending' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats summary -->
    <div class="row g-3 mb-4 flex-nowrap overflow-x-auto pb-2 stats-scroller">
      <div class="col-md-3 min-w-stats">
        <div class="card stat-card shadow-sm border-0 h-100 overflow-hidden">
          <div class="stat-card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon-wrapper primary">
              <i class="fas fa-file-medical"></i>
            </div>
            <div>
              <p class="stat-label mb-0">Total Permintaan</p>
              <h3 class="stat-value mb-0">{{ totalItems }}</h3>
            </div>
          </div>
          <div class="stat-wave primary"></div>
        </div>
      </div>
      <div class="col-md-3 min-w-stats">
        <div class="card stat-card shadow-sm border-0 h-100 overflow-hidden">
          <div class="stat-card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon-wrapper success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div>
              <p class="stat-label mb-0">Data Terkirim</p>
              <h3 class="stat-value mb-0">{{ items.filter(i => i.id_servicerequest).length }}</h3>
            </div>
          </div>
          <div class="stat-wave success"></div>
        </div>
      </div>
      <div class="col-md-3 min-w-stats">
        <div class="card stat-card shadow-sm border-0 h-100 overflow-hidden">
          <div class="stat-card-body p-3 d-flex align-items-center gap-3">
            <div class="stat-icon-wrapper warning">
              <i class="fas fa-clock"></i>
            </div>
            <div>
              <p class="stat-label mb-0">Belum Terkirim</p>
              <h3 class="stat-value mb-0">{{ items.filter(i => !i.id_servicerequest).length }}</h3>
            </div>
          </div>
          <div class="stat-wave warning"></div>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="toolbar-card card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-3 p-md-4">
        <div class="row g-3">
          <div class="col-lg-5 order-2 order-lg-1">
            <div class="search-box-premium">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                class="form-control" 
                v-model="filters.search" 
                placeholder="Cari No. Order, Nama Pasien, atau No. Rawat..."
                @keyup.enter="fetchData"
              >
              <button class="btn btn-search-go" @click="fetchData">
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
          <div class="col-lg-7 order-1 order-lg-2">
            <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
              <div class="filter-group shadow-sm">
                <span class="filter-label"><i class="fas fa-calendar-alt me-1"></i> Periode</span>
                <input type="date" class="form-control" v-model="filters.tgl_awal" @change="fetchData">
                <span class="filter-separator">-</span>
                <input type="date" class="form-control" v-model="filters.tgl_akhir" @change="fetchData">
              </div>
              <div class="filter-group shadow-sm min-w-status-select">
                <span class="filter-label"><i class="fas fa-filter me-1"></i> Status</span>
                <select class="form-select border-0" v-model="filters.status" @change="fetchData">
                  <option value="">Semua</option>
                  <option value="sent">Sudah Kirim</option>
                  <option value="unsent">Belum Kirim</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card table-card border-0 shadow-sm rounded-4 overflow-hidden animate-slide-up">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table-premium">
            <thead>
              <tr>
                <th class="ps-4">Order Details</th>
                <th>Patient Information</th>
                <th>Prescriber</th>
                <th>Examination</th>
                <th>Sync Status</th>
                <th class="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" v-for="n in 5" :key="n">
                <td colspan="6" class="p-4">
                  <div class="loading-shimmer-premium"></div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="py-5 text-center no-data-state">
                  <div class="empty-state-icon">
                    <i class="fas fa-folder-open"></i>
                  </div>
                  <p class="mt-3 fw-medium text-secondary">No laboratory requests found</p>
                  <button class="btn btn-sm btn-outline-primary rounded-pill px-4 mt-2" @click="fetchData">Try Refreshing</button>
                </td>
              </tr>
              <tr v-for="item in items" :key="item.noorder + item.id_template" class="hover-row">
                <td class="ps-4">
                  <div class="order-id">{{ item.noorder }}</div>
                  <div class="order-date"><i class="far fa-calendar-alt me-1"></i> {{ item.tgl_permintaan }}</div>
                  <div class="reg-number">#{{ item.no_rawat }}</div>
                </td>
                <td>
                  <div class="patient-name">{{ item.nm_pasien }}</div>
                  <div class="patient-id">MR: {{ item.no_rkm_medis }}</div>
                  <div class="id-pill" :class="item.no_ktp ? 'success' : 'danger'">
                    <i class="fas" :class="item.no_ktp ? 'fa-id-card' : 'fa-exclamation-triangle'"></i>
                    {{ item.no_ktp || 'NIK Needs Action' }}
                  </div>
                </td>
                <td>
                  <div class="doctor-name">{{ item.nm_dokter }}</div>
                  <div class="id-pill" :class="item.ktp_dokter ? 'success' : 'danger'">
                    <i class="fas" :class="item.ktp_dokter ? 'fa-id-card' : 'fa-exclamation-triangle'"></i>
                    {{ item.ktp_dokter || 'NIK Missing' }}
                  </div>
                </td>
                <td>
                  <div class="exam-name">{{ item.Pemeriksaan }}</div>
                  <div class="exam-meta">
                    <span class="exam-code">LOINC: {{ item.code }}</span>
                    <span class="exam-display">{{ item.display }}</span>
                  </div>
                </td>
                <td>
                  <transition name="scale" mode="out-in">
                    <div v-if="item.id_servicerequest" class="sync-status success" :key="'sent-' + item.noorder">
                      <div class="sync-icon"><i class="fas fa-check"></i></div>
                      <div class="sync-text">
                        <span class="status-label">Synced</span>
                        <span class="status-id">{{ item.id_servicerequest }}</span>
                      </div>
                    </div>
                    <div v-else class="sync-status warning" :key="'unsent-' + item.noorder">
                      <div class="sync-icon"><i class="fas fa-hourglass-start"></i></div>
                      <div class="sync-text">
                        <span class="status-label">Pending</span>
                      </div>
                    </div>
                  </transition>
                </td>
                <td class="pe-4 text-end">
                  <div class="action-buttons">
                    <button 
                      class="btn btn-action shadow-sm"
                      :class="item.id_servicerequest ? 'btn-update' : 'btn-send'"
                      @click="sendToSatuSehat(item)"
                      :disabled="sendingItems.includes(item.noorder + item.id_template) || !item.no_ktp || !item.ktp_dokter"
                    >
                      <template v-if="sendingItems.includes(item.noorder + item.id_template)">
                        <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                        Working...
                      </template>
                      <template v-else>
                        <i :class="item.id_servicerequest ? 'fas fa-sync' : 'fas fa-paper-plane'"></i>
                        {{ item.id_servicerequest ? 'Refetch' : 'Send Task' }}
                      </template>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-footer bg-white p-4 border-top-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="pagination-info">
          Showing <span class="fw-bold">{{ items.length }}</span> of <span class="fw-bold">{{ totalItems }}</span> entries
        </div>
        <nav v-if="totalPages > 1">
          <ul class="pagination pagination-premium mb-0">
            <li class="page-item" :class="{ disabled: filters.page === 1 }">
              <button class="page-link shadow-none" @click="changePage(filters.page - 1)"><i class="fas fa-chevron-left"></i></button>
            </li>
            <li 
              class="page-item" 
              v-for="p in totalPages" 
              :key="p" 
              :class="{ active: filters.page === p }"
              v-show="p <= 3 || (p > totalPages - 2) || (p >= filters.page - 1 && p <= filters.page + 1)"
            >
              <button class="page-link shadow-none" @click="changePage(p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: filters.page === totalPages }">
              <button class="page-link shadow-none" @click="changePage(filters.page + 1)"><i class="fas fa-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import satuSehatService from '@/services/satuSehatService'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

export default {
  name: 'SatuSehatServiceRequestLabView',
  data() {
    return {
      items: [],
      loading: false,
      syncing: false,
      totalItems: 0,
      totalPages: 1,
      sendingItems: [],
      filters: {
        tgl_awal: dayjs().format('YYYY-MM-DD'),
        tgl_akhir: dayjs().format('YYYY-MM-DD'),
        search: '',
        status: '',
        page: 1,
        limit: 15
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await satuSehatService.getServiceRequestLab(this.filters)
        if (res.data.success) {
          const payload = res.data.data
          this.items = payload.data
          this.totalItems = payload.total
          this.totalPages = payload.last_page
        }
      } catch (err) {
        console.error('Fetch error:', err)
        Swal.fire({ 
          icon: 'error', 
          title: 'Database Connection Error', 
          text: err.response?.data?.error || 'Gagal mengambil data dari server SIMRS.' 
        })
      } finally {
        this.loading = false
      }
    },

    changePage(p) {
      if (p < 1 || p > this.totalPages) return
      this.filters.page = p
      this.fetchData()
    },

    async syncAll() {
      const result = await Swal.fire({
        title: 'Sync All Pending?',
        text: `Sistem akan mengirimkan seluruh permintaan Lab yang belum terkirim pada periode ${this.filters.tgl_awal} s/d ${this.filters.tgl_akhir} ke SatuSehat.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Sinkronkan Semua',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#3b82f6'
      })

      if (!result.isConfirmed) return

      this.syncing = true
      try {
        const res = await satuSehatService.syncServiceRequestLab({
          tgl_awal: this.filters.tgl_awal,
          tgl_akhir: this.filters.tgl_akhir
        })

        if (res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Sinkronisasi Selesai',
            text: res.data.message
          })
          this.fetchData()
        }
      } catch (err) {
        console.error('Batch sync error:', err)
        Swal.fire({
          icon: 'error',
          title: 'Sinkronisasi Gagal',
          text: err.response?.data?.message || 'Terjadi kesalahan saat sinkronisasi batch'
        })
      } finally {
        this.syncing = false
      }
    },

    async sendToSatuSehat(item) {
      const key = item.noorder + item.id_template
      this.sendingItems.push(key)
      
      try {
        const res = await satuSehatService.sendServiceRequestLab(item)
        if (res.data.success) {
          Swal.fire({ 
            icon: 'success', 
            title: 'Synchronization Success', 
            text: res.data.message, 
            timer: 1500, 
            showConfirmButton: false 
          })
          this.fetchData()
        }
      } catch (err) {
        console.error('Send error:', err)
        Swal.fire({ 
          icon: 'error', 
          title: 'FHIR Integration Failed', 
          text: err.response?.data?.message || 'Gagal mengirim data ke SatuSehat' 
        })
      } finally {
        this.sendingItems = this.sendingItems.filter(i => i !== key)
      }
    }
  }
}
</script>

<style scoped>
/* Page Layout & Animations */
.satusehat-service-request-lab {
  padding-bottom: 2rem;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Header & Actions */
.header-icon-box {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #1e293b;
}

.btn-refresh-premium {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-refresh-premium:hover:not(:disabled) {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* Stat Cards */
.stats-scroller {
  scrollbar-width: none;
}
.stats-scroller::-webkit-scrollbar { display: none; }

.min-w-stats { min-width: 240px; }

.stat-card {
  position: relative;
  transition: transform 0.3s ease;
  background: white;
  z-index: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon-wrapper.primary { background: #eff6ff; color: #3b82f6; }
.stat-icon-wrapper.success { background: #ecfdf5; color: #10b981; }
.stat-icon-wrapper.warning { background: #fffbeb; color: #f59e0b; }

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.stat-value {
  font-weight: 800;
  color: #0f172a;
}

.stat-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-wave.primary { background: #3b82f6; }
.stat-wave.success { background: #10b981; }
.stat-wave.warning { background: #f59e0b; }

/* Filter Toolbar */
.toolbar-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0 !important;
}

.search-box-premium {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  color: #94a3b8;
}

.search-box-premium .form-control {
  padding-left: 3.25rem;
  padding-right: 3.5rem;
  height: 52px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  font-size: 0.95rem;
}

.search-box-premium .form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.btn-search-go {
  position: absolute;
  right: 6px;
  height: 40px;
  width: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.2s ease;
}

.btn-search-go:hover { background: #2563eb; transform: scale(1.05); }

.filter-group {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 4px 12px;
  height: 52px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  margin-right: 8px;
  white-space: nowrap;
}

.filter-group .form-control, 
.filter-group .form-select {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0 8px;
  width: auto;
}

.filter-separator { color: #cbd5e1; margin: 0 4px; }
.min-w-status-select { min-width: 180px; }

/* Premium Table */
.table-card {
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025) !important;
}

.custom-table-premium thead th {
  background: #f8fafc;
  padding: 1.25rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
}

.hover-row { transition: background 0.2s ease; }
.hover-row:hover { background-color: #f8fafc; }

.order-id { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.order-date { font-size: 0.7rem; color: #64748b; margin: 2px 0; }
.reg-number { font-size: 0.7rem; font-weight: 600; color: #3b82f6; }

.patient-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.patient-id { font-size: 0.75rem; color: #64748b; }
.doctor-name { font-weight: 600; color: #334155; font-size: 0.85rem; }

.id-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
}
.id-pill.success { background: #ecfdf5; color: #10b981; }
.id-pill.danger { background: #fef2f2; color: #ef4444; }

.exam-name { font-weight: 700; color: #4338ca; font-size: 0.85rem; }
.exam-meta { display: flex; flex-direction: column; gap: 2px; }
.exam-code { font-family: 'Mono', monospace; font-size: 10px; color: #64748b; }
.exam-display { font-size: 10px; color: #94a3b8; font-style: italic; }

/* Sync Status Box */
.sync-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 12px;
  width: fit-content;
}

.sync-status.success { background: #ecfdf5; border: 1px solid #d1fae5; }
.sync-status.warning { background: #fffbeb; border: 1px solid #fef3c7; }

.sync-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}
.sync-status.success .sync-icon { background: #10b981; color: white; }
.sync-status.warning .sync-icon { background: #f59e0b; color: white; }

.sync-text { display: flex; flex-direction: column; }
.status-label { font-size: 0.75rem; font-weight: 700; }
.status-id { font-size: 9px; opacity: 0.7; font-family: monospace; }
.sync-status.success .status-label { color: #065f46; }
.sync-status.warning .status-label { color: #92400e; }

/* Action Buttons */
.btn-action {
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-send { background: #3b82f6; color: white; border: none; }
.btn-send:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }

.btn-update { background: white; color: #3b82f6; border: 1px solid #3b82f6; }
.btn-update:hover:not(:disabled) { background: #3b82f6; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }

/* Shimmer Effect */
.loading-shimmer-premium {
  height: 60px;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 12px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Pagination Premium */
.pagination-premium .page-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  border-radius: 10px !important;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
}

.pagination-premium .page-item.active .page-link {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.pagination-info { font-size: 0.8rem; color: #64748b; }

/* Animation Overrides */
.scale-enter-active, .scale-leave-active { transition: all 0.3s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.9); }

/* Empty state */
.empty-state-icon {
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  color: #cbd5e1;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto;
}
</style>
