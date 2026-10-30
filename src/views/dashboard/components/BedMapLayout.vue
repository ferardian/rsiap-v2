<template>
  <div class="bed-map-container">
    <!-- Quick Search & Status Highlight Bar -->
    <div class="map-toolbar">
      <div class="toolbar-search">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari bed, ruangan, atau nama/RM pasien..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Quick Interactive Legend / Status Filter -->
      <div class="legend-pills">
        <button 
          class="legend-pill" 
          :class="{ active: activeStatusFilter === 'ALL' }"
          @click="activeStatusFilter = 'ALL'"
        >
          <span class="dot all"></span>
          <span class="label">Semua</span>
          <span class="count">{{ totalStats.total }}</span>
        </button>

        <button 
          class="legend-pill available" 
          :class="{ active: activeStatusFilter === 'KOSONG' }"
          @click="activeStatusFilter = activeStatusFilter === 'KOSONG' ? 'ALL' : 'KOSONG'"
        >
          <span class="dot green"></span>
          <span class="label">Tersedia</span>
          <span class="count">{{ totalStats.tersedia }}</span>
        </button>

        <button 
          class="legend-pill occupied" 
          :class="{ active: activeStatusFilter === 'ISI' }"
          @click="activeStatusFilter = activeStatusFilter === 'ISI' ? 'ALL' : 'ISI'"
        >
          <span class="dot red"></span>
          <span class="label">Terisi</span>
          <span class="count">{{ totalStats.terisi }}</span>
        </button>

        <button 
          v-if="totalStats.rencana_pulang > 0"
          class="legend-pill discharge" 
          :class="{ active: activeStatusFilter === 'RENCANA_PULANG' }"
          @click="activeStatusFilter = activeStatusFilter === 'RENCANA_PULANG' ? 'ALL' : 'RENCANA_PULANG'"
        >
          <span class="dot yellow pulse"></span>
          <span class="label">Rencana Pulang</span>
          <span class="count">{{ totalStats.rencana_pulang }}</span>
        </button>

        <button 
          v-if="totalStats.dibooking > 0"
          class="legend-pill booking" 
          :class="{ active: activeStatusFilter === 'DIBOOKING' }"
          @click="activeStatusFilter = activeStatusFilter === 'DIBOOKING' ? 'ALL' : 'DIBOOKING'"
        >
          <span class="dot orange"></span>
          <span class="label">Dibooking</span>
          <span class="count">{{ totalStats.dibooking }}</span>
        </button>

        <button 
          v-if="totalStats.dibersihkan > 0"
          class="legend-pill cleaning" 
          :class="{ active: activeStatusFilter === 'DIBERSIHKAN' }"
          @click="activeStatusFilter = activeStatusFilter === 'DIBERSIHKAN' ? 'ALL' : 'DIBERSIHKAN'"
        >
          <span class="dot blue"></span>
          <span class="label">Sterilisasi</span>
          <span class="count">{{ totalStats.dibersihkan }}</span>
        </button>
      </div>
    </div>

    <!-- Pavilion / Gedung Tabs (Cinema Screen / Train Wagon Navigator) -->
    <div class="pavilion-navigator">
      <div class="navigator-scroll">
        <button 
          class="nav-tab" 
          :class="{ active: selectedPavilion === 'ALL' }"
          @click="selectedPavilion = 'ALL'"
        >
          <i class="fas fa-hospital-alt"></i>
          <span class="nav-title">Semua Bangsal</span>
          <span class="nav-badge">{{ totalStats.total }}</span>
        </button>

        <button 
          v-for="p in pavilions" 
          :key="p.name"
          class="nav-tab"
          :class="{ active: selectedPavilion === p.name }"
          @click="selectedPavilion = p.name"
        >
          <i :class="['fas', p.icon || 'fa-procedures']"></i>
          <span class="nav-title">{{ p.name }}</span>
          <span class="nav-badge" :class="{ 'has-empty': p.stats.tersedia > 0 }">
            {{ p.stats.tersedia }} Kosong
          </span>
        </button>
      </div>
    </div>

    <!-- Floor Plan Map Display -->
    <div v-if="filteredPavilions.length === 0" class="empty-map-state">
      <i class="fas fa-search-minus empty-icon"></i>
      <h3>Tidak ada tempat tidur yang cocok</h3>
      <p>Coba ubah kata kunci pencarian atau reset filter status.</p>
      <button class="reset-filter-btn" @click="resetFilters">
        <i class="fas fa-undo"></i> Reset Semua Filter
      </button>
    </div>

    <div v-else class="floor-plan-area">
      <!-- Section per Pavilion -->
      <section 
        v-for="pavilion in filteredPavilions" 
        :key="pavilion.name" 
        class="pavilion-block"
      >
        <!-- Pavilion Header -->
        <div class="pavilion-header">
          <div class="header-left">
            <div class="pavilion-icon-bubble">
              <i :class="['fas', pavilion.icon || 'fa-hospital']"></i>
            </div>
            <div>
              <h2 class="pavilion-name">{{ pavilion.name }}</h2>
              <span class="pavilion-tag">{{ pavilion.tag }} • {{ pavilion.rooms.length }} Ruangan</span>
            </div>
          </div>

          <div class="header-occupancy">
            <div class="occupancy-bar">
              <div 
                class="occupancy-fill" 
                :style="{ width: getOccupancyPercent(pavilion.stats) + '%' }"
              ></div>
            </div>
            <span class="occupancy-text">
              <strong>{{ pavilion.stats.terisi }}/{{ pavilion.stats.total }}</strong> Terisi ({{ getOccupancyPercent(pavilion.stats) }}%)
            </span>
          </div>
        </div>

        <!-- Rooms Grid (Like Cinema Row / Train Compartment Clusters) -->
        <div class="rooms-grid">
          <div 
            v-for="room in pavilion.rooms" 
            :key="room.room_name" 
            class="room-card"
          >
            <!-- Room Top Bar -->
            <div class="room-top">
              <div class="room-identity">
                <span class="room-label">RUANG</span>
                <h4 class="room-title" :title="room.room_name">{{ room.room_name }}</h4>
              </div>
              <div class="room-meta">
                <span class="class-pill" :class="getClassClass(room.kelas)">{{ room.kelas }}</span>
                <span class="capacity-pill">{{ getRoomOccupancy(room) }}</span>
              </div>
            </div>

            <!-- Cinema / Seat Style Bed Layout -->
            <div class="beds-seat-grid">
              <div 
                v-for="bed in room.beds" 
                :key="bed.kd_kamar"
                class="bed-seat"
                :class="[
                  getBedStatusClass(bed),
                  { 'is-dimmed': isBedDimmed(bed) }
                ]"
                @click="onBedClick(bed)"
                @mouseenter="showHoverTooltip($event, bed)"
                @mouseleave="hideHoverTooltip"
              >
                <!-- Bed Seat Visual -->
                <div class="seat-top-notch"></div>
                <div class="seat-main">
                  <div class="seat-icon-wrapper">
                    <i class="fas fa-bed bed-icon"></i>
                    <!-- Status Indicator Badge -->
                    <span v-if="bed.effective_status === 'ISI'" class="gender-mini-badge" :class="bed.patient?.jk === 'L' ? 'male' : 'female'">
                      {{ bed.patient?.jk === 'L' ? 'L' : 'P' }}
                    </span>
                    <span v-else-if="bed.effective_status === 'RENCANA_PULANG'" class="pulse-ring"></span>
                    <span v-else-if="bed.effective_status === 'DIBOOKING'" class="booking-mini-badge">
                      <i class="fas fa-bookmark"></i>
                    </span>
                    <span v-else-if="bed.effective_status === 'DIBERSIHKAN'" class="clean-mini-badge">
                      <i class="fas fa-broom"></i>
                    </span>
                  </div>

                  <!-- Bed Code / Seat Number -->
                  <div class="seat-code">{{ formatBedCode(bed.kd_kamar) }}</div>

                  <!-- Patient Inisial or Status Text -->
                  <div class="seat-status-text">
                    <template v-if="bed.effective_status === 'ISI'">
                      <span class="patient-short-name" :title="bed.patient?.nm_pasien">
                        {{ bed.patient?.nm_pasien_masked || 'Terisi' }}
                      </span>
                    </template>
                    <template v-else-if="bed.effective_status === 'RENCANA_PULANG'">
                      <span class="text-discharge">Plg Hari Ini</span>
                    </template>
                    <template v-else-if="bed.effective_status === 'DIBOOKING'">
                      <span class="text-booking">Booking</span>
                    </template>
                    <template v-else-if="bed.effective_status === 'DIBERSIHKAN'">
                      <span class="text-cleaning">Sterilisasi</span>
                    </template>
                    <template v-else>
                      <span class="text-available">Siap Pakai</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Floating Hover Tooltip (Quick Peek) -->
    <div 
      v-if="hoveredBed" 
      class="bed-hover-tooltip"
      :style="tooltipStyle"
    >
      <div class="tooltip-header" :class="getBedStatusClass(hoveredBed)">
        <div class="tooltip-title">
          <i class="fas fa-bed"></i>
          <span>{{ hoveredBed.kd_kamar }}</span>
        </div>
        <span class="tooltip-status-badge">
          {{ getStatusLabel(hoveredBed.effective_status) }}
        </span>
      </div>

      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="t-label">Ruang / Kelas:</span>
          <span class="t-val">{{ hoveredBed.nm_bangsal }} ({{ hoveredBed.kelas }})</span>
        </div>

        <template v-if="hoveredBed.patient">
          <div class="tooltip-divider"></div>
          <div class="tooltip-row highlight">
            <span class="t-label">Pasien:</span>
            <span class="t-val font-bold">
              {{ hoveredBed.patient.nm_pasien }} 
              <span class="t-gender" :class="hoveredBed.patient.jk === 'L' ? 'male' : 'female'">
                ({{ hoveredBed.patient.jk === 'L' ? 'Laki-laki' : 'Perempuan' }}, {{ hoveredBed.patient.umur }})
              </span>
            </span>
          </div>
          <div class="tooltip-row">
            <span class="t-label">No. RM / Rawat:</span>
            <span class="t-val font-mono">{{ hoveredBed.patient.no_rkm_medis }} • {{ hoveredBed.patient.no_rawat }}</span>
          </div>
          <div class="tooltip-row">
            <span class="t-label">DPJP:</span>
            <span class="t-val text-primary-doctor">{{ hoveredBed.patient.dpjp || '-' }}</span>
          </div>
          <div class="tooltip-row">
            <span class="t-label">Masuk / LOS:</span>
            <span class="t-val">{{ hoveredBed.patient.tgl_masuk }} ({{ hoveredBed.patient.lama_rawat }} Hari)</span>
          </div>
          <div v-if="hoveredBed.patient.diagnosa_awal" class="tooltip-row">
            <span class="t-label">Diagnosa Awal:</span>
            <span class="t-val font-italic">{{ hoveredBed.patient.diagnosa_awal }}</span>
          </div>
        </template>

        <template v-else>
          <div class="tooltip-divider"></div>
          <div class="tooltip-row">
            <span class="t-label">Tarif Kamar:</span>
            <span class="t-val font-semibold text-success">{{ formatRupiah(hoveredBed.trf_kamar) }} / hari</span>
          </div>
          <div class="tooltip-hint">
            <i class="fas fa-info-circle"></i> Klik untuk melihat detail atau pilih bed
          </div>
        </template>
      </div>
    </div>

    <!-- Bed Detail Modal (Click Drawer/Modal) -->
    <div v-if="selectedBed" class="bed-detail-modal-overlay" @click.self="selectedBed = null">
      <div class="bed-detail-modal animate-scale-up">
        <div class="modal-top" :class="getBedStatusClass(selectedBed)">
          <div class="modal-top-left">
            <div class="modal-bed-icon">
              <i class="fas fa-bed"></i>
            </div>
            <div>
              <h3 class="modal-bed-title">{{ selectedBed.kd_kamar }}</h3>
              <p class="modal-bed-sub">{{ selectedBed.nm_bangsal }} • {{ selectedBed.kelas }}</p>
            </div>
          </div>
          <button class="modal-close-btn" @click="selectedBed = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-content-body">
          <!-- Status Banner -->
          <div class="modal-status-banner" :class="getBedStatusClass(selectedBed)">
            <i :class="getStatusIcon(selectedBed.effective_status)"></i>
            <span>Status: <strong>{{ getStatusLabel(selectedBed.effective_status) }}</strong></span>
            <span v-if="selectedBed.trf_kamar > 0" class="ml-auto text-sm">
              Tarif: <strong>{{ formatRupiah(selectedBed.trf_kamar) }}</strong>/hari
            </span>
          </div>

          <!-- If Patient Occupied -->
          <div v-if="selectedBed.patient" class="patient-detail-card">
            <h4 class="card-section-title">
              <i class="fas fa-user-injured"></i> Informasi Pasien
            </h4>

            <div class="info-grid">
              <div class="info-field">
                <span class="info-label">Nama Pasien</span>
                <span class="info-value font-bold text-lg">{{ selectedBed.patient.nm_pasien }}</span>
              </div>
              <div class="info-field">
                <span class="info-label">Jenis Kelamin / Usia</span>
                <span class="info-value">
                  {{ selectedBed.patient.jk === 'L' ? 'Laki-laki' : 'Perempuan' }} ({{ selectedBed.patient.umur }})
                </span>
              </div>
              <div class="info-field">
                <span class="info-label">No. Rekam Medis</span>
                <div class="copyable-badge">
                  <span class="font-mono font-bold">{{ selectedBed.patient.no_rkm_medis }}</span>
                  <button class="copy-btn" @click="copyText(selectedBed.patient.no_rkm_medis, 'No RM')">
                    <i class="far fa-copy"></i>
                  </button>
                </div>
              </div>
              <div class="info-field">
                <span class="info-label">No. Rawat</span>
                <div class="copyable-badge">
                  <span class="font-mono font-bold">{{ selectedBed.patient.no_rawat }}</span>
                  <button class="copy-btn" @click="copyText(selectedBed.patient.no_rawat, 'No Rawat')">
                    <i class="far fa-copy"></i>
                  </button>
                </div>
              </div>
              <div class="info-field col-span-2">
                <span class="info-label">Dokter Penanggung Jawab (DPJP)</span>
                <span class="info-value text-primary font-semibold">
                  <i class="fas fa-user-md mr-1"></i> {{ selectedBed.patient.dpjp || '-' }}
                </span>
              </div>
              <div class="info-field">
                <span class="info-label">Waktu Masuk Rawat</span>
                <span class="info-value">
                  {{ selectedBed.patient.tgl_masuk }} {{ selectedBed.patient.jam_masuk }}
                </span>
              </div>
              <div class="info-field">
                <span class="info-label">Lama Rawat (LOS)</span>
                <span class="info-value font-bold text-warning">
                  {{ selectedBed.patient.lama_rawat }} Hari
                </span>
              </div>
              <div v-if="selectedBed.patient.diagnosa_awal" class="info-field col-span-2">
                <span class="info-label">Diagnosa Awal</span>
                <span class="info-value bg-light p-2 rounded">
                  {{ selectedBed.patient.diagnosa_awal }}
                </span>
              </div>
            </div>
          </div>

          <!-- If Empty Bed -->
          <div v-else class="empty-bed-card">
            <div class="empty-illustration">
              <i class="fas fa-check-circle text-success"></i>
              <h4>Tempat Tidur Tersedia</h4>
              <p>Tempat tidur ini dalam kondisi kosong, bersih, dan siap ditempati oleh pasien baru.</p>
            </div>
            <div class="empty-specs">
              <div class="spec-item">
                <span class="spec-label">Kelas</span>
                <span class="spec-val font-bold">{{ selectedBed.kelas }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Tarif</span>
                <span class="spec-val text-success font-bold">{{ formatRupiah(selectedBed.trf_kamar) }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Bangsal</span>
                <span class="spec-val">{{ selectedBed.nm_bangsal }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="selectedBed = null">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from '../../../utils/notification'

const props = defineProps({
  mapData: {
    type: Object,
    default: () => ({ stats: {}, pavilions: [] })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Filters State
const searchQuery = ref('')
const activeStatusFilter = ref('ALL') // 'ALL' | 'KOSONG' | 'ISI' | 'RENCANA_PULANG' | 'DIBOOKING' | 'DIBERSIHKAN'
const selectedPavilion = ref('ALL')

// Tooltip State
const hoveredBed = ref(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

// Modal State
const selectedBed = ref(null)

// Computed
const totalStats = computed(() => {
  return props.mapData.stats || {
    total: 0,
    tersedia: 0,
    terisi: 0,
    dibersihkan: 0,
    dibooking: 0,
    rencana_pulang: 0
  }
})

const pavilions = computed(() => {
  return props.mapData.pavilions || []
})

const filteredPavilions = computed(() => {
  let list = pavilions.value

  // Filter by selected pavilion tab
  if (selectedPavilion.value !== 'ALL') {
    list = list.filter(p => p.name === selectedPavilion.value)
  }

  const query = searchQuery.value.trim().toLowerCase()
  const statusFilter = activeStatusFilter.value

  // If no search and no status filter, return list as is
  if (!query && statusFilter === 'ALL') {
    return list
  }

  // Filter pavilions and rooms
  return list.map(p => {
    // Filter rooms inside
    const matchedRooms = p.rooms.map(room => {
      const matchedBeds = room.beds.filter(bed => {
        // Status filter
        let matchStatus = true
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'KOSONG') matchStatus = bed.status === 'KOSONG'
          else if (statusFilter === 'ISI') matchStatus = bed.status === 'ISI'
          else if (statusFilter === 'RENCANA_PULANG') matchStatus = bed.effective_status === 'RENCANA_PULANG'
          else if (statusFilter === 'DIBOOKING') matchStatus = bed.status === 'DIBOOKING'
          else if (statusFilter === 'DIBERSIHKAN') matchStatus = bed.status === 'DIBERSIHKAN'
        }

        if (!matchStatus) return false

        // Search query filter
        if (query) {
          const bedCode = (bed.kd_kamar || '').toLowerCase()
          const roomName = (bed.nm_bangsal || '').toLowerCase()
          const patientName = (bed.patient?.nm_pasien || '').toLowerCase()
          const patientRm = (bed.patient?.no_rkm_medis || '').toLowerCase()
          const dpjp = (bed.patient?.dpjp || '').toLowerCase()

          return (
            bedCode.includes(query) ||
            roomName.includes(query) ||
            patientName.includes(query) ||
            patientRm.includes(query) ||
            dpjp.includes(query)
          )
        }

        return true
      })

      return {
        ...room,
        beds: matchedBeds
      }
    }).filter(r => r.beds.length > 0)

    return {
      ...p,
      rooms: matchedRooms
    }
  }).filter(p => p.rooms.length > 0)
})

// Helpers
const getOccupancyPercent = (stats) => {
  if (!stats || !stats.total || stats.total === 0) return 0
  return Math.round((stats.terisi / stats.total) * 100)
}

const getRoomOccupancy = (room) => {
  const total = room.beds.length
  const occupied = room.beds.filter(b => b.status === 'ISI').length
  return `${occupied}/${total} Terisi`
}

const formatBedCode = (kdKamar) => {
  if (!kdKamar) return '-'
  // Strip long prefix for compact seat look
  let clean = kdKamar.trim()
  if (clean.includes('.')) {
    const parts = clean.split('.')
    return parts[parts.length - 1]
  }
  return clean
}

const getClassClass = (kelas) => {
  if (!kelas) return 'class-general'
  const k = kelas.toLowerCase()
  if (k.includes('vip')) return 'class-vip'
  if (k.includes('1')) return 'class-1'
  if (k.includes('2')) return 'class-2'
  if (k.includes('3')) return 'class-3'
  if (k.includes('utama')) return 'class-utama'
  return 'class-general'
}

const getBedStatusClass = (bed) => {
  if (!bed) return ''
  if (bed.effective_status === 'RENCANA_PULANG') return 'status-discharge'
  if (bed.status === 'ISI') return 'status-occupied'
  if (bed.status === 'KOSONG') return 'status-available'
  if (bed.status === 'DIBOOKING') return 'status-booking'
  if (bed.status === 'DIBERSIHKAN') return 'status-cleaning'
  return 'status-available'
}

const isBedDimmed = (bed) => {
  if (activeStatusFilter.value === 'ALL') return false
  if (activeStatusFilter.value === 'KOSONG') return bed.status !== 'KOSONG'
  if (activeStatusFilter.value === 'ISI') return bed.status !== 'ISI'
  if (activeStatusFilter.value === 'RENCANA_PULANG') return bed.effective_status !== 'RENCANA_PULANG'
  if (activeStatusFilter.value === 'DIBOOKING') return bed.status !== 'DIBOOKING'
  if (activeStatusFilter.value === 'DIBERSIHKAN') return bed.status !== 'DIBERSIHKAN'
  return false
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'KOSONG': return 'Tersedia'
    case 'ISI': return 'Terisi Pasien'
    case 'RENCANA_PULANG': return 'Rencana Pulang (Hari Ini)'
    case 'DIBOOKING': return 'Dibooking / Indent'
    case 'DIBERSIHKAN': return 'Sedang Disterilisasi'
    default: return status || 'Tersedia'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'KOSONG': return 'fas fa-check-circle'
    case 'ISI': return 'fas fa-user-injured'
    case 'RENCANA_PULANG': return 'fas fa-walking'
    case 'DIBOOKING': return 'fas fa-bookmark'
    case 'DIBERSIHKAN': return 'fas fa-broom'
    default: return 'fas fa-info-circle'
  }
}

const formatRupiah = (val) => {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

// Tooltip Handlers
const showHoverTooltip = (event, bed) => {
  hoveredBed.value = bed
  const rect = event.currentTarget.getBoundingClientRect()
  
  // Position tooltip safely above or below
  const tooltipWidth = 320
  let left = rect.left + rect.width / 2 - tooltipWidth / 2
  if (left < 16) left = 16
  if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16

  let top = rect.top - 180
  if (top < 80) {
    top = rect.bottom + 12
  }

  tooltipX.value = left
  tooltipY.value = top
}

const hideHoverTooltip = () => {
  hoveredBed.value = null
}

const tooltipStyle = computed(() => {
  return {
    top: `${tooltipY.value}px`,
    left: `${tooltipX.value}px`
  }
})

// Modal / Click Handlers
const onBedClick = (bed) => {
  hideHoverTooltip()
  selectedBed.value = bed
}

const copyText = (text, label) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  showToast(`${label} disalin ke papan klip`, 'success')
}

const resetFilters = () => {
  searchQuery.value = ''
  activeStatusFilter.value = 'ALL'
  selectedPavilion.value = 'ALL'
}
</script>

<style scoped>
/* =========================================================================
   BED MAP CONTAINER & CINEMA SEAT STYLING
   ========================================================================= */
.bed-map-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

/* Map Toolbar: Search & Status Pills */
.map-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: white;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.toolbar-search {
  position: relative;
  flex: 1;
  min-width: 280px;
  max-width: 480px;
}

.toolbar-search .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.toolbar-search .search-input {
  width: 100%;
  padding: 10px 38px 10px 38px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 13.5px;
  color: #1e293b;
  transition: all 0.2s;
}

.toolbar-search .search-input:focus {
  outline: none;
  border-color: #0284c7;
  background: white;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.legend-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.legend-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.legend-pill:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.legend-pill.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
}

.legend-pill.active .count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.legend-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-pill .dot.all { background: #64748b; }
.legend-pill .dot.green { background: #10b981; }
.legend-pill .dot.red { background: #ef4444; }
.legend-pill .dot.yellow { background: #f59e0b; }
.legend-pill .dot.orange { background: #f97316; }
.legend-pill .dot.blue { background: #0ea5e9; }

.legend-pill .count {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #334155;
  font-weight: 700;
}

.pulse {
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

/* Pavilion / Floor Navigator (Tabs) */
.pavilion-navigator {
  background: white;
  border-radius: 16px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.navigator-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.navigator-scroll::-webkit-scrollbar {
  height: 4px;
}

.navigator-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tab:hover {
  background: #f1f5f9;
  color: #0284c7;
}

.nav-tab.active {
  background: #0284c7;
  color: white;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.nav-tab .nav-badge {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
}

.nav-tab.active .nav-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.nav-badge.has-empty {
  background: #dcfce7;
  color: #15803d;
  font-weight: 700;
}

.nav-tab.active .nav-badge.has-empty {
  background: #10b981;
  color: white;
}

/* Floor Plan Area */
.floor-plan-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pavilion-block {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
}

.pavilion-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #e2e8f0;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pavilion-icon-bubble {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.pavilion-name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.pavilion-tag {
  font-size: 12.5px;
  color: #64748b;
  font-weight: 500;
}

.header-occupancy {
  display: flex;
  align-items: center;
  gap: 12px;
}

.occupancy-bar {
  width: 120px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.occupancy-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.occupancy-text {
  font-size: 12.5px;
  color: #475569;
}

/* Rooms Grid */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.room-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s;
}

.room-card:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.room-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.room-identity .room-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.room-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.class-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.class-vip { background: #fef3c7; color: #b45309; }
.class-1 { background: #dbeafe; color: #1e40af; }
.class-2 { background: #e0e7ff; color: #4338ca; }
.class-3 { background: #f1f5f9; color: #475569; }
.class-utama { background: #fae8ff; color: #86198f; }
.class-general { background: #e2e8f0; color: #334155; }

.capacity-pill {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

/* Beds Cinema Seat Grid */
.beds-seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 12px;
}

/* Cinema / Train Seat Visual Card */
.bed-seat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px 8px 8px;
  border-radius: 12px;
  cursor: pointer;
  background: white;
  border: 2px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.bed-seat:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.bed-seat.is-dimmed {
  opacity: 0.25;
  filter: grayscale(80%);
}

.seat-top-notch {
  width: 32px;
  height: 4px;
  border-radius: 4px;
  margin-bottom: 6px;
  opacity: 0.6;
}

.seat-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.seat-icon-wrapper {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.seat-code {
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.seat-status-text {
  font-size: 10px;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status: AVAILABLE (KOSONG) */
.bed-seat.status-available {
  border-color: #a7f3d0;
  background: linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%);
}
.bed-seat.status-available .seat-top-notch { background: #10b981; }
.bed-seat.status-available .seat-icon-wrapper {
  background: #d1fae5;
  color: #059669;
}
.bed-seat.status-available .text-available {
  color: #059669;
  font-weight: 600;
}

/* Status: OCCUPIED (TERISI) */
.bed-seat.status-occupied {
  border-color: #fecaca;
  background: linear-gradient(180deg, #fff1f2 0%, #ffffff 100%);
}
.bed-seat.status-occupied .seat-top-notch { background: #f43f5e; }
.bed-seat.status-occupied .seat-icon-wrapper {
  background: #ffe4e6;
  color: #e11d48;
}
.bed-seat.status-occupied .patient-short-name {
  color: #9f1239;
  font-weight: 600;
}

.gender-mini-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 9px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 1px solid white;
}
.gender-mini-badge.male { background: #0284c7; }
.gender-mini-badge.female { background: #db2777; }

/* Status: RENCANA PULANG (YELLOW / AMBER) */
.bed-seat.status-discharge {
  border-color: #fde68a;
  background: linear-gradient(180deg, #fefce8 0%, #ffffff 100%);
}
.bed-seat.status-discharge .seat-top-notch { background: #eab308; }
.bed-seat.status-discharge .seat-icon-wrapper {
  background: #fef9c3;
  color: #ca8a04;
}
.bed-seat.status-discharge .text-discharge {
  color: #a16207;
  font-weight: 700;
}

/* Status: DIBOOKING (ORANGE) */
.bed-seat.status-booking {
  border-color: #fed7aa;
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 100%);
}
.bed-seat.status-booking .seat-top-notch { background: #f97316; }
.bed-seat.status-booking .seat-icon-wrapper {
  background: #ffedd5;
  color: #ea580c;
}
.bed-seat.status-booking .text-booking {
  color: #c2410c;
  font-weight: 600;
}

/* Status: DIBERSIHKAN (CYAN/BLUE) */
.bed-seat.status-cleaning {
  border-color: #bae6fd;
  background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
}
.bed-seat.status-cleaning .seat-top-notch { background: #0ea5e9; }
.bed-seat.status-cleaning .seat-icon-wrapper {
  background: #e0f2fe;
  color: #0284c7;
}
.bed-seat.status-cleaning .text-cleaning {
  color: #0369a1;
  font-weight: 600;
}

/* Empty State */
.empty-map-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.reset-filter-btn {
  margin-top: 16px;
  padding: 8px 18px;
  border-radius: 10px;
  background: #0284c7;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

/* =========================================================================
   FLOATING HOVER TOOLTIP (QUICK PEEK)
   ========================================================================= */
.bed-hover-tooltip {
  position: fixed;
  z-index: 1000;
  width: 320px;
  background: #0f172a;
  color: white;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.tooltip-header {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-header.status-available { background: rgba(16, 185, 129, 0.2); }
.tooltip-header.status-occupied { background: rgba(239, 68, 68, 0.2); }
.tooltip-header.status-discharge { background: rgba(245, 158, 11, 0.2); }
.tooltip-header.status-booking { background: rgba(249, 115, 22, 0.2); }
.tooltip-header.status-cleaning { background: rgba(14, 165, 233, 0.2); }

.tooltip-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13.5px;
}

.tooltip-status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.tooltip-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.tooltip-row .t-label {
  color: #94a3b8;
  flex-shrink: 0;
}

.tooltip-row .t-val {
  color: #f1f5f9;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-row.highlight .t-val {
  color: #38bdf8;
}

.t-gender.male { color: #60a5fa; }
.t-gender.female { color: #f472b6; }

.text-primary-doctor {
  color: #a78bfa;
}

.tooltip-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
}

.tooltip-hint {
  margin-top: 6px;
  font-size: 11px;
  color: #64748b;
  text-align: center;
}

/* =========================================================================
   BED DETAIL MODAL OVERLAY
   ========================================================================= */
.bed-detail-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.bed-detail-modal {
  width: 100%;
  max-width: 580px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-top {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
}

.modal-top.status-available { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
.modal-top.status-occupied { background: linear-gradient(135deg, #fff1f2, #ffe4e6); }
.modal-top.status-discharge { background: linear-gradient(135deg, #fefce8, #fef9c3); }
.modal-top.status-booking { background: linear-gradient(135deg, #fff7ed, #ffedd5); }
.modal-top.status-cleaning { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); }

.modal-top-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-bed-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.modal-bed-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.modal-bed-sub {
  margin: 0;
  font-size: 13px;
  color: #475569;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.12);
  color: #0f172a;
}

.modal-content-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-status-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
}

.modal-status-banner.status-available { background: #dcfce7; color: #15803d; }
.modal-status-banner.status-occupied { background: #fee2e2; color: #b91c1c; }
.modal-status-banner.status-discharge { background: #fef3c7; color: #b45309; }
.modal-status-banner.status-booking { background: #ffedd5; color: #c2410c; }
.modal-status-banner.status-cleaning { background: #e0f2fe; color: #0369a1; }

.patient-detail-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
}

.card-section-title {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.col-span-2 {
  grid-column: span 2;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 13.5px;
  color: #1e293b;
}

.copyable-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  width: fit-content;
}

.copy-btn {
  background: none;
  border: none;
  color: #0284c7;
  cursor: pointer;
  padding: 2px;
}

.empty-bed-card {
  padding: 24px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.empty-illustration i {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-illustration h4 {
  margin: 0 0 6px 0;
  font-size: 17px;
  color: #0f172a;
}

.empty-illustration p {
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #64748b;
}

.empty-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: white;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spec-label {
  font-size: 11px;
  color: #94a3b8;
}

.spec-val {
  font-size: 13px;
  color: #1e293b;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}
</style>
