<template>
  <!-- ========================================================================= -->
  <!-- MODE 1: DISPLAY LAYAR INFORMASI (DIGITAL SIGNAGE / TV RUANG TUNGGU)       -->
  <!-- ========================================================================= -->
  <div v-if="isDisplayMode" class="signage-screen" :class="{ 'is-fullscreen': isFullScreen }">
    <!-- Header Display TV -->
    <header class="signage-header">
      <!-- Logo & Hospital Identity -->
      <div class="signage-brand">
        <img src="@/assets/logo-rsia.png" alt="RSIA Logo" class="brand-logo" />
        <div class="brand-meta">
          <h1 class="brand-title">RSIA AISYIYAH PEKAJANGAN</h1>
          <p class="brand-subtitle">INFORMASI KETERSEDIAAN TEMPAT TIDUR RAWAT INAP</p>
        </div>
      </div>

      <!-- Center Controls & Navigation -->
      <div class="signage-controls">
        <div class="view-mode-pill">
          <button 
            class="mode-btn" 
            :class="{ active: displayViewMode === 'carousel' }"
            @click="displayViewMode = 'carousel'"
          >
            <i class="fas fa-clone"></i> Mode Slide
          </button>
          <button 
            class="mode-btn" 
            :class="{ active: displayViewMode === 'matrix' }"
            @click="displayViewMode = 'matrix'"
          >
            <i class="fas fa-table"></i> Rekap Semua Ruang
          </button>
        </div>

        <!-- Slide Navigation Controls (Only on carousel mode) -->
        <div v-if="displayViewMode === 'carousel' && displaySlides.length > 0" class="slide-nav-group">
          <button class="nav-btn" @click="prevSlide" title="Slide Sebelumnya">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="slide-indicator">
            Hal {{ currentSlideIndex + 1 }} / {{ displaySlides.length }}
          </span>
          <button class="nav-btn" @click="nextSlide" title="Slide Berikutnya">
            <i class="fas fa-chevron-right"></i>
          </button>
          <button 
            class="nav-btn pause-toggle" 
            :class="{ paused: isCarouselPaused }"
            @click="togglePauseCarousel" 
            :title="isCarouselPaused ? 'Lanjutkan Auto-Slide' : 'Jeda Auto-Slide'"
          >
            <i :class="isCarouselPaused ? 'fas fa-play' : 'fas fa-pause'"></i>
          </button>
        </div>
      </div>

      <!-- Right Meta: Clock & Sync Status -->
      <div class="signage-meta">
        <div class="clock-box">
          <div class="clock-time">{{ currentTime }}</div>
          <div class="clock-date">{{ currentDate }}</div>
        </div>
        <div class="live-pill" :class="{ updating: isBackgroundUpdating }">
          <span class="live-indicator-dot"></span>
          <span class="live-label">{{ isBackgroundUpdating ? 'SYNC...' : 'LIVE SIMRS' }}</span>
        </div>
        <button class="fullscreen-toggle-btn" @click="toggleFullScreen" title="Layar Penuh (F11)">
          <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
      </div>
    </header>

    <!-- Slide Timer Progress Bar -->
    <div v-if="displayViewMode === 'carousel'" class="slide-progress-track">
      <div class="slide-progress-fill" :style="{ width: `${slideProgress}%` }"></div>
    </div>

    <!-- Top KPI Summary Bar (Solid Hospital Colors) -->
    <section class="signage-kpi-bar">
      <div class="kpi-box total">
        <div class="kpi-header">
          <span class="kpi-icon"><i class="fas fa-hospital-alt"></i></span>
          <span class="kpi-label">TOTAL KAPASITAS</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-number">{{ totalBeds }}</span>
          <span class="kpi-unit">Tempat Tidur</span>
        </div>
      </div>

      <div class="kpi-box available">
        <div class="kpi-header">
          <span class="kpi-icon"><i class="fas fa-check-circle"></i></span>
          <span class="kpi-label">TEMPAT TIDUR TERSEDIA</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-number highlight-green">{{ availableBeds }}</span>
          <span class="kpi-unit">Siap Pakai</span>
        </div>
      </div>

      <div class="kpi-box occupied">
        <div class="kpi-header">
          <span class="kpi-icon"><i class="fas fa-user-injured"></i></span>
          <span class="kpi-label">TEMPAT TIDUR TERISI</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-number highlight-red">{{ occupiedBeds }}</span>
          <span class="kpi-unit">Pasien Dirawat</span>
        </div>
      </div>

      <div class="kpi-box cleaning">
        <div class="kpi-header">
          <span class="kpi-icon"><i class="fas fa-broom"></i></span>
          <span class="kpi-label">DIBERSIHKAN / BOOKING</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-number highlight-amber">{{ cleaningBeds + bookingBeds }}</span>
          <span class="kpi-unit">Sterilisasi/Reservasi</span>
        </div>
      </div>
    </section>

    <!-- Main Content Display -->
    <main class="signage-main-area">
      <!-- Loading State -->
      <div v-if="loading" class="signage-loading">
        <div class="signage-spinner"></div>
        <p>Memuat data tempat tidur dari SIMRS...</p>
      </div>

      <!-- VIEW A: CAROUSEL SLIDE MODE -->
      <div v-else-if="displayViewMode === 'carousel'" class="carousel-container">
        <transition name="signage-slide" mode="out-in">
          <div :key="currentSlideIndex" class="slide-content-grid">
            <div 
              v-for="(classGroups, wardName) in currentSlideData" 
              :key="wardName" 
              class="signage-ward-card"
            >
              <!-- Ward Header -->
              <div class="ward-card-header">
                <div class="ward-title-group">
                  <span class="ward-badge-icon"><i class="fas fa-door-open"></i></span>
                  <h2 class="ward-name-text">{{ wardName }}</h2>
                </div>
                <div class="ward-pill-stats">
                  <span class="stat-pill total">
                    Kapasitas: <strong>{{ getCategoryTotal(classGroups) }}</strong>
                  </span>
                  <span class="stat-pill empty">
                    Kosong: <strong>{{ getCategoryEmpty(classGroups) }}</strong>
                  </span>
                  <span class="stat-pill filled">
                    Terisi: <strong>{{ getCategoryFilled(classGroups) }}</strong>
                  </span>
                </div>
              </div>

              <!-- Ward Classes Grid -->
              <div class="ward-class-cards-container">
                <div 
                  v-for="group in classGroups" 
                  :key="group.kelas" 
                  class="signage-class-card"
                >
                  <div class="class-card-topbar">
                    <span class="class-name-badge">{{ group.kelas }}</span>
                    <span class="class-rooms-badge">
                      {{ getGroupRoomCodes(group) }}
                    </span>
                  </div>

                  <div class="class-card-kpi-row">
                    <!-- Angka Kosong / Tersedia (Fokus Utama) -->
                    <div class="card-kpi-cell available-cell">
                      <span class="cell-tag">TERSEDIA</span>
                      <span class="cell-number text-emerald">{{ getClassEmpty(group) }}</span>
                    </div>
                    <!-- Angka Terisi -->
                    <div class="card-kpi-cell occupied-cell">
                      <span class="cell-tag">TERISI</span>
                      <span class="cell-number text-red">{{ getClassFilled(group) }}</span>
                    </div>
                    <!-- Total Kapasitas -->
                    <div class="card-kpi-cell total-cell">
                      <span class="cell-tag">KAPASITAS</span>
                      <span class="cell-number text-dark">{{ getClassTotal(group) }}</span>
                    </div>
                  </div>

                  <!-- Mini Occupancy Track -->
                  <div class="class-occupancy-track">
                    <div 
                      class="occupancy-fill-bar" 
                      :style="{ width: `${getClassOccupancyRate(group)}%` }"
                      :class="getOccupancyLevelClass(getClassOccupancyRate(group))"
                    ></div>
                  </div>
                  <div class="occupancy-caption">
                    <span>Okupansi: {{ getClassOccupancyRate(group) }}%</span>
                    <span v-if="getClassEmpty(group) === 0" class="badge-full">PENUH</span>
                    <span v-else class="badge-avail">TERSEDIA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- VIEW B: MATRIX ALL WARDS TABLE MODE -->
      <div v-else class="matrix-container">
        <div class="matrix-two-columns">
          <div 
            v-for="(columnList, colIdx) in matrixColumns" 
            :key="colIdx" 
            class="matrix-column-card"
          >
            <table class="matrix-table">
              <thead>
                <tr>
                  <th class="col-ward">RUANGAN / BANGSAL</th>
                  <th class="col-class">KELAS</th>
                  <th class="col-num">TOTAL</th>
                  <th class="col-num">TERISI</th>
                  <th class="col-num col-highlight">TERSEDIA</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="item in columnList" 
                  :key="item.kd_bangsal + item.kelas" 
                  class="matrix-row"
                  :class="{ 'row-available': item.tersedia > 0 }"
                >
                  <td class="col-ward-name">
                    <span class="status-marker-dot" :class="item.tersedia > 0 ? 'bg-emerald' : 'bg-red'"></span>
                    {{ item.nm_bangsal }}
                  </td>
                  <td class="col-class-name">
                    <span class="matrix-class-tag">{{ item.kelas }}</span>
                  </td>
                  <td class="col-num font-mono">{{ item.kapasitas }}</td>
                  <td class="col-num font-mono text-red">{{ item.terisi }}</td>
                  <td class="col-num col-highlight font-mono">
                    <span class="avail-badge" :class="item.tersedia > 0 ? 'badge-green' : 'badge-dim'">
                      {{ item.tersedia }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Marquee / Running Text -->
    <footer class="signage-footer">
      <div class="marquee-tag">
        <i class="fas fa-info-circle"></i>
        <span>INFORMASI</span>
      </div>
      <div class="marquee-viewport">
        <div class="marquee-track">
          Selamat Datang di RSIA Aisyiyah Pekajangan • Layanan Informasi Ketersediaan Tempat Tidur Rawat Inap Real-time Terintegrasi SIMRS • Jam Kunjung Pasien: Siang 11.00 - 13.00 WIB, Sore 17.00 - 19.00 WIB • Mohon menjaga ketertiban, ketenangan, dan kebersihan lingkungan rumah sakit • Untuk konsultasi dan pendaftaran kamar rawat inap, silakan hubungi petugas Admisi.
        </div>
      </div>
    </footer>
  </div>


  <!-- ========================================================================= -->
  <!-- MODE 2: DASHBOARD STAF OPERASIONAL (/dashboard/bed)                       -->
  <!-- ========================================================================= -->
  <div v-else class="bed-availability-page">
    <div v-if="isBackgroundUpdating" class="auto-refresh-indicator">
      <div class="refresh-spinner"></div>
      <span>Memperbarui data SIMRS...</span>
    </div>

    <!-- Header Dashboard -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">🛏️ Ketersediaan Tempat Tidur</h1>
          <p class="page-subtitle">Pantau dan kelola ketersediaan tempat tidur rawat inap secara real-time</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="openDisplayMode">
            <i class="fas fa-desktop"></i> Mode Layar TV (Display)
          </button>
          <button class="btn btn-secondary" @click="refreshData">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="card-icon">🏥</div>
          <div class="card-content">
            <h3>{{ totalBeds }}</h3>
            <p>Total Tempat Tidur</p>
          </div>
        </div>
        <div class="summary-card available">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <h3>{{ availableBeds }}</h3>
            <p>Tersedia (Kosong)</p>
          </div>
        </div>
        <div class="summary-card occupied">
          <div class="card-icon">🔴</div>
          <div class="card-content">
            <h3>{{ occupiedBeds }}</h3>
            <p>Terisi (Pasien)</p>
          </div>
        </div>
        <div class="summary-card cleaning">
          <div class="card-icon">🧹</div>
          <div class="card-content">
            <h3>{{ cleaningBeds + bookingBeds }}</h3>
            <p>Dibersihkan / Booking</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label class="filter-label">
          <i class="fas fa-hospital"></i> Kategori Bangsal
        </label>
        <SearchableSelect 
          v-model="selectedCategory" 
          :options="categoryOptions" 
          placeholder="Semua Kategori"
          labelKey="name"
          valueKey="id"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">
          <i class="fas fa-layer-group"></i> Pilih Kelas
        </label>
        <SearchableSelect 
          v-model="selectedClass" 
          :options="classOptions" 
          placeholder="Semua Kelas"
          labelKey="name"
          valueKey="id"
          @change="loadBeds"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">
          <i class="fas fa-filter"></i> Filter Status
        </label>
        <SearchableSelect 
          v-model="selectedStatus" 
          :options="statusOptions" 
          placeholder="Semua Status"
          labelKey="name"
          valueKey="id"
          @change="loadBeds"
        />
      </div>
    </div>

    <!-- Legend -->
    <div class="legend-section">
      <div class="legend-item">
        <span class="legend-box available"></span>
        <span>Tersedia</span>
      </div>
      <div class="legend-item">
        <span class="legend-box occupied"></span>
        <span>Terisi</span>
      </div>
      <div class="legend-item">
        <span class="legend-box cleaning"></span>
        <span>Dibersihkan</span>
      </div>
      <div class="legend-item">
        <span class="legend-box booked"></span>
        <span>Dibooking</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data tempat tidur...</p>
    </div>

    <!-- Bed Grid Display -->
    <div v-else-if="filteredBedsList.length > 0" class="bed-grid-section">
      <div v-for="(bedGroup, wardName) in groupedBeds" :key="wardName" class="ward-section">
        <div class="ward-title">
          <div class="ward-title-left">
            <i class="fas fa-procedures"></i>
            <span>{{ wardName }}</span>
          </div>
          <div class="ward-title-badges">
            <span class="category-total-badge">{{ getCategoryTotal(bedGroup) }} Bed</span>
            <span class="category-total-badge badge-green">Kosong: {{ getCategoryEmpty(bedGroup) }}</span>
            <span class="category-total-badge badge-red">Isi: {{ getCategoryFilled(bedGroup) }}</span>
          </div>
        </div>
        
        <div v-for="group in bedGroup" :key="group.kelas" class="class-section">
          <div class="class-title">
            <span class="class-name-tag">{{ group.kelas }}</span>
            <span class="class-total-badge">{{ getClassTotal(group) }} Bed</span>
            <span class="class-total-badge status-available">Kosong: {{ getClassEmpty(group) }}</span>
            <span class="class-total-badge status-occupied">Isi: {{ getClassFilled(group) }}</span>
          </div>
          
          <div class="availability-cards">
            <div
              v-for="bed in group.beds"
              :key="bed.kd_bangsal + bed.kd_kamar"
              class="availability-card"
              @click="showBedDetail(bed)"
            >
              <div class="card-header-info">
                <div class="bangsal-name">{{ bed.nm_bangsal }}</div>
                <div class="class-badge">{{ bed.kelas }}</div>
              </div>
              
              <!-- Metrics Grid per Card -->
              <div class="staff-card-stats">
                <div class="stat-metric empty">
                  <span class="stat-title">Tersedia</span>
                  <span class="stat-val">{{ bed.tersedia }}</span>
                </div>
                <div class="stat-metric filled">
                  <span class="stat-title">Terisi</span>
                  <span class="stat-val">{{ bed.terisi }}</span>
                </div>
                <div class="stat-metric total">
                  <span class="stat-title">Kapasitas</span>
                  <span class="stat-val">{{ bed.kapasitas }}</span>
                </div>
              </div>

              <!-- Progress bar terisi -->
              <div class="occupancy-track-staff">
                <div 
                  class="occupancy-bar-fill" 
                  :style="{ width: `${bed.persentase_terisi}%` }"
                  :class="getOccupancyLevelClass(bed.persentase_terisi)"
                ></div>
              </div>
              <div class="staff-card-footer">
                <span>Terisi: {{ bed.persentase_terisi }}%</span>
                <span v-if="bed.tersedia > 0" class="badge-status-green">TERSEDIA</span>
                <span v-else class="badge-status-red">PENUH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-bed fa-3x"></i>
      <p>Tidak ada data tempat tidur ditemukan</p>
    </div>

    <!-- Bed Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detail Ruangan & Tempat Tidur</h3>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body" v-if="selectedBed">
          <div class="detail-row">
            <span class="detail-label">Bangsal / Ruang:</span>
            <span class="detail-value font-semibold">{{ selectedBed.nm_bangsal }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Kode Kamar / Bangsal:</span>
            <span class="detail-value font-mono">{{ selectedBed.kd_kamar || selectedBed.kd_bangsal }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Kelas Pelayanan:</span>
            <span class="detail-value">
              <span class="class-badge-modal">{{ selectedBed.kelas }}</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Kapasitas:</span>
            <span class="detail-value font-semibold">{{ selectedBed.kapasitas }} Tempat Tidur</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tempat Tidur Tersedia:</span>
            <span class="detail-value">
              <span class="status-badge available">{{ selectedBed.tersedia }} Kosong</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tempat Tidur Terisi:</span>
            <span class="detail-value">
              <span class="status-badge occupied">{{ selectedBed.terisi }} Pasien</span>
            </span>
          </div>
          <div class="detail-row" v-if="selectedBed.dibersihkan > 0">
            <span class="detail-label">Sedang Dibersihkan:</span>
            <span class="detail-value">
              <span class="status-badge cleaning">{{ selectedBed.dibersihkan }} Bed</span>
            </span>
          </div>
          <div class="detail-row" v-if="selectedBed.dibooking > 0">
            <span class="detail-label">Dalam Reservasi / Booking:</span>
            <span class="detail-value">
              <span class="status-badge booked">{{ selectedBed.dibooking }} Bed</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Persentase Keterisian (BOR):</span>
            <span class="detail-value font-semibold">{{ selectedBed.persentase_terisi }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import bedAvailabilityService from '../../services/bedAvailabilityService'
import { showToast } from '../../utils/notification'
import SearchableSelect from '../../components/ui/SearchableSelect.vue'

// Routing & Display Mode Detection
const route = useRoute()
const router = useRouter()
const isDisplayMode = computed(() => route.meta.layout === 'empty' || route.path.endsWith('/display'))

// Core Data State
const loading = ref(false)
const isBackgroundUpdating = ref(false)
const beds = ref([])
const wards = ref([])
const classes = ref([])

// Filters (for staff dashboard)
const selectedCategory = ref('')
const selectedClass = ref('')
const selectedStatus = ref('')

// Modal state
const showDetailModal = ref(false)
const selectedBed = ref(null)

// Signage Display States
const displayViewMode = ref('carousel') // 'carousel' | 'matrix'
const currentSlideIndex = ref(0)
const isCarouselPaused = ref(false)
const slideDuration = 12 // seconds per slide
const slideProgress = ref(0)
const isFullScreen = ref(false)

// Clock State
const currentTime = ref('')
const currentDate = ref('')

// Timers
let refreshTimer = null
let clockTimer = null
let progressTimer = null

// Options for SearchableSelect
const categoryOptions = [
  { id: '', name: 'Semua Kategori' },
  { id: 'ANAK', name: 'Anak' },
  { id: 'KANDUNGAN', name: 'Kandungan' },
  { id: 'KAMAR BERSALIN', name: 'Kamar Bersalin' },
  { id: 'ICU', name: 'ICU' },
  { id: 'ISOLASI', name: 'Isolasi' }
]

const statusOptions = [
  { id: '', name: 'Semua Status' },
  { id: 'KOSONG', name: 'Tersedia' },
  { id: 'ISI', name: 'Terisi' },
  { id: 'DIBERSIHKAN', name: 'Dibersihkan' },
  { id: 'DIBOOKING', name: 'Dibooking' }
]

const classOptions = computed(() => {
  const options = [{ id: '', name: 'Semua Kelas' }]
  if (classes.value && classes.value.length) {
    classes.value.forEach(c => options.push({ id: c, name: c }))
  }
  return options
})

// Helper for Categorization
const getBedCategory = (bed) => {
  const searchString = ((bed.kd_kamar || '') + ' ' + (bed.nm_bangsal || '')).toUpperCase()
  const defaultCategory = (bed.nm_bangsal || bed.kd_bangsal).replace(/\s*\d+(\.\d+)?\s*$/, '').trim()
  
  if (searchString.includes('ISOLASI') || searchString.includes('ISO')) {
    return 'ISOLASI'
  } else if (searchString.includes('ICU') || searchString.includes('ICCU') || searchString.includes('PICU') || searchString.includes('NICU')) {
    return 'ICU'
  } else if (searchString.includes('VK') || searchString.includes('BERSALIN')) {
    return 'KAMAR BERSALIN'
  } else if (searchString.includes('ANAK') || searchString.includes('BAYI') || searchString.includes('PERINA')) {
    return 'ANAK'
  } else if (searchString.includes('KANDUNGAN') || searchString.includes('KEBIDANAN')) {
    return 'KANDUNGAN'
  }
  
  return defaultCategory || 'LAINNYA'
}

// Filtered beds list
const filteredBedsList = computed(() => {
  let result = beds.value
  
  if (selectedCategory.value) {
    result = result.filter(bed => {
      const category = getBedCategory(bed)
      return category === selectedCategory.value
    })
  }
  
  return result
})

// Grouped beds by Category -> Classes
const groupedBeds = computed(() => {
  const grouped = {}
  
  filteredBedsList.value.forEach(bed => {
    const category = getBedCategory(bed)
    const kelas = bed.kelas || 'Umum'
    
    if (!grouped[category]) {
      grouped[category] = {}
    }
    
    if (!grouped[category][kelas]) {
      grouped[category][kelas] = []
    }
    
    grouped[category][kelas].push(bed)
  })
  
  const sortWeights = {
    'VVIP': 5,
    'VIP': 10,
    'Utama': 15,
    'Kelas 1': 20,
    'Kelas 2': 30,
    'Kelas 3': 40
  }
  
  const getWeight = (className) => {
    if (sortWeights[className]) return sortWeights[className]
    if (className.includes('VIP')) return 10
    if (className.includes('Kelas 1')) return 20
    if (className.includes('Kelas 2')) return 30
    if (className.includes('Kelas 3')) return 40
    return 100 
  }
  
  const finalGrouped = {}
  Object.keys(grouped).forEach(cat => {
    const classesObj = grouped[cat]
    const classesArray = Object.keys(classesObj).map(cls => ({
      kelas: cls,
      beds: classesObj[cls],
      weight: getWeight(cls)
    }))
    
    classesArray.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight
      return a.kelas.localeCompare(b.kelas)
    })
    
    finalGrouped[cat] = classesArray
  })
  
  return finalGrouped
})

// Slides for Carousel Mode (Dinamis dan proporsional untuk TV)
const displaySlides = computed(() => {
  const wardNames = Object.keys(groupedBeds.value)
  if (!wardNames.length) return []
  
  const slides = []
  let currentChunk = {}
  let currentCardCount = 0
  let currentWardCount = 0

  wardNames.forEach((name) => {
    const wardGroups = groupedBeds.value[name] || []
    const classCount = wardGroups.length || 1

    // Jika melebihi 6 kartu atau sudah 3 bangsal, buat slide baru
    if (currentWardCount > 0 && (currentCardCount + classCount > 6 || currentWardCount >= 3)) {
      slides.push(currentChunk)
      currentChunk = {}
      currentCardCount = 0
      currentWardCount = 0
    }

    currentChunk[name] = wardGroups
    currentCardCount += classCount
    currentWardCount += 1
  })

  if (Object.keys(currentChunk).length > 0) {
    // Jika slide terakhir hanya berisi 1 bangsal kecil dan slide sebelumnya masih longgar, gabungkan
    if (slides.length > 0 && currentCardCount <= 2 && Object.keys(currentChunk).length === 1) {
      const lastSlide = slides[slides.length - 1]
      const lastSlideCardCount = Object.values(lastSlide).reduce((sum, g) => sum + g.length, 0)
      if (lastSlideCardCount + currentCardCount <= 6) {
        Object.assign(lastSlide, currentChunk)
      } else {
        slides.push(currentChunk)
      }
    } else {
      slides.push(currentChunk)
    }
  }

  return slides
})

// Current Slide Data
const currentSlideData = computed(() => {
  if (!displaySlides.value.length) return {}
  const safeIndex = currentSlideIndex.value % displaySlides.value.length
  return displaySlides.value[safeIndex] || {}
})

// Matrix View Columns (2 balanced columns)
const matrixColumns = computed(() => {
  const list = filteredBedsList.value
  const mid = Math.ceil(list.length / 2)
  return [list.slice(0, mid), list.slice(mid)]
})

// KPI Aggregations
const totalBeds = computed(() => {
  return filteredBedsList.value.reduce((sum, bed) => sum + (bed.kapasitas || 0), 0)
})

const availableBeds = computed(() => {
  return filteredBedsList.value.reduce((sum, bed) => sum + (bed.tersedia || 0), 0)
})

const occupiedBeds = computed(() => {
  return filteredBedsList.value.reduce((sum, bed) => sum + (bed.terisi || 0), 0)
})

const cleaningBeds = computed(() => {
  return filteredBedsList.value.reduce((sum, bed) => sum + (bed.dibersihkan || 0), 0)
})

const bookingBeds = computed(() => {
  return filteredBedsList.value.reduce((sum, bed) => sum + (bed.dibooking || 0), 0)
})

// Statistics Helper Methods
const getCategoryTotal = (groups) => {
  if (!groups || !Array.isArray(groups)) return 0
  return groups.reduce((total, group) => {
    return total + (group.beds ? group.beds.reduce((sum, bed) => sum + (bed.kapasitas || 0), 0) : 0)
  }, 0)
}

const getCategoryEmpty = (groups) => {
  if (!groups || !Array.isArray(groups)) return 0
  return groups.reduce((total, group) => {
    return total + (group.beds ? group.beds.reduce((sum, bed) => sum + (bed.tersedia || 0), 0) : 0)
  }, 0)
}

const getCategoryFilled = (groups) => {
  if (!groups || !Array.isArray(groups)) return 0
  return groups.reduce((total, group) => {
    return total + (group.beds ? group.beds.reduce((sum, bed) => sum + (bed.terisi || 0), 0) : 0)
  }, 0)
}

const getClassTotal = (group) => {
  if (!group || !group.beds) return 0
  return group.beds.reduce((sum, bed) => sum + (bed.kapasitas || 0), 0)
}

const getClassEmpty = (group) => {
  if (!group || !group.beds) return 0
  return group.beds.reduce((sum, bed) => sum + (bed.tersedia || 0), 0)
}

const getClassFilled = (group) => {
  if (!group || !group.beds) return 0
  return group.beds.reduce((sum, bed) => sum + (bed.terisi || 0), 0)
}

const getClassOccupancyRate = (group) => {
  const total = getClassTotal(group)
  if (total <= 0) return 0
  const filled = getClassFilled(group)
  return Math.min(100, Math.round((filled / total) * 100))
}

const getOccupancyLevelClass = (rate) => {
  if (rate >= 90) return 'occ-critical'
  if (rate >= 75) return 'occ-warning'
  if (rate >= 50) return 'occ-moderate'
  return 'occ-low'
}

const getGroupRoomCodes = (group) => {
  if (!group || !group.beds) return ''
  const codes = group.beds.map(b => b.kd_kamar || b.kd_bangsal).filter(Boolean)
  if (codes.length <= 3) return codes.join(', ')
  return `${codes.slice(0, 3).join(', ')} (+${codes.length - 3})`
}

// Carousel Controls
const nextSlide = () => {
  if (!displaySlides.value.length) return
  currentSlideIndex.value = (currentSlideIndex.value + 1) % displaySlides.value.length
  slideProgress.value = 0
}

const prevSlide = () => {
  if (!displaySlides.value.length) return
  currentSlideIndex.value = (currentSlideIndex.value - 1 + displaySlides.value.length) % displaySlides.value.length
  slideProgress.value = 0
}

const togglePauseCarousel = () => {
  isCarouselPaused.value = !isCarouselPaused.value
}

const startCarouselLoop = () => {
  stopCarouselLoop()
  slideProgress.value = 0
  
  const step = 100 / (slideDuration * 10)
  progressTimer = setInterval(() => {
    if (!isCarouselPaused.value && displayViewMode.value === 'carousel' && displaySlides.value.length > 1) {
      slideProgress.value += step
      if (slideProgress.value >= 100) {
        slideProgress.value = 0
        nextSlide()
      }
    }
  }, 100)
}

const stopCarouselLoop = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// Realtime Clock Updater
const updateClock = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds} WIB`
  
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  currentDate.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
}

// Fullscreen Toggle
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullScreen.value = true
    }).catch(err => {
      console.warn('Fullscreen tidak diizinkan:', err)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullScreen.value = false
      })
    }
  }
}

// Data Fetching
const loadBeds = async (preserveScroll = false) => {
  try {
    if (!preserveScroll) {
      loading.value = true
    } else {
      isBackgroundUpdating.value = true
    }
    
    const params = {}
    if (selectedClass.value) params.kelas = selectedClass.value
    if (selectedStatus.value) params.status = selectedStatus.value
    
    const response = await bedAvailabilityService.getAllBeds(params)
    if (response.success) {
      beds.value = response.data
    } else if (!preserveScroll) {
      showToast('Gagal memuat data tempat tidur', 'error')
    }
  } catch (error) {
    console.error('Error loading beds:', error)
    if (!preserveScroll) {
      showToast('Terjadi kendala koneksi ke SIMRS', 'error')
    }
  } finally {
    if (!preserveScroll) {
      loading.value = false
    } else {
      setTimeout(() => {
        isBackgroundUpdating.value = false
      }, 1200)
    }
  }
}

const loadWards = async () => {
  try {
    const response = await bedAvailabilityService.getWards()
    if (response.success) wards.value = response.data
  } catch (error) {
    console.error('Error loading wards:', error)
  }
}

const loadClasses = async () => {
  try {
    const response = await bedAvailabilityService.getClasses()
    if (response.success) classes.value = response.data
  } catch (error) {
    console.error('Error loading classes:', error)
  }
}

const refreshData = async () => {
  await Promise.all([loadBeds(), loadWards(), loadClasses()])
  showToast('Data tempat tidur berhasil diperbarui', 'success')
}

const openDisplayMode = () => {
  const displayUrl = router.resolve({ name: 'BedAvailabilityDisplay' }).href
  window.open(displayUrl, '_blank')
}

const showBedDetail = (bed) => {
  selectedBed.value = bed
  showDetailModal.value = true
}

// Lifecycle Hooks
onMounted(async () => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  
  await Promise.all([loadBeds(), loadWards(), loadClasses()])
  
  // Background sync every 30s
  refreshTimer = setInterval(() => {
    loadBeds(true)
  }, 30000)
  
  if (isDisplayMode.value) {
    startCarouselLoop()
  }

  // Listen for native fullscreen change
  document.addEventListener('fullscreenchange', () => {
    isFullScreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  stopCarouselLoop()
})
</script>

<style scoped>
/* =========================================================================
   STYLE MODE 1: DIGITAL SIGNAGE / DISPLAY TV (CLEAN WHITE HOSPITAL THEME)
   ========================================================================= */
.signage-screen {
  background-color: #f1f5f9;
  color: #0f172a;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  user-select: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Signage */
.signage-header {
  height: 80px;
  background-color: #ffffff;
  border-bottom: 2px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  gap: 1.5rem;
  flex-shrink: 0;
}

.signage-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-logo {
  height: 52px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.05em;
  margin: 0;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.08em;
  margin: 0;
  margin-top: 2px;
}

/* Controls Pill */
.signage-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-mode-pill {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.mode-btn {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
}

.slide-nav-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.nav-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.nav-btn.pause-toggle.paused {
  background: #f59e0b;
  border-color: #d97706;
  color: #ffffff;
}

.slide-indicator {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  padding: 0 0.5rem;
  min-width: 85px;
  text-align: center;
}

/* Right Meta: Clock & Sync */
.signage-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.clock-box {
  text-align: right;
}

.clock-time {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e40af;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.clock-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 3px;
}

.live-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ecfdf5;
  border: 1px solid #10b981;
  padding: 5px 10px;
  border-radius: 20px;
}

.live-indicator-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.live-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #065f46;
  letter-spacing: 0.05em;
}

.live-pill.updating {
  background: #eff6ff;
  border-color: #3b82f6;
}

.live-pill.updating .live-indicator-dot {
  background-color: #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
}

.live-pill.updating .live-label {
  color: #1d4ed8;
}

.fullscreen-toggle-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.fullscreen-toggle-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Slide Progress Track */
.slide-progress-track {
  height: 3px;
  width: 100%;
  background: #e2e8f0;
  flex-shrink: 0;
}

.slide-progress-fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.1s linear;
}

/* KPI Bar (4 Box Grid) */
.signage-kpi-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
}

.kpi-box {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.9rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.kpi-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 5px;
}

.kpi-box.total::before { background: #3b82f6; }
.kpi-box.available::before { background: #10b981; }
.kpi-box.occupied::before { background: #ef4444; }
.kpi-box.cleaning::before { background: #f59e0b; }

.kpi-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.kpi-icon {
  font-size: 0.9rem;
  color: #64748b;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #64748b;
}

.kpi-body {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.kpi-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.kpi-number.highlight-green {
  color: #059669;
}

.kpi-number.highlight-red {
  color: #dc2626;
}

.kpi-number.highlight-amber {
  color: #d97706;
}

.kpi-unit {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* Main Display Area */
.signage-main-area {
  flex: 1;
  overflow: hidden;
  padding: 0 1.5rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
}

/* Loading State */
.signage-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #64748b;
}

.signage-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Carousel Layout */
.carousel-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.slide-content-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  justify-content: flex-start;
  align-items: stretch;
}

.signage-ward-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.ward-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.6rem;
}

.ward-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ward-badge-icon {
  width: 32px;
  height: 32px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 0.9rem;
}

.ward-name-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: 0.03em;
}

.ward-pill-stats {
  display: flex;
  gap: 0.6rem;
}

.stat-pill {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.stat-pill.total {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.stat-pill.empty {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.stat-pill.filled {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* Ward Class Cards Container */
.ward-class-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 360px));
  gap: 1rem;
  justify-content: flex-start;
}

.signage-class-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.class-card-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-name-badge {
  background: #1e40af;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

.class-rooms-badge {
  font-size: 0.7rem;
  color: #64748b;
  font-family: monospace;
  font-weight: 600;
}

.class-card-kpi-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  border-radius: 8px;
  text-align: center;
}

.card-kpi-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.04em;
}

.cell-number {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.text-emerald { color: #059669; }
.text-red { color: #dc2626; }
.text-dark { color: #0f172a !important; }
.text-white { color: #0f172a !important; }

.class-occupancy-track {
  height: 6px;
  width: 100%;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.occupancy-fill-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.occupancy-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
}

.badge-full {
  color: #dc2626;
  font-weight: 700;
}

.badge-avail {
  color: #059669;
  font-weight: 700;
}

/* Matrix Table View */
.matrix-container {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.matrix-two-columns {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  overflow: hidden;
}

.matrix-column-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow-y: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.825rem;
}

.matrix-table thead th {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.65rem 0.9rem;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.matrix-table th.col-num,
.matrix-table td.col-num {
  text-align: center;
}

.matrix-table th.col-highlight,
.matrix-table td.col-highlight {
  text-align: center;
  background-color: rgba(16, 185, 129, 0.06);
}

.matrix-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}

.matrix-row:hover {
  background-color: #f8fafc;
}

.matrix-table td {
  padding: 0.5rem 0.9rem;
  color: #334155;
}

.col-ward-name {
  font-weight: 600;
  color: #0f172a !important;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-marker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.bg-emerald { background-color: #10b981; }
.bg-red { background-color: #ef4444; }

.matrix-class-tag {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.avail-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 0.85rem;
}

.avail-badge.badge-green {
  background-color: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.avail-badge.badge-dim {
  background-color: #f1f5f9;
  color: #94a3b8;
}

/* Footer Running Text */
.signage-footer {
  height: 44px;
  background-color: #ffffff;
  border-top: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.03);
}

.marquee-tag {
  background-color: #1e40af;
  color: #ffffff;
  height: 100%;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  z-index: 5;
}

.marquee-viewport {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.marquee-track {
  display: inline-block;
  white-space: nowrap;
  padding-left: 100%;
  animation: marquee-scroll 32s linear infinite;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* Transitions */
.signage-slide-enter-active,
.signage-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.signage-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.signage-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


/* =========================================================================
   STYLE MODE 2: DASHBOARD STAF (CLEAN WHITE HOSPITAL THEME)
   ========================================================================= */
.bed-availability-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow-y: auto;
}

.auto-refresh-indicator {
  position: fixed;
  top: 1.5rem;
  right: 50%;
  transform: translateX(50%);
  background: rgba(30, 41, 59, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  font-size: 0.875rem;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.refresh-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.35rem;
}

.page-subtitle {
  color: #64748b;
  margin-bottom: 0;
  font-size: 0.925rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover {
  background: #475569;
}

/* Summary Grid */
.summary-section {
  margin-bottom: 0.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2.2rem;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.summary-card.total .card-icon { background: #dbeafe; }
.summary-card.available .card-icon { background: #d1fae5; }
.summary-card.occupied .card-icon { background: #fee2e2; }
.summary-card.cleaning .card-icon { background: #fef3c7; }

.card-content h3 {
  font-size: 1.85rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.1;
}

.card-content p {
  color: #64748b;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 2px;
}

/* Filters */
.filter-section {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-label {
  font-weight: 600;
  color: #475569;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Legend */
.legend-section {
  background: white;
  padding: 0.9rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-box.available { background: #10b981; }
.legend-box.occupied { background: #ef4444; }
.legend-box.cleaning { background: #f59e0b; }
.legend-box.booked { background: #3b82f6; }

/* Bed Grid */
.bed-grid-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ward-section {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding-bottom: 1.5rem;
}

.ward-title {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.ward-title-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  font-weight: 700;
}

.ward-title-badges {
  display: flex;
  gap: 0.5rem;
}

.category-total-badge {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.category-total-badge.badge-green {
  background: rgba(16, 185, 129, 0.3);
  border-color: #10b981;
}

.category-total-badge.badge-red {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
}

.class-section {
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
}

.class-section:last-child {
  margin-bottom: 0;
}

.class-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.class-name-tag {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.class-total-badge {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
}

.class-total-badge.status-available {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}

.class-total-badge.status-occupied {
  background: #fff1f2;
  color: #e11d48;
  border-color: #fecdd3;
}

.availability-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.availability-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.availability-card:hover {
  transform: translateY(-3px);
  border-color: #3b82f6;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.card-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.9rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.bangsal-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.class-badge {
  background: #2563eb;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.staff-card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.6rem;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 0.75rem;
}

.stat-metric {
  display: flex;
  flex-direction: column;
}

.stat-metric .stat-title {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
}

.stat-metric .stat-val {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.2;
}

.stat-metric.empty .stat-val { color: #059669; }
.stat-metric.filled .stat-val { color: #dc2626; }
.stat-metric.total .stat-val { color: #1e293b; }

.occupancy-track-staff {
  height: 6px;
  width: 100%;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.occupancy-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.occ-low { background: #10b981; }
.occ-moderate { background: #3b82f6; }
.occ-warning { background: #f59e0b; }
.occ-critical { background: #ef4444; }

.staff-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.badge-status-green {
  color: #059669;
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-status-red {
  color: #dc2626;
  background: #fee2e2;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Loading & Empty */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  font-size: 0.925rem;
  color: #1e293b;
}

.class-badge-modal {
  background: #2563eb;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-badge.available { background: #d1fae5; color: #065f46; }
.status-badge.occupied { background: #fee2e2; color: #991b1b; }
.status-badge.cleaning { background: #fef3c7; color: #92400e; }
.status-badge.booked { background: #dbeafe; color: #1e40af; }
</style>
