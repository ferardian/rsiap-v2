<template>
  <div class="helpdesk-container">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h1 class="page-title">🎧 Smart Helpdesk System</h1>
        <p class="page-subtitle">Manajemen bantuan IT dan fasilitas terintegrasi</p>
      </div>
      <div class="header-actions">
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
      <!-- 1. TAB: LAPORAN MASUK (WA TEMP LOG) -->
      <div v-if="activeTab === 'logs'" class="animate__animated animate__fadeIn">
        <div class="card border-0 shadow-sm glass-card mb-4 mt-3">
          <div class="card-body p-4">
            <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
               <h5 class="m-0 fw-bold"><i class="fab fa-whatsapp text-success me-2"></i>Laporan Masuk WhatsApp</h5>
               <div class="search-filter-box d-flex gap-2">
                 <input v-model="logFilters.keyword" type="text" class="form-control premium-input" placeholder="Cari laporan..." @input="handleLogSearch">
                 <select v-model="logFilters.status" class="form-select premium-select" @change="fetchLogs">
                   <option value="WAITING">Waiting</option>
                   <option value="PROCESSED">Processed</option>
                   <option value="EXPIRED">Expired</option>
                 </select>
               </div>
            </div>

            <div class="table-responsive premium-table">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Pelapor</th>
                    <th>Isi Laporan</th>
                    <th class="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="logLoading">
                    <td colspan="4" class="text-center py-5"><div class="spinner-border text-primary spinner-sm"></div></td>
                  </tr>
                  <tr v-else-if="logs.length === 0">
                    <td colspan="4" class="text-center py-5 text-muted">Tidak ada laporan masuk.</td>
                  </tr>
                  <tr v-for="log in logs" :key="log.id" class="log-row">
                    <td>
                      <div class="fw-bold">{{ formatDate(log.created_at) }}</div>
                      <small class="text-muted">{{ formatTime(log.created_at) }}</small>
                    </td>
                    <td>
                      <div class="fw-bold text-indigo">{{ log.pegawai?.nama || 'Non-Pegawai' }}</div>
                      <small class="text-muted">{{ log.departemen?.nama || '-' }}</small>
                    </td>
                    <td class="report-cell">
                      <div class="report-text">{{ log.isi_laporan }}</div>
                    </td>
                    <td class="text-center">
                      <button v-if="log.status === 'WAITING'" class="btn btn-premium-sm" @click="openTicketModal(log)">
                        <i class="fas fa-ticket-alt me-1"></i> Terbitkan Tiket
                      </button>
                      <span v-else class="status-indicator" :class="log.status.toLowerCase()">
                        {{ log.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TAB: MANAJEMEN TIKET (ACTIVE TICKETS) -->
      <div v-if="activeTab === 'tickets'" class="animate__animated animate__fadeIn">
        <div class="card border-0 shadow-sm glass-card mb-4 mt-3">
          <div class="card-body p-4">
             <!-- Simplified for now -->
             <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="m-0 fw-bold"><i class="fas fa-list-check text-primary me-2"></i>Daftar Tiket Aktif</h5>
             </div>
             <div class="table-responsive premium-table">
                <table class="table align-middle">
                  <thead>
                    <tr>
                      <th>No. Tiket</th>
                      <th>Tanggal</th>
                      <th>Pelapor</th>
                      <th>Keluhan</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th class="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ticket in activeTickets" :key="ticket.id">
                      <td><span class="badge-tiket">{{ ticket.no_tiket }}</span></td>
                      <td>
                        <div class="fw-bold">{{ formatDate(ticket.tanggal) }}</div>
                        <small class="text-muted">{{ formatTime(ticket.tanggal) }}</small>
                      </td>
                      <td>{{ ticket.pelapor?.nama }}</td>
                      <td>{{ ticket.keluhan }}</td>
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
                    <tr v-if="activeTickets.length === 0">
                      <td colspan="7" class="text-center py-5 text-muted">Belum ada tiket aktif.</td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Terbitkan Tiket -->
    <div class="modal fade" id="createTicketModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content premium-modal">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Konfirmasi Penerbitan Tiket</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-4">
            <div class="selected-log-preview mb-4">
               <div class="small-label">Pelapor</div>
               <div class="fw-bold mb-2">{{ selectedLog?.pegawai?.nama }} ({{ selectedLog?.kd_dep }})</div>
               <div class="small-label">Isi Laporan</div>
               <div class="log-text-box">{{ selectedLog?.isi_laporan }}</div>
            </div>
            <div class="form-group mb-4">
              <label class="form-label fw-bold">Tentukan Prioritas</label>
              <div class="prio-selector">
                <div 
                  v-for="p in priorities" 
                  :key="p.id" 
                  class="prio-item"
                  :class="{ active: ticketFormData.prioritas === p.id, [p.id.toLowerCase()]: true }"
                  @click="ticketFormData.prioritas = p.id"
                >
                  <i :class="p.icon"></i>
                  <span>{{ p.label }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light-premium" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-premium-action" @click="submitTicket" :disabled="submitting">
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
        <div class="modal-content premium-modal">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Manajemen Detail Tiket</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-4">
            <div class="row g-4">
              <!-- Info Tiket -->
              <div class="col-md-5">
                <div class="ticket-info-summary">
                  <div class="info-item mb-3">
                    <label class="small-label">Nomor Tiket</label>
                    <div class="fw-bold text-primary">{{ selectedTicket?.no_tiket }}</div>
                  </div>
                  <div class="info-item mb-3">
                    <label class="small-label">Pelapor</label>
                    <div class="fw-bold">{{ selectedTicket?.pelapor?.nama }}</div>
                  </div>
                  <div class="info-item mb-3">
                    <label class="small-label">Keluhan</label>
                    <div class="log-text-box small">{{ selectedTicket?.keluhan }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Form Update -->
              <div class="col-md-7 border-start ps-4">
                <div class="form-group mb-3">
                  <label class="form-label fw-bold">Status Tiket</label>
                  <select v-model="manageTicketData.status" class="form-select premium-select">
                    <option value="Open">Open</option>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>

                <div v-if="manageTicketData.status === 'Selesai'" class="form-group mb-3">
                  <label class="form-label fw-bold">Waktu Selesai</label>
                  <input 
                    type="datetime-local" 
                    v-model="manageTicketData.jam_selesai" 
                    class="form-control premium-input"
                  >
                  <small class="text-muted mt-1 d-block">Kosongkan untuk menggunakan waktu saat ini</small>
                </div>

                <div class="form-group mb-3">
                  <label class="form-label fw-bold">Teknisi Penanggung Jawab</label>
                  <v-select
                    v-model="manageTicketData.nik_teknisi"
                    :options="technicians"
                    :reduce="t => t.nik"
                    label="nama"
                    placeholder="Cari & Pilih Teknisi..."
                    class="premium-v-select"
                  >
                    <template #no-options="{ search, searching }">
                      <template v-if="searching">
                        Tidak ditemukan teknisi dengan nama "<em>{{ search }}</em>".
                      </template>
                      <em v-else>Ketik untuk mencari teknisi...</em>
                    </template>
                  </v-select>
                </div>

                <div class="form-group mb-4">
                  <label class="form-label fw-bold">Solusi / Keterangan</label>
                  <textarea 
                    v-model="manageTicketData.solusi" 
                    class="form-control premium-input" 
                    rows="4" 
                    placeholder="Tuliskan solusi atau langkah perbaikan..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light-premium" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-premium-action" @click="submitTicketUpdate" :disabled="updating">
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
  { id: 'logs', label: 'Laporan Masuk', icon: 'fab fa-whatsapp' },
  { id: 'tickets', label: 'Manajemen Tiket', icon: 'fas fa-ticket-alt' }
]

const logFilters = reactive({
  keyword: '',
  status: 'WAITING',
  page: 1,
  limit: 10
})

const selectedLog = ref(null)
const ticketFormData = reactive({
  prioritas: 'Medium'
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

const fetchLogs = async () => {
  logLoading.value = true
  try {
    const response = await helpdeskService.getTempLogs(logFilters)
    logs.value = response.data.data.data
  } catch (error) {
    toast.error('Gagal memuat laporan')
  } finally {
    logLoading.value = false
  }
}

const fetchActiveTickets = async () => {
  ticketLoading.value = true
  try {
    const response = await helpdeskService.getActiveTickets()
    activeTickets.value = response.data.data.data
  } catch (error) {
    toast.error('Gagal memuat tiket')
  } finally {
    ticketLoading.value = false
  }
}

const fetchTechnicians = async () => {
  try {
    const response = await pegawaiService.getKaryawanList({ dep_id: 'IT' }) // Default focus IT
    technicians.value = response.data.data
  } catch (error) {
    console.error('Gagal memuat teknisi', error)
  }
}

const handleLogSearch = () => {
  clearTimeout(handleLogSearch.timer)
  handleLogSearch.timer = setTimeout(() => {
    logFilters.page = 1
    fetchLogs()
  }, 500)
}

const openTicketModal = (log) => {
  selectedLog.value = log
  ticketFormData.prioritas = 'Medium'
  const modal = new bootstrap.Modal(document.getElementById('createTicketModal'))
  modal.show()
}

const submitTicket = async () => {
  submitting.value = true
  try {
    const payload = {
      temp_log_id: selectedLog.value.id,
      prioritas: ticketFormData.prioritas
    }
    const response = await helpdeskService.createTicketFromLog(payload)
    if (response.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Tiket Berhasil Terbit',
        text: 'Laporan telah divalidasi dan diubah menjadi tiket kerja.',
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
}

.page-title {
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.premium-input, .premium-select {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
}

.premium-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Table Style */
.premium-table thead th {
  background: #f8fafc;
  border: none;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  padding: 1.25rem 1rem;
}

.premium-table tbody td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.log-row:hover {
  background: #f8fafc;
}

.text-indigo { color: #2563eb; }

.report-cell {
  max-width: 400px;
}

.report-text {
  font-size: 0.9rem;
  color: #334155;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-premium-sm {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-premium-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
}

.btn-kelola-sm {
  background: white;
  color: #2563eb;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.btn-kelola-sm:hover {
  background: #f8fafc;
  border-color: #2563eb;
}

.status-indicator {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-indicator.processed { background: #dcfce7; color: #166534; }
.status-indicator.expired { background: #fee2e2; color: #991b1b; }

/* Modal Premium */
.premium-modal {
  border-radius: 24px;
  border: none;
  overflow: hidden;
}

.small-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.log-text-box {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #475569;
}

.log-text-box.small {
  padding: 0.75rem;
  font-size: 0.85rem;
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
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.prio-item i { font-size: 1.25rem; }

.prio-item.low:hover, .prio-item.low.active { border-color: #10b981; background: #ecfdf5; color: #047857; }
.prio-item.medium:hover, .prio-item.medium.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
.prio-item.high:hover, .prio-item.high.active { border-color: #ef4444; background: #fef2f2; color: #b91c1c; }

.btn-premium-action {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-premium-action:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
}

.btn-light-premium {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
}

/* Active Ticket Extras */
.badge-tiket {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
}

.prio-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 700;
  text-transform: uppercase;
}

.prio-badge.low { background: #d1fae5; color: #065f46; }
.prio-badge.medium { background: #dbeafe; color: #1e40af; }
.prio-badge.high { background: #fee2e2; color: #991b1b; }

.status-pill {
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pill.open { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.status-pill.proses { background: #fefce8; color: #a16207; border: 1px solid #fef9c3; }
.status-pill.selesai { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
.status-pill.batal { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.75rem;
  display: inline-block;
}

.status-dot.open { background: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); }
.status-dot.proses { background: #eab308; box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.2); }
.status-dot.selesai { background: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }
.status-dot.batal { background: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2); }

/* Premium V-Select */
.premium-v-select :deep(.vs__dropdown-toggle) {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 3px 0;
  background: white;
}

.premium-v-select :deep(.vs__selected) {
  font-size: 0.9rem;
  color: #0f172a;
  font-weight: 500;
}

.premium-v-select :deep(.vs__search::placeholder) {
  font-size: 0.9rem;
  color: #94a3b8;
}

.premium-v-select :deep(.vs__dropdown-menu) {
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
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
</style>
