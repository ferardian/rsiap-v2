<template>
  <div class="bed-map-container">
    <!-- Top Toolbar: Search & Status Filters -->
    <div class="map-toolbar">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari nomor bed, kamar, nama pasien, RM, atau DPJP..." 
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Quick Status Filters (Legend) -->
      <div class="status-legend-bar">
        <button 
          class="legend-btn" 
          :class="{ active: activeStatusFilter === 'ALL' }"
          @click="activeStatusFilter = 'ALL'"
        >
          <span class="legend-dot all"></span>
          <span class="legend-label">Semua</span>
          <span class="legend-badge">{{ totalStats.total }}</span>
        </button>

        <button 
          class="legend-btn available" 
          :class="{ active: activeStatusFilter === 'KOSONG' }"
          @click="activeStatusFilter = 'KOSONG'"
        >
          <span class="legend-dot available"></span>
          <span class="legend-label">Tersedia</span>
          <span class="legend-badge">{{ totalStats.tersedia }}</span>
        </button>

        <button 
          class="legend-btn occupied" 
          :class="{ active: activeStatusFilter === 'ISI' }"
          @click="activeStatusFilter = 'ISI'"
        >
          <span class="legend-dot occupied"></span>
          <span class="legend-label">Terisi</span>
          <span class="legend-badge">{{ totalStats.terisi }}</span>
        </button>

        <button 
          v-if="totalStats.rencana_pulang > 0"
          class="legend-btn discharge" 
          :class="{ active: activeStatusFilter === 'RENCANA_PULANG' }"
          @click="activeStatusFilter = 'RENCANA_PULANG'"
        >
          <span class="legend-dot discharge"></span>
          <span class="legend-label">Rencana Plg</span>
          <span class="legend-badge">{{ totalStats.rencana_pulang }}</span>
        </button>

        <button 
          v-if="totalStats.dibooking > 0"
          class="legend-btn booking" 
          :class="{ active: activeStatusFilter === 'DIBOOKING' }"
          @click="activeStatusFilter = 'DIBOOKING'"
        >
          <span class="legend-dot booking"></span>
          <span class="legend-label">Booking</span>
          <span class="legend-badge">{{ totalStats.dibooking }}</span>
        </button>

        <button 
          v-if="totalStats.dibersihkan > 0"
          class="legend-btn cleaning" 
          :class="{ active: activeStatusFilter === 'DIBERSIHKAN' }"
          @click="activeStatusFilter = 'DIBERSIHKAN'"
        >
          <span class="legend-dot cleaning"></span>
          <span class="legend-label">Sterilisasi</span>
          <span class="legend-badge">{{ totalStats.dibersihkan }}</span>
        </button>
      </div>
    </div>

    <!-- Pavilion Quick Navigation Tabs -->
    <div class="pavilion-nav-tabs">
      <button 
        class="pavilion-tab-btn" 
        :class="{ active: selectedPavilion === 'ALL' }"
        @click="selectedPavilion = 'ALL'"
      >
        <i class="fas fa-layer-group"></i> Semua Paviliun ({{ pavilions.length }})
      </button>
      <button 
        v-for="pav in pavilions" 
        :key="pav.name"
        class="pavilion-tab-btn"
        :class="{ active: selectedPavilion === pav.name }"
        @click="selectedPavilion = pav.name"
      >
        <i :class="['fas', pav.icon || 'fa-hospital']"></i>
        <span>{{ pav.name }}</span>
        <span class="tab-stat-pill" :class="{ 'has-available': pav.stats.tersedia > 0 }">
          {{ pav.stats.tersedia }} Kosong
        </span>
      </button>
    </div>

    <!-- Floor Plan Area -->
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
              <span class="pavilion-tag">{{ pavilion.tag }} • {{ pavilion.beds.length }} Tempat Tidur</span>
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

        <!-- Spasial Bed Matrix (Denah Bed Utuh) -->
        <div class="beds-matrix">
          <div 
            v-for="bed in pavilion.beds" 
            :key="bed.kd_kamar"
            class="bed-card"
            :class="[
              getBedStatusClass(bed),
              { 'is-dimmed': isBedDimmed(bed) }
            ]"
            @click="onBedClick(bed)"
            @mouseenter="showHoverTooltip($event, bed)"
            @mouseleave="hideHoverTooltip"
          >
            <!-- Bed Card Header -->
            <div class="bed-card-head">
              <div class="bed-identity">
                <i class="fas fa-bed bed-icon-svg"></i>
                <span class="bed-label-text">{{ bed.bed_label || bed.kd_kamar }}</span>
              </div>
              <span class="class-pill" :class="getClassClass(bed.kelas)">{{ bed.kelas }}</span>
            </div>

            <!-- Bed Main Body -->
            <div class="bed-card-body">
              <!-- Terisi / Pasien -->
              <template v-if="bed.effective_status === 'ISI' || bed.effective_status === 'RENCANA_PULANG'">
                <div class="patient-line">
                  <span class="gender-mini-badge" :class="bed.patient?.jk === 'L' ? 'male' : 'female'">
                    {{ bed.patient?.jk === 'L' ? '👨 L' : '👩 P' }}
                  </span>
                  <span class="patient-name-display" :title="bed.patient?.nm_pasien">
                    {{ bed.patient?.nm_pasien_masked || 'Pasien Terisi' }}
                  </span>
                </div>
                <div class="patient-doctor" v-if="bed.patient?.dpjp">
                  <i class="fas fa-user-md"></i> {{ bed.patient.dpjp }}
                </div>
                <div class="bed-meta-sub">
                  <span class="los-pill" v-if="bed.patient?.lama_rawat">
                    <i class="far fa-clock"></i> {{ bed.patient.lama_rawat }} Hari
                  </span>
                  <span v-if="bed.effective_status === 'RENCANA_PULANG'" class="badge-discharge">
                    <i class="fas fa-sign-out-alt"></i> Plg Hari Ini
                  </span>
                </div>
              </template>

              <!-- Kosong / Siap Pakai -->
              <template v-else-if="bed.effective_status === 'KOSONG'">
                <div class="available-state">
                  <div class="state-icon green-icon">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <div class="state-texts">
                    <span class="available-title">Siap Pakai</span>
                    <span class="available-price">{{ formatRupiah(bed.trf_kamar) }}/hr</span>
                  </div>
                </div>
              </template>

              <!-- Dibersihkan -->
              <template v-else-if="bed.effective_status === 'DIBERSIHKAN'">
                <div class="cleaning-state">
                  <div class="state-icon amber-icon">
                    <i class="fas fa-broom"></i>
                  </div>
                  <div class="state-texts">
                    <span class="cleaning-title">Sterilisasi</span>
                    <span class="cleaning-desc">Pembersihan</span>
                  </div>
                </div>
              </template>

              <!-- Booking -->
              <template v-else-if="bed.effective_status === 'DIBOOKING'">
                <div class="booking-state">
                  <div class="state-icon purple-icon">
                    <i class="fas fa-bookmark"></i>
                  </div>
                  <div class="state-texts">
                    <span class="booking-title">Dibooking</span>
                    <span class="booking-desc">Menunggu</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- Bed Card Footer -->
            <div class="bed-card-footer">
              <span class="status-tag-pill" :class="getBedStatusClass(bed)">
                {{ getStatusLabel(bed.effective_status) }}
              </span>
              <span class="detail-hint">
                <i class="fas fa-info-circle"></i>
              </span>
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
          <span>{{ hoveredBed.bed_label || hoveredBed.kd_kamar }}</span>
        </div>
        <span class="tooltip-status-badge">
          {{ getStatusLabel(hoveredBed.effective_status) }}
        </span>
      </div>

      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="label">Bangsal / Ruang:</span>
          <span class="value">{{ hoveredBed.nm_bangsal }} ({{ hoveredBed.kelas }})</span>
        </div>
        <div class="tooltip-row" v-if="hoveredBed.trf_kamar > 0">
          <span class="label">Tarif:</span>
          <span class="value font-semibold">{{ formatRupiah(hoveredBed.trf_kamar) }} / hari</span>
        </div>

        <template v-if="hoveredBed.patient">
          <hr class="tooltip-divider" />
          <div class="tooltip-row">
            <span class="label">Pasien:</span>
            <span class="value font-bold text-dark">{{ hoveredBed.patient.nm_pasien }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">No. RM:</span>
            <span class="value font-mono">{{ hoveredBed.patient.no_rkm_medis }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">DPJP:</span>
            <span class="value text-primary font-semibold">{{ hoveredBed.patient.dpjp || '-' }}</span>
          </div>
          <div class="tooltip-row">
            <span class="label">Masuk:</span>
            <span class="value">{{ hoveredBed.patient.tgl_masuk }} ({{ hoveredBed.patient.lama_rawat }} hari)</span>
          </div>
        </template>
      </div>
      <div class="tooltip-footer">
        <i class="fas fa-mouse-pointer"></i> Klik kartu untuk detail lengkap
      </div>
    </div>

    <!-- Bed Detail Full Modal -->
    <div 
      v-if="selectedBed" 
      class="bed-detail-modal-overlay" 
      @click="selectedBed = null"
    >
      <div class="bed-detail-modal-card" @click.stop>
        <div class="modal-card-header">
          <div class="modal-title-wrap">
            <i class="fas fa-bed title-icon"></i>
            <div>
              <h3>{{ selectedBed.bed_label || selectedBed.kd_kamar }}</h3>
              <p class="subtitle">{{ selectedBed.nm_bangsal }} • {{ selectedBed.kelas }}</p>
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

          <!-- Empty Bed State in Modal -->
          <div v-else class="empty-bed-modal-state">
            <div class="empty-bed-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h4>Tempat Tidur Siap Digunakan</h4>
            <p>Bed ini dalam kondisi bersih, steril, dan dapat langsung dialokasikan untuk pasien rawat inap baru.</p>
            <div class="rate-box">
              <span>Tarif Kamar:</span>
              <strong class="rate-amount">{{ formatRupiah(selectedBed.trf_kamar) }} / hari</strong>
            </div>
          </div>
        </div>

        <div class="modal-card-footer">
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

const props = defineProps({
  mapData: {
    type: Object,
    default: () => ({
      pavilions: [],
      stats: {}
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Filters State
const searchQuery = ref('')
const activeStatusFilter = ref('ALL')
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

  return list.map(p => {
    // Direct beds array
    const allBeds = p.beds || (p.rooms ? p.rooms.flatMap(r => r.beds) : [])
    const matchedBeds = allBeds.filter(bed => {
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
        const bedLabel = (bed.bed_label || '').toLowerCase()
        const roomName = (bed.nm_bangsal || '').toLowerCase()
        const patientName = (bed.patient?.nm_pasien || '').toLowerCase()
        const patientRm = (bed.patient?.no_rkm_medis || '').toLowerCase()
        const dpjp = (bed.patient?.dpjp || '').toLowerCase()

        return (
          bedCode.includes(query) ||
          bedLabel.includes(query) ||
          roomName.includes(query) ||
          patientName.includes(query) ||
          patientRm.includes(query) ||
          dpjp.includes(query)
        )
      }

      return true
    })

    return {
      ...p,
      beds: matchedBeds
    }
  }).filter(p => p.beds.length > 0)
})

// Helpers
const getOccupancyPercent = (stats) => {
  if (!stats || !stats.total || stats.total === 0) return 0
  return Math.round((stats.terisi / stats.total) * 100)
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
    case 'ISI': return 'Terisi'
    case 'RENCANA_PULANG': return 'Rencana Pulang'
    case 'DIBOOKING': return 'Dibooking'
    case 'DIBERSIHKAN': return 'Sterilisasi'
    default: return status || 'Tersedia'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'KOSONG': return 'fas fa-check-circle'
    case 'ISI': return 'fas fa-user-injured'
    case 'RENCANA_PULANG': return 'fas fa-sign-out-alt'
    case 'DIBOOKING': return 'fas fa-bookmark'
    case 'DIBERSIHKAN': return 'fas fa-broom'
    default: return 'fas fa-bed'
  }
}

const formatRupiah = (val) => {
  if (!val || val === 0) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

// Tooltip Logic
const showHoverTooltip = (event, bed) => {
  hoveredBed.value = bed
  const rect = event.currentTarget.getBoundingClientRect()
  tooltipX.value = rect.left + rect.width / 2
  tooltipY.value = rect.top - 10
}

const hideHoverTooltip = () => {
  hoveredBed.value = null
}

const tooltipStyle = computed(() => {
  return {
    left: `${tooltipX.value}px`,
    top: `${tooltipY.value}px`
  }
})

// Modal Logic
const onBedClick = (bed) => {
  hideHoverTooltip()
  selectedBed.value = bed
}

const resetFilters = () => {
  searchQuery.value = ''
  activeStatusFilter.value = 'ALL'
  selectedPavilion.value = 'ALL'
}

const copyText = (text, label) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  alert(`${label} (${text}) berhasil disalin!`)
}
</script>

<style scoped>
.bed-map-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: inherit;
}

/* Toolbar & Filter Bar */
.map-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.95rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.5rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.search-input:focus {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
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

.clear-search-btn:hover {
  color: #475569;
}

/* Legend Status Buttons */
.status-legend-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.legend-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.825rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.legend-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.legend-btn.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.legend-dot.all { background: #64748b; }
.legend-dot.available { background: #10b981; }
.legend-dot.occupied { background: #ef4444; }
.legend-dot.discharge { background: #f59e0b; }
.legend-dot.booking { background: #8b5cf6; }
.legend-dot.cleaning { background: #f97316; }

.legend-badge {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.legend-btn.active .legend-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* Pavilion Nav Tabs */
.pavilion-nav-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.pavilion-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pavilion-tab-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.pavilion-tab-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.tab-stat-pill {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #64748b;
}

.tab-stat-pill.has-available {
  background: #dcfce7;
  color: #15803d;
}

.pavilion-tab-btn.active .tab-stat-pill {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Floor Plan & Pavilion Block */
.floor-plan-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pavilion-block {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  padding: 1.25rem;
}

.pavilion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pavilion-icon-bubble {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.pavilion-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.pavilion-tag {
  font-size: 0.8rem;
  color: #64748b;
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
  border-radius: 6px;
  overflow: hidden;
}

.occupancy-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
  border-radius: 6px;
  transition: width 0.4s ease;
}

.occupancy-text {
  font-size: 0.85rem;
  color: #475569;
}

/* BEDS MATRIX (Modern Spatial Bed Cards) */
.beds-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
}

@media (min-width: 1280px) {
  .beds-matrix {
    grid-template-columns: repeat(5, 1fr);
  }
}

.bed-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  background: white;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bed-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.bed-card.is-dimmed {
  opacity: 0.3;
  filter: grayscale(80%);
}

/* Status Variations */
.bed-card.status-available {
  border-color: #86efac;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%);
}
.bed-card.status-available:hover {
  border-color: #22c55e;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.15);
}

.bed-card.status-occupied {
  border-color: #fca5a5;
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 50%);
}
.bed-card.status-occupied:hover {
  border-color: #ef4444;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.15);
}

.bed-card.status-discharge {
  border-color: #fde68a;
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 50%);
}
.bed-card.status-discharge:hover {
  border-color: #f59e0b;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.15);
}

.bed-card.status-booking {
  border-color: #d8b4fe;
  background: linear-gradient(180deg, #faf5ff 0%, #ffffff 50%);
}

.bed-card.status-cleaning {
  border-color: #fed7aa;
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 50%);
}

/* Bed Card Header */
.bed-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
}

.bed-identity {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bed-icon-svg {
  font-size: 0.85rem;
  color: #64748b;
}

.bed-label-text {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
}

.class-pill {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 6px;
}

.class-pill.class-vip { background: #fef08a; color: #854d0e; }
.class-pill.class-utama { background: #fbcfe8; color: #9d174d; }
.class-pill.class-1 { background: #dbeafe; color: #1e40af; }
.class-pill.class-2 { background: #e0e7ff; color: #3730a3; }
.class-pill.class-3 { background: #f1f5f9; color: #475569; }
.class-pill.class-general { background: #f1f5f9; color: #475569; }

/* Bed Card Body */
.bed-card-body {
  padding: 8px 0;
  flex: 1;
}

.patient-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.gender-mini-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 4px;
}

.gender-mini-badge.male {
  background: #dbeafe;
  color: #1d4ed8;
}

.gender-mini-badge.female {
  background: #fce7f3;
  color: #be185d;
}

.patient-name-display {
  font-weight: 700;
  font-size: 0.875rem;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.patient-doctor {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

.bed-meta-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.los-pill {
  font-size: 0.7rem;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-discharge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Empty State in Body */
.available-state,
.cleaning-state,
.booking-state {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding: 4px 0;
}

.state-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.green-icon { background: #dcfce7; color: #16a34a; }
.amber-icon { background: #fff7ed; color: #ea580c; }
.purple-icon { background: #f3e8ff; color: #9333ea; }

.state-texts {
  display: flex;
  flex-direction: column;
}

.available-title {
  font-weight: 700;
  font-size: 0.85rem;
  color: #166534;
}

.available-price {
  font-size: 0.75rem;
  color: #64748b;
}

.cleaning-title {
  font-weight: 700;
  font-size: 0.85rem;
  color: #9a3412;
}

.cleaning-desc,
.booking-desc {
  font-size: 0.725rem;
  color: #64748b;
}

.booking-title {
  font-weight: 700;
  font-size: 0.85rem;
  color: #6b21a8;
}

/* Bed Card Footer */
.bed-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
  border-top: 1px dashed rgba(0, 0, 0, 0.06);
}

.status-tag-pill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.status-tag-pill.status-available { background: #dcfce7; color: #15803d; }
.status-tag-pill.status-occupied { background: #fee2e2; color: #b91c1c; }
.status-tag-pill.status-discharge { background: #fef3c7; color: #b45309; }
.status-tag-pill.status-booking { background: #f3e8ff; color: #7e22ce; }
.status-tag-pill.status-cleaning { background: #ffedd5; color: #c2410c; }

.detail-hint {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Tooltip Quick Peek */
.bed-hover-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  width: 260px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -95%); }
  to { opacity: 1; transform: translate(-50%, -100%); }
}

.tooltip-header {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.tooltip-header.status-available { background: #dcfce7; color: #15803d; }
.tooltip-header.status-occupied { background: #fee2e2; color: #b91c1c; }
.tooltip-header.status-discharge { background: #fef3c7; color: #b45309; }
.tooltip-header.status-booking { background: #f3e8ff; color: #7e22ce; }
.tooltip-header.status-cleaning { background: #ffedd5; color: #c2410c; }

.tooltip-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tooltip-status-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.tooltip-body {
  padding: 10px 12px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.775rem;
  margin-bottom: 4px;
}

.tooltip-row .label {
  color: #64748b;
}

.tooltip-row .value {
  color: #1e293b;
  text-align: right;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-divider {
  border: none;
  border-top: 1px dashed #e2e8f0;
  margin: 6px 0;
}

.tooltip-footer {
  background: #f8fafc;
  padding: 6px 12px;
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

/* Modal Overlay & Card */
.bed-detail-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.bed-detail-modal-card {
  width: 100%;
  max-width: 540px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title-wrap .title-icon {
  font-size: 1.5rem;
  color: #2563eb;
}

.modal-title-wrap h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-title-wrap .subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
}

.modal-content-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.875rem;
}

.modal-status-banner.status-available { background: #dcfce7; color: #15803d; }
.modal-status-banner.status-occupied { background: #fee2e2; color: #b91c1c; }
.modal-status-banner.status-discharge { background: #fef3c7; color: #b45309; }
.modal-status-banner.status-booking { background: #f3e8ff; color: #7e22ce; }
.modal-status-banner.status-cleaning { background: #ffedd5; color: #c2410c; }

.patient-detail-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
}

.card-section-title {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.col-span-2 {
  grid-column: span 2;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  color: #0f172a;
}

.copyable-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  width: fit-content;
}

.copy-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
}

.copy-btn:hover {
  color: #2563eb;
}

.empty-bed-modal-state {
  text-align: center;
  padding: 1.5rem 1rem;
}

.empty-bed-icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 0.75rem;
}

.rate-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.modal-card-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

/* Empty State */
.empty-map-state {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.reset-filter-btn {
  margin-top: 1rem;
  padding: 8px 18px;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
</style>
