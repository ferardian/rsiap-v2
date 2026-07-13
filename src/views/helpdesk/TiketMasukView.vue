<template>
  <div class="helpdesk-container animate__animated animate__fadeIn">
    <!-- Page Header Section -->
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title">🎧 Smart Helpdesk System</h1>
        <p class="page-subtitle">Manajemen bantuan IT dan fasilitas terintegrasi rumah sakit</p>
      </div>
      <div class="header-actions d-flex flex-wrap align-items-center gap-3">
        <router-link to="/helpdesk/dashboard" class="btn btn-outline-premium">
          <i class="fas fa-chart-line me-2"></i> Dashboard Analisis
        </router-link>
        <!-- Tab Switcher -->
        <div class="premium-tabs-container">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon" class="me-2"></i>
            {{ tab.label }}
            <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Tab Content -->
    <div class="content-wrapper">
      <!-- 1. TAB: LAPORAN MASUK (MESSA LOGS) -->
      <div v-if="activeTab === 'logs'" class="animate__animated animate__fadeIn">
        <div class="card border-0 shadow-sm glass-card mb-4 mt-3">
          <div class="card-body p-4">
            <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
               <h5 class="m-0 fw-bold text-dark">
                 <i class="fas fa-mobile-alt text-primary me-2"></i>Laporan Masuk MESSA (Employee App)
               </h5>
               <div class="search-filter-box d-flex gap-2">
                 <input 
                   v-model="logFilters.keyword" 
                   type="text" 
                   class="form-control premium-input" 
                   placeholder="Cari laporan..." 
                   @input="handleLogSearch"
                 >
                 <select v-model="logFilters.status" class="form-select premium-select" @change="fetchLogs">
                   <option value="WAITING">Waiting (Antrean)</option>
                   <option value="PROCESSED">Processed (Tiket)</option>
                   <option value="EXPIRED">Expired</option>
                 </select>
               </div>
            </div>

            <div class="table-responsive premium-table">
              <table class="table align-middle table-hover">
                <thead>
                  <tr class="table-light-header">
                    <th style="width: 120px;">Waktu Lapor</th>
                    <th style="width: 250px;">Pelapor & Dep</th>
                    <th>Isi Laporan Masalah</th>
                    <th class="text-center" style="width: 180px;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="logLoading">
                    <td colspan="4" class="text-center py-5">
                      <div class="spinner-border text-primary spinner-sm mb-2"></div>
                      <div class="text-muted small">Memuat antrean laporan MESSA...</div>
                    </td>
                  </tr>
                  <tr v-else-if="logs.length === 0">
                    <td colspan="4" class="text-center py-5 text-muted">
                      <i class="fas fa-inbox fa-2x mb-2 text-light"></i>
                      <div>Tidak ada laporan masuk dari aplikasi MESSA.</div>
                    </td>
                  </tr>
                  <tr v-for="log in logs" :key="log.id" class="log-row">
                    <td>
                      <div class="fw-bold text-dark">{{ formatDate(log.created_at) }}</div>
                      <small class="text-secondary">{{ formatTime(log.created_at) }}</small>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="user-avatar-initials">
                          {{ getInitials(log.pegawai?.nama) }}
                        </div>
                        <div>
                          <div class="fw-bold text-indigo" style="font-size: 0.85rem;">{{ log.pegawai?.nama || 'Non-Pegawai' }}</div>
                          <span class="badge bg-soft-info text-info mt-1" style="font-size: 0.7rem;">{{ log.departemen?.nama || '-' }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="report-cell">
                      <div class="report-text" :title="log.isi_laporan">{{ log.isi_laporan }}</div>
                    </td>
                    <td class="text-center">
                      <button v-if="log.status === 'WAITING'" class="btn btn-premium-sm w-100" @click="openTicketModal(log)">
                        <i class="fas fa-ticket-alt me-1"></i> Terbitkan Tiket
                      </button>
                      <span v-else class="status-indicator-badge" :class="log.status.toLowerCase()">
                        <i class="fas" :class="log.status === 'PROCESSED' ? 'fa-check-circle' : 'fa-times-circle'"></i>
                        {{ log.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Pagination untuk Laporan MESSA -->
            <div v-if="logPagination.total > 0" class="pagination-container mt-3">
              <div class="pagination-info">
                Menampilkan {{ ((logPagination.current_page - 1) * logPagination.per_page) + 1 }} - 
                {{ Math.min(logPagination.current_page * logPagination.per_page, logPagination.total) }} 
                dari {{ logPagination.total }} data
              </div>
              <div class="pagination-controls">
                <button 
                  class="btn-page" 
                  :disabled="logPagination.current_page === 1"
                  @click="changeLogPage(logPagination.current_page - 1)"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="page-numbers">
                  <button 
                    v-for="page in displayedLogPages" 
                    :key="page"
                    class="btn-page-number"
                    :class="{ active: page === logPagination.current_page }"
                    @click="changeLogPage(page)"
                  >
                    {{ page }}
                  </button>
                </div>

                <button 
                  class="btn-page" 
                  :disabled="logPagination.current_page === logPagination.last_page"
                  @click="changeLogPage(logPagination.current_page + 1)"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TAB: MANAJEMEN TIKET (ACTIVE TICKETS) -->
      <div v-if="activeTab === 'tickets'" class="animate__animated animate__fadeIn">
        <div class="card border-0 shadow-sm glass-card mb-4 mt-3">
          <div class="card-body p-4">
             <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
                <h5 class="m-0 fw-bold text-dark">
                  <i class="fas fa-list-check text-primary me-2"></i>Daftar Tiket Aktif
                </h5>
                <div class="search-filter-box d-flex gap-2">
                  <input 
                    v-model="ticketFilters.keyword" 
                    type="text" 
                    class="form-control premium-input" 
                    placeholder="Cari tiket..." 
                    @input="handleTicketSearch"
                  >
                  <select v-model="ticketFilters.status" class="form-select premium-select" @change="fetchActiveTickets">
                    <option value="all">Semua Status</option>
                    <option value="Open">Open (Baru)</option>
                    <option value="Proses">Proses (Dikerjakan)</option>
                    <option value="Selesai">Selesai (Solved)</option>
                    <option value="Batal">Batal (Closed/Cancelled)</option>
                  </select>
                </div>
             </div>
             
             <div class="table-responsive premium-table">
                <table class="table align-middle table-hover">
                  <thead>
                    <tr class="table-light-header">
                      <th style="width: 140px;">No. Tiket</th>
                      <th style="width: 120px;">Tanggal</th>
                      <th>Pelapor</th>
                      <th>Detail Keluhan</th>
                      <th style="width: 110px;">Prioritas</th>
                      <th style="width: 130px;">Status</th>
                      <th class="text-center" style="width: 100px;">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="ticketLoading">
                      <td colspan="7" class="text-center py-5">
                        <div class="spinner-border text-primary spinner-sm mb-2"></div>
                        <div class="text-muted small">Memuat daftar tiket aktif...</div>
                      </td>
                    </tr>
                    <tr v-else-if="activeTickets.length === 0">
                      <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fas fa-folder-open fa-2x mb-2 text-light"></i>
                        <div>Belum ada tiket aktif yang terdaftar.</div>
                      </td>
                    </tr>
                    <tr v-for="ticket in activeTickets" :key="ticket.id">
                      <td><span class="badge-tiket">{{ ticket.no_tiket }}</span></td>
                      <td>
                        <div class="fw-bold text-dark">{{ formatDate(ticket.tanggal) }}</div>
                        <small class="text-muted">{{ formatTime(ticket.tanggal) }}</small>
                      </td>
                      <td>
                        <div class="fw-bold text-dark" style="font-size: 0.85rem;">{{ ticket.pelapor?.nama || 'Non-Pegawai' }}</div>
                        <small class="text-muted" style="font-size: 0.75rem;">{{ ticket.departemen?.nama || '-' }}</small>
                      </td>
                      <td class="report-cell">
                        <div class="report-text" :title="ticket.keluhan">{{ ticket.keluhan }}</div>
                      </td>
                      <td>
                        <span class="prio-badge" :class="ticket.prioritas.toLowerCase()">
                          {{ ticket.prioritas }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <span class="status-dot" :class="ticket.status.toLowerCase()"></span>
                          <span class="status-pill" :class="ticket.status.toLowerCase()">
                            <i v-if="ticket.status === 'Open'" class="fas fa-envelope-open-text me-1"></i>
                            <i v-if="ticket.status === 'Proses'" class="fas fa-spinner fa-spin me-1"></i>
                            <i v-if="ticket.status === 'Selesai'" class="fas fa-check-double me-1"></i>
                            <i v-if="ticket.status === 'Batal'" class="fas fa-times-circle me-1"></i>
                            {{ ticket.status }}
                          </span>
                        </div>
                      </td>
                      <td class="text-center">
                        <button class="btn btn-kelola-sm" @click="openManageModal(ticket)">
                          <i class="fas fa-edit me-1"></i> Kelola
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
             </div>
             
             <!-- Pagination untuk Manajemen Tiket -->
             <div v-if="ticketPagination.total > 0" class="pagination-container mt-3">
               <div class="pagination-info">
                 Menampilkan {{ ((ticketPagination.current_page - 1) * ticketPagination.per_page) + 1 }} - 
                 {{ Math.min(ticketPagination.current_page * ticketPagination.per_page, ticketPagination.total) }} 
                 dari {{ ticketPagination.total }} data
               </div>
               <div class="pagination-controls">
                 <button 
                   class="btn-page" 
                   :disabled="ticketPagination.current_page === 1"
                   @click="changeTicketPage(ticketPagination.current_page - 1)"
                 >
                   <i class="fas fa-chevron-left"></i>
                 </button>
                 
                 <div class="page-numbers">
                   <button 
                     v-for="page in displayedTicketPages" 
                     :key="page"
                     class="btn-page-number"
                     :class="{ active: page === ticketPagination.current_page }"
                     @click="changeTicketPage(page)"
                   >
                     {{ page }}
                   </button>
                 </div>

                 <button 
                   class="btn-page" 
                   :disabled="ticketPagination.current_page === ticketPagination.last_page"
                   @click="changeTicketPage(ticketPagination.current_page + 1)"
                 >
                   <i class="fas fa-chevron-right"></i>
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Terbitkan Tiket -->
    <div class="modal fade" id="createTicketModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content premium-modal glass-card shadow-lg">
          <div class="modal-header border-0 pb-0 p-4">
            <h5 class="modal-title fw-bold text-primary"><i class="fas fa-ticket-alt me-2"></i>Terbitkan Tiket Kerja</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 pt-3">
            <div class="selected-log-preview mb-4 bg-light p-3 rounded-3 border-start border-primary border-4">
               <div class="small-label fw-bold text-primary mb-1">Pelapor Laporan MESSA</div>
               <div class="fw-bold text-dark mb-3">{{ selectedLog?.pegawai?.nama }} ({{ selectedLog?.departemen?.nama || selectedLog?.kd_dep }})</div>
               <div class="small-label fw-bold text-secondary mb-1">Isi Laporan Kendala</div>
               <div class="log-text-box bg-white text-dark small" style="max-height: 120px; overflow-y: auto;">{{ selectedLog?.isi_laporan }}</div>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label fw-bold text-dark mb-2">Tentukan Tingkat Prioritas</label>
              <div class="prio-selector mb-4">
                <div 
                  v-for="p in priorities" 
                  :key="p.id" 
                  class="prio-item"
                  :class="{ active: ticketFormData.prioritas === p.id, [p.id.toLowerCase()]: true }"
                  @click="ticketFormData.prioritas = p.id"
                >
                  <i :class="p.icon" style="font-size: 1.1rem;"></i>
                  <span class="fw-bold" style="font-size: 0.8rem;">{{ p.label }}</span>
                </div>
              </div>

              <label class="form-label fw-bold text-dark mb-2">Tugaskan Teknisi (Opsional)</label>
              <v-select
                v-model="ticketFormData.nik_teknisi"
                :options="technicians"
                :reduce="t => t.nik"
                label="nama"
                placeholder="Pilih teknisi IT penanggung jawab..."
                class="premium-v-select"
              >
                <template #no-options="{ search, searching }">
                  <template v-if="searching">
                    Tidak ditemukan teknisi dengan nama "<em>{{ search }}</em>".
                  </template>
                  <em v-else>Ketik nama teknisi untuk mencari...</em>
                </template>
              </v-select>
              <small class="text-muted mt-2 d-block fst-italic" style="font-size: 0.75rem;">
                *Jika teknisi langsung dipilih, status tiket otomatis akan menjadi <strong>PROSES</strong> dan waktu respon tercatat.
              </small>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0 p-4">
            <button type="button" class="btn btn-light-premium px-4" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-premium-action px-4" @click="submitTicket" :disabled="submitting">
              <i class="fas fa-check-circle me-1" v-if="!submitting"></i>
              <span v-else class="spinner-border spinner-border-sm me-1"></span>
              Terbitkan Tiket Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Kelola Tiket -->
    <div class="modal fade" id="manageTicketModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content premium-modal glass-card shadow-lg">
          <div class="modal-header border-0 pb-0 p-4">
            <h5 class="modal-title fw-bold text-primary"><i class="fas fa-edit me-2"></i>Kelola Tiket Kerja</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4 pt-3">
            <div class="row g-4">
              <!-- Info Tiket -->
              <div class="col-md-5">
                <div class="ticket-info-summary bg-light p-3 rounded-3 h-100">
                  <div class="info-item mb-3">
                    <label class="small-label fw-bold text-primary">Nomor Tiket</label>
                    <div class="fw-bold text-dark font-monospace" style="font-size: 1rem;">{{ selectedTicket?.no_tiket }}</div>
                  </div>
                  <div class="info-item mb-3">
                    <label class="small-label fw-bold text-secondary">Nama Pelapor</label>
                    <div class="fw-bold text-dark" style="font-size: 0.9rem;">{{ selectedTicket?.pelapor?.nama }}</div>
                  </div>
                  <div class="info-item mb-2">
                    <label class="small-label fw-bold text-secondary">Isi Keluhan</label>
                    <div class="log-text-box bg-white small text-dark" style="max-height: 150px; overflow-y: auto; font-size: 0.8rem;">
                      {{ selectedTicket?.keluhan }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Form Update -->
              <div class="col-md-7 border-start ps-4">
                <div class="form-group mb-3">
                  <label class="form-label fw-bold text-dark">Status Pekerjaan</label>
                  <select v-model="manageTicketData.status" class="form-select premium-select">
                    <option value="Open">Open (Baru)</option>
                    <option value="Proses">Proses (Dikerjakan)</option>
                    <option value="Selesai">Selesai (Solved)</option>
                    <option value="Batal">Batal (Closed/Cancelled)</option>
                  </select>
                </div>

                <div v-if="manageTicketData.status === 'Selesai'" class="form-group mb-3 animate__animated animate__fadeIn">
                  <label class="form-label fw-bold text-dark">Waktu Penyelesaian</label>
                  <input 
                    type="datetime-local" 
                    v-model="manageTicketData.jam_selesai" 
                    class="form-control premium-input"
                  >
                  <small class="text-muted mt-1 d-block" style="font-size: 0.75rem;">Kosongkan untuk otomatis menggunakan waktu sistem saat ini</small>
                </div>

                <div class="form-group mb-3">
                  <label class="form-label fw-bold text-dark">Teknisi Penanggung Jawab</label>
                  <v-select
                    v-model="manageTicketData.nik_teknisi"
                    :options="technicians"
                    :reduce="t => t.nik"
                    label="nama"
                    placeholder="Tunjuk teknisi IT..."
                    class="premium-v-select"
                  >
                    <template #no-options="{ search, searching }">
                      <template v-if="searching">
                        Tidak ditemukan teknisi dengan nama "<em>{{ search }}</em>".
                      </template>
                      <em v-else>Ketik nama teknisi untuk mencari...</em>
                    </template>
                  </v-select>
                </div>

                <div class="form-group mb-2">
                  <label class="form-label fw-bold text-dark">Solusi / Langkah Perbaikan</label>
                  <textarea 
                    v-model="manageTicketData.solusi" 
                    class="form-control premium-input" 
                    rows="4" 
                    placeholder="Tuliskan solusi pemecahan masalah atau keterangan perbaikan secara lengkap..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0 p-4">
            <button type="button" class="btn btn-light-premium px-4" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-premium-action px-4" @click="submitTicketUpdate" :disabled="updating">
              <i class="fas fa-save me-1" v-if="!updating"></i>
              <span v-else class="spinner-border spinner-border-sm me-1"></span>
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import helpdeskService from '@/services/helpdeskService'
import { pegawaiService } from '@/services/pegawaiService'
import Swal from 'sweetalert2'

const toast = useToast()
const activeTab = ref('logs')
const logs = ref([])
const logLoading = ref(false)
const activeTickets = ref([])
const ticketLoading = ref(false)
const submitting = ref(false)
const updating = ref(false)
const technicians = ref([])
const selectedTicket = ref(null)

const tabs = [
  { id: 'logs', label: 'Laporan MESSA', icon: 'fas fa-mobile-alt' },
  { id: 'tickets', label: 'Manajemen Tiket', icon: 'fas fa-ticket-alt' }
]

const logFilters = reactive({
  keyword: '',
  status: 'WAITING',
  page: 1,
  limit: 10
})

const logPagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

const ticketFilters = reactive({
  keyword: '',
  status: 'all',
  page: 1,
  limit: 10
})

const ticketPagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

const selectedLog = ref(null)
const ticketFormData = reactive({
  prioritas: 'Medium',
  nik_teknisi: null
})

const manageTicketData = reactive({
  status: 'Open',
  nik_teknisi: '',
  solusi: '',
  jam_selesai: '',
})

const priorities = [
  { id: 'Low', label: 'Low', icon: 'fas fa-arrow-down-long' },
  { id: 'Medium', label: 'Medium', icon: 'fas fa-arrows-left-right' },
  { id: 'High', label: 'High', icon: 'fas fa-arrow-up-long' }
]

const getInitials = (name) => {
  if (!name) return '?'
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const fetchLogs = async () => {
  logLoading.value = true
  try {
    const response = await helpdeskService.getTempLogs(logFilters)
    logs.value = response.data.data.data
    const meta = response.data.data
    logPagination.value = {
      current_page: meta.current_page || 1,
      per_page: meta.per_page || 10,
      total: meta.total || 0,
      last_page: meta.last_page || 1
    }
  } catch (error) {
    toast.error('Gagal memuat laporan antrean MESSA')
  } finally {
    logLoading.value = false
  }
}

const changeLogPage = (page) => {
  if (page >= 1 && page <= logPagination.value.last_page) {
    logFilters.page = page
    fetchLogs()
  }
}

const displayedLogPages = computed(() => {
  const current = logPagination.value.current_page
  const last = logPagination.value.last_page
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const pages = []
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      pages.push(i)
    }
  }
  return pages
})

const fetchActiveTickets = async () => {
  ticketLoading.value = true
  try {
    const params = {
      page: ticketFilters.page,
      limit: ticketFilters.limit
    }
    if (ticketFilters.status !== 'all') {
      params.status = ticketFilters.status
    }
    if (ticketFilters.keyword.trim() !== '') {
      params.keyword = ticketFilters.keyword.trim()
    }

    const response = await helpdeskService.getActiveTickets(params)
    activeTickets.value = response.data.data.data
    const meta = response.data.data
    ticketPagination.value = {
      current_page: meta.current_page || 1,
      per_page: meta.per_page || 10,
      total: meta.total || 0,
      last_page: meta.last_page || 1
    }
  } catch (error) {
    toast.error('Gagal memuat tiket helpdesk aktif')
  } finally {
    ticketLoading.value = false
  }
}

const changeTicketPage = (page) => {
  if (page >= 1 && page <= ticketPagination.value.last_page) {
    ticketFilters.page = page
    fetchActiveTickets()
  }
}

const displayedTicketPages = computed(() => {
  const current = ticketPagination.value.current_page
  const last = ticketPagination.value.last_page
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const pages = []
  
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      pages.push(i)
    }
  }
  return pages
})

const fetchTechnicians = async () => {
  try {
    const response = await pegawaiService.getKaryawanList({ dep_id: 'IT' }) // Focus IT
    technicians.value = response.data.data
  } catch (error) {
    console.error('Gagal memuat teknisi IT', error)
  }
}

const handleLogSearch = () => {
  clearTimeout(handleLogSearch.timer)
  handleLogSearch.timer = setTimeout(() => {
    logFilters.page = 1
    fetchLogs()
  }, 500)
}

const handleTicketSearch = () => {
  clearTimeout(handleTicketSearch.timer)
  handleTicketSearch.timer = setTimeout(() => {
    ticketFilters.page = 1
    fetchActiveTickets()
  }, 500)
}

const openTicketModal = (log) => {
  selectedLog.value = log
  ticketFormData.prioritas = 'Medium'
  ticketFormData.nik_teknisi = null
  const modal = new bootstrap.Modal(document.getElementById('createTicketModal'))
  modal.show()
}

const submitTicket = async () => {
  submitting.value = true
  try {
    const payload = {
      temp_log_id: selectedLog.value.id,
      prioritas: ticketFormData.prioritas,
      nik_teknisi: ticketFormData.nik_teknisi
    }
    const response = await helpdeskService.createTicketFromLog(payload)
    if (response.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Tiket Berhasil Terbit',
        text: 'Laporan MESSA berhasil divalidasi dan diubah menjadi tiket kerja.',
        timer: 2000,
        showConfirmButton: false
      })
      bootstrap.Modal.getInstance(document.getElementById('createTicketModal')).hide()
      fetchLogs()
      fetchActiveTickets()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal menerbitkan tiket')
  } finally {
    submitting.value = false
  }
}

const openManageModal = (ticket) => {
  selectedTicket.value = ticket
  manageTicketData.status = ticket.status
  manageTicketData.nik_teknisi = ticket.nik_teknisi || ''
  manageTicketData.solusi = ticket.solusi || ''
  
  // Format jam_selesai for datetime-local input (YYYY-MM-DDTHH:mm)
  if (ticket.jam_selesai) {
    const d = new Date(ticket.jam_selesai)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    manageTicketData.jam_selesai = `${year}-${month}-${day}T${hours}:${minutes}`
  } else {
    manageTicketData.jam_selesai = ''
  }
  
  const modal = new bootstrap.Modal(document.getElementById('manageTicketModal'))
  modal.show()
}

const submitTicketUpdate = async () => {
  updating.value = true
  try {
    const response = await helpdeskService.updateTicket(selectedTicket.value.id, manageTicketData)
    if (response.data.success) {
      toast.success('Tiket berhasil diperbarui')
      bootstrap.Modal.getInstance(document.getElementById('manageTicketModal')).hide()
      fetchActiveTickets()
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal memperbarui tiket')
  } finally {
    updating.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchLogs()
  fetchActiveTickets()
  fetchTechnicians()
})
</script>

<style scoped>
.helpdesk-container {
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

.header-actions {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 0.75rem !important;
}

.btn-outline-premium {
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 12px;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0 !important;
  width: auto !important;
  white-space: nowrap !important;
}

.btn-outline-premium:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100% !important;
  }
  .btn-outline-premium {
    width: 100% !important;
    justify-content: center !important;
  }
  .premium-tabs-container {
    width: 100% !important;
    justify-content: center !important;
  }
  .premium-tabs-container .tab-item {
    flex-grow: 1 !important;
    justify-content: center !important;
  }
}

.page-title {
  font-weight: 800;
  font-size: 1.85rem;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* Premium Tabs */
.premium-tabs-container {
  display: flex;
  background: #f1f5f9;
  padding: 0.4rem;
  border-radius: 12px;
}

.tab-item {
  border: none;
  background: transparent;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #64748b;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
}

.tab-item.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tab-badge {
  margin-left: 0.5rem;
  background: #fee2e2;
  color: #ef4444;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
}

/* Glass Card */
.glass-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  overflow: hidden;
}

.premium-input, .premium-select {
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
}

.premium-input:focus, .premium-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Table Style */
.table-light-header th {
  background: #f8fafc !important;
  border: none;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 1.25rem 1rem;
  border-bottom: 2px solid #e2e8f0 !important;
}

.premium-table tbody td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.log-row {
  transition: background-color 0.2s;
}

.log-row:hover {
  background: #fdfaf7;
}

.text-indigo { color: #2563eb; }

.report-cell {
  max-width: 450px;
}

.report-text {
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.6;
  white-space: normal;
  word-wrap: break-word;
}

/* Avatar Badge */
.user-avatar-initials {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0369a1;
  font-weight: 800;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #bae6fd;
}

.btn-premium-sm {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.8rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15);
}

.btn-premium-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25);
}

