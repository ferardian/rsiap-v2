<template>
  <div class="signage-screen d-flex flex-column" :class="isBusy ? 'theme-busy' : 'theme-available'">
    <!-- Top Bar -->
    <header class="p-4 d-flex justify-content-between align-items-center border-bottom border-white border-opacity-25">
      <div class="d-flex align-items-center gap-3">
        <div class="room-icon-box bg-white bg-opacity-25 p-3 rounded-4 shadow">
          <i class="fas fa-hospital-symbol fa-2x text-white"></i>
        </div>
        <div>
          <span class="badge bg-white text-dark font-monospace fs-6 px-3 py-1 mb-1 shadow-sm">
            {{ room ? room.kode_ruang : 'RUANG RAPAT' }}
          </span>
          <h1 class="display-6 fw-bold mb-0 text-white">
            {{ room ? room.nama_ruang : 'Memuat Ruangan...' }}
          </h1>
          <div class="text-white text-opacity-75 fs-6">
            <i class="fas fa-map-marker-alt me-1"></i> {{ room?.lokasi_lantai || 'RSIA Aisyiyah Pekajangan' }} 
            • Kapasitas: {{ room?.kapasitas || 20 }} Orang
          </div>
        </div>
      </div>

      <!-- Live Clock & Date -->
      <div class="text-end">
        <div class="clock-display fw-bold font-monospace text-white">{{ currentTime }}</div>
        <div class="text-white text-opacity-75 fs-5">{{ currentDate }}</div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow-1 p-5 d-flex flex-column justify-content-center align-items-center text-center">
      <!-- STATE: IN USE -->
      <div v-if="isBusy && room.active_meeting" class="meeting-active-card w-100 max-w-4xl p-5 rounded-5 shadow-lg bg-black bg-opacity-25 border border-white border-opacity-25 backdrop-blur">
        <div class="d-inline-flex align-items-center gap-2 bg-white text-danger fw-bold fs-4 px-4 py-2 rounded-pill shadow mb-4 text-uppercase">
          <span class="pulse-red"></span>
          <span>SEDANG BERLANGSUNG</span>
        </div>

        <h2 class="display-5 fw-bold text-white mb-4">
          {{ room.active_meeting.perihal }}
        </h2>

        <div class="d-flex justify-content-center align-items-center gap-4 text-white fs-4 mb-4">
          <div>
            <i class="fas fa-user-tie opacity-75 me-2"></i>
            PJ: <strong>{{ room.active_meeting.penanggung_jawab?.nama || room.active_meeting.pj }}</strong>
          </div>
          <div class="opacity-50">•</div>
          <div>
            <i class="fas fa-envelope opacity-75 me-2"></i>
            Surat: <strong class="font-monospace">{{ room.active_meeting.surat?.no_surat || '-' }}</strong>
          </div>
        </div>

        <!-- Time Range Pill -->
        <div class="d-inline-block bg-white bg-opacity-20 px-5 py-3 rounded-pill text-white font-monospace fs-3 shadow">
          <i class="fas fa-clock me-2"></i>
          {{ formatTime(room.active_meeting.tanggal) }} s/d {{ formatTime(room.active_meeting.jam_selesai || room.active_meeting.tanggal) }} WIB
        </div>
      </div>

      <!-- STATE: AVAILABLE -->
      <div v-else class="meeting-empty-card p-5 rounded-5 shadow-lg bg-black bg-opacity-20 border border-white border-opacity-25 backdrop-blur text-center">
        <div class="d-inline-flex align-items-center gap-2 bg-white text-success fw-bold fs-4 px-5 py-2 rounded-pill shadow mb-4 text-uppercase">
          <i class="fas fa-check-circle text-success me-2"></i>
          <span>RUANGAN TERSEDIA (KOSONG)</span>
        </div>

        <h2 class="display-4 fw-bold text-white mb-3">
          Ruangan Siap Digunakan
        </h2>
        <p class="fs-4 text-white text-opacity-75 mb-0">
          Silakan lakukan reservasi melalui menu Surat Internal & Undangan di RSIAP V2.
        </p>
      </div>
    </main>

    <!-- Bottom Footer: Upcoming Next Agenda -->
    <footer class="p-4 bg-black bg-opacity-40 border-top border-white border-opacity-25 d-flex justify-content-between align-items-center">
      <div v-if="room?.upcoming_meeting" class="d-flex align-items-center gap-3">
        <span class="badge bg-warning text-dark fs-6 px-3 py-2 text-uppercase">
          <i class="fas fa-hourglass-start me-1"></i> Agenda Selanjutnya:
        </span>
        <div class="fs-5 text-white">
          <strong>{{ room.upcoming_meeting.perihal }}</strong>
          <span class="text-white text-opacity-75 ms-2 font-monospace">
            (Mulai {{ formatTime(room.upcoming_meeting.tanggal) }} WIB - PJ: {{ room.upcoming_meeting.penanggung_jawab?.nama || room.upcoming_meeting.pj }})
          </span>
        </div>
      </div>
      <div v-else class="text-white text-opacity-75 fs-6">
        <i class="fas fa-calendar-check me-2"></i> Tidak ada agenda rapat selanjutnya untuk hari ini.
      </div>

      <div class="text-white text-opacity-50 small">
        RSIA Aisyiyah Pekajangan • Smart Digital Signage
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ruangRapatService from '../../services/ruangRapatService'

export default {
  name: 'RuangRapatDisplayView',
  setup() {
    const route = useRoute()
    const roomId = ref(route.params.id)
    const room = ref(null)
    const currentTime = ref('')
    const currentDate = ref('')
    let clockInterval = null
    let pollInterval = null

    const updateClock = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    }

    const fetchRoomStatus = async () => {
      try {
        const res = await ruangRapatService.getRooms()
        if (res.data && res.data.data) {
          const all = res.data.data
          if (roomId.value) {
            room.value = all.find(r => r.id === parseInt(roomId.value)) || all[0]
          } else {
            room.value = all[0]
          }
        }
      } catch (err) {
        console.error('Signage poll error:', err)
      }
    }

    const isBusy = computed(() => {
      return room.value?.live_status === 'in_use'
    })

    const formatTime = (dateStr) => {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    onMounted(() => {
      updateClock()
      clockInterval = setInterval(updateClock, 1000)
      fetchRoomStatus()
      pollInterval = setInterval(fetchRoomStatus, 25000) // Poll every 25s
    })

    onUnmounted(() => {
      if (clockInterval) clearInterval(clockInterval)
      if (pollInterval) clearInterval(pollInterval)
    })

    return {
      room,
      isBusy,
      currentTime,
      currentDate,
      formatTime
    }
  }
}
</script>

<style scoped>
.signage-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  user-select: none;
  transition: background 0.8s ease;
}

.theme-busy {
  background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #450a0a 100%);
}

.theme-available {
  background: linear-gradient(135deg, #064e3b 0%, #059669 50%, #022c22 100%);
}

.clock-display {
  font-size: 3.5rem;
  line-height: 1;
}

.backdrop-blur {
  backdrop-filter: blur(16px);
}

.pulse-red {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #dc2626;
  animation: pulse-red-anim 1.5s infinite;
}

@keyframes pulse-red-anim {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}
</style>
