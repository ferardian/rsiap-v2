<template>
  <div class="queue-manager-card shadow-sm border-0 rounded-4 overflow-hidden animate__animated animate__fadeIn">
    <!-- Header Selection -->
    <div class="p-3 bg-gradient-loket text-white d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2">
        <div class="loket-icon">
          <i class="fas fa-headset"></i>
        </div>
        <div class="loket-text">
          <h6 class="mb-0 fw-bold">Manajemen Antrean</h6>
          <div class="small opacity-75">Loket Active Monitor</div>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <select 
          v-model="selectedLoket" 
          @change="saveLoket"
          class="form-select form-select-sm loket-select border-0 shadow-sm"
        >
          <option value="">Pilih Loket...</option>
          <option v-for="l in lokets" :key="l.kd_loket" :value="l.kd_loket">
            Loket {{ l.kd_loket }} ({{ l.nm_layanan }})
          </option>
        </select>
        <button @click="fetchTickets" class="btn btn-sm btn-light-transparent" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>
      </div>
    </div>

    <div class="p-3 bg-white">
      <!-- "Ambil Antrean" Quick Actions -->
      <div class="row g-2 mb-4">
        <div class="col-4" v-for="type in queueTypes" :key="type.id">
          <button 
            @click="ambilAntrean(type.id)"
            class="btn-quick-queue w-100"
            :class="type.id.toLowerCase()"
            :disabled="takingTicket === type.id"
          >
            <div class="btn-content">
              <span class="type-code">{{ type.id }}</span>
              <span class="type-label">{{ type.label }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Active Tickets List -->
      <div class="queue-list-container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="section-title-small mb-0">Antrean Menunggu</h6>
          <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary">{{ tickets.length }} Ticket</span>
        </div>

        <div v-if="tickets.length === 0" class="empty-queue-state text-center py-4">
          <i class="fas fa-clipboard-list mb-2 opacity-25 fa-2x"></i>
          <p class="small text-muted mb-0">Belum ada antrean masuk</p>
        </div>

        <div v-else class="queue-list custom-scroll">
          <div 
            v-for="t in tickets" 
            :key="t.kd_list" 
            class="queue-item animate__animated animate__fadeInUp"
            :class="{ 'calling': t.status === 'Call' }"
          >
            <div class="q-number-box">
              <span class="q-number">{{ t.antrian }}</span>
              <span class="q-time">{{ formatTime(t.jam_ambil) }}</span>
            </div>
            
            <div class="q-info">
              <div class="q-badge" :class="t.created_by.toLowerCase()">{{ t.created_by }}</div>
              <div class="q-status-text" v-if="t.status === 'Call'">
                Dipanggil @ Loket {{ t.kd_loket }}
              </div>
            </div>

            <div class="q-actions d-flex gap-1">
              <button 
                @click="panggil(t)" 
                class="btn-action call" 
                title="Panggil Antrean"
                :disabled="!selectedLoket || processing === t.kd_list"
              >
                <i class="fas fa-volume-up"></i>
              </button>
              <button 
                @click="linkRegistration(t)" 
                class="btn-action link" 
                title="Selesaikan & Link"
                :disabled="processing === t.kd_list"
              >
                <i class="fas fa-link"></i>
              </button>
              <button 
                @click="batalAntrean(t)" 
                class="btn-action delete" 
                title="Batalkan"
                :disabled="processing === t.kd_list"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import registrasiService from '@/services/registrasiService'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

const props = defineProps({
  currentNoRawat: String,
  currentNmPasien: String
})

const emit = defineEmits(['ticket-linked'])

const tickets = ref([])
const lokets = ref([])
const selectedLoket = ref(localStorage.getItem('selected_loket') || '')
const loading = ref(false)
const processing = ref(null)
const takingTicket = ref(null)
let refreshInterval = null

const queueTypes = [
  { id: 'A', label: 'R. Jalan' },
  { id: 'B', label: 'R. Inap' },
  { id: 'C', label: 'CSO' }
]

const fetchTickets = async () => {
  loading.value = true
  try {
    const response = await registrasiService.getAntreanLoket()
    if (response.data.success) {
      tickets.value = response.data.data
    }
  } catch (err) {
    console.error('Fetch tickets error:', err)
  } finally {
    loading.value = false
  }
}

const fetchLoket = async () => {
  try {
    const response = await registrasiService.getLoket()
    if (response.data.success) {
      lokets.value = response.data.data
    }
  } catch (err) {
    console.error('Fetch loket error:', err)
  }
}

const saveLoket = () => {
  localStorage.setItem('selected_loket', selectedLoket.value)
}

const ambilAntrean = async (jenis) => {
  takingTicket.value = jenis
  try {
    const response = await registrasiService.ambilAntreanLoket({
      jenis: jenis,
      created_by: 'Petugas'
    })
    if (response.data.success) {
      Swal.fire({
        title: 'Berhasil',
        text: `Nomor Antrean baru: ${response.data.data.nomor}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        padding: '2rem',
        customClass: { popup: 'swal2-glass' }
      })
      fetchTickets()
    }
  } catch (err) {
    Swal.fire({
      title: 'Gagal',
      text: err.response?.data?.message || 'Gagal mengambil nomor antrean',
      icon: 'error',
      customClass: { popup: 'swal2-glass' }
    })
  } finally {
    takingTicket.value = null
  }
}

const panggil = async (ticket) => {
  if (!selectedLoket.value) {
    return Swal.fire({
      title: 'Peringatan',
      text: 'Silakan pilih loket terlebih dahulu',
      icon: 'warning',
      customClass: { popup: 'swal2-glass' }
    })
  }

  processing.value = ticket.kd_list
  try {
    await registrasiService.updateAntrean({
      kd_list: ticket.kd_list,
      status: 'Call',
      kd_loket: selectedLoket.value
    })
    // No alert needed as it's a silent update for the dashboard
    fetchTickets()
  } catch (err) {
    console.error('Call error:', err)
  } finally {
    processing.value = null
  }
}

const linkRegistration = async (ticket) => {
  if (!props.currentNoRawat) {
    return Swal.fire({
      title: 'Klaim Antrean',
      text: 'Silakan pilih atau daftarkan pasien terlebih dahulu untuk menghubungkan antrean ini.',
      icon: 'info',
      customClass: { popup: 'swal2-glass' }
    })
  }

  const result = await Swal.fire({
    title: 'Konfirmasi Klaim',
    text: `Hubungkan nomor ${ticket.antrian} dengan pasien ${props.currentNmPasien}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hubungkan',
    cancelButtonText: 'Batal',
    customClass: { popup: 'swal2-glass' }
  })

  if (result.isConfirmed) {
    processing.value = ticket.kd_list
    try {
      await registrasiService.updateAntrean({
        kd_list: ticket.kd_list,
        status: 'Finish',
        no_rawat: props.currentNoRawat
      })
      Swal.fire({
        title: 'Sukses',
        text: 'Antrean telah berhasil dihubungkan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'swal2-glass' }
      })
      fetchTickets()
      emit('ticket-linked', ticket)
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: 'Gagal menghubungkan antrean',
        icon: 'error',
        customClass: { popup: 'swal2-glass' }
      })
    } finally {
      processing.value = null
    }
  }
}

const batalAntrean = async (ticket) => {
  const result = await Swal.fire({
    title: 'Batalkan Antrean?',
    text: `Nomor ${ticket.antrian} akan dihapus dari daftar tunggu.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    confirmButtonColor: '#e53e3e',
    customClass: { popup: 'swal2-glass' }
  })

  if (result.isConfirmed) {
    processing.value = ticket.kd_list
    try {
      await registrasiService.updateAntrean({
        kd_list: ticket.kd_list,
        status: 'Batal'
      })
      fetchTickets()
    } catch (err) {
       console.error('Batal error:', err)
    } finally {
      processing.value = null
    }
  }
}

const formatTime = (time) => dayjs(time).format('HH:mm')

onMounted(() => {
  fetchLoket()
  fetchTickets()
  refreshInterval = setInterval(fetchTickets, 10000) // 10s auto refresh
})

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.bg-gradient-loket {
  background: linear-gradient(135deg, #1e40af, #3b82f6, #6366f1);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.loket-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.loket-select {
  max-width: 140px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  font-size: 0.8rem;
}

.loket-select option {
  color: #333;
}

.btn-light-transparent {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  border-radius: 8px;
  width: 32px;
  height: 32px;
}

.btn-light-transparent:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Quick Actions */
.btn-quick-queue {
  border: 1.5px solid #edf2f7;
  border-radius: 14px;
  padding: 0.75rem 0.5rem;
  background: white;
  transition: all 0.2s;
}

.btn-quick-queue:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #cbd5e0;
}

.btn-quick-queue.a { border-left: 4px solid #3b82f6; }
.btn-quick-queue.b { border-left: 4px solid #10b981; }
.btn-quick-queue.c { border-left: 4px solid #f59e0b; }

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.type-code {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2d3748;
}

.type-label {
  font-size: 0.65rem;
  color: #718096;
  text-transform: uppercase;
  font-weight: 600;
}

/* List */
.queue-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  transition: all 0.3s;
}

.queue-item:hover {
  border-color: #3b82f6;
  background: white;
}

.queue-item.calling {
  background: #fff9e6;
  border-color: #f59e0b;
  animation: pulse-yellow 2s infinite;
}

@keyframes pulse-yellow {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.q-number-box {
  display: flex;
  flex-direction: column;
  margin-right: 1.25rem;
}

.q-number {
  font-family: 'Roboto Mono', monospace;
  font-weight: 800;
  font-size: 1.25rem;
  color: #1e3c72;
}

.q-time {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
}

.q-info {
  flex-grow: 1;
}

.q-badge {
  display: inline-block;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  text-transform: uppercase;
}

.q-badge.apm { background: #e0f2fe; color: #0369a1; }
.q-badge.petugas { background: #fef3c7; color: #92400e; }

.q-status-text {
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 700;
  margin-top: 0.25rem;
}

.btn-action {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: white;
}

.btn-action.call { background: #f59e0b; }
.btn-action.link { background: #10b981; }
.btn-action.delete { background: #ef4444; }

.btn-action:hover:not(:disabled) {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.btn-action:disabled {
  background: #e2e8f0;
  cursor: not-allowed;
}

.section-title-small {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
</style>