.btn-kelola-sm {
  background: white;
  color: #2563eb;
  border: 1.5px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-kelola-sm:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
}

.status-indicator-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.35rem 0.8rem;
  border-radius: 8px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.status-indicator-badge.processed { background: #ecfdf5; color: #047857; border: 1px solid #d1fae5; }
.status-indicator-badge.expired { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

/* Modal Premium */
.premium-modal {
  border-radius: 20px;
  border: none;
  overflow: hidden;
}

.small-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 750;
  margin-bottom: 0.25rem;
}

.log-text-box {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.5;
}

.log-text-box.small {
  padding: 0.75rem;
  font-size: 0.8rem;
}

.prio-selector {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.prio-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.prio-item.low:hover, .prio-item.low.active { border-color: #10b981; background: #ecfdf5; color: #047857; }
.prio-item.medium:hover, .prio-item.medium.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
.prio-item.high:hover, .prio-item.high.active { border-color: #ef4444; background: #fef2f2; color: #b91c1c; }

.btn-premium-action {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

.btn-premium-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.35);
}

.btn-light-premium {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.7rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
}

.btn-light-premium:hover {
  background: #e2e8f0;
}

/* Active Ticket Extras */
.badge-tiket {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 800;
  font-size: 0.8rem;
}

.prio-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-weight: 800;
  text-transform: uppercase;
  display: inline-block;
}

.prio-badge.low { background: #d1fae5; color: #065f46; }
.prio-badge.medium { background: #dbeafe; color: #1e40af; }
.prio-badge.high { background: #fee2e2; color: #991b1b; }

.status-pill {
  font-size: 0.75rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.status-pill.open { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.status-pill.proses { background: #fefce8; color: #a16207; border: 1px solid #fef9c3; }
.status-pill.selesai { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
.status-pill.batal { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
  display: inline-block;
}

.status-dot.open { background: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); }
.status-dot.proses { background: #eab308; box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.2); }
.status-dot.selesai { background: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }
.status-dot.batal { background: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2); }

/* Premium V-Select */
.premium-v-select :deep(.vs__dropdown-toggle) {
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 5px 0;
  background: white;
}

.premium-v-select :deep(.vs__selected) {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 600;
}

.premium-v-select :deep(.vs__search::placeholder) {
  font-size: 0.9rem;
  color: #94a3b8;
}

.premium-v-select :deep(.vs__dropdown-menu) {
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 8px;
}

.premium-v-select :deep(.vs__dropdown-option) {
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.premium-v-select :deep(.vs__dropdown-option--highlight) {
  background: #eff6ff;
  color: #2563eb;
}

.bg-soft-info {
  background: #e0f2fe;
  color: #0369a1;
}

.bg-soft-success {
  background: #dcfce7;
  color: #15803d;
}

/* Pagination styles for helpdesk */
.pagination-container {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 20px 20px;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-page {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.btn-page-number {
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page-number.active {
  background: #3b82f6;
  color: white;
}

.btn-page-number:hover:not(.active) {
  background: #f1f5f9;
  color: #1e293b;
}
</style>
