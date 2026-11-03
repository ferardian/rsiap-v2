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

    <!-- Class Filter Navigation Tabs / Pills -->
    <div class="class-filter-bar" v-if="availableClasses.length > 0">
      <span class="class-filter-title">
        <i class="fas fa-layer-group"></i> Filter Kelas:
      </span>
      <div class="class-pills-list">
        <button 
          class="class-pill-btn" 
          :class="{ active: selectedClass === 'ALL' }"
          @click="selectedClass = 'ALL'"
        >
          Semua Kelas
        </button>
        <button 
          v-for="cls in availableClasses" 
          :key="cls"
          class="class-pill-btn"
          :class="[getClassClass(cls), { active: selectedClass === cls }]"
          @click="selectedClass = selectedClass === cls ? 'ALL' : cls"
        >
          {{ cls }}
        </button>
      </div>
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

        <!-- Grouped by Kelas Sub-Sections -->
        <div class="pavilion-kelas-container">
          <div 
            v-for="group in pavilion.kelasGroups" 
            :key="group.kelas"
            class="kelas-group-card"
          >
            <!-- Kelas Group Header -->
            <div class="kelas-group-head">
              <div class="kelas-title-side">
                <span class="kelas-pill-label" :class="getClassClass(group.kelas)">
                  <i class="fas fa-door-open"></i> {{ group.kelas }}
                </span>
                <span class="kelas-count-sub">
                  {{ group.beds.length }} Tempat Tidur
                </span>
              </div>

              <div class="kelas-stats-side">
                <span class="mini-stat available" v-if="group.stats.tersedia > 0">
                  <span class="status-indicator green"></span>
                  <strong>{{ group.stats.tersedia }}</strong> Tersedia
                </span>
                <span class="mini-stat occupied" v-if="group.stats.terisi > 0">
                  <span class="status-indicator red"></span>
                  <strong>{{ group.stats.terisi }}</strong> Terisi
                </span>
                <span class="mini-stat discharge" v-if="group.stats.rencana_pulang > 0">
                  <span class="status-indicator orange"></span>
                  <strong>{{ group.stats.rencana_pulang }}</strong> Plg Hari Ini
                </span>
                <span class="mini-stat booking" v-if="group.stats.dibooking > 0">
                  <span class="status-indicator purple"></span>
                  <strong>{{ group.stats.dibooking }}</strong> Booking
                </span>
                <span class="mini-stat cleaning" v-if="group.stats.dibersihkan > 0">
                  <span class="status-indicator amber"></span>
                  <strong>{{ group.stats.dibersihkan }}</strong> Sterilisasi
                </span>
              </div>
            </div>

            <!-- Spasial Bed Matrix (Denah Bed Utuh per Kelas) -->
            <div class="beds-matrix">
              <div 
                v-for="bed in group.beds" 
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
                <!-- Bed Card Header (Compact) -->
                <div class="bed-card-head">
                  <div class="bed-identity">
                    <i class="fas fa-bed bed-icon-svg"></i>
                    <span class="bed-label-text">{{ bed.bed_label || bed.kd_kamar }}</span>
                  </div>
                  <span v-if="bed.effective_status === 'RENCANA_PULANG'" class="badge-discharge-sm" title="Rencana Pulang Hari Ini">
                    <i class="fas fa-sign-out-alt"></i> Plg
                  </span>
                  <span v-else-if="bed.patient?.jk" class="gender-mini-badge" :class="bed.patient?.jk === 'L' ? 'male' : 'female'">
                    {{ bed.patient?.jk === 'L' ? '👨 L' : '👩 P' }}
                  </span>
                </div>

                <!-- Room / Bangsal Name -->
                <div class="bed-card-room" :title="bed.nm_bangsal || bed.kd_bangsal">
                  <i class="fas fa-door-open room-icon"></i>
                  <span class="room-name-text">{{ bed.nm_bangsal || bed.kd_bangsal }}</span>
                </div>

                <!-- Bed Card Compact Footer (Status Badge Only) -->
                <div class="bed-card-compact-footer">
                  <span class="status-tag-pill" :class="getBedStatusClass(bed)">
                    <i :class="getStatusIcon(bed.effective_status)"></i>
                    {{ getStatusLabel(bed.effective_status) }}
                  </span>
                  <span class="detail-hint" title="Lihat detail">
                    <i class="fas fa-info-circle"></i>
                  </span>
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
const selectedClass = ref('ALL')

// Tooltip State
const hoveredBed = ref(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

// Modal State
const selectedBed = ref(null)

// Class Hierarchy Sorter
const classSortIndex = (kelasName) => {
  if (!kelasName) return 99
  const upper = kelasName.toUpperCase()
  if (upper.includes('VVIP')) return 1
  if (upper.includes('VIP')) return 2
  if (upper.includes('UTAMA')) return 3
  if (upper.includes('1') || upper.includes('SATU')) return 4
  if (upper.includes('2') || upper.includes('DUA')) return 5
  if (upper.includes('3') || upper.includes('TIGA')) return 6
  return 10
}

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

// Available Classes for the Filter Pills
const availableClasses = computed(() => {
  const classesSet = new Set()
  pavilions.value.forEach(p => {
    if (selectedPavilion.value !== 'ALL' && p.name !== selectedPavilion.value) {
      return
    }
    const allBeds = p.beds || (p.rooms ? p.rooms.flatMap(r => r.beds) : [])
    allBeds.forEach(b => {
      if (b.kelas) classesSet.add(b.kelas.trim())
    })
  })

  return Array.from(classesSet).sort((a, b) => classSortIndex(a) - classSortIndex(b))
})

const filteredPavilions = computed(() => {
  let list = pavilions.value

  // Filter by selected pavilion tab
  if (selectedPavilion.value !== 'ALL') {
    list = list.filter(p => p.name === selectedPavilion.value)
  }

  const query = searchQuery.value.trim().toLowerCase()
  const statusFilter = activeStatusFilter.value
  const classFilter = selectedClass.value

  return list.map(p => {
    // Direct beds array
    const allBeds = p.beds || (p.rooms ? p.rooms.flatMap(r => r.beds) : [])
    const matchedBeds = allBeds.filter(bed => {
      // Class filter
      if (classFilter !== 'ALL' && bed.kelas?.trim().toUpperCase() !== classFilter.toUpperCase()) {
        return false
      }

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

    // Group matched beds by Kelas
    const groupsMap = {}
    matchedBeds.forEach(bed => {
      const k = bed.kelas ? bed.kelas.trim() : 'Lainnya'
      if (!groupsMap[k]) {
        groupsMap[k] = {
          kelas: k,
          beds: [],
          stats: {
            total: 0,
            tersedia: 0,
            terisi: 0,
            rencana_pulang: 0,
            dibooking: 0,
            dibersihkan: 0
          }
        }
      }
      groupsMap[k].beds.push(bed)
      groupsMap[k].stats.total++
      if (bed.status === 'KOSONG') groupsMap[k].stats.tersedia++
      if (bed.status === 'ISI') groupsMap[k].stats.terisi++
      if (bed.effective_status === 'RENCANA_PULANG') groupsMap[k].stats.rencana_pulang++
      if (bed.status === 'DIBOOKING') groupsMap[k].stats.dibooking++
      if (bed.status === 'DIBERSIHKAN') groupsMap[k].stats.dibersihkan++
    })

    // Sort beds inside each group numerically (e.g. Bed 1.1, Bed 1.2, ..., Bed 1.10)
    Object.values(groupsMap).forEach(g => {
      g.beds.sort((a, b) => {
        const labelA = a.bed_label || a.kd_kamar || ''
        const labelB = b.bed_label || b.kd_kamar || ''
        return labelA.localeCompare(labelB, undefined, { numeric: true, sensitivity: 'base' })
      })
    })

    // Sort groups in hierarchy order (VIP, UTAMA, KELAS 1, KELAS 2, KELAS 3, etc.)
    const sortedKelasGroups = Object.values(groupsMap).sort((a, b) => {
      return classSortIndex(a.kelas) - classSortIndex(b.kelas)
    })

    return {
      ...p,
      beds: matchedBeds,
      kelasGroups: sortedKelasGroups
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
  selectedClass.value = 'ALL'
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

/* Class Filter Bar */
.class-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.class-filter-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.class-pills-list {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap;
}

.class-pill-btn {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.class-pill-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.class-pill-btn.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
}

.class-pill-btn.class-vip.active { background: #ca8a04; color: white; border-color: #ca8a04; }
.class-pill-btn.class-utama.active { background: #db2777; color: white; border-color: #db2777; }
.class-pill-btn.class-1.active { background: #2563eb; color: white; border-color: #2563eb; }
.class-pill-btn.class-2.active { background: #4f46e5; color: white; border-color: #4f46e5; }
.class-pill-btn.class-3.active { background: #64748b; color: white; border-color: #64748b; }

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

/* KELAS GROUPS CONTAINER */
.pavilion-kelas-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.kelas-group-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.15rem;
  transition: all 0.2s ease;
}

.kelas-group-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.kelas-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #cbd5e1;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.kelas-title-side {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.kelas-pill-label {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-transform: uppercase;
}

.kelas-pill-label.class-vip { background: #fef08a; color: #854d0e; border: 1px solid #fde047; }
.kelas-pill-label.class-utama { background: #fbcfe8; color: #9d174d; border: 1px solid #f9a8d4; }
.kelas-pill-label.class-1 { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.kelas-pill-label.class-2 { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
.kelas-pill-label.class-3 { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.kelas-pill-label.class-general { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

.kelas-count-sub {
  font-size: 0.825rem;
  color: #64748b;
  font-weight: 600;
}

.kelas-stats-side {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  flex-wrap: wrap;
}

.mini-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #475569;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-indicator.green { background: #22c55e; }
.status-indicator.red { background: #ef4444; }
.status-indicator.orange { background: #f97316; }
.status-indicator.purple { background: #8b5cf6; }
.status-indicator.amber { background: #f59e0b; }

/* BEDS MATRIX (Dense & Compact Grid) */
.beds-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 10px;
}

@media (min-width: 1024px) {
  .beds-matrix {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }
}

@media (min-width: 1440px) {
  .beds-matrix {
    grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
    gap: 12px;
  }
}

.bed-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 68px;
  background: white;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bed-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.bed-card.is-dimmed {
  opacity: 0.25;
  filter: grayscale(80%);
}

/* Status Variations */
.bed-card.status-available {
  border-color: #86efac;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 70%);
}
.bed-card.status-available:hover {
  border-color: #22c55e;
  box-shadow: 0 6px 14px rgba(34, 197, 94, 0.15);
}

.bed-card.status-occupied {
  border-color: #fca5a5;
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 70%);
}
.bed-card.status-occupied:hover {
  border-color: #ef4444;
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.15);
}

.bed-card.status-discharge {
  border-color: #fde68a;
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 70%);
}
.bed-card.status-discharge:hover {
  border-color: #f59e0b;
  box-shadow: 0 6px 14px rgba(245, 158, 11, 0.15);
}

.bed-card.status-booking {
  border-color: #d8b4fe;
  background: linear-gradient(180deg, #faf5ff 0%, #ffffff 70%);
}

.bed-card.status-cleaning {
  border-color: #fed7aa;
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 70%);
}

/* Bed Card Header (Compact) */
.bed-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bed-identity {
  display: flex;
  align-items: center;
  gap: 5px;
}

.bed-icon-svg {
  font-size: 0.78rem;
  color: #64748b;
}

.bed-label-text {
  font-weight: 700;
  font-size: 0.88rem;
  color: #0f172a;
  white-space: nowrap;
}

.gender-mini-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
}

.gender-mini-badge.male {
  background: #dbeafe;
  color: #1d4ed8;
}

.gender-mini-badge.female {
  background: #fce7f3;
  color: #be185d;
}

.badge-discharge-sm {
  font-size: 0.65rem;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  padding: 1px 5px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Room / Bangsal Name */
.bed-card-room {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #64748b;
  margin: 2px 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-icon {
  font-size: 0.65rem;
  color: #94a3b8;
  flex-shrink: 0;
}

.room-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* Bed Card Compact Footer */
.bed-card-compact-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.status-tag-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.status-tag-pill.status-available { background: #dcfce7; color: #15803d; }
.status-tag-pill.status-occupied { background: #fee2e2; color: #b91c1c; }
.status-tag-pill.status-discharge { background: #fef3c7; color: #b45309; }
.status-tag-pill.status-booking { background: #f3e8ff; color: #7e22ce; }
.status-tag-pill.status-cleaning { background: #ffedd5; color: #c2410c; }

.detail-hint {
  font-size: 0.72rem;
  color: #94a3b8;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.bed-card:hover .detail-hint {
  opacity: 1;
  color: #3b82f6;
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
